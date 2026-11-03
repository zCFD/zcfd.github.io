---
title: time settings
section: reference
---

# time settings

Physical time layout (steady, global or dual timestepping)

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `type` | choice | not set | Whether the run is time-accurate. |
| `kind` | choice | required | *unsteady only* · How each physical time step is taken: `global timestepping` advances in physical time alone, `dual time stepping` converges a pseudo-time loop within every step. |
| `total time` | float, > 0 | required | *unsteady only* · Total physical simulation time |
| `time step` | float, > 0 | required | *unsteady only* · Physical time step size |
| [`scheme`](/reference/solver/time-settings/scheme) | settings block |  | *global timestepping only* · Time integration scheme. |
| `order` | choice | `second` | *dual time stepping only* · Time integration order |
| `start` | int, >= 0 | `0` | *dual time stepping only* · Steady pseudo cycles run at real-time cycle 0 before time-accurate stepping begins; the same solve as a steady run of that length. |

::: {.deck title="time settings"}
```python
parameters = {
    "solver": {
        "time settings": {
            "type": <choice>,
            "kind": <choice>,
            "total time": <float>,
            "time step": <float>,
            "scheme": {...},
            "order": "second",
            "start": 0,
        },
        ...
    },
    ...
}
```
:::

## type

Whether the run is time-accurate. 'steady' converges a single steady state in pseudo-time; 'unsteady' marches in physical time over total_time in steps of time_step.

::: facts
**Type** choice · **Default** not set
:::

| Value | What it does | When to use it |
| --- | --- | --- |
| `steady` | Converges one steady state by marching in pseudo-time, with a local time step in each cell and no physical time derivative. | For flows that settle to a steady state. `convergence_control` sets the scheme, CFL and number of cycles. |
| `unsteady` | Marches the solution in physical time to `total_time` in steps of `time_step`. `kind` selects dual time stepping or global time stepping. | For flows that vary in time. Dual time stepping converges each physical step in pseudo-time, so `time_step` is set by the time scale to be resolved. Global time stepping is explicit, so `time_step` must also be stable in the smallest cell. |

Guidance: [Choosing a time-marching scheme › Running steady state](/guide/choosing/choosing-a-time-marching-scheme#running-steady-state)

## kind

How each physical time step is taken: `global timestepping` advances in physical time alone, `dual time stepping` converges a pseudo-time loop within every step.

::: facts
**Type** choice · **Required** yes
:::

| Value | What it does |
| --- | --- |
| `global timestepping` | Advances the solution in physical time only, using the same physical time step in every cell — there is no pseudo-time convergence loop. |
| `dual time stepping` | Advances the solution in physical time, with an inner pseudo-time convergence loop run at each physical time step to converge that step before advancing. |

Guidance: [Choosing a time-marching scheme › Global time stepping](/guide/choosing/choosing-a-time-marching-scheme#global-time-stepping)

## order

Time integration order

::: facts
**Type** choice · **Default** `second`
:::

| Value | What it does | When to use it |
| --- | --- | --- |
| `first` | First-order backward difference (BDF1, implicit Euler) for the physical time derivative. | More dissipative in time than `second`. |
| `second` (default) | Second-order backward difference (BDF2) for the physical time derivative. Until two earlier time levels are held, the step is taken at first order. | The default, for time-accurate results. |
| `1` | The same as `first`. |  |
| `2` | The same as `second`. |  |

Guidance: [Choosing a time-marching scheme › Dual time stepping](/guide/choosing/choosing-a-time-marching-scheme#dual-time-stepping)

## start

Steady pseudo cycles run at real-time cycle 0 before time-accurate stepping begins; the same solve as a steady run of that length. A settling phase for an impulsive start. 0 (the default) runs none, so real-time cycle 0 is itself time-accurate and a supplied initial condition is marched from as given

::: facts
**Type** int, >= 0 · **Default** `0`
:::

Guidance: [Choosing a time-marching scheme › Dual time stepping](/guide/choosing/choosing-a-time-marching-scheme#dual-time-stepping)

