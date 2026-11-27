# Universal Tap-to-Predict in E.stepper over niche visual kits

Status: accepted

To make every **Station**'s visual actively interactive without bloating `engine/kit.js` (already 15 reusable kits), we add universal **Tap-to-Predict** support directly to `E.stepper` so every existing kit gains interactive prediction steps, while unique subject-specific toys stay as custom `V` sandboxes inside per-guide `visuals.js`. Adding one-off domain kits into the shared engine would balloon single-file bundle size and maintenance cost for minimal cross-subject reuse.
