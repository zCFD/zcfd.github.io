---
title: preconditioner
section: reference
---

# preconditioner

Low Mach number preconditioner settings

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `minimum mach number` | float, > 0.0 | required | Cut-off Mach number for low-Mach preconditioning: floors the preconditioning reference velocity so it cannot collapse at a stagnation point. |

::: {.deck title="preconditioner"}
```python
parameters = {
    "solver": {
        "numerical scheme": {
            "preconditioner": {
                "minimum mach number": <float>,
            },
            ...
        },
        ...
    },
    ...
}
```
:::

## minimum mach number

Cut-off Mach number for low-Mach preconditioning: floors the preconditioning reference velocity so it cannot collapse at a stagnation point. Overrides the Mach-dependent default.

::: facts
**Type** float, > 0.0 · **Required** yes
:::

