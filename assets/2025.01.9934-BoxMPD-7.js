var e=`
# 2025.01.9934

## New features

- Added the \`run_fwh\` utility, which computes acoustic pressure histories at observer locations directly from a zCFD control file, including overset and rotating cases.
- Simpler acoustic set-up, with \`dt\` and \`permeable\` now optional, automatic summation over surfaces, and utilities to view surface data by frequency in ParaView and to exclude chosen faces.
- Time-averaged runs store averaged boundary data, which can be output and is kept across a restart.
- The \`zmesh\` mesher can generate surrogate STLs for post-processing.

## Changes in behaviour

- Each initial condition block must give the velocity \`V\` as a \`vector\`.
- A porous fluid zone can be defined by \`def\` alone; \`zone\` is optional.
- Acoustic surface data from rotating meshes is written in the unrotated mesh frame.

## Fixes

- Improved robustness of mesh transforms and acoustic workflows.
`;export{e as default};