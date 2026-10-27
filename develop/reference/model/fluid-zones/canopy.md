---
title: canopy
section: reference
---

# canopy

Canopy model fluid zone for atmospheric boundary layer simulations with vegetation.

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `type` | choice | always `canopy` |  |
| `cell zones` | list of int | not set | Mesh cell zone numbers whose cells form the canopy, for example "cell zones": [4]; give this, 'definition' or 'field', or neither for the whole mesh |
| `definition` | str | not set | Closed-surface VTP file selecting the canopy cells; without it, 'cell zones' or 'field' the canopy covers the whole mesh |
| `field` | str | not set | Field file for canopy definition (alternative to VTP) |
| `function` | Python function, or a Python function | not set | Function of the cell centres and their wall distances giving the leaf area density (1/m) in every canopy cell, called as f(*, locations, wall_distances); it returns a list of one leaf area density per location |
| `cd` | float, >= 0 | `0.25` | Drag coefficient for canopy momentum sink |
| `beta p` | float, >= 0 | `0.17` | Canopy turbulence production parameter |
| `beta d` | float, >= 0 | `3.37` | Canopy turbulence dissipation parameter |
| `ceps 4` | float, >= 0 | `0.9` | Canopy C_epsilon_4 turbulence parameter |
| `ceps 5` | float, >= 0 | `0.9` | Canopy C_epsilon_5 turbulence parameter |

::: {.deck title="canopy"}
```python
parameters = {
    "model": {
        "<mesh>": {
            "fluid zones": {
                "<name>": {
                    "type": "canopy",
                    "cell zones": [...],
                    "definition": <str>,
                    "field": <str>,
                    "function": <function>,
                    "cd": 0.25,
                    "beta p": 0.17,
                    "beta d": 3.37,
                    "ceps 4": 0.9,
                    "ceps 5": 0.9,
                },
            },
            ...
        },
    },
    ...
}
```
:::

## type

::: facts
**Type** choice · **Default** always `canopy`
:::

Guidance: [Choosing a fluid-zone model › Canopy](/guide/choosing/choosing-a-fluid-zone-model#canopy)

## cell zones

Mesh cell zone numbers whose cells form the canopy, for example "cell zones": [4]; give this, 'definition' or 'field', or neither for the whole mesh

::: facts
**Type** list of int · **Default** not set · **Applies when** give only one of 'cell zones', 'definition' or 'field'
:::

Guidance: [Choosing a fluid-zone model › Selecting cells](/guide/choosing/choosing-a-fluid-zone-model#selecting-cells)

## definition

Closed-surface VTP file selecting the canopy cells; without it, 'cell zones' or 'field' the canopy covers the whole mesh

::: facts
**Type** str · **Default** not set
:::

Guidance: [Choosing a fluid-zone model › Selecting cells](/guide/choosing/choosing-a-fluid-zone-model#selecting-cells)

## field

Field file for canopy definition (alternative to VTP)

::: facts
**Type** str · **Default** not set
:::

Guidance: [Choosing a fluid-zone model › Canopy](/guide/choosing/choosing-a-fluid-zone-model#canopy)

## function

Function of the cell centres and their wall distances giving the leaf area density (1/m) in every canopy cell, called as f(*, locations, wall_distances); it returns a list of one leaf area density per location

::: facts
**Type** Python function, or a Python function · **Default** not set
:::

Guidance: [Python functions in the deck › Leaf area density function](/guide/setting-up/python-functions-in-the-deck#leaf-area-density-function)

