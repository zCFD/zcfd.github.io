---
title: motion
section: reference
---

# motion

Rigid motion of the placed mesh, or the frame its flow is solved in. Its axis, origin and velocity are in placed coordinates. Coordinates go through 'scale', then 'transform', then 'motion'.

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `moving mesh` | bool | `False` | True moves the nodes through an unsteady run. |
| `ramp time` | float, > 0 s | not set | Physical time over which a moving mesh rises linearly from rest to its full rate; unset starts at full rate. |
| `axis` | unit vector (3 floats) | required | *rotating only* · Axis of rotation. |
| `origin` | vector (3 floats), in m | required | *rotating only* · A point on the axis of rotation. |
| `omega` | float, in rad/s | required | *rotating only* · Angular velocity, positive right-handed about 'axis'. |
| `type` | choice | required |  |
| `rotate nodes` | bool | `False` | *rotating only* · Rotate the mesh nodes every time step, instead of carrying the rotation as an angle that the overset mapper and sliding supermesh apply. |
| `velocity` | vector (3 floats), in m/s | required | *translating only* · Full translation velocity. |

::: {.deck title="motion"}
```python
parameters = {
    "model": {
        "<mesh>": {
            "transforms": {
                "motion": {
                    "moving mesh": False,
                    "ramp time": <float>,
                    "axis": <[x, y, z]>,
                    "origin": <[x, y, z]>,
                    "omega": <float>,
                    "type": <choice>,
                    "rotate nodes": False,
                    "velocity": <[x, y, z]>,
                },
                ...
            },
            ...
        },
    },
    ...
}
```
:::

## moving mesh

True moves the nodes through an unsteady run. False keeps the mesh still and solves the flow in the moving frame (MRF).

::: facts
**Type** bool · **Default** `False` · **Applies when** the model has an overset or sliding interface and the run is unsteady and compressible. For a steady rotor, or an incompressible run, set 'moving mesh': False to solve the flow in the moving frame.
:::

## ramp time

Physical time over which a moving mesh rises linearly from rest to its full rate; unset starts at full rate.

::: facts
**Type** float, > 0 s · **Default** not set · **Applies when** 'moving mesh' is True. A frame runs at its full rate from the first step: remove 'ramp time'.
:::

## type

::: facts
**Type** choice · **Required** yes
:::

| Value | What it does |
| --- | --- |
| `rotating` |  |
| `translating` |  |

Guidance: [Placing and moving a mesh](/guide/working-with/placing-and-moving-a-mesh)

## rotate nodes

Rotate the mesh nodes every time step, instead of carrying the rotation as an angle that the overset mapper and sliding supermesh apply.

::: facts
**Type** bool · **Default** `False` · **Applies when** 'moving mesh' is True. A frame never moves the nodes: remove 'rotate nodes'.
:::

