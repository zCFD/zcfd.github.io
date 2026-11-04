---
title: theta perturbation
section: reference
---

# theta perturbation

Initial potential-temperature perturbation added to the base state (gravity-wave and bubble benchmarks)

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `kind` | choice | required | inertia gravity wave: A sin(pi z/H) / (1 + ((x - xc)/a)^2) (Skamarock & Klemp 1994); bubble: A cos^2(pi r/2) inside the ellipse r = \|((x - xc)/rx, (z - zc)/rz)\| <= 1; random: position-hashed +/-A turbulence seed below 'depth' (GABLS1) |
| `amplitude` | float, in K | required | A; negative for a cold bubble |
| `centre` | list of float, in m | `[0, 0]` | [xc, zc]; zc is used by the bubble only |
| `half width` | float, > 0.0 m | `5000` | a for the gravity wave, or the bubble x radius rx |
| `half height` | float, > 0.0 m | `2000` | Bubble z radius rz |
| `depth` | float, > 0.0 m | `10000` | H in sin(pi z/H) for the gravity wave |

::: {.deck title="theta perturbation"}
```python
parameters = {
    "solver": {
        "equations": {
            "theta perturbation": {
                "kind": <choice>,
                "amplitude": <float>,
                "centre": [0.0, 0.0],
                "half width": 5000.0,
                "half height": 2000.0,
                "depth": 10000.0,
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

inertia gravity wave: A sin(pi z/H) / (1 + ((x - xc)/a)^2) (Skamarock & Klemp 1994); bubble: A cos^2(pi r/2) inside the ellipse r = |((x - xc)/rx, (z - zc)/rz)| <= 1; random: position-hashed +/-A turbulence seed below 'depth' (GABLS1)

::: facts
**Type** choice · **Required** yes
:::

| Value | What it does | When to use it |
| --- | --- | --- |
| `inertia gravity wave` | $\theta' = A \sin(\pi z/H) / (1 + ((x-x_c)/a)^2)$ (Skamarock & Klemp 1994). |  |
| `bubble` | $\theta' = A \cos^2(\pi r/2)$ inside the ellipse $r = \|((x-x_c)/r_x, (z-z_c)/r_z)\| \le 1$, zero outside. |  |
| `random` | A pseudo-random $\theta'$ of up to `amplitude` either side of zero, hashed from each cell's position and applied only below `depth`. The seed is reproducible and independent of the partitioning. | Seeding turbulence in a stable boundary layer, as in GABLS1. |

