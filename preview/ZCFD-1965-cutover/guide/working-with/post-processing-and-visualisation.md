---
title: Post-processing and visualisation
section: guide
group: Working with
order: 40
---

# Post-processing and visualisation

zCFD by default will output data in [VTK HDF](https://www.vtk.org/) format (.vtkhdf). This format can be read directly by many post-processing tools including [ParaView](https://www.paraview.org/) by Kitware.

::: {.note}
The .vtkhdf output format requires [ParaView 6.1.1](https://www.paraview.org/download/) or later.
:::

zCFD can also write [EnSight](https://www.ansys.com/en-gb/products/fluids/ansys-ensight) output; see [EnSight Output](#ensight-output).

## VTK HDF Output

By default, zCFD will output data in VTK HDF format (.vtkhdf). To force VTK HDF output explicitly, set
[`format`](/reference/solver/output-settings#solution-format) in the `solution` block of `output_settings`:

```json
{ "output_settings": { "solution": { "format": "vtk" } } }
```

## EnSight Output

To output in EnSight format, set [`format`](/reference/solver/output-settings#solution-format) to `ensight`:

```json
{ "output_settings": { "solution": { "format": "ensight" } } }
```

## ParaView Catalyst Scripts

ParaView provides a lightweight interface that allows parallel processing of simulation data during program execution called [ParaView Catalyst](https://www.paraview.org/insitu/). This is driven by scripts (Python files) that can be called when data is output. The solver reads the list of scripts from [`scripts`](/reference/solver/output-settings#solution-scripts) in the `solution` block. The output [`format`](/reference/solver/output-settings#solution-format) must be `vtk`, and the scripts should be in the same directory as the input files:

```json
{
  "output_settings": {
    "solution": {
      "format": "vtk",
      "scripts": ["paraview_catalyst1.py", "paraview_catalyst2.py"]
    }
  }
}
```

## Output variables

The variables written to the solution files are named in
[`surface_variables`](/reference/solver/output-settings#solution-surface-variables) and
[`volume_variables`](/reference/solver/output-settings#solution-volume-variables) in the `solution` block. A
[monitor point](#monitor-points) samples the names in its own `variables` list from the volume set. The
[output variables](/reference/output-variables) page lists every name, with its meaning and units.

```json
{
  "output_settings": {
    "solution": {
      "surface_variables": ["p", "cp", "yplus"],
      "volume_variables": ["V", "p", "T", "mach"]
    }
  }
}
```

Which names are valid depends on the equation type, set by [`type`](/reference/solver/equations#type) in
`equations`. The tiers are cumulative: each equation type offers every name of the types above it in the table, and
adds its own. The incompressible solver offers the same names as the compressible solver for the same equation type.

| Equation type   | Names offered                                                                                                                         |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `euler`         | The base names, such as `pressure`, `velocity` and `cp`, and the Euler tier, such as `vorticity` and the pressure forces on a surface |
| `viscous`       | Adds the viscous tier, such as `viscosity`, `nu`, `yplus`, `cf` and the friction forces                                               |
| `rans` or `les` | Adds the LES and RANS tiers, such as `reynoldstress`, `ti` and the turbulence model variables                                         |

Two further sets are offered on top of the equation type. The transition variables, `turbulenceintermittency` and
`transitionreynoldsnumber`, are offered when the turbulence [`model`](/reference/solver/equations#turbulence-model)
is `sst-transition`, the model that solves for them. The modal variables, such as `modaldeformation` and
`meshvelocity`, are offered when a wall boundary condition sets [`fsi`](/reference/model/boundary-conditions/wall#fsi).

Surface and volume sets differ. Some names, such as `yplus`, `ut` and `cf`, exist only on a surface; others, such as
`vorticity` and `ti`, only in the volume.

In an unsteady run, [`compute_average_and_rms`](/reference/solver/output-settings#compute-average-and-rms) keeps a
running average and RMS of velocity, pressure and temperature in each cell, updated once per real time step. Request
them as `V_avg`, `V_rms`, `p_avg`, `p_rms`, `T_avg` and `T_rms`. Averaging starts at the real time step set by
[`average_start_time_cycle`](/reference/solver/output-settings#average-start-time-cycle); before that the statistics
are reset every step. The RMS is of the value itself, not of its fluctuation, so the standard deviation is
√(rms² − `avg`²). A restart reads the statistics back from the checkpoint and continues them. In a compressible run,
requesting one of them without `compute_average_and_rms` stops the run.

`var_i`, `resvar_i`, `resshare_i` and `vargrad_i` are the solution value, residual, share of the total squared
residual and gradient of solved equation `i`. They are offered for `i` from 1 up to the number of equations solved:

| Equation type             | Turbulence model | Equations solved |
| ------------------------- | ---------------- | ---------------- |
| `euler`, `viscous`, `les` | not used         | 5                |
| `rans`                    | `sa-neg`         | 6                |
| `rans`                    | `sst-transition` | 9                |
| `rans`                    | any other model  | 7                |

A name outside the valid set fails validation, and the deck is rejected before the solver starts. The message names
the variable, the equation type and the context; see
[Output variable rejected](../troubleshooting/troubleshooting.md#output-variable-rejected) for the names most often
mistaken.

## ParaView Client

To download the free ParaView software for visualising VTK HDF format data on the local device, visit the [ParaView download page](https://www.paraview.org/download/). ParaView 6.1.1 or later is required for .vtkhdf file support.

## ParaView Client-Server

In addition to running entirely locally on a device, ParaView can interface to a remote server. This allows users to run ParaView to access data that is held (and processed) on a different computer, potentially running larger simulation tasks that would not be possible on the local machine. This also means that there is no need to transfer the large output files back to a local machine for post-processing. The remote machine can be set up to run a ParaView Server in parallel - meaning that very large post-processing jobs can be run quickly.

### ParaView Server

To download and install ParaView Server, you can either use the version on the main ParaView website and follow the [official documentation](https://docs.paraview.org/en/latest/ReferenceManual/parallelDataVisualization.html).

Alternatively, use the version bundled with zCFD. The 'pvserver' included in the zCFD distribution includes plugins for reading the zCFD HDF5 mesh format directly.

To start a ParaView Server on your computer within the zCFD environment run:

```bash
> pvserver
```

### ParaViewConnect

[ParaViewConnect](https://github.com/zenotech/ParaViewConnect) is a helper utility for connecting to remote ParaView servers. It reduces the complexity of setting up the required ssh connections and works well with zCFD. More information and installation instructions can be found on the [GitHub page](https://github.com/zenotech/ParaViewConnect).

## ParaView Post-Processing Best Practices for Parallel zCFD Data

When post-processing solution data generated in parallel by zCFD using ParaView, it is important to understand the differences between various ParaView filters and their impact on data interpolation. This section provides guidance on recommended pipelines for accurate results.

### CleantoGrid vs MergeBlocks

Two commonly used ParaView filters for processing parallel datasets are **CleantoGrid** and **MergeBlocks**. Each has distinct characteristics:

**CleantoGrid Filter:**

- **Purpose**: Merges points that are exactly coincident and removes degenerate cells
- **Interpolation**: Performs minimal interpolation, preserving original data values at cell centres and vertices
- **Use case**: Recommended when data accuracy is critical and you want to preserve the original computed values
- **Characteristics**: May result in slightly fragmented visualisations at block boundaries but maintains data fidelity

**MergeBlocks Filter:**

- **Purpose**: Combines multiple blocks into a single unstructured grid
- **Interpolation**: May perform interpolation across block boundaries to create smooth transitions
- **Use case**: Better for smooth visualisations and streamline generation across block boundaries
- **Characteristics**: Creates visually smoother results but may alter original computed values through interpolation

### Recommended Pipelines

For **quantitative analysis** and **data extraction** (probes, line plots, force calculations):

```python
# Recommended pipeline for quantitative analysis
import paraview.simple as pvs

# Load data
reader = pvs.OpenDataFile('solution.vtkhdf')

# Use CleantoGrid to preserve data accuracy
clean_data = pvs.CleantoGrid(Input=reader)

# Convert to point data if needed
point_data = pvs.CellDatatoPointData(Input=clean_data)

# Proceed with analysis (probes, calculators, etc.)
```

For **visualisation purposes** (streamlines, contours, volume rendering):

```python
# Pipeline for smooth visualisations
import paraview.simple as pvs

# Load data
reader = pvs.OpenDataFile('solution.vtkhdf')

# Use MergeBlocks for smoother visualisations
merged_data = pvs.MergeBlocks(Input=reader)

# Convert to point data for smooth contouring
point_data = pvs.CellDatatoPointData(Input=merged_data)

# Apply visualisation filters (streamlines, contours, etc.)
```

### Important Considerations

1. **Data Accuracy**: Always use CleantoGrid when extracting quantitative data for analysis or validation
2. **Visualisation Quality**: MergeBlocks may provide better visual results for presentations and general visualisation
3. **Performance**: CleantoGrid is typically faster as it performs less processing
4. **Block Boundaries**: Be aware that different filters may show artefacts differently at parallel decomposition boundaries
5. **Regression Testing**: When comparing results across different runs, ensure consistent filter usage

### Loading data in a script

When processing zCFD parallel data, load the output one way for analysis and another for visualisation:

```python
import paraview.simple as pvs


def load_for_analysis(filename):
    reader = pvs.OpenDataFile(filename)
    reader.UpdatePipeline()
    return pvs.CleantoGrid(Input=reader)


def load_for_visualisation(filename):
    reader = pvs.OpenDataFile(filename)
    reader.UpdatePipeline()
    merged = pvs.MergeBlocks(Input=reader)
    return pvs.CellDatatoPointData(Input=merged)
```

This keeps quantitative analysis faithful to the computed values and gives smooth visualisations.

## Batch post-processing with Python scripts

Post-process a run with a Python script stored beside its control file. A script gives the same result on every run,
sits under version control with the case, and runs unattended on a cluster login node or as a batch job. Every zCFD validation case is post-processed this way.

Run the script with the Python in the zCFD environment, which provides `zutil`, ParaView's `paraview.simple` and
matplotlib:

```bash
(zCFD)> python naca0012_post.py
```

`get_zcfd_result` reads the control file and finds everything the run wrote, so a script need not build output
paths by hand:

| Attribute                      | What it holds                                                                                              |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| `report.data`                  | The [report file](#the-report-file) as a pandas `DataFrame`, one column per heading                        |
| `force_prefix()`               | The prefix of the force columns, for building names such as `wall_Ftx`                                     |
| `volume_file_path`             | The volume solution, `<case>.vtkhdf`                                                                       |
| `wall_boundary_path`           | The wall surface solution; other boundary types have matching attributes, such as `farfield_boundary_path` |
| `model_names`, `model_reports` | For an overset case, the model names and each model's report                                               |

The following script plots the density residual and a chordwise pressure coefficient for an aerofoil:

```python
import matplotlib.pyplot as plt
import paraview.simple as pvs

from zutil.fileutils import get_zcfd_result
from zutil.post import clean_vtk, cp_profile

result = get_zcfd_result("naca0012.py")

report = result.report.data
fig, ax = plt.subplots()
ax.semilogy(report["Cycle"], report["rho"])
ax.set_xlabel("Cycle")
ax.set_ylabel("Density residual")
fig.savefig("naca0012_residuals.png", dpi=200)

wall = clean_vtk(pvs.VTKHDFReader(FileName=result.wall_boundary_path))
profile = cp_profile(wall, [0.0, 1.0, 0.0], [0.0, 0.5, 0.0])
fig, ax = plt.subplots()
ax.plot(profile[0]["chord"], profile[0]["cp"])
ax.invert_yaxis()
ax.set_xlabel("x/c")
ax.set_ylabel("Cp")
fig.savefig("naca0012_cp.png", dpi=200)
```

`zutil.post` also provides `cf_profile` for skin friction, `calc_force_wall` and `calc_moment_wall` for loads
integrated from the surface, and `get_monitor_data` for [monitor points](#monitor-points). `zutil.plot` provides the
axis, legend and logo helpers used for zCFD's own figures.

## The output directory

The **output** directory is created in the working directory from which the solver is run, and is named after the
control file:

```text
<case_name>_OUTPUT
```

It holds one sub-directory for each entry under [`model`](/reference/model), named by that entry's key, and a
`LOGGING` sub-directory with one log for each MPI rank.

For the 'vtk' format the volume data of a model is written to its sub-directory with the file name:

```text
<case_name>_OUTPUT/<model>/<model>.vtkhdf
```

For the 'vtk' format the surface data is written to the same sub-directory, one file for each boundary condition
type:

```text
<case_name>_OUTPUT/<model>/<model>_<boundary>.vtkhdf
```

The FWH interpolated surface data ([`fwh_interpolate`](/reference/solver/output-settings#solution-fwh-interpolate))
and FWH wall data ([`fwh_wall_data`](/reference/solver/output-settings#solution-fwh-wall-data)) are written to the
_ACOUSTIC_DATA_ sub-directory of the model's sub-directory, `<case_name>_OUTPUT/<model>/ACOUSTIC_DATA`.

## What a checkpoint records about the run

A `<model>_results.h5` checkpoint carries the run's own configuration alongside the flow solution, so the file
explains where it came from without depending on the run directory still being intact:

| Location in the file             | Contents                                                                                                                                                                                                                                                                       |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `version` (root attribute)       | Layout version of the checkpoint, currently `2`. This is the file layout, not the deck's `'config version'`.                                                                                                                                                                   |
| `/provenance/status`             | The `<case>_status.yaml` file verbatim — zCFD version, date, host names, devices, partition count and the mesh MD5 checksums. Written once, since it cannot change during a run.                                                                                               |
| `/provenance/control/<filename>` | The source of every Python file the control-file read executed, one dataset each, with the full path and mtime as attributes. The set is the whole include chain, not only the file named on the command line, so a deck built from a base plus overrides is recorded in full. |

The control deck can be edited while a run is in progress — the solver polls it and applies any change the schema
marks updatable — so it is re-read on each checkpoint and rewritten whenever it has actually changed. Reading it back
is a plain HDF5 string read:

```python
import h5py

with h5py.File("case_OUTPUT/background/background_results.h5") as f:
    print(f.attrs["version"])
    print(f["provenance/status"][()].decode())
    for name in f["provenance/control"]:
        print("---", f[f"provenance/control/{name}"].attrs["path"])
        print(f[f"provenance/control/{name}"][()].decode())
```

Recording these is best effort: a checkpoint that could not be annotated is still a valid, restartable checkpoint, and
the run reports a warning rather than stopping.

## The report file

zCFD has the capability to output certain parameters to a <casename>\_report.csv file as the solver progresses. These
can be used to monitor the solver's convergence. By default, the solver outputs volume integrated residuals for each
solution variable to the <casename>\_report.csv file, but adding to the
[`report`](/reference/solver/output-settings#report) block means other quantities of interest can also be monitored
as the simulation progresses. zMon plots these columns while the solver runs; see [Monitoring a run](../working-with/monitoring-a-run.md).

**'frequency'** sets how frequently a new line is appended to the <casename>\_report.csv file. If frequency = x, the
solver will output to the <casename>\_report.csv every x solver cycles. For a dual time-stepping simulation, this is the
inner (pseudo-time), not outer, cycles.

::: {.note}
When [`inner_convergence`](/reference/solver/convergence-control#inner-convergence) is set, its **'check_frequency'**
cycles are also reporting cycles, so rows may appear more often than **'frequency'** alone would suggest.
:::

**'scale_residuals_by_volume'** scales the reported volume-integrated residuals by cell volume. It applies to the
`resvar_i` and `resshare_i` output variables as well as to the report, so the field and the norm of that field always
describe the same quantity.

**'monitor'**, **'forces'** and **'mass_flow'** are dictionaries keyed by whatever name is chosen for each block; the
keys are not otherwise validated, but naming them consecutively with a prefix (e.g. `MR_1`, `FR_1`, `MF_1`) keeps a
large control file readable:

| Reporting on    | Suggested key prefix |
| --------------- | -------------------- |
| **'monitor'**   | MR\_?                |
| **'forces'**    | FR\_?                |
| **'mass_flow'** | MF\_?                |

Example usage:

For a simulation with 1000's of cycles, it can be unnecessary to report every time cycle, which slows the solver down.
For a dual timestepping simulation with 20 inner time cycles, outputting every 10 cycles generally gives enough
information without substantially slowing the solver down

```python
# Report every 10 cycles
"report": {
    "frequency": 10,
},
```

### A simulation with two monitor points and one forces block

In addition to standard flow field outputs (see below), zCFD can provide information at monitor points in the flow
domain, and integrated forces across all parallel partitions. Any number of monitor, forces or mass flow blocks may be
specified.

```python
"report": {
    "frequency": 10,
    "monitor": {
        "MR_1": {
            "point": [0.0, 0.0, 0.0],
            "variables": ["p", "V"],
        },
        "MR_2": {
            "point": [1.0, 0.0, 0.0],
            "variables": ["p", "V"],
        },
    },
    "forces": {
        "FR_1": {
            "zones": [4],
        },
    },
},
```

## Cycle time column

Every row carries an **'AvgCycleTime'** column: the mean wall-clock time, in seconds, of a solver cycle over the cycles
since the previous report row. It is the same measurement the console report block summarises, recorded per row so the
cost of a run can be read from its history - which cycles slowed down, and what the solver was doing at the time.

The interval is the reporting interval, so with **'frequency'** set to 1 the column is that cycle's wall time,
and with a larger frequency it is the average over those cycles. The cycle timed is the solve - mesh mapping, the
solver advance and source term updates - and excludes writing the report and the solution files, which happen after
the cycle is timed.

::: {.note}
Wall-clock time is not a like-for-like column between runs: it depends on the machine, the partition count and
anything else running on the node. It is a within-run diagnostic. In an overset case every mesh's report file carries
the same value, because one cycle advances all of them.
:::

## Residual statistics columns

Setting [**'residual_statistics'**](/reference/solver/output-settings#report-residual-statistics) adds four columns per
equation, describing the _true_ residual $R(Q)$ rather than the solution update. They answer a question the RMS cannot:
an RMS says "not converged" without saying that the field is converged everywhere except a handful of cells, which is
the case that takes longest to diagnose.

The columns are named prefix-first (`Rinf_rho`, not `rho_Rinf`) and are written to <casename>\_report.csv only - they
are deliberately kept off the console residual line, which four extra columns per equation would otherwise swamp.

| Column      | Meaning                                                                                                                                                                                                                                                                                                   |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Rinf_<eq>` | $\lVert R \rVert_\infty$, the largest residual anywhere in the mesh for that equation.                                                                                                                                                                                                                    |
| `Rrms_<eq>` | RMS of the true residual. Note this is _not_ the equation's own residual column, which is the RMS of the solution update $\Delta Q/\Delta\tau$; the two coincide only when the linear solve is exact.                                                                                                     |
| `Neff_<eq>` | Participation ratio $(\sum R^2)^2 / \sum R^4$: the number of cells the residual is effectively spread over. Equal to the cell count when every cell contributes equally, and to 1 when a single cell carries everything. A small value against a large mesh means a localised stall, not a stalled field. |
| `Rtop_<eq>` | Fraction of $\sum R^2$ held by the single worst cell.                                                                                                                                                                                                                                                     |

To find _where_ those cells are, add the [`resshare_i`](/reference/output-variables) volume output variables.
`resshare_i` is each cell's share of the same $\sum R^2$, summing to one over the mesh, so thresholding it at
`1/Neff_<eq>` isolates the cells carrying more than an equal share - the cells `Neff` is counting.

::: {.note}
This is a different measure from
['InnerCells'](../choosing/choosing-a-time-marching-scheme.md#inner-cycle-convergence-columns), and neither supersedes
the other. `InnerCells` is a single scalar over the solution _update_, used to steer dual-time inner cycles. These are
per-equation figures over the true residual, for diagnosing where a steady-state stall is sitting.
:::

On by default. Set **'residual_statistics'** to `False` to save the extra pass over the residual field and the two MPI
reductions per report.

## Monitor points

Monitor points report the specified variable at fixed mesh locations.

**'point'** should be the x,y,z location of the point of interest in the mesh as it appears in the solver (i.e. after
any mesh scaling due to parameters [scaling](/reference/model/transforms#scale) parameters).

**'variables'** controls which variables are reported at this point. In the <casename>\_report.csv the column name will
be a combination of the **'name'** (or, if omitted, the block's own dictionary key) and the variable name.

**'name'** overrides the column heading used for variables from this monitor point. If omitted, the dictionary key given to the block (e.g. `MR_1`) is used instead.

Example usage:

Tracking pressure and velocity is useful for determining shedding cycle behaviour, or in the case of a scale resolving
simulation, to determine the turbulence spectrum which is being resolved. It may be important to track other variables
(e.g. turbulence intensity, `ti`) depending on the simulation setup.

```python
"report": {
    "frequency": 10,
    "monitor": {
        "MR_1": {
            "name": "monitor_1",
            "point": [180.0, 100.0, 50.0],
            "variables": ["V", "p", "T", "ti"],
        },
    },
},
```

## Forces

Force reporting outputs the x,y,z total forces and moments on a surface or set of surfaces. These are presented as
force coefficients (using the non-dimensionalisation convention used for aerofoil lift, drag and moment coefficients),
as opposed to dimensional values. The force and moment coefficients resulting exclusively from viscous forces and
exclusively from pressure forces are also given.

Example usage:

```python
"report": {
    "frequency": 10,
    # Report force coefficients in the grid axes, using a user defined transform
    "forces": {
        "FR_1": {
            "name": "force_1",
            # Required: Zones to be included
            "zones": [1, 2, 3],
            # Transformation function
            "transform": my_transform,
            "reference_area": 0.112032,
            "reference_length": 1.0,
            "reference_point": [0.0, 0.0, 0.0],
            # Calculate forces using a specified reference pressure rather than absolute
            "reference_pressure": 0.0,
        },
    },
},
```

### Output names

The forces will be written into the <casename>\_report.csv prefixed with the supplied **'name'** (or, if not given, the
block's own dictionary key). The forces will be written with the following names:

| Item                                                                                      | Reporting output name                             |
| ----------------------------------------------------------------------------------------- | ------------------------------------------------- |
| Total forces and moments                                                                  | **'name'**\_F[x,y,z] and **'name'**\_M[x,y,z]     |
| Forces and moments due only to pressure forces                                            | **'name'**\_Fp[x,y,z] and **'name'**\_Mp[x,y,z]   |
| Forces and moments due only to viscous (friction) forces                                  | **'name'**\_Ff[x,y,z] and **'name'**\_Mf[x,y,z]   |
| Transformed total forces and moments (if transform function is set)                       | **'name'**\_Ft[x,y,z] and **'name'**\_Mt[x,y,z]   |
| Transformed forces and moments due only to pressure forces (if transform function is set) | **'name'**\_Ftp[x,y,z] and **'name'**\_Mtp[x,y,z] |
| Transformed forces and moments due only to viscous forces (if transform function is set)  | **'name'**\_Ftf[x,y,z] and **'name'**\_Mtf[x,y,z] |

::: {.note}
For a rotating zone, `'inertial_frame'` (default `True`) transforms the totals above **in place** before they are
written — there is no separate set of "static frame" columns. Set `'inertial_frame': False` to report the forces and
moments in the rotating (blade) frame instead, still under the same `_F`/`_M` column names. A rotating zone also
automatically adds `'name'`\_Thrust, `'name'`\_Tq and `'name'`\_Tqp (thrust, torque and power about the rotation
axis) — there is no keyword to configure these; they appear whenever the reported zones belong to a rotating boundary.
:::

### Total force

Total force, $\mathbf{F}$, is $\mathbf{F}_p +  \mathbf{F}_v$, and likewise for moments.

### Non-dimensionalisation

Forces are non-dimensionalised into force coefficients as $C_{x} = \frac{ \mathbf{F}_x  }{ q_{\infty} S }$, where
$q_{\infty}$ is the reference dynamic pressure and $S$ is the reference area.

Moments are non-dimensionalised into moment coefficients as $C_{Mx} = \frac{\mathbf{M}_x  }{ q_{\infty} S c}$, where $c$ is
the reference length.

### Dimensional pressure force

$\mathbf{F_p} = \oint - (p-p_{ref}) \ \hat{\mathbf{n}} \ \textrm d A$

Where $p$ is surface pressure and $\hat{\mathbf{n}}$ is the surface normal (pointing towards the wetted area).

### Dimensional viscous force

$\mathbf{F}_v = \oint \boldsymbol{\tau}_w \ \textrm d A$

Here $\boldsymbol{\tau}_w$ is the wall shear stress vector. It lies in the surface and points along the velocity of
the fluid relative to the wall.

### Dimensional pressure moment

$\mathbf{M}_p = \oint (\mathbf{x} - \mathbf{x}_{ref}) \times \left( -(p-p_{ref}) \ \hat{\mathbf{n}} \right) \ \mathrm d A$

Where $\mathbf{x}$ is the surface position and $\mathbf{x}_{ref}$ is the `reference_point`.

### Dimensional viscous moment

$\mathbf{M}_v = \oint (\mathbf{x} - \mathbf{x}_{ref}) \times \boldsymbol{\tau}_w \ \mathrm d A$

::: {.note}
The reference pressure $p_{ref}$ is a static pressure, set in pascals by `reference_pressure` on the force block. Its
default of 0 gives forces computed from the absolute pressure.
:::

## Mass flow

**'zones'** The mass flows through all the zones are summed to give a single output value for the mass flow monitor.
Flow out of the domain is considered positive massflow, flow into the domain is considered positive massflow and the
massflows are dimensional (typically kg per second).

The <casename>\_report.csv column is always named `<block key>_massflow` — e.g. a block keyed `MF_1` reports as
`MF_1_massflow`.

::: {.note}
Unlike `'monitor'` and `'forces'`, a mass flow block has no `'name'` field to override the reported column name — only
`'zones'` is a valid key here. Where a friendlier column name than the dictionary key is needed, the key itself can be chosen accordingly (e.g. `"pipe_outflow"` instead of `"MF_1"`).
:::

Example usage:

```python
"report": {
    "frequency": 10,
    # Report massflow
    "mass_flow": {
        "MF_1": {
            # Zones to be included
            "zones": [1, 2, 3],
        },
    },
},
```
