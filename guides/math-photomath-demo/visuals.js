/* Math Studio · visuals.js
   Photomath-style multi-frame differential math animations + synced SVG / Kit.graph / Kit.flow. */

/* 1.1 Linear equation + animated SVG balance scale */
Kit.derive("k-balance", {
  alt: "Step-by-step solution of 3(2x - 4) + 5 = 2x + 9 synced with a balance scale.",
  given: "Solve for [[x|v]]:",
  legend: [
    { role: "c", label: "Multiplier / Op" },
    { role: "g", label: "Group (2x − 4)" },
    { role: "v", label: "Variable x" },
    { role: "r", label: "Solved value" }
  ],
  visual: {
    alt: "Balance scale keeping both sides equal across each algebra move.",
    vb: "0 0 420 250",
    svg: `<text id="bal-op" x="210" y="32" text-anchor="middle" class="tb" style="font-size:14px;fill:var(--pc)">Balanced: L = R</text>
      <rect x="182" y="226" width="56" height="10" rx="5" class="f-arrow"/>
      <polygon points="210,164 192,226 228,226" class="f-pt" style="stroke:var(--pc);stroke-width:2"/>
      <g id="bal-beam" style="transition:transform .45s var(--spring);transform-box:view-box;transform-origin:210px 164px">
        <line x1="92" y1="164" x2="328" y2="164" class="s-pc" stroke-width="4" stroke-linecap="round"/>
        <circle cx="210" cy="164" r="6.5" class="f-pc"/>
        <g id="bal-lp" style="transition:transform .45s var(--spring);transform-box:view-box;transform-origin:92px 164px">
          <line x1="92" y1="164" x2="92" y2="140" class="s-arrow"/>
          <rect x="24" y="130" width="136" height="10" rx="5" class="f-pc"/>
          <rect x="20" y="82" width="144" height="44" rx="12" style="fill:var(--surface-2);stroke:var(--m-v);stroke-width:1.5"/>
          <text id="bal-l" x="92" y="109" text-anchor="middle" class="tb" style="font-size:13.5px">3(2x − 4) + 5</text>
        </g>
        <g id="bal-rp" style="transition:transform .45s var(--spring);transform-box:view-box;transform-origin:328px 164px">
          <line x1="328" y1="164" x2="328" y2="140" class="s-arrow"/>
          <rect x="260" y="130" width="136" height="10" rx="5" class="f-pc"/>
          <rect x="256" y="82" width="144" height="44" rx="12" style="fill:var(--surface-2);stroke:var(--m-g);stroke-width:1.5"/>
          <text id="bal-r" x="328" y="109" text-anchor="middle" class="tb" style="font-size:13.5px">2x + 9</text>
        </g>
      </g>`,
    render(i, svg) {
      const states = [
        ["3(2x − 4) + 5", "2x + 9", "Original balance", 0],
        ["6x − 12 + 5", "2x + 9", "Distribute 3 inside", -2.5],
        ["6x − 7", "2x + 9", "Combine −12 + 5", 0],
        ["4x − 7", "9", "Subtract 2x both sides", 2],
        ["4x", "16", "Add 7 both sides", 0],
        ["x", "4", "Divide both sides by 4", 0]
      ];
      const st = states[i] || states[0];
      svg.querySelector("#bal-l").textContent = st[0];
      svg.querySelector("#bal-r").textContent = st[1];
      svg.querySelector("#bal-op").textContent = st[2];
      svg.querySelector("#bal-beam").style.transform = `rotate(${st[3]}deg)`;
      svg.querySelector("#bal-lp").style.transform = `rotate(${-st[3]}deg)`;
      svg.querySelector("#bal-rp").style.transform = `rotate(${-st[3]}deg)`;
    }
  },
  lines: [
    {
      t: "Start with the equation",
      why: "Keep the grouped package together until the multiplier distributes.",
      m: "[[3|c|m3]]([[2x - 4|g|gp]]) + 5 = [[2x|v|rx]] + 9",
      tip: {
        title: "Order of operations",
        body: "Multiplication by [[3|c]] binds tighter than +5 outside.",
        watch: "Never add −4 + 5 before multiplying by 3."
      }
    },
    {
      t: "Distribute 3",
      op: "3 \\cdot 2x - 3 \\cdot 4",
      why: "Multiply [[3|c]] across every term inside the parentheses.",
      frames: [
        { m: "[[3|c|m3]]([[2x|v|t1]] - [[4|c|t2]]) [[+ 5|s|p5]] = [[2x|v|rx]] [[+ 9|s|p9]]", dur: 1450 },
        { m: "[[3 \\cdot 2x|c|p1]] - [[3 \\cdot 4|c|p2]] [[+ 5|s|p5]] = [[2x|v|rx]] [[+ 9|s|p9]]", from: { p1: "m3", p2: "m3" }, dur: 1750 },
        { m: "[[6x|v|p1]] - [[12|c|p2]] [[+ 5|s|p5]] = [[2x|v|rx]] [[+ 9|s|p9]]" }
      ],
      how: [
        "Multiply [[3|c]] \\times 2x = [[6x|v]].",
        "Multiply [[3|c]] \\times (-4) = [[-12|c]]."
      ],
      tip: {
        rule: "a(b - c) = ab - ac",
        body: "Opening the parentheses frees the constant terms so they can combine."
      }
    },
    {
      t: "Combine constants",
      op: "-12 + 5 = -7",
      why: "Simplify the numbers on the left side while the rest stays put.",
      frames: [
        { m: "[[6x|v|lx]] [[- 12 + 5|c|comb]] = [[2x|v|rx]] [[+ 9|s|p9]]", dur: 1600 },
        { m: "[[6x|v|lx]] [[- 7|c|comb]] = [[2x|v|rx]] [[+ 9|s|p9]]" }
      ],
      how: ["Add -12 + 5 = -7."],
      tip: "Simplifying each side first shrinks the number of terms you carry."
    },
    {
      t: "Subtract 2x on both sides",
      op: "-2x \\text{ on both sides}",
      why: "Subtract [[2x|v]] from both sides so [[x|v]] stays on one side.",
      frames: [
        { m: "[[6x|v|lx]] [[- 7|s|m7]] = [[2x|v|rx]] [[+ 9|s|p9]]", dur: 1450 },
        { m: "[[6x - 2x|v|lx]] [[- 7|s|m7]] = ~~2x - 2x|rx~~ [[+ 9|s|p9]]", dur: 1550 },
        { strike: true, dur: 1600 },
        { m: "[[4x|v|lx]] [[- 7|s|m7]] = [[9|s|p9]]" }
      ],
      how: [
        "Left side: 6x - 2x = [[4x|v]].",
        "Right side: 2x - 2x cancels to 0."
      ],
      tip: {
        rule: "A = B \\implies A - 2x = B - 2x",
        body: "Moving the smaller variable term (2x) keeps the coefficient positive."
      }
    },
    {
      t: "Add 7 to both sides",
      op: "+7 \\text{ on both sides}",
      why: "Undo −7 by adding 7 to both sides.",
      frames: [
        { m: "[[4x|v|lx]] [[- 7|s|m7]] = [[9|s|r9]]", dur: 1450 },
        { m: "[[4x|v|lx]] ~~-7 + 7|c7~~ = [[9 + 7|c|r9]]", dur: 1550 },
        { strike: true, dur: 1600 },
        { m: "[[4x|v|lx]] = [[16|r|r9]]" }
      ],
      how: ["Right side: 9 + 7 = [[16|r]]."]
    },
    {
      t: "Divide both sides by 4",
      op: "\\div 4 \\text{ on both sides}",
      why: "Divide both sides by 4 to isolate [[x|v]].",
      frames: [
        { m: "[[4x|v|lx]] = [[16|r|r16]]", dur: 1450 },
        { m: "\\frac{~~4~~[[x|v|lx]]}{~~4~~} = \\frac{[[16|r|r16]]}{[[4|c|d4]]}", dur: 1550 },
        { strike: true, dur: 1600 },
        { m: "[[x|v|lx]] = [[4|r|r16]]" }
      ],
      final: true,
      how: ["Compute 16 \\div 4 = [[4|r]]."],
      tip: {
        title: "Verify by plugging in x = 4",
        body: "Left: 3(8 − 4) + 5 = 17. Right: 2(4) + 9 = 17. Both sides match."
      }
    }
  ]
});

/* 1.2 Completing the square synced with live parabola graph */
Kit.derive("k-quad", {
  alt: "Completing the square on 2x^2 + 8x - 10 = 0 synced with its parabola graph.",
  given: "Solve by completing the square:",
  legend: [
    { role: "c", label: "Leading coeff a" },
    { role: "g", label: "Squared group" },
    { role: "r", label: "Constant / roots" }
  ],
  graph: {
    alt: "Parabola y = ax^2 + bx + c showing vertex and roots.",
    aspect: 0.68,
    x: { min: -7, max: 3, step: 2, label: "x" },
    y: { min: -20, max: 12, step: 5, label: "y" },
    params: {
      a: { label: "a", min: 0.5, max: 3, step: 0.5, value: 2 },
      b: { label: "b", min: -8, max: 10, step: 1, value: 8 },
      c: { label: "c", min: -14, max: 6, step: 1, value: -10 }
    },
    fns: [{ f: (x, p) => p.a * x * x + p.b * x + p.c, label: "y = ax² + bx + c" }],
    readout: p => {
      const vx = -p.b / (2 * p.a);
      const vy = p.a * vx * vx + p.b * vx + p.c;
      return `vertex (${(Math.round(vx * 10) / 10).toString().replace("-", "−")}, ${(Math.round(vy * 10) / 10).toString().replace("-", "−")})`;
    }
  },
  lines: [
    {
      t: "Start in standard form",
      why: "Identify [[a = 2|c]] before attempting the square-completion shortcut.",
      m: "[[2|c|ca]]x^{2} + 8x - 10 = 0",
      graph: { set: { a: 2, b: 8, c: -10 }, mark: [{ x: p => -p.b / (2 * p.a), label: "vertex" }] },
      tip: {
        watch: "Do not square half of 8 while a = 2 is still in front of x^{2}."
      }
    },
    {
      t: "Divide every term by 2",
      op: "\\div [[2|c]]",
      why: "Divide both sides by 2 so the coefficient of x^{2} becomes 1.",
      frames: [
        { m: "[[2x^{2}|c|q1]] + [[8x|g|q2]] - [[10|s|q3]] = [[0|s|q0]]", dur: 1450 },
        { m: "\\frac{[[2x^{2}|c|q1]]}{2} + \\frac{[[8x|g|q2]]}{2} - \\frac{[[10|s|q3]]}{2} = \\frac{[[0|s|q0]]}{2}", dur: 1700 },
        { m: "[[x^{2}|v|q1]] + [[4x|g|q2]] - [[5|s|q3]] = [[0|s|q0]]" }
      ],
      how: ["Divide 2x^{2}, 8x, -10, and 0 each by 2."],
      graph: { set: { a: 1, b: 4, c: -5 }, mark: [{ x: -2, y: -9, label: "scaled vertex (-2, -9)" }] },
      tip: "Dividing by 2 scales the curve vertically without moving its x-intercepts."
    },
    {
      t: "Add 5 to both sides",
      op: "+5 \\text{ on both sides}",
      why: "Clear room for the constant that completes the square.",
      frames: [
        { m: "[[x^{2} + 4x|g|sq]] [[- 5|s|m5]] = [[0|s|r0]]", dur: 1450 },
        { m: "[[x^{2} + 4x|g|sq]] ~~-5 + 5|c5~~ = [[0 + 5|c|r0]]", dur: 1550 },
        { strike: true, dur: 1600 },
        { m: "[[x^{2} + 4x|g|sq]] = [[5|r|r0]]" }
      ],
      graph: { set: { a: 1, b: 4, c: -5 }, hlines: [{ y: 0, label: "y = 0", at: "left" }] }
    },
    {
      t: "Add (b/2)² = 4 to both sides",
      op: "+(\\frac{4}{2})^{2} = +4",
      why: "Add [[4|r]] to both sides to form a perfect square trinomial.",
      frames: [
        { m: "[[x^{2} + 4x|g|sq]] = [[5|r|r5]]", dur: 1450 },
        { m: "[[x^{2} + 4x + 4|g|sq]] = [[5 + 4|c|r5]]", dur: 1700 },
        { m: "[[(x + 2)^{2}|g|sq]] = [[9|r|r5]]" }
      ],
      how: [
        "Half of 4 is 2; 2^{2} = 4.",
        "Factor x^{2} + 4x + 4 into (x + 2)^{2}."
      ],
      graph: { set: { a: 1, b: 4, c: -5 }, vlines: [{ x: -2, label: "axis x = -2" }] },
      tip: {
        rule: "x^{2} + bx + (\\frac{b}{2})^{2} = (x + \\frac{b}{2})^{2}",
        body: "Vertex form now reads 2(x + 2)^{2} - 18 for the original curve."
      }
    },
    {
      t: "Take ± square root on both sides",
      op: "\\text{Square root both sides } (\\pm)",
      why: "Take both positive and negative square roots of 9.",
      frames: [
        { m: "[[(x + 2)^{2}|g|sq]] = [[9|r|r9]]", dur: 1450 },
        { m: "\\sqrt{[[(x + 2)^{2}|g|sq]]} = \\pm\\sqrt{[[9|r|r9]]}", dur: 1600 },
        { m: "[[x + 2|g|sq]] = [[\\pm 3|r|r9]]" }
      ],
      graph: { dots: [{ x: -5, y: 0, label: "(-5, 0)" }, { x: 1, y: 0, label: "(1, 0)" }] },
      tip: {
        watch: "Dropping the ± misses x = -5."
      }
    },
    {
      t: "Subtract 2 from both sides",
      op: "-2 \\text{ on both sides}",
      why: "Subtract 2 from +3 and from −3 to read both roots.",
      frames: [
        { m: "[[x|v|vx]] [[+ 2|s|p2]] = [[\\pm 3|r|pm3]]", dur: 1450 },
        { m: "[[x|v|vx]] ~~+2 - 2|c2~~ = [[\\pm 3 - 2|c|pm3]]", dur: 1550 },
        { strike: true, dur: 1600 },
        { m: "[[x = 1|r|vx]] \\quad \\text{or} \\quad [[x = -5|r|pm3]]" }
      ],
      final: true,
      how: ["Branch 1: 3 - 2 = 1.", "Branch 2: -3 - 2 = -5."],
      graph: { set: { a: 2, b: 8, c: -10 }, dots: [{ x: -5, y: 0, label: "(-5, 0)" }, { x: 1, y: 0, label: "(1, 0)" }], vlines: [{ x: -2, label: "x = -2" }] }
    }
  ]
});

/* 2.1 Chain rule synced with live tangent line */
Kit.derive("k-chain", {
  alt: "Chain rule derivative of sin(x^2 + 1) synced with its live tangent line.",
  given: "Differentiate and find the tangent slope at [[x_{0} = 1|c]]:",
  legend: [
    { role: "f", label: "Outer function" },
    { role: "g", label: "Inner function u" },
    { role: "r", label: "Final derivative" }
  ],
  graph: {
    alt: "Curve y = sin(x^2 + 1) with moving tangent line.",
    aspect: 0.68,
    x: { min: -2.2, max: 2.2, step: 1, label: "x" },
    y: { min: -1.5, max: 1.5, step: 0.5, label: "y" },
    params: {
      x0: { label: "x₀", min: -1.8, max: 1.8, step: 0.1, value: 1 }
    },
    fns: [{ f: x => Math.sin(x * x + 1), label: "y = sin(x² + 1)" }],
    tangents: [{ x: p => p.x0, len: 0.9, triangle: true, label: "slope = {m}" }],
    readout: p => `f'(${(Math.round(p.x0 * 10) / 10).toString().replace("-", "−")}) = ${(Math.round(2 * p.x0 * Math.cos(p.x0 * p.x0 + 1) * 100) / 100).toString().replace("-", "−")}`
  },
  lines: [
    {
      t: "Spot outer and inner layers",
      why: "Name the outer wrapper [[f(u) = \\sin(u)|f]] and inner expression [[u = x^{2} + 1|g]].",
      m: "y = [[\\sin|f|out]]([[x^{2} + 1|g|in]])",
      graph: { set: { x0: 0 }, tangents: [{ x: p => p.x0, len: 0.9, label: "at x=0, slope={m}" }] },
      tip: "Ask: what operation happens LAST if you plug in a number for x? Here, sine happens last, so sine is outer."
    },
    {
      t: "Differentiate outer, clone inner",
      op: "\\frac{d}{du}(\\sin u) = \\cos u",
      why: "Turn [[\\sin|f]] into [[\\cos|f]], freeze [[x^{2} + 1|g]] inside, and chain its derivative.",
      frames: [
        { m: "[[y|s|lhs]] = [[\\sin|f|out]]([[x^{2} + 1|g|in]])", dur: 1550 },
        { m: "[[\\frac{dy}{dx}|s|lhs]] = [[\\cos|f|out]]([[x^{2} + 1|g|in]]) \\cdot \\frac{d}{dx}([[x^{2} + 1|g|din]])", from: { din: "in" } }
      ],
      graph: { set: { x0: 0.6 }, tangents: [{ x: p => p.x0, len: 0.9, triangle: true, label: "slope = {m}" }] },
      tip: {
        rule: "(f(g(x)))' = f'(g(x)) \\cdot g'(x)",
        watch: "Never write cos(2x) here; the inner argument stays x^{2} + 1."
      }
    },
    {
      t: "Differentiate inner & simplify",
      op: "\\frac{d}{dx}(x^{2} + 1) = 2x",
      why: "Differentiate [[x^{2} + 1|g]] to [[2x|r]] and move it in front.",
      frames: [
        { m: "[[\\frac{dy}{dx}|s|lhs]] = [[\\cos|f|out]]([[x^{2} + 1|g|in]]) \\cdot [[\\frac{d}{dx}(x^{2} + 1)|g|din]]", dur: 1550 },
        { m: "[[\\frac{dy}{dx}|s|lhs]] = [[\\cos|f|out]]([[x^{2} + 1|g|in]]) \\cdot [[2x|r|din]]", dur: 1600 },
        { m: "[[\\frac{dy}{dx}|s|lhs]] = [[2x|r|din]]\\,[[\\cos|f|out]]([[x^{2} + 1|g|in]])" }
      ],
      how: ["Derivative of x^{2} is 2x; derivative of constant 1 is 0."],
      graph: { set: { x0: 1 }, tangents: [{ x: p => p.x0, len: 0.9, triangle: true, label: "x₀={x}, m={m}" }] }
    },
    {
      t: "Evaluate slope at x₀ = 1",
      op: "\\text{plug in } x = 1",
      why: "Substitute x = 1 into the derivative to measure the tangent steepness.",
      frames: [
        { m: "[[f'(1)|s|lhs]] = [[2x|r|din]]\\,[[\\cos|f|out]]([[x^{2} + 1|g|in]])", dur: 1450 },
        { m: "[[f'(1)|s|lhs]] = [[2(1)|r|din]]\\,[[\\cos|f|out]]([[1^{2} + 1|g|in]])", dur: 1600 },
        { m: "[[f'(1)|s|lhs]] = [[2\\cos(2) \\approx -0.83|r|din]]" }
      ],
      final: true,
      graph: { set: { x0: 1 }, tangents: [{ x: p => p.x0, len: 0.9, triangle: true, label: "m ≈ {m}" }] },
      tip: "Because cos(2 radians) is negative, the curve slopes downward at x = 1."
    }
  ]
});

/* 2.2 Definite integral synced with Riemann sum rectangles */
Kit.derive("k-integral", {
  alt: "Definite integral of x^2 from 0 to 3 synced with Riemann sum rectangles.",
  given: "Compute the exact area:",
  legend: [
    { role: "c", label: "Lower limit a" },
    { role: "g", label: "Upper limit b" },
    { role: "f", label: "Integrand" },
    { role: "r", label: "Exact area" }
  ],
  graph: {
    alt: "Riemann rectangles under y = x^2 from x = 0 to 3.",
    aspect: 0.68,
    x: { min: -0.5, max: 3.5, step: 1, label: "x" },
    y: { min: 0, max: 10, step: 2, label: "y" },
    params: {
      n: { label: "Rectangles n", min: 2, max: 30, step: 1, value: 3 }
    },
    fns: [{ f: x => x * x, label: "y = x²" }],
    riemann: [{ from: 0, to: 3, n: p => p.n, mode: "left" }],
    readout: (p, info) => info && info.riemannSum != null ? `n = ${info.riemannN} · Riemann sum = ${(Math.round(info.riemannSum * 100) / 100)} (exact 9)` : "exact area = 9"
  },
  lines: [
    {
      t: "Approximate with n = 3 boxes",
      why: "Start with 3 left-endpoint rectangles on [[0|c]] to [[3|g]].",
      m: "\\int_{[[0|c|la]]}^{[[3|g|ub]]} [[x^{2}|f|fn]]\\dd{x} \\approx (0^{2} + 1^{2} + 2^{2}) \\cdot 1 = [[5|k]]",
      graph: { set: { n: 3 }, riemann: [{ from: 0, to: 3, n: p => p.n, mode: "left" }], shade: [] },
      tip: "Wide rectangles leave large gaps below the rising curve, underestimating 9."
    },
    {
      t: "Refine to n = 12 boxes",
      op: "n: 3 \\to 12",
      why: "Shrinking width \\Delta x shrinks the missing area gaps.",
      m: "\\sum_{k=1}^{12} x_{k}^{2}\\,\\Delta x \\approx [[7.91|k]]",
      graph: { set: { n: 12 }, riemann: [{ from: 0, to: 3, n: p => p.n, mode: "left" }], shade: [] }
    },
    {
      t: "Apply the power rule",
      op: "\\int x^{n}\\dd{x} = \\frac{x^{n+1}}{n+1}",
      why: "Raise the exponent from 2 to 3 and divide by the new power.",
      frames: [
        { m: "\\int_{[[0|c|la]]}^{[[3|g|ub]]} [[x^{2}|f|ant]]\\dd{x}", dur: 1550 },
        { m: "\\Bigl[\\frac{[[x^{2+1}|f|ant]]}{2+1}\\Bigr]_{[[0|c|la]]}^{[[3|g|ub]]}", dur: 1600 },
        { m: "\\Bigl[\\frac{[[x^{3}|f|ant]]}{3}\\Bigr]_{[[0|c|la]]}^{[[3|g|ub]]}" }
      ],
      how: ["Check by differentiating: (\\frac{1}{3} x^{3})' = \\frac{3x^{2}}{3} = x^{2}."],
      graph: { set: { n: 24 }, riemann: [{ from: 0, to: 3, n: p => p.n, mode: "left" }], shade: [] }
    },
    {
      t: "Substitute bounds F(3) − F(0)",
      op: "F(b) - F(a)",
      why: "Plug in upper bound [[3|g]], then subtract lower bound [[0|c]].",
      frames: [
        { m: "\\Bigl[\\frac{x^{3}}{3}\\Bigr]_{[[0|c|la]]}^{[[3|g|ub]]}", dur: 1450 },
        { m: "\\frac{[[3|g|hi]]^{3}}{3} - \\frac{[[0|c|lo]]^{3}}{3}", from: { hi: "ub", lo: "la" }, dur: 1700 },
        { m: "[[\\frac{27}{3} - 0|c|res]]", dur: 1550 },
        { m: "[[9|r|res]]" }
      ],
      final: true,
      how: ["3^{3} = 27, then 27 \\div 3 = 9."],
      graph: { riemann: [], shade: [{ from: 0, to: 3, label: "Exact Area = 9" }] },
      tip: {
        rule: "\\int_{a}^{b} f(x)\\dd{x} = F(b) - F(a)",
        watch: "Always evaluate the top limit first, then subtract the bottom limit."
      }
    }
  ]
});

/* 3.1 Matrix system synced with line intersection & solution vector */
Kit.derive("k-matrix", {
  alt: "Row reduction of 2x + y = 5 and x - y = 1 synced with both lines and solution vector.",
  given: "Solve the linear system:",
  legend: [
    { role: "c", label: "Row 1" },
    { role: "g", label: "Row 2" },
    { role: "r", label: "Solution (2, 1)" }
  ],
  graph: {
    alt: "Two intersecting lines 2x + y = 5 and x - y = 1 meeting at (2, 1).",
    aspect: 0.7,
    x: { min: -1, max: 4, step: 1, label: "x" },
    y: { min: -2, max: 6, step: 1, label: "y" },
    fns: [
      { f: x => 5 - 2 * x, label: "2x + y = 5", color: "var(--c1)" },
      { f: x => x - 1, label: "x − y = 1", color: "var(--c2)" }
    ],
    readout: () => "intersection (2, 1)"
  },
  lines: [
    {
      t: "Write the augmented matrix",
      why: "Write both line equations as rows in a 2×3 matrix.",
      m: "\\begin{bmatrix} [[2|c]] & [[1|c]] & [[5|c]] \\\\ [[1|g]] & [[-1|g]] & [[1|g]] \\end{bmatrix}",
      graph: { show: [0, 1], vectors: [], mark: [] },
      tip: "Each row represents one line on the graph: blue is Row 1, green is Row 2."
    },
    {
      t: "Add Row 1 + Row 2 into Row 1",
      op: "R_{1} \\leftarrow R_{1} + R_{2}",
      why: "Opposite y-entries (+1 and −1) cancel to zero while Row 2 stays unchanged.",
      frames: [
        { m: "\\begin{bmatrix} [[2|c|a1]] & [[1|c|a2]] & [[5|c|a3]] \\\\ [[1|g|b1]] & [[-1|g|b2]] & [[1|g|b3]] \\end{bmatrix}", dur: 1450 },
        { m: "\\begin{bmatrix} [[2+1|c|a1]] & ~~1-1|a2~~ & [[5+1|c|a3]] \\\\ [[1|g|b1]] & [[-1|g|b2]] & [[1|g|b3]] \\end{bmatrix}", dur: 1550 },
        { strike: true, dur: 1550 },
        { m: "\\begin{bmatrix} [[3|c|a1]] & [[0|c|a2]] & [[6|c|a3]] \\\\ [[1|g|b1]] & [[-1|g|b2]] & [[1|g|b3]] \\end{bmatrix}" }
      ],
      how: ["2 + 1 = 3, 1 + (-1) = 0, and 5 + 1 = 6."],
      graph: { show: [0, 1], vlines: [{ x: 2, label: "x = 2" }] }
    },
    {
      t: "Divide Row 1 by 3",
      op: "R_{1} \\leftarrow \\frac{1}{3}R_{1}",
      why: "Divide every entry in Row 1 by 3 to read [[x = 2|r]] directly.",
      frames: [
        { m: "\\begin{bmatrix} [[3|c|a1]] & [[0|c|a2]] & [[6|c|a3]] \\\\ [[1|g|b1]] & [[-1|g|b2]] & [[1|g|b3]] \\end{bmatrix}", dur: 1400 },
        { m: "\\begin{bmatrix} [[\\frac{3}{3}|c|a1]] & [[\\frac{0}{3}|c|a2]] & [[\\frac{6}{3}|c|a3]] \\\\ [[1|g|b1]] & [[-1|g|b2]] & [[1|g|b3]] \\end{bmatrix}", dur: 1600 },
        { m: "\\begin{bmatrix} [[1|r|a1]] & [[0|s|a2]] & [[2|r|a3]] \\\\ [[1|g|b1]] & [[-1|g|b2]] & [[1|g|b3]] \\end{bmatrix} \\implies [[x = 2|r|vx]]" }
      ],
      graph: { show: [0, 1], vlines: [{ x: 2, label: "x = 2" }], mark: [{ x: 2, fn: 0, label: "(2, 1)" }] }
    },
    {
      t: "Back-substitute into Row 2",
      op: "R_{2} \\leftarrow -(R_{2} - R_{1})",
      why: "Eliminate x from Row 2 to isolate [[y = 1|r]].",
      frames: [
        { m: "\\begin{bmatrix} [[1|s|a1]] & [[0|s|a2]] & [[2|r|a3]] \\\\ [[1|g|b1]] & [[-1|g|b2]] & [[1|g|b3]] \\end{bmatrix}", dur: 1450 },
        { m: "\\begin{bmatrix} [[1|s|a1]] & [[0|s|a2]] & [[2|r|a3]] \\\\ ~~1 - 1|b1~~ & [[1|g|b2]] & [[2 - 1|g|b3]] \\end{bmatrix}", dur: 1550 },
        { strike: true, dur: 1550 },
        { m: "\\begin{bmatrix} [[1|s|a1]] & [[0|s|a2]] & [[2|r|a3]] \\\\ [[0|s|b1]] & [[1|r|b2]] & [[1|r|b3]] \\end{bmatrix} \\implies [[(x, y) = (2, 1)|r|sol]]" }
      ],
      final: true,
      how: ["Row 2 gives 2 - y = 1, so y = 1."],
      graph: {
        show: [0, 1],
        vlines: [],
        vectors: [{ from: [0, 0], to: [2, 1], label: "v = (2, 1)", color: "var(--c2)" }],
        dots: [{ x: 2, y: 1, label: "(2, 1)" }]
      },
      tip: "The vector from the origin to (2, 1) points straight to the unique intersection."
    }
  ]
});

/* 3.2 Equation strategy flowchart */
Kit.flow("k-strategy", {
  alt: "Four-stage strategy for decoding complex multi-layer math equations.",
  cols: 4,
  nodes: [
    { t: "1. Domain", sub: "Flag x values that divide by 0", tag: "guard" },
    { t: "2. Deepest Layer", sub: "Clear inner fractions or roots", tag: "peel" },
    { t: "3. Combine", sub: "Collect matching variables & constants" },
    { t: "4. Verify", sub: "Plug result back into original", tag: "check" }
  ],
  steps: [
    { t: "1. Guard the domain", d: "Before cancelling anything, note which values would create division by zero or negative even roots.", on: [0] },
    { t: "2. Clear the deepest layer", d: "Multiply top and bottom by the inner LCD or peel outer wrappers cleanly.", on: [1] },
    { t: "3. Group like terms", d: "Color-coding variables vs constants keeps signs straight when combining terms.", on: [2] },
    { t: "4. Verify in the original", d: "Plug your answer into the untouched starting equation to catch extraneous roots.", on: [3] }
  ]
});
