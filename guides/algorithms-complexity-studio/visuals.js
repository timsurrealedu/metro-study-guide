/* Algorithms & Complexity Studio · visuals.js
   Showcases Metro Engine v1.6: mobile zoom trees, Kit.dp, Kit.network, Kit.trim, Kit.venn, Kit.dag, Kit.flow, Kit.derive. */

/* 1.1 Recursion Tree O(2^n) vs Memoization DAG O(n) */
Kit.tree("tr-memo", {
  alt: "Recursion tree for fib(4) showing repeated calls collapsing into a linear Memoization DAG.",
  compact: true,
  root: {
    id: "f4", t: "fib(4)", sub: "needs f(3)+f(2)", kind: "root", role: "c",
    use: "Top-level call splits into fib(3) on the left and fib(2) on the right.",
    children: [
      {
        id: "f3", t: "fib(3)", sub: "f(2)+f(1)", edge: "n−1", kind: "decision", role: "c",
        use: "Evaluates fib(2) first, then fib(1).",
        children: [
          {
            id: "f2a", t: "fib(2) = 1", sub: "1 + 0", tag: "first time", edge: "n−1", kind: "decision", role: "v",
            use: "First time fib(2) is solved! A memoized version saves 1 right here.",
            children: [
              { id: "f1a", t: "fib(1)=1", sub: "base", kind: "leaf", role: "r" },
              { id: "f0a", t: "fib(0)=0", sub: "base", kind: "leaf", role: "r" }
            ]
          },
          { id: "f1b", t: "fib(1)=1", sub: "base repeat", edge: "n−2", kind: "leaf", role: "v", use: "Calls base case fib(1) directly." }
        ]
      },
      {
        id: "f2b", t: "fib(2) = 1", sub: "duplicate work!", tag: "REPEAT!", edge: "n−2", kind: "pruned", role: "k",
        use: "Without a cache, fib(4) rebuilds the entire fib(2) subtree from scratch!",
        children: [
          { id: "f1c", t: "fib(1)=1", sub: "wasted", kind: "pruned", role: "k", use: "Repeated fib(1) call." },
          { id: "f0b", t: "fib(0)=0", sub: "wasted", kind: "pruned", role: "k", use: "Repeated fib(0) call." }
        ]
      }
    ]
  },
  steps: [
    { t: "1. Root call fib(4) splits into fib(3) and fib(2)", d: "To find fib(4), recursion asks for fib(3) on the left and fib(2) on the right.", on: ["f4"], reveal: ["f4", "f3", "f2b"], hud: [{ label: "Calls", val: "1", role: "c" }, { label: "Repeats", val: "0", role: "r" }] },
    { t: "2. Left branch solves fib(2) = 1 for the first time", d: "Inside fib(3), we solve fib(2) = fib(1) + fib(0) = 1. Next up: fib(3) finishes as 1 + 1 = 2.", on: ["f2a", "f1a", "f0a"], visit: ["f4", "f3", "f1b"], reveal: ["f4", "f3", "f2b", "f2a", "f1a", "f0a", "f1b"], hud: [{ label: "Calls", val: "6", role: "v" }, { label: "fib(2)", val: "solved 1st time", role: "v" }] },
    { t: "3. Right branch wastes time repeating fib(2)!", d: "Without sticky-note caching, fib(4) solves the exact same fib(2) tree all over again (O(2ⁿ) growth).", on: ["f2b", "f1c", "f0b"], visit: ["f4", "f3", "f2a", "f1a", "f0a", "f1b"], reveal: "all", hud: [{ label: "Total Calls", val: "9 (O(2ⁿ))", role: "k" }, { label: "Wasted", val: "3 red nodes", role: "k" }], overview: true }
  ],
  memo: {
    treeLabel: "Recursion Tree O(2ⁿ)",
    dagLabel: "Memoization DAG O(n)",
    alt: "Collapsed Memoization DAG for fib(4) with shared cached nodes.",
    nodes: [
      { id: "f4", t: "fib(4) = 3", sub: "2 + 1", role: "r", use: "Reads cached fib(3)=2 and cached fib(2)=1 in O(1)." },
      { id: "f3", t: "fib(3) = 2", sub: "1 + 1", role: "c", use: "Reads cached fib(2)=1 and cached fib(1)=1 in O(1)." },
      { id: "f2", t: "fib(2) = 1", shared: true, tag: "cached ×2", role: "f", use: "Solved once and saved! Both fib(4) and fib(3) point to this single box." },
      { id: "f1", t: "fib(1) = 1", shared: true, tag: "base ×2", role: "v", use: "Base case 1, reused in O(1)." },
      { id: "f0", t: "fib(0) = 0", role: "v", use: "Base case 0." }
    ],
    edges: [
      { id: "e1", from: "f4", to: "f3" },
      { id: "e2", from: "f4", to: "f2", label: "cache hit!", role: "f" },
      { id: "e3", from: "f3", to: "f2", label: "saves 1", role: "f" },
      { id: "e4", from: "f3", to: "f1", label: "cache hit!", role: "v" },
      { id: "e5", from: "f2", to: "f1" },
      { id: "e6", from: "f2", to: "f0" }
    ],
    steps: [
      { t: "1. Only 5 unique boxes exist for n = 4", d: "Memoization shrinks 9 tree calls down to just n+1 = 5 states: fib(0)..fib(4).", on: ["f0", "f1"], reveal: ["f0", "f1", "f2", "f3", "f4"], hud: [{ label: "Unique States", val: "5 (n+1)", role: "v" }, { label: "Cache Hits", val: "0 yet", role: "c" }] },
      { t: "2. Solve & save fib(2) = 1 on a sticky note", d: "The glowing double-outlined box computes fib(2) = 1 + 0 = 1 once for everyone.", on: ["f2"], visit: ["f0", "f1"], edges: ["e5", "e6"], reveal: "all", hud: [{ label: "Unique States", val: "5 (n+1)", role: "v" }, { label: "Saved", val: "fib(2) = 1", role: "f" }] },
      { t: "3. fib(3) and fib(4) look up cached answers!", d: "Every duplicate branch turns into an instant O(1) cache-hit pointer—cutting O(2ⁿ) down to O(n)!", on: ["f3", "f4"], visit: ["f0", "f1", "f2"], edges: ["e1", "e2", "e3", "e4"], reveal: "all", hud: [{ label: "Total Work", val: "O(n) linear!", role: "r" }, { label: "Cache Hits", val: "2 instant lookups", role: "f" }], overview: true }
    ]
  }
});

/* 1.2 1D DP: Kadane & LIS */
Kit.dp("dp-1d", {
  tabs: [
    {
      label: "Kadane's dp[i]",
      mode: "1d",
      cols: ["0", "1", "2", "3", "4", "5"],
      arrLabel: "A[i]",
      arr: ["-2", "4", "-1", "3", "-5", "2"],
      dpLabel: "dp[i]",
      dp: ["-2", "4", "3", "6", "1", "3"],
      steps: [
        { t: "Base case i = 0", d: "Start at dp[0] = A[0] = −2.", on: [0], reveal: 0, eq: "dp[0] = [[−2|c]]", hud: [{ label: "best", val: "−2", role: "r" }] },
        { t: "i = 1: start fresh at 4", d: "max(4, −2 + 4) = 4, so drop the negative prefix.", on: [1], from: [0], reveal: 1, eq: "dp[1] = max([[4|r]], [[−2|v]] + 4) = [[4|c]]", hud: [{ label: "best", val: "4", role: "r" }] },
        { t: "i = 2: extend 4 + (−1) = 3", d: "Keeping the streak beats starting fresh at −1.", on: [2], from: [1], reveal: 2, eq: "dp[2] = max(−1, [[4|v]] − 1) = [[3|c]]", hud: [{ label: "best", val: "4", role: "r" }] },
        { t: "i = 3: new peak dp[3] = 6", d: "Extending gives 3 + 3 = 6, the optimal subarray [4, −1, 3].", on: [3], from: [2], trace: [1, 2, 3], reveal: 3, eq: "dp[3] = max(3, [[3|v]] + 3) = [[6|r]]", hud: [{ label: "best", val: "6 (1..3)", role: "r" }] },
        { t: "Finish i = 4, 5", d: "dp[4] = 1, dp[5] = 3; global maximum stays 6 over indices 1..3.", on: [5], from: [4], trace: [1, 2, 3], reveal: 5, eq: "ans = max(dp) = [[6|r]]", hud: [{ label: "best", val: "6 (1..3)", role: "r" }] }
      ]
    },
    {
      label: "LIS + parent[i]",
      mode: "1d",
      cols: ["0", "1", "2", "3", "4"],
      arrLabel: "A[i]",
      arr: ["3", "1", "4", "2", "5"],
      dpLabel: "dp[i]",
      dp: ["1", "1", "2", "2", "3"],
      parent: ["−", "−", "0", "1", "2"],
      steps: [
        { t: "i = 0, 1: singletons", d: "Every element starts with length 1 and no parent (−).", on: [1], reveal: 1, eq: "dp[0]=1, dp[1]=1" },
        { t: "i = 2 (A[2]=4): extend A[0]=3", d: "Since 3 < 4, dp[2] = dp[0] + 1 = 2 and parent[2] = 0.", on: [2], from: [0], reveal: 2, eq: "dp[2] = [[dp[0]|v]] + 1 = [[2|c]], parent[2] = [[0|f]]" },
        { t: "i = 3 (A[3]=2): extend A[1]=1", d: "1 < 2 gives dp[3] = 2 and parent[3] = 1.", on: [3], from: [1], reveal: 3, eq: "dp[3] = [[dp[1]|v]] + 1 = [[2|c]], parent[3] = [[1|f]]" },
        { t: "i = 4 (A[4]=5): best chain length 3!", d: "A[2] = 4 < 5 lifts dp[4] = 3 with parent[4] = 2 → reconstruct 3 → 4 → 5.", on: [4], from: [2], trace: [0, 2, 4], reveal: 4, eq: "Traceback: 4 → parent[4]=[[2|r]] → parent[2]=[[0|r]] ⇒ [3, 4, 5]", hud: [{ label: "LIS", val: "3 → 4 → 5", role: "r" }] }
      ]
    }
  ]
});

/* 1.2 Kadane derive */
Kit.derive("der-kadane", {
  given: "Array A = [−2, 4, −1, 3], define [[dp[i]|f|dp]] = max subarray sum ending at index [[i|v]].",
  legend: [
    { role: "v", label: "Current / Previous" },
    { role: "f", label: "Recurrence State" },
    { role: "r", label: "Optimal Result" }
  ],
  lines: [
    {
      t: "State & Recurrence",
      why: "Either extend the best subarray ending at i−1, or restart at A[i].",
      m: "[[dp[i]|f|dp]] = \\max([[A[i]|v]],\\, [[dp[i-1]|v]] + [[A[i]|v]])",
      frames: [
        { m: "[[dp[i]|f|dp]] = \\max([[A[i]|v]],\\, ?)" },
        { m: "[[dp[i]|f|dp]] = \\max([[A[i]|v]],\\, [[dp[i-1]|v]] + [[A[i]|v]])" }
      ],
      how: ["If dp[i−1] < 0, adding it shrinks A[i], so restarting at A[i] wins."],
      tip: { title: "Kadane's Rule", body: "Never include a negative prefix.", rule: "dp[i] = \\max(A[i],\\, dp[i-1]+A[i])" }
    },
    {
      t: "Drop negative prefix at i = 1",
      op: "plug i=1, A[1]=4, dp[0]=−2",
      why: "Compare restarting (4) against extending (−2 + 4).",
      m: "[[dp[1]|f]] = \\max([[4|r|b]],\\, [[−2|k]] + 4) = [[4|r|b]]",
      frames: [
        { m: "[[dp[1]|f]] = \\max([[4|r|b]],\\, [[−2|k]] + 4)" },
        { m: "[[dp[1]|f]] = \\max([[4|r|b]],\\, 2) = [[4|r|b]]" }
      ],
      how: ["4 > 2, so subarray resets cleanly at index 1."],
      final: true
    }
  ]
});

/* 1.2 LCS 2D grid */
Kit.dp("dp-lcs", {
  mode: "2d",
  corner: "X \\ Y",
  rows: ["ε", "A", "B", "C"],
  cols: ["ε", "A", "C"],
  grid: [
    [{ v: 0 }, { v: 0 }, { v: 0 }],
    [{ v: 0 }, { v: 1, dir: "\\" }, { v: 1, dir: "<" }],
    [{ v: 0 }, { v: 1, dir: "^" }, { v: 1, dir: "^" }],
    [{ v: 0 }, { v: 1, dir: "^" }, { v: 2, dir: "\\" }]
  ],
  steps: [
    { t: "Row 0: 0 letters from X matches nothing (all 0)", d: "Compare empty prefix ε with Y: longest shared match is always 0.", upto: [0, 2], eq: "c[0, j] = 0,\\; c[i, 0] = 0" },
    { t: "Match 'A' = 'A' → follow diagonal arrow ↖ (+1)", d: "Letters match! Blue arrow reads top-left corner c[0,0]=0 and adds 1 → store 1 with ↖.", on: [1, 1], from: [[0, 0]], upto: [1, 1], eq: "X[1]=Y[1]='A' \\implies c[1,1] = [[c[0,0]|v]] + 1 = [[1|r]]" },
    { t: "Mismatch 'A' vs 'C' → copy taller neighbor (← wins)", d: "Letters differ! Arrows read top (0) and left (1); pick max(0, 1) = 1 and point ←.", on: [1, 2], from: [[0, 2], [1, 1]], upto: [1, 2], eq: "c[1,2] = \\max([[0|v]], [[1|v]]) = [[1|c]]" },
    { t: "Row B: propagate score 1 downward (↑)", d: "'B' matches neither 'A' nor 'C', so both arrows tie at 1 → inherit ↑ from row above.", on: [2, 2], from: [[1, 2], [2, 1]], upto: [2, 2], eq: "c[2,2] = \\max([[1|v]], [[1|v]]) = [[1|c]]" },
    { t: "Match 'C' = 'C' (↖) → follow green trail back!", d: "Diagonal arrow reads c[2,1]=1 and adds 1 = 2. Follow ↖ cells back: 'A' then 'C' = \"AC\"!", on: [3, 2], from: [[2, 1]], path: [[3, 2], [2, 1], [1, 1]], upto: [3, 2], eq: "LCS = [['AC'|r]],\\; |LCS| = [[2|r]]", hud: [{ label: "LCS", val: "AC (len 2)", role: "r" }] }
  ]
});

/* 1.3 0/1 Knapsack 2D + 1D Rolling Toggle */
Kit.dp("dp-knap", {
  tabs: [
    {
      label: "2D dp[i, c]",
      mode: "2d",
      corner: "item \\ cap",
      rows: ["0 (∅)", "1 (w=2,v=3)", "2 (w=3,v=4)"],
      cols: ["c=0", "1", "2", "3", "4"],
      grid: [
        [0, 0, 0, 0, 0],
        [0, 0, 3, 3, 3],
        [0, 0, 3, 4, 4]
      ],
      steps: [
        { t: "Row 0: 0 items in bag → value is 0", d: "With zero items allowed, every capacity c = 0..4 gives profit 0.", upto: [0, 4], eq: "dp[0, c] = 0" },
        { t: "Item 1 (weight 2, value 3) at c = 2", d: "Blue arrows compare: Skip item 1 (above = 0) vs Take item 1 (3 + top-left 0) → Pick 3!", on: [1, 2], from: [[0, 2], [0, 0]], upto: [1, 4], eq: "dp[1,2] = \\max([[0|v]],\\, 3 + [[0|v]]) = [[3|c]]" },
        { t: "Item 2 (weight 3, value 4) at c = 3", d: "Skip (above = 3) vs Take (4 + dp[1,0]=0) → 4 wins! So capacity 3 holds Item 2 alone.", on: [2, 3], from: [[1, 3], [1, 0]], upto: [2, 3], eq: "dp[2,3] = \\max([[3|v]],\\, 4 + [[0|v]]) = [[4|c]]" },
        { t: "Final cell dp[2, 4] = 4", d: "With cap 4, adding Item 2 (w=3) leaves only 1 kg (dp[1,1]=0), so 4 + 0 = 4 beats skipping (3).", on: [2, 4], from: [[1, 4], [1, 1]], path: [[2, 4], [2, 3]], upto: [2, 4], eq: "dp[2,4] = \\max([[3|v]],\\, 4 + [[0|v]]) = [[4|r]]", hud: [{ label: "Best", val: "4 (item 2)", role: "r" }] }
      ]
    },
    {
      label: "1D Rolling Array",
      mode: "1d",
      cols: ["c=0", "1", "2", "3", "4"],
      arrLabel: "item 1",
      arr: ["w=2", "v=3", "—", "—", "—"],
      dpLabel: "dp[c]",
      rolling: {
        rtlLabel: "Right → Left (Safe 0/1)",
        ltrLabel: "Left → Right (Item Reuse Bug!)",
        rtlNote: "c = 4 down to 2 reads old dp[c−2] = 0 before overwriting.",
        ltrNote: "c = 2 up to 4 overwrites dp[2]=3 first, then dp[4] reuses item 1!",
        rtlSteps: [
          { t: "Before item 1: all 0", d: "1D rolling array starts at [0, 0, 0, 0, 0].", dp: [0, 0, 0, 0, 0], on: [0], eq: "c = W \\dots w_1 = 4, 3, 2" },
          { t: "c = 4: reads old dp[2] = 0", d: "Because we sweep right-to-left, dp[2] is still 0 from the previous row!", dp: [0, 0, 0, 0, 3], on: [4], from: [2], eq: "dp[4] = max(0, 3 + [[dp[2]=0|v]]) = [[3|r]]" },
          { t: "c = 3: reads old dp[1] = 0", d: "dp[3] becomes 3 + dp[1] = 3.", dp: [0, 0, 0, 3, 3], on: [3], from: [1], eq: "dp[3] = max(0, 3 + [[dp[1]=0|v]]) = [[3|r]]" },
          { t: "c = 2: finishes at [0, 0, 3, 3, 3]", d: "Exact match with row 1 of the 2D table—item 1 used at most once!", dp: [0, 0, 3, 3, 3], on: [2], from: [0], trace: [2, 3, 4], eq: "dp[2] = [[3|r]] \\implies \\text{Safe 0/1!}" }
        ],
        ltrSteps: [
          { t: "Before item 1: all 0", d: "Watch what breaks if we loop left-to-right (c = 2, 3, 4).", dp: [0, 0, 0, 0, 0], on: [0], eq: "c = 2, 3, 4 \\; (\\text{WRONG for 0/1!})" },
          { t: "c = 2: sets dp[2] = 3", d: "First update writes 3 into dp[2].", dp: [0, 0, 3, 0, 0], on: [2], from: [0], eq: "dp[2] = 3 + 0 = [[3|c]]" },
          { t: "c = 4: BUG! Reads updated dp[2] = 3!", d: "dp[4] = 3 + dp[2] = 6! Item 1 was packed TWICE inside capacity 4!", dp: [0, 0, 3, 3, 6], on: [4], from: [2], bad: [2, 4], eq: "dp[4] = 3 + [[dp[2]=3|k]] = [[6|k]] \\; (\\text{reused!})" }
        ]
      }
    }
  ]
});

Kit.derive("der-knap", {
  given: "Item [[i|v]] has weight [[w_i|c]] and value [[v_i|r]], capacity [[c|v]].",
  legend: [
    { role: "v", label: "Index / Cap" },
    { role: "c", label: "Weight / Choice" },
    { role: "r", label: "Value / Result" }
  ],
  lines: [
    {
      t: "Two choices when wᵢ ≤ c",
      why: "Compare leaving item i out vs. putting item i into the bag.",
      m: "[[dp[i,c]|r]] = \\max([[dp[i-1,c]|c]],\\, [[v_i|r]] + [[dp[i-1, c - w_i]|v]])",
      frames: [
        { m: "[[dp[i,c]|r]] = \\max(\\text{skip},\\, \\text{take})" },
        { m: "[[dp[i,c]|r]] = \\max([[dp[i-1,c]|c]],\\, [[v_i|r]] + [[dp[i-1, c - w_i]|v]])" }
      ],
      how: ["Left branch keeps previous row at same capacity c.", "Right branch adds vᵢ to previous row at remaining capacity c − wᵢ."],
      tip: { title: "1D Compression", body: "Always loop c from W down to wᵢ so dp[c − wᵢ] stays from row i−1." },
      final: true
    }
  ]
});

/* 1.4 Diagonal Interval DP (MCM, OBST, Stick, Balloons) */
Kit.dp("dp-int", {
  tabs: [
    {
      label: "Matrix Chain (m, s)",
      mode: "interval",
      n: 4,
      corner: "i \\ j",
      grid: [
        [{ v: 0 }, { v: 150, sub: "s=1" }, { v: 540, sub: "s=1" }, { v: 510, sub: "s=1" }],
        [null, { v: 0 }, { v: 180, sub: "s=2" }, { v: 360, sub: "s=3" }],
        [null, null, { v: 0 }, { v: 300, sub: "s=3" }],
        [null, null, null, { v: 0 }]
      ],
      steps: [
        { t: "Diagonal l = 1: main diagonal m[i,i] = 0", d: "Single matrices cost 0 multiplications (dims p = [10, 3, 5, 12, 5]).", diag: 1, eq: "m[i,i] = 0" },
        { t: "Diagonal l = 2: pairs m[1,2], m[2,3], m[3,4]", d: "Compute chains of length 2 along the first upper diagonal.", diag: 2, on: [0, 1], from: [[0, 0], [1, 1]], split: { i: 1, k: 1, j: 2, cost: "10·3·5 = 150" }, eq: "m[1,2] = 0 + 0 + 10·3·5 = [[150|r]]" },
        { t: "Diagonal l = 3: m[2,4] picks split s=3", d: "Compare k=2 (0+300+3·5·5=375) vs k=3 (180+0+3·12·5=360); k=3 wins.", diag: 3, on: [1, 3], from: [[1, 2], [3, 3]], split: { i: 2, k: 3, j: 4, cost: "360 (s=3)" }, eq: "m[2,4] = \\min(375,\\, [[360|r]]) = [[360|r]]" },
        { t: "Diagonal l = 4: final answer m[1,4] = 510", d: "Optimal parenthesization splits at s[1,4]=1: A₁((A₂A₃)A₄).", diag: 4, on: [0, 3], from: [[0, 0], [1, 3]], path: [[0, 3], [1, 3], [1, 2]], split: { i: 1, k: 1, j: 4, cost: "510 (s=1)" }, eq: "m[1,4] = 0 + m[2,4] + 10·3·5 = [[510|r]]" }
      ]
    },
    {
      label: "Optimal BST (e, w, root)",
      mode: "interval",
      n: 3,
      corner: "i \\ j",
      grid: [
        [{ v: "0.20", sub: "r=1 w=.2" }, { v: "0.70", sub: "r=2 w=.5" }, { v: "1.30", sub: "r=2 w=.8" }],
        [null, { v: "0.30", sub: "r=2 w=.3" }, { v: "0.90", sub: "r=2 w=.6" }],
        [null, null, { v: "0.30", sub: "r=3 w=.3" }]
      ],
      steps: [
        { t: "Diagonal l = 1: single keys", d: "e[i,i] = w[i,i] = pᵢ for keys with probabilities [0.2, 0.3, 0.3].", diag: 1, eq: "e[i,i] = w[i,i]" },
        { t: "Diagonal l = 2: root[1,2] = 2", d: "Making key 2 root gives 0.2 + 0.5 = 0.70 < 0.80.", diag: 2, on: [0, 1], from: [[0, 0]], split: { i: 1, k: 2, j: 2, cost: "e=0.70, r=2" }, eq: "e[1,2] = e[1,1] + 0 + w[1,2] = [[0.70|r]]" },
        { t: "Diagonal l = 3: e[1,3] = 1.30 (root 2)", d: "Key 2 at the root balances left key 1 (0.20) and right key 3 (0.30).", diag: 3, on: [0, 2], from: [[0, 0], [2, 2]], path: [[0, 2], [0, 0], [2, 2]], split: { i: 1, k: 2, j: 3, cost: "e=1.30, r=2" }, eq: "e[1,3] = 0.20 + 0.30 + 0.80 = [[1.30|r]]" }
      ]
    },
    {
      label: "Cutting a Stick",
      mode: "interval",
      n: 4,
      corner: "i \\ j",
      grid: [
        [{ v: 0 }, { v: 0 }, { v: 5, sub: "k=2" }, { v: 11, sub: "k=2" }],
        [null, { v: 0 }, { v: 0 }, { v: 4, sub: "k=3" }],
        [null, null, { v: 0 }, { v: 0 }],
        [null, null, null, { v: 0 }]
      ],
      steps: [
        { t: "Cuts = [0, 3, 5, 7]: adjacent intervals cost 0", d: "No cut falls strictly between adjacent markers.", diag: 2, eq: "dp[i, i+1] = 0" },
        { t: "Diagonal l = 3: first single cuts", d: "Cutting [0,5] at 3 costs 5; cutting [3,7] at 5 costs 4.", diag: 3, on: [0, 2], from: [[0, 1], [1, 2]], split: { i: 0, k: 3, j: 5, cost: "len=5" }, eq: "dp[1,3] = 0 + 0 + (5 - 0) = [[5|c]]" },
        { t: "Diagonal l = 4: full stick [0,7] = 11", d: "Cut at 3 first (cost 7), then cut [3,7] at 5 (cost 4) for total 11.", diag: 4, on: [0, 3], from: [[0, 1], [1, 3]], path: [[0, 3], [1, 3]], split: { i: 0, k: 3, j: 7, cost: "total=11" }, eq: "dp[1,4] = 0 + [[dp[2,4]=4|v]] + 7 = [[11|r]]" }
      ]
    },
    {
      label: "Bursting Balloons",
      mode: "interval",
      n: 4,
      corner: "i \\ j",
      grid: [
        [{ v: 0 }, { v: 0 }, { v: 15, sub: "last=2" }, { v: 20, sub: "last=3" }],
        [null, { v: 0 }, { v: 0 }, { v: 15, sub: "last=3" }],
        [null, null, { v: 0 }, { v: 0 }],
        [null, null, null, { v: 0 }]
      ],
      steps: [
        { t: "Pad boundaries: [1, 3, 5, 1]", d: "Pick which balloon k bursts LAST inside (i, j) so neighbors stay fixed at i and j.", diag: 2, eq: "dp[i, i+1] = 0" },
        { t: "Burst inside (1, 3): 1·3·5 = 15", d: "Balloon 2 (val 3) bursts last between boundary 1 and balloon 3 (val 5).", diag: 3, on: [0, 2], from: [[0, 1], [1, 2]], split: { i: 1, k: 2, j: 3, cost: "1·3·5 = 15" }, eq: "dp[1,3] = 0 + 0 + 1·3·5 = [[15|c]]" },
        { t: "Optimal (1, 4): burst 3 first, 5 last → 20", d: "Bursting 3 first (1·3·5 = 15) then 5 last (1·5·1 = 5) yields total 20!", diag: 4, on: [0, 3], from: [[0, 2], [2, 3]], path: [[0, 3], [0, 2]], split: { i: 1, k: 3, j: 4, cost: "max = 20" }, eq: "dp[1,4] = [[15|v]] + 0 + 1·5·1 = [[20|r]]" }
      ]
    }
  ]
});

Kit.derive("der-int", {
  given: "Interval [[ [i, j] |g]] solved along diagonals [[l = j - i + 1|c]].",
  legend: [
    { role: "g", label: "Interval [i,j]" },
    { role: "c", label: "Split / Root" },
    { role: "v", label: "Sub-intervals" },
    { role: "r", label: "Minimum Cost" }
  ],
  lines: [
    {
      t: "Matrix Chain Multiplication",
      why: "Try every split k between i and j−1, then add the final matrix-product cost pᵢ₋₁·pₖ·pⱼ.",
      m: "[[m[i,j]|r]] = \\min_{i \\le k < j} ([[m[i,k]|v]] + [[m[k+1,j]|v]] + [[p_{i-1}p_k p_j|c]])",
      frames: [
        { m: "[[m[i,j]|r]] = \\min_{i \\le k < j} ([[m[i,k]|v]] + [[m[k+1,j]|v]])" },
        { m: "[[m[i,j]|r]] = \\min_{i \\le k < j} ([[m[i,k]|v]] + [[m[k+1,j]|v]] + [[p_{i-1}p_k p_j|c]])" }
      ],
      how: ["Both m[i,k] and m[k+1,j] have length < j−i+1, so they live to the left and below m[i,j]."],
      tip: { title: "Diagonal Order", body: "Outer loop l = 2..n guarantees every shorter interval is already solved." }
    },
    {
      t: "Optimal Binary Search Tree",
      why: "Try every root r in [i, j] and add w[i,j] because every node in [i,j] drops 1 level deeper.",
      m: "[[e[i,j]|r]] = \\min_{i \\le r \\le j} ([[e[i,r-1]|v]] + [[e[r+1,j]|v]]) + [[w[i,j]|c]]",
      frames: [
        { m: "[[e[i,j]|r]] = \\min_{i \\le r \\le j} ([[e[i,r-1]|v]] + [[e[r+1,j]|v]])" },
        { m: "[[e[i,j]|r]] = \\min_{i \\le r \\le j} ([[e[i,r-1]|v]] + [[e[r+1,j]|v]]) + [[w[i,j]|c]]" }
      ],
      how: ["w[i,j] is independent of r, so it sits outside the min."],
      final: true
    }
  ]
});

/* 1.5 Subset Bitmask DP (Held-Karp TSP) */
Kit.dp("dp-tsp", {
  mode: "bitmask",
  rows: [
    { mask: "0001", set: "{0}", size: 1 },
    { mask: "0011", set: "{0,1}", size: 2 },
    { mask: "0101", set: "{0,2}", size: 2 },
    { mask: "1001", set: "{0,3}", size: 2 },
    { mask: "0111", set: "{0,1,2}", size: 3 },
    { mask: "1111", set: "{0..3}", size: 4 }
  ],
  cols: ["0", "1", "2", "3"],
  grid: [
    [0, null, null, null],
    [null, 10, null, null],
    [null, null, 15, null],
    [null, null, null, 20],
    [null, 35, 25, null],
    [null, 45, 50, 42]
  ],
  steps: [
    { t: "|S| = 1: Start at city 0", d: "Base case dp[{0}, 0] = 0; all other endpoints are ∞.", size: 1, on: [0, 0], eq: "dp[0001_2, 0] = [[0|r]]" },
    { t: "|S| = 2: Direct edges from 0", d: "Fill 2-city subsets dp[{0,v}, v] = w(0, v) = 10, 15, 20.", size: 2, on: [1, 1], from: [[0, 0]], eq: "dp[0011_2, 1] = dp[0001_2, 0] + w(0,1) = [[10|c]]" },
    { t: "|S| = 3: Extend subsets of size 2", d: "dp[{0,1,2}, 2] tries u=1 (10+15=25) vs u=0, keeping 25.", size: 3, on: [4, 2], from: [[1, 1]], eq: "dp[0111_2, 2] = dp[0011_2, 1] + w(1,2) = [[25|c]]" },
    { t: "|S| = 4: Complete tour closes back to 0", d: "Minimum over ending city v plus return edge w(v,0) yields optimal tour cost 52.", size: 4, on: [5, 3], from: [[4, 2]], path: [[5, 3], [4, 2], [1, 1], [0, 0]], eq: "\\min_v (dp[1111_2, v] + w(v, 0)) = [[52|r]]", hud: [{ label: "Tour", val: "0→1→2→3→0 (52)", role: "r" }] }
  ]
});

Kit.derive("der-tsp", {
  given: "Bitmask [[S|v]] contains start vertex 0 and current endpoint [[v|c]].",
  legend: [
    { role: "v", label: "Subset S" },
    { role: "c", label: "Endpoint v / u" },
    { role: "r", label: "Optimal Tour Cost" }
  ],
  lines: [
    {
      t: "Held-Karp Recurrence",
      why: "Drop v from S and minimize over every possible predecessor u ∈ S \\ {v}.",
      m: "[[dp[S, v]|r]] = \\min_{u \\in S \\setminus \\{v\\}} ([[dp[S \\setminus \\{v\\}, u]|v]] + [[w(u, v)|c]])",
      frames: [
        { m: "[[dp[S, v]|r]] = \\min_{u \\in S \\setminus \\{v\\}} ([[dp[S \\setminus \\{v\\}, u]|v]])" },
        { m: "[[dp[S, v]|r]] = \\min_{u \\in S \\setminus \\{v\\}} ([[dp[S \\setminus \\{v\\}, u]|v]] + [[w(u, v)|c]])" }
      ],
      how: ["Removing bit v in code is simply mask ^ (1 << v).", "Subsets must be processed in increasing popcount |S| = 2..n."],
      tip: { title: "Complexity", body: "2ⁿ subsets × n endpoints × n transitions = O(2ⁿ n²)." },
      final: true
    }
  ]
});

/* 2.1 BFS vs DFS Edge Classifier + Kahn's Queue */
Kit.network("net-trav", {
  tabs: [
    {
      label: "DFS Edge Classifier",
      kind: "dfs",
      nodes: [
        { id: "u", t: "u", x: 20, y: 24, use: "Start vertex u." },
        { id: "v", t: "v", x: 52, y: 24, use: "Child of u; points back to u via Back edge." },
        { id: "w", t: "w", x: 84, y: 24, use: "Second child discovered from u." },
        { id: "x", t: "x", x: 36, y: 74, use: "Grandchild via v; target of Forward edge u → x." },
        { id: "y", t: "y", x: 72, y: 74, use: "Discovered from w; target of Cross edge w → y?" }
      ],
      edges: [
        { id: "uv", from: "u", to: "v" },
        { id: "vx", from: "v", to: "x" },
        { id: "vu", from: "v", to: "u", label: "Back", curve: 26 },
        { id: "ux", from: "u", to: "x", label: "Fwd" },
        { id: "uw", from: "u", to: "w" },
        { id: "wx", from: "w", to: "x", label: "Cross" }
      ],
      steps: [
        { t: "1. Discover u (d=1) → v (d=2) → x (d=3)", d: "Tree edges (green) visit WHITE vertices; active stack vertices stay GRAY.", on: ["x"], nodes: { u: { state: "gray", df: "1/?" }, v: { state: "gray", df: "2/?" }, x: { state: "gray", df: "3/?" } }, edges: { uv: "tree", vx: "tree" }, parens: [{ label: "u", d: 1 }, { label: "v", d: 2 }, { label: "x", d: 3 }] },
        { t: "2. Finish x (f=4), then Back edge v → u", d: "v sees GRAY ancestor u: edge (v, u) is a Back edge (proves cycle!).", on: ["v"], nodes: { u: { state: "gray", df: "1/?" }, v: { state: "gray", df: "2/?" }, x: { state: "black", df: "3/4" } }, edges: { uv: "tree", vx: "tree", vu: { cls: "back", on: true } }, parens: [{ label: "u", d: 1 }, { label: "v", d: 2 }, { label: "x", d: 3, f: 4 }] },
        { t: "3. Finish v (f=5), Forward edge u → x", d: "u checks x, which is BLACK and nested inside u (d[u]=1 < d[x]=3) → Forward edge!", on: ["u"], nodes: { u: { state: "gray", df: "1/?" }, v: { state: "black", df: "2/5" }, x: { state: "black", df: "3/4" } }, edges: { uv: "tree", vx: "tree", vu: "back", ux: { cls: "forward", on: true } }, parens: [{ label: "u", d: 1 }, { label: "v", d: 2, f: 5 }, { label: "x", d: 3, f: 4 }] },
        { t: "4. Visit w (6/7), Cross edge w → x", d: "w sees BLACK x with d[w]=6 > d[x]=3 (disjoint intervals) → Cross edge!", on: ["w"], nodes: { u: { state: "black", df: "1/8" }, v: { state: "black", df: "2/5" }, x: { state: "black", df: "3/4" }, w: { state: "black", df: "6/7" } }, edges: { uv: "tree", vx: "tree", vu: "back", ux: "forward", uw: "tree", wx: { cls: "cross", on: true } }, parens: [{ label: "u", d: 1, f: 8 }, { label: "v", d: 2, f: 5 }, { label: "x", d: 3, f: 4 }, { label: "w", d: 6, f: 7 }], overview: true }
      ]
    },
    {
      label: "BFS & Kahn's Queue",
      kind: "dfs",
      legend: [
        { role: "r", label: "In-Degree = 0 / Ready", swatch: "dot", use: "Queued and popped in topological order." },
        { role: "c", label: "Waiting (in > 0)", swatch: "box", use: "Still blocked by unfinished prerequisite edges." }
      ],
      nodes: [
        { id: "A", t: "A", x: 18, y: 28 },
        { id: "B", t: "B", x: 18, y: 74 },
        { id: "C", t: "C", x: 52, y: 50 },
        { id: "D", t: "D", x: 84, y: 50 }
      ],
      edges: [
        { id: "ac", from: "A", to: "C" },
        { id: "bc", from: "B", to: "C" },
        { id: "cd", from: "C", to: "D" }
      ],
      steps: [
        { t: "1. Seed queue with in-degree-0 nodes [A, B]", d: "C has in=2, D has in=1, so only A and B start in Kahn's queue.", on: ["A", "B"], nodes: { A: { state: "ok", top: "in=0" }, B: { state: "ok", top: "in=0" }, C: { state: "gray", top: "in=2" }, D: { state: "gray", top: "in=1" } }, hud: [{ label: "Queue", val: "[A, B]", role: "r" }, { label: "Order", val: "—", role: "v" }] },
        { t: "2. Pop A, B → C drops to in=0!", d: "Finishing A and B decrements C's in-degree from 2 → 1 → 0, enqueueing C.", on: ["C"], nodes: { A: { state: "black", top: "done" }, B: { state: "black", top: "done" }, C: { state: "ok", top: "in=0" }, D: { state: "gray", top: "in=1" } }, edges: { ac: "tree", bc: "tree" }, hud: [{ label: "Queue", val: "[C]", role: "r" }, { label: "Order", val: "A, B", role: "v" }] },
        { t: "3. Pop C → D finishes last", d: "Valid topological order: A, B, C, D.", on: ["D"], nodes: { A: { state: "black", top: "done" }, B: { state: "black", top: "done" }, C: { state: "black", top: "done" }, D: { state: "ok", top: "done" } }, edges: { ac: "tree", bc: "tree", cd: "tree" }, hud: [{ label: "Queue", val: "[]", role: "r" }, { label: "Order", val: "A, B, C, D", role: "r" }], overview: true }
      ]
    }
  ]
});

/* 2.2 Shortest-Path Relaxation Stepper */
Kit.network("net-sp", {
  tabs: [
    {
      label: "Dijkstra (Fails Neg Edge)",
      kind: "sp",
      nodes: [
        { id: "s", t: "s", x: 18, y: 50 },
        { id: "a", t: "a", x: 52, y: 22 },
        { id: "b", t: "b", x: 52, y: 78 },
        { id: "t", t: "t", x: 84, y: 50 }
      ],
      edges: [
        { id: "sa", from: "s", to: "a", w: 2 },
        { id: "sb", from: "s", to: "b", w: 5 },
        { id: "ba", from: "b", to: "a", w: -4 },
        { id: "at", from: "a", to: "t", w: 1 }
      ],
      steps: [
        { t: "1. Pop s (d=0), relax s→a (2) and s→b (5)", d: "Min-PQ holds [(a, 2), (b, 5)].", on: ["s"], nodes: { s: { state: "black", d: 0 }, a: { state: "gray", d: 2, pi: "s" }, b: { state: "gray", d: 5, pi: "s" }, t: { d: "∞" } }, edges: { sa: "relax", sb: "relax" }, hud: [{ label: "Min-PQ", val: "(a,2), (b,5)", role: "c" }] },
        { t: "2. Pop a (d=2) — LOCKED TOO EARLY!", d: "Dijkstra pops a=2 and relaxes a→t giving t=3.", on: ["a"], nodes: { s: { state: "black", d: 0 }, a: { state: "black", d: 2, pi: "s" }, b: { state: "gray", d: 5, pi: "s" }, t: { state: "gray", d: 3, pi: "a" } }, edges: { sa: "relax", at: "relax" }, hud: [{ label: "Min-PQ", val: "(t,3), (b,5)", role: "c" }] },
        { t: "3. Pop b=5 → negative edge b→a (−4) FAILS!", d: "5 + (−4) = 1 < 2, true shortest path to t is 2, but Dijkstra already locked a and t!", on: ["b", "a"], nodes: { s: { state: "black", d: 0 }, a: { state: "bad", d: "2≠1!", pi: "s" }, b: { state: "black", d: 5, pi: "s" }, t: { state: "bad", d: "3≠2!" } }, edges: { ba: { cls: "fail", on: true } }, hud: [{ label: "Status", val: "Wrong answer on neg edge!", role: "k" }], overview: true }
      ]
    },
    {
      label: "Bellman-Ford (|V|−1 + Cycle)",
      kind: "sp",
      nodes: [
        { id: "s", t: "s", x: 16, y: 50 },
        { id: "u", t: "u", x: 50, y: 22 },
        { id: "v", t: "v", x: 84, y: 50 },
        { id: "w", t: "w", x: 50, y: 78 }
      ],
      edges: [
        { id: "su", from: "s", to: "u", w: 3 },
        { id: "uv", from: "u", to: "v", w: 2 },
        { id: "vw", from: "v", to: "w", w: -4 },
        { id: "wu", from: "w", to: "u", w: 1 }
      ],
      steps: [
        { t: "Pass 1–3 (|V|−1 passes): distances keep dropping", d: "Cycle u→v→w→u has total weight 2 − 4 + 1 = −1 < 0!", on: ["u", "v", "w"], nodes: { s: { state: "black", d: 0 }, u: { state: "gray", d: 2, pi: "w" }, v: { state: "gray", d: 4, pi: "u" }, w: { state: "gray", d: 0, pi: "v" } }, edges: { su: "relax", uv: "relax", vw: "relax", wu: "relax" }, hud: [{ label: "Pass", val: "3 of 3 (|V|−1)", role: "c" }] },
        { t: "Extra Pass |V|=4: d[u] relaxes again → Cycle!", d: "Edge w→u relaxes d[u] from 2 → 1 on pass |V|. Follow π pointers u←w←v←u to print the negative cycle!", on: ["u"], nodes: { s: { state: "black", d: 0 }, u: { state: "bad", d: "2→1!", pi: "w" }, v: { state: "bad", d: 4, pi: "u" }, w: { state: "bad", d: 0, pi: "v" } }, edges: { uv: "cycle", vw: "cycle", wu: { cls: "cycle", on: true } }, hud: [{ label: "Pass |V|", val: "Negative cycle via π!", role: "k" }], overview: true }
      ]
    },
    {
      label: "DAG-SP (1 Topo Pass)",
      kind: "sp",
      nodes: [
        { id: "s", t: "s", x: 18, y: 50 },
        { id: "a", t: "a", x: 50, y: 24 },
        { id: "b", t: "b", x: 50, y: 76 },
        { id: "t", t: "t", x: 84, y: 50 }
      ],
      edges: [
        { id: "sa", from: "s", to: "a", w: 5 },
        { id: "sb", from: "s", to: "b", w: 4 },
        { id: "ba", from: "b", to: "a", w: -3 },
        { id: "at", from: "a", to: "t", w: 2 }
      ],
      steps: [
        { t: "1. Topological order: s, b, a, t", d: "No cycles exist, so b settles completely BEFORE a is ever processed!", on: ["s", "b"], nodes: { s: { state: "black", d: 0, top: "#1" }, b: { state: "ok", d: 4, pi: "s", top: "#2" }, a: { state: "gray", d: 5, pi: "s", top: "#3" }, t: { d: "∞", top: "#4" } }, edges: { sa: "relax", sb: "relax" }, hud: [{ label: "Topo", val: "s, b, a, t", role: "r" }] },
        { t: "2. Process b → relax negative edge b→a (−3)", d: "d[a] updates cleanly to 4 − 3 = 1 before a relaxes outgoing edge a→t!", on: ["a", "t"], nodes: { s: { state: "black", d: 0, top: "#1" }, b: { state: "black", d: 4, pi: "s", top: "#2" }, a: { state: "ok", d: 1, pi: "b", top: "#3" }, t: { state: "ok", d: 3, pi: "a", top: "#4" } }, edges: { sb: "relax", ba: { cls: "relax", on: true }, at: { cls: "relax", on: true } }, hud: [{ label: "Time", val: "O(V + E) single pass!", role: "r" }], overview: true }
      ]
    }
  ]
});

/* 2.3 4-Queens Backtracking Tree + Synced Board */
Kit.tree("tr-queens", {
  alt: "4-Queens backtracking state-space tree with synced chessboard and pruning.",
  compact: true,
  board: { kind: "queens", size: 4 },
  root: {
    id: "r", t: "Empty Board", sub: "Row 0 choice", kind: "root", role: "c",
    use: "Start with 4 empty rows. We place one queen per row top-to-bottom.",
    children: [
      {
        id: "q00", edge: "col 0", t: "Q at (0,0)", sub: "Row 0 = col 0", kind: "decision", role: "c",
        use: "Place Queen #1 at top-left corner (0,0).",
        children: [
          { id: "q10", edge: "col 0/1", edgeRole: "k", t: "Blocked!", sub: "attacked by (0,0)", kind: "pruned", role: "k", use: "Same column or diagonal as (0,0) — cut immediately!" },
          {
            id: "q12", edge: "col 2", t: "Q at (1,2)", sub: "Row 1 = col 2", kind: "decision", role: "c",
            use: "Col 2 on Row 1 is safe (PROMISING), so place Queen #2 here.",
            children: [
              { id: "dead", edge: "row 2", edgeRole: "k", t: "Dead End", sub: "all 4 cols hit!", kind: "pruned", role: "k", use: "Every column on Row 2 is attacked! Backtrack out of Q(0,0)." }
            ]
          }
        ]
      },
      {
        id: "q01", edge: "col 1", edgeRole: "r", t: "Q at (0,1)", sub: "backtrack here", kind: "decision", role: "r",
        use: "Try moving Row 0 Queen right to col 1 — leaves plenty of safe squares.",
        children: [
          {
            id: "q13", edge: "col 3", edgeRole: "r", t: "Q at (1,3)", sub: "safe!", kind: "decision", role: "r",
            use: "Place Queen #2 at (1,3); Rows 2 and 3 still have safe columns.",
            children: [
              { id: "sol", edge: "c0, c2", edgeRole: "r", t: "Solved!", sub: "cols [1, 3, 0, 2]", kind: "leaf", role: "r", use: "Places (2,0) and (3,2) cleanly — all 4 queens safe!" }
            ]
          }
        ]
      }
    ]
  },
  steps: [
    { t: "1. Start empty, then try Q(0,0) on Row 0", d: "Putting a queen in top-left (0,0) immediately crosses out squares along its column, row, and diagonal.", on: ["q00"], reveal: ["r", "q00"], board: { title: "1 · Try Q(0,0)", queens: [[0, 0]] }, hud: [{ label: "Queens", val: "1 / 4", role: "c" }, { label: "Pruned", val: "0 subtrees", role: "v" }] },
    { t: "2. Skip attacked cols 0–1 → place Q(1,2)", d: "On Row 1, cols 0 and 1 are pruned without descending. Only col 2 (PROMISING) opens a deeper branch.", on: ["q12"], visit: ["r", "q00"], prune: ["q10"], reveal: ["r", "q00", "q10", "q12"], board: { title: "2 · Safe Q(1,2)", queens: [[0, 0], [1, 2]] }, hud: [{ label: "Queens", val: "2 / 4", role: "c" }, { label: "Pruned", val: "col 0, col 1", role: "k" }] },
    { t: "3. Dead end on Row 2 → PRUNE & Backtrack!", d: "Look at Row 2 on the board: every square has an ×! Backtracking quits Q(0,0) right now without trying Row 3.", on: ["dead"], prune: ["q10", "dead"], reveal: ["r", "q00", "q10", "q12", "dead"], board: { title: "3 · Row 2 Blocked!", queens: [[0, 0], [1, 2]], bad: [2, 1] }, hud: [{ label: "Action", val: "Backtrack to Row 0", role: "k" }, { label: "Saved", val: "skipped Row 3!", role: "r" }] },
    { t: "4. Backtrack to Q(0,1) → Solved [1, 3, 0, 2]!", d: "Shifting Row 0 to col 1 opens safe spots (1,3) → (2,0) → (3,2) — all 4 queens stand peacefully!", on: ["sol"], prune: ["q10", "dead"], path: ["r", "q01", "q13", "sol"], reveal: "all", board: { title: "4 · Solved [1, 3, 0, 2]!", queens: [[0, 1], [1, 3], [2, 0], [3, 2]] }, hud: [{ label: "Queens", val: "4 / 4 ✓", role: "r" }, { label: "Cols", val: "[1, 3, 0, 2]", role: "r" }], overview: true }
  ]
});

/* 2.3 4x4 Sudoku AC-3 Domain Shrinking */
Kit.tree("tr-sudoku", {
  alt: "4x4 Sudoku backtracking tree with synced AC-3 candidate domain grid.",
  compact: true,
  board: { kind: "sudoku", size: 4 },
  root: {
    id: "s0", t: "Start Clues", sub: "all domains {1..4}", kind: "root", role: "c",
    use: "Initial 4×4 board before constraint propagation runs.",
    children: [
      { id: "s1", edge: "scan neighbors", edgeRole: "v", t: "Cross Out 1,3,4", sub: "AC-3 shrinks (0,1)", kind: "decision", role: "v", use: "Row 0 has 1, box has 3, col 1 has 4 — none of those can fit in (0,1)." },
      { id: "s2", edge: "only {2} left", edgeRole: "r", t: "Assign (0,1) = 2", sub: "forces (0,2) = 3!", kind: "leaf", role: "r", use: "Singleton domain {2} fills (0,1), which immediately forces (0,2) = 3!" }
    ]
  },
  steps: [
    {
      t: "1. Look at empty cell (0,1) in row 0, col 1", d: "Every blank cell starts with {1, 2, 3, 4}. Notice 1 is in Row 0, 3 is in its 2×2 box, and 4 is in Column 1.",
      on: ["s0"], reveal: ["s0"],
      hud: [{ label: "Candidates", val: "{1, 2, 3, 4}", role: "v" }, { label: "Guesses", val: "0", role: "r" }],
      board: { title: "1 · Clues + Full {1..4}", cells: [{ v: 1, fixed: true }, [1, 2, 3, 4], [1, 2, 3, 4], 4, [1, 2, 3, 4], { v: 3, fixed: true }, [1, 2, 3, 4], [1, 2, 3, 4], [1, 2, 3, 4], { v: 4, fixed: true }, [1, 2, 3, 4], [1, 2, 3, 4], [1, 2, 3, 4], [1, 2, 3, 4], { v: 2, fixed: true }, [1, 2, 3, 4]] }
    },
    {
      t: "2. AC-3 crosses out 1, 3, and 4 in red!", d: "Arc consistency deletes digits already taken by neighbors. Only {2} survives inside cell (0,1)!",
      on: ["s1"], visit: ["s0"], reveal: ["s0", "s1"],
      hud: [{ label: "Eliminated", val: "1, 3, 4 crossed out", role: "k" }, { label: "Survives", val: "{2} singleton", role: "r" }],
      board: { title: "2 · AC-3 Strikes 1, 3, 4", cells: [{ v: 1, fixed: true }, { d: [1, 2, 3, 4], elim: [1, 3, 4], role: "c" }, { d: [2, 3], role: "v" }, 4, [2, 4], { v: 3, fixed: true }, [1, 2, 4], [1, 2], [1, 2, 3], { v: 4, fixed: true }, [1, 3], [1, 2, 3], [2, 3], [1, 2], { v: 2, fixed: true }, [1, 3]] }
    },
    {
      t: "3. Cascade: (0,1) = 2 automatically forces (0,2) = 3!", d: "Plugging 2 into (0,1) crosses 2 off neighbor (0,2), leaving {3}. Two cells solved with ZERO guessing!",
      on: ["s2"], path: ["s0", "s2"], reveal: "all",
      hud: [{ label: "Solved", val: "(0,1)=2 & (0,2)=3", role: "r" }, { label: "Guesses", val: "0 needed!", role: "r" }],
      board: { title: "3 · Cascade Solves Two Cells!", cells: [{ v: 1, fixed: true }, { v: 2, role: "r" }, { v: 3, role: "r" }, 4, [2, 4], { v: 3, fixed: true }, [1, 4], [1, 2], [1, 2, 3], { v: 4, fixed: true }, [1], [1, 2, 3], [2, 3], [1], { v: 2, fixed: true }, [1, 3]] },
      overview: true
    }
  ]
});

/* 2.4 0/1 Knapsack Branch-and-Bound */
Kit.tree("tr-bnb", {
  alt: "0/1 Knapsack Branch-and-Bound tree showing live fractional upper bounds and pruning.",
  compact: true,
  root: {
    id: "n0", t: "Start (Cap W=4)", attrs: [{ k: "profit", v: "0", role: "v" }, { k: "max ub", v: "110", role: "c" }], kind: "root", role: "c",
    use: "Items sorted by $/kg: #1 (2kg, $60), #2 (2kg, $50), #3 (2kg, $40). Best greedy ceiling = 60+50 = 110.",
    children: [
      {
        id: "n1", edge: "Take #1 (+$60)", edgeRole: "r", t: "Take Item 1", attrs: [{ k: "W_left", v: "2 kg", role: "v" }, { k: "max ub", v: "110", role: "r" }], kind: "decision", role: "r",
        use: "2 kg full ($60), 2 kg left. Adding Item 2 gives upper bound $110.",
        children: [
          { id: "n11", edge: "Take #2 (+$50)", edgeRole: "r", t: "New Best = $110", attrs: [{ k: "W_left", v: "0 kg", role: "v" }, { k: "profit", v: "110 ✓", role: "r" }], kind: "leaf", role: "r", use: "Valid integer solution! Raises best_so_far from 0 to 110." },
          { id: "n10", edge: "Skip #2", edgeRole: "k", t: "Skip Item 2", attrs: [{ k: "profit", v: "60", role: "v" }, { k: "ub", v: "100 ≤ 110", role: "k" }], kind: "pruned", role: "k", use: "Even adding Item 3 ($40) only reaches 60+40 = 100 ≤ 110. Stop here!" }
        ]
      },
      {
        id: "n2", edge: "Skip #1", edgeRole: "k", t: "Skip Item 1", attrs: [{ k: "W_left", v: "4 kg", role: "v" }, { k: "ub", v: "90 ≤ 110", role: "k" }], kind: "pruned", role: "k",
        use: "Best left without #1 is #2 + #3 = 50 + 40 = 90 ≤ 110 — entire subtree cut!",
        children: [
          { id: "n21", edge: "never explored", edgeRole: "k", t: "Saved Branch", sub: "skipped!", kind: "pruned", role: "k", use: "Pruned before ever expanding!" }
        ]
      }
    ]
  },
  steps: [
    { t: "1. Root bound: best possible is $110", d: "Sort items richest-per-kg first (#1: $30/kg, #2: $25/kg, #3: $20/kg). At most 4 kg fits #1+#2 → ub = $110.", on: ["n0"], reveal: ["n0"], hud: [{ label: "best_so_far", val: "$0", role: "v" }, { label: "root ub", val: "$110", role: "c" }] },
    { t: "2. Take Item 1 & Item 2 → sets best_so_far = $110", d: "Packing #1 ($60) + #2 ($50) uses all 4 kg legally, raising our real integer record best_so_far to $110!", on: ["n1", "n11"], visit: ["n0"], reveal: ["n0", "n1", "n11", "n10"], hud: [{ label: "best_so_far", val: "$110 ✓", role: "r" }, { label: "W_left", val: "0 kg", role: "v" }] },
    { t: "3. Prune both weaker branches (ub 100 and 90 ≤ 110)!", d: "Skipping #2 caps out at 60+40 = $100; skipping #1 caps out at 50+40 = $90. Both ≤ $110, so gray them out and finish!", on: ["n10", "n2"], prune: ["n10", "n2"], path: ["n0", "n1", "n11"], reveal: "all", hud: [{ label: "Optimal", val: "$110", role: "r" }, { label: "Cut Branches", val: "ub 100 & 90 ≤ 110", role: "k" }], overview: true }
  ]
});

/* 3.1 Complexity Class Venn Diagram */
Kit.venn("venn-pnp", {
  alt: "Venn diagram of P, NP, NPC = NP ∩ NP-hard, and NP-hard with P != NP vs P = NP toggle."
});

/* 3.2 Polynomial Reduction Pipeline */
Kit.flow("fl-red", {
  alt: "Polynomial-time reduction pipeline x in A mapped via F(x) to decider for B.",
  equiv: "x \\in A \\iff F(x) \\in B \\; (\\text{both directions required!})",
  nodes: [
    { id: "x", t: "Input x ∈ A?", sub: "Known NPC source", kind: "input", role: "v", use: "Instance of known hard problem A." },
    { id: "f", t: "Poly Mapper F(x)", sub: "Runs in O(n^k)", kind: "process", role: "c", use: "Builds gadgets in polynomial time preserving Yes/No answers." },
    { id: "b", t: "Decider for B", sub: "Hypothetical fast solver", kind: "decision", role: "f", use: "Decides whether F(x) ∈ B." },
    { id: "out", t: "Return Yes / No", sub: "Solves A in poly time!", kind: "output", role: "r", use: "If B were in P, A would be in P too—contradiction unless P=NP!" }
  ],
  edges: [
    [0, 1, "x"],
    [1, 2, "F(x)"],
    [2, 3, "Yes/No", "r"]
  ]
});

/* 3.2 CLRS Fig. 34.13 NP-Completeness Reduction DAG */
Kit.dag("dag-clrs", {
  alt: "CLRS Figure 34.13 NP-Completeness Reduction DAG from CIRCUIT-SAT through 3-SAT to Clique, IS, VC, Subset-Sum, Partition, Ham-Cycle, TSP, and 3-Colour.",
  boxWidth: 136,
  nodes: [
    { id: "csat", t: "CIRCUIT-SAT", role: "v", layer: 0, use: "Cook-Levin base: every NP verifier compiles to a Boolean circuit." },
    { id: "sat", t: "SAT", role: "c", layer: 1, use: "Tseitin encoding converts circuit gates into CNF clauses." },
    { id: "3sat", t: "3-SAT", role: "f", shared: true, layer: 2, use: "Splits long clauses into 3-literal clauses; hub of almost all reductions!" },
    { id: "clique", t: "CLIQUE", role: "c", layer: 3, use: "Satisfying assignment ↔ clique picking one literal per clause." },
    { id: "ham", t: "HAM-CYCLE", role: "c", layer: 3, use: "Clause & variable gadgets force one cycle through all vertices." },
    { id: "col3", t: "3-COLOUR", role: "r", layer: 3, use: "Palette triangle {T, F, Base} + OR-gadget widgets." },
    { id: "is", t: "INDEPENDENT SET", role: "c", layer: 4, use: "Complement graph flips cliques into independent sets." },
    { id: "tsp", t: "TSP", role: "r", layer: 4, use: "Assign weight 0 to Ham-Cycle edges and 1 to non-edges." },
    { id: "vc", t: "VERTEX-COVER", role: "c", layer: 5, use: "S is an Independent Set iff V \\ S is a Vertex Cover." },
    { id: "ss", t: "SUBSET-SUM", role: "c", layer: 6, use: "Base-10 digit columns encode edges and vertices." },
    { id: "part", t: "PARTITION", role: "r", layer: 7, use: "Special case of Subset-Sum splitting total sum in half." }
  ],
  edges: [
    { id: "e1", from: "csat", to: "sat" },
    { id: "e2", from: "sat", to: "3sat" },
    { id: "e3", from: "3sat", to: "clique" },
    { id: "e4", from: "3sat", to: "ham" },
    { id: "e5", from: "3sat", to: "col3" },
    { id: "e6", from: "clique", to: "is" },
    { id: "e7", from: "is", to: "vc" },
    { id: "e8", from: "vc", to: "ss" },
    { id: "e9", from: "ss", to: "part" },
    { id: "e10", from: "ham", to: "tsp" }
  ],
  steps: [
    { t: "1. Spine: CIRCUIT-SAT → SAT → 3-SAT", d: "Cook-Levin roots the entire hierarchy at CIRCUIT-SAT and channels into 3-SAT.", on: ["csat", "sat", "3sat"], reveal: ["csat", "sat", "3sat"], edges: ["e1", "e2"] },
    { t: "2. Three main branches out of 3-SAT", d: "3-SAT branches into CLIQUE, HAM-CYCLE, and 3-COLOUR.", on: ["clique", "ham", "col3"], visit: ["csat", "sat", "3sat"], reveal: ["csat", "sat", "3sat", "clique", "ham", "col3"], edges: ["e3", "e4", "e5"] },
    { t: "3. Packing & Graph Chain: CLIQUE → IS → VC → SUBSET-SUM → PARTITION", d: "Complement graph, V\\S duality, and base-10 digit encoding carry hardness to numbers.", on: ["is", "vc", "ss", "part"], visit: ["csat", "sat", "3sat", "clique", "ham", "col3"], reveal: ["csat", "sat", "3sat", "clique", "ham", "col3", "is", "vc", "ss", "part"], edges: ["e6", "e7", "e8", "e9"] },
    { t: "4. Complete CLRS Fig. 34.13 Reduction DAG", d: "HAM-CYCLE → TSP completes the classic reduction tree.", on: ["tsp"], visit: ["csat", "sat", "3sat", "clique", "ham", "col3", "is", "vc", "ss", "part"], reveal: "all", edges: ["e10"], overview: true }
  ]
});

/* 3.3 3-SAT <=p Independent Set Gadget Builder */
Kit.network("net-sat", {
  sat: {
    vars: ["x1", "x2", "x3"],
    clauses: [
      ["x1", "!x2", "x3"],
      ["!x1", "x2", "x3"],
      ["!x1", "!x2", "!x3"]
    ],
    init: { x1: true, x2: false, x3: true }
  },
  steps: [
    { t: "1. Build k=3 Clause Triangles", d: "Each clause forms a triangle so at most 1 vertex per clause can join the Independent Set.", assign: { x1: true, x2: false, x3: true } },
    { t: "2. Test an invalid assignment (x₁=F, x₂=T, x₃=F)", d: "Clause C₂ has true literals, but Clause C₁ still fails—only 2 vertices can be picked (< k).", assign: { x1: false, x2: true, x3: false } },
    { t: "3. Valid assignment (x₁=T, x₂=F, x₃=T) → IS size 3!", d: "Every clause has ≥1 true literal and zero xᵢ ↔ ¬xᵢ conflicts. Try flipping variables yourself!", assign: { x1: true, x2: false, x3: true }, overview: true }
  ]
});

/* 4.1 Metric TSP Simulator (MST -> Preorder Walk -> Shortcutting) */
Kit.network("net-tsp", {
  kind: "tsp",
  nodes: [
    { id: "a", t: "A", x: 18, y: 24 },
    { id: "b", t: "B", x: 52, y: 18 },
    { id: "c", t: "C", x: 82, y: 38 },
    { id: "d", t: "D", x: 64, y: 78 },
    { id: "e", t: "E", x: 26, y: 74 }
  ],
  edges: [
    { id: "ab", from: "a", to: "b", w: 4, undir: true },
    { id: "bc", from: "b", to: "c", w: 4, undir: true },
    { id: "bd", from: "b", to: "d", w: 6, undir: true },
    { id: "ae", from: "a", to: "e", w: 5, undir: true },
    { id: "cd", from: "c", to: "d", w: 5, undir: true },
    { id: "da", from: "d", to: "e", w: 5, undir: true },
    { id: "ea", from: "e", to: "a", w: 5, cls: "shortcut" }
  ],
  steps: [
    { t: "1. Compute MST (w = 19 ≤ OPT)", d: "Deleting one edge from OPT leaves a spanning tree, so OPT ≥ w(MST) = 19.", on: ["a", "b", "c", "e"], edges: { ab: "mst", bc: "mst", ae: "mst", bd: "mst" }, hud: [{ label: "w(MST)", val: "19 ≤ OPT", role: "r" }] },
    { t: "2. Preorder walk around doubled MST (≤ 2·w(MST))", d: "Walk visits A → B → C → B → D → B → A → E → A (cost 2·19 = 38).", on: ["b", "d"], edges: { ab: "walk", bc: "walk", bd: "walk", ae: "walk" }, hud: [{ label: "Full Walk", val: "38 = 2·w(MST)", role: "a" }] },
    { t: "3. Shortcut repeated vertices → A→B→C→D→E→A", d: "Triangle inequality guarantees shortcuts C→D, D→E, E→A never increase length (total ≤ 2·OPT)!", on: ["a", "b", "c", "d", "e"], edges: { ab: "mst", bc: "mst", cd: "shortcut", da: "shortcut", ea: "shortcut" }, hud: [{ label: "Tour Cost", val: "23 ≤ 2·OPT", role: "f" }], overview: true }
  ]
});

Kit.derive("der-approx", {
  given: "Algorithm outputs cost [[ALG|c]]; unknown optimum is [[OPT|r]].",
  legend: [
    { role: "c", label: "Algorithm Cost" },
    { role: "r", label: "Optimal / Lower Bound" },
    { role: "f", label: "Approximation Ratio" }
  ],
  lines: [
    {
      t: "Unified Ratio ρ ≥ 1",
      why: "Always put the larger cost on top so ρ ≥ 1 for both minimization and maximization.",
      m: "[[\\rho|f]] = \\frac{[[ALG|c]]}{[[OPT|r]]} \\; (\\text{min}) \\quad \\text{vs.} \\quad [[\\rho|f]] = \\frac{[[OPT|r]]}{[[ALG|c]]} \\; (\\text{max})",
      frames: [
        { m: "[[\\rho|f]] = \\frac{[[ALG|c]]}{[[OPT|r]]} \\; (\\text{min})" },
        { m: "[[\\rho|f]] = \\frac{[[ALG|c]]}{[[OPT|r]]} \\; (\\text{min}) \\quad \\text{vs.} \\quad [[\\rho|f]] = \\frac{[[OPT|r]]}{[[ALG|c]]} \\; (\\text{max})" }
      ],
      how: ["Maximization ALG ≥ (1−ε)OPT is equivalent to ρ ≤ 1/(1−ε)."]
    },
    {
      t: "Lower-Bound Certificates (when OPT is unknown)",
      why: "Compare ALG against a polynomial-time lower bound instead of unknown OPT.",
      m: "[[\\vert C^*\\vert|r]] \\ge [[\\vert M\\vert|v]] \\; (\\text{Vertex Cover}) \\qquad [[OPT|r]] \\ge [[w(MST)|v]] \\; (\\text{Metric TSP})",
      frames: [
        { m: "[[\\vert C^*\\vert|r]] \\ge [[\\vert M\\vert|v]] \\; (\\text{Vertex Cover})" },
        { m: "[[\\vert C^*\\vert|r]] \\ge [[\\vert M\\vert|v]] \\; (\\text{Vertex Cover}) \\qquad [[OPT|r]] \\ge [[w(MST)|v]] \\; (\\text{Metric TSP})" }
      ],
      how: ["Every edge in matching M needs at least 1 endpoint in C*, and deleting 1 TSP edge gives a spanning tree ≥ MST."],
      final: true
    }
  ]
});

/* 4.2 Subset-Sum Trimming Simulator */
Kit.trim("trim-ss", {
  items: [10, 12, 15, 22],
  target: 30,
  eps: 0.4
});

Kit.derive("der-fptas", {
  given: "Items [[n|v]], tolerance [[\\varepsilon|c]], trimming ratio [[\\delta = \\frac{\\varepsilon}{2n}|f]].",
  legend: [
    { role: "v", label: "Problem Size n" },
    { role: "c", label: "Tolerance / Scaling" },
    { role: "f", label: "Trim Factor δ" },
    { role: "r", label: "FPTAS Guarantee" }
  ],
  lines: [
    {
      t: "Subset-Sum Trimming Error Bound",
      why: "Each of the n TRIM passes multiplies relative error by at most (1 + δ).",
      m: "\\frac{OPT}{[[z^*|r]]} \\le \\left(1 + \\frac{[[\\varepsilon|c]]}{2[[n|v]]}\\right)^{[[n|v]]} \\le e^{\\varepsilon / 2} \\le [[1 + \\varepsilon|r]]",
      frames: [
        { m: "\\frac{OPT}{[[z^*|r]]} \\le (1 + [[\\delta|f]])^{[[n|v]]}" },
        { m: "\\frac{OPT}{[[z^*|r]]} \\le \\left(1 + \\frac{[[\\varepsilon|c]]}{2[[n|v]]}\\right)^{[[n|v]]} \\le e^{\\varepsilon / 2} \\le [[1 + \\varepsilon|r]]" }
      ],
      how: ["Using 1 + x ≤ eˣ and e^(ε/2) ≤ 1 + ε for 0 < ε ≤ 1."]
    },
    {
      t: "Knapsack FPTAS Value Scaling",
      why: "Scale item values down by K so total scaled profit is at most n² / ε.",
      m: "[[K|c]] = \\frac{[[\\varepsilon|c]] v_{\\max}}{[[n|v]]}, \\quad [[\\tilde{v}_i|r]] = \\left\\lfloor \\frac{v_i}{[[K|c]]} \\right\\rfloor \\implies [[O(\\frac{n^3}{\\varepsilon})|r]]",
      how: ["DP over scaled values takes O(n · n · ⌊v_max/K⌋) = O(n³ / ε) time."],
      final: true
    }
  ]
});
