---
title: farfield
section: reference
---

# farfield

Farfield boundary condition.


## type

— no description —

always farfield

| Value | What it does | When to use it |
| --- | --- | --- |
| `farfield` (default) | An open boundary held at a reference condition, which detects locally whether the flow enters or leaves. |  |

Guidance: [/guide/choosing/choosing-boundary-conditions](/guide/choosing/choosing-boundary-conditions)


## zones

Mesh zone ids this boundary condition applies to.

list of zone ids · required

Guidance: [/guide/choosing/choosing-boundary-conditions#zones](/guide/choosing/choosing-boundary-conditions#zones)


## kind

How the farfield state is imposed.

default riemann

| Value | What it does | When to use it |
| --- | --- | --- |
| `riemann` (default) | Uses Riemann invariants for a non-reflecting inflow with a pressure outflow. |  |
| `pressure` | Uses a pressure boundary condition for both inflow (downstream pressure) and outflow (user-specified pressure). |  |
| `supersonic` | Uses upstream conditions for both inflow and outflow. |  |
| `preconditioned` | Imposes the reference condition as a supersonic inflow on every face, whatever the local flow direction. |  |

Guidance: [/guide/choosing/choosing-boundary-conditions#farfield](/guide/choosing/choosing-boundary-conditions#farfield)


## condition

Reference condition that sets the farfield state.

text · required


## sponge layer damping

Sponge layer that damps the solution towards a reference condition near the farfield boundaries.

settings block · not set by default


### distance

Depth of the sponge layer, measured into the domain from the farfield boundaries.

number · required · in m


### damping factor

Peak damping rate, applied at the farfield boundary and ramped to zero at 'distance' along a cosine profile.

number · required · in 1/s


### condition

Reference condition the solution is damped towards inside the layer.

text · required


## driver

Controller that adjusts the farfield inflow to reach a target force.

settings block · not set by default

Guidance: [/guide/choosing/choosing-boundary-conditions#farfield](/guide/choosing/choosing-boundary-conditions#farfield)


### target

Report column name to target (e.g., 'wall_Ftz' for transformed z-force)

text · required


### target value

Target value for the force component

number · required


### force report

Name of the force report block (e.g., 'FR_1') to read forces from

text · required


### control

Inflow quantity the driver adjusts to reach the target.

required

| Value | What it does | When to use it |
| --- | --- | --- |
| `angle_of_attack` | Adjusts the angle of attack of the farfield inflow, in degrees. |  |
| `velocity_magnitude` | Adjusts the magnitude of the farfield inflow velocity, as a Mach number. |  |

Guidance: [/guide/choosing/choosing-boundary-conditions#farfield](/guide/choosing/choosing-boundary-conditions#farfield)


### initial value

Starting value for control variable (AoA: degrees, velocity: Mach)

number · default 0


### max increment

Maximum change per update (AoA: degrees, velocity: Mach)

number · default 2 · > 0


### relaxation factor

Under-relaxation factor for updates

number · default 0.75 · > 0 and <= 2.0


### update period

Cycles between control variable updates

whole number · default 200 · > 0


### settling period

Initial cycles before first update

whole number · default 500 · >= 0


### convergence tolerance

Target error tolerance for convergence

number · default 0.0001 · > 0


### smoothing window

Moving average window for force smoothing

whole number · default 20 · > 0


::: {.deck title="farfield"}
```python
{
    "type": "farfield",
    "zones": [13],
    "condition": "IC_1",
    ...
}
```
:::

