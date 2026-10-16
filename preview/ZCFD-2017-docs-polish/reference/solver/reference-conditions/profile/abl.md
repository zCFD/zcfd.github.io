---
title: abl
section: reference
---

# abl

Atmospheric Boundary Layer profile parameters

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `roughness length` | float, > 0 | required | Surface roughness length in meters. |
| `friction velocity` | float, > 0 | not set | Friction velocity in m/s. |
| `surface layer height` | float, > 0 | not set | Height of the surface layer (m) that the log-law profile applies within; above this height the profile is clamped. |
| `monin obukhov length` | float | not set | Monin-Obukhov stability length L (m). |
| `tke` | float, >= 0 | not set | Reference turbulent kinetic energy (m^2/s^2), scaled by friction_velocity**2 to give the profile's TKE. |
| `up` | vector (3 floats) | not set | Unit vector [x, y, z] defining the vertical ('up') direction used with ground_level to compute height above ground as dot(position, up) - ground_level. |
| `ground level` | float, >= 0 | `0` | Datum elevation of the ground (m) in the mesh's own coordinate system, measured along 'up'. |

::: {.deck title="abl"}
```python
parameters = {
    "solver": {
        "reference conditions": {
            "<name>": {
                "profile": {
                    "abl": {
                        "roughness length": <float>,
                        "friction velocity": <float>,
                        "surface layer height": <float>,
                        "monin obukhov length": <float>,
                        "tke": <float>,
                        "up": <[x, y, z]>,
                        "ground level": 0.0,
                    },
                    ...
                },
                ...
            },
        },
        ...
    },
    ...
}
```
:::

## roughness length

Surface roughness length in meters. Must be positive. This is the aerodynamic roughness z₀ in the log-law profile (not to be confused with 'ground_level', which is a ground datum elevation, not a roughness).

::: facts
**Type** float, > 0 · **Required** yes
:::

Guidance: [Choosing initialisation and reference state › roughness_length](/guide/choosing/choosing-initialisation-and-reference-state#roughness_length)

## friction velocity

Friction velocity in m/s. Must be positive when set. The compressible solver needs friction_velocity, surface_layer_height or both.

::: facts
**Type** float, > 0 · **Default** not set · **Applies when** 'friction velocity' is required when solver.solver settings.type is 'compressible' and surface layer height is unset
:::

Guidance: [Choosing initialisation and reference state › friction_velocity](/guide/choosing/choosing-initialisation-and-reference-state#friction_velocity)

## surface layer height

Height of the surface layer (m) that the log-law profile applies within; above this height the profile is clamped. C++ sentinel default is -1.0 (unset): the compressible read sites then derive it from roughness_length and friction_velocity when both are set.

::: facts
**Type** float, > 0 · **Default** not set · **Applies when** solver.solver settings.type is one of unset, 'compressible'
:::

Guidance: [Choosing initialisation and reference state › surface_layer_height](/guide/choosing/choosing-initialisation-and-reference-state#surface_layer_height)

## monin obukhov length

Monin-Obukhov stability length L (m). Negative values are read as unstable and add a stability correction to the log-law velocity/TKE/epsilon (only when L < 0 — the current C++ never applies a correction for L > 0, i.e. stable stratification is not represented here). Zero is not a valid value. The solver's local default is +1.0 (a positive, 'no correction' value) when the key is absent — this is the effective neutral default. Leave unset for neutral stability.

::: facts
**Type** float · **Default** not set · **Applies when** solver.solver settings.type is one of unset, 'compressible'
:::

Guidance: [Choosing initialisation and reference state › monin_obukhov_length](/guide/choosing/choosing-initialisation-and-reference-state#monin_obukhov_length)

## tke

Reference turbulent kinetic energy (m^2/s^2), scaled by friction_velocity**2 to give the profile's TKE. Only applied when friction_velocity is also set — if friction_velocity is absent, the solver discards this value with a warning and derives TKE from the wall distance instead.

::: facts
**Type** float, >= 0 · **Default** not set · **Applies when** solver.solver settings.type is one of unset, 'compressible'
:::

Guidance: [Choosing initialisation and reference state › ABL](/guide/choosing/choosing-initialisation-and-reference-state#abl)

## up

Unit vector [x, y, z] defining the vertical ('up') direction used with ground_level to compute height above ground as dot(position, up) - ground_level. Default when unset is (0, 0, 1).

::: facts
**Type** vector (3 floats) · **Default** not set · **Applies when** solver.solver settings.type is one of unset, 'compressible'
:::

Guidance: [Choosing initialisation and reference state › ABL](/guide/choosing/choosing-initialisation-and-reference-state#abl)

## ground level

Datum elevation of the ground (m) in the mesh's own coordinate system, measured along 'up'. Subtracted from dot(position, up) before the log-law height is computed, as height = min(dot(p, up) - ground_level, surface_layer_height) — it shifts where the profile's height origin sits, it is NOT a measurement or reference height. This is unrelated to the aerodynamic roughness length z₀ (that's 'roughness_length' above) and unrelated to ABLZone.reference_height. NOTE: the initial-condition profile reads this key but never applies it to the initial field — only the farfield BC profile honours it — so a mesh with a non-zero ground datum gets inconsistent IC/BC profiles.

::: facts
**Type** float, >= 0 · **Default** `0` · **Applies when** solver.solver settings.type is one of unset, 'compressible'
:::

Guidance: [Choosing initialisation and reference state › ABL](/guide/choosing/choosing-initialisation-and-reference-state#abl)

