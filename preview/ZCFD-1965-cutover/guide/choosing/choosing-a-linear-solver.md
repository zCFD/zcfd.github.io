---
title: Choosing a linear solver
section: guide
group: Choosing…
order: 40
---

# Choosing a linear solver

Which linear solver settings suit the implicit schemes, RBF mesh motion and the incompressible solver?

Start from the defaults: they are tuned for each equation, and most cases need no change. The library is set by the
hardware. On CPUs zCFD uses [Petsc](https://petsc.org), configured from the control dictionary; on NVIDIA GPUs it uses
[AMGX](https://developer.nvidia.com/amgx), configured from json files read at run time. Change a setting only for a
measured reason, such as an outer iteration that stalls, and then only for the one equation concerned. The two backends are tuned independently, so a setting that helps one is not evidence
for the other.

A linear system is solved in these cases:

| When                                                                                              | Systems solved           | Dictionary                   | AMGX file                                          |
| ------------------------------------------------------------------------------------------------- | ------------------------ | ---------------------------- | -------------------------------------------------- |
| the convergence-control [scheme](choosing-a-time-marching-scheme.md#scheme) is `"implicit euler"` | mean flow and turbulence | `flow`, `turbulence`         | `amgx.json`, `turbamgx.json` or `turbamgx_sa.json` |
| the scheme is `"lu-sgs"` or `"mf-gmres"`, with `turbulence_solver: "amg"`                         | turbulence only          | `turbulence`                 | `turbamgx.json` or `turbamgx_sa.json`              |
| RBFs are used for mesh motion                                                                     | the RBF system           | `rbf`                        | `RBF_amgx.json`                                    |
| the incompressible solver is selected                                                             | every equation           | all five, by coupling scheme | one file per equation                              |

The mean-flow solve of `"mf-gmres"` is matrix-free GMRES, configured on the scheme itself (see
[`mf-gmres`](choosing-a-time-marching-scheme.md#mf-gmres)), and takes nothing from these settings. `"lu-sgs"` and
`"mf-gmres"` also take the assembled turbulence solve wherever the backend forces it: on a CUDA build running on the
host only, and on HIP.

Both libraries offer a wide range of solvers and preconditioners, and the settings can make a large difference to the
performance and convergence of the solver. For the settings each backend uses, equation by equation, see
[Side by side: Petsc and AMGX](#side-by-side-petsc-and-amgx).

The Petsc settings sit under [`linear_solver_options`](/reference/solver/solver-settings#linear-solver-options), in
`solver_settings`:

```python
parameters = {
    "config_version": 2,
    "solver": {
        ...
        "solver_settings": {
            "type": "compressible",
            "linear_solver_options": {
                "flow": {...},
                "turbulence": {...},
                "rbf": {...},
                "double_precision": False,
            },
        },
        ...
    },
    ...
}
```

## Petsc

The options available for the Petsc KSP linear solvers are described in the
[Petsc KSP manual](https://petsc.org/release/manual/ksp/). zCFD passes them to Petsc from the `linear_solver_options`
dictionary.

Each of `flow`, `turbulence` and `rbf` is a plain dictionary of Petsc command-line flags, with both key and value
strings. Where a Petsc option takes no value, give an empty string. Most settings in the
[Petsc documentation](https://petsc.org) can be passed in this way. The compressible defaults are:

```python
"linear_solver_options": {
    "flow": {
        "-ksp_min_it": "2",
        "-ksp_type": "fgmres",
        "-ksp_rtol": "1.0e-3",
        "-ksp_converged_reason": "",
    },
    "turbulence": {
        "-ksp_min_it": "2",
        "-ksp_type": "fgmres",
        "-ksp_rtol": "1.0e-5",
        "-ksp_converged_reason": "",
    },
    "rbf": {
        "-ksp_type": "fgmres",
        "-ksp_rtol": "1.0e-5",
    },
    "double_precision": False,
}
```

::: {.warning}
`-ksp_rtol` is relative to the initial guess, not to the right-hand side. zCFD solves every system with
`KSPSetInitialGuessNonzero`, keeping the previous outer iteration's solution, so only the first solve of a run starts
from zero, with `||r0|| == ||b||`. After that `||r0||` is typically a hundredth of `||b||` or less, and a given
`-ksp_rtol` is correspondingly tighter in absolute terms than it looks. Two `-ksp_rtol` values therefore cannot be
compared across equations whose initial guesses differ in quality, and a value that looks generous can still exhaust
`-ksp_max_it`. `-ksp_monitor_true_residual` prints `||r(i)||/||b||` beside the residual, and shows what a solve is
really achieving.
:::

`-ksp_converged_reason` prints one line for each linear solve, giving the number of iterations it took and whether
it converged. A solve that reports `DIVERGED_ITS` ran out of iterations rather than diverging. It still returns its
best answer, but the tolerance asked for was not met, and a run in which that happens on most cycles is doing work the
outer iteration cannot use. `-ksp_monitor` prints a line for each Krylov iteration. It is useful when investigating a
solve, but is not a default, because on a long run it dominates the log; add it to any of these dictionaries when it
is needed.

### One options namespace per solver

Petsc has a single options database for the whole process. zCFD builds a separate solver for each system it solves,
and gives each its own Petsc options prefix, taken from the name of the dictionary it comes from:

| Dictionary                                                                                           | Prefix                                                           |
| ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| [`flow`](/reference/solver/solver-settings#linear-solver-options-flow)                               | `-flow_`                                                         |
| [`turbulence`](/reference/solver/solver-settings#linear-solver-options-turbulence)                   | `-turb_` (and `-energy_` for the incompressible energy equation) |
| [`momentum`](/reference/solver/solver-settings#linear-solver-options-momentum)                       | `-momentum_`                                                     |
| [`pressure_correction`](/reference/solver/solver-settings#linear-solver-options-pressure-correction) | `-pcorr_`                                                        |
| [`rbf`](/reference/solver/solver-settings#linear-solver-options-rbf)                                 | `-rbf_`                                                          |

So `"-ksp_type": "bcgs"` in the `momentum` dictionary reaches Petsc as `-momentum_ksp_type bcgs`, and applies to that
solver alone. The keys in a control file are written without the prefix, and zCFD adds it. The prefix matters only for
options given from outside the control file, through the `PETSC_OPTIONS` environment variable for instance, where the
prefix must be written out to reach a single solver.

The [Hypre](https://computing.llnl.gov/projects/hypre-scalable-linear-solvers-multigrid-methods) library of algebraic
multigrid methods is available through [Petsc PCHYPRE](https://petsc.org/release/manualpages/PC/PCHYPRE/#pchypre), and
its settings are given in the same dictionaries. Hypre's BoomerAMG package, as a preconditioner, has performed well
with the incompressible solver:

```python
"linear_solver_options": {
    "flow": {
        "-ksp_type": "fgmres",
        "-ksp_rtol": "1.0e-3",
        "-ksp_monitor": "",
        "-ksp_converged_reason": "",
        "-pc_type": "hypre",
        "-pc_hypre_type": "boomeramg",
    },
    ...
}
```

Further Hypre options are described in the
[Petsc PCHYPRE](https://petsc.org/release/manualpages/PC/PCHYPRE/#pchypre) documentation.

## Incompressible solver

With `{"solver_settings": {"type": "incompressible"}}`, `linear_solver_options` gains two further keys,
`momentum` and `pressure_correction`, and takes its own defaults, modelled on OpenFOAM's `simpleFoam`.

### Why they look the way they do

Under the SIMPLE scheme every equation is solved inside an outer iteration, so its linear solve need not be
accurate. It needs to be cheap, because the outer loop revisits it a few thousand times. That is what `simpleFoam`
encodes: across the OpenFOAM tutorials every equation is solved to `relTol 0.1`, one order of magnitude, and only the
kind of solver changes with the equation. The motorBike tutorial is the exception, tightening `p` to `0.01`; the zCFD
pressure-correction default follows that tighter figure, and every other equation the 0.1. zCFD follows the same
mapping:

| `fvSolution`            | OpenFOAM setting                 | zCFD equivalent                             |
| ----------------------- | -------------------------------- | ------------------------------------------- |
| `p`                     | GAMG + GaussSeidel, `relTol 0.1` | `pressure_correction`: CG + Hypre BoomerAMG |
| `U`                     | PBiCGStab + DILU, `relTol 0.1`   | `momentum`: BiCGStab + block-Jacobi/ILU     |
| `k`, `omega`, `epsilon` | smoothSolver, `relTol 0.1`       | `turbulence`: BiCGStab + block-Jacobi/ILU   |

The pressure correction is the one equation that needs coarse levels. It is elliptic, and a purely local
preconditioner such as ILU cannot carry information across the mesh however strong it is made, so it exhausts its
iteration limit without converging. Algebraic multigrid is the cure, and is what OpenFOAM uses for `p`.

The coupled scheme is the exception. There the block-4 velocity-pressure solve is the step itself rather than an inner
iteration, so `flow` keeps a tight tolerance. `simpleFoam` has no counterpart to it.

The defaults:

```python
"linear_solver_options": {
    # Coupled scheme only: this solve is the step, so it is solved tightly.
    "flow": {
        "-ksp_min_it": "2",
        "-ksp_type": "fgmres",
        "-ksp_rtol": "1.0e-7",
        "-ksp_atol": "1.0e-16",
        "-ksp_max_it": "50",
        "-pc_type": "bjacobi",
        "-sub_pc_type": "ilu",
        "-ksp_converged_reason": "",
    },
    # simpleFoam's k/omega/epsilon/nuTilda entry. Also used for the energy equation.
    "turbulence": {
        "-ksp_min_it": "1",
        "-ksp_type": "bcgs",
        "-ksp_rtol": "0.1",
        "-ksp_atol": "1.0e-16",
        "-ksp_max_it": "50",
        "-pc_type": "bjacobi",
        "-sub_pc_type": "ilu",
        "-ksp_converged_reason": "",
    },
    # SIMPLE only: simpleFoam's U entry.
    "momentum": {
        "-ksp_min_it": "1",
        "-ksp_type": "bcgs",
        "-ksp_rtol": "0.1",
        "-ksp_atol": "1.0e-12",
        "-ksp_max_it": "50",
        "-pc_type": "bjacobi",
        "-sub_pc_type": "ilu",
        "-ksp_converged_reason": "",
    },
    # SIMPLE only: simpleFoam's p entry.
    "pressure_correction": {
        "-ksp_min_it": "1",
        "-ksp_type": "cg",
        "-ksp_rtol": "0.01",
        "-ksp_atol": "1.0e-12",
        "-ksp_max_it": "100",
        "-pc_type": "hypre",
        "-pc_hypre_type": "boomeramg",
        "-zcfd_constant_nullspace": "1",
        "-zcfd_pc_reuse_cycles": "20",
        "-ksp_converged_reason": "",
    },
    "rbf": {
        "-ksp_type": "fgmres",
        "-ksp_rtol": "1.0e-5",
    },
    "double_precision": True,
}
```

`-zcfd_constant_nullspace` is not a Petsc option: zCFD consumes it and never passes it on. It attaches a constant
null space to the pressure-correction operator, which keeps the solve well posed when the domain is enclosed and the
pressure has no datum. zCFD detaches it again if the boundary conditions include a fixed-pressure outlet, since that
outlet then sets the datum.

`-zcfd_pc_reuse_cycles` is not a Petsc option either; zCFD consumes it too. It sets how often the preconditioner is
rebuilt. The matrix is reassembled at every outer iteration, so by default Petsc rebuilds the multigrid hierarchy
before every solve, and that is the dominant cost. Profiled with `-log_view` on a 52k-cell plate SIMPLE case,
`PCSetUp` took 5.01 s of the 8.50 s spent in `KSPSolve`, 59% of all linear-solver time, for a matrix whose sparsity
never changes. Building it once and freezing it is no answer either: on the plate case that takes the pressure solve
from 1.26 iterations per cycle over the first fifty cycles to 8.3 over the last fifty, as the start-up transient moves
the operator away from it. Rebuilding every N solves cuts the setup cost by a factor of N, while keeping the
preconditioner at most N cycles stale; it is the trade OpenFOAM's GAMG makes with `cacheAgglomeration`. Set it to `1`
to rebuild for every solve. Whatever the value, it cannot change the answer: the Krylov solver applies the true
operator, so a stale preconditioner costs iterations and nothing else.

[`pressure_correction`](/reference/solver/solver-settings#linear-solver-options-pressure-correction) and
[`momentum`](/reference/solver/solver-settings#linear-solver-options-momentum) apply only when the incompressible
solver uses the SIMPLE coupling scheme, `{"convergence_control": {"scheme": {"name": "simple"}}}`. The coupled scheme
builds neither solver, and setting either key under it is rejected.

## AMGX

The AMGX settings for the mean-flow, turbulence and RBF linear systems are read from json files, not from the
control dictionary: `ZCFD_HOME/amgx.json`, `ZCFD_HOME/turbamgx.json` and `ZCFD_HOME/RBF_amgx.json`. The files are in
AMGX's own configuration format, and are unrelated to the `config_version` key of the zCFD control file; the
`"config_version": 2` below is the version of AMGX's file format, not zCFD's. The mean-flow settings are:

```json file=amgx.json
{
  "config_version": 2,
  "determinism_flag": 1,
  "solver": {
    "preconditioner": {
      "error_scaling": 0,
      "print_grid_stats": 0,
      "max_uncolored_percentage": 0.05,
      "algorithm": "AGGREGATION",
      "solver": "AMG",
      "smoother": "MULTICOLOR_GS",
      "presweeps": 0,
      "selector": "SIZE_8",
      "coarse_solver": "NOSOLVER",
      "max_iters": 1,
      "postsweeps": 3,
      "min_coarse_rows": 32,
      "relaxation_factor": 0.75,
      "scope": "amg",
      "max_levels": 40,
      "matrix_coloring_scheme": "PARALLEL_GREEDY",
      "cycle": "V"
    },
    "use_scalar_norm": 1,
    "solver": "FGMRES",
    "print_solve_stats": 1,
    "obtain_timings": 1,
    "max_iters": 10,
    "monitor_residual": 1,
    "gmres_n_restart": 5,
    "convergence": "RELATIVE_INI_CORE",
    "scope": "main",
    "tolerance": 1e-3,
    "norm": "L2"
  }
}
```

These settings perform well for most cases. If the linear system is hard to converge, reducing `"tolerance"` may
help. Otherwise, changing the aggregation selector from `"selector": "SIZE_8"` to `"SIZE_4"` or `"SIZE_2"` builds
smaller aggregates, and so more coarse levels, improving convergence at the cost of memory. Increasing
`"gmres_n_restart"` may also improve convergence, again at the cost of memory.

AMGX has too many options to describe here, but the
[AMGX example configurations](https://github.com/NVIDIA/AMGX/tree/main/src/configs) cover the different solvers.

### Incompressible AMGX configurations

The incompressible solver reads its own set of files, one for each equation, so that each system has a
configuration suited to it. Each file is looked for first in the working directory and then in `ZCFD_HOME`, so a copy
placed beside the control file overrides it for that case.

| File                          | System                                                                                       |
| ----------------------------- | -------------------------------------------------------------------------------------------- |
| `incomp_amgx.json`            | Coupled scheme: the block-4 velocity-pressure system.                                        |
| `incomp_simple_mom_amgx.json` | SIMPLE: the block-3 momentum predictor. FGMRES + block-Jacobi, `alt_rel_tolerance` 0.1.      |
| `incomp_pcorr_amgx.json`      | SIMPLE: the block-1 pressure-correction Poisson. Aggregation AMG, as for `simpleFoam`'s `p`. |
| `incomp_turb_amgx.json`       | Turbulence and energy transport.                                                             |

`"structure_reuse_levels": -1` in `incomp_amgx.json` and `incomp_pcorr_amgx.json` keeps the multigrid hierarchy from
cycle to cycle. The matrix coefficients change at every outer iteration but the sparsity pattern never does, so
re-aggregating every cycle would be wasted work. Leave `"coarse_solver": "NOSOLVER"` in `incomp_pcorr_amgx.json` as
it is: with no fixed-pressure outlet the pressure-correction operator is singular, and a direct coarse solve meets a
zero pivot on it. That is also why OpenFOAM leaves `directSolveCoarsest` off.

::: {.note}
The Petsc settings above do not transfer wholesale to AMGX, and were measured separately. Two changes that are
clearly right on the Petsc side proved wrong here, in a GPU comparison on the lid-driven cavity and the plate RANS
case:

- Moving the momentum predictor from FGMRES to BiCGStab, `simpleFoam`'s `PBiCGStab`, cost 68% more iterations, from
  6564 to 10995, and was no better with `MULTICOLOR_DILU` in place of block-Jacobi. OpenFOAM pairs `PBiCGStab` with
  `DILU`, a much stronger preconditioner than anything cheap available here, and without it BiCGStab has no strong preconditioner
  to support it. FGMRES is kept.
- Loosening the turbulence `alt_rel_tolerance` from `1.0e-6` to OpenFOAM's `relTol 0.1` moved `wall_Fx` on the plate
  case by 53%. The equivalent change is safe on Petsc only because the turbulence solve there already ended on
  `-ksp_atol`, so the relative tolerance never bounded it; `alt_rel_tolerance` has no such floor, and the loosening is
  real. It is kept at `1.0e-6`.

The AMGX files therefore diverge from the Petsc options by design: the mapping under
[Why they look the way they do](#why-they-look-the-way-they-do) describes the Petsc path.
:::

On NVIDIA GPUs, with AMGX, the one linear-solver setting that still comes from the zCFD control dictionary is
[`double_precision`](/reference/solver/solver-settings#linear-solver-options-double-precision), on
`linear_solver_options`:

```python
"linear_solver_options": {"double_precision": False}
```

`double_precision` sets whether the mean-flow linear system is solved in single or double precision. Single precision
reduces memory use and speeds up the solver; more demanding cases may need double precision.

## Side by side: Petsc and AMGX

The same equation is solved by a different library on CPU and on GPU, and the two are configured in different
places: Petsc through the control dictionary, AMGX through its json files. This section sets them side by side,
equation by equation, so that the settings a case is running can be read in one place.

The two backends are tuned independently, and are not expected to match. Where they differ, the difference is usually
deliberate and measured; the note under [Incompressible AMGX configurations](#incompressible-amgx-configurations) gives
the two cases where a Petsc setting was tried on AMGX and rejected.

### How the settings correspond

| Concept            | Petsc                               | AMGX                                                          |
| ------------------ | ----------------------------------- | ------------------------------------------------------------- |
| Krylov method      | `-ksp_type`                         | `solver`                                                      |
| Preconditioner     | `-pc_type`, `-sub_pc_type`          | `preconditioner`, and its `smoother` when that is AMG         |
| Relative tolerance | `-ksp_rtol`                         | `alt_rel_tolerance`, or `tolerance` under `RELATIVE_INI_CORE` |
| Absolute tolerance | `-ksp_atol`                         | `tolerance`, under `COMBINED_REL_INI_ABS` only                |
| Iteration limit    | `-ksp_max_it`                       | `max_iters`                                                   |
| Minimum iterations | `-ksp_min_it`                       | no equivalent                                                 |
| GMRES restart      | `-ksp_gmres_restart` (unset, so 30) | `gmres_n_restart`                                             |
| Setup amortisation | `-zcfd_pc_reuse_cycles`             | `structure_reuse_levels` (see below)                          |

The tolerance rows depend on the `convergence` mode, which is why the same `tolerance` key means different things in
different files:

- `COMBINED_REL_INI_ABS`, used by the incompressible files, stops when `|r| < tolerance` or
  `|r|/|r0| <= alt_rel_tolerance`. `tolerance` is then the absolute floor and `alt_rel_tolerance` the relative one:
  the two Petsc tolerances, in the opposite order to the one the names suggest.
- `RELATIVE_INI_CORE`, used by the compressible files, stops when `|r|/|r0| <= tolerance`. Here `tolerance` is the
  relative tolerance, and there is no absolute floor at all.

::: {.warning}
`structure_reuse_levels` and `-zcfd_pc_reuse_cycles` do similar jobs but are not equivalent.
`structure_reuse_levels` keeps the multigrid structure, the aggregation and colouring, and still rebuilds the coarse
operators at every setup. `-zcfd_pc_reuse_cycles` skips the preconditioner setup outright for all but every Nth solve.
AMGX has no equivalent of the second, and Petsc none of the first.
:::

### Incompressible, SIMPLE scheme

Momentum predictor — `momentum` / prefix `momentum_` / `incomp_simple_mom_amgx.json`:

| Setting            | Petsc             | AMGX                 |
| ------------------ | ----------------- | -------------------- |
| Solver             | `bcgs`            | `FGMRES`, restart 30 |
| Preconditioner     | `bjacobi` + `ilu` | `BLOCK_JACOBI`       |
| Relative tolerance | `0.1`             | `0.1`                |
| Absolute tolerance | `1.0e-12`         | `1e-10`              |
| Iteration limit    | `50`              | `50`                 |

Pressure correction — `pressure_correction` / prefix `pcorr_` / `incomp_pcorr_amgx.json`:

| Setting            | Petsc                   | AMGX                                                        |
| ------------------ | ----------------------- | ----------------------------------------------------------- |
| Solver             | `cg`                    | `FGMRES`, restart 32                                        |
| Preconditioner     | `hypre` / BoomerAMG     | aggregation AMG, `SIZE_8`, V-cycle, `BLOCK_JACOBI` smoother |
| Sweeps             | BoomerAMG defaults      | 0 pre, 2 post, `coarse_solver` `NOSOLVER`                   |
| Relative tolerance | `0.01`                  | `0.01`                                                      |
| Absolute tolerance | `1.0e-12`               | `1e-10`                                                     |
| Iteration limit    | `100`                   | `50`                                                        |
| Setup amortisation | rebuild every 20 solves | `structure_reuse_levels` `-1`                               |

This is the closest-matched pair: multigrid at `relTol 0.01` on both sides.

Turbulence and energy — `turbulence` / prefixes `turb_` and `energy_` / `incomp_turb_amgx.json`:

| Setting            | Petsc             | AMGX                                                     |
| ------------------ | ----------------- | -------------------------------------------------------- |
| Solver             | `bcgs`            | `FGMRES`, restart 32                                     |
| Preconditioner     | `bjacobi` + `ilu` | aggregation AMG, `BLOCK_JACOBI` smoother, 0 pre / 3 post |
| Relative tolerance | `0.1`             | `1.0e-6`                                                 |
| Absolute tolerance | `1.0e-16`         | `1e-10`                                                  |
| Iteration limit    | `50`              | `100`                                                    |

The relative tolerances differ by five orders of magnitude, by design; see the note under
[Incompressible AMGX configurations](#incompressible-amgx-configurations). The energy equation shares the
`turbulence` dictionary and the same json file on both backends; only its Petsc options prefix is its own.

### Incompressible, coupled scheme

Block-4 velocity-pressure — `flow` / prefix `flow_` / `incomp_amgx.json`. Turbulence and energy are as above;
`momentum` and `pressure_correction` are not built at all under this scheme.

| Setting            | Petsc                   | AMGX                                             |
| ------------------ | ----------------------- | ------------------------------------------------ |
| Solver             | `fgmres`                | `FGMRES`, restart 100                            |
| Preconditioner     | `bjacobi` + `ilu`       | aggregation AMG, `MULTICOLOR_GS`, 1 pre / 3 post |
| Relative tolerance | `1.0e-7`                | `1e-4`                                           |
| Absolute tolerance | `1.0e-16`               | `1e-10`                                          |
| Iteration limit    | `50`                    | `30`                                             |
| Setup amortisation | rebuild every 20 solves | `structure_reuse_levels` `-1`                    |

::: {.warning}
On a large parallel case the coupled flow solve does not reach `-ksp_rtol` at any iteration limit, and `-ksp_max_it`
is what ends it. The 7.46M-cell Windsor body on 16 ranks reports `DIVERGED_ITS` on every cycle at a cap of 20, 50 and
400 alike: block-Jacobi/ILU stalls on a block-4 saddle-point system of that size, its convergence factor per iteration
worsening from 0.82 over the first twenty iterations to 0.91 averaged over fifty.

That is no reason to lower the cap. The outer iteration needs a better linear solve, not a converged one, and the
deeper solve pays for itself: at 500 cycles it takes `rhoV[0]` from `3.78e-06` to `1.11e-06` for 1.73 times the cost
per cycle, so at equal wall time it is still about twice as converged. Read `DIVERGED_ITS` on this solver as a
statement about the reach of the preconditioner, not as a failure to act on. A stronger preconditioner for the coupled
system, not a larger cap, is what would remove it.
:::

::: {.note}
The two relative tolerances in this table are not comparable, and the Petsc one is not the tighter of the pair,
despite the smaller number. Petsc applies `-ksp_rtol` to the residual of the initial guess, and this solver keeps the
previous outer iteration's solution as that guess. From the second solve onwards `||r0||` is therefore a hundredth of
`||b||` or less, and `1.0e-7` relative to it is nearer `1.0e-9` relative to `||b||`. AMGX's `alt_rel_tolerance` is
likewise a reduction from its own starting residual, but its aggregation multigrid reaches it in about eight
iterations, where block-Jacobi/ILU stalls on this saddle-point system.

Measured on the lid-driven cavity at 300 cycles, comparing the outer residual each setting delivers rather than the
number in the file, AMGX at `alt_rel_tolerance` `1e-4` reaches `rhoV[0]` `1.9e-09`, where Petsc at `-ksp_rtol`
`1.0e-7` reaches `3.4e-08`. Matching the numbers would make matters worse: Petsc at `1.0e-4` stalls the outer
iteration at `1.2e-05`, and never reaches `1e-06`. The two backends agree in the limit: solved almost exactly, with
`-ksp_rtol` `1.0e-12` and 200 iterations, Petsc reaches `3.2e-13`.
:::

### Compressible

Mean flow: `flow` / prefix `flow_` / `amgx.json`. Turbulence: `turbulence` / prefix `turb_` / `turbamgx.json`, or
`turbamgx_sa.json` when the turbulence model is `sa-neg`.

| Setting                        | Petsc                           | AMGX                                                           |
| ------------------------------ | ------------------------------- | -------------------------------------------------------------- |
| Solver (both systems)          | `fgmres`                        | `FGMRES`, restart 5                                            |
| Preconditioner                 | not set, so Petsc's own default | aggregation AMG, `MULTICOLOR_GS` (`BLOCK_JACOBI` for `sa-neg`) |
| Relative tolerance, mean flow  | `1.0e-3`                        | `1e-3`                                                         |
| Relative tolerance, turbulence | `1.0e-5`                        | `1e-5`                                                         |
| Absolute tolerance             | not set, so `1e-50`             | none, under `RELATIVE_INI_CORE`                                |
| Iteration limit                | not set, so `10000`             | `10`                                                           |

The tolerances match exactly here. The iteration limits do not: a compressible Petsc solve is bounded only by its
tolerance, whereas the AMGX one stops after ten iterations, converged or not.

### RBF mesh motion

`rbf` / prefix `rbf_` / `RBF_amgx.json`. This is the least closely matched pair in zCFD: the two backends use a
different Krylov method, a different cycle and different kinds of tolerance.

| Setting         | Petsc               | AMGX                                                      |
| --------------- | ------------------- | --------------------------------------------------------- |
| Solver          | `fgmres`            | `PCG`                                                     |
| Preconditioner  | not set             | AMG, `D2` interpolation, W-cycle, `BLOCK_JACOBI` smoother |
| Tolerance       | `1.0e-5` relative   | `1e-12` absolute                                          |
| Iteration limit | not set, so `10000` | `100`                                                     |

### Summary

| Equation                           | Relative tolerance                   | Krylov method | Preconditioner class |
| ---------------------------------- | ------------------------------------ | ------------- | -------------------- |
| Incompressible pressure correction | same, `0.01`                         | differs       | same, multigrid      |
| Incompressible momentum            | same, `0.1`                          | differs       | same, block-Jacobi   |
| Incompressible turbulence, energy  | differs                              | differs       | differs              |
| Incompressible coupled flow        | differs (not comparable — see above) | same          | differs              |
| Compressible mean flow             | same, `1.0e-3`                       | same          | differs              |
| Compressible turbulence            | same, `1.0e-5`                       | same          | differs              |
| RBF                                | differs                              | differs       | differs              |

### Reading the settings a case actually used

On the Petsc path the solver logs every option it sets, under the prefix it sets it under, so the log is the
authoritative record of what a run used, including anything overridden from the control dictionary. On the AMGX path,
set `"print_solve_stats": 1` in the relevant json file to have each solve report its iteration count and residuals.

## Reference entries

- [`linear_solver_options`](/reference/solver/solver-settings#linear-solver-options):
  [`flow`](/reference/solver/solver-settings#linear-solver-options-flow),
  [`turbulence`](/reference/solver/solver-settings#linear-solver-options-turbulence),
  [`momentum`](/reference/solver/solver-settings#linear-solver-options-momentum),
  [`pressure_correction`](/reference/solver/solver-settings#linear-solver-options-pressure-correction),
  [`rbf`](/reference/solver/solver-settings#linear-solver-options-rbf) and
  [`double_precision`](/reference/solver/solver-settings#linear-solver-options-double-precision)
- [`scheme`](/reference/solver/convergence-control#scheme) and
  [`turbulence_solver`](/reference/solver/convergence-control#scheme-turbulence-solver)
