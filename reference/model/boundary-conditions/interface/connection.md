---
title: connection
section: reference
---

# connection

Model(s) whose mesh provides donor data at this interface. Without it, the solver maps against every preceding model.

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `model` | list of str | required | *overset / sliding only* · Model(s) whose mesh provides donor data at this interface. |
| `boundary` | str | required | *sliding / periodic only* · Boundary on that model that forms the other side of this interface. |

::: {.deck title="connection"}
```python
parameters = {
    "model": {
        "<mesh>": {
            "boundary conditions": {
                "<name>": {
                    "connection": {
                        "model": [...],
                        "boundary": <str>,
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

## model

Model(s) whose mesh provides donor data at this interface.

::: facts
**Type** list of str · **Required** yes
:::

Guidance: [Overset meshes › connection](/guide/working-with/overset-meshes#connection)

## boundary

Boundary on that model that forms the other side of this interface.

::: facts
**Type** str · **Required** yes
:::

Guidance: [Choosing boundary conditions › Sliding](/guide/choosing/choosing-boundary-conditions#sliding)

