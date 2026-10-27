---
title: farfield
section: reference
---

# farfield

Farfield boundary condition.

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `type` | choice | always `farfield` | Boundary condition applied on these zones; it determines which further settings the block takes. |
| `zones` | list of zone ids | required | Mesh zone ids this boundary condition applies to. |
| `kind` | choice | `riemann` | How the farfield state is imposed. |
| `condition` | str | required | Reference condition that sets the farfield state. |
| [`sponge layer damping`](/reference/model/boundary-conditions/farfield/sponge-layer-damping) | settings block |  | Sponge layer that damps the solution towards a reference condition near the farfield boundaries. |
| [`target`](/reference/model/boundary-conditions/farfield/target) | settings block |  | A lift or drag coefficient the farfield is trimmed to reach, by turning its angle of attack. |

::: {.deck title="farfield"}
```python
parameters = {
    "model": {
        "<mesh>": {
            "boundary conditions": {
                "<name>": {
                    "type": "farfield",
                    "zones": [...],
                    "kind": "riemann",
                    "condition": <str>,
                    "sponge layer damping": {...},
                    "target": {...},
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
**Type** choice · **Default** always `farfield` · **Applies when** solver.solver settings.type is 'compressible'
:::

Guidance: [Choosing boundary conditions](/guide/choosing/choosing-boundary-conditions)

## zones

Mesh zone ids this boundary condition applies to.

::: facts
**Type** list of zone ids · **Required** yes
:::

Guidance: [Choosing boundary conditions › Zones](/guide/choosing/choosing-boundary-conditions#zones)

## kind

How the farfield state is imposed.

::: facts
**Type** choice · **Default** `riemann`
:::

| Value | What it does |
| --- | --- |
| `riemann` (default) | Uses Riemann invariants for a non-reflecting inflow with a pressure outflow. |
| `pressure` | Uses a pressure boundary condition for both inflow (downstream pressure) and outflow (user-specified pressure). |
| `supersonic` | Uses upstream conditions for both inflow and outflow. |
| `preconditioned` | Imposes the reference condition as a supersonic inflow on every face, whatever the local flow direction. |

Guidance: [Choosing boundary conditions › Farfield](/guide/choosing/choosing-boundary-conditions#farfield)

