---
title: rbf transform
section: reference
---

# rbf transform

Radial Basis Function transform fluid zone.

Full RBF when base_point_fraction=1.0 (default),
Multiscale RBF when base_point_fraction < 1.0.


## support radius

Support radius for interpolation

number · default 1 · > 0

Guidance: [/guide/working-with/fluid-structure-interaction#interpolation-method](/guide/working-with/fluid-structure-interaction#interpolation-method)


## basis

RBF function type

default c2

| Value | What it does | When to use it |
| --- | --- | --- |
| `tps` |  |  |
| `thin_plate_spline` |  |  |
| `multiquadric` |  |  |
| `inverse_multiquadric` |  |  |
| `gaussian` |  |  |
| `linear` |  |  |
| `cubic` |  |  |
| `quintic` |  |  |
| `c0` |  |  |
| `c2` (default) |  |  |
| `c4` |  |  |
| `c6` |  |  |


## base point fraction

Fraction of points to use as base points. 1.0 = full RBF, < 1.0 = multiscale RBF.

number · default 0.2 · > 0 and <= 1

Guidance: [/guide/working-with/fluid-structure-interaction#interpolation-method](/guide/working-with/fluid-structure-interaction#interpolation-method)


## zones

List of zone IDs

list of zone ids · required


## func

Transform function

Python function · required · accepts a Python function

Guidance: [/guide/working-with/fluid-structure-interaction#mesh-deformation](/guide/working-with/fluid-structure-interaction#mesh-deformation)


## type

— no description —

always rbf transform

| Value | What it does | When to use it |
| --- | --- | --- |
| `rbf transform` (default) |  |  |

Guidance: [/guide/working-with/fluid-structure-interaction#mesh-deformation](/guide/working-with/fluid-structure-interaction#mesh-deformation)


::: {.deck title="rbf transform"}
```python
{
    "zones": ...,
    "func": ...,
    "type": "rbf transform",
    ...
}
```
:::

