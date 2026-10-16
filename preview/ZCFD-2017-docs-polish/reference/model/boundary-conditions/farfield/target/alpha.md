---
title: alpha
section: reference
---

# alpha

Turn the angle of attack, starting from the condition's own velocity, until the coefficient is met.

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `cl` | float | not set | Lift coefficient to trim to. |
| `cd` | float | not set | Drag coefficient to trim to. |
| `hold` | int, > 0 | not set | Cycles to run on once the target is met, after which the run stops. |
| `tolerance` | float, > 0 | not set | How close the coefficient must come to its target to count as met. |
| `of` | str | not set | Force report the coefficient is read from. |
| [`advanced`](/reference/model/boundary-conditions/farfield/target/alpha/advanced) | settings block |  | Tuning of how the angle is stepped and how the coefficient is measured. |

::: {.deck title="alpha"}
```python
parameters = {
    "model": {
        "<mesh>": {
            "boundary conditions": {
                "<name>": {
                    "target": {
                        "alpha": {
                            "cl": <float>,
                            "cd": <float>,
                            "hold": <int>,
                            "tolerance": <float>,
                            "of": <str>,
                            "advanced": {...},
                        },
                        ...
                    },
                    ...
                },
            },
            ...
        },
    },
    ...
}
```
:::

## cl

Lift coefficient to trim to.

::: facts
**Type** float · **Default** not set · **Applies when** give either 'cl' or 'cd'
:::

## hold

Cycles to run on once the target is met, after which the run stops. Unset, the run ends in the ordinary way.

::: facts
**Type** int, > 0 · **Default** not set
:::

## tolerance

How close the coefficient must come to its target to count as met. Unset, it is 0.001 for CL and 0.0001 for CD.

::: facts
**Type** float, > 0 · **Default** not set
:::

## of

Force report the coefficient is read from. Needed only when there is more than one force report.

::: facts
**Type** str · **Default** not set
:::

