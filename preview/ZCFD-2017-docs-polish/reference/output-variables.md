---
title: Output variables
section: reference
---

# Output variables

Every variable zCFD can write, grouped by family. Name volume variables in `volume variables` and surface variables in `surface variables`, both under output settings › solution. Each row says whether the variable is written to volume output, surface output or both.

**Flow** · Primitive solution variables.

| Name | What it is | Written to | Also accepted as |
| --- | --- | --- | --- |
| `pressure` | Static pressure (Pa) | volume and surface | `p` |
| `density` | Density (kg/m^3) | volume and surface | `rho` |
| `velocity` | Velocity vector (m/s) | volume and surface | `V`, `v` |
| `temperature` | Temperature (K) | volume and surface | `T`, `t` |
| `mach` | Mach number | volume and surface | `m` |
| `gauge_pressure` | Pressure relative to the reference value (Pa) | volume and surface |  |
| `V_avg` | Running average of the velocity vector (m/s) | volume and surface |  |
| `V_rms` | RMS of the velocity vector (m/s) | volume and surface |  |
| `p_avg` | Running average of the static pressure (Pa) | volume and surface |  |
| `p_rms` | RMS of the static pressure (Pa) | volume and surface |  |
| `T_avg` | Running average of the temperature (K) | volume and surface |  |
| `T_rms` | RMS of the temperature (K) | volume and surface |  |

**Derived** · Quantities computed from the solution.

| Name | What it is | Written to | Also accepted as |
| --- | --- | --- | --- |
| `potentialtemperature` | Potential temperature (K) | volume and surface |  |
| `cp` | Pressure coefficient | volume and surface |  |
| `totalcp` | Total pressure coefficient | volume and surface |  |
| `ek` | Kinetic energy contained in the cell, 0.5 rho \|V\|^2 times the cell volume (non-dimensional) | volume and surface |  |
| `enstrophy` | Enstrophy - squared magnitude of vorticity | volume and surface |  |
| `velocitynd` | Non-dimensional velocity | volume and surface |  |
| `vorticity` | Vorticity vector (1/s) | volume |  |
| `vorticitynd` | Non-dimensional vorticity | volume |  |
| `Qcriterion` | Q criterion - vortex core identification | volume |  |
| `Qcriterionnd` | Non-dimensional Q criterion | volume |  |
| `helicity` | Helicity | volume |  |
| `helicitynd` | Non-dimensional helicity | volume |  |
| `viscosity` | Dynamic viscosity (Pa.s) | volume and surface | `mu` |
| `nu` | Kinematic viscosity (m^2/s) | volume and surface |  |

**Gradients** · Gradient vectors and tensors.

| Name | What it is | Written to | Also accepted as |
| --- | --- | --- | --- |
| `pressuregrad` | Pressure gradient vector | volume and surface |  |
| `densitygrad` | Density gradient vector | volume and surface |  |
| `velocitygrad` | Velocity gradient tensor | volume and surface |  |
| `temperaturegrad` | Temperature gradient vector | volume and surface |  |
| `turbulencekineticenergygrad` | Turbulence kinetic energy gradient | volume |  |
| `turbulenceeddyfrequencygrad` | Turbulence eddy frequency gradient | volume |  |

**Turbulence** · Turbulence model quantities.

| Name | What it is | Written to | Also accepted as |
| --- | --- | --- | --- |
| `eddy` | Eddy viscosity (Pa.s) | volume and surface |  |
| `reynoldstress` | Reynolds stress tensor | volume |  |
| `ti` | Turbulence intensity | volume |  |
| `turbulencekineticenergy` | Turbulence kinetic energy (J/kg) | volume and surface |  |
| `turbulenceeddyfrequency` | Turbulence eddy frequency (1/s) | volume and surface |  |
| `nuTilde` | Spalart-Allmaras working variable | volume and surface |  |
| `menterf1` | Menter SST blending function | volume |  |
| `lesregion` | DES/DDES/IDDES region flag | volume and surface |  |
| `viscouslengthscale` | Minimum distance between a cell and its neighbours | volume |  |
| `turbulenceintermittency` | Transition model intermittency | volume |  |
| `transitionreynoldsnumber` | Transition momentum-thickness Reynolds number | volume |  |

**Wall** · Wall and boundary-layer quantities.

| Name | What it is | Written to | Also accepted as |
| --- | --- | --- | --- |
| `walldist` | Distance to the nearest wall (m) | volume and surface |  |
| `walldistancezone` | Wall-distance zone id | volume and surface |  |
| `yplus` | Non-dimensional wall distance | surface |  |
| `ut` | Friction velocity at the wall | surface |  |
| `cf` | Skin friction coefficient | surface |  |
| `roughness` | Wall roughness height | surface |  |
| `heatflux` | Wall heat flux (W/m^2), positive into the fluid | surface |  |
| `twall` | Wall temperature (K) | surface |  |
| `velocitynearnd` | Non-dimensional velocity at the near-wall cell | volume and surface |  |

**Forces & moments** · Per-face force and moment contributions.

| Name | What it is | Written to | Also accepted as |
| --- | --- | --- | --- |
| `pressureforce` | Pressure component of force on a face | surface |  |
| `pressuremoment` | Pressure component of moment on a face | surface |  |
| `pressuremoment<axis>` | Pressure moment about the `<axis>` axis. Replace `<axis>` with x, y or z. | surface |  |
| `frictionforce` | Skin friction component of force on a face | surface |  |
| `frictionmoment` | Skin friction component of moment on a face | surface |  |
| `frictionmoment<axis>` | Skin friction moment about the `<axis>` axis. Replace `<axis>` with x, y or z. | surface |  |

**Mesh & geometry** · Cell and zone geometry.

| Name | What it is | Written to | Also accepted as |
| --- | --- | --- | --- |
| `zone` | Boundary/mesh zone identifier | volume and surface |  |
| `centre` | Cell or face centre location | volume and surface |  |
| `cell_centre` | Cell centre location | volume and surface |  |
| `cellvolume` | Cell volume | volume |  |
| `cell_volupdate` | Cell volume update rate (moving mesh) | volume |  |
| `cellcolour` | Partition/colouring index used by the mesh partitioner | volume |  |
| `cell_velocity` | Velocity of the mesh at each cell centre from mesh motion (m/s) | volume |  |
| `cellzone` | Cell zone number of each cell, as stored in the mesh file | volume |  |
| `GlobalCellId` | Global cell index, as named in the invalid-cell log lines | volume |  |

**Solver** · Residuals, limiters and numerical diagnostics.

| Name | What it is | Written to | Also accepted as |
| --- | --- | --- | --- |
| `timestep` | Local timestep | volume and surface |  |
| `turbulencetimestep` | Local turbulence timestep | volume |  |
| `densitylimiter` | Density limiter value | volume and surface |  |
| `klimiter` | Turbulence kinetic energy limiter value | volume and surface |  |
| `omegalimiter` | Turbulence eddy frequency limiter value | volume and surface |  |
| `sagradientlimiter` | Spalart-Allmaras gradient limiter value | volume |  |
| `celllimiter` | Cell-based reconstruction limiter value for density (1 = unlimited); written by the 'barth jespersen', 'michalak gooch' and 'venkatakrishnan' limiters | volume |  |
| `celllimiterpressure` | Cell-based reconstruction limiter value for pressure (1 = unlimited); written by the 'barth jespersen', 'michalak gooch' and 'venkatakrishnan' limiters | volume |  |
| `roelowdissipation` | Roe low-dissipation blending factor | volume |  |
| `FailCell` | 1 in a cell whose solution is invalid, 0 elsewhere | volume |  |
| `badcells` | Largest non-orthogonality among the cell's first-order faces under mesh quality remediation | volume |  |
| `sponge` | Sponge layer damping coefficient | volume |  |
| `MomentumSource` | Momentum source term (fluid zone sources) | volume |  |
| `timestepratio` | Local time step ratio | volume and surface |  |
| `artificial_viscosity` | Artificial viscosity applied | volume |  |
| `cellorder` | Spatial order used in each cell | volume |  |
| `lambdavariable` | Spectral radius of the flux Jacobian | volume |  |
| `lescfl` | CFL on the LES length scale used by the DES CFL shield: the larger of the grid relative transport CFL and the eddy turnover CFL | volume and surface |  |
| `lesturnover` | Eddy turnover contribution to lescfl on its own, so the binding mechanism is visible | volume and surface |  |
| `fdshield` | DES/DDES/IDDES shielding function f_d: 1 in resolved LES, 0 in the shielded RANS region | volume and surface |  |
| `var_<n>` | Solution value of solved equation `<n>`. Replace `<n>` with the number of a solved equation, counting from 1. A case solves 5 equations with euler, viscous, les, incomp viscous or incomp les, 7 with rans or incomp rans, 6 with the `sa-neg` turbulence model and 9 with the `sst-transition` turbulence model. | volume and surface |  |
| `resvar_<n>` | Residual of solved equation `<n>`. Replace `<n>` with the number of a solved equation, counting from 1. A case solves 5 equations with euler, viscous, les, incomp viscous or incomp les, 7 with rans or incomp rans, 6 with the `sa-neg` turbulence model and 9 with the `sst-transition` turbulence model. | volume and surface |  |
| `resshare_<n>` | Share of the total squared residual held by each cell, equation `<n>`. Sums to one over the mesh; threshold at 1/Neff (reported when output settings › report › residual statistics is on) to isolate the cells carrying the residual. Replace `<n>` with the number of a solved equation, counting from 1. A case solves 5 equations with euler, viscous, les, incomp viscous or incomp les, 7 with rans or incomp rans, 6 with the `sa-neg` turbulence model and 9 with the `sst-transition` turbulence model. | volume and surface |  |
| `vargrad_<n>` | Gradient of solved equation `<n>`. Replace `<n>` with the number of a solved equation, counting from 1. A case solves 5 equations with euler, viscous, les, incomp viscous or incomp les, 7 with rans or incomp rans, 6 with the `sa-neg` turbulence model and 9 with the `sst-transition` turbulence model. | volume and surface |  |

**Overset** · Overset data.

| Name | What it is | Written to | Also accepted as |
| --- | --- | --- | --- |
| `overset` | Overset blanking/donor status | volume and surface |  |
| `parent` | Parent cell/zone id (overset) | volume |  |

**FSI & modal** · Modal deformation and mesh motion.

| Name | What it is | Written to | Also accepted as |
| --- | --- | --- | --- |
| `modaldeformation` | Modal deformation of the surface | surface |  |
| `meshvelocity` | Mesh velocity from mesh motion (m/s) | volume and surface |  |
| `modeshapedisplacement_<n>` | Displacement of mode shape `<n>`. Replace `<n>` with a number from 1 to 14. | surface |  |
| `modeshaperotation_<n>` | Rotation of mode shape `<n>`. Replace `<n>` with a number from 1 to 10. | surface |  |

