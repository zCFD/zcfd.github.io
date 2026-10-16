---
title: sponge layer
section: reference
---

# sponge layer

Height-based wave-absorbing layer below the domain lid. Requires base_state

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `sigma max` | float, > 0.0 1/s | required | Peak damping rate at the domain top |
| `start height` | float, >= 0.0 m | required | Height where the damping ramp begins |
| `relax theta` | bool | `True` | Relax potential temperature toward the base state inside the sponge, as well as velocity. |
| `target velocity` | list of float, in m/s | not set | Velocity the sponge damps toward; unset damps toward rest |

::: {.deck title="sponge layer"}
```python
parameters = {
    "solver": {
        "equations": {
            "sponge layer": {
                "sigma max": <float>,
                "start height": <float>,
                "relax theta": True,
                "target velocity": [...],
            },
            ...
        },
        ...
    },
    ...
}
```
:::

## relax theta

Relax potential temperature toward the base state inside the sponge, as well as velocity. TRUE reproduces the existing behaviour: EnergyEqn.cu applies the sponge to theta whenever a sponge and a base state are present, which the deck's 'target velocity' wording does not convey. Set FALSE for a velocity-only sponge -- the upper boundary then stops being a heat sink, which is what isolates its effect on a stably-stratified case without also letting gravity waves reflect off the lid.

::: facts
**Type** bool · **Default** `True`
:::

