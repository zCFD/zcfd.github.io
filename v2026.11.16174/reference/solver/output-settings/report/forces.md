---
title: forces
section: reference
---

# forces

Force calculation zones

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `zones` | list of zone ids | required | Zone IDs for force calculation |
| `name` | str | not set | Name of the force component |
| `reference area` | float, > 0 | `1` | Reference area for force coefficients |
| `reference length` | float, > 0 | `1` | Reference length for moment coefficients |
| `reference pressure` | float, >= 0 | `0` | Reference pressure for coefficients |
| `transform` | Python function, or a Python function | not set | Function applied to each force and moment vector before it is reported, called as f(*, vector); it returns the transformed vector as three numbers |
| `reference point` | vector (3 floats) | `[0, 0, 0]` | Reference point for moment calculations |
| `dimensional` | bool | `False` | Report dimensional forces (not coefficients) |
| `inertial frame` | bool | `True` | Report forces in inertial frame |

::: {.deck title="forces"}
```python
parameters = {
    "solver": {
        "output settings": {
            "report": {
                "forces": {
                    "<name>": {
                        "zones": [...],
                        "name": <str>,
                        "reference area": 1.0,
                        "reference length": 1.0,
                        "reference pressure": 0.0,
                        "transform": <function>,
                        "reference point": [0.0, 0.0, 0.0],
                        "dimensional": False,
                        "inertial frame": True,
                    },
                },
                ...
            },
            ...
        },
        ...
    },
    ...
}
```
:::

## transform

Function applied to each force and moment vector before it is reported, called as f(*, vector); it returns the transformed vector as three numbers

::: facts
**Type** Python function, or a Python function · **Default** not set
:::

Guidance: [Python functions in the deck › Transform Function](/guide/setting-up/python-functions-in-the-deck#transform-function)

