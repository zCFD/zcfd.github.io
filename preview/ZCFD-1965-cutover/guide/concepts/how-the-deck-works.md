---
title: How the deck works
section: guide
group: Concepts
order: 20
---

# How the deck works

The zCFD control file is a python file that is executed at runtime. This provides a flexible way of specifying key parameters, enabling user defined functions and using the rich array of python libraries available.

A python dictionary called `parameters` provides the main interface to controlling zCFD:

```python
parameters = {
    "config_version": 2,
    "solver": {....},
    "model": {....},
}
```

`config_version` is a required integer identifying the schema the rest of the dictionary is validated against. `solver` holds the settings shared across the whole simulation; `model` holds one entry per mesh.

zCFD validates the `parameters` dictionary at run time against a pydantic schema for each key. Values that should be integers and floats are coerced to the correct type where possible; values that should be strings, booleans, lists or dictionaries raise an error if given the wrong type. Which keys are valid depends on the equation set and solver type chosen. A script is provided to check the validity of a control file before submitting a job — see [invocation and flags](../../reference/command-line/invocation-and-flags.md#input-validation).

The reference documents the keys available in a zCFD control dictionary and the valid values for each.

```python
parameters = {
    "config_version": 2,
    "solver": {
        "solver_settings": {...},
        "equations": {...},
        "fluid_properties": {...},
        "reference_conditions": {"IC_1": {...}},
        "initialisation": {...},
        "time_settings": {...},
        "convergence_control": {...},
        "numerical_scheme": {...},
        "output_settings": {
            "report": {...},
            "solution": {...},
        },
    },
    "model": {
        "<mesh_name>": {
            "mesh": "<path.h5>",
            "boundary_conditions": {"BC_1": {...}},
            "fluid_zones": {"FZ_1": {...}},
            "transforms": {...},
        },
    },
}
```

- `solver`: [`solver_settings`](/reference/solver/solver-settings), [`equations`](/reference/solver/equations), [`fluid_properties`](/reference/solver/fluid-properties), [`reference_conditions`](/reference/solver/reference-conditions), [`initialisation`](/reference/solver/initialisation), [`time_settings`](/reference/solver/time-settings), [`convergence_control`](/reference/solver/convergence-control), [`numerical_scheme`](/reference/solver/numerical-scheme), [`output_settings`](/reference/solver/output-settings) ([`report`](/reference/solver/output-settings#report), [`solution`](/reference/solver/output-settings#solution))
- `model`: [`mesh`](/reference/model#mesh), [`boundary_conditions`](/reference/model/boundary-conditions), [`fluid_zones`](/reference/model/fluid-zones), [`transforms`](/reference/model/transforms)
