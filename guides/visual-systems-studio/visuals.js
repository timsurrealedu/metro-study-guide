/* Visual Systems Studio · visuals.js
   Showcases Metro Engine v1.5: semantic continuity across graphs, diagrams, flows, cycles, timelines, bars, and trees. */

/* 1.1 Anatomy of an animated graph with zones, hatched area, tangent triangle, asymptotes, and probe */
Kit.graph("g-anatomy", {
  alt: "Graph of f(x) = 1/(x - 2) + 1 with asymptotes, shaded integral area, tangent line, and target point.",
  aspect: 0.56,
  x: { min: -1, max: 6, step: 1, label: "x" },
  y: { min: -2, max: 5, step: 1, label: "y" },
  fns: [
    {
      f: x => 1 / (x - 2) + 1,
      breaks: [2],
      label: "f(x) = 1/(x−2) + 1",
      role: "f",
      use: "Primary function mapping every valid x (except x = 2) to its output height."
    }
  ],
  zones: [
    {
      x1: 2.2, x2: 5.8,
      label: "Valid right branch",
      role: "g",
      use: "Right-hand region where x > 2 and the curve stays positive above y = 1."
    }
  ],
  vlines: [
    {
      x: 2,
      label: "x = 2",
      at: "bottom",
      asymptote: true,
      role: "k",
      use: "Vertical asymptote: x = 2 makes the denominator zero, so the curve never crosses it."
    }
  ],
  hlines: [
    {
      y: 1,
      label: "y = 1",
      asymptote: true,
      at: "left",
      role: "k",
      use: "Horizontal asymptote: as x grows large, 1/(x−2) shrinks toward 0 so f(x) nears 1."
    }
  ],
  steps: [
    {
      t: "Plot the curve and asymptotes",
      d: "Notice the break at x = 2 and the two dashed rose asymptote boundaries.",
      shade: [],
      tangents: [],
      mark: []
    },
    {
      t: "Pin a target point (3.5, 1.67)",
      d: "The pulsing green dot pins the exact output at x = 3.5 with x and y drop-guides.",
      shade: [],
      tangents: [],
      mark: [
        {
          x: 3.5,
          role: "r",
          label: "(3.5, 1.67)",
          use: "Target evaluation point on the curve at x = 3.5."
        }
      ]
    },
    {
      t: "Measure instantaneous slope",
      d: "The amber dashed tangent and rise/run triangle show the rate of change right at x = 3.5.",
      shade: [],
      tangents: [
        {
          fn: 0,
          x: 3.5,
          len: 1.3,
          triangle: true,
          role: "c",
          label: "slope = {m}",
          use: "Tangent line at x = 3.5 with rise/run triangle measuring slope f'(3.5) ≈ −0.44."
        }
      ],
      mark: []
    },
    {
      t: "Accumulate area from 3 to 5",
      d: "The hatched teal region represents the definite integral from x = 3 to x = 5.",
      shade: [
        {
          fn: 0,
          from: 3,
          to: 5,
          pattern: "hatch",
          role: "g",
          label: "Area ≈ 3.10",
          use: "Definite integral accumulating the area under f(x) between x = 3 and x = 5."
        }
      ],
      tangents: [
        {
          fn: 0,
          x: 3.5,
          len: 1.2,
          triangle: true,
          role: "c",
          label: "m = {m}",
          use: "Tangent slope at x = 3.5."
        }
      ],
      mark: [
        {
          x: 3.5,
          role: "r",
          label: "(3.5, 1.67)",
          use: "Contact point at x = 3.5."
        }
      ]
    }
  ]
});

/* 1.2 Bias-variance trade-off graph with complexity slider & zones */
Kit.graph("g-bias", {
  alt: "Training error vs validation error across model complexity with underfit, sweet spot, and overfit zones.",
  aspect: 0.56,
  x: { min: 1, max: 10, step: 1, label: "Complexity" },
  y: { min: 0, max: 45, step: 10, label: "Error %" },
  params: {
    c: { label: "Model depth", min: 1, max: 9, step: 0.5, value: 5 }
  },
  fns: [
    {
      f: x => 34 * Math.exp(-0.36 * x) + 1.5,
      label: "Training error",
      role: "v",
      use: "Error on data the model already saw; always falls as complexity increases."
    },
    {
      f: x => 1.35 * (x - 5.2) * (x - 5.2) + 8.5,
      label: "Validation error",
      role: "r",
      use: "Error on unseen test data; drops at first, then climbs once overfitting starts."
    }
  ],
  zones: [
    { x1: 1, x2: 3.6, label: "Underfit", role: "v", use: "Too simple: both training and validation errors stay high." },
    { x1: 3.6, x2: 6.8, label: "Sweet spot", role: "r", use: "Balanced complexity where validation error hits its minimum." },
    { x1: 6.8, x2: 10, label: "Overfit", role: "k", use: "Too complex: memorizes training noise while validation error rises." }
  ],
  hlines: [
    { y: 18, label: "18% limit", role: "k", at: "left", use: "Maximum acceptable validation error for deployment." }
  ],
  readout: p => `depth = ${p.c} · val error = ${Math.round((1.35 * (p.c - 5.2) ** 2 + 8.5) * 10) / 10}%`,
  steps: [
    {
      t: "Underfitting zone (depth 2)",
      d: "A shallow model cannot capture curved patterns, so both errors remain high.",
      set: { c: 2 },
      mark: [{ fn: 1, x: p => p.c, role: "v", label: "Val {y}%", use: "Validation error at current depth." }]
    },
    {
      t: "Sweet spot (depth 5)",
      d: "Validation error reaches its lowest valley (~8.6%), well below the 18% limit.",
      set: { c: 5 },
      mark: [{ fn: 1, x: p => p.c, role: "r", label: "Best {y}%", use: "Optimal balance between bias and variance." }]
    },
    {
      t: "Overfitting zone (depth 8.5)",
      d: "Training error drops near 3%, yet validation error jumps past 23% on new data.",
      set: { c: 8.5 },
      mark: [{ fn: 1, x: p => p.c, role: "k", label: "Overfit {y}%", use: "Validation error climbs past the safe limit." }]
    }
  ]
});

/* 1.2 Bar chart with target line & step delta badges */
Kit.bars("b-errors", {
  alt: "Validation error comparison across four model depths with an 18% target threshold.",
  unit: "%",
  max: 34,
  target: { v: 18, label: "18% ceiling", role: "k" },
  bars: [
    { t: "Depth 2", v: 22, role: "v", use: "Too simple: misses key curved relationships." },
    { t: "Depth 5", v: 9, role: "r", use: "Best generalization, comfortably below the 18% ceiling." },
    { t: "Depth 7", v: 14, role: "c", use: "Slightly noisier than depth 5, still acceptable." },
    { t: "Depth 9", v: 28, role: "k", use: "Severe overfitting exceeds the 18% ceiling." }
  ],
  steps: [
    { t: "Baseline shallow model", d: "Depth 2 starts at 22% error, above the 18% deployment limit.", v: [22, null, null, null], hi: [0] },
    { t: "Tune to the sweet spot", d: "Moving to depth 5 slashes error down to 9%.", v: [22, 9, null, null], hi: [1] },
    { t: "Push past optimal depth", d: "Depth 7 creeps up to 14%, warning that complexity is rising.", v: [22, 9, 14, null], hi: [2] },
    { t: "Overfitting penalty", d: "Depth 9 balloons to 28%, breaching the rose ceiling line.", v: [22, 9, 14, 28], hi: [3] }
  ]
});

/* 2.1 Architecture diagram with interactive parts & semantic colors */
Kit.diagram("d-arch", {
  alt: "Four-layer API request architecture connecting Client, Gateway, Cache, and Database.",
  vb: "0 0 620 276",
  parts: {
    client: { label: "Client App", role: "v", swatch: "box", use: "Sends HTTPS requests and displays the final JSON response." },
    gateway: { label: "API Gateway", role: "c", swatch: "dia", use: "Verifies JWT auth tokens and enforces rate limits before routing." },
    cache: { label: "Memory Cache", role: "r", swatch: "box", use: "Returns hot repeated queries in ~2 ms without touching disk." },
    db: { label: "Database", role: "f", swatch: "box", use: "Stores durable records on disk and answers cache-miss queries (~45 ms)." }
  },
  svg: `${V.arrow("da-arr")}
    <g class="k-feat" data-part="client">
      <rect x="20" y="96" width="124" height="84" rx="14" class="k-node" style="stroke:var(--m-v);stroke-width:2"/>
      <text x="82" y="132" text-anchor="middle" class="k-t" style="fill:var(--m-v)">Client App</text>
      <text x="82" y="154" text-anchor="middle" class="k-s">Browser / Mobile</text>
    </g>
    <path class="k-edge done" style="stroke:var(--m-v)" d="M144,138 H194" marker-end="url(#da-arr)"/>
    <g class="k-feat" data-part="gateway">
      <rect x="200" y="96" width="132" height="84" rx="14" class="k-node" style="stroke:var(--m-c);stroke-width:2"/>
      <text x="266" y="132" text-anchor="middle" class="k-t" style="fill:var(--m-c)">API Gateway</text>
      <text x="266" y="154" text-anchor="middle" class="k-s">Auth &amp; Rate Limit</text>
    </g>
    <path class="k-edge done" style="stroke:var(--m-r)" d="M332,120 L404,74" marker-end="url(#da-arr)"/>
    <path class="k-edge done" style="stroke:var(--m-f)" d="M332,156 L404,202" marker-end="url(#da-arr)"/>
    <g class="k-feat" data-part="cache">
      <rect x="410" y="24" width="186" height="84" rx="14" class="k-node" style="stroke:var(--m-r);stroke-width:2"/>
      <text x="503" y="58" text-anchor="middle" class="k-t" style="fill:var(--m-r)">Memory Cache</text>
      <text x="503" y="80" text-anchor="middle" class="k-s">Fast Hit (~2 ms)</text>
    </g>
    <g class="k-feat" data-part="db">
      <rect x="410" y="168" width="186" height="84" rx="14" class="k-node" style="stroke:var(--m-f);stroke-width:2"/>
      <text x="503" y="202" text-anchor="middle" class="k-t" style="fill:var(--m-f)">Database</text>
      <text x="503" y="224" text-anchor="middle" class="k-s">Disk Miss (~45 ms)</text>
    </g>
    <path class="k-edge todo" style="stroke:var(--m-f)" d="M503,168 V114" marker-end="url(#da-arr)"/>
    <text data-label="hit" x="358" y="82" text-anchor="middle" class="k-s k-halo" style="fill:var(--m-r)">Hit</text>
    <text data-label="miss" x="358" y="204" text-anchor="middle" class="k-s k-halo" style="fill:var(--m-f)">Miss</text>`,
  steps: [
    { t: "Client sends request", d: "The browser or app sends an HTTPS request into the backend.", focus: ["client"] },
    { t: "Gateway checks auth", d: "The amber API Gateway validates tokens before letting traffic reach storage.", focus: ["client", "gateway"] },
    { t: "Cache hit fast path", d: "If the key is already in Memory Cache, the server answers in ~2 ms.", focus: ["gateway", "cache"], labels: ["hit"] },
    { t: "Database miss fallback", d: "On a miss, the Database loads durable data and warms the cache for next time.", focus: ["gateway", "db", "cache"], labels: ["miss"] }
  ]
});

/* 2.1 Branching flowchart with node kinds, semantic edge pills & clickable stages */
Kit.flow("f-request", {
  alt: "Branching flowchart showing request intake, auth gate, cache lookup, database query, and error exit.",
  cols: 3,
  nodes: [
    { id: "in", t: "Receive Request", sub: "Parse URL & headers", kind: "input", role: "v", use: "Accepts raw HTTP request parameters from the client." },
    { id: "auth", t: "Valid Token?", sub: "Verify JWT signature", kind: "decision", role: "c", use: "Branches based on whether the caller holds a valid, unexpired token." },
    { id: "err", t: "401 Auth Error", sub: "Reject & log attempt", kind: "error", role: "k", tag: "abort", use: "Immediately stops unauthorized requests so protected data stays safe." },
    { id: "cache", t: "Cache Hit?", sub: "Check Redis key", kind: "decision", role: "c", use: "Tests whether the computed payload is already sitting in fast RAM." },
    { id: "db", t: "Query Database", sub: "Fetch & warm cache", kind: "process", role: "f", use: "Runs the SQL query on persistent storage when the cache misses." },
    { id: "ok", t: "200 JSON Response", sub: "Return payload", kind: "output", role: "r", tag: "done", use: "Sends the verified data back to the client." }
  ],
  edges: [
    ["in", "auth", "inspect"],
    ["auth", "err", "No"],
    ["auth", "cache", "Yes"],
    ["cache", "ok", "Yes"],
    ["cache", "db", "No"],
    ["db", "ok", "store"]
  ],
  steps: [
    { t: "1. Parse incoming request", d: "Read headers and route parameters from the client.", on: ["in"] },
    { t: "2. Check token at Auth Gate", d: "Invalid tokens take the rose No branch to 401 Auth Error.", on: ["auth", "err"] },
    { t: "3. Check fast memory cache", d: "Valid tokens pass the green Yes branch to inspect the cache.", on: ["cache"], upTo: "auth" },
    { t: "4. Cache miss queries database", d: "On No, fetch from disk and cache the result for later.", on: ["db"], upTo: "cache" },
    { t: "5. Deliver 200 JSON response", d: "Return the response to the client from either cache or DB.", on: ["ok"], upTo: "db" }
  ]
});

/* 2.2 Feedback cycle with semantic stage roles & arc pills */
Kit.cycle("cy-train", {
  alt: "Four-stage iterative machine learning training cycle.",
  center: { t: "Training Loop", sub: "repeats every batch" },
  nodes: [
    { t: "Forward Pass", sub: "Predict from weights", role: "v", use: "Feeds input features through the layers to produce predictions." },
    { t: "Measure Loss", sub: "Compare vs. truth", role: "k", use: "Computes how far predictions landed from the true labels." },
    { t: "Backprop Gradients", sub: "Find blame per weight", role: "f", use: "Applies the chain rule backward to score each weight's gradient." },
    { t: "Update Weights", sub: "Step downhill", role: "r", use: "Nudges weights opposite the gradient so the next batch improves." }
  ],
  edges: ["predict", "error", "chain rule", "next batch"],
  steps: [
    { t: "1. Forward Pass", d: "Run inputs through current weights to make a prediction.", on: [0] },
    { t: "2. Measure Loss", d: "Score prediction error against ground truth.", on: [1] },
    { t: "3. Backpropagate", d: "Trace gradients back to every parameter.", on: [2] },
    { t: "4. Update & Repeat", d: "Adjust weights and loop straight into the next batch.", on: [3], all: true, loop: true }
  ]
});

/* 2.2 Time-scaled timeline with progress fill & role markers */
Kit.timeline("tl-ml", {
  alt: "Time-scaled milestones in machine learning from 1957 to 2026.",
  scale: "time",
  events: [
    { date: "1957", t: "Perceptron", sub: "Linear threshold unit", role: "v", tag: "Foundations", use: "Early single-layer linear classifier by Frank Rosenblatt." },
    { date: "1986", t: "Backprop & Trees", sub: "ID3 & multi-layer nets", role: "c", tag: "Algorithms", use: "Popularized backpropagation and Information Gain decision trees." },
    { date: "1997", t: "Deep Blue & LSTM", sub: "Search + memory gates", role: "f", tag: "Scale", use: "Showed alpha-beta search at grandmaster level and gated sequence memory." },
    { date: "2017", t: "Transformers", sub: "Self-attention", role: "g", tag: "Architecture", use: "Replaced recurrence with parallel self-attention across tokens." },
    { date: "2026", t: "Interactive Agents", sub: "Multimodal reasoning", role: "r", tag: "Modern", use: "Combines tools, verification, and visual synthesis." }
  ],
  steps: [
    { t: "1957 · Linear foundations", d: "The Perceptron proved machines could learn linear weights from examples.", on: [0] },
    { t: "1986 · Trees & Backprop", d: "ID3 split tables by entropy while backprop trained multi-layer networks.", on: [1] },
    { t: "1997 · Search & Gated Memory", d: "Adversarial game trees and LSTMs pushed search and sequence modeling.", on: [2] },
    { t: "2017 · Attention architecture", d: "Transformers scaled training across massive parallel hardware.", on: [3] },
    { t: "2026 · Modern synthesis", d: "Visual and tool-using systems connect equations, code, and diagrams.", on: [4], all: true }
  ]
});

/* 3.1 ID3 Decision Tree (Kit.tree) */
Kit.tree("tr-id3", {
  alt: "ID3 decision tree deciding whether to play tennis based on Outlook, Humidity, and Wind.",
  root: {
    id: "root",
    t: "Outlook?",
    sub: "IG = 0.25 bits",
    tag: "best root",
    kind: "root",
    role: "c",
    use: "Chosen as root because Outlook delivers the highest Information Gain across all 14 training days.",
    children: [
      {
        id: "sunny",
        edge: "Sunny",
        edgeRole: "c",
        t: "Humidity?",
        sub: "5 days (2Y / 3N)",
        kind: "decision",
        role: "c",
        use: "Sunny days are still mixed, so Humidity splits them cleanly into High vs. Normal.",
        children: [
          { id: "sh", edge: "High", edgeRole: "k", t: "Play = No", sub: "3 / 3 pure", kind: "leaf", role: "k", use: "High humidity on sunny days predicts No." },
          { id: "sn", edge: "Normal", edgeRole: "r", t: "Play = Yes", sub: "2 / 2 pure", kind: "leaf", role: "r", use: "Normal humidity on sunny days predicts Yes." }
        ]
      },
      {
        id: "over",
        edge: "Overcast",
        edgeRole: "r",
        t: "Play = Yes",
        sub: "4 / 4 pure",
        tag: "H = 0",
        kind: "leaf",
        role: "r",
        use: "Overcast days have zero entropy (all 4 days are Yes), stopping immediately as a pure leaf."
      },
      {
        id: "rain",
        edge: "Rain",
        edgeRole: "a",
        t: "Wind?",
        sub: "5 days (3Y / 2N)",
        kind: "decision",
        role: "c",
        use: "Rainy days split cleanly by whether Wind is Strong or Weak.",
        children: [
          { id: "rs", edge: "Strong", edgeRole: "k", t: "Play = No", sub: "2 / 2 pure", kind: "leaf", role: "k", use: "Strong wind in rain predicts No." },
          { id: "rw", edge: "Weak", edgeRole: "r", t: "Play = Yes", sub: "3 / 3 pure", kind: "leaf", role: "r", use: "Weak wind in rain predicts Yes." }
        ]
      }
    ]
  },
  steps: [
    { t: "Pick root: Outlook (IG = 0.25)", d: "Outlook reduces entropy the most, so it sits at the root.", on: ["root"], reveal: ["root"] },
    { t: "Overcast yields an instant leaf", d: "All 4 Overcast days are Yes (H = 0), so that branch terminates cleanly.", on: ["over"], reveal: ["root", "sunny", "over", "rain"], visit: ["root", "over"] },
    { t: "Split Sunny on Humidity", d: "Sunny splits into High → No and Normal → Yes.", on: ["sn"], reveal: ["root", "sunny", "over", "rain", "sh", "sn"], visit: ["root", "sunny", "sh", "sn"] },
    { t: "Split Rain on Wind (full tree)", d: "Rain splits into Strong → No and Weak → Yes. Hover any node to trace its path.", on: ["rw"], reveal: "all", visit: ["root", "over", "sunny", "sh", "sn", "rain", "rs", "rw"] }
  ]
});

/* 3.1 Photomath-style Kit.derive for Information Gain matching the tree roles */
Kit.derive("kd-ig", {
  alt: "Step-by-step Information Gain calculation for the Outlook root split.",
  given: "Compute [[IG(S, Outlook)|c]] from 9 Yes and 5 No days:",
  legend: [
    { role: "v", label: "Total set S (14)" },
    { role: "r", label: "Positive / Gain" },
    { role: "k", label: "Negative / Penalty" },
    { role: "c", label: "Weighted Entropy" }
  ],
  lines: [
    {
      t: "Compute parent entropy H(S)",
      why: "Score overall uncertainty across [[9|r]] Yes and [[5|k]] No days out of [[14|v]].",
      frames: [
        { m: "H([[S|v|s0]]) = -\\frac{[[9|r|p9]]}{[[14|v|d1]]}\\log_{2}\\frac{9}{14} - \\frac{[[5|k|n5]]}{[[14|v|d2]]}\\log_{2}\\frac{5}{14}", dur: 1550 },
        { m: "H([[S|v|s0]]) \\approx [[0.94|c|hs]]\\text{ bits}" }
      ],
      how: ["9/14 ≈ 0.643 and 5/14 ≈ 0.357.", "−0.643·log₂(0.643) − 0.357·log₂(0.357) ≈ 0.94 bits."],
      tip: { rule: "H(S) = -p_{+} \\log_{2} p_{+} - p_{-} \\log_{2} p_{-}", body: "1.0 bit means a 50/50 coin flip; 0 bits means pure agreement." }
    },
    {
      t: "Compute weighted child entropy",
      op: "\\sum \\frac{|S_{v}|}{|S|} H(S_{v})",
      why: "Overcast has [[0|r]] entropy, while Sunny and Rain each carry 0.97 bits.",
      frames: [
        { m: "\\text{Child } H = \\frac{[[5|c|s5]]}{14}(0.97) + \\frac{[[4|r|o4]]}{14}([[0|r|hz]]) + \\frac{[[5|c|r5]]}{14}(0.97)", dur: 1600 },
        { m: "\\text{Child } H = [[0.346|c|s5]] + ~~0|hz~~ + [[0.346|c|r5]]", dur: 1500 },
        { strike: true, dur: 1500 },
        { m: "\\text{Child } H \\approx [[0.69|c|hc]]\\text{ bits}" }
      ],
      how: ["Overcast is pure (4 Yes, 0 No), contributing 0 uncertainty."]
    },
    {
      t: "Subtract to find Information Gain",
      op: "H(S) - \\text{Child } H",
      why: "Subtract remaining child entropy from parent entropy to measure uncertainty removed.",
      frames: [
        { m: "[[IG|c|ig]] = [[0.94|v|hs]] - [[0.69|c|hc]]", dur: 1450 },
        { m: "[[IG(S, Outlook) = 0.25|r|ig]]\\text{ bits}" }
      ],
      final: true,
      how: ["0.94 − 0.69 = 0.25 bits, beating Humidity (0.15) and Wind (0.05)."]
    }
  ]
});

/* 3.2 Minimax Tree with Alpha-Beta Pruning (Kit.tree) */
Kit.tree("tr-ab", {
  alt: "Minimax game tree showing MAX root, MIN children, and Alpha-Beta pruning of a suboptimal subtree.",
  root: {
    id: "max",
    t: "MAX Root",
    sub: "α = −∞ → 4",
    tag: "pick 4",
    kind: "root",
    role: "r",
    use: "MAX picks the highest score guaranteed by its MIN children.",
    children: [
      {
        id: "min1",
        edge: "Left move",
        edgeRole: "r",
        t: "MIN (Left)",
        sub: "min(4, 7) = 4",
        kind: "decision",
        role: "c",
        use: "Evaluates both leaves and guarantees MAX a score of 4, lifting α to 4.",
        children: [
          { id: "l1", edge: "a", edgeRole: "r", t: "Score = 4", kind: "leaf", role: "r", use: "Chosen by MIN because 4 < 7; becomes MAX's best guaranteed score α = 4." },
          { id: "l2", edge: "b", t: "Score = 7", kind: "leaf", role: "v", use: "Ignored by MIN because 7 > 4." }
        ]
      },
      {
        id: "min2",
        edge: "Right move",
        edgeRole: "k",
        t: "MIN (Right)",
        sub: "β = 2 ≤ α (4)",
        kind: "decision",
        role: "c",
        use: "First child scores 2, proving MIN can hold MAX to ≤ 2—worse than α = 4.",
        children: [
          { id: "r1", edge: "c", edgeRole: "k", t: "Score = 2", sub: "triggers cutoff", kind: "leaf", role: "k", use: "Because 2 ≤ α (4), MAX will never pick Right move." },
          { id: "r2", edge: "d (cut)", edgeRole: "k", t: "Score = 9?", sub: "never evaluated", tag: "pruned", kind: "leaf", role: "k", use: "Pruned by Alpha-Beta! Even though its hidden score is 9, MIN would still force ≤ 2." }
        ]
      }
    ]
  },
  steps: [
    { t: "Explore Left MIN branch", d: "MIN checks 4 and 7, returning min(4, 7) = 4. MAX now guarantees α = 4.", on: ["min1", "l1"], visit: ["max", "min1", "l1", "l2"] },
    { t: "Right MIN sees 2 ≤ α (4)", d: "MIN's first leaf is 2, so this branch can never return more than 2.", on: ["r1"], visit: ["max", "min1", "l1", "l2", "min2", "r1"] },
    { t: "Prune remaining leaf (β ≤ α)", d: "Leaf d is slashed and skipped! MAX selects the green Left move with optimal score 4.", on: ["min1", "l1"], visit: ["max", "min1", "l1", "l2", "min2", "r1"], prune: ["r2"], path: ["max", "min1", "l1"] }
  ]
});

Kit.tree("tr-sdd", {
  alt: "Annotated L-attributed parse tree with synthesized and inherited dependency arrows for 7 + (8 / 2) = 11.",
  compact: true,
  root: {
    id: "A0", t: "A", kind: "nt", order: 5,
    attrs: [{ k: "val", v: "11", role: "r", at: 4 }],
    use: "Top nonterminal A receives the final synthesized result C₁.s = 11.",
    children: [
      {
        id: "B0", t: "B", kind: "nt", order: 2,
        attrs: [{ k: "val", v: "7", role: "r", at: 1 }],
        use: "Left factor B synthesizes 7 from D and tail E, then supplies B.val = 7.",
        children: [
          {
            id: "D0", t: "D", kind: "nt", order: 1,
            attrs: [{ k: "val", v: "7", role: "r", at: 0 }],
            use: "Leaf factor D copies token value 7 upward.",
            children: [{ id: "n7", t: "num:7", kind: "term" }]
          },
          {
            id: "E0", t: "E", kind: "nt",
            attrs: [{ k: "i", v: "7", role: "c", at: 1 }, { k: "s", v: "7", role: "r", at: 1 }],
            use: "Empty tail E → ε copies inherited i = 7 straight into synthesized s = 7.",
            children: [{ id: "eps0", t: "ε", kind: "term", role: "a" }]
          }
        ]
      },
      {
        id: "C0", t: "C", kind: "nt", order: 5,
        attrs: [{ k: "i", v: "7", role: "c", at: 1 }, { k: "s", v: "11", role: "r", at: 4 }],
        use: "Addition tail C gets inherited i = 7 from B.val and returns total s = 11.",
        children: [
          { id: "plus", t: "+", kind: "term" },
          {
            id: "B1", t: "B", kind: "nt", order: 4,
            attrs: [{ k: "val", v: "4", role: "r", at: 3 }],
            use: "Right addend B evaluates the parenthesized group (8 / 2) = 4.",
            children: [
              {
                id: "D1", t: "D", kind: "nt", order: 4,
                attrs: [{ k: "val", v: "4", role: "r", at: 3 }],
                use: "Parenthesized factor D forwards inner A.val = 4.",
                children: [
                  { id: "lp", t: "(", kind: "term" },
                  {
                    id: "A1", t: "A", kind: "nt", order: 4,
                    attrs: [{ k: "val", v: "4", role: "r", at: 3 }],
                    use: "Inner A equals inner C.s = 4.",
                    children: [
                      {
                        id: "B2", t: "B", kind: "nt", order: 3,
                        attrs: [{ k: "val", v: "4", role: "r", at: 2 }],
                        use: "Inner product subtree computes 8 / 2 = 4.",
                        children: [
                          {
                            id: "D2", t: "D", kind: "nt", order: 3,
                            attrs: [{ k: "val", v: "8", role: "r", at: 2 }],
                            use: "Dividend factor D reads 8.",
                            children: [{ id: "n8", t: "num:8", kind: "term" }]
                          },
                          {
                            id: "E1", t: "E", kind: "nt", order: 3,
                            attrs: [{ k: "i", v: "8", role: "c", at: 2 }, { k: "s", v: "4", role: "r", at: 2 }],
                            use: "Division node E takes dividend i = 8 and bubbles up quotient s = 4.",
                            children: [
                              { id: "div", t: "/", kind: "term" },
                              {
                                id: "D3", t: "D", kind: "nt",
                                attrs: [{ k: "val", v: "2", role: "r", at: 2 }],
                                use: "Divisor D reads 2.",
                                children: [{ id: "n2", t: "num:2", kind: "term" }]
                              },
                              {
                                id: "E2", t: "E", kind: "nt",
                                attrs: [{ k: "i", v: "4", role: "c", at: 2 }, { k: "s", v: "4", role: "r", at: 2 }],
                                use: "Tail division node computes i = 8 / 2 = 4, then returns s = 4.",
                                children: [{ id: "eps1", t: "ε", kind: "term", role: "a" }]
                              }
                            ]
                          }
                        ]
                      },
                      {
                        id: "C1", t: "C", kind: "nt",
                        attrs: [{ k: "i", v: "4", role: "c", at: 3 }, { k: "s", v: "4", role: "r", at: 3 }],
                        use: "Inner tail C → ε echoes i = 4 to s = 4.",
                        children: [{ id: "eps2", t: "ε", kind: "term", role: "a" }]
                      }
                    ]
                  },
                  { id: "rp", t: ")", kind: "term" }
                ]
              },
              {
                id: "E3", t: "E", kind: "nt",
                attrs: [{ k: "i", v: "4", role: "c", at: 3 }, { k: "s", v: "4", role: "r", at: 3 }],
                use: "Outer tail E → ε copies 4 from D₁.val.",
                children: [{ id: "eps3", t: "ε", kind: "term", role: "a" }]
              }
            ]
          },
          {
            id: "C2", t: "C", kind: "nt", order: 5,
            attrs: [{ k: "i", v: "11", role: "c", at: 4 }, { k: "s", v: "11", role: "r", at: 4 }],
            use: "Tail addition node adds C₀.i + B₁.val = 7 + 4 = 11 and terminates at ε.",
            children: [{ id: "eps4", t: "ε", kind: "term", role: "a" }]
          }
        ]
      }
    ]
  },
  deps: [
    { id: "d1", from: "n7", to: "D0.val", kind: "syn", label: "7" },
    { id: "d2", from: "D0.val", to: "E0.i", kind: "inh", label: "7" },
    { id: "d3", from: "E0.s", to: "B0.val", kind: "syn", label: "7" },
    { id: "d4", from: "B0.val", to: "C0.i", kind: "inh", label: "i=7" },
    { id: "d5", from: "D2.val", to: "E1.i", kind: "inh", label: "8" },
    { id: "d6", from: "E1.i", to: "E2.i", kind: "inh", label: "8/2=4" },
    { id: "d7", from: "E2.s", to: "B2.val", kind: "syn", label: "4" },
    { id: "d8", from: "B2.val", to: "C1.i", kind: "inh", label: "4" },
    { id: "d9", from: "C1.s", to: "A1.val", kind: "syn", label: "4" },
    { id: "d10", from: "A1.val", to: "D1.val", kind: "syn", label: "4" },
    { id: "d11", from: "D1.val", to: "E3.i", kind: "inh", label: "4" },
    { id: "d12", from: "E3.s", to: "B1.val", kind: "syn", label: "4" },
    { id: "d13", from: "B1.val", to: "C2.i", kind: "inh", label: "7+4=11" },
    { id: "d14", from: "C2.s", to: "C0.s", kind: "syn", label: "11" },
    { id: "d15", from: "C0.s", to: "A0.val", kind: "syn", label: "11" }
  ],
  steps: [
    { t: "1. Synthesize left factor num = 7", d: "D reads token 7 upward into D.val = 7 before passing it rightward.", on: ["D0", "n7"], deps: ["d1"], order: 0 },
    { t: "2. Pass inherited 7 across B → C", d: "E → ε reflects i = 7 to B.val = 7, which seeds C.i = 7 along the dashed amber arrow.", on: ["E0", "B0", "C0"], deps: ["d2", "d3", "d4"], doneDeps: ["d1"], order: 2 },
    { t: "3. Divide inside parenthesis: 8 / 2 = 4", d: "Inner E carries dividend 8 rightward, divides by D.val = 2 to get E₁.i = 4, and sends 4 back up.", on: ["D2", "E1", "D3", "E2", "B2"], deps: ["d5", "d6", "d7"], doneDeps: ["d1", "d2", "d3", "d4"], order: 3 },
    { t: "4. Unwrap (8 / 2) = 4 to right addend B", d: "Synthesized result 4 propagates from C → A → D → E → B, completing the right operand.", on: ["C1", "A1", "D1", "E3", "B1"], deps: ["d8", "d9", "d10", "d11", "d12"], doneDeps: ["d1", "d2", "d3", "d4", "d5", "d6", "d7"], order: 4 },
    { t: "5. Sum 7 + 4 = 11 up to root A", d: "Tail C₂ merges inherited 7 with B.val = 4 to get 11, then synthesizes 11 up to A.val.", on: ["C2", "C0", "A0"], deps: ["d13", "d14", "d15"], doneDeps: ["d1", "d2", "d3", "d4", "d5", "d6", "d7", "d8", "d9", "d10", "d11", "d12"], order: 5 },
    { t: "6. Complete annotated parse tree: 7 + (8 / 2) = 11", d: "Zoomed out to show all 15 inherited (amber) and synthesized (green) edges linking every leaf to A.val = 11.", overview: true, on: ["A0"], doneDeps: ["d1", "d2", "d3", "d4", "d5", "d6", "d7", "d8", "d9", "d10", "d11", "d12", "d13", "d14", "d15"], order: 5 }
  ]
});

Kit.dag("dag-expr", {
  alt: "Expression DAG for a + a*(b - c) + (b - c)*d sharing (b - c) and a.",
  nodes: [
    { id: "addT", t: "+ (root)", sub: "final sum", role: "r", use: "Combines left term and right product into the complete expression." },
    { id: "addL", t: "+", sub: "a + term₁", role: "c", use: "Adds leaf a with shared product a*(b - c)." },
    { id: "mul2", t: "*", sub: "(b - c) * d", role: "c", use: "Reuses the already-built (b - c) node and multiplies by d." },
    { id: "mul1", t: "*", sub: "a * (b - c)", role: "c", use: "Multiplies reused leaf a by shared difference (b - c)." },
    { id: "sub", t: "- (shared)", sub: "b - c", tag: "×2 reuse", shared: true, role: "f", use: "Shared node with 2 parents: evaluated once instead of duplicating a subtree." },
    { id: "a", t: "a", sub: "input (×2)", shared: true, role: "v", use: "Shared variable leaf referenced by both + and *." },
    { id: "b", t: "b", sub: "input", role: "v", use: "Variable leaf b." },
    { id: "c", t: "c", sub: "input", role: "v", use: "Variable leaf c." },
    { id: "d", t: "d", sub: "input", role: "v", use: "Variable leaf d." }
  ],
  edges: [
    { id: "e1", from: "addT", to: "addL", label: "L" },
    { id: "e2", from: "addT", to: "mul2", label: "R" },
    { id: "e3", from: "addL", to: "a", label: "reuse a", role: "v" },
    { id: "e4", from: "addL", to: "mul1" },
    { id: "e5", from: "mul1", to: "a" },
    { id: "e6", from: "mul1", to: "sub", label: "shared", role: "f" },
    { id: "e7", from: "mul2", to: "sub", label: "shared", role: "f" },
    { id: "e8", from: "mul2", to: "d" },
    { id: "e9", from: "sub", to: "b" },
    { id: "e10", from: "sub", to: "c" }
  ],
  steps: [
    { t: "1. Start at root sum +", d: "Top operator divides the expression into two main sub-terms anchored at addT.", on: ["addT"], reveal: ["addT", "addL", "mul2"], edges: ["e1", "e2"] },
    { t: "2. Expand left branch with skip-edge to a", d: "Left + points straight to input a and product mul1.", on: ["addL", "mul1"], reveal: ["addT", "addL", "mul2", "mul1", "a"], visit: ["addT"], edges: ["e3", "e4", "e5"] },
    { t: "3. Converge on double-halo shared (b - c)", d: "Both mul1 and mul2 point to the single shared minus node instead of cloning a subtree.", on: ["sub"], reveal: ["addT", "addL", "mul2", "mul1", "a", "sub"], visit: ["addT", "addL", "mul1"], edges: ["e6", "e7"] },
    { t: "4. Anchor shared leaves a, b, c, d", d: "All variable leaves resolve cleanly with zero duplicate subtrees anywhere in memory.", on: ["a", "b", "c", "d"], reveal: "all", visit: ["addT", "addL", "mul1", "mul2", "sub"], edges: ["e8", "e9", "e10"] },
    { t: "5. Complete expression DAG overview", d: "Zoomed out to view the entire 9-node DAG, skip-layer corridor edge to a, and shared double halos.", overview: true, reveal: "all", on: ["addT", "sub", "a"], visit: ["addL", "mul1", "mul2", "b", "c", "d"], edges: ["e1", "e2", "e3", "e6", "e7"] }
  ]
});
