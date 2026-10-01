---
title: idw transform
section: reference
---

# idw transform

Inverse Distance Weighting transform fluid zone.


## support radius

Support radius for interpolation

number · default 1 · > 0

Guidance: [/guide/working-with/fluid-structure-interaction#interpolation-method](/guide/working-with/fluid-structure-interaction#interpolation-method)


## power

IDW power parameters

list of numbers · default [3, 5, 10]

Guidance: [/guide/working-with/fluid-structure-interaction#interpolation-method](/guide/working-with/fluid-structure-interaction#interpolation-method)


## stencil size

Maximum stencil size (number of nearest neighbors)

whole number · not set by default · >= 1


## fixed zones

Fixed zones for IDW

list of whole numbers · not set by default


## n nearest

Number of nearest points (legacy alias for stencil_size)

whole number · default 100 · >= 1


## deformation distance

Maximum deformation distance (IDW specific)

number · default 1 · > 0


## blending stiffness

Blending stiffness parameter

number · not set by default · 0 to 1


## zones

List of zone IDs

list of zone ids · required


## func

Transform function

Python function · required · accepts a Python function

Guidance: [/guide/working-with/fluid-structure-interaction#mesh-deformation](/guide/working-with/fluid-structure-interaction#mesh-deformation)


## type

— no description —

always idw transform

| Value | What it does | When to use it |
| --- | --- | --- |
| `idw transform` (default) |  |  |

Guidance: [/guide/working-with/fluid-structure-interaction#mesh-deformation](/guide/working-with/fluid-structure-interaction#mesh-deformation)


::: {.deck title="idw transform"}
```python
{
    "zones": ...,
    "func": ...,
    "type": "idw transform",
    ...
}
```
:::

