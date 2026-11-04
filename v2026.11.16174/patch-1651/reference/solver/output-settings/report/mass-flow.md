---
title: mass flow
section: reference
---

# mass flow

Mass flow calculation zones

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `zones` | list of zone ids | required | Zone IDs for mass flow calculation |

::: {.deck title="mass flow"}
```python
parameters = {
    "solver": {
        "output settings": {
            "report": {
                "mass flow": {
                    "<name>": {
                        "zones": [...],
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

