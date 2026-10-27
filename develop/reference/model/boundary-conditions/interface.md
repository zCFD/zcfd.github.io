---
title: interface
section: reference
---

# interface

Overset interface: this mesh overlaps another and takes its fringe values from it.

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `type` | choice | always `interface` | Boundary condition applied on these zones; it determines which further settings the block takes. |
| `zones` | list of zone ids | required | Mesh zone ids this boundary condition applies to. |
| `kind` | choice | not set | How this interface joins its two sides. |
| [`connection`](/reference/model/boundary-conditions/interface/connection) | settings block |  | Model(s) whose mesh provides donor data at this interface. |
| `interpolation method` | choice | `least-squares` | *overset only* · How the donor value is built once the containing donor cell is known. |
| `additional active layers` | int, >= 0 | `0` | *overset only* · Number of additional active cell layers near the blanking boundary |
| `blank enclosed cells` | bool | `True` | *overset only* · Also blank the background cells the hole encloses but no overset cell covers: the ones inside this mesh's own solid bodies |
| `create overset halos` | bool | `True` | *overset only* · Search for overset donors at the halo cell centre rather than at the boundary face centre, on the background-to-overset direction. |
| `moving mesh halo layers` | int, >= 0 | `0` | *overset only* · Halo fringe layers around the hole when the overset mesh moves (0 = treat every blanked cell as a halo; N > 0 is sufficient when the hole is re-cut every real time step) |
| `area` | choice | `conservative` | *sliding only* · Which area vector each side's segments use. |
| `flux` | choice | `segment` | *sliding only* · Where the interface's numerical flux is evaluated. |
| `segment capacity factor` | int, >= 1 | `8` | *sliding only* · Segment storage reserved per interface face. |
| `sliver tolerance` | float, >= 0.0 | `1e-10` | *sliding only* · Overlaps smaller than this fraction of the smaller parent face are discarded. |
| `closure tolerance` | float, >= 0.0 | `0.01` | *sliding only* · Largest fraction of a face's area that may be left uncovered by its segments before setup aborts. |
| [`transform`](/reference/model/boundary-conditions/interface/transform) | choice of settings blocks |  | *periodic only* · Transformation that maps this boundary onto the one it connects to. |

::: {.deck title="interface"}
```python
parameters = {
    "model": {
        "<mesh>": {
            "boundary conditions": {
                "<name>": {
                    "type": "interface",
                    "zones": [...],
                    "kind": <choice>,
                    "connection": {...},
                    "interpolation method": "least-squares",
                    "additional active layers": 0,
                    "blank enclosed cells": True,
                    "create overset halos": True,
                    "moving mesh halo layers": 0,
                    "area": "conservative",
                    "flux": "segment",
                    "segment capacity factor": 8,
                    "sliver tolerance": 1e-10,
                    "closure tolerance": 0.01,
                    "transform": {...},
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
**Type** choice · **Default** always `interface`
:::

Guidance: [Choosing boundary conditions](/guide/choosing/choosing-boundary-conditions)

## zones

Mesh zone ids this boundary condition applies to.

::: facts
**Type** list of zone ids · **Required** yes
:::

Guidance: [Choosing boundary conditions › Zones](/guide/choosing/choosing-boundary-conditions#zones)

## kind

How this interface joins its two sides.

::: facts
**Type** choice · **Default** not set
:::

| Value | What it does |
| --- | --- |
| `overset` | This mesh overlaps another and takes the values in its fringe from the mesh beneath it. |
| `sliding` | Two meshes meet on a shared surface of revolution with non-matching faces and exchange a conservative flux across it. |
| `periodic` | Two boundaries of the same mesh are treated as one surface, related by a rotation or a translation. |

## interpolation method

How the donor value is built once the containing donor cell is known.

::: facts
**Type** choice · **Default** `least-squares`
:::

| Value | What it does | When to use it |
| --- | --- | --- |
| `nearest cell` | Takes the containing donor cell's value directly: a piecewise-constant, first-order transfer. |  |
| `inverse distance` | A distance-weighted average over the containing donor cell and its neighbours. |  |
| `green-gauss` | A Green-Gauss linear reconstruction about the donor cell centre, evaluated at the receptor point. |  |
| `least-squares` (default) | A least-squares linear reconstruction about the donor cell centre, evaluated at the receptor point. | On a moving interface, where only it and `green-gauss` reproduce a field with a gradient at the receptor point. |

Guidance: [Overset meshes › interpolation_method](/guide/working-with/overset-meshes#interpolation_method)

## additional active layers

Number of additional active cell layers near the blanking boundary

::: facts
**Type** int, >= 0 · **Default** `0`
:::

Guidance: [Overset meshes › additional_active_layers](/guide/working-with/overset-meshes#additional_active_layers)

## blank enclosed cells

Also blank the background cells the hole encloses but no overset cell covers: the ones inside this mesh's own solid bodies

::: facts
**Type** bool · **Default** `True`
:::

Guidance: [Overset meshes › blank_enclosed_cells](/guide/working-with/overset-meshes#blank_enclosed_cells)

## create overset halos

Search for overset donors at the halo cell centre rather than at the boundary face centre, on the background-to-overset direction. The halo centre is the interior cell centre mirrored across the face, and that is where the solver uses the value: the interface flux extrapolates the halo from it and the boundary gradient averages it with the interior cell. Sampling at the face centre instead puts the value half a cell from where it is used; on the eulervortex static overset case that leaves a 416 Pa pressure overshoot at the interface, against 4 Pa with halo centres -- what the conformal mesh gives. A uniform free stream cannot show the difference. The solver applies one value to the whole model, so every overset interface on a model gives the same one.

::: facts
**Type** bool · **Default** `True`
:::

## moving mesh halo layers

Halo fringe layers around the hole when the overset mesh moves (0 = treat every blanked cell as a halo; N > 0 is sufficient when the hole is re-cut every real time step)

::: facts
**Type** int, >= 0 · **Default** `0`
:::

Guidance: [Overset meshes › moving_mesh_halo_layers](/guide/working-with/overset-meshes#moving_mesh_halo_layers)

## area

Which area vector each side's segments use. The two options are identical on a planar interface and for matching meshes.

::: facts
**Type** choice · **Default** `conservative`
:::

| Value | What it does |
| --- | --- |
| `conservative` (default) | Both sides use the mean of the two parent area maps, so the interface conserves to round-off; the per-face closure error is first order in cell width. |
| `free stream` | Each side uses its own parent area map, so closure and free-stream preservation are exact; the conservation deficit is second order. |

Guidance: [Choosing boundary conditions › Sliding](/guide/choosing/choosing-boundary-conditions#sliding)

## flux

Where the interface's numerical flux is evaluated.

::: facts
**Type** choice · **Default** `segment`
:::

| Value | What it does |
| --- | --- |
| `segment` (default) | One flux per intersection polygon, applied with a shared area vector to the cell on each side, so the two sides cancel exactly and the interface conserves. |
| `parent` | One flux per parent face, against the area-weighted average of that face's donors; quieter as cells pass one another, but not conservative. |

Guidance: [Choosing boundary conditions › Sliding](/guide/choosing/choosing-boundary-conditions#sliding)

## segment capacity factor

Segment storage reserved per interface face. The supermesh is rebuilt every real time step and its segment count varies with the rotation angle, so storage is reserved once at this multiple of the local interface face count. Setup sweeps a full revolution and aborts with the factor actually needed if this is too small.

::: facts
**Type** int, >= 1 · **Default** `8`
:::

## sliver tolerance

Overlaps smaller than this fraction of the smaller parent face are discarded. Slivers carry no flux worth having but do cost a segment slot each.

::: facts
**Type** float, >= 0.0 · **Default** `1e-10`
:::

## closure tolerance

Largest fraction of a face's area that may be left uncovered by its segments before setup aborts. A real gap between the two sides -- mismatched radii, a partial annulus, a wrong axis -- shows up here, and would otherwise be a silent leak.

::: facts
**Type** float, >= 0.0 · **Default** `0.01`
:::

