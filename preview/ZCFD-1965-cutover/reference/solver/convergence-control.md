---
title: convergence control
section: reference
---

# convergence control

Compressible pacing scheme (required for steady/DTS)


## cycles

Number of convergence cycles (steady) or max pseudo-time cycles per step (unsteady)

whole number · required · > 0

Guidance: [/guide/choosing/choosing-a-time-marching-scheme#cycles](/guide/choosing/choosing-a-time-marching-scheme#cycles)


## inner convergence

Let the solver decide how many inner (pseudo-time) cycles each real time step needs, with 'cycles' acting as an upper bound. Unset runs the full 'cycles' every real time step.

settings block · not set by default · 'inner convergence' only applies when solver.time settings.kind is 'dual time stepping'

Guidance: [/guide/choosing/choosing-a-time-marching-scheme#inner-cycle-convergence](/guide/choosing/choosing-a-time-marching-scheme#inner-cycle-convergence)


### target orders

Orders of magnitude the worst selected residual measure must fall within the current real time step before it is called converged: the InnerRatio diagnostic for the compressible solver, the reported residual itself (InnerDrop) for the incompressible solver. Scale free in both, so one value carries between cases. 0 or less disables this test.

number · default 1

Guidance: [/guide/choosing/choosing-a-time-marching-scheme#choosing-a-target](/guide/choosing/choosing-a-time-marching-scheme#choosing-a-target)


### target ratio

Absolute floor on the InnerRatio diagnostic itself, ORed with 'target_orders'. Compressible solver only. Not portable between cases; measure it from a run first. Unset or 0 disables this test.

number · not set by default · >= 0.0 · 'target ratio' only applies when solver.solver settings.type is one of unset, 'compressible'

Guidance: [/guide/choosing/choosing-a-time-marching-scheme#choosing-a-target](/guide/choosing/choosing-a-time-marching-scheme#choosing-a-target)


### min cycles

Inner cycles that always run before the criterion is tested.

whole number · default 5 · >= 1

Guidance: [/guide/choosing/choosing-a-time-marching-scheme#choosing-a-target](/guide/choosing/choosing-a-time-marching-scheme#choosing-a-target)


### check frequency

Inner cycles between evaluations of the criterion. A check cycle is also a reporting cycle: the criterion is judged on the reported residuals.

whole number · default 5 · >= 1


### variables

Residuals the criterion is judged on: 'mean flow', 'all' (mean flow plus the turbulence transport equations), or an explicit list of residual names. What 'mean flow' selects follows the solver: compressible takes continuity, momentum and energy (rho, rhoV[0..2], rhoE); the incompressible coupled scheme takes momentum and pressure (rhoV[0..2], p) — pressure being the continuity constraint that governs its outer iteration; SIMPLE takes momentum alone, its reported pressure being the pressure-correction solve's own residual rather than a flow one. The incompressible solver reports no energy residual, so an energy-solving case cannot select one.

choice or list of text · default mean flow

| Value | What it does | When to use it |
| --- | --- | --- |
| `mean flow` (default) | Density, momentum and energy for the compressible solver, momentum and pressure for the incompressible coupled scheme, and momentum alone for SIMPLE. |  |
| `all` | Adds the turbulence transport equations. |  |

Guidance: [/guide/choosing/choosing-a-time-marching-scheme#the-incompressible-measure](/guide/choosing/choosing-a-time-marching-scheme#the-incompressible-measure)


### stall window

Give up when the reduction stops improving over this many checks: limiter switching can floor a residual norm no number of cycles will get below. 0 disables stall detection.

whole number · default 10 · >= 0


### stall tolerance

Orders that must be gained across 'stall_window' checks for the inner iteration to count as still making progress.

number · default 0.05


### start real time step

Real time step from which the criterion may fire. A solution restarted from a steady state and left to develop — RANS into DES — looks converged per real time step while the unsteadiness is still small, so an early exit through that phase would cut the inner iteration short exactly while the instability that has to grow is being resolved.

whole number · default 0 · >= 0

Guidance: [/guide/choosing/choosing-a-time-marching-scheme#choosing-a-target](/guide/choosing/choosing-a-time-marching-scheme#choosing-a-target)


## scheme

Pseudo-time/Convergence integration scheme

choice of settings blocks · not set by default

Guidance: [/guide/choosing/choosing-a-time-marching-scheme#scheme](/guide/choosing/choosing-a-time-marching-scheme#scheme)


### name

Pseudo-time integration scheme: euler = first-order explicit

not set by default

| Value | What it does | When to use it |
| --- | --- | --- |
| `euler` (default) |  | The `"euler"` scheme has a single stage and is the safest option for new or problematic cases. |
| `runge kutta` (default) |  |  |
| `implicit euler` (default) | The default implicit scheme, solving the full linearised system with the Petsc or AMGX linear solver each pseudo-time step. |  |
| `lu-sgs` (default) | A matrix-free, point-implicit LU-SGS/DP-LUR scheme. It avoids assembling and inverting the full linear system, trading some convergence rate for lower memory use and, often, faster wall-clock time per cycle than `"implicit euler"`. |  |
| `mf-gmres` (default) | Restarted GMRES that applies the exact analytic flux Jacobian matrix-free, with no assembled mean-flow matrix. | Not available with the SAS turbulence model or the SAS hybrid. |
| `coupled` (default) | Solves a single block-4 [u,v,w,p] system per pseudo-time step. |  |
| `simple` (default) | Uses a segregated SIMPLE momentum predictor followed by a pressure correction. |  |

Guidance: [/guide/choosing/choosing-a-time-marching-scheme#name](/guide/choosing/choosing-a-time-marching-scheme#name)


### stage

Has no effect under 'euler' (single-stage by construction). Accepted for backward compatibility with decks that carry this key as boilerplate; prefer omitting it.

not set by default

| Value | What it does | When to use it |
| --- | --- | --- |
| `1` |  |  |
| `3` |  |  |
| `4` |  |  |
| `5` |  |  |
| `rk third order tvd` |  |  |


### sub iterations

Number of LU-SGS/DP-LUR sweeps per pseudo-time step

whole number · not set by default · > 0


### over relaxation

Diagonal over-relaxation factor for the LU-SGS/DP-LUR sweeps

number · not set by default · > 0.0


### turbulence solver

Linear solver for the turbulence equations under LU-SGS. 'amg' keeps the assembled AMG solve; 'point-implicit' uses the matrix-free sweep. The C++ default when unset is 'point-implicit'.

not set by default

| Value | What it does | When to use it |
| --- | --- | --- |
| `amg` | Keeps the assembled AMG solve for the turbulence equations. |  |
| `point-implicit` | Uses the matrix-free sweep instead. |  |


### krylov subspace

Restart length m. The solver stores m+1 Krylov vectors, or 2m+1 with flexible, so this is the dominant storage cost; size it from the observed iteration count rather than padding it.

whole number · not set by default · > 0

Guidance: [/guide/choosing/choosing-a-time-marching-scheme#mf-gmres](/guide/choosing/choosing-a-time-marching-scheme#mf-gmres)


### linear tolerance

Relative residual drop required of the linear solve each implicit step

number · not set by default · > 0.0


### max iterations

Hard cap on total Krylov iterations (across restarts) per implicit step

whole number · not set by default · > 0


### preconditioner

'block jacobi' inverts the exact analytic 5x5 block diagonal. 'lu-sgs' uses linearised symmetric Gauss-Seidel sweeps. 'lu-sgs nonlinear' uses the stock unlinearised sweep and REQUIRES flexible=true, since it is not a linear operator and plain GMRES cannot converge with it.

not set by default · 'preconditioner' only applies when flexible is True

| Value | What it does | When to use it |
| --- | --- | --- |
| `block jacobi` | Inverts the exact analytic 5x5 block diagonal. The same operator on the host and on a GPU. |  |
| `lu-sgs` | Linearised symmetric Gauss-Seidel sweeps. |  |
| `lu-sgs nonlinear` | The unlinearised LU-SGS sweep. | Requires `flexible: True`: the sweep is not a linear operator, and plain GMRES cannot converge with it. |
| `none` | No preconditioner. |  |

Guidance: [/guide/choosing/choosing-a-time-marching-scheme#mf-gmres](/guide/choosing/choosing-a-time-marching-scheme#mf-gmres)


### preconditioner sweeps

Symmetric Gauss-Seidel sweeps per preconditioner application (lu-sgs only)

whole number · not set by default · > 0


### orthogonalisation

How the Krylov basis is orthogonalised. 'mgs' (default) is modified Gram-Schmidt, matching AMGX's gmres/fgmres and so directly comparable with the implicit euler benchmark. 'cgs2' is classical Gram-Schmidt with one reorthogonalisation pass and batched reductions: it reduces the reduction round trips per restart cycle from O(m^2) to O(m) at the cost of twice the vector work, which is only expected to pay at high rank counts where each reduction is a real collective.

not set by default

| Value | What it does | When to use it |
| --- | --- | --- |
| `mgs` | Modified Gram-Schmidt. | The default. |
| `cgs2` | Classical Gram-Schmidt with one reorthogonalisation pass and batched reductions: fewer reductions per restart cycle, at twice the vector work. | Only expected to pay at high rank counts, where each reduction is a real collective. |


### preconditioner over relaxation

Diagonal over-relaxation for the lu-sgs preconditioner sweeps. Named separately from the lu-sgs solver's own 'over relaxation' because here it tunes a PRECONDITIONER, not the solve.

number · not set by default · > 0.0


### turbulence sweeps

Sweeps for the point-implicit turbulence solve. Deliberately NOT called 'sub iterations': that name belongs to the lu-sgs solver, and confusing it with 'preconditioner sweeps' (which tunes the MEAN-FLOW preconditioner) would be easy.

whole number · not set by default · > 0


### flexible

Use FGMRES instead of right-preconditioned GMRES. Permits a preconditioner that varies between iterations, at the cost of a second set of m Krylov vectors.

true or false · not set by default

Guidance: [/guide/choosing/choosing-a-time-marching-scheme#mf-gmres](/guide/choosing/choosing-a-time-marching-scheme#mf-gmres)


### implicit relax

Under-relaxation factor (alpha_u) on the implicit momentum, pressure and energy updates

number · default 0.5 · 0.1 to 1.0


### turbulence relax

Under-relaxation factor on the turbulence transport update. Has no effect without a turbulence model (laminar viscous, non-hybrid LES)

number · default 0.5 · > 0 and <= 1.0


### pin pressure

Pin the pressure at a reference cell with a large diagonal instead of the default constant-null-space + mean-removal gauge fix. Needed on a fully closed domain (no fixed-pressure boundary)

true or false · not set by default


### pressure relax

Explicit pressure under-relaxation factor (alpha_p) for p += alpha_p * p'. The solver default is 0.3

number · not set by default · > 0.0 and <= 1.0


### pressure regularisation

Diagonal regularisation (diag += beta*|diag|) of the pressure-correction Poisson operator. Vanishes at convergence, so the steady solution is unbiased

number · not set by default · >= 0.0


### pressure correction limit

Limit factor applied to the pressure correction

number · not set by default · > 0.0


## cfl

CFL configuration. A bare number is shorthand for the working CFL: `cfl: 2.0` means `cfl: {cfl: 2.0}`.

settings block · default {cfl: 1}

Guidance: [/guide/choosing/choosing-a-time-marching-scheme#cfl-control](/guide/choosing/choosing-a-time-marching-scheme#cfl-control)


### cfl

CFL number

number · required · > 0

Guidance: [/guide/choosing/choosing-a-time-marching-scheme#cfl](/guide/choosing/choosing-a-time-marching-scheme#cfl)


### cfl turbulence

Working CFL for the turbulence transport equations (the conserved-variable slots beyond the 5 mean-flow equations — SA: 1, SST: 2). The solver uses it directly as the pseudo-time CFL for those equations, not as a cap. Has no effect when no turbulence model is active (euler, laminar viscous, non-hybrid LES).

number · not set by default · > 0

Guidance: [/guide/choosing/choosing-a-time-marching-scheme#cfl_turbulence](/guide/choosing/choosing-a-time-marching-scheme#cfl_turbulence)


### cfl coarse

CFL number for multigrid coarse levels

number · not set by default · > 0 · 'cfl coarse' only applies when solver.numerical scheme.multigrid is set

Guidance: [/guide/choosing/choosing-a-time-marching-scheme#cfl_coarse](/guide/choosing/choosing-a-time-marching-scheme#cfl_coarse)


### cfl ramp

How the CFL climbs toward 'cfl'. A list of ramps, each naming its shape — one entry for a single ramp, several to run in order. Alternatively a callable f(cycle, current_cfl) returning either the new CFL, or a mapping of any of 'cfl', 'cfl_turbulence' and 'cfl_coarse' to drive those alongside it (keys not returned keep their static value).

list of settings blocks · a list of these blocks · not set by default

Guidance: [/guide/choosing/choosing-a-time-marching-scheme#cfl_ramp](/guide/choosing/choosing-a-time-marching-scheme#cfl_ramp)


#### initial

CFL this ramp starts from, returned at its own start cycle. Leave unset to carry on from wherever the previous ramp left off.

number · not set by default · > 0

Guidance: [/guide/choosing/choosing-a-time-marching-scheme#cfl_ramp](/guide/choosing/choosing-a-time-marching-scheme#cfl_ramp)


#### start cycle

First solve cycle this ramp acts on.

whole number · default 1 · >= 1

Guidance: [/guide/choosing/choosing-a-time-marching-scheme#cfl_ramp](/guide/choosing/choosing-a-time-marching-scheme#cfl_ramp)


#### end cycle

Last solve cycle this ramp acts on. Unset runs to the end of the run.

whole number · not set by default · >= 1

Guidance: [/guide/choosing/choosing-a-time-marching-scheme#cfl_ramp](/guide/choosing/choosing-a-time-marching-scheme#cfl_ramp)


#### type

— no description —

required

| Value | What it does | When to use it |
| --- | --- | --- |
| `exponential` | Multiplies the CFL by `factor` (>= 1.0) each cycle, capped at `max_allowed`. |  |
| `linear` | Adds `increment` to the CFL every cycle between `start_cycle` and `end_cycle`. |  |
| `stepped_linear` | Adds `increment` every `step_cycles` cycles. |  |

Guidance: [/guide/choosing/choosing-a-time-marching-scheme#cfl_ramp](/guide/choosing/choosing-a-time-marching-scheme#cfl_ramp)


#### factor

Multiplied into the CFL every cycle. Must be at least 1.

number · required · >= 1.0


#### max allowed

Ceiling on the ramp itself, guarding against overflow.

number · default 1000000 · > 0


#### increment

Added to the CFL every cycle in the window. An increment of 0 holds the CFL steady.

number · required


#### step cycles

Cycles between steps.

whole number · required · > 0


### cfl viscous factor

CFL viscous factor

number · not set by default · > 0

Guidance: [/guide/choosing/choosing-a-time-marching-scheme#cfl_viscous_factor](/guide/choosing/choosing-a-time-marching-scheme#cfl_viscous_factor)


## viscosity ramp

Scales the effective viscosity, decaying log-linearly from initial to 1, lowering the effective Reynolds number early so the start is more diffusive. initial <= 1 disables it

settings block · default {initial: 100, cycles: 300}

Guidance: [/guide/choosing/choosing-a-time-marching-scheme#startup-ramps](/guide/choosing/choosing-a-time-marching-scheme#startup-ramps)


### initial

Ramp value on the first pseudo cycle; the ramp eases to 1 from here

number · required · > 0

Guidance: [/guide/choosing/choosing-a-time-marching-scheme#startup-ramps](/guide/choosing/choosing-a-time-marching-scheme#startup-ramps)


### cycles

Number of pseudo cycles over which the ramp reaches 1

number · default 300 · > 0

Guidance: [/guide/choosing/choosing-a-time-marching-scheme#startup-ramps](/guide/choosing/choosing-a-time-marching-scheme#startup-ramps)


## relaxation ramp

Scales the under-relaxation factors (alpha_u, alpha_p, turbulence relax), rising linearly from initial to 1, so the solver starts more relaxed. initial >= 1 (the default) disables it

settings block · default {initial: 1, cycles: 300}

Guidance: [/guide/choosing/choosing-a-time-marching-scheme#startup-ramps](/guide/choosing/choosing-a-time-marching-scheme#startup-ramps)


### initial

Ramp value on the first pseudo cycle; the ramp eases to 1 from here

number · required · > 0

Guidance: [/guide/choosing/choosing-a-time-marching-scheme#startup-ramps](/guide/choosing/choosing-a-time-marching-scheme#startup-ramps)


### cycles

Number of pseudo cycles over which the ramp reaches 1

number · default 300 · > 0

Guidance: [/guide/choosing/choosing-a-time-marching-scheme#startup-ramps](/guide/choosing/choosing-a-time-marching-scheme#startup-ramps)


::: {.deck title="convergence control"}
```python
"convergence control": {
    "cycles": 20,
    ...
},
```
:::

