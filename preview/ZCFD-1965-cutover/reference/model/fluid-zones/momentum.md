---
title: momentum
section: reference
---

# momentum

Momentum source fluid zone.


## type

— no description —

always momentum

| Value | What it does | When to use it |
| --- | --- | --- |
| `momentum` (default) | Arbitrary momentum source supplied by a Python function. |  |

Guidance: [/guide/choosing/choosing-a-fluid-zone-model#momentum-source](/guide/choosing/choosing-a-fluid-zone-model#momentum-source)


## zones

List of zone IDs

list of zone ids · not set by default

Guidance: [/guide/choosing/choosing-a-fluid-zone-model#selecting-cells](/guide/choosing/choosing-a-fluid-zone-model#selecting-cells)


## definition

Closed-surface VTP file selecting the source region cells

text · not set by default

Guidance: [/guide/choosing/choosing-a-fluid-zone-model#selecting-cells](/guide/choosing/choosing-a-fluid-zone-model#selecting-cells)


## kind

Source kind

default fixed

| Value | What it does | When to use it |
| --- | --- | --- |
| `fixed` (default) |  |  |
| `ramp` |  |  |
| `func` |  |  |


## frequency

Update frequency

whole number · default 1 · >= 1


## func

Source function

Python function · not set by default · accepts a Python function

Guidance: [/guide/choosing/choosing-a-fluid-zone-model#momentum-source](/guide/choosing/choosing-a-fluid-zone-model#momentum-source)


## source

Momentum source vector

point or vector (3 numbers) · not set by default


::: {.deck title="momentum"}
```python
{
    "type": "momentum",
    ...
}
```
:::

