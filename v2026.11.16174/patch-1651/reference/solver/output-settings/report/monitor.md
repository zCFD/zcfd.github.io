---
title: monitor
section: reference
---

# monitor

Monitor point configuration

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `point` | vector (3 floats) | required | Monitor point coordinates [x, y, z] |
| `variables` | list of str | required | Variables to monitor at this point |
| `name` | str | not set | Monitor point name |

::: {.deck title="monitor"}
```python
parameters = {
    "solver": {
        "output settings": {
            "report": {
                "monitor": {
                    "<name>": {
                        "point": <[x, y, z]>,
                        "variables": [...],
                        "name": <str>,
                    },
                },
                ...
            },
            ...
        },
        ...
    },
    ...
}
```
:::

