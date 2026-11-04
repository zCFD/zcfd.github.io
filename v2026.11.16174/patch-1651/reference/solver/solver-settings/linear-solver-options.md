---
title: linear solver options
section: reference
---

# linear solver options

Linear solver options passed to C++.

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `flow` | settings block | shown below | PETSc options for the mean flow linear solver |
| `turbulence` | settings block | shown below | PETSc options for the turbulence linear solver |
| `rbf` | settings block | shown below | PETSc options for the RBF linear solver |
| `double precision` | bool | `False` | Enable double precision for linear solver |
| `pressure correction` | settings block | shown below | *incompressible only* · PETSc options for the SIMPLE pressure-correction (block-1 Poisson) solver. simpleFoam's p entry: algebraic multigrid, solved to one or two orders |
| `momentum` | settings block | shown below | *incompressible only* · PETSc options for the SIMPLE momentum predictor (block-3) solver. simpleFoam's U entry: BiCGStab + ILU to relTol 0.1. |

::: {.deck title="linear solver options"}
```python
parameters = {
    "solver": {
        "solver settings": {
            "linear solver options": {
                "flow": {...},
                "turbulence": {...},
                "rbf": {...},
                "double precision": False,
                "pressure correction": {...},
                "momentum": {...},
            },
            ...
        },
        ...
    },
    ...
}
```
:::

## flow

PETSc options for the mean flow linear solver

::: facts
**Type** settings block
:::

**Default**

```python
{
    "-ksp_min_it": "2",
    "-ksp_type": "fgmres",
    "-ksp_rtol": "1.0e-3",
    "-ksp_converged_reason": "",
}
```

Guidance: [Choosing a linear solver › Petsc](/guide/choosing/choosing-a-linear-solver#petsc)

## turbulence

PETSc options for the turbulence linear solver

::: facts
**Type** settings block
:::

**Default**

```python
{
    "-ksp_min_it": "2",
    "-ksp_type": "fgmres",
    "-ksp_rtol": "1.0e-5",
    "-ksp_converged_reason": "",
}
```

Guidance: [Choosing a linear solver › Petsc](/guide/choosing/choosing-a-linear-solver#petsc)

## rbf

PETSc options for the RBF linear solver

::: facts
**Type** settings block
:::

**Default**

```python
{
    "-ksp_type": "fgmres",
    "-ksp_rtol": "1.0e-5",
}
```

Guidance: [Choosing a linear solver › Petsc](/guide/choosing/choosing-a-linear-solver#petsc)

## double precision

Enable double precision for linear solver

::: facts
**Type** bool · **Default** `False`
:::

Guidance: [Choosing a linear solver › AMGX](/guide/choosing/choosing-a-linear-solver#amgx)

## pressure correction

PETSc options for the SIMPLE pressure-correction (block-1 Poisson) solver. simpleFoam's p entry: algebraic multigrid, solved to one or two orders

::: facts
**Type** settings block · **Applies when** solver.convergence control.scheme.name is 'simple'
:::

**Default**

```python
{
    "-ksp_min_it": "1",
    "-ksp_type": "cg",
    "-ksp_rtol": "0.01",
    "-ksp_atol": "1.0e-12",
    "-ksp_max_it": "100",
    "-pc_type": "hypre",
    "-pc_hypre_type": "boomeramg",
    "-zcfd_pc_reuse_cycles": "20",
    "-zcfd_constant_nullspace": "1",
    "-ksp_converged_reason": "",
}
```

Guidance: [Choosing a linear solver › Incompressible solver](/guide/choosing/choosing-a-linear-solver#incompressible-solver)

## momentum

PETSc options for the SIMPLE momentum predictor (block-3) solver. simpleFoam's U entry: BiCGStab + ILU to relTol 0.1. The under-relaxed momentum matrix is strongly diagonally dominant, so this is a few iterations

::: facts
**Type** settings block · **Applies when** solver.convergence control.scheme.name is 'simple'
:::

**Default**

```python
{
    "-ksp_min_it": "1",
    "-ksp_type": "bcgs",
    "-ksp_rtol": "0.1",
    "-ksp_atol": "1.0e-12",
    "-ksp_max_it": "50",
    "-pc_type": "bjacobi",
    "-sub_pc_type": "ilu",
    "-ksp_converged_reason": "",
}
```

Guidance: [Choosing a linear solver › Incompressible solver](/guide/choosing/choosing-a-linear-solver#incompressible-solver)

