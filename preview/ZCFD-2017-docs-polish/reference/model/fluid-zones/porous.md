---
title: porous
section: reference
---

# porous

Porous media fluid zone.

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `type` | choice | always `porous` | Fluid zone type |
| `cell zones` | list of int | not set | Mesh cell zone numbers whose cells form the porous region, for example "cell zones": [4]; give this, 'definition', or neither for the whole mesh |
| `definition` | str | not set | Closed-surface VTP file selecting the porous region cells; without it or 'cell zones' the porous region is the whole mesh |
| `alpha` | float, >= 0 | `1000000000000` | Resistance coefficient (Darcy term) |
| `c2` | float, >= 0 | `0` | Inertial coefficient (Forchheimer term) |

::: {.deck title="porous"}
```python
parameters = {
    "model": {
        "<mesh>": {
            "fluid zones": {
                "<name>": {
                    "type": "porous",
                    "cell zones": [...],
                    "definition": <str>,
                    "alpha": 1000000000000.0,
                    "c2": 0.0,
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

Fluid zone type

::: facts
**Type** choice · **Default** always `porous`
:::

Guidance: [Choosing a fluid-zone model › Porous Media](/guide/choosing/choosing-a-fluid-zone-model#porous-media)

## cell zones

Mesh cell zone numbers whose cells form the porous region, for example "cell zones": [4]; give this, 'definition', or neither for the whole mesh

::: facts
**Type** list of int · **Default** not set · **Applies when** give either 'cell zones' or 'definition', not both
:::

Guidance: [Choosing a fluid-zone model › Selecting cells](/guide/choosing/choosing-a-fluid-zone-model#selecting-cells)

## definition

Closed-surface VTP file selecting the porous region cells; without it or 'cell zones' the porous region is the whole mesh

::: facts
**Type** str · **Default** not set
:::

Guidance: [Choosing a fluid-zone model › Selecting cells](/guide/choosing/choosing-a-fluid-zone-model#selecting-cells)

## alpha

Resistance coefficient (Darcy term)

::: facts
**Type** float, >= 0 · **Default** `1000000000000`
:::

Guidance: [Choosing a fluid-zone model › Porous Media](/guide/choosing/choosing-a-fluid-zone-model#porous-media)

## c2

Inertial coefficient (Forchheimer term)

::: facts
**Type** float, >= 0 · **Default** `0`
:::

Guidance: [Choosing a fluid-zone model › Porous Media](/guide/choosing/choosing-a-fluid-zone-model#porous-media)

