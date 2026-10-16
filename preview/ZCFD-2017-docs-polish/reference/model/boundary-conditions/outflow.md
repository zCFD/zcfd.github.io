---
title: outflow
section: reference
---

# outflow

Pressure-based outflow boundary condition.

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `type` | choice | always `outflow` | Boundary condition applied on these zones; it determines which further settings the block takes. |
| `zones` | list of zone ids | required | Mesh zone ids this boundary condition applies to. |
| `reference` | str | not set | Reference condition the outflow ratios are taken relative to. |
| `kind` | choice | not set | How the outflow state is set. |
| `static pressure ratio` | float | `1` | *pressure / radial pressure gradient only* · Exit static pressure as a ratio of the reference static pressure. |
| `mass flow rate` | float, > 0 kg/s | not set | *massflow only* · Mass flow rate through the outlet zones, as a magnitude: the inflow or outflow type sets the direction. |
| `mass flow ratio` | float, > 0 | not set | *massflow only* · Outlet mass flow divided by the reference mass flux, rho_out U_out A_out / (rho_ref U_ref), with A_out in mesh units; a magnitude, since the inflow or outflow type sets the direction. |
| `reference radius` | float, in m | required | *radial pressure gradient only* · Radius at which the static pressure ratio is defined |

::: {.deck title="outflow"}
```python
parameters = {
    "model": {
        "<mesh>": {
            "boundary conditions": {
                "<name>": {
                    "type": "outflow",
                    "zones": [...],
                    "reference": <str>,
                    "kind": <choice>,
                    "static pressure ratio": 1.0,
                    "mass flow rate": <float>,
                    "mass flow ratio": <float>,
                    "reference radius": <float>,
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

Boundary condition applied on these zones; it determines which further settings the block takes.

::: facts
**Type** choice · **Default** always `outflow`
:::

Guidance: [Choosing boundary conditions › Outflow](/guide/choosing/choosing-boundary-conditions#outflow)

## zones

Mesh zone ids this boundary condition applies to.

::: facts
**Type** list of zone ids · **Required** yes
:::

Guidance: [Choosing boundary conditions › Zones](/guide/choosing/choosing-boundary-conditions#zones)

## kind

How the outflow state is set.

::: facts
**Type** choice · **Default** not set
:::

| Value | What it does |
| --- | --- |
| `pressure` | The exit pressure is set from a static pressure ratio relative to 'reference'. |
| `massflow` | Scales the local velocity so the integrated mass flow across all zones matches the requested value. |
| `radial pressure gradient` | As 'pressure', but the static pressure ratio holds at 'reference radius' rather than uniformly. |

Guidance: [Choosing boundary conditions › Outflow](/guide/choosing/choosing-boundary-conditions#outflow)

## mass flow rate

Mass flow rate through the outlet zones, as a magnitude: the inflow or outflow type sets the direction. The mesh must be in metres.

::: facts
**Type** float, > 0 kg/s · **Default** not set · **Applies when** 'mass flow rate' is required when solver.solver settings.type is 'compressible' and mass flow ratio is unset; give either 'mass flow rate' or 'mass flow ratio', not both
:::

## mass flow ratio

Outlet mass flow divided by the reference mass flux, rho_out U_out A_out / (rho_ref U_ref), with A_out in mesh units; a magnitude, since the inflow or outflow type sets the direction.

::: facts
**Type** float, > 0 · **Default** not set · **Applies when** reference is set
:::

