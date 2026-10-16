---
title: multigrid
section: reference
---

# multigrid

Multigrid acceleration for explicit schemes

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `levels` | int, 1 to 10 | required | Number of multigrid levels |
| `cycles` | int, >= 1 | `100000000` | Number of multigrid cycles |
| `multigrid ramp` | int, >= 0 | not set | Solve cycle after which the coarse multigrid levels are used |
| `prolong factor` | float | not set | Prolongation factor |
| `prolong transport factor` | float | not set | Prolongation factor for the turbulence/transport equations |

::: {.deck title="multigrid"}
```python
parameters = {
    "solver": {
        "numerical scheme": {
            "multigrid": {
                "levels": <int>,
                "cycles": 100000000,
                "multigrid ramp": <int>,
                "prolong factor": <float>,
                "prolong transport factor": <float>,
            },
            ...
        },
        ...
    },
    ...
}
```
:::

## levels

Number of multigrid levels

::: facts
**Type** int, 1 to 10 · **Required** yes
:::

Guidance: [Choosing a time-marching scheme › Multigrid](/guide/choosing/choosing-a-time-marching-scheme#multigrid)

## cycles

Number of multigrid cycles

::: facts
**Type** int, >= 1 · **Default** `100000000`
:::

Guidance: [Choosing a time-marching scheme › Multigrid](/guide/choosing/choosing-a-time-marching-scheme#multigrid)

