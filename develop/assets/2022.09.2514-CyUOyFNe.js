var e=`
# 2022.09.2514

## New features

- Added a porous fluid zone (\`type: 'porous'\`).
- Added the quadratic constitutive relation for SST and SA-neg, with \`qcr: True\` in the \`turbulence\` block.
- The limiter can be frozen at a given cycle with \`freeze limiter cycle\`.
- Modal-model FSI gains further mode mapping options, and the high-order solver gains a \`cartesian aligned mesh\` option for Cartesian refined meshes.

## Changes in behaviour

- \`double precision linear solve\` defaults to \`False\`; set it to \`True\` to keep the previous setting.
- The compressible solver does not write a checkpoint when the solution contains invalid values.

## Fixes

- Improved robustness of overset, restart and mesh conversion workflows.

## Platforms and packaging

- Python 3.9 is bundled, Kepler GPUs such as the K80 are supported, and the solver warns at start-up when the GPU driver is older than the CUDA runtime.
`;export{e as default};