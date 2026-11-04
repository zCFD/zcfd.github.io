var e=`
# 2026.08.14860

## New features

- The incompressible solver adds an energy equation with buoyancy, a segregated scheme (\`scheme: "simple"\`) and linear periodic boundaries.
- Added a low-memory implicit scheme, \`lu-sgs\`.
- A run stops cleanly, with final output and a restart checkpoint, when a \`<case name>.stop\` file appears in the run directory.
- \`convert_mesh\` converts OpenFOAM meshes, and overset re-mapping on moving meshes is faster.

## Changes in behaviour

- Partitioned VTKHDF volume output opens in ParaView without Clean to Grid.
- The launch scripts ignore Python packages in the user's site-packages; set \`ZCFD_ALLOW_USER_SITE=1\` to include them.

## Fixes

- Improved robustness of rotating-mesh and moving overset workflows.

## Platforms and packaging

- zMon is installed with zCFD, and \`run_zcfd --apptainer\` launches the solver in an Apptainer container.
`;export{e as default};