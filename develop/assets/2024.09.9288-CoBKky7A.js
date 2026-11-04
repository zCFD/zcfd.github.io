var e=`
# 2024.09.9288

## New features

- A mesh can be placed with a general affine transform through \`mesh transform matrix\`, and the new \`affine transform\` fluid zone moves meshes by a time-dependent matrix.
- Added mesh quality remediation, controlled by \`mesh quality remediation angle threshold\`, with a \`badcells\` output variable showing the affected cells.
- Overset rotating meshes support immersed boundaries, so overset blades can be run in the blade frame. Added the \`immersed boundary yplus\` output variable.
- zMesh takes \`--spacingOnlySTL\` for STLs that set mesh spacing without being meshed as geometry.
- Acoustic and checkpoint output are written without interrupting the solve.

## Fixes

- Improved robustness of restart and unsteady workflows.

## Validation cases

- Added the IEA 15 MW reference wind turbine.
`;export{e as default};