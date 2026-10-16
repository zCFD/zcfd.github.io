---
title: symmetry
section: reference
---

# symmetry

Symmetry boundary condition.

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `type` | choice | always `symmetry` | Boundary condition applied on these zones; it determines which further settings the block takes. |
| `zones` | list of zone ids | required | Mesh zone ids this boundary condition applies to. |

::: {.deck title="symmetry"}
```python
parameters = {
    "model": {
        "<mesh>": {
            "boundary conditions": {
                "<name>": {
                    "type": "symmetry",
                    "zones": [...],
                },
            },
            ...
        },
    },
    ...
}
```
:::

## type

Boundary condition applied on these zones; it determines which further settings the block takes.

::: facts
**Type** choice · **Default** always `symmetry`
:::

Guidance: [Choosing boundary conditions](/guide/choosing/choosing-boundary-conditions)

## zones

Mesh zone ids this boundary condition applies to.

::: facts
**Type** list of zone ids · **Required** yes
:::

Guidance: [Choosing boundary conditions › Zones](/guide/choosing/choosing-boundary-conditions#zones)

