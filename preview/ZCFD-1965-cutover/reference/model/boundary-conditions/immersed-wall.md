---
title: immersed wall
section: reference
---

# immersed wall

Immersed wall boundary condition.


## type

— no description —

always immersed wall

| Value | What it does | When to use it |
| --- | --- | --- |
| `immersed wall` (default) | A solid surface immersed in a Cartesian mesh, supported only on meshes from the zM3 mesh generator. |  |

Guidance: [/guide/choosing/choosing-a-wall-model#immersed-walls](/guide/choosing/choosing-a-wall-model#immersed-walls)


## zones

Mesh zone ids this boundary condition applies to.

list of zone ids · required

Guidance: [/guide/choosing/choosing-boundary-conditions#zones](/guide/choosing/choosing-boundary-conditions#zones)


## kind

Wall model applied on these zones.

default no slip

| Value | What it does | When to use it |
| --- | --- | --- |
| `slip` | Zero velocity normal to the wall and no shear stress along it. |  |
| `no slip` (default) | Applies the no-slip condition directly at the wall. | Viscous wall with the mesh resolved to $y^+ \sim 1$. On an immersed wall, near-wall values are extrapolated from the donor point, which can separate the flow early in strong pressure gradients. |
| `wall function` | Takes the wall stress from a law of the wall instead of resolving the near-wall layer: Spalding's law with SST, the Allmaras fit with SA-neg. | Viscous wall with the first cell anywhere from $y^+ \sim 1$ to $y^+ > 100$. The law of the wall (Spalding's with SST, the Allmaras fit with SA-neg) represents a flat plate in zero pressure gradient, so accuracy falls on highly curved surfaces and in strong pressure gradients. |
| `most` | Takes the wall stress and surface heat flux from Monin-Obukhov similarity theory on a roughness length. |  |

Guidance: [/guide/choosing/choosing-a-wall-model#kind](/guide/choosing/choosing-a-wall-model#kind)


## most

Monin-Obukhov surface-layer settings.

settings block · not set by default · 'most' is required when kind is 'most', and only applies then


### roughness length

Aerodynamic roughness length z0

number · required · > 0.0 m


### heat roughness length

Thermal roughness length z0h; defaults to roughness_length

number · not set by default · > 0.0 m


### surface potential temperature

Prescribed surface theta_s; unset leaves the wall thermally passive

number · not set by default · > 0.0 K


### surface cooling rate

d(theta_s)/dt applied to surface_potential_temperature (GABLS1 uses -0.25)

number · not set by default · in K/h


### stable form

Stability function family for stable stratification

default hogstrom

| Value | What it does | When to use it |
| --- | --- | --- |
| `hogstrom` (default) | Linear functions, phi = 1 + beta zeta, with coefficients 'beta m' and 'beta h' (Högström 1988); the surface flux collapses as stability grows. |  |
| `beljaars-holtslag` | Beljaars and Holtslag (1991) functions, which keep a finite surface flux under strong stability. |  |


### von karman

Von Karman constant (atmospheric convention 0.4)

number · default 0.4 · > 0.0


### beta m

Stable momentum coefficient, phi_m = 1 + beta_m zeta

number · default 4.8 · > 0.0


### beta h

Stable heat coefficient, phi_h = 1 + beta_h zeta

number · default 7.8 · > 0.0


## temperature

Wall temperature, as a number or a {'field': '<map>.vtp'} map; unset, the wall is adiabatic.

number or settings block · not set by default · > 0.0 K · 'temperature' only applies when either type is 'wall' or kind is not 'wall function'; give either 'temperature' or 'heat flux', not both

Guidance: [/guide/choosing/choosing-a-wall-model#wall-function](/guide/choosing/choosing-a-wall-model#wall-function)


### field

VTP file with a point array named after the quantity ('Temperature' or 'HeatFlux'); each face takes the nearest point's value

text · required


## heat flux

Wall heat flux, positive into the fluid, as a number or a {'field': '<map>.vtp'} map.

number or settings block · not set by default · in W/m^2 · 'heat flux' only applies when type is 'wall' and kind is 'wall function'

Guidance: [/guide/choosing/choosing-a-wall-model#wall-function](/guide/choosing/choosing-a-wall-model#wall-function)


### field

VTP file with a point array named after the quantity ('Temperature' or 'HeatFlux'); each face takes the nearest point's value

text · required


## compressible wall function

Applies the compressible law of the wall on an adiabatic wall-function wall; a 'temperature' or a 'heat flux' selects it anyway.

true or false · default False · 'compressible wall function' only applies when type is 'wall' and kind is 'wall function'

Guidance: [/guide/choosing/choosing-a-wall-model#wall-function](/guide/choosing/choosing-a-wall-model#wall-function)


## velocity

Velocity of the wall surface, for surfaces in relative motion such as a moving belt or a rotating wheel.

choice of settings blocks · not set by default


### type

— no description —

required

| Value | What it does | When to use it |
| --- | --- | --- |
| `linear` | Selects a linear (translational) wall velocity. |  |
| `rotating` | Selects a rotational wall velocity. |  |

Guidance: [/guide/choosing/choosing-a-wall-model#moving-walls](/guide/choosing/choosing-a-wall-model#moving-walls)


### vector

Direction of linear velocity

point or vector (3 numbers) · required


### mach

Mach number for linear velocity - overrides magnitude of the translation velocity

number · not set by default


### axis

Axis of rotation

direction (3 numbers, unit length) · required


### center

Center point of rotation

point or vector (3 numbers) · required


### omega

Angular velocity (rad/s)

number · required


## roughness

Surface roughness; unset, the wall is smooth.

settings block · not set by default

Guidance: [/guide/choosing/choosing-a-wall-model#roughness](/guide/choosing/choosing-a-wall-model#roughness)


### type

Which roughness measure the value gives.

required

| Value | What it does | When to use it |
| --- | --- | --- |
| `height` | The value is the equivalent sand-grain height of the roughness elements. |  |
| `length` | The value is the aerodynamic roughness length, converted internally to a sand-grain height of length / 0.03. |  |

Guidance: [/guide/choosing/choosing-a-wall-model#roughness](/guide/choosing/choosing-a-wall-model#roughness)


### scalar

Uniform roughness over the wall, as the measure 'type' names.

number · not set by default · in m · give either 'scalar' or 'field'


### field

VTP file with a point array named 'Roughness'; each wall face takes the nearest point's value.

text · not set by default


### thermal model

How roughness affects wall heat transfer under the compressible wall function.

default owen thomson · 'thermal model' only applies when kind is 'wall function' and either temperature is set or heat flux is set

| Value | What it does | When to use it |
| --- | --- | --- |
| `owen thomson` (default) | Adds a thermal sublayer resistance between the surface and the roughness crest, so the Stanton number rises less than the skin friction. |  |
| `reynolds analogy` | Omits that resistance, so the Stanton number rises in proportion to the skin friction. |  |

Guidance: [/guide/choosing/choosing-a-wall-model#rough-compressible-walls](/guide/choosing/choosing-a-wall-model#rough-compressible-walls)


## fsi

Fluid-structure interaction model that couples this wall's motion to a structural solve.

choice of settings blocks · not set by default

Guidance: [/guide/working-with/fluid-structure-interaction](/guide/working-with/fluid-structure-interaction)


### support radius

RBF support radius, also the mode-shape deformation scale used when normalising mode shapes for morphing

number · default 1 · > 0

Guidance: [/guide/working-with/fluid-structure-interaction#interpolation-method](/guide/working-with/fluid-structure-interaction#interpolation-method)


### basis

RBF function type

default c2

| Value | What it does | When to use it |
| --- | --- | --- |
| `tps` |  |  |
| `thin_plate_spline` |  |  |
| `multiquadric` |  |  |
| `inverse_multiquadric` |  |  |
| `gaussian` |  |  |
| `linear` |  |  |
| `cubic` |  |  |
| `quintic` |  |  |
| `c0` |  |  |
| `c2` (default) |  |  |
| `c4` |  |  |
| `c6` |  |  |


### base point fraction

Fraction of points to use as base points

number · required

Guidance: [/guide/working-with/fluid-structure-interaction#interpolation-method](/guide/working-with/fluid-structure-interaction#interpolation-method)


### file format

Structural file format

required

| Value | What it does | When to use it |
| --- | --- | --- |
| `nastran` |  |  |


### nastran casename

Nastran case name (without extension)

text · required


### scale

Scaling factors [x, y, z]

list of numbers · not set by default


### mode mapping max distance

Max distance for mode mapping

number · required


### mode mapping power

Inverse-distance power for mapping mode shapes to the surface

number · default 1 · > 0


### mode mapping pure idw

Use pure inverse-distance weighting for the mode mapping

true or false · default True


### mode mapping n nearest

Number of nearest structural points used per surface point

whole number · default 4 · >= 1


### recalculate rbfs alpha fraction

Deformation fraction of the RBF support radius at which the base-point set is rebuilt; 0 never rebuilds it

number · default 0 · >= 0.0


### newmark alpha

Newmark integrator alpha parameter

number · default 0.25


### newmark delta

Newmark integrator delta parameter

number · default 0.5


### fluid force scaling

Scaling factor for fluid forces

number · required


### mode list

List of modes to include

list of whole numbers · required


### modal damping

Damping factors for each mode

list of numbers · required


### forcing

External forcing configuration

settings block · not set by default

Guidance: [/guide/working-with/fluid-structure-interaction#external-forcing](/guide/working-with/fluid-structure-interaction#external-forcing)


#### location

Location at which the forcing is applied

point or vector (3 numbers) · required


#### force

Force vector, or a callable returning one as a function of time

point or vector (3 numbers) or Python function · required · accepts a Python function


#### frequency

Forcing frequency

number · required


### type

— no description —

not set by default

| Value | What it does | When to use it |
| --- | --- | --- |
| `modal_model` (default) | Selects the built-in Nastran modal-model coupling. |  |
| `generic_fsi` (default) | Selects the generic external-solver coupling. |  |

Guidance: [/guide/working-with/fluid-structure-interaction#modal-model](/guide/working-with/fluid-structure-interaction#modal-model)


### transform type

Mesh deformation transform used for the coupling

not set by default

| Value | What it does | When to use it |
| --- | --- | --- |
| `rbf_multiscale` (default) | Deforms the volume mesh using the multiscale RBF scheme. |  |
| `idw` (default) | Deforms the volume mesh using inverse distance weighting. |  |
| `rbf` |  |  |

Guidance: [/guide/working-with/fluid-structure-interaction#rbf-multiscale-transform](/guide/working-with/fluid-structure-interaction#rbf-multiscale-transform)


### power

Power parameters for IDW

number or list of numbers · required

Guidance: [/guide/working-with/fluid-structure-interaction#interpolation-method](/guide/working-with/fluid-structure-interaction#interpolation-method)


### stencil size

Maximum stencil size (number of nearest neighbors)

whole number · not set by default · >= 1


### fixed zones

Fixed zones for IDW

list of whole numbers · not set by default


### n nearest

Number of nearest points for IDW

whole number · default 100 · >= 1


### deformation distance

Maximum deformation distance

number · default 1 · > 0


### blending stiffness

Blending stiffness parameter

number · default 0.5 · 0 to 1


### zone

Zone IDs coupled to the external solver

list of zone ids · required


### tol

RBF solve tolerance

number · default 0.01


### max error

Maximum allowed RBF interpolation error

number · default 0.1


### user variables

Arbitrary variables passed to the external coupling solver (genuinely open-ended — not enumerable).

settings block · not set by default


## immersed wall normal type

How the geometry's unit normals are obtained.

default STL

| Value | What it does | When to use it |
| --- | --- | --- |
| `STL` (default) | The geometry unit normals are taken directly from the STL. |  |
| `immersed boundary vector` | The geometry unit normals are approximated by the vector from the face centre to the nearest surface point. |  |


::: {.deck title="immersed wall"}
```python
{
    "type": "immersed wall",
    "zones": ...,
    ...
}
```
:::

