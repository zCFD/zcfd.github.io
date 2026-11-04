var e=`
# 2021.08.269

## New features

- Overset cases can include rotating meshes.
- The DG solver supports curved, high-order mesh geometry, and gains options for faster runs.
- Added a \`separation correction\` option to the \`sst-transition\` model, and \`turbulencetimestep\` as a RANS output variable.

## Changes in behaviour

- In the \`dgcaa\` block, rename \`no caa only frpm solver\` to \`frpm solver only\`.
- Remove \`multipoly cycle pattern\` from DG control files; \`multipolycfl\` takes two values, for the highest and lowest orders.
- Monitor points in DGCAA runs must not request \`forces\` or \`massflow\`.

## Fixes

- Improved robustness of the DG solver, overset runs and cluster launch.

## Platforms and packaging

- InfiniBand runs are supported inside a container.
`;export{e as default};