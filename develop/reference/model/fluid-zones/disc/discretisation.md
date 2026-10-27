---
title: discretisation
section: reference
---

# discretisation

Turbine discretisation

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `type` | str | required | Discretisation type |
| `number of elements` | int | not set | Number of elements |

::: {.deck title="discretisation"}
```python
parameters = {
    "model": {
        "<mesh>": {
            "fluid zones": {
                "<name>": {
                    "discretisation": {
                        "type": <str>,
                        "number of elements": <int>,
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

