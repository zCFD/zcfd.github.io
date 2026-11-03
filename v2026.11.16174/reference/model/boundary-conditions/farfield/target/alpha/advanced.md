---
title: advanced
section: reference
---

# advanced

Tuning of how the angle is stepped and how the coefficient is measured. Unset, every setting takes its default.

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `max step` | float, > 0 and <= 6 | not set | Largest change of the angle of attack in one step, in degrees, up to 6: a larger jump can make the flow solve diverge. |
| `relaxation` | float, > 0 and <= 2 | not set | Fraction of the computed step that is taken, up to 2. |
| `average over` | int, >= 1 | not set | Number of report rows averaged into each measurement of the coefficient. |
| `max wait` | int, > 0 | not set | Cycles to wait after a step for the coefficient to settle, after which the next step is taken regardless. |
| `slope` | float | not set | First guess of the change of the coefficient per degree of angle of attack. |

::: {.deck title="advanced"}
```python
parameters = {
    "model": {
        "<mesh>": {
            "boundary conditions": {
                "<name>": {
                    "target": {
                        "alpha": {
                            "advanced": {
                                "max step": <float>,
                                "relaxation": <float>,
                                "average over": <int>,
                                "max wait": <int>,
                                "slope": <float>,
                            },
                            ...
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

## max step

Largest change of the angle of attack in one step, in degrees, up to 6: a larger jump can make the flow solve diverge. Unset, it is 4.

::: facts
**Type** float, > 0 and <= 6 · **Default** not set
:::

## relaxation

Fraction of the computed step that is taken, up to 2. Unset, it is 1.

::: facts
**Type** float, > 0 and <= 2 · **Default** not set
:::

## average over

Number of report rows averaged into each measurement of the coefficient. Unset, it is 10.

::: facts
**Type** int, >= 1 · **Default** not set
:::

## max wait

Cycles to wait after a step for the coefficient to settle, after which the next step is taken regardless. Unset, it is 1500.

::: facts
**Type** int, > 0 · **Default** not set
:::

## slope

First guess of the change of the coefficient per degree of angle of attack. Unset, it is 0.11 for CL, the thin-aerofoil slope of 2π per radian; for CD a first step of half the max step is taken instead.

::: facts
**Type** float · **Default** not set
:::

