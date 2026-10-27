---
title: inner convergence
section: reference
---

# inner convergence

Let the solver decide how many inner (pseudo-time) cycles each real time step needs, with 'cycles' acting as an upper bound. Unset runs the full 'cycles' every real time step.

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `target orders` | float | `1` | Orders of magnitude the worst selected residual measure must fall within the current real time step before it is called converged: the InnerRatio diagnostic for the compressible solver, the reported residual itself (InnerDrop) for the incompressible solver. |
| `target ratio` | float, >= 0.0 | not set | Absolute floor on the InnerRatio diagnostic itself, ORed with 'target_orders'. |
| `min cycles` | int, >= 1 | `5` | Inner cycles that always run before the criterion is tested. |
| `check frequency` | int, >= 1 | `5` | Inner cycles between evaluations of the criterion. |
| `variables` | choice or list of str | `mean flow` | Residuals the criterion is judged on: 'mean flow', 'all' (mean flow plus the turbulence transport equations), or an explicit list of residual names. |
| `stall window` | int, >= 0 | `10` | Give up when the reduction stops improving over this many checks: limiter switching can floor a residual norm no number of cycles will get below. 0 disables stall detection. |
| `stall tolerance` | float | `0.05` | Orders that must be gained across 'stall_window' checks for the inner iteration to count as still making progress. |
| `start real time step` | int, >= 0 | `0` | Real time step from which the criterion may fire. |

::: {.deck title="inner convergence"}
```python
parameters = {
    "solver": {
        "convergence control": {
            "inner convergence": {
                "target orders": 1.0,
                "target ratio": <float>,
                "min cycles": 5,
                "check frequency": 5,
                "variables": "mean flow",
                "stall window": 10,
                "stall tolerance": 0.05,
                "start real time step": 0,
            },
            ...
        },
        ...
    },
    ...
}
```
:::

## target orders

Orders of magnitude the worst selected residual measure must fall within the current real time step before it is called converged: the InnerRatio diagnostic for the compressible solver, the reported residual itself (InnerDrop) for the incompressible solver. Scale free in both, so one value carries between cases. 0 or less disables this test.

::: facts
**Type** float · **Default** `1`
:::

Guidance: [Choosing a time-marching scheme › Choosing a target](/guide/choosing/choosing-a-time-marching-scheme#choosing-a-target)

## target ratio

Absolute floor on the InnerRatio diagnostic itself, ORed with 'target_orders'. Compressible solver only. Not portable between cases; measure it from a run first. Unset or 0 disables this test.

::: facts
**Type** float, >= 0.0 · **Default** not set · **Applies when** solver.solver settings.type is one of unset, 'compressible'
:::

Guidance: [Choosing a time-marching scheme › Choosing a target](/guide/choosing/choosing-a-time-marching-scheme#choosing-a-target)

## min cycles

Inner cycles that always run before the criterion is tested.

::: facts
**Type** int, >= 1 · **Default** `5`
:::

Guidance: [Choosing a time-marching scheme › Choosing a target](/guide/choosing/choosing-a-time-marching-scheme#choosing-a-target)

## check frequency

Inner cycles between evaluations of the criterion. A check cycle is also a reporting cycle: the criterion is judged on the reported residuals.

::: facts
**Type** int, >= 1 · **Default** `5`
:::

## variables

Residuals the criterion is judged on: 'mean flow', 'all' (mean flow plus the turbulence transport equations), or an explicit list of residual names. What 'mean flow' selects follows the solver: compressible takes continuity, momentum and energy (rho, rhoV[0..2], rhoE); the incompressible coupled scheme takes momentum and pressure (rhoV[0..2], p) — pressure being the continuity constraint that governs its outer iteration; SIMPLE takes momentum alone, its reported pressure being the pressure-correction solve's own residual rather than a flow one. The incompressible solver reports no energy residual, so an energy-solving case cannot select one.

::: facts
**Type** choice or list of str · **Default** `mean flow`
:::

| Value | What it does |
| --- | --- |
| `mean flow` (default) | Density, momentum and energy for the compressible solver, momentum and pressure for the incompressible coupled scheme, and momentum alone for SIMPLE. |
| `all` | Adds the turbulence transport equations. |

Guidance: [Choosing a time-marching scheme › The incompressible measure](/guide/choosing/choosing-a-time-marching-scheme#the-incompressible-measure)

## start real time step

Real time step from which the criterion may fire. A solution restarted from a steady state and left to develop — RANS into DES — looks converged per real time step while the unsteadiness is still small, so an early exit through that phase would cut the inner iteration short exactly while the instability that has to grow is being resolved.

::: facts
**Type** int, >= 0 · **Default** `0`
:::

Guidance: [Choosing a time-marching scheme › Choosing a target](/guide/choosing/choosing-a-time-marching-scheme#choosing-a-target)

