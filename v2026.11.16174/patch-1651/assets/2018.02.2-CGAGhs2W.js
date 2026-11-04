var e=`
# 2018.02.2

## New features

- Mesh transformations can select their basis function with \`basis\`, and \`scale\` can be a function of node position.
- Added an outflow \`kind\` of \`'radial pressure gradient'\` for rotating periodic cases.
- The high-order solver supports buoyancy and Spalart-Allmaras wall functions.
- Added time-step diagnostic output variables, and the report plotting tools can compare several cases.

## Changes in behaviour

- In the \`preconditioner\` block, rename \`factor\` to \`minimum mach number\`.
- Boundary and initial condition dictionaries are validated before the run starts; an \`initial\` dictionary no longer requires \`func\`.

## Removals

- The \`'scotch'\` partitioner has been removed; remove it from \`partitioner\` settings.

## Platforms and packaging

- Added support for NVIDIA Volta GPUs.
`;export{e as default};