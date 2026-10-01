---
title: porous
section: reference
---

# porous

Porous media fluid zone.


## type

— no description —

always porous

| Value | What it does | When to use it |
| --- | --- | --- |
| `porous` (default) | Darcy/Forchheimer momentum sink representing a porous obstruction. |  |

Guidance: [/guide/choosing/choosing-a-fluid-zone-model#porous-media](/guide/choosing/choosing-a-fluid-zone-model#porous-media)


## zones

List of zone IDs

list of zone ids · not set by default

Guidance: [/guide/choosing/choosing-a-fluid-zone-model#selecting-cells](/guide/choosing/choosing-a-fluid-zone-model#selecting-cells)


## definition

Closed-surface VTP file selecting the porous region cells

text · not set by default

Guidance: [/guide/choosing/choosing-a-fluid-zone-model#selecting-cells](/guide/choosing/choosing-a-fluid-zone-model#selecting-cells)


## porosity

Porosity

number · not set by default · 0 to 1


## alpha

Resistance coefficient (Darcy term)

number · default 1000000000000 · >= 0

Guidance: [/guide/choosing/choosing-a-fluid-zone-model#porous-media](/guide/choosing/choosing-a-fluid-zone-model#porous-media)


## c2

Inertial coefficient (Forchheimer term)

number · default 0 · >= 0

Guidance: [/guide/choosing/choosing-a-fluid-zone-model#porous-media](/guide/choosing/choosing-a-fluid-zone-model#porous-media)


## direction

Preferred flow direction

direction (3 numbers, unit length) · not set by default


::: {.deck title="porous"}
```python
{
    "type": "porous",
    ...
}
```
:::

