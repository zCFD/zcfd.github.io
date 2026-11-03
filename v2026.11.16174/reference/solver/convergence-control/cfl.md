---
title: cfl
section: reference
---

# cfl

CFL configuration. A bare number is shorthand for the working CFL: `cfl: 2.0` means `cfl: {cfl: 2.0}`.

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `cfl` | float, > 0 | required | CFL number |
| `cfl turbulence` | float, > 0 | not set | Working CFL for the turbulence transport equations (the conserved-variable slots beyond the 5 mean-flow equations — SA: 1, SST: 2). |
| `cfl coarse` | float, > 0 | not set | CFL number for multigrid coarse levels |
| [`cfl ramp`](/reference/solver/convergence-control/cfl/cfl-ramp) | list of settings blocks |  | How the CFL climbs toward 'cfl'. |
| `cfl viscous factor` | float, > 0 | not set | CFL viscous factor |

::: {.deck title="cfl"}
```python
parameters = {
    "solver": {
        "convergence control": {
            "cfl": {
                "cfl": <float>,
                "cfl turbulence": <float>,
                "cfl coarse": <float>,
                "cfl ramp": [...],
                "cfl viscous factor": <float>,
            },
            ...
        },
        ...
    },
    ...
}
```
:::

## cfl

CFL number

::: facts
**Type** float, > 0 · **Required** yes
:::

Guidance: [Choosing a time-marching scheme › cfl](/guide/choosing/choosing-a-time-marching-scheme#cfl)

## cfl turbulence

Working CFL for the turbulence transport equations (the conserved-variable slots beyond the 5 mean-flow equations — SA: 1, SST: 2). The solver uses it directly as the pseudo-time CFL for those equations, not as a cap. Has no effect when no turbulence model is active (euler, laminar viscous, non-hybrid LES).

::: facts
**Type** float, > 0 · **Default** not set
:::

Guidance: [Choosing a time-marching scheme › cfl_turbulence](/guide/choosing/choosing-a-time-marching-scheme#cfl_turbulence)

## cfl coarse

CFL number for multigrid coarse levels

::: facts
**Type** float, > 0 · **Default** not set · **Applies when** solver.numerical scheme.multigrid is set
:::

Guidance: [Choosing a time-marching scheme › cfl_coarse](/guide/choosing/choosing-a-time-marching-scheme#cfl_coarse)

## cfl viscous factor

CFL viscous factor

::: facts
**Type** float, > 0 · **Default** not set
:::

Guidance: [Choosing a time-marching scheme › cfl_viscous_factor](/guide/choosing/choosing-a-time-marching-scheme#cfl_viscous_factor)

