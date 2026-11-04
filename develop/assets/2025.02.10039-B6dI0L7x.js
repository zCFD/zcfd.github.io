var e=`
# 2025.02.10039

## New features

- Immersed wall boundaries report viscous as well as pressure forces, and the new \`immersed boundary friction velocity\` output variable is available on immersed walls.

## Changes in behaviour

- In dual time stepping runs, \`first order cycles\` counts cycles from the start of the simulation. Adjust the value if you relied on it applying at every real time step.
`;export{e as default};