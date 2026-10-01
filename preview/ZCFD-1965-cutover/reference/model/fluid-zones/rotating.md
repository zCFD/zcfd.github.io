---
title: rotating
section: reference
---

# rotating

Rotating fluid zone.


## type

— no description —

always rotating

| Value | What it does | When to use it |
| --- | --- | --- |
| `rotating` (default) | Rotating reference frame or moving rotating region (MRF / overset). |  |

Guidance: [/guide/choosing/choosing-a-fluid-zone-model#rotating-and-translating-zones](/guide/choosing/choosing-a-fluid-zone-model#rotating-and-translating-zones)


## zones

List of zone IDs

list of zone ids · required

Guidance: [/guide/choosing/choosing-a-fluid-zone-model#selecting-cells](/guide/choosing/choosing-a-fluid-zone-model#selecting-cells)


## axis

Rotation axis

direction (3 numbers, unit length) · required


## origin

Rotation origin

point or vector (3 numbers) · required


## omega

Angular velocity (rad/s)

number · required


## moving mesh

Enable moving mesh (requires an unsteady run and an overset or sliding interface)

true or false · default False · 'moving mesh' only applies when <mesh>.boundary conditions.*.kind is one of 'overset', 'sliding' and solver.time settings.type is 'unsteady'

Guidance: [/guide/choosing/choosing-a-fluid-zone-model#rotating-and-translating-zones](/guide/choosing/choosing-a-fluid-zone-model#rotating-and-translating-zones)


## move mesh

Physically rotate the mesh every time step and solve the zone in the inertial frame, instead of leaving the mesh stationary and carrying the rotation as an angle that the overset mapper and the sliding supermesh apply to what they transfer. Both are exact for the interior -- a pure rotation changes no volume and no area -- but only this one puts the mesh where the interface machinery can read its true position rather than reconstruct it. Requires moving_mesh, and an overset or sliding interface to be worth using.

true or false · default False · 'move mesh' only applies when <mesh>.boundary conditions.*.kind is one of 'overset', 'sliding' and solver.time settings.type is 'unsteady'

Guidance: [/guide/choosing/choosing-a-fluid-zone-model#rotating-and-translating-zones](/guide/choosing/choosing-a-fluid-zone-model#rotating-and-translating-zones)


## ramp

Rotation ramping parameters

settings block · not set by default


::: {.deck title="rotating"}
```python
{
    "type": "rotating",
    "zones": [0],
    "axis": [0, 0, 1],
    "origin": [0, 0, 0],
    "omega": 0.1152878038014603,
    ...
}
```
:::

