---
title: velocity perturbation
section: reference
---

# velocity perturbation

Initial random velocity seed for shear-driven turbulence (LES spin-up)

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `kind` | choice | required | Position-hashed +/-amplitude seed on all three components |
| `amplitude` | float, > 0.0 m/s | required | Peak perturbation on each velocity component |
| `depth` | float, > 0.0 m | `50` | Height below which the seed is applied; zero above |

::: {.deck title="velocity perturbation"}
```python
parameters = {
    "solver": {
        "equations": {
            "velocity perturbation": {
                "kind": <choice>,
                "amplitude": <float>,
                "depth": 50.0,
            },
            ...
        },
        ...
    },
    ...
}
```
:::

## kind

Position-hashed +/-amplitude seed on all three components

::: facts
**Type** choice · **Required** yes
:::

| Value | What it does |
| --- | --- |
| `random` | Independent pseudo-random perturbations of up to `amplitude` either side of zero on each velocity component, hashed from each cell's position and applied only below `depth`. The seed is reproducible and independent of the partitioning. |

