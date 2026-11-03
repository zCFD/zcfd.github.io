---
title: base state
section: reference
---

# base state

Hydrostatic base state for a stratified (anelastic) atmosphere. Its presence turns stratification on: density becomes the base-state rho(z) and buoyancy is g (theta - theta_base)/theta_base. Needs a non-zero gravity

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `reference` | str | not set | Reference condition supplying the surface temperature and pressure (e.g. |
| `surface temperature` | float, > 0.0 K | not set | Temperature at the reference location; overrides the reference condition's value |
| `surface pressure` | float, > 0.0 Pa | not set | Pressure at the reference location; overrides the reference condition's value |
| `kind` | choice | required | Uniform temperature; theta grows as exp(g z / (cp T0)) |
| `lapse rate` | float, in K/m | `0.0065` | *constant lapse rate only* · -dT/dz; g/cp (about 0.0098) is the neutral dry adiabat |
| `brunt vaisala frequency` | float, >= 0.0 1/s | `0.01` | *constant brunt vaisala only* · N |
| `mixed layer depth` | float, > 0.0 m | `100` | *two layer only* · Depth h of the neutral mixed layer |
| `upper lapse rate` | float, >= 0.0 K/m | `0.01` | *two layer only* · dtheta/dz above the mixed layer |

::: {.deck title="base state"}
```python
parameters = {
    "solver": {
        "equations": {
            "base state": {
                "reference": <str>,
                "surface temperature": <float>,
                "surface pressure": <float>,
                "kind": <choice>,
                "lapse rate": 0.0065,
                "brunt vaisala frequency": 0.01,
                "mixed layer depth": 100.0,
                "upper lapse rate": 0.01,
            },
            ...
        },
        ...
    },
    ...
}
```
:::

## reference

Reference condition supplying the surface temperature and pressure (e.g. 'IC_1'); defaults to the initialisation reference

::: facts
**Type** str · **Default** not set
:::

## kind

Uniform temperature; theta grows as exp(g z / (cp T0))

::: facts
**Type** choice · **Required** yes
:::

| Value | What it does | When to use it |
| --- | --- | --- |
| `isothermal` | Uniform temperature $T_0$, so potential temperature grows with height as $\theta = \theta_0 \exp(g z / (c_p T_0))$. |  |
| `constant lapse rate` | Temperature falls linearly with height, $T = T_0 - \Gamma z$, with $\Gamma$ set by `lapse_rate`. |  |
| `constant brunt vaisala` | Uniform stratification $\theta = \theta_0 \exp(N^2 z / g)$. |  |
| `two layer` | A neutral mixed layer of uniform $\theta_0$ up to `mixed_layer_depth`, capped by stable stratification in which $\theta$ rises at `upper_lapse_rate`. | The GABLS1 stable boundary layer set-up. |

