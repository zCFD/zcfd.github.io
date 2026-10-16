---
title: wall
section: reference
---

# wall

Wall boundary condition.

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `type` | choice | always `wall` | Boundary condition applied on these zones; it determines which further settings the block takes. |
| `zones` | list of zone ids | required | Mesh zone ids this boundary condition applies to. |
| `kind` | choice | `no slip` | Wall model applied on these zones. |
| [`most`](/reference/model/boundary-conditions/wall/most) | settings block |  | Monin-Obukhov surface-layer settings. |
| [`temperature`](/reference/model/boundary-conditions/wall/temperature) | float or settings block, > 0.0 K |  | Wall temperature, as a number or a {'field': '<map>.vtp'} map; unset, the wall is adiabatic. |
| [`heat flux`](/reference/model/boundary-conditions/wall/heat-flux) | float or settings block, in W/m^2 |  | Wall heat flux, positive into the fluid, as a number or a {'field': '<map>.vtp'} map. |
| `compressible wall function` | bool | `False` | Applies the compressible law of the wall on an adiabatic wall-function wall; a 'temperature' or a 'heat flux' selects it anyway. |
| [`velocity`](/reference/model/boundary-conditions/wall/velocity) | choice of settings blocks |  | Velocity of the wall surface, for surfaces in relative motion such as a moving belt or a rotating wheel. |
| [`roughness`](/reference/model/boundary-conditions/wall/roughness) | settings block |  | Surface roughness; unset, the wall is smooth. |
| [`fsi`](/reference/model/boundary-conditions/wall/fsi) | choice of settings blocks |  | Fluid-structure interaction model that couples this wall's motion to a structural solve. |

::: {.deck title="wall"}
```python
parameters = {
    "model": {
        "<mesh>": {
            "boundary conditions": {
                "<name>": {
                    "type": "wall",
                    "zones": [...],
                    "kind": "no slip",
                    "most": {...},
                    "temperature": <float or settings block>,
                    "heat flux": <float or settings block>,
                    "compressible wall function": False,
                    "velocity": {...},
                    "roughness": {...},
                    "fsi": {...},
                },
            },
            ...
        },
    },
    ...
}
```
:::

## type

Boundary condition applied on these zones; it determines which further settings the block takes.

::: facts
**Type** choice · **Default** always `wall`
:::

Guidance: [Choosing boundary conditions](/guide/choosing/choosing-boundary-conditions)

## zones

Mesh zone ids this boundary condition applies to.

::: facts
**Type** list of zone ids · **Required** yes
:::

Guidance: [Choosing boundary conditions › Zones](/guide/choosing/choosing-boundary-conditions#zones)

## kind

Wall model applied on these zones.

::: facts
**Type** choice · **Default** `no slip`
:::

| Value | What it does | When to use it |
| --- | --- | --- |
| `slip` | Zero velocity normal to the wall and no shear stress along it. |  |
| `no slip` (default) | Applies the no-slip condition directly at the wall. | Viscous wall with the mesh resolved to $y^+ \sim 1$. |
| `wall function` | Takes the wall stress from a law of the wall instead of resolving the near-wall layer: Spalding's law with SST, the Allmaras fit with SA-neg. | Viscous wall with the first cell between $y^+ = 30$ and $250$; it tolerates a first cell down to $y^+ \sim 1$. The law of the wall (Spalding's with SST, the Allmaras fit with SA-neg) represents a flat plate in zero pressure gradient, so accuracy falls on highly curved surfaces and in strong pressure gradients. |
| `most` | Takes the wall stress and surface heat flux from Monin-Obukhov similarity theory on a roughness length. |  |

Guidance: [Choosing a wall model › Slip, no slip or wall function](/guide/choosing/choosing-a-wall-model#kind)

## compressible wall function

Applies the compressible law of the wall on an adiabatic wall-function wall; a 'temperature' or a 'heat flux' selects it anyway.

::: facts
**Type** bool · **Default** `False` · **Applies when** kind is 'wall function'
:::

Guidance: [Choosing a wall model › Wall function](/guide/choosing/choosing-a-wall-model#wall-function)

