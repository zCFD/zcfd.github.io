---
title: rbf transform
section: reference
---

# rbf transform

Radial Basis Function transform fluid zone.

Full RBF when base_point_fraction=1.0 (default),
Multiscale RBF when base_point_fraction < 1.0.

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `support radius` | float, > 0 | `1` | Support radius for interpolation |
| `fixed zones` | list of int | not set | Zones held in place while the moving zones deform. |
| `basis` | choice | `c2` | RBF function type |
| `base point fraction` | float, > 0 and <= 1 | `0.2` | Fraction of points to use as base points. 1.0 = full RBF, < 1.0 = multiscale RBF. |
| `zones` | list of zone ids | required | Boundary zones the morph moves. |
| `func` | Python function, or a Python function | required | Function of the node position giving the deformed position of every surface node, called as f(*, location); it returns the deformed position as three numbers |
| `type` | choice | always `rbf transform` |  |

::: {.deck title="rbf transform"}
```python
parameters = {
    "model": {
        "<mesh>": {
            "fluid zones": {
                "<name>": {
                    "support radius": 1.0,
                    "fixed zones": [...],
                    "basis": "c2",
                    "base point fraction": 0.2,
                    "zones": [...],
                    "func": <function>,
                    "type": "rbf transform",
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

## basis

RBF function type

::: facts
**Type** choice · **Default** `c2`
:::

| Value | What it does | When to use it |
| --- | --- | --- |
| `tps` | A thin-plate spline in the distance scaled by `support_radius`; it is never zero, so the system is dense. | Small surfaces where a global, smooth deformation is wanted. |
| `thin_plate_spline` | Not implemented under this name; the run stops with an unknown-basis error. | Never; the thin-plate spline is `tps`. |
| `multiquadric` | Not implemented; the run stops with an unknown-basis error. | Never; use `c2`. |
| `inverse_multiquadric` | Not implemented; the run stops with an unknown-basis error. | Never; use `c2`. |
| `gaussian` | A Gaussian whose width is `support_radius`; it is never zero, so every pair of points interacts and the system is dense. | Small surfaces only, as the dense system grows with the square of the number of points. |
| `linear` | Not implemented; the run stops with an unknown-basis error. | Never; use `c2`. |
| `cubic` | Not implemented; the run stops with an unknown-basis error. | Never; use `c2`. |
| `quintic` | Not implemented; the run stops with an unknown-basis error. | Never; use `c2`. |
| `c0` | A Wendland C0 function that is zero beyond `support_radius`; the deformation is continuous but its slope is not. | Rarely; `c2` gives a smoother deformation with the same sparsity. |
| `c2` (default) | A Wendland C2 function that is zero beyond `support_radius`, so only nearby points interact and the system is sparse. | The default, and the appropriate choice for most cases. |
| `c4` | Selects a Wendland C4 function, but the matrix assembly and the volume deformation evaluate `c2`, so the interpolation is inconsistent. | Not at present; use `c2`. |
| `c6` | Not implemented; the run stops with an unknown-basis error. | Never; use `c2`. |

Guidance: [Fluid–structure interaction › Interpolation method](/guide/working-with/fluid-structure-interaction#interpolation-method)

## base point fraction

Fraction of points to use as base points. 1.0 = full RBF, < 1.0 = multiscale RBF.

::: facts
**Type** float, > 0 and <= 1 · **Default** `0.2`
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
**Type** choice · **Default** always `rbf transform`
:::

Guidance: [Fluid–structure interaction › Mesh deformation](/guide/working-with/fluid-structure-interaction#mesh-deformation)

