---
title: sponge layer damping
section: reference
---

# sponge layer damping

Sponge layer that damps the solution towards a reference condition near the farfield boundaries.

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `distance` | float, in m | required | Depth of the sponge layer, measured into the domain from the farfield boundaries. |
| `damping factor` | float, in 1/s | required | Peak damping rate, applied at the farfield boundary and ramped to zero at 'distance' along a cosine profile. |
| `condition` | str | required | Reference condition the solution is damped towards inside the layer. |

::: {.deck title="sponge layer damping"}
```python
parameters = {
    "model": {
        "<mesh>": {
            "boundary conditions": {
                "<name>": {
                    "sponge layer damping": {
                        "distance": <float>,
                        "damping factor": <float>,
                        "condition": <str>,
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

