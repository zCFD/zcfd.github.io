var e=`
# 2020.04.108

## New features

- The DG CAA solver can be initialised from a Python function through \`initial: {'func': ...}\`.

## Fixes

- Improved robustness of parallel and multi-zone runs.

## Platforms and packaging

- \`run_zcfd\` selects a working network fabric automatically; set \`FI_PROVIDER\` to choose one.
`;export{e as default};