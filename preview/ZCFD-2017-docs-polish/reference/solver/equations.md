---
title: equations
section: reference
---

# equations

The equations solved, and their turbulence and transport models

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `type` | choice | not set | The form of the flow equations to solve: inviscid Euler, viscous Navier–Stokes with no turbulence model, Reynolds-averaged Navier–Stokes (RANS) or large-eddy simulation (LES). |
| `precondition` | bool | `False` | Enable low mach number preconditioning |
| [`turbulence`](/reference/solver/equations/turbulence) | settings block |  | *rans / les only* · Turbulence model configuration |
| `correction` | choice | `over_relaxed` | *incompressible only* · Non-orthogonal correction method |
| `correction limiter` | float, 0.0 to 1.0 | `0.5` | *incompressible only* · Non-orthogonal correction limiter coefficient |
| `gradient limiter type` | choice | `cellmd` | *incompressible only* · Gradient limiter type |
| `gradient limiter` | float, 0.0 to 1.0 | `0.5` | *incompressible only* · Gradient limiter coefficient |
| `max second order non orthogonal angle` | float, 0.0 to 90.0 | `90` | *incompressible only* · Maximum angle for second order non-orthogonal correction |
| `central blend` | float | `0.8` | *incompressible only* · Central differencing blend factor |
| `solve energy` | bool | `False` | *incompressible only* · Solve the energy (temperature) transport equation |
| `energy variable` | choice | `temperature` | *incompressible only* · Variable transported by the energy equation: temperature, or potential temperature theta = T (p0/p)^(R/cp) for atmospheric cases |
| [`base state`](/reference/solver/equations/base-state) | choice of settings blocks |  | *incompressible only* · Hydrostatic base state for a stratified (anelastic) atmosphere. |
| [`theta perturbation`](/reference/solver/equations/theta-perturbation) | settings block |  | *incompressible only* · Initial potential-temperature perturbation added to the base state (gravity-wave and bubble benchmarks) |
| `buoyancy diagnostics` | bool | `False` | *incompressible only* · Log the buoyancy source against the momentum diagonal every cycle. |
| [`velocity perturbation`](/reference/solver/equations/velocity-perturbation) | settings block |  | *incompressible only* · Initial random velocity seed for shear-driven turbulence (LES spin-up) |
| `geostrophic wind` | list of float, in m/s | not set | *incompressible only* · Large-scale forcing u_g: the Coriolis source becomes -f k x (u - u_g), standing in for the synoptic pressure gradient. |
| [`sponge layer`](/reference/solver/equations/sponge-layer) | settings block |  | *incompressible only* · Height-based wave-absorbing layer below the domain lid. |

::: {.deck title="equations"}
```python
parameters = {
    "solver": {
        "equations": {
            "type": <choice>,
            "precondition": False,
            "turbulence": {...},
            "correction": "over_relaxed",
            "correction limiter": 0.5,
            "gradient limiter type": "cellmd",
            "gradient limiter": 0.5,
            "max second order non orthogonal angle": 90.0,
            "central blend": 0.8,
            "solve energy": False,
            "energy variable": "temperature",
            "base state": {...},
            "theta perturbation": {...},
            "buoyancy diagnostics": False,
            "velocity perturbation": {...},
            "geostrophic wind": [...],
            "sponge layer": {...},
        },
        ...
    },
    ...
}
```
:::

## type

The form of the flow equations to solve: inviscid Euler, viscous Navier–Stokes with no turbulence model, Reynolds-averaged Navier–Stokes (RANS) or large-eddy simulation (LES).

::: facts
**Type** choice · **Default** not set
:::

| Value | What it does |
| --- | --- |
| `euler` | Use the Euler flow equations in the simulation. These are compressible, inviscid flow equations. |
| `viscous` | Use the viscous flow equations. These are compressible, viscid flow equations which do not model turbulence. |
| `rans` | Use the RANS (Reynolds-Averaged Navier-Stokes) equations in the simulation. These are compressible, viscid flow equations with additional terms included to account for the effect of turbulence on the flow without the expense of simulating the turbulent flow structures themselves. |
| `les` | Use the Large Eddy Simulation (LES) equations. |

Guidance: [Choosing an equation set › Equation sets](/guide/choosing/choosing-an-equation-set#equation-sets)

## precondition

Enable low mach number preconditioning

::: facts
**Type** bool · **Default** `False` · **Applies when** solver.time settings.kind is one of unset, 'dual time stepping'
:::

Guidance: [Choosing an equation set › precondition](/guide/choosing/choosing-an-equation-set#precondition)

## correction

Non-orthogonal correction method

::: facts
**Type** choice · **Default** `over_relaxed`
:::

| Value | What it does | When to use it |
| --- | --- | --- |
| `none` | No non-orthogonal correction. The implicit face-normal gradient uses the full face area vector and the explicit correction is zero. | Only for meshes that are close to orthogonal. |
| `orthogonal` | Splits the face area vector $\mathbf{S}$ into an implicit part $\boldsymbol{\Delta} = \|\mathbf{S}\|\,\hat{\mathbf{d}}$ along the line between cell centres, with the remainder treated explicitly. |  |
| `minimum` | Takes the implicit part as the projection of $\mathbf{S}$ on the line between cell centres, $\boldsymbol{\Delta} = (\mathbf{d}\cdot\mathbf{S}/\mathbf{d}\cdot\mathbf{d})\,\mathbf{d}$, which keeps the explicit remainder smallest. |  |
| `over_relaxed` (default) | Takes the implicit part as $\boldsymbol{\Delta} = \mathbf{d}\,\|\mathbf{S}\|^2/(\mathbf{d}\cdot\mathbf{S})$, which grows as the mesh becomes more non-orthogonal. | The default. |

Guidance: [Choosing an equation set › Incompressible equation sets](/guide/choosing/choosing-an-equation-set#incompressible-viscous)

## gradient limiter type

Gradient limiter type

::: facts
**Type** choice · **Default** `cellmd`
:::

| Value | What it does |
| --- | --- |
| `cellmd` (default) | More robust on highly non-orthogonal meshes. |
| `cell` | Less dissipative. |

## energy variable

Variable transported by the energy equation: temperature, or potential temperature theta = T (p0/p)^(R/cp) for atmospheric cases

::: facts
**Type** choice · **Default** `temperature`
:::

| Value | What it does | When to use it |
| --- | --- | --- |
| `temperature` (default) | The energy equation transports static temperature $T$. | The default, for heat transfer without stratification. |
| `potential temperature` | Potential temperature $\theta = T (p_0/p)^{R/c_p}$. | The natural choice for atmospheric cases. |

## buoyancy diagnostics

Log the buoyancy source against the momentum diagonal every cycle. Four host syncs per cycle: debugging only

::: facts
**Type** bool · **Default** `False` · **Applies when** base state is set
:::

## geostrophic wind

Large-scale forcing u_g: the Coriolis source becomes -f k x (u - u_g), standing in for the synoptic pressure gradient. Needs a non-zero latitude

::: facts
**Type** list of float, in m/s · **Default** not set · **Applies when** solver.fluid properties.latitude is set and non-zero
:::

