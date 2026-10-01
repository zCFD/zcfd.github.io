---
title: disc
section: reference
---

# disc

Actuator disc fluid zone.


## type

— no description —

always disc

| Value | What it does | When to use it |
| --- | --- | --- |
| `disc` (default) |  |  |

Guidance: [/guide/choosing/choosing-a-fluid-zone-model#actuator-discs](/guide/choosing/choosing-a-fluid-zone-model#actuator-discs)


## zones

List of zone IDs

list of zone ids · not set by default

Guidance: [/guide/choosing/choosing-a-fluid-zone-model#selecting-cells](/guide/choosing/choosing-a-fluid-zone-model#selecting-cells)


## thrust coefficient

Thrust coefficient

number · not set by default


## disc area

Disc area

number · not set by default · > 0


## tip speed ratio

Tip speed ratio

number · not set by default


## reference density

Reference density

number · not set by default · > 0


## verbose

Print turbine model and controller details at load

true or false · default False


## u ref

Reference velocity (m/s) override for the BET force calculation — used instead of the sampled freestream, e.g. for hover cases where the freestream is near zero

number · not set by default · > 0


## controller

Turbine controller

settings block · required


### type

Controller type

required

| Value | What it does | When to use it |
| --- | --- | --- |
| `tsr curve` | A target tip-speed ratio driving a torque controller from a lookup curve; the user must specify a tip speed ratio curve. |  |
| `fixed` | For a fixed controller the user must specify an angular velocity and blade pitch angle. |  |
| `schedule` |  |  |

Guidance: [/guide/choosing/choosing-a-fluid-zone-model#actuator-discs](/guide/choosing/choosing-a-fluid-zone-model#actuator-discs)


### pitch

Pitch angle

number · not set by default


### omega

Fixed rotational speed (rad/s), used with type='fixed'

number · not set by default


### tip speed ratio

Target tip speed ratio, used with type='tsr curve'

number · not set by default


### tip speed ratio curve

Tip speed ratio vs. time/velocity curve, as [x, y] pairs

list · not set by default


## geometry

Turbine geometry

settings block · required


### centre

Centre coordinates

point or vector (3 numbers) · required


### inner radius

Inner radius

number · not set by default


### outer radius

Outer radius

number · not set by default


### normal

Normal vector

point or vector (3 numbers) · required

Guidance: [/guide/choosing/choosing-a-fluid-zone-model#actuator-discs](/guide/choosing/choosing-a-fluid-zone-model#actuator-discs)


### up

Up vector

point or vector (3 numbers) · required


## discretisation

Turbine discretisation

settings block · required


### type

Discretisation type

text · required


### number of elements

Number of elements

whole number · not set by default


## model

Turbine model definition

settings block · required


### kind

Model kind (propellor or turbine)

not set by default

| Value | What it does | When to use it |
| --- | --- | --- |
| `propellor` |  |  |
| `turbine` |  |  |


### type

Model type (simple actuator disc or blade-element BET)

not set by default

| Value | What it does | When to use it |
| --- | --- | --- |
| `simple` | A simple turbine model, which averages the performance of the turbine over the entire disc, with fixed or curve-driven thrust/power coefficients. |  |
| `bet` | A blade element model, which adds the blade/aerofoil description. |  |

Guidance: [/guide/choosing/choosing-a-fluid-zone-model#actuator-discs](/guide/choosing/choosing-a-fluid-zone-model#actuator-discs)


### aerofoils

Aerofoil polar data keyed by aerofoil name (genuinely open-ended — aerofoil names and curve shapes are user-defined).

settings block · not set by default


### aerofoil positions

Radial position to aerofoil-name mapping, as [position, name] pairs

list · not set by default


### blade chord

Blade chord distribution

list · not set by default


### blade twist

Blade twist distribution

list · not set by default


### number of sections

Number of sections

whole number · not set by default


### number of blades

Number of blades

whole number · not set by default


### power

Fixed power (W)

number · not set by default


### power model

Power model kind

not set by default

| Value | What it does | When to use it |
| --- | --- | --- |
| `curve` |  |  |
| `fixed` |  |  |


### power curve

Power vs. tip speed ratio curve

list · not set by default


### power coefficient

Fixed power coefficient for the simple propellor model — torque/power are derived from it (zutil.zWind.ForceModels.zPropellorSimpleFixed)

number · not set by default · > 0


### thrust coefficient

Fixed thrust coefficient

number · not set by default


### thrust coefficient curve

Thrust coefficient vs. tip speed ratio curve

list · not set by default


### tip loss correction

Tip loss correction method

not set by default

| Value | What it does | When to use it |
| --- | --- | --- |
| `elliptic` |  |  |
| `acos-fit` |  |  |
| `acos shift-fit` |  |  |
| `f-fit` |  |  |
| `none` |  |  |
| `rstar` |  |  |


### tip loss correction radius

Tip loss correction radius

number · not set by default


## name

Zone name

text · required


## reference plane

Use reference plane

true or false · default False


## reference point

Reference point

point or vector (3 numbers) · not set by default


## definition

Definition file (VTP)

text · not set by default

Guidance: [/guide/choosing/choosing-a-fluid-zone-model#selecting-cells](/guide/choosing/choosing-a-fluid-zone-model#selecting-cells)


## update frequency

Update frequency

whole number · default 1


## rotation direction

Rotation direction

text · required


::: {.deck title="disc"}
```python
{
    "type": "disc",
    "controller": {
        "type": "tsr curve",
        ...
    },
    "geometry": {
        "centre": [423974, 6151447, 70],
        "normal": [-0.984807753012, 0.173648177667, 0],
        "up": [0, 0, 1],
        ...
    },
    "discretisation": {
        "type": "disc",
        ...
    },
    "model": {
        ...
    },
    "name": "T1",
    "rotation direction": "clockwise",
    ...
}
```
:::

