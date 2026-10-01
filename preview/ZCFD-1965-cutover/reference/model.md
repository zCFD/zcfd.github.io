---
title: model
section: reference
---

# model

Configuration for WHAT is being simulated on a specific mesh.

| Key | What it holds |
| --- | --- |
| [boundary conditions](/reference/model/boundary-conditions) | Boundary conditions mapped to surface zones. |
| [fluid zones](/reference/model/fluid-zones) | Fluid zone models (e.g. MRF, porous). |
| [transforms](/reference/model/transforms) | Initial placement and dynamic rigid mesh motion. |
| [initialisation](/reference/solver/initialisation) | Initialisation and restart settings for this mesh. |
| [convergence control](/reference/solver/convergence-control) | Convergence and pacing settings for this mesh. The block replaces the solver's convergence control for this mesh, so it must be complete in itself. |
| [numerical scheme](/reference/solver/numerical-scheme) | Spatial numeric scheme override. |
| [output settings](/reference/solver/output-settings) | Output variables and monitors override. |


## mesh

Path to the HDF5 mesh file.

text · required

Guidance: [/guide/concepts/how-the-deck-works](/guide/concepts/how-the-deck-works)


::: {.deck title="model"}
```python
{
    "mesh": "outer.h5",
}
```
:::

