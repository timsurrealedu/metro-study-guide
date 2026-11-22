/* STARTER · visuals.js
   One call per visual. Pick a kit from docs/04-visual-kits.md. */

Kit.flow("k-example", {
  alt: "Describe the visual for screen readers.",
  nodes: [{t: "First", sub: "short note"}, {t: "Second", sub: "short note"}, {t: "Third", sub: "short note"}],
  steps: [
    {t: "Step title", d: "What to notice in this step.", on: [0]},
    {t: "Step title", d: "What to notice.", on: [1]},
    {t: "Step title", d: "What to notice.", on: [2]}
  ]
});

/* A custom visual: draw with V helpers, then hand a render(i) to E.stepper.
   docs/05-custom-visuals.md has the full API. */
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
