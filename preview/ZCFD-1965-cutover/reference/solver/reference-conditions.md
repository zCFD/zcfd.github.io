---
title: reference conditions
section: reference
---

# reference conditions

Dictionary of reference conditions used throughout the simulation


## temperature

Static temperature (K)

number · required · >= 0


## pressure

Static pressure (Pa)

number · required · >= 0


## v

Velocity vector [Vx, Vy, Vz] (m/s) or inflow vector specification

point or vector (3 numbers) or settings block · default {vector: [0, 0, 0]}

Guidance: [/guide/choosing/choosing-initialisation-and-reference-state#velocity](/guide/choosing/choosing-initialisation-and-reference-state#velocity)


### vector

— no description —

point or vector (3 numbers) · required

Guidance: [/guide/choosing/choosing-initialisation-and-reference-state#velocity](/guide/choosing/choosing-initialisation-and-reference-state#velocity)


### mach

Mach number to scale magnitude of inflow vector by

number · not set by default · >= 0

Guidance: [/guide/choosing/choosing-initialisation-and-reference-state#velocity](/guide/choosing/choosing-initialisation-and-reference-state#velocity)


## reference length

Reference length (m) used in Reynolds number calculation

number · default 1 · >= 0

Guidance: [/guide/choosing/choosing-initialisation-and-reference-state#viscosity](/guide/choosing/choosing-initialisation-and-reference-state#viscosity)


## profile

Atmospheric profile parameters for specialised flow conditions

settings block · not set by default

Guidance: [/guide/choosing/choosing-initialisation-and-reference-state#velocity-profile](/guide/choosing/choosing-initialisation-and-reference-state#velocity-profile)


### abl

Atmospheric Boundary Layer profile parameters

settings block · not set by default

Guidance: [/guide/choosing/choosing-initialisation-and-reference-state#abl](/guide/choosing/choosing-initialisation-and-reference-state#abl)


#### roughness length

Surface roughness length in meters. Must be positive. This is the aerodynamic roughness z₀ in the log-law profile (not to be confused with 'ground_level', which is a ground datum elevation, not a roughness).

number · required · > 0

Guidance: [/guide/choosing/choosing-initialisation-and-reference-state#roughness_length](/guide/choosing/choosing-initialisation-and-reference-state#roughness_length)


#### friction velocity

Friction velocity in m/s. Must be positive when set. Optional: the solver accepts either friction_velocity or surface_layer_height, and asserts that at least one is set.

number · not set by default · > 0

Guidance: [/guide/choosing/choosing-initialisation-and-reference-state#friction_velocity](/guide/choosing/choosing-initialisation-and-reference-state#friction_velocity)


#### surface layer height

Height of the surface layer (m) that the log-law profile applies within; above this height the profile is clamped. C++ sentinel default is -1.0 (unset): the compressible read sites then derive it from roughness_length and friction_velocity when both are set.

number · not set by default · > 0 · 'surface layer height' only applies when solver.solver settings.type is one of unset, 'compressible'

Guidance: [/guide/choosing/choosing-initialisation-and-reference-state#surface_layer_height](/guide/choosing/choosing-initialisation-and-reference-state#surface_layer_height)


#### monin obukhov length

Monin-Obukhov stability length L (m). Negative values are read as unstable and add a stability correction to the log-law velocity/TKE/epsilon (only when L < 0 — the current C++ never applies a correction for L > 0, i.e. stable stratification is not represented here). Zero is not a valid value. The solver's local default is +1.0 (a positive, 'no correction' value) when the key is absent — this is the effective neutral default. Leave unset for neutral stability.

number · not set by default · 'monin obukhov length' only applies when solver.solver settings.type is one of unset, 'compressible'

Guidance: [/guide/choosing/choosing-initialisation-and-reference-state#monin_obukhov_length](/guide/choosing/choosing-initialisation-and-reference-state#monin_obukhov_length)


#### tke

Reference turbulent kinetic energy (m^2/s^2), scaled by friction_velocity**2 to give the profile's TKE. Only applied when friction_velocity is also set — if friction_velocity is absent, the solver discards this value with a warning and derives TKE from the wall distance instead.

number · not set by default · >= 0 · 'tke' only applies when solver.solver settings.type is one of unset, 'compressible'

Guidance: [/guide/choosing/choosing-initialisation-and-reference-state#abl](/guide/choosing/choosing-initialisation-and-reference-state#abl)


#### up

Unit vector [x, y, z] defining the vertical ('up') direction used with ground_level to compute height above ground as dot(position, up) - ground_level. Default when unset is (0, 0, 1).

point or vector (3 numbers) · not set by default · 'up' only applies when solver.solver settings.type is one of unset, 'compressible'

Guidance: [/guide/choosing/choosing-initialisation-and-reference-state#abl](/guide/choosing/choosing-initialisation-and-reference-state#abl)


#### ground level

Datum elevation of the ground (m) in the mesh's own coordinate system, measured along 'up'. Subtracted from dot(position, up) before the log-law height is computed, as height = min(dot(p, up) - ground_level, surface_layer_height) — it shifts where the profile's height origin sits, it is NOT a measurement or reference height. This is unrelated to the aerodynamic roughness length z₀ (that's 'roughness_length' above) and unrelated to ABLZone.reference_height. NOTE: the initial-condition profile reads this key but never applies it to the initial field — only the farfield BC profile honours it — so a mesh with a non-zero ground datum gets inconsistent IC/BC profiles.

number · default 0 · >= 0 · 'ground level' only applies when solver.solver settings.type is one of unset, 'compressible'

Guidance: [/guide/choosing/choosing-initialisation-and-reference-state#abl](/guide/choosing/choosing-initialisation-and-reference-state#abl)


### field

Profile file name (e.g. .vtp)

text · not set by default

Guidance: [/guide/choosing/choosing-initialisation-and-reference-state#field](/guide/choosing/choosing-initialisation-and-reference-state#field)


### use wall distance

Use wall distance for profile

true or false · not set by default

Guidance: [/guide/choosing/choosing-initialisation-and-reference-state#field](/guide/choosing/choosing-initialisation-and-reference-state#field)


## monitor

Driven-IC update/terminate/prefix contract for a callable reference condition (see ReferenceConditionMonitor). NOT the same concept as output_settings.report.monitor (probe points).

settings block · not set by default

Guidance: [/guide/setting-up/python-functions-in-the-deck#driven-initial-condition](/guide/setting-up/python-functions-in-the-deck#driven-initial-condition)


### update

If explicitly False, suppress applying the driven IC this cycle Absent/None behaves as True.

true or false · not set by default

Guidance: [/guide/setting-up/python-functions-in-the-deck#driven-initial-condition](/guide/setting-up/python-functions-in-the-deck#driven-initial-condition)


### terminate

If True, request solver termination Absent/None behaves as False.

true or false · not set by default

Guidance: [/guide/setting-up/python-functions-in-the-deck#driven-initial-condition](/guide/setting-up/python-functions-in-the-deck#driven-initial-condition)


### prefix

Report-row name prefix for the flattened monitor payload (default 'param' when unset).

text · not set by default

Guidance: [/guide/setting-up/python-functions-in-the-deck#driven-initial-condition](/guide/setting-up/python-functions-in-the-deck#driven-initial-condition)


## total pressure ratio

Total pressure ratio for inflow boundary conditions

number · not set by default · >= 0

Guidance: [/guide/choosing/choosing-initialisation-and-reference-state#reference-conditions](/guide/choosing/choosing-initialisation-and-reference-state#reference-conditions)


## total temperature ratio

Total temperature ratio for inflow boundary conditions

number · not set by default · >= 0

Guidance: [/guide/choosing/choosing-initialisation-and-reference-state#reference-conditions](/guide/choosing/choosing-initialisation-and-reference-state#reference-conditions)


## static pressure ratio

Static pressure ratio for outflow boundary conditions

number · not set by default · >= 0

Guidance: [/guide/choosing/choosing-initialisation-and-reference-state#reference-conditions](/guide/choosing/choosing-initialisation-and-reference-state#reference-conditions)


## reynolds no

Reynolds number. Only valid for viscous or RANS equations.

number · not set by default · >= 0

Guidance: [/guide/choosing/choosing-initialisation-and-reference-state#viscosity](/guide/choosing/choosing-initialisation-and-reference-state#viscosity)


## viscosity

Viscosity. Only valid for viscous or RANS equations.

number · not set by default · >= 0

Guidance: [/guide/choosing/choosing-initialisation-and-reference-state#viscosity](/guide/choosing/choosing-initialisation-and-reference-state#viscosity)


## turbulence intensity

Freestream turbulence intensity (fraction, e.g. 0.01 = 1%)

number · default 0.01 · >= 0

Guidance: [/guide/choosing/choosing-initialisation-and-reference-state#turbulence-intensity-and-eddy-viscosity](/guide/choosing/choosing-initialisation-and-reference-state#turbulence-intensity-and-eddy-viscosity)


## eddy viscosity ratio

Ratio of eddy viscosity to molecular viscosity (μt/μ)

number · default 0.1 · >= 0

Guidance: [/guide/choosing/choosing-initialisation-and-reference-state#turbulence-intensity-and-eddy-viscosity](/guide/choosing/choosing-initialisation-and-reference-state#turbulence-intensity-and-eddy-viscosity)


## ambient turbulence intensity

Ambient turbulence intensity for far-field conditions

number · default 1e-20 · >= 0

Guidance: [/guide/choosing/choosing-initialisation-and-reference-state#turbulence-intensity-and-eddy-viscosity](/guide/choosing/choosing-initialisation-and-reference-state#turbulence-intensity-and-eddy-viscosity)


## ambient eddy viscosity ratio

Ambient eddy viscosity ratio for far-field conditions

number · default 1e-20 · >= 0

Guidance: [/guide/choosing/choosing-initialisation-and-reference-state#turbulence-intensity-and-eddy-viscosity](/guide/choosing/choosing-initialisation-and-reference-state#turbulence-intensity-and-eddy-viscosity)


::: {.deck title="reference conditions"}
```python
{
    "temperature": 300,
    "pressure": 101325,
    ...
}
```
:::

