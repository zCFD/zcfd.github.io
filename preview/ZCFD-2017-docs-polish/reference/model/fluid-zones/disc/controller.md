---
title: controller
section: reference
---

# controller

Turbine controller

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `type` | choice | required | Controller type |
| `pitch` | float | not set | Pitch angle |
| `omega` | float | not set | Fixed rotational speed (rad/s), used with type='fixed' |
| `tip speed ratio` | float | not set | Target tip speed ratio, used with type='tsr curve' |
| `tip speed ratio curve` | list | not set | Tip speed ratio vs. time/velocity curve, as [x, y] pairs |

::: {.deck title="controller"}
```python
parameters = {
    "model": {
        "<mesh>": {
            "fluid zones": {
                "<name>": {
                    "controller": {
                        "type": <choice>,
                        "pitch": <float>,
                        "omega": <float>,
                        "tip speed ratio": <float>,
                        "tip speed ratio curve": [...],
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

## type

Controller type

::: facts
**Type** choice · **Required** yes
:::

| Value | What it does | When to use it |
| --- | --- | --- |
| `tsr curve` | A target tip-speed ratio driving a torque controller from a lookup curve; the user must specify a tip speed ratio curve. |  |
| `fixed` | For a fixed controller the user must specify an angular velocity and blade pitch angle. |  |
| `schedule` | Sets pitch and rotational speed by interpolating `pitch_schedule` and `speed_schedule` tables against the reference wind speed, and stops the rotor outside their range. | Not available from a validated deck, as the schema does not accept `pitch_schedule` or `speed_schedule`. |

Guidance: [Choosing a fluid-zone model › Actuator discs](/guide/choosing/choosing-a-fluid-zone-model#actuator-discs)

