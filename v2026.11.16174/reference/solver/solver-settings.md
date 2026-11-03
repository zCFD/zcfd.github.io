---
title: solver settings
section: reference
---

# solver settings

Which solver runs the case, and how it is partitioned and parallelised

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `type` | choice | not set | The zCFD solver to be used |
| [`linear solver options`](/reference/solver/solver-settings/linear-solver-options) | settings block |  | Linear solver options passed to C++. |
| `solution smooth cycles` | int | `0` | Number of Laplace smoothing cycles for mapped solutions. |
| `safe` | bool | `False` | Enable safe mode for extra checks and diagnostics. |
| [`cell reordering`](/reference/solver/solver-settings/cell-reordering) | settings block |  | Cell and face reordering options for cache locality and colouring balance. |
| `mesh quality remediation angle threshold` | float, > 0 and <= 180 | not set | Non-orthogonality angle in degrees above which an interior face uses a first-order convective flux. |

::: {.deck title="solver settings"}
```python
parameters = {
    "solver": {
        "solver settings": {
            "type": <choice>,
            "linear solver options": {...},
            "solution smooth cycles": 0,
            "safe": False,
            "cell reordering": {...},
            "mesh quality remediation angle threshold": <float>,
        },
        ...
    },
    ...
}
```
:::

## type

The zCFD solver to be used

::: facts
**Type** choice · **Default** not set
:::

| Value | What it does | When to use it |
| --- | --- | --- |
| `compressible` | The density-based solver for the compressible equations: `euler`, `viscous`, `rans` or `les` with an ideal gas. | Where density varies with pressure and temperature, including transonic and supersonic flow. |
| `incompressible` | The pressure-based solver for incompressible flow, coupling momentum and pressure with either the `coupled` or the `simple` scheme. | Low-speed flow in which density does not depend on pressure. Buoyancy and anelastic stratification are available through the energy equation. |

## solution smooth cycles

Number of Laplace smoothing cycles for mapped solutions.

::: facts
**Type** int · **Default** `0`
:::

Guidance: [Choosing initialisation and reference state › Restart](/guide/choosing/choosing-initialisation-and-reference-state#restart)

## mesh quality remediation angle threshold

Non-orthogonality angle in degrees above which an interior face uses a first-order convective flux. Non-orthogonality is the angle between the line joining the two cell centres and the face normal. Unset leaves every face at the scheme's order.

::: facts
**Type** float, > 0 and <= 180 · **Default** not set · **Applies when** solver.solver settings.type is 'compressible'
:::

