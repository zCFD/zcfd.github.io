var e=`
# 2020.03.106

## New features

- Added a blade element propeller model for disc fluid zones, \`model: 'blade element propellor'\`, with tip loss correction options. The user guide gains a propeller modelling section.
- Turbine blade pitch control takes \`blade pitch\` and \`blade pitch step\`.
- Extended the FRPM acoustic source model with further turbulence and source-mapping options.
- \`output real time cycle frequency\` can be changed while a case is running.
- zCFD can run inside a container, including on GPUs.

## Changes in behaviour

- The \`up\` vector of a disc fluid zone is optional and defaults to \`[0.0, 0.0, 1.0]\`.

## Fixes

- Improved robustness of high-order restarts and mesh conversion.
`;export{e as default};