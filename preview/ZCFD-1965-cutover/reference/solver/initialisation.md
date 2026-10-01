---
title: initialisation
section: reference
---

# initialisation

Default initialisation and restart settings for all meshes.


## reference

Reference condition used for non-dimensionalization (e.g. 'IC_1'). When the initial_conditions IC has zero velocity (e.g. a quiescent cavity), set this to a reference condition with the physical velocity/Reynolds number so the solver can non-dimensionalize correctly.

text · not set by default

Guidance: [/guide/choosing/choosing-initialisation-and-reference-state#reference-state](/guide/choosing/choosing-initialisation-and-reference-state#reference-state)


## initial conditions

Initial conditions for the simulation. Can be a named IC from reference_conditions or a function. Required unless restart=True.

text or Python function · not set by default · accepts a Python function

Guidance: [/guide/choosing/choosing-initialisation-and-reference-state#initial-state](/guide/choosing/choosing-initialisation-and-reference-state#initial-state)


## restart

Restart from a previous solution. Default is False.

true or false · default False

Guidance: [/guide/choosing/choosing-initialisation-and-reference-state#restart](/guide/choosing/choosing-initialisation-and-reference-state#restart)


## restart casename

Name of the case to restart from. Defaults to the current casename.

text · not set by default

Guidance: [/guide/choosing/choosing-initialisation-and-reference-state#restart](/guide/choosing/choosing-initialisation-and-reference-state#restart)


## restart meshname

Name of the mesh to interpolate the restart from (if different from current mesh).

text · not set by default

Guidance: [/guide/choosing/choosing-initialisation-and-reference-state#restart](/guide/choosing/choosing-initialisation-and-reference-state#restart)


## restart ignore history

Ignore cycle history from restart file. Default is False.

true or false · default False

Guidance: [/guide/choosing/choosing-initialisation-and-reference-state#restart](/guide/choosing/choosing-initialisation-and-reference-state#restart)


## interpolate restart

Interpolate restart results from a different mesh. Default is False.

true or false · default False

Guidance: [/guide/choosing/choosing-initialisation-and-reference-state#restart](/guide/choosing/choosing-initialisation-and-reference-state#restart)


::: {.deck title="initialisation"}
```python
"initialisation": {
    ...
},
```
:::

