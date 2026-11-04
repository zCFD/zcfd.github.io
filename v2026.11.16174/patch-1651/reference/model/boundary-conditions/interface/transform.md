---
title: transform
section: reference
---

# transform

Transformation that maps this boundary onto the one it connects to.

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `type` | choice | not set | How this boundary maps onto its partner. |
| `theta` | float, in rad | required | *rotated only* · Angle of the rotation that maps this boundary onto its partner. |
| `axis` | unit vector (3 floats) | required | *rotated only* · Direction of the rotation axis. |
| `origin` | vector (3 floats), in m | required | *rotated only* · A point on the rotation axis. |
| `vector` | vector (3 floats), in m | required | *linear only* · Translation that maps this boundary onto its partner. |

::: {.deck title="transform"}
```python
parameters = {
    "model": {
        "<mesh>": {
            "boundary conditions": {
                "<name>": {
                    "transform": {
                        "type": <choice>,
                        "theta": <float>,
                        "axis": <[x, y, z]>,
                        "origin": <[x, y, z]>,
                        "vector": <[x, y, z]>,
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

How this boundary maps onto its partner.

::: facts
**Type** choice · **Default** not set
:::

| Value | What it does |
| --- | --- |
| `rotated` | A rotation about an axis maps this boundary onto its partner. |
| `linear` | A translation maps this boundary onto its partner. |

