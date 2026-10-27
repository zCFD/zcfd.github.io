---
title: Choosing a turbulence model
section: guide
group: Choosing…
order: 10
---

# Choosing a turbulence model

Which turbulence model should close the equations?

This page applies when the equation set is `rans` or `les`; the choice of equation set is set out in
[Choosing an equation set](choosing-an-equation-set.md).

For `rans`, name the turbulence `model`. To resolve eddies away from the wall while keeping RANS near it, add a
[`hybrid`](#hybrid) on top of that model. For `les`, choose the [sub-grid model](#les).

The RANS turbulence models, selected by [`model`](/reference/solver/equations/turbulence#model):

| `model`            | Model                                                                | Reference                                                                         |
| ------------------ | -------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `sst`              | Menter shear stress transport k-ω, in its 2003 form                  | [Menter (1994)](#literature); [Menter et al. (2003)](#literature)                 |
| `spalart-allmaras` | Spalart–Allmaras, solved in the negative form of `sa-neg`            | [Spalart and Allmaras (1994)](#literature); [Allmaras et al. (2012)](#literature) |
| `sa-neg`           | negative Spalart–Allmaras, without the $f_{t2}$ term                 | [Allmaras et al. (2012)](#literature)                                             |
| `sst-transition`   | Langtry–Menter four-equation transitional SST ($\gamma$–$Re_\theta$) | [Langtry and Menter (2009)](#literature)                                          |
| `sas`              | scale-adaptive simulation, run as a standalone RANS model            | [Menter and Egorov (2010)](#literature)                                           |

The incompressible solver solves `sst` and `sa-neg` only.

## Hybrid RANS–LES {#hybrid}

A [`hybrid`](/reference/solver/equations/turbulence#hybrid) of `DES`, `DDES`, `IDDES` or `SAS` layers an LES branch on
the chosen model. On `sst`, `DES` follows [Strelets (2001)](#literature), and `DDES` and `IDDES` follow
[Gritskevich et al. (2012)](#literature). On `sa-neg`, `DES`, `DDES` and `IDDES` follow
[Spalart et al. (1997)](#literature), [Spalart et al. (2006)](#literature) and [Shur et al. (2008)](#literature)
respectively. `SAS` follows [Menter and Egorov (2010)](#literature).

A hybrid model carries a transport-equation RANS model beneath its LES branch; SST-IDDES, for example, still solves
the SST k and ω equations. It is configured through the `rans` equation set, with `hybrid` set alongside `model`, and
never through `les`. Leave `hybrid` out to solve pure RANS.

## The turbulence dictionary {#turbulence-dictionary}

Under `rans`, the [`turbulence`](/reference/solver/equations#turbulence) dictionary holds
[`model`](/reference/solver/equations/turbulence#model), [`hybrid`](/reference/solver/equations/turbulence#hybrid)
and the model options below.

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

[`qcr`](/reference/solver/equations/turbulence#qcr) adds the non-linear quadratic constitutive relation (QCR) to the
turbulent stress, for both SST and SA-neg. QCR has been shown to improve the prediction of separated corner flows,
particularly on highly loaded wings. Three versions are available:
[QCR 2000](<https://doi.org/10.1016/S0142-727X(00)00007-2>), [QCR 2020](https://doi.org/10.2514/1.J059683) and
[QCR 2021](https://doi.org/10.1017/aer.2021.42).

### production

[`production`](/reference/solver/equations/turbulence#production) selects the production term of the SST model:
`"vorticity"` (SST-V), `"strain-incompressible"`, `"strain-compressible"` or `"kato-launder"`. The integers 0 to 3 are
also accepted, and stand for the same four names in that order. Left out, the model chooses for itself: `kato-launder`
for `sst-transition` and `vorticity` otherwise.

### Advanced parameters for turbulence models

The constants in the `turbulence` dictionary tune the turbulence models: `betastar`, `cdes_kw`, `cdes_keps`, `cd1`,
`cd2`, `cw`, `a1`, `cdes`, `ca1`, `ca2`, `ce1`, `ce2`, `cthetat`, `sigmagamma`, `sigmathetat` and
`separation_correction`. They are advanced settings, and should not normally need adjusting.

## LES sub-grid models {#les}

Under `les`, the [`turbulence`](/reference/solver/equations#turbulence) dictionary is a much smaller, LES-specific
one, unrelated to the RANS dictionary above. Its [`les`](/reference/solver/equations/turbulence#les) key selects the
sub-grid model: `wale`, `deardorff` or `none`. `deardorff` is implemented by the incompressible solver only. The whole
dictionary is optional: leaving it out gives implicit LES, with no sub-grid model.

```python
parameters["solver"]["equations"] = {
    "type": "les",
    "turbulence": {
        "les": "wale",
    },
}
```

## Shielding the LES branch by CFL

[`les_cfl_limit`](/reference/solver/equations/turbulence#les-cfl-limit) is the CFL number at or below which the LES
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

[`les_cfl_width`](/reference/solver/equations/turbulence#les-cfl-width) is the width of the blend above
`les_cfl_limit`: RANS is fully enforced at a CFL number of `limit + width`. A wider blend returns to RANS more
gradually, which is usually preferable, since the shielded cells also revert to full upwind dissipation.

### les_turnover_coefficient

[`les_turnover_coefficient`](/reference/solver/equations/turbulence#les-turnover-coefficient) is the weight $C_{turn}$
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

## Literature

- Allmaras, S. R., Johnson, F. T. and Spalart, P. R. (2012). Modifications and Clarifications for the Implementation
  of the Spalart–Allmaras Turbulence Model. Seventh International Conference on Computational Fluid Dynamics,
  paper ICCFD7-1902.
- Gritskevich, M. S., Garbaruk, A. V., Schütze, J. and Menter, F. R. (2012). Development of DDES and IDDES
  Formulations for the k-ω Shear Stress Transport Model. _Flow, Turbulence and Combustion_, 88(3), 431–449.
  <https://doi.org/10.1007/s10494-011-9378-4>
- Langtry, R. B. and Menter, F. R. (2009). Correlation-Based Transition Modeling for Unstructured Parallelized
  Computational Fluid Dynamics Codes. _AIAA Journal_, 47(12), 2894–2906. <https://doi.org/10.2514/1.42362>
- Menter, F. R. (1994). Two-Equation Eddy-Viscosity Turbulence Models for Engineering Applications. _AIAA Journal_,
  32(8), 1598–1605. <https://doi.org/10.2514/3.12149>
- Menter, F. R. and Egorov, Y. (2010). The Scale-Adaptive Simulation Method for Unsteady Turbulent Flow Predictions.
  Part 1: Theory and Model Description. _Flow, Turbulence and Combustion_, 85(1), 113–138.
  <https://doi.org/10.1007/s10494-010-9264-5>
- Menter, F. R., Kuntz, M. and Langtry, R. (2003). Ten Years of Industrial Experience with the SST Turbulence Model.
  In K. Hanjalić, Y. Nagano and M. Tummers (editors), _Turbulence, Heat and Mass Transfer 4_, Begell House,
  625–632.
- Shur, M. L., Spalart, P. R., Strelets, M. and Travin, A. K. (2008). A Hybrid RANS-LES Approach with Delayed-DES and
  Wall-Modelled LES Capabilities. _International Journal of Heat and Fluid Flow_, 29(6), 1638–1649.
  <https://doi.org/10.1016/j.ijheatfluidflow.2008.07.001>
- Spalart, P. R. and Allmaras, S. R. (1994). A One-Equation Turbulence Model for Aerodynamic Flows. _La Recherche
  Aérospatiale_, 1, 5–21.
- Spalart, P. R., Deck, S., Shur, M. L., Squires, K. D., Strelets, M. and Travin, A. (2006). A New Version of
  Detached-Eddy Simulation, Resistant to Ambiguous Grid Densities. _Theoretical and Computational Fluid Dynamics_,
  20(3), 181–195. <https://doi.org/10.1007/s00162-006-0015-0>
- Spalart, P. R., Jou, W.-H., Strelets, M. and Allmaras, S. R. (1997). Comments on the Feasibility of LES for Wings,
  and on a Hybrid RANS/LES Approach. In C. Liu and Z. Liu (editors), _Advances in DNS/LES_, Greyden Press, 137–147.
- Strelets, M. (2001). Detached Eddy Simulation of Massively Separated Flows. AIAA paper 2001-0879.
  <https://doi.org/10.2514/6.2001-879>

## Reference entries

- [`turbulence`](/reference/solver/equations#turbulence): [`model`](/reference/solver/equations/turbulence#model),
  [`hybrid`](/reference/solver/equations/turbulence#hybrid), [`qcr`](/reference/solver/equations/turbulence#qcr),
  [`production`](/reference/solver/equations/turbulence#production)
- [`les`](/reference/solver/equations/turbulence#les)
- [`les_cfl_limit`](/reference/solver/equations/turbulence#les-cfl-limit),
  [`les_cfl_width`](/reference/solver/equations/turbulence#les-cfl-width) and
  [`les_turnover_coefficient`](/reference/solver/equations/turbulence#les-turnover-coefficient)
