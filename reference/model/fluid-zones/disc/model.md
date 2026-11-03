---
title: model
section: reference
---

# model

Turbine model definition

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `kind` | choice | not set | Model kind (propellor or turbine) |
| `type` | choice | not set | Model type (simple actuator disc or blade-element BET) |
| `aerofoils` | settings block | not set | Aerofoil polar data keyed by aerofoil name (genuinely open-ended — aerofoil names and curve shapes are user-defined). |
| `aerofoil positions` | list | not set | Radial position to aerofoil-name mapping, as [position, name] pairs |
| `blade chord` | list | not set | Blade chord distribution |
| `blade twist` | list | not set | Blade twist distribution |
| `number of sections` | int | not set | Number of sections |
| `number of blades` | int | not set | Number of blades |
| `power` | float | not set | Fixed power (W) |
| `power model` | choice | not set | Power model kind |
| `power curve` | list | not set | Power vs. tip speed ratio curve |
| `power coefficient` | float, > 0 | not set | Fixed power coefficient for the simple propellor model — torque/power are derived from it (zutil.zWind.ForceModels.zPropellorSimpleFixed) |
| `thrust coefficient` | float | not set | Fixed thrust coefficient |
| `thrust coefficient curve` | list | not set | Thrust coefficient vs. tip speed ratio curve |
| `tip loss correction` | choice | not set | Tip loss correction method |
| `tip loss correction radius` | float | not set | Tip loss correction radius |

::: {.deck title="model"}
```python
parameters = {
    "model": {
        "<mesh>": {
            "fluid zones": {
                "<name>": {
                    "model": {
                        "kind": <choice>,
                        "type": <choice>,
                        "aerofoils": {...},
                        "aerofoil positions": [...],
                        "blade chord": [...],
                        "blade twist": [...],
                        "number of sections": <int>,
                        "number of blades": <int>,
                        "power": <float>,
                        "power model": <choice>,
                        "power curve": [...],
                        "power coefficient": <float>,
                        "thrust coefficient": <float>,
                        "thrust coefficient curve": [...],
                        "tip loss correction": <choice>,
                        "tip loss correction radius": <float>,
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

## kind

Model kind (propellor or turbine)

::: facts
**Type** choice · **Default** not set
:::

| Value | What it does | When to use it |
| --- | --- | --- |
| `propellor` | Treats the disc as a propeller that adds momentum to the flow; with a `simple` fixed model, thrust and power come from `thrust_coefficient` and `power_coefficient` scaled by rotational speed and diameter. | For propellers and other powered rotors. |
| `turbine` | Treats the disc as a wind turbine that extracts momentum from the flow; with a `simple` fixed model, thrust comes from `thrust_coefficient` on the swept area and power from `power`. | For wind and tidal turbines. |

Guidance: [Choosing a fluid-zone model › Actuator discs](/guide/choosing/choosing-a-fluid-zone-model#actuator-discs)

## type

Model type (simple actuator disc or blade-element BET)

::: facts
**Type** choice · **Default** not set
:::

| Value | What it does |
| --- | --- |
| `simple` | A simple turbine model, which averages the performance of the turbine over the entire disc, with fixed or curve-driven thrust/power coefficients. |
| `bet` | A blade element model, which adds the blade/aerofoil description. |

Guidance: [Choosing a fluid-zone model › Actuator discs](/guide/choosing/choosing-a-fluid-zone-model#actuator-discs)

## power model

Power model kind

::: facts
**Type** choice · **Default** not set
:::

| Value | What it does | When to use it |
| --- | --- | --- |
| `curve` | Interpolates power from `power_curve` and thrust coefficient from `thrust_coefficient_curve` against the reference wind speed, and gives zero outside the tabulated range. | For a `simple` turbine model across a range of wind speeds; `kind` is not read. |
| `fixed` | Uses a single operating point: `thrust_coefficient` with `power` for a turbine, or with `power_coefficient` for a propeller. | For a `simple` model at one operating condition; `kind` must also be set. |

Guidance: [Choosing a fluid-zone model › Actuator discs](/guide/choosing/choosing-a-fluid-zone-model#actuator-discs)

## tip loss correction

Tip loss correction method

::: facts
**Type** choice · **Default** not set
:::

| Value | What it does | When to use it |
| --- | --- | --- |
| `elliptic` | Scales sectional lift and drag by √(1 − r²), where r is the radius as a fraction of `outer_radius`. | A `bet` model that needs a simple tip loss across the whole span. |
| `acos-fit` | Scales sectional lift and drag by an arccos fit of the Prandtl factor, which is close to one inboard and falls to zero at the tip. | A `bet` model that needs the loss confined to the outer span. |
| `acos shift-fit` | Intended as a shifted arccos fit, but the blade element model matches only `acos_shift-fit`, so this value applies no correction. | No effect at present; use `acos-fit`. |
| `f-fit` | Scales sectional lift and drag by an empirical fit that departs from one only close to the tip. | A `bet` model that needs a correction limited to the last few per cent of span. |
| `none` | Applies no tip-loss correction. | Equivalent to leaving the key unset. |
| `rstar` | Leaves sections inboard of `tip_loss_correction_radius` uncorrected and scales those outboard by an elliptic factor that falls to zero at the tip. | A `bet` model where the loss should start at a chosen fraction of `outer_radius`. |

Guidance: [Choosing a fluid-zone model › Actuator discs](/guide/choosing/choosing-a-fluid-zone-model#actuator-discs)

