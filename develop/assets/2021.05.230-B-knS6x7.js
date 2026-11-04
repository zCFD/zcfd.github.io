var e=`
# 2021.05.230

## New features

- Overset runs can use multigrid.
- \`run_zcfd\` and \`cluster_run\` take a \`-f\` option naming a Python file that sets the meshes, cases and run options, which simplifies overset runs.
- The DGCAA solver accepts several FRPM domains.
- \`volume interpolate\` output accepts binary STL files.
- The modal model can be updated every n cycles through \`update frequency\`.

## Changes in behaviour

- In the \`dgcaa\` block, name the FRPM dictionary \`'FRPM_1'\`, even when there is only one domain.

## Fixes

- Improved robustness of overset and high-order workflows.

## Platforms and packaging

- Added support for NVIDIA Ampere GPUs. ParaView 5.9.0 is bundled.
`;export{e as default};