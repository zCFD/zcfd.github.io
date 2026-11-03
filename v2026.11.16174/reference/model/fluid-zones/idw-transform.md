---
title: idw transform
section: reference
---

# idw transform

Inverse Distance Weighting transform fluid zone.

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `support radius` | float, > 0 | `1` | Support radius for interpolation |
| `fixed zones` | list of int | not set | Zones held in place while the moving zones deform. |
| `power` | list of float | `[3, 5, 10]` | IDW power parameters |
| `stencil size` | int, >= 1 | not set | Maximum stencil size (number of nearest neighbors) |
| `n nearest` | int, >= 1 | `100` | Number of nearest points (legacy alias for stencil_size) |
| `deformation distance` | float, > 0 | `1` | Maximum deformation distance (IDW specific) |
| `blending stiffness` | float, 0 to 1 | not set | Blending stiffness parameter |
| `zones` | list of zone ids | required | Boundary zones the morph moves. |
| `func` | Python function, or a Python function | required | Function of the node position giving the deformed position of every surface node, called as f(*, location); it returns the deformed position as three numbers |
| `type` | choice | always `idw transform` |  |

::: {.deck title="idw transform"}
```python
parameters = {
    "model": {
        "<mesh>": {
            "fluid zones": {
                "<name>": {
                    "support radius": 1.0,
                    "fixed zones": [...],
                    "power": [3.0, 5.0, 10.0],
                    "stencil size": <int>,
                    "n nearest": 100,
                    "deformation distance": 1.0,
                    "blending stiffness": <float>,
                    "zones": [...],
                    "func": <function>,
                    "type": "idw transform",
                },
            },
            ...
        },
    },
    ...
}
```
:::

## support radius

Support radius for interpolation

::: facts
**Type** float, > 0 · **Default** `1`
:::

Guidance: [Fluid–structure interaction › Interpolation method](/guide/working-with/fluid-structure-interaction#interpolation-method)

## power

IDW power parameters

::: facts
**Type** list of float · **Default** `[3, 5, 10]`
:::

Guidance: [Fluid–structure interaction › Interpolation method](/guide/working-with/fluid-structure-interaction#interpolation-method)

## func

Function of the node position giving the deformed position of every surface node, called as f(*, location); it returns the deformed position as three numbers

::: facts
**Type** Python function, or a Python function · **Required** yes
:::

Guidance: [Python functions in the deck › Mesh deformation function](/guide/setting-up/python-functions-in-the-deck#mesh-deformation-function)

## type

::: facts
**Type** choice · **Default** always `idw transform`
:::

Guidance: [Fluid–structure interaction › Mesh deformation](/guide/working-with/fluid-structure-interaction#mesh-deformation)

