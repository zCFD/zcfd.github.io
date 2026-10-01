---
title: interface
section: reference
---

# interface

Overset interface: this mesh overlaps another and takes its fringe values from it.


## type

— no description —

always interface

| Value | What it does | When to use it |
| --- | --- | --- |
| `interface` (default) | A boundary joined to another part of the domain: an overset boundary, a sliding interface or one side of a periodic pair. |  |

Guidance: [/guide/choosing/choosing-boundary-conditions](/guide/choosing/choosing-boundary-conditions)


## zones

Mesh zone ids this boundary condition applies to.

list of zone ids · required

Guidance: [/guide/choosing/choosing-boundary-conditions#zones](/guide/choosing/choosing-boundary-conditions#zones)


## kind

How this interface joins its two sides.

not set by default

| Value | What it does | When to use it |
| --- | --- | --- |
| `overset` (default) | This mesh overlaps another and takes the values in its fringe from the mesh beneath it. |  |
| `sliding` (default) | Two meshes meet on a shared surface of revolution with non-matching faces and exchange a conservative flux across it. |  |
| `periodic` (default) | Two boundaries of the same mesh are treated as one surface, related by a rotation or a translation. |  |


## connection

Model(s) whose mesh provides donor data at this interface. Without it, the solver maps against every preceding model.

settings block · not set by default

Guidance: [/guide/working-with/overset-meshes#connection](/guide/working-with/overset-meshes#connection)


### model

Model(s) whose mesh provides donor data at this interface.

list of text · required

Guidance: [/guide/working-with/overset-meshes#connection](/guide/working-with/overset-meshes#connection)


### boundary

Boundary on that model that forms the other side of this interface.

text · required

Guidance: [/guide/choosing/choosing-boundary-conditions#sliding](/guide/choosing/choosing-boundary-conditions#sliding)


## interpolation method

How the donor value is built once the containing donor cell is known.

default least-squares

| Value | What it does | When to use it |
| --- | --- | --- |
| `nearest cell` | Takes the containing donor cell's value directly: a piecewise-constant, first-order transfer. |  |
| `inverse distance` | A distance-weighted average over the containing donor cell and its neighbours. |  |
| `green-gauss` | A Green-Gauss linear reconstruction about the donor cell centre, evaluated at the receptor point. |  |
| `least-squares` (default) | A least-squares linear reconstruction about the donor cell centre, evaluated at the receptor point. | On a moving interface, where only it and `green-gauss` reproduce a field with a gradient at the receptor point. |

Guidance: [/guide/working-with/overset-meshes#interpolation_method](/guide/working-with/overset-meshes#interpolation_method)


## additional active layers

Number of additional active cell layers near the blanking boundary

whole number · default 0 · >= 0

Guidance: [/guide/working-with/overset-meshes#additional_active_layers](/guide/working-with/overset-meshes#additional_active_layers)


## blank enclosed cells

Also blank the background cells the hole encloses but no overset cell covers: the ones inside this mesh's own solid bodies

true or false · default True

Guidance: [/guide/working-with/overset-meshes#blank_enclosed_cells](/guide/working-with/overset-meshes#blank_enclosed_cells)


## moving mesh halo layers

Halo fringe layers around the hole when the overset mesh moves (0 = treat every blanked cell as a halo; N > 0 is sufficient when the hole is re-cut every real time step)

whole number · default 0 · >= 0

Guidance: [/guide/working-with/overset-meshes#moving_mesh_halo_layers](/guide/working-with/overset-meshes#moving_mesh_halo_layers)


## area

Which area vector each side's segments use. The two options are identical on a planar interface and for matching meshes.

default conservative

| Value | What it does | When to use it |
| --- | --- | --- |
| `conservative` (default) | Both sides use the mean of the two parent area maps, so the interface conserves to round-off; the per-face closure error is first order in cell width. |  |
| `free stream` | Each side uses its own parent area map, so closure and free-stream preservation are exact; the conservation deficit is second order. |  |

Guidance: [/guide/choosing/choosing-boundary-conditions#sliding](/guide/choosing/choosing-boundary-conditions#sliding)


## flux

Where the interface's numerical flux is evaluated.

default segment

| Value | What it does | When to use it |
| --- | --- | --- |
| `segment` (default) | One flux per intersection polygon, applied with a shared area vector to the cell on each side, so the two sides cancel exactly and the interface conserves. |  |
| `parent` | One flux per parent face, against the area-weighted average of that face's donors; quieter as cells pass one another, but not conservative. |  |

Guidance: [/guide/choosing/choosing-boundary-conditions#sliding](/guide/choosing/choosing-boundary-conditions#sliding)


## segment capacity factor

Segment storage reserved per interface face. The supermesh is rebuilt every real time step and its segment count varies with the rotation angle, so storage is reserved once at this multiple of the local interface face count. Setup sweeps a full revolution and aborts with the factor actually needed if this is too small.

whole number · default 8 · >= 1


## sliver tolerance

Overlaps smaller than this fraction of the smaller parent face are discarded. Slivers carry no flux worth having but do cost a segment slot each.

number · default 1e-10 · >= 0.0


## closure tolerance

Largest fraction of a face's area that may be left uncovered by its segments before setup aborts. A real gap between the two sides -- mismatched radii, a partial annulus, a wrong axis -- shows up here, and would otherwise be a silent leak.

number · default 0.01 · >= 0.0


## transform

Transformation that maps this boundary onto the one it connects to.

choice of settings blocks · required

Guidance: [/guide/choosing/choosing-boundary-conditions#periodic](/guide/choosing/choosing-boundary-conditions#periodic)


### type

How this boundary maps onto its partner.

not set by default

| Value | What it does | When to use it |
| --- | --- | --- |
| `rotated` (default) | A rotation about an axis maps this boundary onto its partner. |  |
| `linear` (default) | A translation maps this boundary onto its partner. |  |


### theta

Angle of the rotation that maps this boundary onto its partner.

number · required · in rad


### axis

Direction of the rotation axis.

direction (3 numbers, unit length) · required


### origin

A point on the rotation axis.

point or vector (3 numbers) · required · in m


### vector

Translation that maps this boundary onto its partner.

point or vector (3 numbers) · required · in m


::: {.deck title="interface"}
```python
{
    "type": "interface",
    "zones": [14],
    "transform": {
        "theta": 2.0943951023931953,
        "axis": [1, 0, 0],
        "origin": [0, 0, 0],
        "vector": [400, 0, 0],
        ...
    },
    ...
}
```
:::

