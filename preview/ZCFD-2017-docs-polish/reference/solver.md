---
title: solver
section: reference
---

# solver

Global solver configuration and overrideable defaults

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| [`solver settings`](/reference/solver/solver-settings) | choice of settings blocks |  | Which solver runs the case, and how it is partitioned and parallelised |
| [`equations`](/reference/solver/equations) | choice of settings blocks |  | The equations solved, and their turbulence and transport models |
| [`fluid properties`](/reference/solver/fluid-properties) | choice of settings blocks |  | Fluid model properties and definition |
| [`reference conditions`](/reference/solver/reference-conditions) | settings block |  | Dictionary of reference conditions used throughout the simulation |
| [`initialisation`](/reference/solver/initialisation) | settings block |  | Default initialisation and restart settings for all meshes. A mesh may set its own. |
| [`time settings`](/reference/solver/time-settings) | choice of settings blocks |  | Physical time layout (steady, global or dual timestepping) |
| [`convergence control`](/reference/solver/convergence-control) | choice of settings blocks |  | Convergence pacing for the inner pseudo-time loop (required for steady/DTS) A mesh may set its own. |
| [`numerical scheme`](/reference/solver/numerical-scheme) | choice of settings blocks |  | Default spatial numerical scheme for all meshes. A mesh may set its own. |
| [`output settings`](/reference/solver/output-settings) | settings block |  | Default output variables and monitors for all meshes. A mesh may set its own. |

::: {.deck title="solver"}
```python
parameters = {
    "solver": {
        "solver settings": {...},
        "equations": {...},
        "fluid properties": {...},
        "reference conditions": {...},
        "initialisation": {...},
        "time settings": {...},
        "convergence control": {...},
        "numerical scheme": {...},
        "output settings": {...},
    },
    ...
}
```
:::

