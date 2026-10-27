---
title: numerical scheme
section: reference
---

# numerical scheme

Default spatial numerical scheme for all meshes.

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `order` | choice | `second` | Spatial order of accuracy |
| `limiter` | choice | `van albada` | Slope limiter for higher-order schemes |
| `limiter coefficient` | float, >= 0.0 | `5` | K in the grid-scaled smoothness threshold eps^2 = (K h / reference_length)^3 used by the 'michalak gooch' and 'venkatakrishnan' cell-based limiters to deactivate limiting in smooth flow. |
| `first order cycles` | int, >= 0 | `0` | Number of first-order cycles before switching to higher order |
| `freeze limiter cycle` | int | `-1` | Cycle at which to freeze the limiter (-1 = never freeze) |
| `gradient` | choice | `green-gauss` | Gradient calculation method (green-gauss or least-squares) |
| `reconstruction` | choice | `muscl` | Reconstruction method for MUSCL-type schemes |
| `permit backward difference during reconstruction` | bool | `False` | Allow backward difference stencils during MUSCL reconstruction |
| `inviscid flux scheme` | choice | `roe` | Inviscid flux calculation scheme |
| `linear gradients` | bool | `False` | *compressible only* · Use an unweighted (linear) Green-Gauss gradient instead of the default inverse-distance-weighted one. |
| [`multigrid`](/reference/solver/numerical-scheme/multigrid) | settings block |  | *compressible only* · Multigrid acceleration for explicit schemes |
| [`preconditioner`](/reference/solver/numerical-scheme/preconditioner) | settings block |  | *compressible only* · Low Mach number preconditioner settings |
| `entropy fix` | float, 0 to 0.2 | `0` | *compressible only* · Entropy fix coefficient for Roe scheme (limits maximum dissipation) |
| `roe low dissipation sensor` | choice | `NONE` | *compressible only* · Sensor type for Roe low-dissipation scheme |
| `roe entropy fix coefficient` | float, >= 0 | `0.001` | *compressible only* · Roe entropy fix coefficient for low-dissipation scheme |
| `roe dissipation sensor minimum` | float, 0.05 to 1.0 | not set | *compressible only* · Minimum value for Roe dissipation sensor (prevents excessive dissipation reduction) |
| `roe low dissipation sensor parameter` | choice | not set | *compressible only* · Field used to compute the Roe low-dissipation sensor |
| `viscous time step factor` | float, > 0 | `1` | *viscous / rans / les only* · Time step scaling for viscous terms |
| `turbulence limiter` | choice | not set | *rans only* · Treatment of invalid turbulence variables after the solution update: 'zero' clamps them to their floor, 'no update' reverts the cell's turbulence state (default when unset) |

::: {.deck title="numerical scheme"}
```python
parameters = {
    "solver": {
        "numerical scheme": {
            "order": "second",
            "limiter": "van albada",
            "limiter coefficient": 5.0,
            "first order cycles": 0,
            "freeze limiter cycle": -1,
            "gradient": "green-gauss",
            "reconstruction": "muscl",
            "permit backward difference during reconstruction": False,
            "inviscid flux scheme": "roe",
            "linear gradients": False,
            "multigrid": {...},
            "preconditioner": {...},
            "entropy fix": 0.0,
            "roe low dissipation sensor": "NONE",
            "roe entropy fix coefficient": 0.001,
            "roe dissipation sensor minimum": <float>,
            "roe low dissipation sensor parameter": <choice>,
            "viscous time step factor": 1.0,
            "turbulence limiter": <choice>,
        },
        ...
    },
    ...
}
```
:::

## order

Spatial order of accuracy

::: facts
**Type** choice · **Default** `second`
:::

| Value | What it does | When to use it |
| --- | --- | --- |
| `first` | First-order upwind: face values are the upwind cell values, with no reconstruction. |  |
| `second` (default) | Second order. The compressible solver reconstructs every variable to the face with the limited scheme set by `reconstruction`; the incompressible solver uses linear-upwind interpolation for momentum. | The default. |
| `euler_second` | The compressible solver reconstructs the mean-flow variables to second order and keeps the turbulence variables first order. The incompressible solver blends 75% linear and 25% linear-upwind interpolation for momentum. |  |
| `central` *incompressible only* | Incompressible solver only. Momentum is interpolated by central differencing blended with linear-upwind, in the proportion set by `central_blend`. |  |

Guidance: [Choosing a spatial scheme › Spatial order](/guide/choosing/choosing-a-spatial-scheme#spatial-order)

## limiter

Slope limiter for higher-order schemes

::: facts
**Type** choice · **Default** `van albada`
:::

| Value | What it does | When to use it |
| --- | --- | --- |
| `van albada` (default) | Default. One-dimensional: $\psi = \max\left(0, \dfrac{2ab + \varepsilon^2}{a^2 + b^2 + \varepsilon^2}\right)$. Smooth, symmetric, bounded in $[0, 1]$. | The recommended general purpose choice. |
| `van leer` | One-dimensional: $\psi = \max\left(0, \dfrac{4ab + \varepsilon^2}{(a + b)^2 + \varepsilon^2}\right)$. Slightly more compressive than van Albada. |  |
| `symmetric ratio` | One-dimensional: $\psi = \max\left(0, \min\left(1, \dfrac{4\min\left(\sigma a, \sigma b\right) + \varepsilon}{\left\|a + b\right\| + \varepsilon}\right)\right)$ with $\sigma = \mathrm{sign}(a + b)$. The least dissipative of the three. |  |
| `none` | $\psi = 1$. Unlimited reconstruction: second order everywhere, but not monotonicity preserving. | Appropriate only for smooth flows with no shocks or strong gradients. |
| `barth jespersen` | Cell-based: $P(y) = \min(1, y)$. Barth & Jespersen (1989) as published. Bound preserving, but only $C^0$: the kink at $y = 1$ makes the limiter value flicker between cycles and can stall the residual. It has no smoothness deactivation, so it limits wherever the bound binds.  ::: {.warning}  `"barth jespersen"` is the multidimensional, cell-based Barth & Jespersen limiter. It is not the one-dimensional `"symmetric ratio"` function, which takes no minimum or maximum over the cell's neighbours. A deck whose results depend on the one-dimensional behaviour must set `"symmetric ratio"`; `"barth jespersen"` gives different results. See the [Unreleased](/release-notes/unreleased) release notes for when this changed.  ::: |  |
| `michalak gooch` | Cell-based: $P(y) = y - \tfrac{4}{27}y^3$ for $y < 3/2$, else 1. Michalak & Ollivier-Gooch. $C^1$, and $P(y) \leq \min(1,y)$, so never less monotonicity preserving than Barth-Jespersen. Deactivates in smooth flow via a grid-scaled threshold, so formal order survives refinement. | The recommended choice. |
| `venkatakrishnan` | Cell-based: $P(y) = \min\left(1, (y^2+2y)/(y^2+y+2)\right)$. Smooth, but exceeds 1 for $y > 2$, so it needs the clip, which reintroduces a $C^0$ kink at $y = 2$. | Provided as a familiar cross-check. |

Guidance: [Choosing a limiter](/guide/choosing/choosing-a-limiter)

## limiter coefficient

K in the grid-scaled smoothness threshold eps^2 = (K h / reference_length)^3 used by the 'michalak gooch' and 'venkatakrishnan' cell-based limiters to deactivate limiting in smooth flow. Larger values treat more of the flow as smooth, so limit less. Ignored by the other limiters.

::: facts
**Type** float, >= 0.0 · **Default** `5`
:::

## freeze limiter cycle

Cycle at which to freeze the limiter (-1 = never freeze)

::: facts
**Type** int · **Default** `-1`
:::

Guidance: [Troubleshooting › Limiter switching](/guide/troubleshooting/troubleshooting#limiter-switching)

## gradient

Gradient calculation method (green-gauss or least-squares)

::: facts
**Type** choice · **Default** `green-gauss`
:::

| Value | What it does | When to use it |
| --- | --- | --- |
| `green-gauss` (default) | Green-Gauss gradients from face values interpolated by inverse distance, or by a plain average when `linear_gradients` is set. | The default. |
| `least-squares` | A least-squares fit to the differences between each cell and its face neighbours, weighted by face area. |  |

## reconstruction

Reconstruction method for MUSCL-type schemes

::: facts
**Type** choice · **Default** `muscl`
:::

| Value | What it does | When to use it |
| --- | --- | --- |
| `muscl` (default) | The MUSCL $\kappa$-scheme with $\kappa = 1/3$, blending the limited cell-gradient extrapolation with the central difference across the face. | The default. |
| `umuscl` | The unstructured MUSCL of Burg, $u_f = u_L + (1-\kappa)\,\mathbf{r}\cdot\nabla u_L + \tfrac{\kappa}{2}(u_R - u_L)$ with $\kappa = 1/3$, scaled by the limiter. |  |
| `lpumuscl` | Accepted, but the solver currently treats it as `muscl`. |  |

## inviscid flux scheme

Inviscid flux calculation scheme

::: facts
**Type** choice · **Default** `roe`
:::

| Value | What it does | When to use it |
| --- | --- | --- |
| `roe` (default) | Roe's approximate Riemann solver. `entropy_fix` floors each wave speed at that fraction of the largest. Read by the compressible solver only. | The default. |
| `hllc` | The HLLC approximate Riemann solver, which restores the contact wave missing from HLL. |  |
| `roe low-diss` | The Roe flux with its upwind dissipation scaled by a factor between `roe_dissipation_sensor_minimum` and 1, set per face by `roe_low_dissipation_sensor`. | Scale-resolving simulations, where full upwind dissipation would damp the resolved turbulence. With the sensor `NONE` it is the same as `roe`. |
| `hllc low-diss` | The HLLC flux with its dissipation scaled in the same way as `roe low-diss`. |  |
| `rusanov` | The Rusanov (local Lax-Friedrichs) flux, which scales the dissipation by the largest local wave speed. | The most dissipative of the schemes. |

Guidance: [Choosing a spatial scheme › Inviscid flux scheme](/guide/choosing/choosing-a-spatial-scheme#choosing-the-flux-scheme)

## linear gradients

Use an unweighted (linear) Green-Gauss gradient instead of the default inverse-distance-weighted one. Ignored when 'gradient' is 'least-squares' — the least-squares branch never reads the flag.

::: facts
**Type** bool · **Default** `False`
:::

## roe low dissipation sensor

Sensor type for Roe low-dissipation scheme

::: facts
**Type** choice · **Default** `NONE`
:::

| Value | What it does | When to use it |
| --- | --- | --- |
| `FD` | Scales the dissipation by $1 - f_d$, where $f_d$ is the DDES shielding function of the turbulence model: full dissipation in RANS regions, the minimum in LES regions. Faces the shock sensor flags keep full dissipation. | With a DES-family hybrid. Without a RANS turbulence model every cell is treated as LES. |
| `NTS` | The blending function of Xiao et al. (2012), built from vorticity, strain rate, the turbulent length scale and the cell size, and combined with the shock sensor. |  |
| `DES` | Scales the dissipation by the turbulence model's length-scale ratio, capped at 1, which is near 0 in LES regions and 1 in RANS regions. Faces the shock sensor flags keep full dissipation. | With a DES-family hybrid. Without a RANS turbulence model every cell is treated as LES. |
| `NONE` (default) | No scaling: the low-dissipation fluxes apply full upwind dissipation. | The default. |

## roe low dissipation sensor parameter

Field used to compute the Roe low-dissipation sensor

::: facts
**Type** choice · **Default** not set
:::

| Value | What it does | When to use it |
| --- | --- | --- |
| `density` | The shock sensor is the normalised density jump between each cell and its face neighbours. | The default when unset. |
| `velocity` | The shock sensor is the Ducros ratio $\|\nabla\cdot\mathbf{u}\| / (\|\nabla\cdot\mathbf{u}\| + \|\boldsymbol{\omega}\|)$. |  |
| `velocity divergence/vorticity` | The same as `velocity`. |  |

## turbulence limiter

Treatment of invalid turbulence variables after the solution update: 'zero' clamps them to their floor, 'no update' reverts the cell's turbulence state (default when unset)

::: facts
**Type** choice · **Default** not set
:::

| Value | What it does | When to use it |
| --- | --- | --- |
| `zero` | When an update leaves a cell's turbulence variables invalid, they are clipped to their lower limits. |  |
| `no update` | When an update leaves a cell's turbulence variables invalid, the cell keeps its turbulence values from before the update. | The default when unset. |

