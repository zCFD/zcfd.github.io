---
title: geometry
section: reference
---

# geometry

Turbine geometry

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `centre` | vector (3 floats) | required | Centre coordinates |
| `inner radius` | float | not set | Inner radius |
| `outer radius` | float | not set | Outer radius |
| `normal` | vector (3 floats) | required | Normal vector |
| `up` | vector (3 floats) | required | Up vector |

::: {.deck title="geometry"}
```python
parameters = {
    "model": {
        "<mesh>": {
            "fluid zones": {
                "<name>": {
                    "geometry": {
                        "centre": <[x, y, z]>,
                        "inner radius": <float>,
                        "outer radius": <float>,
                        "normal": <[x, y, z]>,
                        "up": <[x, y, z]>,
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

## normal

Normal vector

::: facts
**Type** vector (3 floats) · **Required** yes
:::

Guidance: [Choosing a fluid-zone model › Actuator discs](/guide/choosing/choosing-a-fluid-zone-model#actuator-discs)

