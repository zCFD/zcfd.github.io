---
title: model
section: reference
---

# model

The meshes to solve, each under a name of the engineer's choosing. Each entry names its mesh file and carries that mesh's boundary conditions, fluid zones, motion and any overrides of the solver defaults. Several entries run together in one simulation, coupled through overset or sliding interfaces.

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `mesh` | str | required | Path to the HDF5 mesh file. |
| [`boundary conditions`](/reference/model/boundary-conditions) | settings block |  | Boundary conditions mapped to surface zones. |
| [`fluid zones`](/reference/model/fluid-zones) | settings block |  | Fluid zone models (e.g. porous, actuator disc). |
| [`transforms`](/reference/model/transforms) | settings block |  | Placement and motion of the mesh. |
| [`initialisation`](/reference/solver/initialisation) | settings block |  | The initialisation settings that differ on this mesh. A mesh may set its own. |
| [`convergence control`](/reference/solver/convergence-control) | choice of settings blocks |  | The convergence control settings that differ on this mesh. A mesh may set its own. |
| [`numerical scheme`](/reference/solver/numerical-scheme) | choice of settings blocks |  | The numerical scheme settings that differ on this mesh. A mesh may set its own. |
| [`output settings`](/reference/solver/output-settings) | settings block |  | The output settings that differ on this mesh. A mesh may set its own. |

::: {.deck title="model"}
```python
parameters = {
    "model": {
        "<mesh>": {
            "mesh": <str>,
            "boundary conditions": {...},
            "fluid zones": {...},
            "transforms": {...},
            "initialisation": {...},
            "convergence control": {...},
            "numerical scheme": {...},
            "output settings": {...},
        },
    },
    ...
}
```
:::

## mesh

Path to the HDF5 mesh file.

::: facts
**Type** str · **Required** yes
:::

Guidance: [How the deck works](/guide/concepts/how-the-deck-works)

