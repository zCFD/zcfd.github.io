---
title: canopy
section: reference
---

# canopy

Canopy model fluid zone for atmospheric boundary layer simulations with vegetation.


## type

— no description —

always canopy

| Value | What it does | When to use it |
| --- | --- | --- |
| `canopy` (default) |  |  |

Guidance: [/guide/choosing/choosing-a-fluid-zone-model#canopy](/guide/choosing/choosing-a-fluid-zone-model#canopy)


## zones

List of zone IDs

list of zone ids · not set by default

Guidance: [/guide/choosing/choosing-a-fluid-zone-model#selecting-cells](/guide/choosing/choosing-a-fluid-zone-model#selecting-cells)


## definition

VTP file defining the canopy zone geometry

text · not set by default

Guidance: [/guide/choosing/choosing-a-fluid-zone-model#selecting-cells](/guide/choosing/choosing-a-fluid-zone-model#selecting-cells)


## field

Field file for canopy definition (alternative to VTP)

text · not set by default

Guidance: [/guide/choosing/choosing-a-fluid-zone-model#canopy](/guide/choosing/choosing-a-fluid-zone-model#canopy)


## function

Python function that calculates leaf area density

Python function · not set by default · accepts a Python function

Guidance: [/guide/choosing/choosing-a-fluid-zone-model#canopy](/guide/choosing/choosing-a-fluid-zone-model#canopy)


## cd

Drag coefficient for canopy momentum sink

number · default 0.25 · >= 0


## beta p

Canopy turbulence production parameter

number · default 0.17 · >= 0


## beta d

Canopy turbulence dissipation parameter

number · default 3.37 · >= 0


## ceps 4

Canopy C_epsilon_4 turbulence parameter

number · default 0.9 · >= 0


## ceps 5

Canopy C_epsilon_5 turbulence parameter

number · default 0.9 · >= 0


::: {.deck title="canopy"}
```python
{
    "type": "canopy",
    ...
}
```
:::

