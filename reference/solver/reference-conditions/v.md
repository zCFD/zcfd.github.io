---
title: v
section: reference
---

# v

Velocity vector [Vx, Vy, Vz] (m/s) or inflow vector specification

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `vector` | vector (3 floats) | required | Velocity [Vx, Vy, Vz] in m/s. |
| `mach` | float, >= 0 | not set | Mach number to scale magnitude of inflow vector by |

::: {.deck title="v"}
```python
parameters = {
    "solver": {
        "reference conditions": {
            "<name>": {
                "v": {
                    "vector": <[x, y, z]>,
                    "mach": <float>,
                },
                ...
            },
        },
        ...
    },
    ...
}
```
:::

## vector

Velocity [Vx, Vy, Vz] in m/s. When mach is set, the compressible solver keeps only its direction and takes the speed from the Mach number; the incompressible solver ignores mach.

::: facts
**Type** vector (3 floats) · **Required** yes
:::

Guidance: [Choosing initialisation and reference state › Velocity](/guide/choosing/choosing-initialisation-and-reference-state#velocity)

## mach

Mach number to scale magnitude of inflow vector by

::: facts
**Type** float, >= 0 · **Default** not set
:::

Guidance: [Choosing initialisation and reference state › Velocity](/guide/choosing/choosing-initialisation-and-reference-state#velocity)

