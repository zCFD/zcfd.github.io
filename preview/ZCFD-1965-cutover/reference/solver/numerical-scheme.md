---
title: numerical scheme
section: reference
---

# numerical scheme

Default compressible spatial numeric scheme


## order

Spatial order of accuracy

default second

| Value | What it does | When to use it |
| --- | --- | --- |
| `first` |  |  |
| `second` (default) |  |  |
| `euler_second` |  |  |
| `central` |  |  |

Guidance: [/guide/choosing/choosing-a-limiter#spatial-order-and-the-flux-scheme](/guide/choosing/choosing-a-limiter#spatial-order-and-the-flux-scheme)


## limiter

Slope limiter for higher-order schemes

default van albada

| Value | What it does | When to use it |
| --- | --- | --- |
| `van albada` (default) | Default. One-dimensional: $\psi = \max\left(0, \dfrac{2ab + \varepsilon^2}{a^2 + b^2 + \varepsilon^2}\right)$. Smooth, symmetric, bounded in $[0, 1]$. | The recommended general purpose choice. |
| `van leer` | One-dimensional: $\psi = \max\left(0, \dfrac{4ab + \varepsilon^2}{(a + b)^2 + \varepsilon^2}\right)$. Slightly more compressive than van Albada. |  |
| `symmetric ratio` | One-dimensional: $\psi = \max\left(0, \min\left(1, \dfrac{4\min\left(\sigma a, \sigma b\right) + \varepsilon}{\left\|a + b\right\| + \varepsilon}\right)\right)$ with $\sigma = \mathrm{sign}(a + b)$. The least dissipative of the three. |  |
| `none` | $\psi = 1$. Unlimited reconstruction: second order everywhere, but not monotonicity preserving. | Appropriate only for smooth flows with no shocks or strong gradients. |
| `barth jespersen` | Cell-based: $P(y) = \min(1, y)$. Barth & Jespersen (1989) as published. Bound preserving, but only $C^0$: the kink at $y = 1$ makes the limiter value flicker between cycles and can stall the residual. It has no smoothness deactivation, so it limits wherever the bound binds.  ::: {.warning}  `"barth jespersen"` is the multidimensional, cell-based Barth & Jespersen limiter. It is not the one-dimensional `"symmetric ratio"` function, which takes no minimum or maximum over the cell's neighbours. A deck whose results depend on the one-dimensional behaviour must set `"symmetric ratio"`; `"barth jespersen"` gives different results. See the [Unreleased](/release-notes/unreleased) release notes for when this changed.  ::: |  |
| `michalak gooch` | Cell-based: $P(y) = y - \tfrac{4}{27}y^3$ for $y < 3/2$, else 1. Michalak & Ollivier-Gooch. $C^1$, and $P(y) \leq \min(1,y)$, so never less monotonicity preserving than Barth-Jespersen. Deactivates in smooth flow via a grid-scaled threshold, so formal order survives refinement. | The recommended choice. |
| `venkatakrishnan` | Cell-based: $P(y) = \min\left(1, (y^2+2y)/(y^2+y+2)\right)$. Smooth, but exceeds 1 for $y > 2$, so it needs the clip, which reintroduces a $C^0$ kink at $y = 2$. | Provided as a familiar cross-check. |

Guidance: [/guide/choosing/choosing-a-limiter](/guide/choosing/choosing-a-limiter)


## limiter coefficient

K in the grid-scaled smoothness threshold eps^2 = (K h / reference_length)^3 used by the 'michalak gooch' and 'venkatakrishnan' cell-based limiters to deactivate limiting in smooth flow. Larger values treat more of the flow as smooth, so limit less. Ignored by the other limiters.

number · default 5 · >= 0.0


## first order cycles

Number of first-order cycles before switching to higher order

whole number · default 0 · >= 0


## freeze limiter cycle

Cycle at which to freeze the limiter (-1 = never freeze)

whole number · default -1

Guidance: [/guide/troubleshooting/troubleshooting#limiter-switching](/guide/troubleshooting/troubleshooting#limiter-switching)


## gradient

Gradient calculation method (green-gauss or least-squares)

default green-gauss

| Value | What it does | When to use it |
| --- | --- | --- |
| `green-gauss` (default) |  |  |
| `least-squares` |  |  |


## reconstruction

Reconstruction method for MUSCL-type schemes

default muscl

| Value | What it does | When to use it |
| --- | --- | --- |
| `muscl` (default) |  |  |
| `umuscl` |  |  |
| `lpumuscl` |  |  |


## permit backward difference during reconstruction

Allow backward difference stencils during MUSCL reconstruction

true or false · default False


## inviscid flux scheme

Inviscid flux calculation scheme

default roe

| Value | What it does | When to use it |
| --- | --- | --- |
| `roe` (default) |  |  |
| `hllc` |  |  |
| `roe low-diss` |  |  |
| `hllc low-diss` |  |  |
| `rusanov` |  |  |

Guidance: [/guide/choosing/choosing-a-limiter#spatial-order-and-the-flux-scheme](/guide/choosing/choosing-a-limiter#spatial-order-and-the-flux-scheme)


## linear gradients

Use an unweighted (linear) Green-Gauss gradient instead of the default inverse-distance-weighted one. Ignored when 'gradient' is 'least-squares' — the least-squares branch never reads the flag.

true or false · default False


## multigrid

Multigrid acceleration for explicit schemes

settings block · not set by default · 'multigrid' only applies when solver.time settings.kind is one of unset, 'dual time stepping' and solver.convergence control.scheme.name is one of unset, 'euler', 'runge kutta'

Guidance: [/guide/choosing/choosing-a-time-marching-scheme#multigrid](/guide/choosing/choosing-a-time-marching-scheme#multigrid)


### levels

Number of multigrid levels

whole number · required · 1 to 10

Guidance: [/guide/choosing/choosing-a-time-marching-scheme#multigrid](/guide/choosing/choosing-a-time-marching-scheme#multigrid)


### cycles

Number of multigrid cycles

whole number · default 100000000 · >= 1

Guidance: [/guide/choosing/choosing-a-time-marching-scheme#multigrid](/guide/choosing/choosing-a-time-marching-scheme#multigrid)


### multigrid ramp

Multigrid ramp function or dict

value · not set by default


### prolong factor

Prolongation factor

number · not set by default


### prolong transport factor

Prolongation factor for the turbulence/transport equations

number · not set by default


## preconditioner

Low Mach number preconditioner settings

settings block · not set by default · 'preconditioner' only applies when solver.equations.precondition is True


### minimum mach number

Cut-off Mach number for low-Mach preconditioning: floors the preconditioning reference velocity so it cannot collapse at a stagnation point. Overrides the Mach-dependent default.

number · required · > 0.0


## entropy fix

Entropy fix coefficient for Roe scheme (limits maximum dissipation)

number · default 0 · 0 to 0.2


## roe low dissipation sensor

Sensor type for Roe low-dissipation scheme

default NONE

| Value | What it does | When to use it |
| --- | --- | --- |
| `FD` |  |  |
| `NTS` |  |  |
| `DES` |  |  |
| `NONE` (default) |  |  |


## roe entropy fix coefficient

Roe entropy fix coefficient for low-dissipation scheme

number · default 0.001 · >= 0


## roe dissipation sensor minimum

Minimum value for Roe dissipation sensor (prevents excessive dissipation reduction)

number · not set by default · 0.05 to 1.0


## roe low dissipation sensor parameter

Field used to compute the Roe low-dissipation sensor

not set by default

| Value | What it does | When to use it |
| --- | --- | --- |
| `density` |  |  |
| `velocity` |  |  |
| `velocity divergence/vorticity` |  |  |


## viscous time step factor

Time step scaling for viscous terms

number · default 1 · > 0


## turbulence limiter

Treatment of invalid turbulence variables after the solution update: 'zero' clamps them to their floor, 'no update' reverts the cell's turbulence state (default when unset)

not set by default

| Value | What it does | When to use it |
| --- | --- | --- |
| `zero` |  |  |
| `no update` |  |  |


::: {.deck title="numerical scheme"}
```python
"numerical scheme": {
    ...
},
```
:::

