---
title: momentum
section: reference
---

# momentum

Momentum source fluid zone.

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `type` | choice | always `momentum` | Fluid zone type |
| `cell zones` | list of int | not set | Mesh cell zone numbers whose cells form the source region, for example "cell zones": [4]; give this, 'definition', or neither for the whole mesh |
| `definition` | str | not set | Closed-surface VTP file selecting the source region cells; without it or 'cell zones' the source applies to the whole mesh |
| `kind` | choice | `fixed` | Source kind |
| `frequency` | int, >= 1 | `1` | Update frequency |
| `func` | Python function, or a Python function | not set | Function of the cell centres giving the source, in the units of 'source', in every cell of the source, called as f(*, locations); it returns a list of one source vector of three numbers per location |
| `source` | vector (3 floats) | not set | Momentum source vector |

::: {.deck title="momentum"}
```python
parameters = {
    "model": {
        "<mesh>": {
            "fluid zones": {
                "<name>": {
                    "type": "momentum",
                    "cell zones": [...],
                    "definition": <str>,
                    "kind": "fixed",
                    "frequency": 1,
                    "func": <function>,
                    "source": <[x, y, z]>,
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
**Type** choice · **Default** always `momentum`
:::

Guidance: [Choosing a fluid-zone model › Momentum Source](/guide/choosing/choosing-a-fluid-zone-model#momentum-source)

## cell zones

Mesh cell zone numbers whose cells form the source region, for example "cell zones": [4]; give this, 'definition', or neither for the whole mesh

::: facts
**Type** list of int · **Default** not set · **Applies when** give either 'cell zones' or 'definition', not both
:::

Guidance: [Choosing a fluid-zone model › Selecting cells](/guide/choosing/choosing-a-fluid-zone-model#selecting-cells)

## definition

Closed-surface VTP file selecting the source region cells; without it or 'cell zones' the source applies to the whole mesh

::: facts
**Type** str · **Default** not set
:::

Guidance: [Choosing a fluid-zone model › Selecting cells](/guide/choosing/choosing-a-fluid-zone-model#selecting-cells)

## kind

Source kind

::: facts
**Type** choice · **Default** `fixed`
:::

| Value | What it does | When to use it |
| --- | --- | --- |
| `fixed` (default) | Labels the source as constant; the solver evaluates `func` once at start-up whatever the kind. | The default; every kind gives the same result. |
| `ramp` | Labels the source as ramped, but the solver does not read `kind`, so it behaves as `fixed`. | No effect; leave the default. |
| `func` | Labels the source as function-driven, but the solver does not read `kind`, so it behaves as `fixed`. | No effect; leave the default. |

Guidance: [Choosing a fluid-zone model › Momentum Source](/guide/choosing/choosing-a-fluid-zone-model#momentum-source)

## func

Function of the cell centres giving the source, in the units of 'source', in every cell of the source, called as f(*, locations); it returns a list of one source vector of three numbers per location

::: facts
**Type** Python function, or a Python function · **Default** not set
:::

Guidance: [Python functions in the deck › Momentum source function](/guide/setting-up/python-functions-in-the-deck#momentum-source-function)

