var e=`
# 2023.10.5890

## New features

- The incompressible solver supports the SA-neg turbulence model.
- More choices are available for \`limiter\`.
- The zM3 mesh generator gains new refinement options and a page in the guide.
- Extended acoustic output.
- Faster start-up and solution mapping on large cases.
- The user guide gains new pages and quick-start tutorials.

## Changes in behaviour

- An exponential CFL ramp continues until it reaches the maximum CFL, and a run stops with an error when its residuals become invalid.
- Validation rejects a callable \`mach\` in an initial condition that a boundary condition refers to.
`;export{e as default};