---
title: relaxation ramp
section: reference
---

# relaxation ramp

Scales the under-relaxation factors (alpha_u, alpha_p, turbulence relax), rising linearly from initial to 1, so the solver starts more relaxed. initial >= 1 (the default) disables it

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `initial` | float, > 0 | required | Ramp value on the first pseudo cycle; the ramp eases to 1 from here |
| `cycles` | float, > 0 | `300` | Number of pseudo cycles over which the ramp reaches 1 |

::: {.deck title="relaxation ramp"}
```python
parameters = {
    "solver": {
        "convergence control": {
            "relaxation ramp": {
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

