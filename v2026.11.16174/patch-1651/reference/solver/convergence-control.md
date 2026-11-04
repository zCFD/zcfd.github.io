---
title: convergence control
section: reference
---

# convergence control

Convergence pacing for the inner pseudo-time loop (required for steady/DTS)

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `cycles` | int, > 0 | required | Number of convergence cycles (steady) or max pseudo-time cycles per step (unsteady) |
| [`inner convergence`](/reference/solver/convergence-control/inner-convergence) | settings block |  | Let the solver decide how many inner (pseudo-time) cycles each real time step needs, with 'cycles' acting as an upper bound. |
| [`scheme`](/reference/solver/convergence-control/scheme) | choice of settings blocks |  | *compressible / incompressible only* · Pseudo-time/Convergence integration scheme |
| [`cfl`](/reference/solver/convergence-control/cfl) | settings block |  | *compressible only* · CFL configuration. |
| [`viscosity ramp`](/reference/solver/convergence-control/viscosity-ramp) | settings block |  | *incompressible only* · Scales the effective viscosity, decaying log-linearly from initial to 1, lowering the effective Reynolds number early so the start is more diffusive. initial <= 1 disables it |
| [`relaxation ramp`](/reference/solver/convergence-control/relaxation-ramp) | settings block |  | *incompressible only* · Scales the under-relaxation factors (alpha_u, alpha_p, turbulence relax), rising linearly from initial to 1, so the solver starts more relaxed. initial >= 1 (the default) disables it |

::: {.deck title="convergence control"}
```python
parameters = {
    "solver": {
        "convergence control": {
            "cycles": <int>,
            "inner convergence": {...},
            "scheme": {...},
            "cfl": {...},
            "viscosity ramp": {...},
            "relaxation ramp": {...},
        },
        ...
    },
    ...
}
```
:::

## cycles

Number of convergence cycles (steady) or max pseudo-time cycles per step (unsteady)

::: facts
**Type** int, > 0 · **Required** yes
:::

Guidance: [Choosing a time-marching scheme › Cycles](/guide/choosing/choosing-a-time-marching-scheme#cycles)

