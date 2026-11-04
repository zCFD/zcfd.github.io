---
title: scheme
section: reference
---

# scheme

Time integration scheme. GTS marches physical time with this scheme itself, so the scheme sets the run's order of accuracy — only the three-stage TVD Runge-Kutta (SSP-RK3, third order) is admissible.

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `name` | choice | `runge kutta` | Physical time integration scheme. |
| `stage` | choice | `3` | Runge-Kutta stage configuration: the three-stage TVD scheme (SSP-RK3), third order in physical time. |

::: {.deck title="scheme"}
```python
parameters = {
    "solver": {
        "time settings": {
            "scheme": {
                "name": "runge kutta",
                "stage": 3,
            },
            ...
        },
        ...
    },
    ...
}
```
:::

## name

Physical time integration scheme. Global time stepping admits only the three-stage TVD Runge-Kutta

::: facts
**Type** choice · **Default** `runge kutta`
:::

| Value | What it does |
| --- | --- |
| `runge kutta` (default) | The three-stage TVD Runge-Kutta (SSP-RK3), third order in physical time. |

Guidance: [Choosing a time-marching scheme › Global time stepping](/guide/choosing/choosing-a-time-marching-scheme#global-time-stepping)

## stage

Runge-Kutta stage configuration: the three-stage TVD scheme (SSP-RK3), third order in physical time. Spelled either 3 or 'rk third order tvd' — the same scheme either way

::: facts
**Type** choice · **Default** `3`
:::

| Value | What it does |
| --- | --- |
| `3` (default) | The three-stage TVD Runge-Kutta (SSP-RK3), third order in physical time. |
| `rk third order tvd` | The same as `3`. |

Guidance: [Choosing a time-marching scheme › Global time stepping](/guide/choosing/choosing-a-time-marching-scheme#global-time-stepping)

