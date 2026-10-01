---
title: inflow
section: reference
---

# inflow

Pressure-based inflow boundary condition.


## type

— no description —

always inflow

| Value | What it does | When to use it |
| --- | --- | --- |
| `inflow` (default) | An inlet whose state is set from pressure ratios, a mass flow or a reference condition. |  |

Guidance: [/guide/choosing/choosing-boundary-conditions#inflow](/guide/choosing/choosing-boundary-conditions#inflow)


## zones

Mesh zone ids this boundary condition applies to.

list of zone ids · required

Guidance: [/guide/choosing/choosing-boundary-conditions#zones](/guide/choosing/choosing-boundary-conditions#zones)


## reference

Reference condition the inflow state and its ratios are taken from.

text · not set by default


## total temperature ratio

Inlet total temperature as a ratio of the reference static temperature.

number · default 1 · 'total temperature ratio' only applies when reference is set


## kind

How the inflow state is set.

not set by default

| Value | What it does | When to use it |
| --- | --- | --- |
| `pressure` (default) | Velocity and density are derived from a total pressure ratio and a total temperature ratio relative to 'reference'. |  |
| `massflow` (default) | The inlet velocity is set from a mass flow rate or a mass flow ratio. |  |
| `default` (default) | The inflow state is taken directly from the reference condition. |  |


## static pressure ratio

Inlet static pressure as a ratio of the reference static pressure.

number · not set by default · 'static pressure ratio' only applies when reference is set


## total pressure ratio

Inlet total pressure as a ratio of the reference static pressure.

number · default 1


## direction

Flow direction vector

direction (3 numbers, unit length) · not set by default


## mass flow rate

Mass flow rate through the inlet zones; the mesh must be in metres.

number · not set by default · in kg/s · give either 'mass flow rate' or 'mass flow ratio', not both


## mass flow ratio

Inlet mass flow divided by the reference mass flux, rho_in U_in A_in / (rho_ref U_ref), with A_in in mesh units.

number · not set by default · 'mass flow ratio' only applies when reference is set


::: {.deck title="inflow"}
```python
{
    "type": "inflow",
    "zones": [4],
    ...
}
```
:::

