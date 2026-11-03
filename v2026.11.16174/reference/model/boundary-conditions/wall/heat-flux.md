---
title: heat flux
section: reference
---

# heat flux

Wall heat flux, positive into the fluid, as a number or a {'field': '<map>.vtp'} map.

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `field` | str | required | VTP file with a point array named after the quantity ('Temperature' or 'HeatFlux'); each face takes the nearest point's value |

::: {.deck title="heat flux"}
```python
parameters = {
    "model": {
        "<mesh>": {
            "boundary conditions": {
                "<name>": {
                    "heat flux": {
                        "field": <str>,
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

