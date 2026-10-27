---
title: cfl ramp
section: reference
---

# cfl ramp

How the CFL climbs toward 'cfl'. A list of ramps, each naming its shape — one entry for a single ramp, several to run in order. Alternatively a function, called as f(*, cycle, current_cfl); it returns the new CFL as a number, or a dict of any of 'cfl', 'cfl_turbulence' and 'cfl_coarse'. Keys a returned dict leaves out keep their static value.

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `initial` | float, > 0 | not set | CFL this ramp starts from, returned at its own start cycle. |
| `start cycle` | int, >= 1 | `1` | First solve cycle this ramp acts on. |
| `end cycle` | int, >= 1 | not set | Last solve cycle this ramp acts on. |
| `type` | choice | required | How the ramp changes the CFL in its window: `exponential` multiplies it, `linear` and `stepped_linear` add to it. |
| `factor` | float, >= 1.0 | required | *exponential only* · Multiplied into the CFL every cycle. |
| `max allowed` | float, > 0 | `1000000` | *exponential only* · Ceiling on the ramp itself, guarding against overflow. |
| `increment` | float | required | *linear / stepped_linear only* · Added to the CFL every cycle in the window. |
| `step cycles` | int, > 0 | required | *stepped_linear only* · Cycles between steps. |

::: {.deck title="cfl ramp"}
```python
parameters = {
    "solver": {
        "convergence control": {
            "cfl": {
                "cfl ramp": [
                    {
                        "initial": <float>,
                        "start cycle": 1,
                        "end cycle": <int>,
                        "type": <choice>,
                        "factor": <float>,
                        "max allowed": 1000000.0,
                        "increment": <float>,
                        "step cycles": <int>,
                    },
                ],
                ...
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

CFL this ramp starts from, returned at its own start cycle. Leave unset to carry on from wherever the previous ramp left off.

::: facts
**Type** float, > 0 · **Default** not set
:::

Guidance: [Choosing a time-marching scheme › cfl_ramp](/guide/choosing/choosing-a-time-marching-scheme#cfl_ramp)

## start cycle

First solve cycle this ramp acts on.

::: facts
**Type** int, >= 1 · **Default** `1`
:::

Guidance: [Choosing a time-marching scheme › cfl_ramp](/guide/choosing/choosing-a-time-marching-scheme#cfl_ramp)

## end cycle

Last solve cycle this ramp acts on. Unset runs to the end of the run.

::: facts
**Type** int, >= 1 · **Default** not set
:::

Guidance: [Choosing a time-marching scheme › cfl_ramp](/guide/choosing/choosing-a-time-marching-scheme#cfl_ramp)

## type

How the ramp changes the CFL in its window: `exponential` multiplies it, `linear` and `stepped_linear` add to it.

::: facts
**Type** choice · **Required** yes
:::

| Value | What it does |
| --- | --- |
| `exponential` | Multiplies the CFL by `factor` (>= 1.0) each cycle, capped at `max_allowed`. |
| `linear` | Adds `increment` to the CFL every cycle between `start_cycle` and `end_cycle`. |
| `stepped_linear` | Adds `increment` every `step_cycles` cycles. |

Guidance: [Choosing a time-marching scheme › cfl_ramp](/guide/choosing/choosing-a-time-marching-scheme#cfl_ramp)

## factor

Multiplied into the CFL every cycle. Must be at least 1.

::: facts
**Type** float, >= 1.0 · **Required** yes
:::

## increment

Added to the CFL every cycle in the window. An increment of 0 holds the CFL steady.

::: facts
**Type** float · **Required** yes
:::

