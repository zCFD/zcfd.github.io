---
title: turbulence
section: reference
---

# turbulence

Turbulence model configuration

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `model` | choice | required | *turbulence only* · RANS turbulence model (sst = Menter SST k-ω, sas = Scale-Adaptive Simulation, sa-neg = Spalart-Allmaras Negative, sst-transition = γ-Reθ transition) |
| `hybrid` | choice | not set | *turbulence only* · Hybrid RANS-LES approach (DES = Detached Eddy Simulation, DDES = Delayed DES, IDDES = Improved Delayed DES, SAS = Scale-Adaptive Simulation) |
| `limit mut` | bool | `True` | *turbulence only* · Limit eddy viscosity in SST model |
| `limit gradient k` | float, 0.01 to 1.0 | not set | *turbulence only* · Gradient limiter coefficient for turbulence kinetic energy k |
| `qcr` | choice | not set | *turbulence only* · QCR variant year (2000, 2020, or 2021) |
| `rotation correction` | bool | `False` | *turbulence only* · Enable the rotation correction. |
| `production` | choice | not set | *turbulence only* · Production term model for SST (vorticity = SST-V, strain-incompressible = strain-based for incompressible, strain-compressible = strain-based for compressible, kato-launder = Kato-Launder). |
| `betastar` | float | `0.09` | *turbulence only* · Constant in the dissipation term on the k equation in the SST model |
| `cdes kw` | float | `0.78` | *turbulence only* · The k-omega part of the blended C_DES in SST |
| `cdes keps` | float | `0.61` | *turbulence only* · The k-epsilon part of the blended C_DES in SST |
| `cd1` | float | `20` | *turbulence only* · Constant in the f_dt blending function in DDES and IDDES |
| `cd2` | int | `3` | *turbulence only* · Constant in the f_dt blending function in DDES and IDDES |
| `cw` | float | `0.15` | Constant in the length scale calculation in IDDES |
| `a1` | float | `0.31` | *turbulence only* · Constant in the eddy viscosity limiter in SST |
| `cdes` | float | `0.65` | *turbulence only* · C_DES constant used for SA-neg based hybrid RANS/LES models |
| `ca1` | float | `2` | *turbulence only* · Constant in the production of the gamma equation in the transition model |
| `ca2` | float | `0.06` | *turbulence only* · Constant in the destruction term for gamma equation in the transition model |
| `ce1` | float | `1` | *turbulence only* · Constant in the production term of the gamma equation in the transition model |
| `ce2` | float | `50` | *turbulence only* · Constant in the destruction term for gamma equation in the transition model |
| `cthetat` | float | `0.03` | *turbulence only* · Constant in the Re-theta transition correlation in the transition model |
| `sigmagamma` | float | `1` | *turbulence only* · Constant in the transition model in the compressible solver |
| `sigmathetat` | float | `2` | *turbulence only* · Constant in the transition model in the compressible solver |
| `separation correction` | bool | `True` | *turbulence only* · Activates the separation correction for the transition model |
| `les cfl limit` | float, >= 0.0 | not set | *turbulence only* · Restrict the LES branch of the DES/DDES/IDDES length scale to cells whose nominal CFL is at or below this limit. 0 (the default) disables the shield, which is also always inactive unless the run is time accurate |
| `les cfl width` | float, > 0.0 | not set | *turbulence only* · Width of the blend above les_cfl_limit. |
| `les turnover coefficient` | float, >= 0.0 | not set | *turbulence only* · Weight on the eddy turnover contribution to the shielded CFL. |
| `les` | choice | required | *les only* · LES subgrid-scale model (wale = Wall-Adapting Local Eddy-viscosity, deardorff = 1.5-order prognostic SGS-TKE with a stratification-limited length scale, none = no SGS model) |
| `wall damping` | bool | not set | *les only* · Enable wall damping for LES model |
| `relax` | float, 0.1 to 1.0 | `0.5` | *les only* · Under-relaxation factor for the SGS turbulence equation. |
| `eps` | float | `0.41` | *les only* · von Kármán constant for WALE near-wall scaling |

::: {.deck title="turbulence"}
```python
parameters = {
    "solver": {
        "equations": {
            "turbulence": {
                "model": <choice>,
                "hybrid": <choice>,
                "limit mut": True,
                "limit gradient k": <float>,
                "qcr": <choice>,
                "rotation correction": False,
                "production": <choice>,
                "betastar": 0.09,
                "cdes kw": 0.78,
                "cdes keps": 0.61,
                "cd1": 20.0,
                "cd2": 3,
                "cw": 0.15,
                "a1": 0.31,
                "cdes": 0.65,
                "ca1": 2.0,
                "ca2": 0.06,
                "ce1": 1.0,
                "ce2": 50.0,
                "cthetat": 0.03,
                "sigmagamma": 1.0,
                "sigmathetat": 2.0,
                "separation correction": True,
                "les cfl limit": <float>,
                "les cfl width": <float>,
                "les turnover coefficient": <float>,
                "les": <choice>,
                "wall damping": <bool>,
                "relax": 0.5,
                "eps": 0.41,
            },
            ...
        },
        ...
    },
    ...
}
```
:::

## model

RANS turbulence model (sst = Menter SST k-ω, sas = Scale-Adaptive Simulation, sa-neg = Spalart-Allmaras Negative, sst-transition = γ-Reθ transition)

::: facts
**Type** choice · **Required** yes
:::

| Value | What it does |
| --- | --- |
| `sst` | The Menter Shear Stress Transport Turbulence Model (https://turbmodels.larc.nasa.gov/sst.html) |
| `sas` | Scale-Adaptive Simulation, run as a standalone RANS model |
| `sa-neg` | Negative Spalart-Allmaras turbulence model (https://turbmodels.larc.nasa.gov/spalart.html) |
| `sst-transition` | The Langtry-Menter 4-equation Transitional SST Model (https://turbmodels.larc.nasa.gov/langtrymenter_4eqn.html) |
| `spalart-allmaras` | Spalart-Allmaras turbulence model (https://turbmodels.larc.nasa.gov/spalart.html) |

Guidance: [Choosing a turbulence model](/guide/choosing/choosing-a-turbulence-model)

## hybrid

Hybrid RANS-LES approach (DES = Detached Eddy Simulation, DDES = Delayed DES, IDDES = Improved Delayed DES, SAS = Scale-Adaptive Simulation)

::: facts
**Type** choice · **Default** not set
:::

| Value | What it does |
| --- | --- |
| `DES` | Detached Eddy Simulation |
| `DDES` | Delayed Detached Eddy Simulation |
| `IDDES` | Improved Delayed Detached Eddy Simulation |
| `SAS` | Scale-Adaptive Simulation run as the hybrid branch of `model` |

Guidance: [Choosing a turbulence model › Hybrid RANS–LES](/guide/choosing/choosing-a-turbulence-model#hybrid)

## qcr

QCR variant year (2000, 2020, or 2021)

::: facts
**Type** choice · **Default** not set
:::

| Value | What it does |
| --- | --- |
| `2000` | [QCR 2000](<https://doi.org/10.1016/S0142-727X(00)00007-2>) |
| `2020` | [QCR 2020](https://doi.org/10.2514/1.J059683) |
| `2021` | [QCR 2021](https://doi.org/10.1017/aer.2021.42) |

Guidance: [Choosing a turbulence model › qcr](/guide/choosing/choosing-a-turbulence-model#qcr)

## rotation correction

Enable the rotation correction. Read by both turbulence models, in their own forms: SST applies Hellsten's f4 = 1/(1 + Crc*Ri) to the omega destruction term, and SA adds Crot*min(0, S - Omega) to production (Dacles-Mariani / Spalart-Shur).

::: facts
**Type** bool · **Default** `False`
:::

## production

Production term model for SST (vorticity = SST-V, strain-incompressible = strain-based for incompressible, strain-compressible = strain-based for compressible, kato-launder = Kato-Launder). When omitted the solver build chooses: kato-launder for sst-transition, vorticity otherwise (the solver's Menter SST defaults) — a schema default here would silently override the transition build's choice.

::: facts
**Type** choice · **Default** not set
:::

| Value | What it does |
| --- | --- |
| `vorticity` | The vorticity based production term (SST-V) $P_m=\mu_t\Omega_v^2-\frac{2}{3}\rho k \delta_{ij}\frac{\partial u_i}{\partial x_j}$ |
| `strain-incompressible` | The strain based production term for incompressible flows $P_m=\mu_t S^2$ |
| `strain-compressible` | The strain based production term for compressible flows $P_m=\mu_t S^2 -\frac{2}{3}\rho k \delta_{ij}\frac{\partial u_i}{\partial x_j}$ |
| `kato-launder` | The Kato-Launder source term $P_m=\mu_t S\Omega_v -\frac{2}{3}\rho k \delta_{ij}\frac{\partial u_i}{\partial x_j}$ |

Guidance: [Choosing a turbulence model › production](/guide/choosing/choosing-a-turbulence-model#production)

## betastar

Constant in the dissipation term on the k equation in the SST model

::: facts
**Type** float · **Default** `0.09`
:::

Guidance: [Choosing a turbulence model › Advanced parameters for turbulence models](/guide/choosing/choosing-a-turbulence-model#advanced-parameters-for-turbulence-models)

## cdes kw

The k-omega part of the blended C_DES in SST

::: facts
**Type** float · **Default** `0.78`
:::

Guidance: [Choosing a turbulence model › Advanced parameters for turbulence models](/guide/choosing/choosing-a-turbulence-model#advanced-parameters-for-turbulence-models)

## cdes keps

The k-epsilon part of the blended C_DES in SST

::: facts
**Type** float · **Default** `0.61`
:::

Guidance: [Choosing a turbulence model › Advanced parameters for turbulence models](/guide/choosing/choosing-a-turbulence-model#advanced-parameters-for-turbulence-models)

## cd1

Constant in the f_dt blending function in DDES and IDDES

::: facts
**Type** float · **Default** `20`
:::

Guidance: [Choosing a turbulence model › Advanced parameters for turbulence models](/guide/choosing/choosing-a-turbulence-model#advanced-parameters-for-turbulence-models)

## cd2

Constant in the f_dt blending function in DDES and IDDES

::: facts
**Type** int · **Default** `3`
:::

Guidance: [Choosing a turbulence model › Advanced parameters for turbulence models](/guide/choosing/choosing-a-turbulence-model#advanced-parameters-for-turbulence-models)

## cw

Constant in the length scale calculation in IDDES

::: facts
**Type** float · **Default** `0.15`
:::

Guidance: [Choosing a turbulence model › Advanced parameters for turbulence models](/guide/choosing/choosing-a-turbulence-model#advanced-parameters-for-turbulence-models)

## a1

Constant in the eddy viscosity limiter in SST

::: facts
**Type** float · **Default** `0.31`
:::

Guidance: [Choosing a turbulence model › Advanced parameters for turbulence models](/guide/choosing/choosing-a-turbulence-model#advanced-parameters-for-turbulence-models)

## cdes

C_DES constant used for SA-neg based hybrid RANS/LES models

::: facts
**Type** float · **Default** `0.65`
:::

Guidance: [Choosing a turbulence model › Advanced parameters for turbulence models](/guide/choosing/choosing-a-turbulence-model#advanced-parameters-for-turbulence-models)

## ca1

Constant in the production of the gamma equation in the transition model

::: facts
**Type** float · **Default** `2`
:::

Guidance: [Choosing a turbulence model › Advanced parameters for turbulence models](/guide/choosing/choosing-a-turbulence-model#advanced-parameters-for-turbulence-models)

## ca2

Constant in the destruction term for gamma equation in the transition model

::: facts
**Type** float · **Default** `0.06`
:::

Guidance: [Choosing a turbulence model › Advanced parameters for turbulence models](/guide/choosing/choosing-a-turbulence-model#advanced-parameters-for-turbulence-models)

## ce1

Constant in the production term of the gamma equation in the transition model

::: facts
**Type** float · **Default** `1`
:::

Guidance: [Choosing a turbulence model › Advanced parameters for turbulence models](/guide/choosing/choosing-a-turbulence-model#advanced-parameters-for-turbulence-models)

## ce2

Constant in the destruction term for gamma equation in the transition model

::: facts
**Type** float · **Default** `50`
:::

Guidance: [Choosing a turbulence model › Advanced parameters for turbulence models](/guide/choosing/choosing-a-turbulence-model#advanced-parameters-for-turbulence-models)

## cthetat

Constant in the Re-theta transition correlation in the transition model

::: facts
**Type** float · **Default** `0.03`
:::

Guidance: [Choosing a turbulence model › Advanced parameters for turbulence models](/guide/choosing/choosing-a-turbulence-model#advanced-parameters-for-turbulence-models)

## sigmagamma

Constant in the transition model in the compressible solver

::: facts
**Type** float · **Default** `1`
:::

Guidance: [Choosing a turbulence model › Advanced parameters for turbulence models](/guide/choosing/choosing-a-turbulence-model#advanced-parameters-for-turbulence-models)

## sigmathetat

Constant in the transition model in the compressible solver

::: facts
**Type** float · **Default** `2`
:::

Guidance: [Choosing a turbulence model › Advanced parameters for turbulence models](/guide/choosing/choosing-a-turbulence-model#advanced-parameters-for-turbulence-models)

## separation correction

Activates the separation correction for the transition model

::: facts
**Type** bool · **Default** `True`
:::

Guidance: [Choosing a turbulence model › Advanced parameters for turbulence models](/guide/choosing/choosing-a-turbulence-model#advanced-parameters-for-turbulence-models)

## les cfl limit

Restrict the LES branch of the DES/DDES/IDDES length scale to cells whose nominal CFL is at or below this limit. 0 (the default) disables the shield, which is also always inactive unless the run is time accurate

::: facts
**Type** float, >= 0.0 · **Default** not set · **Applies when** solver.time settings.type is 'unsteady'
:::

Guidance: [Choosing a turbulence model › Shielding the LES branch by CFL](/guide/choosing/choosing-a-turbulence-model#shielding-the-les-branch-by-cfl)

## les cfl width

Width of the blend above les_cfl_limit. The shield ramps from LES at les_cfl_limit to full RANS at les_cfl_limit plus this width.

::: facts
**Type** float, > 0.0 · **Default** not set · **Applies when** solver.time settings.type is 'unsteady'
:::

Guidance: [Choosing a turbulence model › Shielding the LES branch by CFL](/guide/choosing/choosing-a-turbulence-model#shielding-the-les-branch-by-cfl)

## les turnover coefficient

Weight on the eddy turnover contribution to the shielded CFL. The time step has to resolve both the transport of an eddy across the cell and the eddy's own turnover, and the shield takes whichever is larger. 0 leaves the transport only criterion, which cannot see a cell whose speed relative to the mesh is near zero. Defaults to 1, and has no effect unless les_cfl_limit is set

::: facts
**Type** float, >= 0.0 · **Default** not set · **Applies when** solver.time settings.type is 'unsteady'
:::

Guidance: [Choosing a turbulence model › les_turnover_coefficient](/guide/choosing/choosing-a-turbulence-model#les_turnover_coefficient)

## les

LES subgrid-scale model (wale = Wall-Adapting Local Eddy-viscosity, deardorff = 1.5-order prognostic SGS-TKE with a stratification-limited length scale, none = no SGS model)

::: facts
**Type** choice · **Required** yes
:::

| Value | What it does | When to use it |
| --- | --- | --- |
| `none` | Implicit LES (no explicit SGS model). |  |
| `wale` | The Wall-Adapting Local Eddy-viscosity model. |  |
| `deardorff` | The Deardorff 1.5-order closure, which transports the subgrid turbulent kinetic energy $e$ and limits the mixing length under stable stratification. The eddy viscosity is $0.1\,l\sqrt{e}$ and the heat diffusivity is $(1 + 2l/\Delta)$ times it. | For stratified atmospheric boundary layers with the incompressible solver. The compressible solver does not implement it. |

Guidance: [Choosing a turbulence model › LES sub-grid models](/guide/choosing/choosing-a-turbulence-model#les)

## relax

Under-relaxation factor for the SGS turbulence equation. Read UNCONDITIONALLY by the C++ (IncompSolverData.h initKernels, turbulence.relax), so it must always be present in the emitted dict -- it carried a default of 0.5 in the legacy schema and was lost when the schemas moved, leaving the deardorff path with no way to supply it.

::: facts
**Type** float, 0.1 to 1.0 · **Default** `0.5`
:::

