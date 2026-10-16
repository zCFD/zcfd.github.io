---
title: temperature
section: reference
---

# temperature

Wall temperature, as a number or a {'field': '<map>.vtp'} map; unset, the wall is adiabatic.

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `field` | str | required | VTP file with a point array named after the quantity ('Temperature' or 'HeatFlux'); each face takes the nearest point's value |

::: {.deck title="temperature"}
```python
parameters = {
    "model": {
        "<mesh>": {
            "boundary conditions": {
                "<name>": {
                    "temperature": {
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

