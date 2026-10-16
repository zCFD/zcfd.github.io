var e=`
# 2018.05.58

- Upgraded to Paraview 5.4
- Bug fix to node ordering for DG tetrahedra
- MUSCL reconstruction no longer demotes interface faces between FV and high order cells
- Improved low Mach number preconditioning for turbulent flow for SST and SA models
- DG Performance improvements
- Fixed wave speed calculation for Rusanov scheme for FV solver
- Fixes for P4 hexahedra
- Default parameter values output when solver is run without \`controldict\` present are now no longer merged with the supplied control dictionary
- Fix for launching using LSF job scheduler
- Added option to set cell orders in cylindrical regions for DG solver
- Correction to dynamic viscosity output and added output of turbulence kinetic energy
- Added sponge layer option for farfield boundary conditions
- Improved warning message for cell zone definition
- Set velocity to cell velocity on the farfield boundary for ALE cases
- Fix rotating cell zones partition face flux ale velocity
`;export{e as default};