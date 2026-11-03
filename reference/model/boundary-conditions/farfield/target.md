---
title: target
section: reference
---

# target

A lift or drag coefficient the farfield is trimmed to reach, by turning its angle of attack.

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| [`alpha`](/reference/model/boundary-conditions/farfield/target/alpha) | settings block |  | Turn the angle of attack, starting from the condition's own velocity, until the coefficient is met. |
| [`axes`](/reference/model/boundary-conditions/farfield/target/axes) | settings block |  | Body axes the angle of attack and the forces are measured in. |

::: {.deck title="target"}
```python
parameters = {
    "model": {
        "<mesh>": {
            "boundary conditions": {
                "<name>": {
                    "target": {
                        "alpha": {...},
                        "axes": {...},
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

