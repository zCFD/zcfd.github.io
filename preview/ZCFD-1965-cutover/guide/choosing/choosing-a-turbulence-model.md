---
title: Choosing a turbulence model
section: guide
group: Choosing…
order: 10
---

# Choosing a turbulence model

Which equation set should the solver solve, and which turbulence model should close it?

Choose the equation set from the physics first. Use `euler` where viscosity plays no part in the result, `viscous`
for laminar flow, `rans` for turbulent flow whose turbulence is modelled, and `les` where the energy-containing eddies
must be resolved. For `rans`, name the turbulence `model`; to resolve eddies away from the wall while keeping RANS near
it, add a `hybrid` on top of that model rather than choosing `les`.

| Equation set | Turbulence                      | Mesh near the wall                   | Compressible            | Incompressible                         |
| ------------ | ------------------------------- | ------------------------------------ | ----------------------- | -------------------------------------- |
| Euler        | none; the flow is inviscid      | no boundary layer to resolve         | [`"euler"`](#euler)     | —                                      |
| Viscous      | none; the flow is laminar       | resolves the boundary layer          | [`"viscous"`](#viscous) | [`"viscous"`](#incompressible-viscous) |
| RANS         | modelled by transport equations | set by the wall treatment            | [`"rans"`](#rans)       | [`"rans"`](#incompressible-rans)       |
| LES          | resolved above the filter width | fine enough to carry resolved eddies | [`"les"`](#les)         | [`"les"`](#incompressible-les)         |

The RANS turbulence models, selected by [`model`](/reference/solver/equations#turbulence-model):

| `model`            | Model                                                                |
| ------------------ | -------------------------------------------------------------------- |
| `sst`              | Menter shear stress transport k-ω                                    |
| `spalart-allmaras` | Spalart–Allmaras                                                     |
| `sa-neg`           | negative Spalart–Allmaras                                            |
| `sst-transition`   | Langtry–Menter four-equation transitional SST ($\gamma$–$Re_\theta$) |
| `sas`              | scale-adaptive simulation, run as a standalone RANS model            |

A [`hybrid`](/reference/solver/equations#turbulence-hybrid) of `DES`, `DDES`, `IDDES` or `SAS` layers an LES branch on
the chosen model.

## Equation sets

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
`"viscous"`, `"rans"` and `"les"`, and the incompressible solver accepts a few further keys alongside them (see
[Incompressible viscous](#incompressible-viscous)). The exception is `"euler"`: the incompressible solver has no Euler
equation set, since inviscid incompressible flow without a pressure-velocity coupling mechanism is not a physically
meaningful system to solve.

### precondition

Low-speed Mach preconditioning modifies the pseudo-time system to restore good conditioning at low Mach number. It
therefore has meaning only where a pseudo-time loop exists, in steady runs and under dual time stepping. Global time
stepping has no pseudo-time loop to precondition, so [`precondition`](/reference/solver/equations#precondition) is not
available there. `False` is always inert and never conflicts with a time-marching choice.

## Euler

The compressible Euler equations describe inviscid flow: there is no viscosity, and so no turbulence. They suit flows
in which momentum greatly outweighs viscosity, at very high speed for example. An Euler mesh need not resolve the
boundary layer, and so generally has far fewer cells than the corresponding viscous mesh.

Euler takes only the common `type` and `precondition` keys:

```python
parameters["solver"]["equations"] = {
    "type": "euler",
    "precondition": True,
}
```

## Viscous

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

## Incompressible viscous

With the incompressible solver, `{"solver_settings": {"type": "incompressible"}}`, the equation types `"viscous"`,
`"rans"` and `"les"` accept further keys beside `type` and `precondition`: the non-orthogonal correction and gradient
limiting, the energy equation, and the stratified-atmosphere [`base_state`](/reference/solver/equations#base-state) and
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

## RANS

The Reynolds-averaged Navier–Stokes equations, for fully turbulent flow.

Besides the common keys, `"rans"` requires the [`turbulence`](/reference/solver/equations#turbulence) dictionary. Its
[`model`](/reference/solver/equations#turbulence-model) selects the RANS turbulence model, and
[`hybrid`](/reference/solver/equations#turbulence-hybrid) the hybrid RANS–LES model layered on it. Leave `hybrid` out
to solve pure RANS.

```python
parameters["solver"]["equations"] = {
    "type": "rans",
    "precondition": True,
    "turbulence": {
        "model": "sa-neg",
        "hybrid": "IDDES",
    },
}
```

```python
parameters["solver"]["equations"] = {
    "type": "rans",
    "precondition": True,
    "turbulence": {
        "model": "sst",
        "rotation_correction": False,
        "limit_gradient_k": 0.5,
        "qcr": 2020,
    },
}
```

### qcr

[`qcr`](/reference/solver/equations#turbulence-qcr) adds the non-linear quadratic constitutive relation (QCR) to the
turbulent stress, for both SST and SA-neg. QCR has been shown to improve the prediction of separated corner flows,
particularly on highly loaded wings. Three versions are available:
[QCR 2000](<https://doi.org/10.1016/S0142-727X(00)00007-2>), [QCR 2020](https://doi.org/10.2514/1.J059683) and
[QCR 2021](https://doi.org/10.1017/aer.2021.42).

### production

[`production`](/reference/solver/equations#turbulence-production) selects the production term of the SST model:
`"vorticity"` (SST-V), `"strain-incompressible"`, `"strain-compressible"` or `"kato-launder"`. The integers 0 to 3 are
also accepted, and stand for the same four names in that order. Left out, the model chooses for itself: `kato-launder`
for `sst-transition` and `vorticity` otherwise.

### Advanced parameters for turbulence models

The constants in the `turbulence` dictionary tune the turbulence models: `betastar`, `cdes_kw`, `cdes_keps`, `cd1`,
`cd2`, `cw`, `a1`, `cdes`, `ca1`, `ca2`, `ce1`, `ce2`, `cthetat`, `sigmagamma`, `sigmathetat` and
`separation_correction`. They are advanced settings, and should not normally need adjusting.

## Incompressible RANS

The incompressible RANS equations combine the [incompressible viscous](#incompressible-viscous) keys with the
`turbulence` dictionary of [RANS](#rans):

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

## LES

Large eddy simulation resolves the energy-containing turbulent scales directly, and models only the sub-grid scales
below the mesh filter width. A non-hybrid LES run solves no additional transport equation for turbulence: the
sub-grid-scale model is a kernel inside the viscous solver. The `"les"` equation set is therefore handled by the same
solver path as `"viscous"`, with the sub-grid closure switched on.

Hybrid RANS–LES methods are different, since they carry a transport-equation RANS model beneath their LES branch;
SST-IDDES, for example, still solves the SST k and ω equations. They are configured through the [RANS](#rans)
equation set, with `{"turbulence": {"hybrid": ...}}` set to `"DES"`, `"DDES"`, `"IDDES"` or `"SAS"` alongside
`model`, and never through `"les"`.

The [`turbulence`](/reference/solver/equations#turbulence) dictionary of the `"les"` equation set is a much smaller,
LES-specific one. Its [`les`](/reference/solver/equations#turbulence-les) key selects the sub-grid model, and it is
unrelated to the RANS `turbulence` dictionary above. The whole dictionary is optional: leaving it out gives implicit
LES, with no sub-grid model.

```python
parameters["solver"]["equations"] = {
    "type": "les",
    "turbulence": {
        "les": "wale",
    },
}
```

## Incompressible LES

The incompressible LES equations combine the [incompressible viscous](#incompressible-viscous) keys with the
LES-specific `turbulence` dictionary of [LES](#les):

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

## Shielding the LES branch by CFL

[`les_cfl_limit`](/reference/solver/equations#turbulence-les-cfl-limit) is the CFL number at or below which the LES
branch of a DES, DDES or IDDES model is left untouched. Left out, as it is by default, the CFL shield is disabled.

The LES branch replaces the modelled RANS stress with resolved eddies the size of the local filter width $\Delta$. Those
eddies are resolved only if the time step can follow them, that is if the cell CFL number is of order one. Where the
CFL number is larger the model still drops the RANS stress, but the temporal discretisation cannot supply the resolved
stress that should replace it. The shielding function $f_d$ gives no protection against this, because it is built from
$r_d$, a purely spatial ratio.

Setting a limit adds a second shield, built from the cell CFL number. The time step has to resolve two things: the
transport of an eddy of size $\Delta$ across the cell, and that eddy's own turnover. The shield takes whichever of the
two is binding,

$$
\mathrm{CFL} = \max\left(
\frac{\left| \mathbf{u} - \mathbf{u}_{grid} \right| \Delta t}{\Delta},
\; C_{turn} \left| S \right| \Delta t \right),
\qquad
f_{CFL} = \mathrm{smoothstep}\left(
\mathrm{clamp}\left( \frac{\mathrm{CFL} - \mathrm{limit}}{\mathrm{width}}, 0, 1 \right) \right)
$$

and is combined with $f_d$ so that the more protective of the two prevails.

The transport term uses the velocity relative to the mesh, so it is indifferent to the frame: a mesh and fluid in
rigid-body motion together contribute nothing to it. On a rotating mesh, however, the solid-body term
$\mathbf{\Omega} \times \mathbf{r}$ is a genuine relative speed and can dominate, so a fine rotating overset mesh is
often shielded almost everywhere. That is the criterion reporting a real limitation of the mesh and time step, not an
artefact; [`les_turnover_coefficient`](#les_turnover_coefficient) covers the opposite case. At $f_{CFL} = 1$ the hybrid
length scale is exactly the RANS length scale, and the LES branch is fully suppressed. Because $f_{CFL}$ is exactly
zero at or below the limit, a simulation whose CFL number is everywhere within the limit is unaffected.

The shield acts only in time-accurate runs, with `time_settings` of type `"unsteady"` under either dual or global time
stepping, since a steady run has no meaningful real time step. It applies to the `DES`, `DDES` and `IDDES` settings
only, not to `SAS` or to `wale`. Before enabling it, use the `lescfl` output variable to find where the CFL number
exceeds the limit.

[`les_cfl_width`](/reference/solver/equations#turbulence-les-cfl-width) is the width of the blend above
`les_cfl_limit`: RANS is fully enforced at a CFL number of `limit + width`. A wider blend returns to RANS more
gradually, which is usually preferable, since the shielded cells also revert to full upwind dissipation.

### les_turnover_coefficient

[`les_turnover_coefficient`](/reference/solver/equations#turbulence-les-turnover-coefficient) is the weight $C_{turn}$
on the eddy-turnover term of the shielded CFL number. It has no effect unless `les_cfl_limit` is set. Setting it to
`0.0` recovers the transport-only criterion.

Transport alone is a one-sided test. Where the flow is slow relative to the mesh it reports a CFL number near zero and
permits the LES branch however large the time step, even though an energetic eddy in that cell may turn over many
times per step. Stagnation regions, recirculation cores and the neighbourhood of a rotation axis, where
$\Omega r \rightarrow 0$, all fall in that blind spot.

The turnover term closes it. The velocity of an eddy at the filter width is $u'(\Delta) \sim \left| S \right| \Delta$,
so $\Delta$ cancels, and the measure is the shear-timescale Courant number $\left| S \right| \Delta t$, with
$\left| S \right| = \sqrt{2 S_{ij} S_{ij}}$ the resolved strain-rate magnitude.

The measure uses strain, not vorticity. Solid-body rotation carries $\left| \omega \right| = 2\Omega$ with no turnover
at all, so a vorticity-based measure would shield every vortex core, which is exactly the content a DES run exists to
resolve. The resolved strain is also preferred to the modelled $\sqrt{k}$, which in a shielded cell is the full RANS
turbulence kinetic energy rather than its sub-grid part, and would lock a cell into RANS once it got there.

Use the `lesturnover` output variable alongside `lescfl` to see which of the two mechanisms is binding in a given cell.

## Reference entries

- [`type`](/reference/solver/equations#type) and [`precondition`](/reference/solver/equations#precondition)
- [`turbulence`](/reference/solver/equations#turbulence): [`model`](/reference/solver/equations#turbulence-model),
  [`hybrid`](/reference/solver/equations#turbulence-hybrid), [`qcr`](/reference/solver/equations#turbulence-qcr),
  [`production`](/reference/solver/equations#turbulence-production)
- [`les`](/reference/solver/equations#turbulence-les)
- [`les_cfl_limit`](/reference/solver/equations#turbulence-les-cfl-limit),
  [`les_cfl_width`](/reference/solver/equations#turbulence-les-cfl-width) and
  [`les_turnover_coefficient`](/reference/solver/equations#turbulence-les-turnover-coefficient)
