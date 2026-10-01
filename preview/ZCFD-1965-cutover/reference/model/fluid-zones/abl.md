---
title: abl
section: reference
---

# abl

Atmospheric boundary layer fluid zone.


## type

— no description —

always abl

| Value | What it does | When to use it |
| --- | --- | --- |
| `abl` (default) | ABL-zone placeholder, not yet wired to a source term. |  |

Guidance: [/guide/choosing/choosing-a-fluid-zone-model#atmospheric-boundary-layer-abl](/guide/choosing/choosing-a-fluid-zone-model#atmospheric-boundary-layer-abl)


## zones

List of zone IDs

list of zone ids · required

Guidance: [/guide/choosing/choosing-a-fluid-zone-model#selecting-cells](/guide/choosing/choosing-a-fluid-zone-model#selecting-cells)


## roughness length

Surface roughness length

number · not set by default · > 0


## friction velocity

Friction velocity

number · not set by default · > 0


## reference height

Reference height

number · not set by default · > 0


## wind direction

Wind direction vector

direction (3 numbers, unit length) · not set by default


::: {.deck title="abl"}
```python
{
    "type": "abl",
    "zones": ...,
    ...
}
```
:::

