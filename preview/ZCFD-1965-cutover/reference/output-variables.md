---
title: Output variables
section: reference
---

# Output variables

Output variables available to zCFD, declared once as `zCFDOutputField`s.

| Name | What it is | Also accepted as |
| --- | --- | --- |
| `pressure` | Static pressure (Pa) | p |
| `density` | Density (kg/m^3) | rho |
| `velocity` | Velocity vector (m/s) | V, v |
| `temperature` | Temperature (K) | T, t |
| `mach` | Mach number | m |
| `gauge_pressure` | Pressure relative to the reference value (Pa) |  |
| `potentialtemperature` | Potential temperature (K) |  |
| `cp` | Pressure coefficient |  |
| `totalcp` | Total pressure coefficient |  |
| `ek` | — no description — |  |
| `enstrophy` | Enstrophy - squared magnitude of vorticity |  |
| `velocitynd` | Non-dimensional velocity |  |
| `vorticity` | Vorticity vector (1/s) |  |
| `vorticitynd` | Non-dimensional vorticity |  |
| `Qcriterion` | Q criterion - vortex core identification |  |
| `Qcriterionnd` | Non-dimensional Q criterion |  |
| `helicity` | Helicity |  |
| `helicitynd` | Non-dimensional helicity |  |
| `viscosity` | Dynamic viscosity (Pa.s) | mu |
| `nu` | Kinematic viscosity (m^2/s) |  |
| `pressuregrad` | Pressure gradient vector |  |
| `densitygrad` | Density gradient vector |  |
| `velocitygrad` | Velocity gradient tensor |  |
| `temperaturegrad` | Temperature gradient vector |  |
| `turbulencekineticenergygrad` | Turbulence kinetic energy gradient |  |
| `turbulenceeddyfrequencygrad` | Turbulence eddy frequency gradient |  |
| `eddy` | Eddy viscosity (Pa.s) |  |
| `reynoldstress` | Reynolds stress tensor |  |
| `ti` | Turbulence intensity |  |
| `turbulencekineticenergy` | Turbulence kinetic energy (J/kg) |  |
| `turbulenceeddyfrequency` | Turbulence eddy frequency (1/s) |  |
| `nuTilde` | Spalart-Allmaras working variable |  |
| `menterf1` | Menter SST blending function |  |
| `lesregion` | DES/DDES/IDDES region flag |  |
| `viscouslengthscale` | Minimum distance between a cell and its neighbours |  |
| `turbulenceintermittency` | Transition model intermittency |  |
| `transitionreynoldsnumber` | Transition momentum-thickness Reynolds number |  |
| `walldist` | Distance to the nearest wall (m) |  |
| `walldistancezone` | Wall-distance zone id |  |
| `yplus` | Non-dimensional wall distance |  |
| `ut` | Friction velocity at the wall |  |
| `cf` | Skin friction coefficient |  |
| `roughness` | Wall roughness height |  |
| `heatflux` | Wall heat flux (W/m^2), positive into the fluid |  |
| `twall` | Wall temperature (K) |  |
| `velocitynearnd` | Non-dimensional velocity at the near-wall cell |  |
| `pressureforce` | Pressure component of force on a face |  |
| `pressuremoment` | Pressure component of moment on a face |  |
| `pressuremomentx` | Pressure moment about the x axis |  |
| `pressuremomenty` | Pressure moment about the y axis |  |
| `pressuremomentz` | Pressure moment about the z axis |  |
| `frictionforce` | Skin friction component of force on a face |  |
| `frictionmoment` | Skin friction component of moment on a face |  |
| `frictionmomentx` | Skin friction moment about the x axis |  |
| `frictionmomenty` | Skin friction moment about the y axis |  |
| `frictionmomentz` | Skin friction moment about the z axis |  |
| `zone` | Boundary/mesh zone number |  |
| `centre` | Cell or face centre location |  |
| `cell_centre` | Cell centre location |  |
| `cellvolume` | Cell volume |  |
| `cell_volupdate` | Cell volume update rate (moving mesh) |  |
| `cellcolour` | Partition/colouring index used by the mesh partitioner |  |
| `cell_velocity` | — no description — |  |
| `cellzone` | — no description — |  |
| `timestep` | Local timestep |  |
| `turbulencetimestep` | Local turbulence timestep |  |
| `densitylimiter` | Density limiter value |  |
| `klimiter` | Turbulence kinetic energy limiter value |  |
| `omegalimiter` | Turbulence eddy frequency limiter value |  |
| `sagradientlimiter` | Spalart-Allmaras gradient limiter value |  |
| `celllimiter` | Cell-based reconstruction limiter value for density (1 = unlimited); written by the 'barth jespersen', 'michalak gooch' and 'venkatakrishnan' limiters |  |
| `celllimiterpressure` | Cell-based reconstruction limiter value for pressure (1 = unlimited); written by the 'barth jespersen', 'michalak gooch' and 'venkatakrishnan' limiters |  |
| `roelowdissipation` | Roe low-dissipation blending factor |  |
| `FailCell` | Cells flagged as first-order fallback |  |
| `badcells` | Largest non-orthogonality among the cell's first-order faces under mesh quality remediation |  |
| `sponge` | Sponge layer damping coefficient |  |
| `MomentumSource` | Momentum source term (fluid zone sources) |  |
| `timestepratio` | Local time step ratio |  |
| `artificial_viscosity` | Artificial viscosity applied |  |
| `cellorder` | Spatial order used in each cell |  |
| `lambdavariable` | Spectral radius of the flux Jacobian |  |
| `lescfl` | CFL on the LES length scale used by the DES CFL shield: the larger of the grid relative transport CFL and the eddy turnover CFL |  |
| `lesturnover` | Eddy turnover contribution to lescfl on its own, so the binding mechanism is visible |  |
| `fdshield` | DES/DDES/IDDES shielding function f_d: 1 in resolved LES, 0 in the shielded RANS region |  |
| `V_avg` | Running average of the velocity vector (m/s) |  |
| `V_rms` | RMS of the velocity vector (m/s) |  |
| `p_avg` | Running average of the static pressure (Pa) |  |
| `p_rms` | RMS of the static pressure (Pa) |  |
| `T_avg` | Running average of the temperature (K) |  |
| `T_rms` | RMS of the temperature (K) |  |
| `overset` | Overset blanking/donor status |  |
| `parent` | Parent cell/zone id (overset) |  |
| `immersed boundary yplus` | Non-dimensional wall distance on an immersed boundary surface |  |
| `immersed boundary friction velocity` | Friction velocity on an immersed boundary surface |  |
| `immersed boundary vector` | Interpolated velocity vector on an immersed boundary surface |  |
| `immersed boundary normal` | Surface normal on an immersed boundary surface |  |
| `modaldeformation` | Modal deformation of the surface |  |
| `meshvelocity` | Mesh velocity from mesh motion (m/s) |  |
| `modeshapedisplacement_1` | Displacement of mode shape 1 |  |
| `modeshapedisplacement_2` | Displacement of mode shape 2 |  |
| `modeshapedisplacement_3` | Displacement of mode shape 3 |  |
| `modeshapedisplacement_4` | Displacement of mode shape 4 |  |
| `modeshapedisplacement_5` | Displacement of mode shape 5 |  |
| `modeshapedisplacement_6` | Displacement of mode shape 6 |  |
| `modeshapedisplacement_7` | Displacement of mode shape 7 |  |
| `modeshapedisplacement_8` | Displacement of mode shape 8 |  |
| `modeshapedisplacement_9` | Displacement of mode shape 9 |  |
| `modeshapedisplacement_10` | Displacement of mode shape 10 |  |
| `modeshapedisplacement_11` | Displacement of mode shape 11 |  |
| `modeshapedisplacement_12` | Displacement of mode shape 12 |  |
| `modeshapedisplacement_13` | Displacement of mode shape 13 |  |
| `modeshapedisplacement_14` | Displacement of mode shape 14 |  |
| `modeshaperotation_1` | Rotation of mode shape 1 |  |
| `modeshaperotation_2` | Rotation of mode shape 2 |  |
| `modeshaperotation_3` | Rotation of mode shape 3 |  |
| `modeshaperotation_4` | Rotation of mode shape 4 |  |
| `modeshaperotation_5` | Rotation of mode shape 5 |  |
| `modeshaperotation_6` | Rotation of mode shape 6 |  |
| `modeshaperotation_7` | Rotation of mode shape 7 |  |
| `modeshaperotation_8` | Rotation of mode shape 8 |  |
| `modeshaperotation_9` | Rotation of mode shape 9 |  |
| `modeshaperotation_10` | Rotation of mode shape 10 |  |
| `var_<n>` | Solution value of solved equation <n> |  |
| `resvar_<n>` | Residual of solved equation <n> |  |
| `resshare_<n>` | Share of the total squared residual held by each cell, equation <n>. Sums to one over the mesh; threshold at 1/Neff (reported when output settings -> report -> residual_statistics is on) to isolate the cells carrying the residual |  |
| `vargrad_<n>` | Gradient of solved equation <n> |  |
