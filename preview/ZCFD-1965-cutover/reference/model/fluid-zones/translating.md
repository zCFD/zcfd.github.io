---
title: translating
section: reference
---

# translating

Translating (linearly moving) fluid zone.


## type

— no description —

always translating

| Value | What it does | When to use it |
| --- | --- | --- |
| `translating` (default) |  |  |

Guidance: [/guide/choosing/choosing-a-fluid-zone-model#rotating-and-translating-zones](/guide/choosing/choosing-a-fluid-zone-model#rotating-and-translating-zones)


## zones

List of zone IDs

list of zone ids · required


## velocity

Translation velocity vector

point or vector (3 numbers) · required


## translation function

Function defining time-dependent translation velocity

Python function · not set by default · accepts a Python function


## moving mesh

Enable moving mesh (requires an unsteady run and an overset or sliding interface)

true or false · default False · 'moving mesh' only applies when <mesh>.boundary conditions.*.kind is one of 'overset', 'sliding' and solver.time settings.type is 'unsteady'

Guidance: [/guide/choosing/choosing-a-fluid-zone-model#rotating-and-translating-zones](/guide/choosing/choosing-a-fluid-zone-model#rotating-and-translating-zones)


## ramp

Translation ramping parameters

settings block · not set by default


::: {.deck title="translating"}
```python
{
    "type": "translating",
    "zones": [6],
    "velocity": [-69.4, 0, 0],
    ...
}
```
:::

