---
title: reference conditions
section: reference
---

# reference conditions

Dictionary of reference conditions used throughout the simulation

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `temperature` | float, >= 0 | required | Static temperature (K) |
| `pressure` | float, >= 0 | required | Static pressure (Pa) |
| [`v`](/reference/solver/reference-conditions/v) | vector (3 floats) or settings block |  | Velocity vector [Vx, Vy, Vz] (m/s) or inflow vector specification |
| `reference length` | float, >= 0 | `1` | Reference length (m) used in Reynolds number calculation |
| [`profile`](/reference/solver/reference-conditions/profile) | settings block |  | Atmospheric profile parameters for specialised flow conditions |
| `total pressure ratio` | float, >= 0 | not set | Total pressure ratio for inflow boundary conditions |
| `total temperature ratio` | float, >= 0 | not set | Total temperature ratio for inflow boundary conditions |
| `static pressure ratio` | float, >= 0 | not set | Static pressure ratio for outflow boundary conditions |
| `reynolds no` | float, >= 0 | not set | *viscous / rans only* · Reynolds number. |
| `viscosity` | float, >= 0 | not set | *viscous / rans only* · Viscosity. |
| `turbulence intensity` | float, >= 0 | `0.01` | *rans only* · Freestream turbulence intensity (fraction, e.g. 0.01 = 1%) |
| `eddy viscosity ratio` | float, >= 0 | `0.1` | *rans only* · Ratio of eddy viscosity to molecular viscosity (μt/μ) |
| `ambient turbulence intensity` | float, >= 0 | `1e-20` | *rans only* · Ambient turbulence intensity for far-field conditions |
| `ambient eddy viscosity ratio` | float, >= 0 | `1e-20` | *rans only* · Ambient eddy viscosity ratio for far-field conditions |

::: {.deck title="reference conditions"}
```python
parameters = {
    "solver": {
        "reference conditions": {
            "<name>": {
                "temperature": <float>,
                "pressure": <float>,
                "v": {"vector": [0.0, 0.0, 0.0]},
                "reference length": 1.0,
                "profile": {...},
                "total pressure ratio": <float>,
                "total temperature ratio": <float>,
                "static pressure ratio": <float>,
                "reynolds no": <float>,
                "viscosity": <float>,
                "turbulence intensity": 0.01,
                "eddy viscosity ratio": 0.1,
                "ambient turbulence intensity": 1e-20,
                "ambient eddy viscosity ratio": 1e-20,
            },
        },
        ...
    },
    ...
}
```
:::

## reference length

Reference length (m) used in Reynolds number calculation

::: facts
**Type** float, >= 0 · **Default** `1`
:::

Guidance: [Choosing initialisation and reference state › Viscosity](/guide/choosing/choosing-initialisation-and-reference-state#viscosity)

## total pressure ratio

Total pressure ratio for inflow boundary conditions

::: facts
**Type** float, >= 0 · **Default** not set
:::

Guidance: [Choosing initialisation and reference state › Reference conditions](/guide/choosing/choosing-initialisation-and-reference-state#reference-conditions)

## total temperature ratio

Total temperature ratio for inflow boundary conditions

::: facts
**Type** float, >= 0 · **Default** not set
:::

Guidance: [Choosing initialisation and reference state › Reference conditions](/guide/choosing/choosing-initialisation-and-reference-state#reference-conditions)

## static pressure ratio

Static pressure ratio for outflow boundary conditions

::: facts
**Type** float, >= 0 · **Default** not set
:::

Guidance: [Choosing initialisation and reference state › Reference conditions](/guide/choosing/choosing-initialisation-and-reference-state#reference-conditions)

## reynolds no

Reynolds number. Only valid for viscous or RANS equations.

::: facts
**Type** float, >= 0 · **Default** not set
:::

Guidance: [Choosing initialisation and reference state › Viscosity](/guide/choosing/choosing-initialisation-and-reference-state#viscosity)

## viscosity

Viscosity. Only valid for viscous or RANS equations.

::: facts
**Type** float, >= 0 · **Default** not set
:::

Guidance: [Choosing initialisation and reference state › Viscosity](/guide/choosing/choosing-initialisation-and-reference-state#viscosity)

## turbulence intensity

Freestream turbulence intensity (fraction, e.g. 0.01 = 1%)

::: facts
**Type** float, >= 0 · **Default** `0.01`
:::

Guidance: [Choosing initialisation and reference state › Turbulence intensity and eddy viscosity](/guide/choosing/choosing-initialisation-and-reference-state#turbulence-intensity-and-eddy-viscosity)

## eddy viscosity ratio

Ratio of eddy viscosity to molecular viscosity (μt/μ)

::: facts
**Type** float, >= 0 · **Default** `0.1`
:::

Guidance: [Choosing initialisation and reference state › Turbulence intensity and eddy viscosity](/guide/choosing/choosing-initialisation-and-reference-state#turbulence-intensity-and-eddy-viscosity)

## ambient turbulence intensity

Ambient turbulence intensity for far-field conditions

::: facts
**Type** float, >= 0 · **Default** `1e-20`
:::

Guidance: [Choosing initialisation and reference state › Turbulence intensity and eddy viscosity](/guide/choosing/choosing-initialisation-and-reference-state#turbulence-intensity-and-eddy-viscosity)

## ambient eddy viscosity ratio

Ambient eddy viscosity ratio for far-field conditions

::: facts
**Type** float, >= 0 · **Default** `1e-20`
:::

Guidance: [Choosing initialisation and reference state › Turbulence intensity and eddy viscosity](/guide/choosing/choosing-initialisation-and-reference-state#turbulence-intensity-and-eddy-viscosity)

