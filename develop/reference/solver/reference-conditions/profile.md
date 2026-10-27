---
title: profile
section: reference
---

# profile

Atmospheric profile parameters for specialised flow conditions

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| [`abl`](/reference/solver/reference-conditions/profile/abl) | settings block |  | Atmospheric Boundary Layer profile parameters |
| `field` | str | not set | Profile file name (e.g. .vtp) |
| `use wall distance` | bool | not set | Use wall distance for profile |

::: {.deck title="profile"}
```python
parameters = {
    "solver": {
        "reference conditions": {
            "<name>": {
                "profile": {
                    "abl": {...},
                    "field": <str>,
                    "use wall distance": <bool>,
                },
                ...
            },
        },
        ...
    },
    ...
}
```
:::

## field

Profile file name (e.g. .vtp)

::: facts
**Type** str · **Default** not set
:::

Guidance: [Choosing initialisation and reference state › field](/guide/choosing/choosing-initialisation-and-reference-state#field)

## use wall distance

Use wall distance for profile

::: facts
**Type** bool · **Default** not set
:::

Guidance: [Choosing initialisation and reference state › field](/guide/choosing/choosing-initialisation-and-reference-state#field)

