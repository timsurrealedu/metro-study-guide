/* STARTER · visuals.js (Metro Engine v2.0)
   One call per visual. Pick a kit from references/04-visual-kits.md. */

Kit.flow("k-example", {
  alt: "Describe the visual for screen readers.",
  nodes: [{t: "First", sub: "short note"}, {t: "Second", sub: "short note"}, {t: "Third", sub: "short note"}],
  steps: [
    {t: "Step 1: Start here", d: "Notice how the first box lights up.", on: [0]},
    {t: "Step 2: Middle handoff", d: "Before jumping to Step 3, predict what happens next.", on: [1],
     predict: {
       q: "Which box receives the handoff next?",
       o: [["Third", true, "Right! The arrow leads straight from Second to Third."],
           ["Back to First", false, "This is a one-way flow, so it moves forward to Third."]]
     }},
    {t: "Step 3: Finish", d: "The flow reaches Third.", on: [2]}
  ]
});

/* A custom visual: draw with V helpers, then hand a render(i) to E.stepper.
   references/05-custom-visuals.md has the full API. */
(function () {
  const E = window.Engine, svg = V.svg("v-custom");
  if (!svg) return;
  V.put(svg, `<circle id="cu-a" cx="200" cy="130" r="40" class="f-pc"/>
    <circle id="cu-b" cx="440" cy="130" r="40" class="f-pc fade"/>
    ${V.lbl(200, 200, "Before", "tb")}${V.lbl(440, 200, "After", "tb fade")}`);
  const steps = [{t: "Before", d: "What the first state shows."}, {t: "After", d: "What changed."}];
  E.stepper(E.$("#v-custom"), steps, i => {
    V.show(svg.querySelectorAll(".fade"), i >= 1);
  });
})();
