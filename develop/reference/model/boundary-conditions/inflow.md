---
title: inflow
section: reference
---

# inflow

Pressure-based inflow boundary condition.

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `type` | choice | always `inflow` | Boundary condition applied on these zones; it determines which further settings the block takes. |
| `zones` | list of zone ids | required | Mesh zone ids this boundary condition applies to. |
| `reference` | str | not set | Reference condition the inflow state and its ratios are taken from. |
| `total temperature ratio` | float | `1` | Inlet total temperature as a ratio of the reference static temperature. |
| `kind` | choice | not set | How the inflow state is set. |
| `static pressure ratio` | float | not set | *pressure only* · Inlet static pressure as a ratio of the reference static pressure. |
| `total pressure ratio` | float | `1` | *pressure only* · Inlet total pressure as a ratio of the reference static pressure. |
| `direction` | unit vector (3 floats) | not set | *pressure / massflow only* · Direction the flow enters along; unset, it enters normal to the boundary. |
| `mach` | float, > 0 | not set | *pressure only* · Inlet Mach number; the inlet static pressure then follows from the total pressure ratio and this Mach number rather than from the interior flow. |
| `mass flow rate` | float, > 0 kg/s | not set | *massflow only* · Mass flow rate through the inlet zones, as a magnitude: the inflow or outflow type sets the direction. |
| `mass flow ratio` | float, > 0 | not set | *massflow only* · Inlet mass flow divided by the reference mass flux, rho_in U_in A_in / (rho_ref U_ref), with A_in in mesh units; a magnitude, since the inflow or outflow type sets the direction. |

::: {.deck title="inflow"}
```python
parameters = {
    "model": {
        "<mesh>": {
            "boundary conditions": {
                "<name>": {
                    "type": "inflow",
                    "zones": [...],
                    "reference": <str>,
                    "total temperature ratio": 1.0,
                    "kind": <choice>,
                    "static pressure ratio": <float>,
                    "total pressure ratio": 1.0,
                    "direction": <[x, y, z]>,
                    "mach": <float>,
                    "mass flow rate": <float>,
                    "mass flow ratio": <float>,
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
**Type** choice · **Default** always `inflow`
:::

Guidance: [Choosing boundary conditions › Inflow](/guide/choosing/choosing-boundary-conditions#inflow)

## zones

Mesh zone ids this boundary condition applies to.

::: facts
**Type** list of zone ids · **Required** yes
:::

Guidance: [Choosing boundary conditions › Zones](/guide/choosing/choosing-boundary-conditions#zones)

## total temperature ratio

Inlet total temperature as a ratio of the reference static temperature.

::: facts
**Type** float · **Default** `1` · **Applies when** reference is set
:::

## kind

How the inflow state is set.

::: facts
**Type** choice · **Default** not set
:::

| Value | What it does |
| --- | --- |
| `pressure` | Velocity and density are derived from a total pressure ratio and a total temperature ratio relative to 'reference'. |
| `massflow` | The inlet velocity is set from a mass flow rate or a mass flow ratio. |
| `default` | Incompressible solver only: the inflow state is taken directly from the reference condition. |

## static pressure ratio

Inlet static pressure as a ratio of the reference static pressure.

::: facts
**Type** float · **Default** not set · **Applies when** reference is set
:::

## mass flow rate

Mass flow rate through the inlet zones, as a magnitude: the inflow or outflow type sets the direction. The mesh must be in metres.

::: facts
**Type** float, > 0 kg/s · **Default** not set · **Applies when** 'mass flow rate' is required when solver.solver settings.type is 'compressible' and mass flow ratio is unset; give either 'mass flow rate' or 'mass flow ratio', not both
:::

## mass flow ratio

Inlet mass flow divided by the reference mass flux, rho_in U_in A_in / (rho_ref U_ref), with A_in in mesh units; a magnitude, since the inflow or outflow type sets the direction.

::: facts
**Type** float, > 0 · **Default** not set · **Applies when** reference is set
:::

