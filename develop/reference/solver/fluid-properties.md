---
title: fluid properties
section: reference
---

# fluid properties

Fluid model properties and definition

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `material` | str | `ideal gas` | Fluid material model |
| `gamma` | float, > 1.0 | `1.4` | Ratio of specific heats Cp/Cv |
| `gas constant` | float, > 0 | `287` | Specific gas constant (J/(kg·K)) |
| `sutherlands const` | float, > 0 | `110.4` | Sutherland's reference temperature (K) |
| `prandtl no` | float, > 0 | `0.72` | Molecular Prandtl number |
| `gravity` | vector (3 floats), in m/s^2 | not set | Gravitational acceleration vector, for example [0, 0, -9.81]. |
| `latitude` | float, -90 to 90 deg | not set | Latitude for the f-plane Coriolis force, f = 2 Omega sin(latitude), positive north. |
| `planet rotation` | float, > 0 rad/s | not set | Planetary rotation rate for the Coriolis parameter f = 2 Omega sin(latitude). |
| `thermal expansion coeff` | float, > 0 1/K | not set | Thermal expansion coefficient beta for Boussinesq buoyancy. |
| `turbulent prandtl no` | float, > 0 | `0.9` | *viscous only* · Turbulent Prandtl number |

::: {.deck title="fluid properties"}
```python
parameters = {
    "solver": {
        "fluid properties": {
            "material": "ideal gas",
            "gamma": 1.4,
            "gas constant": 287.0,
            "sutherlands const": 110.4,
            "prandtl no": 0.72,
            "gravity": <[x, y, z]>,
            "latitude": <float>,
            "planet rotation": <float>,
            "thermal expansion coeff": <float>,
            "turbulent prandtl no": 0.9,
        },
        ...
    },
    ...
}
```
:::

## gravity

Gravitational acceleration vector, for example [0, 0, -9.81]. Drives Boussinesq and anelastic buoyancy, sets the vertical for the Coriolis force and the stratified turbulence terms, and enters the Monin-Obukhov wall law. Omitted means no gravity.

::: facts
**Type** vector (3 floats), in m/s^2 · **Default** not set · **Applies when** solver.solver settings.type is 'incompressible'
:::

## latitude

Latitude for the f-plane Coriolis force, f = 2 Omega sin(latitude), positive north. Needs a non-zero gravity, which sets the local vertical. Omitted means no Coriolis force.

::: facts
**Type** float, -90 to 90 deg · **Default** not set · **Applies when** solver.solver settings.type is 'incompressible' and solver.fluid properties.gravity is set and non-zero
:::

## planet rotation

Planetary rotation rate for the Coriolis parameter f = 2 Omega sin(latitude). Needs a non-zero latitude. Defaults to Earth's sidereal rate, 7.292115e-5

::: facts
**Type** float, > 0 rad/s · **Default** not set · **Applies when** solver.solver settings.type is 'incompressible' and solver.fluid properties.latitude is set and non-zero
:::

## thermal expansion coeff

Thermal expansion coefficient beta for Boussinesq buoyancy. The solver stores the dimensionless group beta*Tref, so the buoyancy source becomes -g_nondim * (beta*Tref) * (theta - 1). Needs a non-zero gravity. Ignored when base_state is set.

::: facts
**Type** float, > 0 1/K · **Default** not set · **Applies when** solver.solver settings.type is 'incompressible' and solver.fluid properties.gravity is set and non-zero and solver.equations.solve energy is True
:::

