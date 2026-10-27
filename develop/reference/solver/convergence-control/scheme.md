---
title: scheme
section: reference
---

# scheme

Pseudo-time/Convergence integration scheme

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `name` | choice | not set | Pseudo-time integration scheme: euler = first-order explicit |
| `stage` | choice | not set | *euler / runge kutta / implicit euler only* · Has no effect under 'euler' (single-stage by construction). |
| `sub iterations` | int, > 0 | not set | *lu-sgs only* · Number of LU-SGS/DP-LUR sweeps per pseudo-time step |
| `over relaxation` | float, > 0.0 | not set | *lu-sgs only* · Diagonal over-relaxation factor for the LU-SGS/DP-LUR sweeps |
| `turbulence solver` | choice | not set | *lu-sgs / mf-gmres only* · Linear solver for the turbulence equations under LU-SGS. |
| `krylov subspace` | int, > 0 | not set | *mf-gmres only* · Restart length m. |
| `linear tolerance` | float, > 0.0 | not set | *mf-gmres only* · Relative residual drop required of the linear solve each implicit step |
| `max iterations` | int, > 0 | not set | *mf-gmres only* · Hard cap on total Krylov iterations (across restarts) per implicit step |
| `preconditioner` | choice | not set | *mf-gmres only* · 'block jacobi' inverts the exact analytic 5x5 block diagonal. |
| `preconditioner sweeps` | int, > 0 | not set | *mf-gmres only* · Symmetric Gauss-Seidel sweeps per preconditioner application (lu-sgs only) |
| `orthogonalisation` | choice | not set | *mf-gmres only* · How the Krylov basis is orthogonalised. |
| `preconditioner over relaxation` | float, > 0.0 | not set | *mf-gmres only* · Diagonal over-relaxation for the lu-sgs preconditioner sweeps. |
| `turbulence sweeps` | int, > 0 | not set | *mf-gmres only* · Sweeps for the point-implicit turbulence solve. |
| `flexible` | bool | not set | *mf-gmres only* · Use FGMRES instead of right-preconditioned GMRES. |
| `implicit relax` | float, 0.1 to 1.0 | `0.5` | *coupled / simple only* · Under-relaxation factor (alpha_u) on the implicit momentum, pressure and energy updates |
| `turbulence relax` | float, > 0 and <= 1.0 | `0.5` | *coupled / simple only* · Under-relaxation factor on the turbulence transport update. |
| `pin pressure` | bool | not set | *coupled / simple only* · Pin the pressure at a reference cell with a large diagonal instead of the default constant-null-space + mean-removal gauge fix. |
| `pressure relax` | float, > 0.0 and <= 1.0 | not set | *simple only* · Explicit pressure under-relaxation factor (alpha_p) for p += alpha_p * p'. |
| `pressure regularisation` | float, >= 0.0 | not set | *simple only* · Diagonal regularisation (diag += beta*\|diag\|) of the pressure-correction Poisson operator. |
| `pressure correction limit` | float, > 0.0 | not set | *simple only* · Limit factor applied to the pressure correction |

::: {.deck title="scheme"}
```python
parameters = {
    "solver": {
        "convergence control": {
            "scheme": {
                "name": <choice>,
                "stage": <choice>,
                "sub iterations": <int>,
                "over relaxation": <float>,
                "turbulence solver": <choice>,
                "krylov subspace": <int>,
                "linear tolerance": <float>,
                "max iterations": <int>,
                "preconditioner": <choice>,
                "preconditioner sweeps": <int>,
                "orthogonalisation": <choice>,
                "preconditioner over relaxation": <float>,
                "turbulence sweeps": <int>,
                "flexible": <bool>,
                "implicit relax": 0.5,
                "turbulence relax": 0.5,
                "pin pressure": <bool>,
                "pressure relax": <float>,
                "pressure regularisation": <float>,
                "pressure correction limit": <float>,
            },
            ...
        },
        ...
    },
    ...
}
```
:::

## name

Pseudo-time integration scheme: euler = first-order explicit

::: facts
**Type** choice · **Default** not set
:::

| Value | What it does | When to use it |
| --- | --- | --- |
| `euler` *compressible only* | Explicit forward Euler in pseudo-time: one residual evaluation and update per cycle. | The `"euler"` scheme has a single stage and is the safest option for new or problematic cases. |
| `runge kutta` *compressible only* | Explicit multistage Runge-Kutta in pseudo-time. `stage` selects the number of stages and their coefficients. |  |
| `implicit euler` *compressible only* | The default implicit scheme, solving the full linearised system with the Petsc or AMGX linear solver each pseudo-time step. |  |
| `lu-sgs` *compressible only* | A matrix-free, point-implicit LU-SGS/DP-LUR scheme. It avoids assembling and inverting the full linear system, trading some convergence rate for lower memory use and, often, faster wall-clock time per cycle than `"implicit euler"`. |  |
| `mf-gmres` *compressible only* | Restarted GMRES that applies the exact analytic flux Jacobian matrix-free, with no assembled mean-flow matrix. | Not available with the SAS turbulence model or the SAS hybrid. |
| `coupled` *incompressible only* | Solves a single block-4 [u,v,w,p] system per pseudo-time step. |  |
| `simple` *incompressible only* | Uses a segregated SIMPLE momentum predictor followed by a pressure correction. |  |

Guidance: [Choosing a time-marching scheme › name](/guide/choosing/choosing-a-time-marching-scheme#name)

## stage

Has no effect under 'euler' (single-stage by construction). Accepted for backward compatibility with decks that carry this key as boilerplate; prefer omitting it.

::: facts
**Type** choice · **Default** not set
:::

| Value | What it does |
| --- | --- |
| `1` | Under `runge kutta`, a single stage, the same update as `euler`. Other schemes ignore `stage`. |
| `3` | Under `runge kutta`, the three-stage TVD Runge-Kutta (SSP-RK3). Other schemes ignore `stage`. |
| `4` | Under `runge kutta`, a four-stage scheme with stage coefficients 1/4, 1/2, 0.55 and 1. Other schemes ignore `stage`. |
| `5` | Under `runge kutta`, a five-stage scheme with stage coefficients 0.0695, 0.1602, 0.2898, 0.506 and 1. Other schemes ignore `stage`. |
| `rk third order tvd` | The same as `3`. |

## turbulence solver

Linear solver for the turbulence equations under LU-SGS. 'amg' keeps the assembled AMG solve; 'point-implicit' uses the matrix-free sweep. The C++ default when unset is 'point-implicit'.

::: facts
**Type** choice · **Default** not set
:::

| Value | What it does |
| --- | --- |
| `amg` | Keeps the assembled AMG solve for the turbulence equations. |
| `point-implicit` | Uses the matrix-free sweep instead. |

## krylov subspace

Restart length m. The solver stores m+1 Krylov vectors, or 2m+1 with flexible, so this is the dominant storage cost; size it from the observed iteration count rather than padding it.

::: facts
**Type** int, > 0 · **Default** not set
:::

Guidance: [Choosing a time-marching scheme › mf-gmres](/guide/choosing/choosing-a-time-marching-scheme#mf-gmres)

## preconditioner

'block jacobi' inverts the exact analytic 5x5 block diagonal. 'lu-sgs' uses linearised symmetric Gauss-Seidel sweeps. 'lu-sgs nonlinear' uses the stock unlinearised sweep and REQUIRES flexible=true, since it is not a linear operator and plain GMRES cannot converge with it.

::: facts
**Type** choice · **Default** not set · **Applies when** flexible is True
:::

| Value | What it does | When to use it |
| --- | --- | --- |
| `block jacobi` | Inverts the exact analytic 5x5 block diagonal. The same operator on the host and on a GPU. |  |
| `lu-sgs` | Linearised symmetric Gauss-Seidel sweeps. |  |
| `lu-sgs nonlinear` | The unlinearised LU-SGS sweep. | Requires `flexible: True`: the sweep is not a linear operator, and plain GMRES cannot converge with it. |
| `none` | No preconditioner. |  |

Guidance: [Choosing a time-marching scheme › mf-gmres](/guide/choosing/choosing-a-time-marching-scheme#mf-gmres)

## orthogonalisation

How the Krylov basis is orthogonalised. 'mgs' (default) is modified Gram-Schmidt, matching AMGX's gmres/fgmres and so directly comparable with the implicit euler benchmark. 'cgs2' is classical Gram-Schmidt with one reorthogonalisation pass and batched reductions: it reduces the reduction round trips per restart cycle from O(m^2) to O(m) at the cost of twice the vector work, which is only expected to pay at high rank counts where each reduction is a real collective.

::: facts
**Type** choice · **Default** not set
:::

| Value | What it does | When to use it |
| --- | --- | --- |
| `mgs` | Modified Gram-Schmidt. | The default. |
| `cgs2` | Classical Gram-Schmidt with one reorthogonalisation pass and batched reductions: fewer reductions per restart cycle, at twice the vector work. | Only expected to pay at high rank counts, where each reduction is a real collective. |

## preconditioner over relaxation

Diagonal over-relaxation for the lu-sgs preconditioner sweeps. Named separately from the lu-sgs solver's own 'over relaxation' because here it tunes a PRECONDITIONER, not the solve.

::: facts
**Type** float, > 0.0 · **Default** not set
:::

## turbulence sweeps

Sweeps for the point-implicit turbulence solve. Deliberately NOT called 'sub iterations': that name belongs to the lu-sgs solver, and confusing it with 'preconditioner sweeps' (which tunes the MEAN-FLOW preconditioner) would be easy.

::: facts
**Type** int, > 0 · **Default** not set
:::

## flexible

Use FGMRES instead of right-preconditioned GMRES. Permits a preconditioner that varies between iterations, at the cost of a second set of m Krylov vectors.

::: facts
**Type** bool · **Default** not set
:::

Guidance: [Choosing a time-marching scheme › mf-gmres](/guide/choosing/choosing-a-time-marching-scheme#mf-gmres)

## turbulence relax

Under-relaxation factor on the turbulence transport update. Has no effect without a turbulence model (laminar viscous, non-hybrid LES)

::: facts
**Type** float, > 0 and <= 1.0 · **Default** `0.5`
:::

## pin pressure

Pin the pressure at a reference cell with a large diagonal instead of the default constant-null-space + mean-removal gauge fix. Needed on a fully closed domain (no fixed-pressure boundary)

::: facts
**Type** bool · **Default** not set
:::

## pressure relax

Explicit pressure under-relaxation factor (alpha_p) for p += alpha_p * p'. The solver default is 0.3

::: facts
**Type** float, > 0.0 and <= 1.0 · **Default** not set
:::

## pressure regularisation

Diagonal regularisation (diag += beta*|diag|) of the pressure-correction Poisson operator. Vanishes at convergence, so the steady solution is unbiased

::: facts
**Type** float, >= 0.0 · **Default** not set
:::

