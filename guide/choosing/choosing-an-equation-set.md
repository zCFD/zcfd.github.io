---
title: Choosing an equation set
section: guide
group: Choosing…
order: 5
---

# Choosing an equation set

Which equations should the solver solve?

Choose the equation set from the physics. Each set adds terms to the one before it:

- `euler` solves the inviscid flow equations. There is no viscosity, and so no boundary layer and no turbulence.
- `viscous` solves the Navier–Stokes equations for laminar flow.
- `rans` solves the Reynolds-averaged Navier–Stokes equations, with transport equations that model the effect of
  turbulence on the mean flow.
- `les` solves the filtered Navier–Stokes equations. The energy-containing eddies are resolved on the mesh, and only
  the scales below the filter width are modelled.

Use `euler` where viscosity plays no part in the result, `viscous` for laminar flow, `rans` for turbulent flow whose
turbulence is modelled, and `les` where the energy-containing eddies must be resolved. To resolve eddies away from the
wall while keeping RANS near it, use `rans` with a hybrid model; see
[Choosing a turbulence model](choosing-a-turbulence-model.md#hybrid).

| `type`                  | Turbulence                      | Mesh near the wall                   | Solver                         |
| ----------------------- | ------------------------------- | ------------------------------------ | ------------------------------ |
| [`"euler"`](#euler)     | none; the flow is inviscid      | no boundary layer to resolve         | compressible only              |
| [`"viscous"`](#viscous) | none; the flow is laminar       | resolves the boundary layer          | compressible or incompressible |
| [`"rans"`](#rans)       | modelled by transport equations | set by the wall treatment            | compressible or incompressible |
| [`"les"`](#les)         | resolved above the filter width | fine enough to carry resolved eddies | compressible or incompressible |

## Equation sets {#equation-sets}

The `equations` block sits under `solver` and selects the equation set:

```python
parameters = {
  "config_version": 2,
  "solver": {
    "equations": {
      "type": "rans",
      "turbulence": {"model": "sst"},
    },
    # ... numerical_scheme, fluid_properties, reference_conditions, ...
  },
}
```

[`type`](/reference/solver/equations#type) is case-insensitive on input, so `"RANS"`, `"rans"` and `"Rans"` validate
alike; it is stored in lower case.

The choice between the compressible and the incompressible solver is a separate one, made by
`{"solver_settings": {"type": ...}}` with `"compressible"` or `"incompressible"`. Both solvers share the equation types
`"viscous"`, `"rans"` and `"les"`, and the incompressible solver accepts further keys alongside them (see
[Incompressible equation sets](#incompressible-viscous)). The incompressible solver has no Euler equation set.

### precondition {#precondition}

Low-speed Mach preconditioning modifies the pseudo-time system to restore good conditioning at low Mach number. It
therefore has meaning only where a pseudo-time loop exists, in steady runs and under dual time stepping. Global time
stepping has no pseudo-time loop to precondition, so [`precondition`](/reference/solver/equations#precondition) is
unavailable there. `False` is the default, and never conflicts with a time-marching choice.

## Euler {#euler}

The compressible Euler equations describe inviscid flow. They suit flows in which momentum greatly outweighs
viscosity, at very high speed for example. An Euler mesh need not resolve the boundary layer, and so generally has far
fewer cells than the corresponding viscous mesh.

Euler takes only the common `type` and `precondition` keys:

```python
parameters["solver"]["equations"] = {
    "type": "euler",
    "precondition": True,
}
```

## Viscous {#viscous}

The viscous equations describe flow that is viscous but laminar. The
[Reynolds number](http://en.wikipedia.org/wiki/Reynolds_number) of the flow determines whether it is turbulent.

A viscous mesh must resolve the boundary layer, and so is generally larger than an Euler mesh. On the same mesh a
viscous run is faster than a RANS run, since it solves fewer equations.

Compressible viscous flow takes only the common `type` and `precondition` keys:

```python
parameters["solver"]["equations"] = {
    "type": "viscous",
    "precondition": True,
}
```

## RANS {#rans}

The Reynolds-averaged Navier–Stokes equations, for fully turbulent flow.

Besides the common keys, `"rans"` requires the [`turbulence`](/reference/solver/equations#turbulence) dictionary,
which names the turbulence model and any hybrid RANS–LES model layered on it. The choice of model is set out in
[Choosing a turbulence model](choosing-a-turbulence-model.md).

```python
parameters["solver"]["equations"] = {
    "type": "rans",
    "precondition": True,
    "turbulence": {"model": "sst"},
}
```

## LES {#les}

Large eddy simulation resolves the energy-containing turbulent scales directly, and models only the sub-grid scales
below the mesh filter width. A non-hybrid LES run solves no additional transport equation for turbulence: the
sub-grid-scale model is a kernel inside the viscous solver. The `"les"` equation set is therefore handled by the same
solver path as `"viscous"`, with the sub-grid closure switched on.

The `turbulence` dictionary of `"les"` is optional, and selects the sub-grid model; see
[LES sub-grid models](choosing-a-turbulence-model.md#les). Leaving it out gives implicit LES, with no sub-grid model.

Hybrid RANS–LES methods carry a transport-equation RANS model beneath their LES branch, and are configured through
the [RANS](#rans) equation set, never through `"les"`.

```python
parameters["solver"]["equations"] = {
    "type": "les",
    "turbulence": {"les": "wale"},
}
```

## Incompressible equation sets {#incompressible-viscous}

With the incompressible solver, `{"solver_settings": {"type": "incompressible"}}`, the equation types `"viscous"`,
`"rans"` and `"les"` accept further keys beside `type` and `precondition`: the non-orthogonal correction, gradient
limiting and central blending, the energy equation, and the stratified-atmosphere settings, among them
[`base_state`](/reference/solver/equations#base-state) and
[`theta_perturbation`](/reference/solver/equations#theta-perturbation).

The pressure-velocity coupling scheme, its relaxation factors and the SIMPLE pressure settings belong to
`convergence_control`; see
[Incompressible convergence control](choosing-a-time-marching-scheme.md#incompressible-convergence-control).

```python
parameters["solver"] = {
    "solver_settings": {"type": "incompressible"},
    "equations": {
        "type": "viscous",
    },
    # ... numerical_scheme, fluid_properties, reference_conditions, ...
}
```

### Incompressible RANS {#incompressible-rans}

The incompressible RANS equations combine these keys with the `turbulence` dictionary of [RANS](#rans). The
incompressible solver solves the `sst` and `sa-neg` turbulence models only.

```python
parameters["solver"] = {
    "solver_settings": {"type": "incompressible"},
    "equations": {
        "type": "rans",
        "precondition": True,
        "turbulence": {"model": "sst"},
    },
    # ... numerical_scheme, fluid_properties, reference_conditions, ...
}
```

### Incompressible LES {#incompressible-les}

The incompressible LES equations combine these keys with the LES `turbulence` dictionary of [LES](#les):

```python
parameters["solver"] = {
    "solver_settings": {"type": "incompressible"},
    "equations": {
        "type": "les",
        "turbulence": {"les": "wale"},
    },
    # ... numerical_scheme, fluid_properties, reference_conditions, ...
}
```

## Reference entries

- [`type`](/reference/solver/equations#type) and [`precondition`](/reference/solver/equations#precondition)
- [`turbulence`](/reference/solver/equations#turbulence)
- [`base_state`](/reference/solver/equations#base-state) and
  [`theta_perturbation`](/reference/solver/equations#theta-perturbation)
