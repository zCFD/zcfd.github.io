---
title: fsi
section: reference
---

# fsi

Fluid-structure interaction model that couples this wall's motion to a structural solve.

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `support radius` | float, > 0 | `1` | RBF support radius, also the mode-shape deformation scale used when normalising mode shapes for morphing |
| `fixed zones` | list of int | not set | Zones held in place while the moving zones deform. |
| `basis` | choice | `c2` | *modal_model, rbf_multiscale / generic_fsi only* · RBF function type |
| `base point fraction` | float | required | *modal_model, rbf_multiscale / generic_fsi only* · Fraction of points to use as base points |
| `file format` | choice | required | *modal_model only* · Structural file format |
| `nastran casename` | str | required | *modal_model only* · Nastran case name (without extension) |
| `scale` | list of float | not set | *modal_model only* · Scaling factors [x, y, z] |
| `mode mapping max distance` | float | required | *modal_model only* · Max distance for mode mapping |
| `mode mapping power` | float, > 0 | `1` | *modal_model only* · Inverse-distance power for mapping mode shapes to the surface |
| `mode mapping pure idw` | bool | `True` | *modal_model only* · Use pure inverse-distance weighting for the mode mapping |
| `mode mapping n nearest` | int, >= 1 | `4` | *modal_model only* · Number of nearest structural points used per surface point |
| `recalculate rbfs alpha fraction` | float, >= 0.0 | `0` | *modal_model only* · Deformation fraction of the RBF support radius at which the base-point set is rebuilt; 0 never rebuilds it |
| `newmark alpha` | float | `0.25` | *modal_model only* · Newmark integrator alpha parameter |
| `newmark delta` | float | `0.5` | *modal_model only* · Newmark integrator delta parameter |
| `update frequency` | int, >= 1 | `1` | *modal_model only* · Cycles between structural updates: the modes are marched and the mesh deformed once every this many solver cycles. |
| `fluid force scaling` | float | required | *modal_model only* · Scaling factor for fluid forces |
| `mode list` | list of int | required | *modal_model only* · List of modes to include |
| `modal damping` | list of float | required | *modal_model only* · Damping factors for each mode |
| [`harmonic initial state`](/reference/model/boundary-conditions/wall/fsi/harmonic-initial-state) | settings block |  | *modal_model only* · Starts every mode on its harmonic response to a point force, instead of at rest |
| `type` | choice | not set | The structural coupling: `modal_model` uses the built-in Nastran modal model, `generic_fsi` couples to an external structural solver. |
| `transform type` | choice | not set | Mesh deformation transform used for the coupling |
| `power` | float or list of float | required | *modal_model, idw / generic_fsi only* · Power parameters for IDW |
| `stencil size` | int, >= 1 | not set | *idw only* · Maximum stencil size (number of nearest neighbors) |
| `n nearest` | int, >= 1 | `100` | *modal_model, idw / generic_fsi only* · Number of nearest points for IDW |
| `deformation distance` | float, > 0 | `1` | *modal_model, idw / generic_fsi only* · Maximum deformation distance |
| `blending stiffness` | float, 0 to 1 | `0.5` | *modal_model, idw / generic_fsi only* · Blending stiffness parameter |
| `zone` | list of zone ids | required | *generic_fsi only* · Zone IDs coupled to the external solver |
| `tol` | float | `0.01` | *generic_fsi only* · RBF solve tolerance |
| `max error` | float | `0.1` | *generic_fsi only* · Maximum allowed RBF interpolation error |
| `user variables` | settings block | not set | *generic_fsi only* · Arbitrary variables passed to the external coupling solver (genuinely open-ended — not enumerable). |

::: {.deck title="fsi"}
```python
parameters = {
    "model": {
        "<mesh>": {
            "boundary conditions": {
                "<name>": {
                    "fsi": {
                        "support radius": 1.0,
                        "fixed zones": [...],
                        "basis": "c2",
                        "base point fraction": <float>,
                        "file format": <choice>,
                        "nastran casename": <str>,
                        "scale": [...],
                        "mode mapping max distance": <float>,
                        "mode mapping power": 1.0,
                        "mode mapping pure idw": True,
                        "mode mapping n nearest": 4,
                        "recalculate rbfs alpha fraction": 0.0,
                        "newmark alpha": 0.25,
                        "newmark delta": 0.5,
                        "update frequency": 1,
                        "fluid force scaling": <float>,
                        "mode list": [...],
                        "modal damping": [...],
                        "harmonic initial state": {...},
                        "type": <choice>,
                        "transform type": <choice>,
                        "power": <float or list of float>,
                        "stencil size": <int>,
                        "n nearest": 100,
                        "deformation distance": 1.0,
                        "blending stiffness": 0.5,
                        "zone": [...],
                        "tol": 0.01,
                        "max error": 0.1,
                        "user variables": {...},
                    },
                    ...
                },
            },
            ...
        },
    },
    ...
}
```
:::

## support radius

RBF support radius, also the mode-shape deformation scale used when normalising mode shapes for morphing

::: facts
**Type** float, > 0 · **Default** `1`
:::

Guidance: [Fluid–structure interaction › Interpolation method](/guide/working-with/fluid-structure-interaction#interpolation-method)

## basis

RBF function type

::: facts
**Type** choice · **Default** `c2`
:::

| Value | What it does | When to use it |
| --- | --- | --- |
| `tps` | A thin-plate spline in the distance scaled by `support_radius`; it is never zero, so the system is dense. | Small surfaces where a global, smooth deformation is wanted. |
| `thin_plate_spline` *rbf_multiscale only* | Not implemented under this name; the run stops with an unknown-basis error. | Never; the thin-plate spline is `tps`. |
| `multiquadric` *rbf_multiscale only* | Not implemented; the run stops with an unknown-basis error. | Never; use `c2`. |
| `inverse_multiquadric` *rbf_multiscale only* | Not implemented; the run stops with an unknown-basis error. | Never; use `c2`. |
| `gaussian` | A Gaussian whose width is `support_radius`; it is never zero, so every pair of points interacts and the system is dense. | Small surfaces only, as the dense system grows with the square of the number of points. |
| `linear` *rbf_multiscale only* | Not implemented; the run stops with an unknown-basis error. | Never; use `c2`. |
| `cubic` *rbf_multiscale only* | Not implemented; the run stops with an unknown-basis error. | Never; use `c2`. |
| `quintic` *rbf_multiscale only* | Not implemented; the run stops with an unknown-basis error. | Never; use `c2`. |
| `c0` | A Wendland C0 function that is zero beyond `support_radius`; the deformation is continuous but its slope is not. | Rarely; `c2` gives a smoother deformation with the same sparsity. |
| `c2` (default) | A Wendland C2 function that is zero beyond `support_radius`, so only nearby points interact and the system is sparse. | The default, and the appropriate choice for most cases. |
| `c4` | Selects a Wendland C4 function, but the matrix assembly and the volume deformation evaluate `c2`, so the interpolation is inconsistent. | Not at present; use `c2`. |
| `c6` *rbf_multiscale only* | Not implemented; the run stops with an unknown-basis error. | Never; use `c2`. |

Guidance: [Fluid–structure interaction › Interpolation method](/guide/working-with/fluid-structure-interaction#interpolation-method)

## base point fraction

Fraction of points to use as base points

::: facts
**Type** float · **Required** yes
:::

Guidance: [Fluid–structure interaction › Interpolation method](/guide/working-with/fluid-structure-interaction#interpolation-method)

## file format

Structural file format

::: facts
**Type** choice · **Required** yes
:::

| Value | What it does | When to use it |
| --- | --- | --- |
| `nastran` | Reads the structural grid from `<nastran_casename>.bdf` and the mode shapes and frequencies from `<nastran_casename>.op2`. | Always; it is the only format supported. |

Guidance: [Fluid–structure interaction › Modal model](/guide/working-with/fluid-structure-interaction#modal-model)

## update frequency

Cycles between structural updates: the modes are marched and the mesh deformed once every this many solver cycles. With several modal models the smallest value applies to all of them.

::: facts
**Type** int, >= 1 · **Default** `1`
:::

## type

The structural coupling: `modal_model` uses the built-in Nastran modal model, `generic_fsi` couples to an external structural solver.

::: facts
**Type** choice · **Default** not set · **Applies when** zones is not []
:::

| Value | What it does |
| --- | --- |
| `modal_model` | Selects the built-in Nastran modal-model coupling. |
| `generic_fsi` | Selects the generic external-solver coupling. |

Guidance: [Fluid–structure interaction › Modal model](/guide/working-with/fluid-structure-interaction#modal-model)

## transform type

Mesh deformation transform used for the coupling

::: facts
**Type** choice · **Default** not set
:::

| Value | What it does | When to use it |
| --- | --- | --- |
| `rbf_multiscale` | Deforms the volume mesh using the multiscale RBF scheme. |  |
| `idw` | Deforms the volume mesh using inverse distance weighting. |  |
| `rbf` | Deforms the volume mesh with a single-level RBF, adding surface points one at a time, worst-interpolated first, until each is within `tol`. | Where an error-controlled choice of points is preferred to the fixed `base_point_fraction` of `rbf_multiscale`. |

Guidance: [Fluid–structure interaction › RBF multiscale transform](/guide/working-with/fluid-structure-interaction#rbf-multiscale-transform)

## power

Power parameters for IDW

::: facts
**Type** float or list of float · **Required** yes
:::

Guidance: [Fluid–structure interaction › Interpolation method](/guide/working-with/fluid-structure-interaction#interpolation-method)

