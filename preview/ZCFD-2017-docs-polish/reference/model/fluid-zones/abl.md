---
title: abl
section: reference
---

# abl

Atmospheric boundary layer fluid zone, applied to the whole mesh.

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `type` | choice | always `abl` | Fluid zone type |
| `roughness length` | float, > 0 | not set | Surface roughness length |
| `friction velocity` | float, > 0 | not set | Friction velocity |
| `reference height` | float, > 0 | not set | Reference height |
| `wind direction` | unit vector (3 floats) | not set | Wind direction vector |

::: {.deck title="abl"}
```python
parameters = {
    "model": {
        "<mesh>": {
            "fluid zones": {
                "<name>": {
                    "type": "abl",
                    "roughness length": <float>,
                    "friction velocity": <float>,
                    "reference height": <float>,
                    "wind direction": <[x, y, z]>,
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
**Type** choice · **Default** always `abl`
:::

Guidance: [Choosing a fluid-zone model › Atmospheric Boundary Layer (ABL)](/guide/choosing/choosing-a-fluid-zone-model#atmospheric-boundary-layer-abl)

