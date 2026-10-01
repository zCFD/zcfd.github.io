---
title: symmetry
section: reference
---

# symmetry

Symmetry boundary condition.


## type

— no description —

always symmetry

| Value | What it does | When to use it |
| --- | --- | --- |
| `symmetry` (default) | A mirror plane: no flow crosses it, and the solution is reflected across it. |  |

Guidance: [/guide/choosing/choosing-boundary-conditions](/guide/choosing/choosing-boundary-conditions)


## zones

Mesh zone ids this boundary condition applies to.

list of zone ids · required

Guidance: [/guide/choosing/choosing-boundary-conditions#zones](/guide/choosing/choosing-boundary-conditions#zones)


::: {.deck title="symmetry"}
```python
{
    "type": "symmetry",
    "zones": [12, 13],
}
```
:::

