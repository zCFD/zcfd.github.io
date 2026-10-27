---
title: velocity
section: reference
---

# velocity

Velocity of the wall surface, for surfaces in relative motion such as a moving belt or a rotating wheel.

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `type` | choice | required | How the wall moves: `linear` translates it along a vector, `rotating` turns it about an axis. |
| `vector` | vector (3 floats) | required | *linear only* · Direction of linear velocity |
| `mach` | float | not set | *linear only* · Mach number for linear velocity - overrides magnitude of the translation velocity |
| `axis` | unit vector (3 floats) | required | *rotating only* · Axis of rotation. |
| `origin` | vector (3 floats), in m | required | *rotating only* · A point on the axis of rotation. |
| `omega` | float, in rad/s | required | *rotating only* · Angular velocity, positive right-handed about 'axis'. |

::: {.deck title="velocity"}
```python
parameters = {
    "model": {
        "<mesh>": {
            "boundary conditions": {
                "<name>": {
                    "velocity": {
                        "type": <choice>,
                        "vector": <[x, y, z]>,
                        "mach": <float>,
                        "axis": <[x, y, z]>,
                        "origin": <[x, y, z]>,
                        "omega": <float>,
                    },
                    ...
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

How the wall moves: `linear` translates it along a vector, `rotating` turns it about an axis.

::: facts
**Type** choice · **Required** yes
:::

| Value | What it does |
| --- | --- |
| `linear` | Selects a linear (translational) wall velocity. |
| `rotating` | Selects a rotational wall velocity. |

Guidance: [Choosing a wall model › Moving walls](/guide/choosing/choosing-a-wall-model#moving-walls)

