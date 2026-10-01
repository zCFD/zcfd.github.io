---
title: solver settings
section: reference
---

# solver settings


## type

— no description —

not set by default

| Value | What it does | When to use it |
| --- | --- | --- |
| `compressible` (default) |  |  |
| `incompressible` (default) |  |  |

Guidance: [/guide/choosing/choosing-a-turbulence-model#equation-sets](/guide/choosing/choosing-a-turbulence-model#equation-sets)


## partitioner

Mesh partitioner for parallel decomposition

default scotch

| Value | What it does | When to use it |
| --- | --- | --- |
| `metis` |  |  |
| `scotch` (default) |  |  |


## linear solver options

Linear solver options passed to C++.

settings block · default {flow: {-ksp_min_it: 2, -ksp_type: fgmres, -ksp_rtol: 1.0e-3, -ksp_converged_reason: }, turbulence: {-ksp_min_it: 2, -ksp_type: fgmres, -ksp_rtol: 1.0e-5, -ksp_converged_reason: }, rbf: {-ksp_type: fgmres, -ksp_rtol: 1.0e-5}, double_precision: False}

Guidance: [/guide/choosing/choosing-a-linear-solver](/guide/choosing/choosing-a-linear-solver)


### flow

PETSc options for the mean flow linear solver

settings block · default {-ksp_min_it: 2, -ksp_type: fgmres, -ksp_rtol: 1.0e-3, -ksp_converged_reason: }

Guidance: [/guide/choosing/choosing-a-linear-solver#petsc](/guide/choosing/choosing-a-linear-solver#petsc)


### turbulence

PETSc options for the turbulence linear solver

settings block · default {-ksp_min_it: 2, -ksp_type: fgmres, -ksp_rtol: 1.0e-5, -ksp_converged_reason: }

Guidance: [/guide/choosing/choosing-a-linear-solver#petsc](/guide/choosing/choosing-a-linear-solver#petsc)


### rbf

PETSc options for the RBF linear solver

settings block · default {-ksp_type: fgmres, -ksp_rtol: 1.0e-5}

Guidance: [/guide/choosing/choosing-a-linear-solver#petsc](/guide/choosing/choosing-a-linear-solver#petsc)


### double precision

Enable double precision for linear solver

true or false · default False

Guidance: [/guide/choosing/choosing-a-linear-solver#amgx](/guide/choosing/choosing-a-linear-solver#amgx)


### pressure correction

PETSc options for the SIMPLE pressure-correction (block-1 Poisson) solver. simpleFoam's p entry: algebraic multigrid, solved to one or two orders

settings block · default {-ksp_min_it: 1, -ksp_type: cg, -ksp_rtol: 0.01, -ksp_atol: 1.0e-12, -ksp_max_it: 100, -pc_type: hypre, -pc_hypre_type: boomeramg, -zcfd_pc_reuse_cycles: 20, -zcfd_constant_nullspace: 1, -ksp_converged_reason: } · 'pressure correction' only applies when solver.convergence control.scheme.name is 'simple'

Guidance: [/guide/choosing/choosing-a-linear-solver#incompressible-solver](/guide/choosing/choosing-a-linear-solver#incompressible-solver)


### momentum

PETSc options for the SIMPLE momentum predictor (block-3) solver. simpleFoam's U entry: BiCGStab + ILU to relTol 0.1. The under-relaxed momentum matrix is strongly diagonally dominant, so this is a few iterations

settings block · default {-ksp_min_it: 1, -ksp_type: bcgs, -ksp_rtol: 0.1, -ksp_atol: 1.0e-12, -ksp_max_it: 50, -pc_type: bjacobi, -sub_pc_type: ilu, -ksp_converged_reason: } · 'momentum' only applies when solver.convergence control.scheme.name is 'simple'

Guidance: [/guide/choosing/choosing-a-linear-solver#incompressible-solver](/guide/choosing/choosing-a-linear-solver#incompressible-solver)


## solution smooth cycles

Number of Laplace smoothing cycles for mapped solutions.

whole number · default 0

Guidance: [/guide/choosing/choosing-initialisation-and-reference-state#restart](/guide/choosing/choosing-initialisation-and-reference-state#restart)


## safe

Enable safe mode for extra checks and diagnostics.

true or false · default False


## cell reordering

Cell and face reordering options for cache locality and colouring balance.

settings block · default {rcm: False, sloan: False, sfc: True, sfc_curve: hilbert, face_sort: True}


### rcm

Reverse Cuthill-McKee bandwidth-reducing cell reordering

true or false · default False


### sloan

Sloan profile-reducing cell reordering

true or false · default False


### sfc

Space-filling-curve cell reordering

true or false · default True


### sfc curve

Space-filling curve used when sfc is enabled

default hilbert

| Value | What it does | When to use it |
| --- | --- | --- |
| `hilbert` (default) |  |  |
| `morton` |  |  |


### face sort

Sort faces within each colour by their lowest cell index

true or false · default True


## mesh quality remediation angle threshold

Non-orthogonality angle in degrees above which an interior face uses a first-order convective flux. Non-orthogonality is the angle between the line joining the two cell centres and the face normal. Unset leaves every face at the scheme's order.

number · not set by default · > 0 and <= 180 · 'mesh quality remediation angle threshold' only applies when solver.solver settings.type is 'compressible'


::: {.deck title="solver settings"}
```python
"solver settings": {
    ...
},
```
:::

