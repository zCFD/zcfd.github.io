---
title: output settings
section: reference
---

# output settings

Default compressible output variables


## solution

Solution file output settings

settings block · required


### frequency

Output frequency (every N cycles)

settings block · default {surface_data: 100000000, volume_data: 100000000, volume_interpolate: 100000000, fwh_interpolate: 100000000, fwh_wall_data: 100000000, checkpoint: 100000000, volume_data_start: 1, surface_data_start: 1, volume_interpolate_start: 1, checkpoint_start: 1, fwh_interpolate_start: 1, fwh_wall_data_start: 1}


#### surface data

Frequency for surface variable output

whole number · default 100000000 · >= 1


#### volume data

Frequency for volume variable output

whole number · default 100000000 · >= 1


#### volume interpolate

Frequency for volume data interpolation

whole number · default 100000000 · >= 1


#### fwh interpolate

Frequency for FWH surface interpolation

whole number · default 100000000 · >= 1


#### fwh wall data

Frequency for FWH wall data output

whole number · default 100000000 · >= 1


#### checkpoint

Frequency for writing checkpoint/restart files

whole number · default 100000000 · >= 1


#### volume data start

Cycle to start volume data output

whole number · default 1 · >= 0


#### surface data start

Cycle to start surface data output

whole number · default 1 · >= 0


#### volume interpolate start

Cycle to start volume data interpolation

whole number · default 1 · >= 0


#### checkpoint start

Cycle to start writing checkpoint/restart files

whole number · default 1 · >= 0


#### fwh interpolate start

Cycle to start FWH surface interpolation

whole number · default 1 · >= 0


#### fwh wall data start

Cycle to start FWH wall data output

whole number · default 1 · >= 0


### format

Output file format

default vtk

| Value | What it does | When to use it |
| --- | --- | --- |
| `none` | Outputs no files. |  |
| `vtk` (default) | Outputs in VTK HDF format (.vtkhdf) for reading into [ParaView](https://www.paraview.org). The .vtkhdf output format requires [ParaView 6.1.1](https://www.paraview.org/download/) or later. |  |
| `ensight` |  |  |
| `fwensight` |  |  |
| `native` |  |  |

Guidance: [/guide/working-with/post-processing-and-visualisation](/guide/working-with/post-processing-and-visualisation)


### surface variables

Variables to output on surfaces

list of text · not set by default


### volume variables

Variables to output in volume

list of text · not set by default


### scripts

ParaView Catalyst Python scripts, run on the volume solution each time it is written. Paths are passed to Catalyst as written, so a relative path is taken from the directory the run is started in.

list of text · not set by default


### fwh interpolate

List of stl files for FWH surface interpolation

list of text · not set by default

Guidance: [/guide/working-with/aeroacoustics-fwh](/guide/working-with/aeroacoustics-fwh)


### fwh wall data

Output FWH wall data

true or false · default False

Guidance: [/guide/working-with/aeroacoustics-fwh](/guide/working-with/aeroacoustics-fwh)


### write restart

Write restart files

true or false · default True

Guidance: [/guide/choosing/choosing-initialisation-and-reference-state#restart](/guide/choosing/choosing-initialisation-and-reference-state#restart)


### binary

Use binary format

true or false · default True


### precision

Output precision

default single

| Value | What it does | When to use it |
| --- | --- | --- |
| `single` (default) |  |  |
| `double` |  |  |


### global node ids

Retain the local->global node map so VTKHDF output can stitch partitions together without a clean-to-grid filter

true or false · default True


### output solver cycle

Stamp VTKHDF output steps with the solver cycle number instead of physical time. Every step of a steady run carries the same physical time, so the default leaves the appended steps indistinguishable to a viewer; the cycle number makes them steppable

true or false · default False


### ghost cells

Emit a one-cell-deep ghost layer in the VTKHDF volume output: the partition halo cells the solver already exchanges, marked DUPLICATECELL, so filters that interpolate cell data to points (isosurfaces, for instance) are correct across partition interfaces instead of showing a seam

true or false · default True


### immersed boundary surface

— no description —

list of settings blocks · a list of these blocks · not set by default


#### zone

— no description —

whole number · required


#### stl

— no description —

text · required


## report

Report and monitoring settings

settings block · required


### frequency

Report frequency (every N cycles)

whole number · required · >= 1


### variables

Variables to include in reports

list of text · not set by default


### monitor

Monitor point configuration

named settings blocks · named blocks of this shape · not set by default


#### point

Monitor point coordinates [x, y, z]

point or vector (3 numbers) · required


#### variables

Variables to monitor at this point

list of text · required


#### name

Monitor point name

text · not set by default


### forces

Force calculation zones

named settings blocks · named blocks of this shape · not set by default


#### zones

Zone IDs for force calculation

list of zone ids · required


#### name

Name of the force component

text · not set by default


#### reference area

Reference area for force coefficients

number · default 1 · > 0


#### reference length

Reference length for moment coefficients

number · default 1 · > 0


#### reference pressure

Reference pressure for coefficients

number · default 0 · >= 0


#### transform

Transformation function

Python function · not set by default · accepts a Python function

Guidance: [/guide/setting-up/python-functions-in-the-deck#transform-function](/guide/setting-up/python-functions-in-the-deck#transform-function)


#### reference point

Reference point for moment calculations

point or vector (3 numbers) · default [0, 0, 0]


#### dimensional

Report dimensional forces (not coefficients)

true or false · default False


#### inertial frame

Report forces in inertial frame

true or false · default True


### mass flow

Mass flow calculation zones

named settings blocks · named blocks of this shape · not set by default


#### zones

Zone IDs for mass flow calculation

list of zone ids · required


### scale residuals by volume

Scale residuals by cell volume in reports

true or false · default False


### residual statistics

Add the infinity norm of the true residual, its RMS, the participation ratio Neff and the worst cell's share of the total to the report, four columns per equation. Neff is the number of cells the residual is effectively spread over, so a small value against a large mesh means the field is converged everywhere except a handful of cells; the resshare_* output variables show which. On by default; set it False to save an extra pass over the residual field and two MPI reductions per report.

true or false · default True


## forces

Force calculation definitions

named settings blocks · named blocks of this shape · not set by default


### zones

Zone IDs for force calculation

list of zone ids · required


### name

Name of the force component

text · not set by default


### reference area

Reference area for force coefficients

number · default 1 · > 0


### reference length

Reference length for moment coefficients

number · default 1 · > 0


### reference pressure

Reference pressure for coefficients

number · default 0 · >= 0


### transform

Transformation function

Python function · not set by default · accepts a Python function

Guidance: [/guide/setting-up/python-functions-in-the-deck#transform-function](/guide/setting-up/python-functions-in-the-deck#transform-function)


### reference point

Reference point for moment calculations

point or vector (3 numbers) · default [0, 0, 0]


### dimensional

Report dimensional forces (not coefficients)

true or false · default False


### inertial frame

Report forces in inertial frame

true or false · default True


## compute average and rms

Compute time-averaged and RMS statistics

true or false · default False


## average start time cycle

Cycle to start averaging

whole number · default 0 · >= 0


## output directory

Output directory path

text · not set by default


::: {.deck title="output settings"}
```python
"output settings": {
    "solution": {
        ...
    },
    "report": {
        "frequency": 1,
        ...
    },
    ...
},
```
:::

