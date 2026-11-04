---
title: viscosity ramp
section: reference
---

# viscosity ramp

Scales the effective viscosity, decaying log-linearly from initial to 1, lowering the effective Reynolds number early so the start is more diffusive. initial <= 1 disables it

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `initial` | float, > 0 | required | Ramp value on the first pseudo cycle; the ramp eases to 1 from here |
| `cycles` | float, > 0 | `300` | Number of pseudo cycles over which the ramp reaches 1 |

::: {.deck title="viscosity ramp"}
```python
parameters = {
    "solver": {
        "convergence control": {
            "viscosity ramp": {
                "initial": <float>,
                "cycles": 300.0,
            },
            ...
        },
        ...
    },
    ...
}
```
:::

## initial

Ramp value on the first pseudo cycle; the ramp eases to 1 from here

::: facts
**Type** float, > 0 · **Required** yes
:::

Guidance: [Choosing a time-marching scheme › Startup ramps](/guide/choosing/choosing-a-time-marching-scheme#startup-ramps)

## cycles

Number of pseudo cycles over which the ramp reaches 1

::: facts
**Type** float, > 0 · **Default** `300`
:::

Guidance: [Choosing a time-marching scheme › Startup ramps](/guide/choosing/choosing-a-time-marching-scheme#startup-ramps)

