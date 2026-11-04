---
title: initialisation
section: reference
---

# initialisation

Default initialisation and restart settings for all meshes.

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `reference` | str | not set | Reference condition used for non-dimensionalization (e.g. |
| `initial conditions` | str or Python function, or a Python function | not set | Initial conditions for the simulation: a named condition from reference_conditions, or a function of each cell's dimensional state (m, m, Pa, K, m/s), called as f(*, location, wall_distance, pressure, temperature, velocity); it returns a dict of any of 'pressure', 'temperature' and 'velocity'. |
| `restart` | bool | `False` | Restart from a previous solution. |
| `restart casename` | str | not set | Name of the case to restart from. |
| `restart meshname` | str | not set | Mesh the restart case ran on, for an interpolated restart from a results file that has no case record beside it. |
| `restart ignore history` | bool | `False` | Ignore cycle history from restart file. |
| `interpolate restart` | bool | `False` | Start from the restart case's solution interpolated onto this case's mesh, which may differ in resolution, cell type or geometry. |
| `interpolation` | choice | `linear` | How an interpolated restart forms each new cell's value from the old cell containing its centre: 'linear' adds the old cell's least-squares gradient times the offset between the centres, held within the values of that cell and its face neighbours; 'injection' copies the old cell's value. |
| `restart models` | settings block | not set | For an interpolated restart, the restart case's model each of this case's models starts from, where the names differ, as {this case's model: restart case's model}. |
| `interpolate outside limit` | float, 0.0 to 1.0 | `0.001` | Largest fraction of this case's cells that may lie outside the restart case's mesh, so 0.001 is 0.1%. |

::: {.deck title="initialisation"}
```python
parameters = {
    "solver": {
        "initialisation": {
            "reference": <str>,
            "initial conditions": <str or Python function>,
            "restart": False,
            "restart casename": <str>,
            "restart meshname": <str>,
            "restart ignore history": False,
            "interpolate restart": False,
            "interpolation": "linear",
            "restart models": {...},
            "interpolate outside limit": 0.001,
        },
        ...
    },
    ...
}
```
:::

## reference

Reference condition used for non-dimensionalization (e.g. 'IC_1'). When the initial_conditions IC has zero velocity (e.g. a quiescent cavity), set this to a reference condition with the physical velocity/Reynolds number so the solver can non-dimensionalize correctly.

::: facts
**Type** str · **Default** not set · **Applies when** 'reference' is required when restart is True and initial conditions is unset
:::

Guidance: [Choosing initialisation and reference state › Reference state](/guide/choosing/choosing-initialisation-and-reference-state#reference-state)

## initial conditions

Initial conditions for the simulation: a named condition from reference_conditions, or a function of each cell's dimensional state (m, m, Pa, K, m/s), called as f(*, location, wall_distance, pressure, temperature, velocity); it returns a dict of any of 'pressure', 'temperature' and 'velocity'. Required unless restart=True.

::: facts
**Type** str or Python function, or a Python function · **Default** not set
:::

Guidance: [Choosing initialisation and reference state › Initial state](/guide/choosing/choosing-initialisation-and-reference-state#initial-state)

## restart

Restart from a previous solution. Default is False.

::: facts
**Type** bool · **Default** `False`
:::

Guidance: [Choosing initialisation and reference state › Restart](/guide/choosing/choosing-initialisation-and-reference-state#restart)

## restart casename

Name of the case to restart from. Defaults to the current casename.

::: facts
**Type** str · **Default** not set · **Applies when** restart is True
:::

Guidance: [Choosing initialisation and reference state › Restart](/guide/choosing/choosing-initialisation-and-reference-state#restart)

## restart meshname

Mesh the restart case ran on, for an interpolated restart from a results file that has no case record beside it. A case run by this version of zCFD records its own mesh.

::: facts
**Type** str · **Default** not set · **Applies when** restart is True
:::

Guidance: [Choosing initialisation and reference state › Restart](/guide/choosing/choosing-initialisation-and-reference-state#restart)

## restart ignore history

Ignore cycle history from restart file. Default is False.

::: facts
**Type** bool · **Default** `False` · **Applies when** restart is True
:::

Guidance: [Choosing initialisation and reference state › Restart](/guide/choosing/choosing-initialisation-and-reference-state#restart)

## interpolate restart

Start from the restart case's solution interpolated onto this case's mesh, which may differ in resolution, cell type or geometry. Variables the restart case does not solve come from the initial conditions.

::: facts
**Type** bool · **Default** `False` · **Applies when** restart is True
:::

Guidance: [Choosing initialisation and reference state › Restart](/guide/choosing/choosing-initialisation-and-reference-state#restart)

## interpolation

How an interpolated restart forms each new cell's value from the old cell containing its centre: 'linear' adds the old cell's least-squares gradient times the offset between the centres, held within the values of that cell and its face neighbours; 'injection' copies the old cell's value.

::: facts
**Type** choice · **Default** `linear` · **Applies when** restart is True
:::

| Value | What it does |
| --- | --- |
| `linear` (default) | Linear, bounded by the neighbouring cells |
| `injection` | Copy the containing cell |

Guidance: [Choosing initialisation and reference state › Restart](/guide/choosing/choosing-initialisation-and-reference-state#restart)

## restart models

For an interpolated restart, the restart case's model each of this case's models starts from, where the names differ, as {this case's model: restart case's model}. Models not listed start from the model of the same name.

::: facts
**Type** settings block · **Default** not set · **Applies when** restart is True
:::

## interpolate outside limit

Largest fraction of this case's cells that may lie outside the restart case's mesh, so 0.001 is 0.1%. Those cells take the nearest restart cell's value; above the limit the run stops.

::: facts
**Type** float, 0.0 to 1.0 · **Default** `0.001` · **Applies when** restart is True
:::

