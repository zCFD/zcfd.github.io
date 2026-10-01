---
title: fluid properties
section: reference
---

# fluid properties

Fluid model properties and definition


## material

Fluid material model

text · default ideal gas


## gamma

Ratio of specific heats Cp/Cv

number · default 1.4 · > 1.0


## gas constant

Specific gas constant (J/(kg·K))

number · default 287 · > 0


## sutherlands const

Sutherland's reference temperature (K)

number · default 110.4 · > 0


## prandtl no

Molecular Prandtl number

number · default 0.72 · > 0


## gravity

Gravitational acceleration vector, for example [0, 0, -9.81]. Drives Boussinesq and anelastic buoyancy, sets the vertical for the Coriolis force and the stratified turbulence terms, and enters the Monin-Obukhov wall law. Omitted means no gravity.

point or vector (3 numbers) · not set by default · in m/s^2 · 'gravity' only applies when solver.solver settings.type is 'incompressible'


## latitude

Latitude for the f-plane Coriolis force, f = 2 Omega sin(latitude), positive north. Needs a non-zero gravity, which sets the local vertical. Omitted means no Coriolis force.

number · not set by default · -90 to 90 deg · 'latitude' only applies when solver.solver settings.type is 'incompressible' and solver.fluid properties.gravity is set and non-zero


## planet rotation

Planetary rotation rate for the Coriolis parameter f = 2 Omega sin(latitude). Needs a non-zero latitude. Defaults to Earth's sidereal rate, 7.292115e-5

number · not set by default · > 0 rad/s · 'planet rotation' only applies when solver.solver settings.type is 'incompressible' and solver.fluid properties.latitude is set and non-zero


## thermal expansion coeff

Thermal expansion coefficient beta for Boussinesq buoyancy. The solver stores the dimensionless group beta*Tref, so the buoyancy source becomes -g_nondim * (beta*Tref) * (theta - 1). Needs a non-zero gravity. Ignored when base_state is set.

number · not set by default · > 0 1/K · 'thermal expansion coeff' only applies when solver.solver settings.type is 'incompressible' and solver.fluid properties.gravity is set and non-zero and solver.equations.solve energy is True


## turbulent prandtl no

Turbulent Prandtl number

number · default 0.9 · > 0


::: {.deck title="fluid properties"}
```python
"fluid properties": {
    ...
},
```
:::

