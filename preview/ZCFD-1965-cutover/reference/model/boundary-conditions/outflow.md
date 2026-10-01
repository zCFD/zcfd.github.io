---
title: outflow
section: reference
---

# outflow

Pressure-based outflow boundary condition.


## type

— no description —

always outflow

| Value | What it does | When to use it |
| --- | --- | --- |
| `outflow` (default) | An outlet whose state is set from a pressure ratio, a mass flow or a radial pressure gradient. |  |

Guidance: [/guide/choosing/choosing-boundary-conditions#outflow](/guide/choosing/choosing-boundary-conditions#outflow)


## zones

Mesh zone ids this boundary condition applies to.

list of zone ids · required

Guidance: [/guide/choosing/choosing-boundary-conditions#zones](/guide/choosing/choosing-boundary-conditions#zones)


## reference

Reference condition the outflow ratios are taken relative to.

text · not set by default


## kind

How the outflow state is set.

not set by default

| Value | What it does | When to use it |
| --- | --- | --- |
| `pressure` (default) | The exit pressure is set from a static pressure ratio relative to 'reference', or directly by 'pressure'. |  |
| `massflow` (default) | Scales the local velocity so the integrated mass flow across all zones matches the requested value. |  |
| `radial pressure gradient` (default) | As 'pressure', but the static pressure ratio holds at 'reference radius' rather than uniformly. |  |

Guidance: [/guide/choosing/choosing-boundary-conditions#outflow](/guide/choosing/choosing-boundary-conditions#outflow)


## pressure

Exit pressure

number · not set by default · > 0 Pa


## pressure ramp

Pressure ramping parameters

settings block · not set by default


## static pressure ratio

Exit static pressure as a ratio of the reference static pressure.

number · default 1


## total temperature ratio

Total temperature ratio

number · not set by default · 'total temperature ratio' only applies when reference is set


## mass flow rate

Mass flow rate through the outlet zones; the mesh must be in metres.

number · not set by default · in kg/s · give either 'mass flow rate' or 'mass flow ratio', not both


## mass flow ratio

Outlet mass flow divided by the reference mass flux, rho_out U_out A_out / (rho_ref U_ref), with A_out in mesh units.

number · not set by default · 'mass flow ratio' only applies when reference is set


## reference radius

Radius at which the static pressure ratio is defined

number · required · in m


::: {.deck title="outflow"}
```python
{
    "type": "outflow",
    "zones": [5],
    "reference radius": ...,
    ...
}
```
:::

