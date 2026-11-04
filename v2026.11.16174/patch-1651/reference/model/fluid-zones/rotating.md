---
title: rotating
section: reference
---

# rotating

A rotating frame on mesh cell zones (MRF); the mesh stays still.

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `type` | choice | always `rotating` | Fluid zone type |
| `axis` | unit vector (3 floats) | required | Axis of rotation. |
| `origin` | vector (3 floats), in m | required | A point on the axis of rotation. |
| `omega` | float, in rad/s | required | Angular velocity, positive right-handed about 'axis'. |
| `cell zones` | list of int | required | Mesh cell zone numbers whose cells are solved in the rotating frame, for example "cell zones": [17] |

::: {.deck title="rotating"}
```python
parameters = {
    "model": {
        "<mesh>": {
            "fluid zones": {
                "<name>": {
                    "type": "rotating",
                    "axis": <[x, y, z]>,
                    "origin": <[x, y, z]>,
                    "omega": <float>,
                    "cell zones": [...],
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

Fluid zone type

::: facts
**Type** choice · **Default** always `rotating` · **Applies when** the model has no 'transforms > motion' and no overset or sliding interface. A model has one frame: rotating fluid zones on its cell zones, or 'transforms > motion' for the whole mesh. A mesh with an overset or sliding interface turns as a whole, so it takes 'transforms > motion' only. Remove 'motion' from 'transforms', or remove the rotating fluid zones and turn the whole mesh with "transforms": {"motion": {"type": "rotating", "axis": [...], "origin": [...], "omega": ..., "moving mesh": False}}.
:::

Guidance: [Choosing a fluid-zone model › Rotating zones](/guide/choosing/choosing-a-fluid-zone-model#rotating-zones)

## cell zones

Mesh cell zone numbers whose cells are solved in the rotating frame, for example "cell zones": [17]

::: facts
**Type** list of int · **Required** yes
:::

Guidance: [Choosing a fluid-zone model › Selecting cells](/guide/choosing/choosing-a-fluid-zone-model#selecting-cells)

