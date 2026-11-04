var e=`
# 2023.03.3383

## New features

- Overset and sliding meshes can be combined with a rotating frame of reference.
- Modal-model FSI runs in steady as well as unsteady simulations.
- Added the \`'immersed wall'\` boundary condition.
- Added \`cba_convert\` for CBA structured multiblock meshes, and the \`menterf1\` output variable.

## Changes in behaviour

- The overset key \`sliding planes\` is renamed \`create overset halos\`.
- \`run_zcfd\` stops with an error on an unknown option, and validation rejects reports that share a name.

## Fixes

- Improved robustness of restart and FSI workflows.

## Platforms and packaging

- ParaView 5.11 is bundled.
`;export{e as default};