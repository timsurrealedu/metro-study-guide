"""Metro Engine v1 · maintenance tool (you rarely need it).

    python3 tools/cssprune.py engine/metro.css pruned.css engine/*.js examples/*/content.html examples/*/visuals.js

Conservative CSS cleanup: drop selectors whose classes/ids appear nowhere in the
sources, and drop declarations always overridden by a later rule with the identical
selector in the identical @-context. Prints what it removed."""
import re,sys,json
def tokenize(css):
    # returns list of nodes: ('rule',prelude,body) or ('at',prelude,children|None,raw_body)
    i=0;n=len(css);out=[]
    def skip_ws_comments(i,keep=None):
        while i<n:
            if css[i].isspace():i+=1
            elif css.startswith('/*',i):
                j=css.find('*/',i+2);
                if keep is not None:keep.append(('comment',css[i:j+2],None))
                i=n if j<0 else j+2
            else:break
        return i
    def read_block(i):
        # css[i]=='{' -> return (content,end_index_after_brace)
        depth=0;j=i;q=None
        while j<n:
            c=css[j]
            if q:
                if c=='\\':j+=2;continue
                if c==q:q=None
            elif css.startswith('/*',j):
                k=css.find('*/',j+2);j=k+2;continue
            elif c in '"\'':q=c
            elif c=='{':depth+=1
            elif c=='}':
                depth-=1
                if depth==0:return css[i+1:j],j+1
            j+=1
        raise Exception('unbalanced')
    def parse(s):
        nonlocal css,n
        saved=(css,n);css=s;n=len(s);i=0;res=[]
        while True:
            i=skip_ws_comments(i,res)
            if i>=n:break
            # prelude up to { or ;
            j=i;q=None
            while j<n:
                c=css[j]
                if q:
                    if c==q:q=None
                elif c in '"\'':q=c
                elif c in '{;':break
                elif css.startswith('/*',j):
                    k=css.find('*/',j+2);j=k+2;continue
                j+=1
            pre=re.sub(r'/\*.*?\*/','',css[i:j],flags=re.S).strip()
            if j>=n:break
            if css[j]==';':res.append(('stmt',pre,None));i=j+1;continue
            body,end=read_block(j)
            if pre.startswith('@media') or pre.startswith('@supports') or pre.startswith('@layer'):
                res.append(('at',pre,parse(body)))
            elif pre.startswith('@'):
                res.append(('raw',pre,body))
            else:res.append(('rule',pre,body))
            i=end
        css,n=saved
        return res
    return parse(css)
def split_sel(pre):
    out=[];depth=0;cur=''
    for c in pre:
        if c in '([':depth+=1
        elif c in ')]':depth-=1
        if c==',' and depth==0:out.append(cur.strip());cur=''
        else:cur+=c
    if cur.strip():out.append(cur.strip())
    return out
def decls(body):
    out=[];depth=0;cur='';q=None
    body=re.sub(r'/\*.*?\*/','',body,flags=re.S)
    for c in body:
        if q:
            cur+=c
            if c==q:q=None
            continue
        if c in '"\'':q=c
        if c=='(':depth+=1
        elif c==')':depth-=1
        if c==';' and depth==0:
            if cur.strip():out.append(cur.strip())
            cur=''
        else:cur+=c
    if cur.strip():out.append(cur.strip())
    res=[]
    for d in out:
        if ':' not in d:continue
        p,v=d.split(':',1);p=p.strip();res.append([p if p.startswith('--') else p.lower(),v.strip()])
    return res
def main(cssfile,srcfiles,outfile):
    css=open(cssfile).read()
    src=" ".join(open(f).read() for f in srcfiles)
    words=set(re.findall(r'[A-Za-z_][\w-]*',src))
    tree=tokenize(css)
    removed_sel=[]
    def alive(sel):
        names=re.findall(r'[.#](-?[A-Za-z_][\w-]*)',re.sub(r'\[[^\]]*\]','',re.sub(r'\([^()]*\)','()',sel)) )
        # also classes inside :not(.x)/:has(.x)/:is(...) must exist for the positive cases; check them leniently
        inner=re.findall(r':(?:is|where|has)\(([^()]*)\)',sel)
        for nm in names:
            if nm not in words:return False
        for grp in inner:
            parts=split_sel(grp)
            if parts and all(any(x not in words for x in re.findall(r'[.#](-?[A-Za-z_][\w-]*)',p)) for p in parts):return False
        return True
    def prune(nodes):
        out=[]
        for t in nodes:
            if t[0]=='rule':
                sels=split_sel(t[1]);keep=[s for s in sels if alive(s)]
                for s in sels:
                    if s not in keep:removed_sel.append(s)
                if keep:out.append(['rule',', '.join(keep) if len(keep)!=len(sels) else t[1],decls(t[2])])
            elif t[0]=='at':
                ch=prune(t[2])
                if ch:out.append(['at',t[1],ch])
            else:out.append(list(t))
        return out
    tree=prune(tree)
    # dedupe overridden declarations: flatten rules with context key
    flat=[]
    def walk(nodes,ctx):
        for t in nodes:
            if t[0]=='rule':flat.append((ctx,t))
            elif t[0]=='at':walk(t[2],ctx+(t[1],))
    walk(tree,())
    NEW=('dvh','svh','lvh','color-mix','env(','oklch','lab(','@','dynamic-range')
    removed_decl=0
    norm=lambda s:re.sub(r'\s+',' ',s.replace(' ,',',').replace(', ',',')).strip()
    for idx,(ctx,r) in enumerate(flat):
        key=(ctx,norm(r[1]))
        later=[t for (c,t) in flat[idx+1:] if (c,norm(t[1]))==key]
        if not later:continue
        newd=[]
        props=[p for p,_ in r[2]]
        for p,v in r[2]:
            imp='!important' in v
            over=False
            if props.count(p)>1:newd.append([p,v]);continue   # fallback pair inside one rule
            for t in later:
                for p2,v2 in t[2]:
                    if p2==p and (('!important' in v2) or not imp) and not any(x in v2 for x in NEW):over=True
            if over:removed_decl+=1
            else:newd.append([p,v])
        r[2]=newd
    def emit(nodes,ind=''):
        s=''
        for t in nodes:
            if t[0]=='rule':
                if not t[2]:continue
                s+=f"{ind}{t[1]}{{{';'.join(p+':'+v for p,v in t[2])}}}\n"
            elif t[0]=='at':
                inner=emit(t[2],ind+'  ')
                if inner.strip():s+=f"{ind}{t[1]}{{\n{inner}{ind}}}\n"
            elif t[0]=='comment':s+=f"\n{ind}{t[1]}\n"
            elif t[0]=='raw':s+=f"{ind}{t[1]}{{{t[2].strip()}}}\n"
            elif t[0]=='stmt':s+=f"{ind}{t[1]};\n"
        return s
    out=emit(tree)
    open(outfile,'w').write(out)
    print(json.dumps({'in_bytes':len(css),'out_bytes':len(out),'removed_selectors':len(removed_sel),'removed_decls':removed_decl}))
    open(outfile+'.removed.txt','w').write("\n".join(removed_sel))
if __name__=='__main__':main(sys.argv[1],sys.argv[3:],sys.argv[2])
