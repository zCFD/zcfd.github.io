---
title: time settings
section: reference
---

# time settings

Physical time layout (steady, global or dual timestepping)


## type

— no description —

default unsteady

| Value | What it does | When to use it |
| --- | --- | --- |
| `unsteady` (default) |  |  |
| `steady` (default) | A steady run has no physical time layout at all; all of its pacing comes from `convergence_control`. |  |

Guidance: [/guide/choosing/choosing-a-time-marching-scheme#global-time-stepping](/guide/choosing/choosing-a-time-marching-scheme#global-time-stepping)


## kind

— no description —

required

| Value | What it does | When to use it |
| --- | --- | --- |
| `global timestepping` | Advances the solution in physical time only, using the same physical time step in every cell — there is no pseudo-time convergence loop. |  |
| `dual time stepping` | Advances the solution in physical time, with an inner pseudo-time convergence loop run at each physical time step to converge that step before advancing. |  |

Guidance: [/guide/choosing/choosing-a-time-marching-scheme#global-time-stepping](/guide/choosing/choosing-a-time-marching-scheme#global-time-stepping)


## total time

Total physical simulation time

number · required · > 0


## time step

Physical time step size

number · required · > 0


## scheme

Time integration scheme. GTS marches physical time with this scheme itself, so the scheme sets the run's order of accuracy — only the three-stage TVD Runge-Kutta (SSP-RK3, third order) is admissible.

settings block · required

Guidance: [/guide/choosing/choosing-a-time-marching-scheme#global-time-stepping](/guide/choosing/choosing-a-time-marching-scheme#global-time-stepping)


### name

Physical time integration scheme. Global time stepping admits only the three-stage TVD Runge-Kutta

default runge kutta

| Value | What it does | When to use it |
| --- | --- | --- |
| `runge kutta` (default) | The three-stage TVD Runge-Kutta (SSP-RK3), third order in physical time. |  |

Guidance: [/guide/choosing/choosing-a-time-marching-scheme#global-time-stepping](/guide/choosing/choosing-a-time-marching-scheme#global-time-stepping)


### stage

Runge-Kutta stage configuration: the three-stage TVD scheme (SSP-RK3), third order in physical time. Spelled either 3 or 'rk third order tvd' — the same scheme either way

default 3

| Value | What it does | When to use it |
| --- | --- | --- |
| `3` (default) |  |  |
| `rk third order tvd` |  |  |

Guidance: [/guide/choosing/choosing-a-time-marching-scheme#global-time-stepping](/guide/choosing/choosing-a-time-marching-scheme#global-time-stepping)


## order

Time integration order

default second

| Value | What it does | When to use it |
| --- | --- | --- |
| `first` |  |  |
| `second` (default) |  |  |
| `1` |  |  |
| `2` |  |  |

Guidance: [/guide/choosing/choosing-a-time-marching-scheme#dual-time-stepping](/guide/choosing/choosing-a-time-marching-scheme#dual-time-stepping)


## start

Steady pseudo cycles run at real-time cycle 0 before time-accurate stepping begins; the same solve as a steady run of that length. A settling phase for an impulsive start. 0 (the default) runs none, so real-time cycle 0 is itself time-accurate and a supplied initial condition is marched from as given

whole number · default 0 · >= 0

Guidance: [/guide/choosing/choosing-a-time-marching-scheme#dual-time-stepping](/guide/choosing/choosing-a-time-marching-scheme#dual-time-stepping)


::: {.deck title="time settings"}
```python
"time settings": {
    "kind": "dual time stepping",
    "total time": 5,
    "time step": 0.05,
    "scheme": {
        ...
    },
    ...
},
```
:::

