---
title: disc
section: reference
---

# disc

Actuator disc fluid zone.

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `type` | choice | always `disc` |  |
| `thrust coefficient` | float | not set | Thrust coefficient |
| `disc area` | float, > 0 | not set | Disc area |
| `tip speed ratio` | float | not set | Tip speed ratio |
| `reference density` | float, > 0 | not set | Reference density |
| `verbose` | bool | `False` | Print turbine model and controller details at load |
| `u ref` | float, > 0 | not set | Reference velocity (m/s) override for the BET force calculation — used instead of the sampled freestream, e.g. for hover cases where the freestream is near zero |
| [`controller`](/reference/model/fluid-zones/disc/controller) | settings block |  | Turbine controller |
| [`geometry`](/reference/model/fluid-zones/disc/geometry) | settings block |  | Turbine geometry |
| [`discretisation`](/reference/model/fluid-zones/disc/discretisation) | settings block |  | Turbine discretisation |
| [`model`](/reference/model/fluid-zones/disc/model) | settings block |  | Turbine model definition |
| `name` | str | required | Zone name |
| `reference plane` | bool | `False` | Use reference plane |
| `reference point` | vector (3 floats) | not set | Reference point |
| `definition` | str | not set | Closed-surface VTP file that selects the disc's cells |
| `update frequency` | int | `1` | Update frequency |
| `rotation direction` | str | required | Rotation direction |

::: {.deck title="disc"}
```python
parameters = {
    "model": {
        "<mesh>": {
            "fluid zones": {
                "<name>": {
                    "type": "disc",
                    "thrust coefficient": <float>,
                    "disc area": <float>,
                    "tip speed ratio": <float>,
                    "reference density": <float>,
                    "verbose": False,
                    "u ref": <float>,
                    "controller": {...},
                    "geometry": {...},
                    "discretisation": {...},
                    "model": {...},
                    "name": <str>,
                    "reference plane": False,
                    "reference point": <[x, y, z]>,
                    "definition": <str>,
                    "update frequency": 1,
                    "rotation direction": <str>,
                },
            },
            ...
        },
    },
    ...
}
```
:::

## type

::: facts
**Type** choice · **Default** always `disc`
:::

Guidance: [Choosing a fluid-zone model › Actuator discs](/guide/choosing/choosing-a-fluid-zone-model#actuator-discs)

## definition

Closed-surface VTP file that selects the disc's cells

::: facts
**Type** str · **Default** not set · **Applies when** 'definition' is required when the fluid zone is an actuator disc. A disc selects its cells with a closed-surface VTP file., and only applies then
:::

Guidance: [Choosing a fluid-zone model › Selecting cells](/guide/choosing/choosing-a-fluid-zone-model#selecting-cells)

