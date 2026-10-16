---
title: solution
section: reference
---

# solution

Solution file output settings

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| [`frequency`](/reference/solver/output-settings/solution/frequency) | settings block |  | Output frequency (every N cycles) |
| `format` | choice | `vtk` | Output file format |
| `surface variables` | list of str | not set | Variables to output on surfaces |
| `volume variables` | list of str | not set | Variables to output in volume |
| `scripts` | list of str | not set | ParaView Catalyst Python scripts, run on the volume solution each time it is written. |
| `fwh interpolate` | list of str | not set | List of stl files for FWH surface interpolation |
| `fwh wall data` | bool | `False` | Output FWH wall data |
| `write restart` | bool | `True` | Write restart files |
| `binary` | bool | `True` | Use binary format |
| `precision` | choice | `single` | Output precision |
| `global node ids` | bool | `True` | Retain the local->global node map so VTKHDF output can stitch partitions together without a clean-to-grid filter |
| `output solver cycle` | bool | `False` | Stamp VTKHDF output steps with the solver cycle number instead of physical time. |
| `ghost cells` | bool | `True` | Emit a one-cell-deep ghost layer in the VTKHDF volume output: the partition halo cells the solver already exchanges, marked DUPLICATECELL, so filters that interpolate cell data to points (isosurfaces, for instance) are correct across partition interfaces instead of showing a seam |

::: {.deck title="solution"}
```python
parameters = {
    "solver": {
        "output settings": {
            "solution": {
                "frequency": {...},
                "format": "vtk",
                "surface variables": [...],
                "volume variables": [...],
                "scripts": [...],
                "fwh interpolate": [...],
                "fwh wall data": False,
                "write restart": True,
                "binary": True,
                "precision": "single",
                "global node ids": True,
                "output solver cycle": False,
                "ghost cells": True,
            },
            ...
        },
        ...
    },
    ...
}
```
:::

## format

Output file format

::: facts
**Type** choice · **Default** `vtk`
:::

| Value | What it does | When to use it |
| --- | --- | --- |
| `none` | Outputs no files. |  |
| `vtk` (default) | Outputs in VTK HDF format (.vtkhdf) for reading into [ParaView](https://www.paraview.org). The .vtkhdf output format requires [ParaView 6.1.1](https://www.paraview.org/download/) or later. |  |
| `ensight` | Writes the volume solution as EnSight files with VTK's EnSight writer, one set per output cycle. Surface output is still written as VTK HDF. | For post-processing in EnSight. |
| `fwensight` | Writes the same VTK HDF output as `vtk`, and in addition an EnSight Gold copy (`.encas` and `.geo` files) of the volume and of the boundaries. |  |
| `native` | Writes each volume variable to its own HDF5 file per output cycle, with an index file of external links to them. Surface output is still written as VTK HDF. |  |

Guidance: [Post-processing and visualisation](/guide/working-with/post-processing-and-visualisation)

## scripts

ParaView Catalyst Python scripts, run on the volume solution each time it is written. Paths are passed to Catalyst as written, so a relative path is taken from the directory the run is started in.

::: facts
**Type** list of str · **Default** not set
:::

## fwh interpolate

List of stl files for FWH surface interpolation

::: facts
**Type** list of str · **Default** not set
:::

Guidance: [Aeroacoustics (FWH)](/guide/working-with/aeroacoustics-fwh)

## fwh wall data

Output FWH wall data

::: facts
**Type** bool · **Default** `False`
:::

Guidance: [Aeroacoustics (FWH)](/guide/working-with/aeroacoustics-fwh)

## write restart

Write restart files

::: facts
**Type** bool · **Default** `True`
:::

Guidance: [Choosing initialisation and reference state › Restart](/guide/choosing/choosing-initialisation-and-reference-state#restart)

## precision

Output precision

::: facts
**Type** choice · **Default** `single`
:::

| Value | What it does | When to use it |
| --- | --- | --- |
| `single` (default) | 32-bit floating-point field values. The solver writes field data at this precision. | The default. |
| `double` | Accepted, but not read by the solver: field data is written in single precision whatever is set. |  |

## output solver cycle

Stamp VTKHDF output steps with the solver cycle number instead of physical time. Every step of a steady run carries the same physical time, so the default leaves the appended steps indistinguishable to a viewer; the cycle number makes them steppable

::: facts
**Type** bool · **Default** `False`
:::

