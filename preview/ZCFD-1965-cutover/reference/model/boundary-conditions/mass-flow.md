---
title: mass flow
section: reference
---

# mass flow

Mass flow boundary condition.


## type

— no description —

always mass flow

| Value | What it does | When to use it |
| --- | --- | --- |
| `mass flow` (default) | A standalone mass-flow boundary condition. |  |

Guidance: [/guide/choosing/choosing-boundary-conditions#mass-flow](/guide/choosing/choosing-boundary-conditions#mass-flow)


## zones

Mesh zone ids this boundary condition applies to.

list of zone ids · required

Guidance: [/guide/choosing/choosing-boundary-conditions#zones](/guide/choosing/choosing-boundary-conditions#zones)


## mass flow

Mass flow rate

number · required · in kg/s


::: {.deck title="mass flow"}
```python
{
    "type": "mass flow",
    "zones": ...,
    "mass flow": ...,
}
```
:::

