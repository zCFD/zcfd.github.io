---
title: most
section: reference
---

# most

Monin-Obukhov surface-layer settings.

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `roughness length` | float, > 0.0 m | required | Aerodynamic roughness length z0 |
| `heat roughness length` | float, > 0.0 m | not set | Thermal roughness length z0h; defaults to roughness_length |
| `surface potential temperature` | float, > 0.0 K | not set | Prescribed surface theta_s; unset leaves the wall thermally passive |
| `surface cooling rate` | float, in K/h | not set | d(theta_s)/dt applied to surface_potential_temperature (GABLS1 uses -0.25) |
| `stable form` | choice | `hogstrom` | Stability function family for stable stratification |
| `von karman` | float, > 0.0 | `0.4` | Von Karman constant (atmospheric convention 0.4) |
| `beta m` | float, > 0.0 | `4.8` | Stable momentum coefficient, phi_m = 1 + beta_m zeta |
| `beta h` | float, > 0.0 | `7.8` | Stable heat coefficient, phi_h = 1 + beta_h zeta |

::: {.deck title="most"}
```python
parameters = {
    "model": {
        "<mesh>": {
            "boundary conditions": {
                "<name>": {
                    "most": {
                        "roughness length": <float>,
                        "heat roughness length": <float>,
                        "surface potential temperature": <float>,
                        "surface cooling rate": <float>,
                        "stable form": "hogstrom",
                        "von karman": 0.4,
                        "beta m": 4.8,
                        "beta h": 7.8,
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

## stable form

Stability function family for stable stratification

::: facts
**Type** choice · **Default** `hogstrom`
:::

| Value | What it does |
| --- | --- |
| `hogstrom` (default) | Linear functions, phi = 1 + beta zeta, with coefficients 'beta m' and 'beta h' (Högström 1988); the surface flux collapses as stability grows. |
| `beljaars-holtslag` | Beljaars and Holtslag (1991) functions, which keep a finite surface flux under strong stability. |

