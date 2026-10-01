---
title: equations
section: reference
---

# equations


## type

— no description —

not set by default

| Value | What it does | When to use it |
| --- | --- | --- |
| `euler` (default) | Use the Euler flow equations in the simulation. These are compressible, inviscid flow equations. |  |
| `viscous` (default) | Use the viscous flow equations. These are compressible, viscid flow equations which do not model turbulence. |  |
| `rans` (default) | Use the RANS (Reynolds-Averaged Navier-Stokes) equations in the simulation. These are compressible, viscid flow equations with additional terms included to account for the effect of turbulence on the flow without the expense of simulating the turbulent flow structures themselves. |  |
| `les` (default) | Use the Large Eddy Simulation (LES) equations. |  |

Guidance: [/guide/choosing/choosing-a-turbulence-model#equation-sets](/guide/choosing/choosing-a-turbulence-model#equation-sets)


## precondition

Enable low mach number preconditioning

true or false · default False · 'precondition' only applies when solver.time settings.kind is one of unset, 'dual time stepping'

Guidance: [/guide/choosing/choosing-a-turbulence-model#precondition](/guide/choosing/choosing-a-turbulence-model#precondition)


## turbulence

Turbulence model configuration

settings block · required

Guidance: [/guide/choosing/choosing-a-turbulence-model#rans](/guide/choosing/choosing-a-turbulence-model#rans)


### model

RANS turbulence model (sst = Menter SST k-ω, sas = Scale-Adaptive Simulation, sa-neg = Spalart-Allmaras Negative, sst-transition = γ-Reθ transition)

required

| Value | What it does | When to use it |
| --- | --- | --- |
| `sst` | The Menter Shear Stress Transport Turbulence Model (https://turbmodels.larc.nasa.gov/sst.html) |  |
| `sas` | Scale-Adaptive Simulation, run as a standalone RANS model |  |
| `sa-neg` | Negative Spalart-Allmaras turbulence model (https://turbmodels.larc.nasa.gov/spalart.html) |  |
| `sst-transition` | The Langtry-Menter 4-equation Transitional SST Model (https://turbmodels.larc.nasa.gov/langtrymenter_4eqn.html) |  |
| `spalart-allmaras` | Spalart-Allmaras turbulence model (https://turbmodels.larc.nasa.gov/spalart.html) |  |

Guidance: [/guide/choosing/choosing-a-turbulence-model#rans](/guide/choosing/choosing-a-turbulence-model#rans)


### hybrid

Hybrid RANS-LES approach (DES = Detached Eddy Simulation, DDES = Delayed DES, IDDES = Improved Delayed DES, SAS = Scale-Adaptive Simulation)

not set by default

| Value | What it does | When to use it |
| --- | --- | --- |
| `DES` | Detached Eddy Simulation |  |
| `DDES` | Delayed Detached Eddy Simulation |  |
| `IDDES` | Improved Delayed Detached Eddy Simulation |  |
| `SAS` | Scale-Adaptive Simulation run as the hybrid branch of `model` |  |

Guidance: [/guide/choosing/choosing-a-turbulence-model#rans](/guide/choosing/choosing-a-turbulence-model#rans)


### limit mut

Limit eddy viscosity in SST model

true or false · default True


### limit gradient k

Gradient limiter coefficient for turbulence kinetic energy k

number · not set by default · 0.01 to 1.0


### qcr

QCR variant year (2000, 2020, or 2021)

not set by default

| Value | What it does | When to use it |
| --- | --- | --- |
| `2000` | [QCR 2000](<https://doi.org/10.1016/S0142-727X(00)00007-2>) |  |
| `2020` | [QCR 2020](https://doi.org/10.2514/1.J059683) |  |
| `2021` | [QCR 2021](https://doi.org/10.1017/aer.2021.42) |  |

Guidance: [/guide/choosing/choosing-a-turbulence-model#qcr](/guide/choosing/choosing-a-turbulence-model#qcr)


### rotation correction

Enable the rotation correction. Read by both turbulence models, in their own forms: SST applies Hellsten's f4 = 1/(1 + Crc*Ri) to the omega destruction term, and SA adds Crot*min(0, S - Omega) to production (Dacles-Mariani / Spalart-Shur). NOTE: the ln(omega) SST variant does not implement it and silently ignores this.

true or false · default False


### production

Production term model for SST (vorticity = SST-V, strain-incompressible = strain-based for incompressible, strain-compressible = strain-based for compressible, kato-launder = Kato-Launder). When omitted the solver build chooses: kato-launder for sst-transition, vorticity otherwise (the solver's Menter SST defaults) — a schema default here would silently override the transition build's choice.

not set by default

| Value | What it does | When to use it |
| --- | --- | --- |
| `vorticity` | The vorticity based production term (SST-V) $P_m=\mu_t\Omega_v^2-\frac{2}{3}\rho k \delta_{ij}\frac{\partial u_i}{\partial x_j}$ |  |
| `strain-incompressible` | The strain based production term for incompressible flows $P_m=\mu_t S^2$ |  |
| `strain-compressible` | The strain based production term for compressible flows $P_m=\mu_t S^2 -\frac{2}{3}\rho k \delta_{ij}\frac{\partial u_i}{\partial x_j}$ |  |
| `kato-launder` | The Kato-Launder source term $P_m=\mu_t S\Omega_v -\frac{2}{3}\rho k \delta_{ij}\frac{\partial u_i}{\partial x_j}$ |  |

Guidance: [/guide/choosing/choosing-a-turbulence-model#production](/guide/choosing/choosing-a-turbulence-model#production)


### betastar

Constant in the dissipation term on the k equation in the SST model

number · default 0.09

Guidance: [/guide/choosing/choosing-a-turbulence-model#advanced-parameters-for-turbulence-models](/guide/choosing/choosing-a-turbulence-model#advanced-parameters-for-turbulence-models)


### cdes kw

The k-omega part of the blended C_DES in SST

number · default 0.78

Guidance: [/guide/choosing/choosing-a-turbulence-model#advanced-parameters-for-turbulence-models](/guide/choosing/choosing-a-turbulence-model#advanced-parameters-for-turbulence-models)


### cdes keps

The k-epsilon part of the blended C_DES in SST

number · default 0.61

Guidance: [/guide/choosing/choosing-a-turbulence-model#advanced-parameters-for-turbulence-models](/guide/choosing/choosing-a-turbulence-model#advanced-parameters-for-turbulence-models)


### cd1

Constant in the f_dt blending function in DDES and IDDES

number · default 20

Guidance: [/guide/choosing/choosing-a-turbulence-model#advanced-parameters-for-turbulence-models](/guide/choosing/choosing-a-turbulence-model#advanced-parameters-for-turbulence-models)


### cd2

Constant in the f_dt blending function in DDES and IDDES

whole number · default 3

Guidance: [/guide/choosing/choosing-a-turbulence-model#advanced-parameters-for-turbulence-models](/guide/choosing/choosing-a-turbulence-model#advanced-parameters-for-turbulence-models)


### cw

Constant in the length scale calculation in IDDES

number · default 0.15

Guidance: [/guide/choosing/choosing-a-turbulence-model#advanced-parameters-for-turbulence-models](/guide/choosing/choosing-a-turbulence-model#advanced-parameters-for-turbulence-models)


### a1

Constant in the eddy viscosity limiter in SST

number · default 0.31

Guidance: [/guide/choosing/choosing-a-turbulence-model#advanced-parameters-for-turbulence-models](/guide/choosing/choosing-a-turbulence-model#advanced-parameters-for-turbulence-models)


### cdes

C_DES constant used for SA-neg based hybrid RANS/LES models

number · default 0.65

Guidance: [/guide/choosing/choosing-a-turbulence-model#advanced-parameters-for-turbulence-models](/guide/choosing/choosing-a-turbulence-model#advanced-parameters-for-turbulence-models)


### ca1

Constant in the production of the gamma equation in the transition model

number · default 2

Guidance: [/guide/choosing/choosing-a-turbulence-model#advanced-parameters-for-turbulence-models](/guide/choosing/choosing-a-turbulence-model#advanced-parameters-for-turbulence-models)


### ca2

Constant in the destruction term for gamma equation in the transition model

number · default 0.06

Guidance: [/guide/choosing/choosing-a-turbulence-model#advanced-parameters-for-turbulence-models](/guide/choosing/choosing-a-turbulence-model#advanced-parameters-for-turbulence-models)


### ce1

Constant in the production term of the gamma equation in the transition model

number · default 1

Guidance: [/guide/choosing/choosing-a-turbulence-model#advanced-parameters-for-turbulence-models](/guide/choosing/choosing-a-turbulence-model#advanced-parameters-for-turbulence-models)


### ce2

Constant in the destruction term for gamma equation in the transition model

number · default 50

Guidance: [/guide/choosing/choosing-a-turbulence-model#advanced-parameters-for-turbulence-models](/guide/choosing/choosing-a-turbulence-model#advanced-parameters-for-turbulence-models)


### cthetat

Constant in the Re-theta transition correlation in the transition model

number · default 0.03

Guidance: [/guide/choosing/choosing-a-turbulence-model#advanced-parameters-for-turbulence-models](/guide/choosing/choosing-a-turbulence-model#advanced-parameters-for-turbulence-models)


### sigmagamma

Constant in the transition model in the compressible solver

number · default 1

Guidance: [/guide/choosing/choosing-a-turbulence-model#advanced-parameters-for-turbulence-models](/guide/choosing/choosing-a-turbulence-model#advanced-parameters-for-turbulence-models)


### sigmathetat

Constant in the transition model in the compressible solver

number · default 2

Guidance: [/guide/choosing/choosing-a-turbulence-model#advanced-parameters-for-turbulence-models](/guide/choosing/choosing-a-turbulence-model#advanced-parameters-for-turbulence-models)


### separation correction

Activates the separation correction for the transition model

true or false · default True

Guidance: [/guide/choosing/choosing-a-turbulence-model#advanced-parameters-for-turbulence-models](/guide/choosing/choosing-a-turbulence-model#advanced-parameters-for-turbulence-models)


### les cfl limit

Restrict the LES branch of the DES/DDES/IDDES length scale to cells whose nominal CFL is at or below this limit. 0 (the default) disables the shield, which is also always inactive unless the run is time accurate

number · not set by default · >= 0.0 · 'les cfl limit' only applies when solver.time settings.type is 'unsteady'

Guidance: [/guide/choosing/choosing-a-turbulence-model#shielding-the-les-branch-by-cfl](/guide/choosing/choosing-a-turbulence-model#shielding-the-les-branch-by-cfl)


### les cfl width

Width of the blend above les_cfl_limit. The shield ramps from LES at les_cfl_limit to full RANS at les_cfl_limit plus this width.

number · not set by default · > 0.0 · 'les cfl width' only applies when solver.time settings.type is 'unsteady'

Guidance: [/guide/choosing/choosing-a-turbulence-model#shielding-the-les-branch-by-cfl](/guide/choosing/choosing-a-turbulence-model#shielding-the-les-branch-by-cfl)


### les turnover coefficient

Weight on the eddy turnover contribution to the shielded CFL. The time step has to resolve both the transport of an eddy across the cell and the eddy's own turnover, and the shield takes whichever is larger. 0 leaves the transport only criterion, which cannot see a cell whose speed relative to the mesh is near zero. Defaults to 1, and has no effect unless les_cfl_limit is set

number · not set by default · >= 0.0 · 'les turnover coefficient' only applies when solver.time settings.type is 'unsteady'

Guidance: [/guide/choosing/choosing-a-turbulence-model#les_turnover_coefficient](/guide/choosing/choosing-a-turbulence-model#les_turnover_coefficient)


### les

LES subgrid-scale model (wale = Wall-Adapting Local Eddy-viscosity, deardorff = 1.5-order prognostic SGS-TKE with a stratification-limited length scale, none = no SGS model)

required

| Value | What it does | When to use it |
| --- | --- | --- |
| `none` | Implicit LES (no explicit SGS model). |  |
| `wale` | The Wall-Adapting Local Eddy-viscosity model. |  |
| `deardorff` |  |  |

Guidance: [/guide/choosing/choosing-a-turbulence-model#les](/guide/choosing/choosing-a-turbulence-model#les)


### wall damping

Enable wall damping for LES model

true or false · not set by default


### relax

Under-relaxation factor for the SGS turbulence equation. Read UNCONDITIONALLY by the C++ (IncompSolverData.h initKernels, turbulence.relax), so it must always be present in the emitted dict -- it carried a default of 0.5 in the legacy schema and was lost when the schemas moved, leaving the deardorff path with no way to supply it.

number · default 0.5 · 0.1 to 1.0


### eps

von Kármán constant for WALE near-wall scaling

number · default 0.41


## correction

Non-orthogonal correction method

default over_relaxed

| Value | What it does | When to use it |
| --- | --- | --- |
| `none` |  |  |
| `orthogonal` |  |  |
| `minimum` |  |  |
| `over_relaxed` (default) |  |  |

Guidance: [/guide/choosing/choosing-a-turbulence-model#incompressible-viscous](/guide/choosing/choosing-a-turbulence-model#incompressible-viscous)


## correction limiter

Non-orthogonal correction limiter coefficient

number · default 0.5 · 0.0 to 1.0


## gradient limiter type

Gradient limiter type

default cellmd

| Value | What it does | When to use it |
| --- | --- | --- |
| `cellmd` (default) | More robust on highly non-orthogonal meshes. |  |
| `cell` | Less dissipative. |  |


## gradient limiter

Gradient limiter coefficient

number · default 0.5 · 0.0 to 1.0


## max second order non orthogonal angle

Maximum angle for second order non-orthogonal correction

number · default 90 · 0.0 to 90.0


## central blend

Central differencing blend factor

number · default 0.8


## solve energy

Solve the energy (temperature) transport equation

true or false · default False


## energy variable

Variable transported by the energy equation: temperature, or potential temperature theta = T (p0/p)^(R/cp) for atmospheric cases

default temperature

| Value | What it does | When to use it |
| --- | --- | --- |
| `temperature` (default) |  |  |
| `potential temperature` | Potential temperature $\theta = T (p_0/p)^{R/c_p}$. | The natural choice for atmospheric cases. |


## base state

Hydrostatic base state for a stratified (anelastic) atmosphere. Its presence turns stratification on: density becomes the base-state rho(z) and buoyancy is g (theta - theta_base)/theta_base. Needs a non-zero gravity

choice of settings blocks · not set by default · 'base state' only applies when solver.fluid properties.gravity is set and non-zero and solve energy is True and energy variable is 'potential temperature'


### reference

Reference condition supplying the surface temperature and pressure (e.g. 'IC_1'); defaults to the initialisation reference

text · not set by default


### surface temperature

Temperature at the reference location; overrides the reference condition's value

number · not set by default · > 0.0 K


### surface pressure

Pressure at the reference location; overrides the reference condition's value

number · not set by default · > 0.0 Pa


### kind

Uniform temperature; theta grows as exp(g z / (cp T0))

required

| Value | What it does | When to use it |
| --- | --- | --- |
| `isothermal` |  |  |
| `constant lapse rate` |  |  |
| `constant brunt vaisala` | Uniform stratification $\theta = \theta_0 \exp(N^2 z / g)$. |  |
| `two layer` |  |  |


### lapse rate

-dT/dz; g/cp (about 0.0098) is the neutral dry adiabat

number · default 0.0065 · in K/m


### brunt vaisala frequency

N

number · default 0.01 · >= 0.0 1/s


### mixed layer depth

Depth h of the neutral mixed layer

number · default 100 · > 0.0 m


### upper lapse rate

dtheta/dz above the mixed layer

number · default 0.01 · >= 0.0 K/m


## theta perturbation

Initial potential-temperature perturbation added to the base state (gravity-wave and bubble benchmarks)

settings block · not set by default · 'theta perturbation' only applies when base state is set


### kind

inertia gravity wave: A sin(pi z/H) / (1 + ((x - xc)/a)^2) (Skamarock & Klemp 1994); bubble: A cos^2(pi r/2) inside the ellipse r = |((x - xc)/rx, (z - zc)/rz)| <= 1; random: position-hashed +/-A turbulence seed below 'depth' (GABLS1)

required

| Value | What it does | When to use it |
| --- | --- | --- |
| `inertia gravity wave` | $\theta' = A \sin(\pi z/H) / (1 + ((x-x_c)/a)^2)$ (Skamarock & Klemp 1994). |  |
| `bubble` | $\theta' = A \cos^2(\pi r/2)$ inside the ellipse $r = \|((x-x_c)/r_x, (z-z_c)/r_z)\| \le 1$, zero outside. |  |
| `random` |  |  |


### amplitude

A; negative for a cold bubble

number · required · in K


### centre

[xc, zc]; zc is used by the bubble only

list of numbers · default [0, 0] · in m


### half width

a for the gravity wave, or the bubble x radius rx

number · default 5000 · > 0.0 m


### half height

Bubble z radius rz

number · default 2000 · > 0.0 m


### depth

H in sin(pi z/H) for the gravity wave

number · default 10000 · > 0.0 m


## buoyancy diagnostics

Log the buoyancy source against the momentum diagonal every cycle. Four host syncs per cycle: debugging only

true or false · default False · 'buoyancy diagnostics' only applies when base state is set


## velocity perturbation

Initial random velocity seed for shear-driven turbulence (LES spin-up)

settings block · not set by default


### kind

Position-hashed +/-amplitude seed on all three components

required

| Value | What it does | When to use it |
| --- | --- | --- |
| `random` |  |  |


### amplitude

Peak perturbation on each velocity component

number · required · > 0.0 m/s


### depth

Height below which the seed is applied; zero above

number · default 50 · > 0.0 m


## geostrophic wind

Large-scale forcing u_g: the Coriolis source becomes -f k x (u - u_g), standing in for the synoptic pressure gradient. Needs a non-zero latitude

list of numbers · not set by default · in m/s · 'geostrophic wind' only applies when solver.fluid properties.latitude is set and non-zero


## sponge layer

Height-based wave-absorbing layer below the domain lid. Requires base_state

settings block · not set by default


### sigma max

Peak damping rate at the domain top

number · required · > 0.0 1/s


### start height

Height where the damping ramp begins

number · required · >= 0.0 m


### relax theta

Relax potential temperature toward the base state inside the sponge, as well as velocity. TRUE reproduces the existing behaviour: EnergyEqn.cu applies the sponge to theta whenever a sponge and a base state are present, which the deck's 'target velocity' wording does not convey. Set FALSE for a velocity-only sponge -- the upper boundary then stops being a heat sink, which is what isolates its effect on a stably-stratified case without also letting gravity waves reflect off the lid.

true or false · default True


### target velocity

Velocity the sponge damps toward; unset damps toward rest

list of numbers · not set by default · in m/s


::: {.deck title="equations"}
```python
"equations": {
    "turbulence": {
        "model": "sst",
        "les": "deardorff",
        ...
    },
    ...
},
```
:::

