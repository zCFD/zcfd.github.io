---
title: Troubleshooting
section: guide
group: Troubleshooting
order: 10
---

# Troubleshooting

zCFD validates every deck before the solver starts, so a key that is misspelt, out of range or inconsistent with its
neighbours is reported before the first cycle. Most of the symptoms below are ones validation cannot catch. Find the
symptom in the table, confirm it with the check its section gives, then work through the causes in the order listed.

| Symptom                                                                      | What the run shows                                                                      | Section                                                     |
| ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Residuals rise until the run stops                                           | One or more residual columns of the report file grow from cycle to cycle                | [Diverging residuals](#diverging-residuals)                 |
| The run stops on a non-finite value                                          | `Non-finite values (NaN or inf) detected in report...`                                  | [NaN or `inf` in the report](#nan-or-inf-in-the-report)     |
| A compressible run fails and the cells that cause it are unknown             | `Crash Cell Location:` lines in the log, with safe mode on                              | [Locating the failing cells](#locating-the-failing-cells)   |
| Residuals fall, then plateau                                                 | A residual history that flattens well short of the target                               | [Convergence stall](#convergence-stall)                     |
| The inner-cycle residual flattens at the same level in every real time step  | A floor in each real time step, while the integrated forces continue to settle          | [Limiter switching](#limiter-switching)                     |
| Divergence persists at a low CFL number and first order, or a stall is local | A residual carried by a handful of cells                                                | [Poor mesh quality](#poor-mesh-quality)                     |
| The solver stops on a licence message, at start-up or during the run         | `License initialisation error`, `License checkout error` or `License heart beat failed` | [Licence and launch failures](#licence-and-launch-failures) |
| Validation rejects an output variable                                        | `Output variable error: Variables [...] are not valid for equation type ...`            | [Output variable rejected](#output-variable-rejected)       |

## Diverging residuals

The residuals in the `<casename>_report.csv` file should fall gradually as the solver converges, per real time step
if the flow is unsteady. A run is diverging when one or more of them turns and rises instead. The divergence may
follow a period of otherwise stable convergence, because a particular pattern in the flow can appear during the
solution and destabilise the scheme. A diverging run that is left to continue ends on a
[non-finite value](#nan-or-inf-in-the-report).

![The typical form of a divergent set of residuals. Rather than decreasing, the values all start increasing significantly from cycle 45 onwards. In this case the NACA0012 case was deliberately set with an unstable explicit CFL number of 6.0.](/images/diverge.png "Diverging residuals")

**Confirm it.** Plot the residual columns of the report file against the cycle, or watch them in
[zMon](../working-with/monitoring-a-run.md). For an [implicit](/reference/solver/convergence-control#scheme-name) run
using the AMGX library, the log also reports each solve of the implicit linear system: the number of iterations and
the residual after each one. Typically 4 to 5 iterations are enough to achieve the desired reduction in residual,
which is 3 to 4 orders of magnitude. If the number of iterations climbs above 6, the linear system may be poorly
conditioned as a result of numerical instability in the solution.

```
Cycle 5003 (real time cycle: 0 time: 0)
CFL 20.0 (20.0) - MG 20.0 (coarse mesh: 0)
        iter      Mem Usage (GB)       residual           rate
        --------------------------------------------------------------
            Ini             36.9899   3.037596e-06
            0             36.9899   4.565379e-07         0.1503
            1             36.9899   1.138337e-07         0.2493
            2             36.9899   3.056741e-08         0.2685
            3             36.9899   1.061114e-08         0.3471
            4             36.9899   3.308933e-09         0.3118
            5             36.9899   1.293730e-09         0.3910
        --------------------------------------------------------------
        Total Iterations: 6
        Avg Convergence Rate: 	0.2743
        Final Residual: 		1.293730e-09
        Total Reduction in Residual:	4.259057e-04
        Maximum Memory Usage:	36.990 GB
        --------------------------------------------------------------
Total Time: 0.869665
    setup: 0.109454 s
    solve: 0.760211 s
    solve(per iteration): 0.126702 s
        iter      Mem Usage (GB)       residual           rate
        --------------------------------------------------------------
            Ini             36.9899   1.713350e-04
            0             36.9899   1.060694e-07	0.0006
            1             36.9899   1.898567e-10	0.0018
        --------------------------------------------------------------
        Total Iterations: 2
        Avg Convergence Rate:	0.0011
        Final Residual:		1.898567e-10
        Total Reduction in Residual:	1.108102e-06
        Maximum Memory Usage:	36.990 GB
        --------------------------------------------------------------
```

_Example output from the AMGX implicit linear solver. In this case the turbulence equations are solved after the primary flow variables. The primary flow variables are solved in 5 cycles of the AMGX solver, achieving an order of magnitude 3 reduction in the residuals._

Work through the causes in this order. If the run still diverges once the first three have been tried, the cause is
most likely the boundary conditions, preconditioning or the mesh quality.

| Cause                                            | Setting                                                                           | First change                                                             |
| ------------------------------------------------ | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| CFL number above the stability limit of the mesh | [`cfl`](/reference/solver/convergence-control#cfl)                                | Below 1.0, say 0.5, for an explicit run; 5.0 or less for an implicit run |
| Second-order spatial accuracy                    | [`order`](/reference/solver/numerical-scheme#order)                               | `first`                                                                  |
| A less dissipative inviscid flux scheme          | [`inviscid_flux_scheme`](/reference/solver/numerical-scheme#inviscid-flux-scheme) | `rusanov`                                                                |
| Wall function iterations that do not converge    | wall [`kind`](/reference/model/boundary-conditions/wall#kind)                     | `slip` or `no slip`                                                      |
| An inconsistent set of boundary conditions       | [`boundary_conditions`](/reference/model/boundary-conditions)                     | Simplify them, as described below                                        |
| Preconditioning unsuited to the mesh             | [`precondition`](/reference/solver/equations#precondition)                        | `False`                                                                  |
| Poor quality cells                               | [Poor mesh quality](#poor-mesh-quality)                                           | Confirm it, then remediate or improve the mesh                           |

### Numerical instability

The solver advances the flow solution towards convergence at the required level of spatial and temporal accuracy,
subject to a user-defined limit called the [CFL](/reference/solver/convergence-control#cfl) (Courant–Friedrichs–Lewy)
number. The CFL number limits the update to the solution in each cycle to maintain the stability of the underlying
numerical scheme.

There are formal criteria for the CFL number of a given scheme, but these typically apply only to idealised meshes:
orthogonal or structured, with a very gradual variation in the volume ratio from cell to cell. For a complex mesh, or
where cell quality is poor even in only a few cells, the limit for stability may be significantly lower. In explicit
mode the theoretical CFL limit is approximately 1.0 for most schemes, though in many cases a higher value of 1.5 to
2.0 will work. In implicit mode the theoretical CFL limit is 1000 or more, and values between 10 and 100 are common.

Reducing the spatial [`order`](/reference/solver/numerical-scheme#order) to `first` and the
[`inviscid_flux_scheme`](/reference/solver/numerical-scheme#inviscid-flux-scheme) to `rusanov` gives the most stable,
though least accurate, discretisation.

### Wall functions

zCFD scales a turbulent wall function on a solid boundary automatically. An internal iterative solution of a set of
equations matches the flow speed and the wall shear stress in the cell adjacent to the wall to the ideal profile of a
turbulent boundary layer. The number of internal iterations should be low, fewer than 20, if the solution is
physically valid. zCFD reports the time per cycle in the `AvgCycleTime` column of the report file, and a value that
starts climbing may indicate that the wall function iterations are not converging. To test whether the wall functions
are the cause, change the wall [`kind`](/reference/model/boundary-conditions/wall#kind) from `wall function` to
`slip` or `no slip`, whichever is the closer approximation to the desired behaviour.

### Inconsistent boundary conditions

zCFD checks that each boundary condition in [`boundary_conditions`](/reference/model/boundary-conditions) is
correctly specified, but it cannot determine whether a combination of boundary conditions is correct. A closed
fluid domain with every boundary a solid wall except for a single mass flow condition, for example, will appear to
converge at first, until the pressure rises or falls to non-physical levels. The effects of mismatched boundary conditions can
also be more subtle, especially where inflow and outflow conditions over-specify or under-specify the solution.

To diagnose inconsistent boundary conditions, simplify them: replace wall functions with slip walls, and inflow and
outflow conditions with [farfield](/reference/model/boundary-conditions/farfield#kind) conditions of kind `riemann`.
It can also help to repeat the simulation and stop the solver shortly before the crash, to inspect the solution for
unexpected features. The temperature field often points to the areas of the flow that are causing problems,
particularly where poor quality cells are present.

### Preconditioning

The timestep of zCFD in explicit mode is limited by a local numerical wave speed in the solver scheme. In regions of
low-speed flow, such as near stagnation points, this may be overly conservative. Preconditioning modifies the scheme to
increase the local timestep, subject to a local stability condition. The stability limits of the preconditioned
scheme may be inappropriate for a given mesh, however, and the flow field then diverges. To test this, set
[`precondition`](/reference/solver/equations#precondition) in `equations` to `False`.

### Parallel log files

For a parallel run, the main log file may not contain all of the information about a crash that the solution on one
partition has caused. The log file for each partition is stored in the `<case>_OUTPUT/LOGGING` directory as
`<case>.<rank>.log`.

## NaN or `inf` in the report

The run stops with this message:

```text
Non-finite values (NaN or inf) detected in report...
```

**Confirm it.** The row holding the non-finite value is written to `<casename>_report.csv` before the run stops, so
the last row of the file shows which column failed, and the rows above it show how the run arrived there. For a
parallel run, read the [log file of each partition](#parallel-log-files) as well as the main log.

| What the rows before it show                                                | Cause and remedy                                              |
| --------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Residuals that rose over the preceding rows                                 | A divergence: see [Diverging residuals](#diverging-residuals) |
| A residual carried by a handful of cells, or divergence at a low CFL number | See [Poor mesh quality](#poor-mesh-quality)                   |

::: {.note}
A column that reads `NaN` in every row written after a restart, while the run continues, is not a failure. The
restart was seeded from a run with a different turbulence model, and the column belongs to that model's closure,
which this run does not solve.
:::

### Locating the failing cells

Safe mode reports where a compressible run fails. Setting [`safe`](/reference/solver/solver-settings#safe) to `True`
checks every cell after each explicit update on the fine mesh. A cell with a NaN value, or with a non-positive density,
energy or pressure, stops the run. The log shows `ExplicitSolver::march - Solver update failed`, then one
`Crash Cell Location:` line per failed cell, giving the coordinates of its centre. The run stops without writing
further output. The check synchronises every stage of the update, so use it to diagnose a failing case and leave it
off in production. Implicit updates, coarse multigrid levels and the incompressible solver are not checked.

## Convergence stall

More common than divergence is convergence stall, in which the reported residuals fall at first and then plateau.

![The convergence of the steady-state explicit solver has achieved an average residual reduction of 5 orders of magnitude and then stalled. The noise in the solution from 40k cycles onwards suggests that either the flow is not fundamentally steady-state or that multigrid is adding an error to the solution. The user must determine whether the level of convergence is sufficient for their purposes and if not whether to run an unsteady simulation or degrade the spatial accuracy.](/images/stall.png "Stalling residuals")

**Confirm it.** The residual history in the report file flattens and stays level. The
[residual statistics columns](../working-with/post-processing-and-visualisation.md#residual-statistics-columns) show
whether the stall belongs to the whole field or to a handful of cells: a small `Neff` against a large mesh means a
localised stall, which is a [mesh quality](#poor-mesh-quality) question. The flow residuals may be stalled while the
integrated properties of interest, such as lift, drag or mass flow, are converged well enough to be useful. That
judgement rests with the engineer.

| Cause                                                 | Setting                                                                        | First change                                                    |
| ----------------------------------------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| An error introduced by multigrid                      | `cycles` in [`multigrid`](/reference/solver/numerical-scheme#multigrid-cycles) | Turn multigrid off after a set number of cycles                 |
| Physical unsteadiness in a steady-state simulation    | [`type`](/reference/solver/time-settings#type) in `time_settings`              | Run unsteady from the stalled solution, or degrade the accuracy |
| A physical time step too large for dual time stepping | [`time_step`](/reference/solver/time-settings#time-step)                       | Reduce it                                                       |
| The limiter switching within the inner cycles         | [Limiter switching](#limiter-switching)                                        | Freeze the limiter                                              |

### Multigrid

For explicit simulations, [multigrid](/reference/solver/numerical-scheme#multigrid) accelerates convergence by using
a set of coarse meshes to propagate the longer-wavelength components of the solution through the domain faster than
the CFL condition would allow on the finest mesh. In theory, and on idealised meshes, multigrid does not change the
steady-state solution that is reached, or the pseudo-steady-state solution of an unsteady flow. On real meshes around
complex geometry, however, multigrid introduces an error, and this can limit convergence. Setting
[`cycles`](/reference/solver/numerical-scheme#multigrid-cycles) in the `multigrid` block turns multigrid off after
that number of cycles, which removes the error.

### Flow unsteadiness

A very common cause of convergence stall, particularly in steady-state simulations, is physical unsteadiness in the
underlying flow. The solver is then attempting to find a steady-state solution to an unsteady problem, and the
solution keeps changing from cycle to cycle. There are two approaches, depending on the flow features of interest.

If the unsteadiness matters, use the unconverged steady-state flow as the starting point for an unsteady simulation.
If the stall is within the pseudo-steady cycles of an unsteady dual time-stepping solution, the physical
[`time_step`](/reference/solver/time-settings#time-step) may be too large, and should be reduced.

If the unsteadiness is not of interest, the accuracy of the solution can be deliberately degraded to give a more
'average' steady-state flow. This might mean the `rusanov` inviscid flux scheme, first-order spatial accuracy, a
coarser mesh, or a combination of these. The implicit mode of the solver can also filter the solution in time, since a
higher CFL number allows larger time steps. This approach can cause solver instability and inaccuracy in the final
solution, because the 'averaging' process is non-physical.

## Limiter switching

Within the inner, pseudo-time cycles of an unsteady dual time-stepping simulation on the compressible solver, a
common cause of apparent stall is the MUSCL limiter switching state from one iteration to the next in a small number
of cells. Those cells keep producing a solution change that never decays. The reported residual is an RMS over all
cells, so a handful of them is enough to hold the whole norm up at a floor, while the bulk of the field may be
converging perfectly well behind it.

**Confirm it.** The residual drops cleanly for the first several inner cycles and then flattens at the same level in
every real time step, while the integrated forces continue to settle. Judging this from the global residual is
unreliable. Use the
[inner cycle convergence columns](../choosing/choosing-a-time-marching-scheme.md#inner-cycle-convergence-columns)
instead, which measure the drop within each real time step rather than an absolute level.

Adding inner cycles does not help, because the floor is not a problem of convergence rate.

| Cause                                                          | Setting                                                                                                            | First change                                                 |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| The limiter changing state in a few cells                      | [`freeze_limiter_cycle`](/reference/solver/numerical-scheme#freeze-limiter-cycle) in `numerical_scheme`            | Set it, to snapshot the limiter and hold it fixed thereafter |
| A solution that genuinely needs the limiter to keep adapting   | [`time_step`](/reference/solver/time-settings#time-step)                                                           | Reduce it, so less has to change in each real time step      |
| The outer-iteration floor of the incompressible coupled scheme | [linear solver](../choosing/choosing-a-linear-solver.md), [`time_step`](/reference/solver/time-settings#time-step) | Tighten the linear solver, or reduce the time step           |
| The under-relaxation floor of the incompressible SIMPLE scheme | [`target_orders`](/reference/solver/convergence-control#inner-convergence-target-orders)                           | Set the target from a run with the criterion off             |

The incompressible solver has no slope limiter and ignores `freeze_limiter_cycle`. An inner residual that flattens
there is the outer iteration's own floor. Under the coupled scheme, tighten the linear solver or reduce the physical
time step. Under SIMPLE, the floor is set by the under-relaxation,
[`implicit_relax`](/reference/solver/convergence-control#scheme-implicit-relax) and
[`pressure_relax`](/reference/solver/convergence-control#scheme-pressure-relax) in the `scheme` block, and it is
reached within a handful of cycles. A `target_orders` above that floor can never be met, so set the target from a run
with the criterion off rather than adding cycles.

## Licence and launch failures

The solver stops at start-up with `License initialisation error` or `License checkout error`. A run that has already
started may instead log `Connection to license server failed retrying`, and later stop with `License heart beat failed`.

**Confirm it.** The lines printed before the stop name the failure. A failed start-up prints
`Error initializing license system` or `Error initializing license heart beat`, followed by the licensing system's own
description of the error. A failed checkout prints `Error checking out license` with the RLM status value, then the
product, version and count requested, and the same description. Look the status value up in the
[licence error codes](../setting-up/installation-and-licensing.md#licence-error-codes).

| Cause                                              | Where to look                                                                                                                                                |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| No licence file in any of the locations searched   | [Licence](../setting-up/installation-and-licensing.md#licence): `zcfd.lic` beside the input files, the `lic` directory of the installation, or `RLM_LICENSE` |
| A licence that has expired, or has not yet started | Status value -3 or -37                                                                                                                                       |
| More licences requested than are free              | Status value -8 or -22: reduce the number of ranks, or stop other running processes                                                                          |
| No connection to the licence server                | Status value -17, -103 to -107 or -111 to -113: check the server, the firewall and `RLM_LICENSE`                                                             |
| A connection lost during the run                   | Status value -21, or the heartbeat messages: see below                                                                                                       |

Once a run has started, a lost connection to the licence server does not stop it at once. The solver logs the retry
warning and continues for up to 10 minutes. If the connection is not restored within that time, the run stops with
`License heart beat failed`.

## Output variable rejected

Validation rejects the deck with a message of this form:

```text
Output variable error: Variables ['kinematicviscosity'] are not valid for equation type 'viscous' in volume context. Valid variables include: [...]...
```

**Confirm it.** The message names the rejected variables, the equation type and whether the list is the surface or
the volume one. Where a close spelling is valid, it adds `Did you mean`. The list it closes with shows only the first
few valid names, so look the name up on the [output variables](/reference/output-variables) page instead. Which names
are valid, and why, is set out under
[Output variables](../working-with/post-processing-and-visualisation.md#output-variables).

Several names are rejected because the name an engineer reads in an output file, or would naturally write, is not the
one a deck asks for:

| Rejected name         | Request instead                                            | Why                                                        |
| --------------------- | ---------------------------------------------------------- | ---------------------------------------------------------- |
| `kinematicviscosity`  | [`nu`](/reference/output-variables#nu)                     | `nu` is written to the output file as `kinematicviscosity` |
| `turbulenceintensity` | [`ti`](/reference/output-variables#ti)                     | `ti` is written as `turbulenceintensity`                   |
| `walldistance`        | [`walldist`](/reference/output-variables#walldist)         | `walldist` is written as `walldistance`                    |
| `velocitygradient`    | [`velocitygrad`](/reference/output-variables#velocitygrad) | Only the shorter spelling is valid                         |
| `facecentre`          | [`centre`](/reference/output-variables#centre)             | `centre` is the valid spelling in both contexts            |
| `frictionvelocity`    | [`ut`](/reference/output-variables#ut)                     | Only the short name is valid                               |

A valid name can also be rejected because the case does not offer it:

| Cause                                                                                         | Setting                                                                                                                                                                |
| --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The name belongs to a higher tier than the equation type solved                               | [`type`](/reference/solver/equations#type) in `equations`                                                                                                              |
| A transition variable without the transition model                                            | [`model`](/reference/solver/equations#turbulence-model) in `turbulence`, set to `sst-transition`                                                                       |
| A modal variable without FSI                                                                  | [`fsi`](/reference/model/boundary-conditions/wall#fsi) on a wall boundary condition                                                                                    |
| A surface-only name in the volume list, or the reverse                                        | [`surface_variables`](/reference/solver/output-settings#solution-surface-variables), [`volume_variables`](/reference/solver/output-settings#solution-volume-variables) |
| A `var_i`, `resvar_i`, `resshare_i` or `vargrad_i` index above the number of equations solved | [`type`](/reference/solver/equations#type) and the turbulence model                                                                                                    |

A running average or RMS variable, such as `p_avg` or `V_rms`, passes validation whether or not averaging is on. If
[`compute_average_and_rms`](/reference/solver/output-settings#compute-average-and-rms) is not set, the solver raises
this error when it first writes the variable:

```text
Averaged output variable requested but averaging storage is unallocated - set output_settings.compute_average_and_rms
```

## Poor mesh quality

A run that still diverges once the CFL number, the spatial order and the inviscid flux scheme have been reduced, or a
stall carried by a handful of cells, points to poor quality cells. The formal CFL criteria apply only to idealised
meshes, and a few poor cells are enough to lower the limit for stability of the whole run.

**Confirm it.** A small `Neff` in the
[residual statistics columns](../working-with/post-processing-and-visualisation.md#residual-statistics-columns),
against a large mesh, means that the residual is carried by a few cells. Add the
[`resshare_i`](/reference/output-variables#resshare-n) volume output variables and threshold them at `1/Neff` to find
those cells. The temperature field often points to the same areas.

| Cause                                           | Setting                                               | First change                                             |
| ----------------------------------------------- | ----------------------------------------------------- | -------------------------------------------------------- |
| Poor cells lowering the limit for stability     | [`cfl`](/reference/solver/convergence-control#cfl)    | Reduce it                                                |
| Poor cells that cannot be removed from the mesh | [Mesh quality remediation](#mesh-quality-remediation) | Set a threshold angle                                    |
| A mesh that can be improved                     | [Preparing a mesh](../setting-up/preparing-a-mesh.md) | Improve the mesh, so the whole domain stays second order |

## Mesh quality remediation

```json
{
  "solver_settings": {
    "type": "compressible",
    "mesh_quality_remediation_angle_threshold": 75
  }
}
```

A strongly non-orthogonal face can stop a second-order compressible solve from converging. The non-orthogonality of a
face is the angle between the line joining the two cell centres on either side of it and the face normal. It is 0
degrees on an ideal mesh and grows as the cells skew.

Setting `mesh_quality_remediation_angle_threshold` computes the convective flux at first order on every interior face
whose non-orthogonality exceeds the threshold, in degrees. Every other face keeps the order the numerical scheme sets.
The key is unset by default, and no face is changed. When convergence problems are traced to mesh quality, 75 degrees
is a reasonable first threshold. The first-order faces add numerical dissipation where they sit, so an improved mesh
remains preferable to a remediated one for a final solution.

The setting applies to the compressible solver only. An incompressible deck that sets it fails validation.

At start-up the log reports the spread of face angles across the mesh and the number of faces changed:

```text
[wing] mesh quality remediation: interior faces whose non-orthogonality exceeds 75 degrees use a first-order convective flux
 Mesh quality remediation: face non-orthogonality histogram
 Angle (deg) |  0 -> 20 | 20 -> 40 | 40 -> 60 | 60 -> 80 | 80 ->100 | 100->120 | 120->140 | 140->160 | 160->180 |
 Num faces   |    812345|     40211|      2310|       188|         4|         0|         0|         0|         0|
 Mesh quality remediation: face non-orthogonality ranges from 0 to 81.6 degrees
 Mesh quality remediation: 57 interior faces exceed the 75 degree threshold and use a first-order convective flux
```

Add `badcells` to `volume_variables` in the solution output to see where those faces lie. Each cell next to a
first-order face holds the largest non-orthogonality among its first-order faces; every other cell holds 0.
