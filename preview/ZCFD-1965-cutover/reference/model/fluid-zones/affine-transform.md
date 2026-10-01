---
title: affine transform
section: reference
---

# affine transform

Affine transform fluid zone.


## zones

List of zone IDs

list of zone ids · required


## func

Transform function

Python function · required · accepts a Python function

Guidance: [/guide/working-with/fluid-structure-interaction#mesh-deformation](/guide/working-with/fluid-structure-interaction#mesh-deformation)


## type

— no description —

always affine transform

| Value | What it does | When to use it |
| --- | --- | --- |
| `affine transform` (default) |  |  |


## transform matrix

4x4 transformation matrix

list · not set by default


## transform func

Transform function

Python function · not set by default · accepts a Python function


## moving mesh

Enable moving mesh (requires an unsteady run and an overset or sliding interface)

true or false · default False · 'moving mesh' only applies when <mesh>.boundary conditions.*.kind is one of 'overset', 'sliding' and solver.time settings.type is 'unsteady'


::: {.deck title="affine transform"}
```python
{
    "zones": ...,
    "func": ...,
    "type": "affine transform",
    ...
}
```
:::

