/* Algorithms & Complexity Studio · visuals.js
   Showcases Metro Engine v1.6: mobile zoom trees, Kit.dp, Kit.network, Kit.trim, Kit.venn, Kit.dag, Kit.flow, Kit.derive. */

/* 1.1 Recursion Tree O(2^n) vs Memoization DAG O(n) */
Kit.tree("tr-memo", {
  alt: "Recursion tree for fib(4) showing repeated calls collapsing into a linear Memoization DAG.",
  compact: true,
  root: {
    id: "f4", t: "fib(4)", sub: "root call", kind: "root", role: "c",
    use: "Top-level call spawns fib(3) and fib(2).",
    children: [
      {
        id: "f3", t: "fib(3)", edge: "n−1", kind: "decision", role: "c",
        use: "Evaluates fib(2) and fib(1).",
        children: [
          {
            id: "f2a", t: "fib(2)", edge: "n−1", kind: "decision", role: "v",
            use: "First time fib(2) is computed.",
            children: [
              { id: "f1a", t: "fib(1)=1", kind: "leaf", role: "r" },
              { id: "f0a", t: "fib(0)=0", kind: "leaf", role: "r" }
            ]
          },
          { id: "f1b", t: "fib(1)=1", edge: "n−2", kind: "leaf", role: "k", use: "Duplicate call to fib(1)!" }
        ]
      },
      {
        id: "f2b", t: "fib(2)", edge: "n−2", kind: "decision", role: "k",
        use: "Duplicate subtree fib(2) repeated from scratch!",
        children: [
          { id: "f1c", t: "fib(1)=1", kind: "leaf", role: "k", use: "Repeated fib(1) call." },
          { id: "f0b", t: "fib(0)=0", kind: "leaf", role: "k", use: "Repeated fib(0) call." }
        ]
      }
    ]
  },
  steps: [
    { t: "1. Expand fib(4) → fib(3) + fib(2)", d: "Recursion splits into two branches; fib(2) appears on the right.", on: ["f4", "f3", "f2b"], reveal: ["f4", "f3", "f2b"] },
    { t: "2. Left branch computes fib(2) first", d: "Inside fib(3), we solve fib(2) = fib(1) + fib(0) = 1.", on: ["f2a", "f1a", "f0a"], reveal: ["f4", "f3", "f2b", "f2a", "f1a", "f0a", "f1b"] },
    { t: "3. Right branch repeats fib(2) from scratch!", d: "Without caching, every red node is recomputed exponentially (O(2ⁿ)).", on: ["f2b", "f1c", "f0b"], reveal: "all", overview: true }
  ],
  memo: {
    treeLabel: "Recursion Tree O(2ⁿ)",
    dagLabel: "Memoization DAG O(n)",
    alt: "Collapsed Memoization DAG for fib(4) with shared cached nodes.",
    nodes: [
      { id: "f4", t: "fib(4) = 3", role: "r", use: "Adds cached fib(3) + cached fib(2)." },
      { id: "f3", t: "fib(3) = 2", role: "c", use: "Adds cached fib(2) + cached fib(1)." },
      { id: "f2", t: "fib(2) = 1", shared: true, tag: "cached ×2", role: "f", use: "Computed once and reused by both fib(4) and fib(3)!" },
      { id: "f1", t: "fib(1) = 1", shared: true, tag: "base", role: "v", use: "Base case reused twice." },
      { id: "f0", t: "fib(0) = 0", role: "v", use: "Base case 0." }
    ],
    edges: [
      { id: "e1", from: "f4", to: "f3" },
      { id: "e2", from: "f4", to: "f2", label: "cache hit", role: "f" },
      { id: "e3", from: "f3", to: "f2", label: "compute", role: "f" },
      { id: "e4", from: "f3", to: "f1", label: "cache hit", role: "v" },
      { id: "e5", from: "f2", to: "f1" },
      { id: "e6", from: "f2", to: "f0" }
    ],
    steps: [
      { t: "1. Base cases fib(0) & fib(1)", d: "Only n+1 unique states exist in total.", on: ["f0", "f1"], reveal: ["f0", "f1", "f2", "f3", "f4"] },
      { t: "2. Compute & cache fib(2) once", d: "Shared double-halo node stores fib(2) = 1 for every caller.", on: ["f2"], visit: ["f0", "f1"], edges: ["e5", "e6"], reveal: "all" },
      { t: "3. fib(3) & fib(4) reuse cached results", d: "All duplicate subtrees vanish—time drops from O(2ⁿ) to O(n).", on: ["f3", "f4"], visit: ["f0", "f1", "f2"], edges: ["e1", "e2", "e3", "e4"], reveal: "all", overview: true }
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
    { t: "Initialize row 0 and col 0 to 0", d: "An empty string shares 0 characters with any prefix.", upto: [0, 2], eq: "c[0, j] = 0,\\; c[i, 0] = 0" },
    { t: "Match X[1]=A and Y[1]=A (↖)", d: "Characters match! Take diagonal 0 + 1 = 1 with arrow ↖.", on: [1, 1], from: [[0, 0]], upto: [1, 1], eq: "X[1]=Y[1]='A' \\implies c[1,1] = [[c[0,0]|v]] + 1 = [[1|r]]" },
    { t: "Mismatch X[1]=A vs Y[2]=C (←)", d: "Copy max(↑ c[0,2]=0, ← c[1,1]=1) = 1.", on: [1, 2], from: [[0, 2], [1, 1]], upto: [1, 2], eq: "c[1,2] = \\max([[0|v]], [[1|v]]) = [[1|c]]" },
    { t: "Row B: propagate 1 upward (↑)", d: "B matches neither A nor C, so row 2 inherits ↑ from row 1.", on: [2, 2], from: [[1, 2], [2, 1]], upto: [2, 2], eq: "c[2,2] = \\max([[1|v]], [[1|v]]) = [[1|c]]" },
    { t: "Match X[3]=C and Y[2]=C (↖) → Traceback", d: "Diagonal ↖ adds 1 to c[2,1] = 1, giving LCS length 2 ('AC').", on: [3, 2], from: [[2, 1]], path: [[3, 2], [2, 1], [1, 1]], upto: [3, 2], eq: "LCS = [['AC'|r]],\\; |LCS| = [[2|r]]", hud: [{ label: "LCS", val: "AC (len 2)", role: "r" }] }
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
        { t: "Row 0: 0 items → all 0", d: "With 0 items, profit is 0 for every capacity.", upto: [0, 4], eq: "dp[0, c] = 0" },
        { t: "Item 1 (w=2, v=3) at c = 2..4", d: "For c ≥ 2, taking item 1 gives 3 + dp[0, c−2] = 3.", on: [1, 2], from: [[0, 2], [0, 0]], upto: [1, 4], eq: "dp[1,2] = \\max(dp[0,2],\\, 3 + [[dp[0,0]|v]]) = [[3|c]]" },
        { t: "Item 2 (w=3, v=4) at c = 3", d: "Taking item 2 beats skipping: max(3, 4 + dp[1,0]) = 4.", on: [2, 3], from: [[1, 3], [1, 0]], upto: [2, 3], eq: "dp[2,3] = \\max([[3|v]],\\, 4 + [[0|v]]) = [[4|c]]" },
        { t: "Optimal dp[2, 4] = 4", d: "At c = 4, w₁+w₂ = 5 > 4 so we cannot pack both; max profit is 4.", on: [2, 4], from: [[1, 4], [1, 1]], path: [[2, 4], [2, 3]], upto: [2, 4], eq: "dp[2,4] = \\max([[3|v]],\\, 4 + [[0|v]]) = [[4|r]]", hud: [{ label: "Best", val: "4 (item 2)", role: "r" }] }
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
    id: "r", t: "Row 0", kind: "root", role: "c",
    children: [
      {
        id: "q00", edge: "col 0", t: "Q(0,0)", kind: "decision", role: "c",
        children: [
          { id: "q10", edge: "c=0/1", edgeRole: "k", t: "Attacked", kind: "pruned", role: "k" },
          {
            id: "q12", edge: "col 2", t: "Q(1,2)", kind: "decision", role: "c",
            children: [
              { id: "dead", edge: "row 2", edgeRole: "k", t: "Dead End", sub: "all attacked", kind: "pruned", role: "k" }
            ]
          }
        ]
      },
      {
        id: "q01", edge: "col 1", edgeRole: "r", t: "Q(0,1)", kind: "decision", role: "r",
        children: [
          {
            id: "q13", edge: "col 3", edgeRole: "r", t: "Q(1,3)", kind: "decision", role: "r",
            children: [
              { id: "sol", edge: "c0, c2", edgeRole: "r", t: "Solved!", sub: "[1, 3, 0, 2]", kind: "leaf", role: "r" }
            ]
          }
        ]
      }
    ]
  },
  steps: [
    { t: "1. Try Q(0,0) → Q(1,2)", d: "Cols 0 and 1 on Row 1 are attacked, so PROMISING allows only col 2 (or 3).", on: ["q12"], reveal: ["r", "q00", "q10", "q12"], board: { title: "Try Q(0,0), Q(1,2)", queens: [[0, 0], [1, 2]] } },
    { t: "2. Dead end at Row 2 → Prune & Backtrack", d: "Every square on Row 2 is attacked by (0,0) or (1,2). Prune and backtrack to Row 0!", on: ["dead"], prune: ["q10", "dead"], reveal: ["r", "q00", "q10", "q12", "dead"], board: { title: "Row 2 Blocked!", queens: [[0, 0], [1, 2]], bad: [2, 1] } },
    { t: "3. Try Q(0,1) → Q(1,3) → Q(2,0) → Q(3,2)", d: "Placing Q(0,1) leaves clean squares all the way down to a valid 4-Queens solution!", on: ["sol"], prune: ["q10", "dead"], path: ["r", "q01", "q13", "sol"], reveal: "all", board: { title: "Valid Solution [1,3,0,2]", queens: [[0, 1], [1, 3], [2, 0], [3, 2]] }, overview: true }
  ]
});

/* 2.3 4x4 Sudoku AC-3 Domain Shrinking */
Kit.tree("tr-sudoku", {
  alt: "4x4 Sudoku backtracking tree with synced AC-3 candidate domain grid.",
  compact: true,
  board: { kind: "sudoku", size: 4 },
  root: {
    id: "s0", t: "Init Grid", sub: "AC-3 ready", kind: "root", role: "c",
    children: [
      { id: "s1", edge: "AC-3", edgeRole: "v", t: "Shrink (0,1)", sub: "{1,2,3,4}→{2}", kind: "decision", role: "v" },
      { id: "s2", edge: "Branch", edgeRole: "r", t: "Assign (0,1)=2", sub: "Propagates box", kind: "leaf", role: "r" }
    ]
  },
  steps: [
    {
      t: "1. Initial 4×4 clues + full domains", d: "Cell (0,1) shares row 0 with 1, box with 3, and col 1 with 4.",
      on: ["s0"], reveal: ["s0"],
      board: { title: "Before AC-3", cells: [{ v: 1, fixed: true }, [1, 2, 3, 4], [1, 2, 3, 4], 4, [1, 2, 3, 4], { v: 3, fixed: true }, [1, 2, 3, 4], [1, 2, 3, 4], [1, 2, 3, 4], { v: 4, fixed: true }, [1, 2, 3, 4], [1, 2, 3, 4], [1, 2, 3, 4], [1, 2, 3, 4], { v: 2, fixed: true }, [1, 2, 3, 4]] }
    },
    {
      t: "2. AC-3 removes 1, 3, 4 from (0,1)", d: "Arc consistency eliminates impossible digits in red, shrinking (0,1) to singleton {2}.",
      on: ["s1"], reveal: ["s0", "s1"],
      board: { title: "AC-3 Shrinks Domains", cells: [{ v: 1, fixed: true }, { d: [1, 2, 3, 4], elim: [1, 3, 4], role: "c" }, { d: [2, 3], role: "v" }, 4, [2, 4], { v: 3, fixed: true }, [1, 2, 4], [1, 2], [1, 2, 3], { v: 4, fixed: true }, [1, 3], [1, 2, 3], [2, 3], [1, 2], { v: 2, fixed: true }, [1, 3]] }
    },
    {
      t: "3. Forced (0,1) = 2 triggers cascade", d: "Assigning 2 forces (0,2) = 3 with zero guessing!",
      on: ["s2"], path: ["s0", "s2"], reveal: "all",
      board: { title: "Forced Assignment!", cells: [{ v: 1, fixed: true }, { v: 2, role: "r" }, { v: 3, role: "r" }, 4, [2, 4], { v: 3, fixed: true }, [1, 4], [1, 2], [1, 2, 3], { v: 4, fixed: true }, [1], [1, 2, 3], [2, 3], [1], { v: 2, fixed: true }, [1, 3]] },
      overview: true
    }
  ]
});

/* 2.4 0/1 Knapsack Branch-and-Bound */
Kit.tree("tr-bnb", {
  alt: "0/1 Knapsack Branch-and-Bound tree showing live fractional upper bounds and pruning.",
  compact: true,
  root: {
    id: "n0", t: "Root (W=4)", attrs: [{ k: "v", v: "0", role: "v" }, { k: "ub", v: "110", role: "c" }], kind: "root", role: "c",
    children: [
      {
        id: "n1", edge: "+item 1 (w=2,v=60)", edgeRole: "r", t: "Take 1", attrs: [{ k: "W_rem", v: "2", role: "v" }, { k: "ub", v: "110", role: "r" }], kind: "decision", role: "r",
        children: [
          { id: "n11", edge: "+item 2 (w=2,v=50)", edgeRole: "r", t: "Best = 110", attrs: [{ k: "W_rem", v: "0", role: "v" }, { k: "ub", v: "110", role: "r" }], kind: "leaf", role: "r" },
          { id: "n10", edge: "skip 2", edgeRole: "k", t: "Skip 2", attrs: [{ k: "v", v: "60", role: "v" }, { k: "ub", v: "100 ≤ 110", role: "k" }], kind: "pruned", role: "k" }
        ]
      },
      {
        id: "n2", edge: "skip 1", edgeRole: "k", t: "Skip 1", attrs: [{ k: "W_rem", v: "4", role: "v" }, { k: "ub", v: "90 ≤ 110", role: "k" }], kind: "pruned", role: "k",
        children: [
          { id: "n21", edge: "skip subtree", edgeRole: "k", t: "Never Visited", kind: "pruned", role: "k" }
        ]
      }
    ]
  },
  steps: [
    { t: "1. Compute root fractional bound ub = 110", d: "Items sorted by v/w: (2,60), (2,50), (2,40). Root takes items 1+2 → ub = 110.", on: ["n0"], reveal: ["n0"], hud: [{ label: "best_so_far", val: "0", role: "v" }, { label: "ub", val: "110", role: "c" }] },
    { t: "2. Take item 1 & item 2 → best_so_far = 110", d: "Integer leaf reaches profit 110 with W_rem = 0.", on: ["n1", "n11"], reveal: ["n0", "n1", "n11", "n10"], hud: [{ label: "best_so_far", val: "110", role: "r" }, { label: "ub", val: "110", role: "r" }] },
    { t: "3. Prune skip-2 (ub=100) and skip-1 (ub=90)!", d: "Both subtrees have ub ≤ 110, so they are grayed out and never explored.", on: ["n10", "n2"], prune: ["n10", "n2"], path: ["n0", "n1", "n11"], reveal: "all", hud: [{ label: "best_so_far", val: "110", role: "r" }, { label: "Pruned", val: "ub ≤ 110", role: "k" }], overview: true }
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
