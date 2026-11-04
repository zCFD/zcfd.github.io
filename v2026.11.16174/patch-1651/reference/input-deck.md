---
title: Input deck
section: reference
---

# Input deck

A whole deck: how to solve (`solver`) and what to solve (`model`).

**A minimal deck**

```python
parameters = {
    "config version": 2,
    "solver": {
        "solver settings": {...},
        "equations": {...},
        "fluid properties": {...},
        "initialisation": {...},
        "time settings": {...},
        "numerical scheme": {...},
        "output settings": {...},
        ...
    },
    "model": {
        "<mesh>": {
            "mesh": <str>,
            "boundary conditions": {
                "<name>": {
                    "type": "wall",
                    "zones": [...],
                    ...
                },
            },
            "fluid zones": {
                "<name>": {
                    "type": "momentum",
                    ...
                },
            },
            ...
        },
    },
}
```

- [config version](/reference/input-deck#config-version): The deck format version. The only value accepted is `2`.
- [solver](/reference/solver): Settings shared by every mesh. It must set `solver settings`, `equations`, `fluid properties`, `initialisation`, `time settings`, `numerical scheme` and `output settings`. `reference conditions` and `convergence control` are optional.
- [model](/reference/model): One block per mesh, under a name of your choosing. Each must set `mesh` and `boundary conditions`, and may set `fluid zones` and `transforms`. Its `initialisation`, `convergence control`, `numerical scheme` and `output settings` override the solver's blocks of the same name for that mesh.

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `config version` | choice | `2` | Configuration schema version. |
| [`solver`](/reference/solver) | settings block |  | Global solver configuration and overrideable defaults |
| [`model`](/reference/model) | named settings blocks |  | The meshes to solve, each under a name of the engineer's choosing. |

::: {.deck title="Input deck"}
```python
parameters = {
    "config version": 2,
    "solver": {...},
    "model": {...},
}
```
:::

## config version

Configuration schema version. Only version 2 is supported.

::: facts
**Type** choice · **Default** `2`
:::

| Value | What it does | When to use it |
| --- | --- | --- |
| `2` (default) | The current input format, against which the deck is validated. | Every deck sets it. A deck without `config_version` is read as a legacy deck and rejected. |

