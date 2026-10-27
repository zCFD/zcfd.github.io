---
title: harmonic initial state
section: reference
---

# harmonic initial state

Starts every mode on its harmonic response to a point force, instead of at rest

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `location` | vector (3 floats) | required | Point the force acts at; the force there is written to the modal history |
| `force` | vector (3 floats) | required | Force vector (N); its magnitude sets each mode's initial displacement and velocity |
| `frequency` | float | required | Frequency of the harmonic force (Hz) |

::: {.deck title="harmonic initial state"}
```python
parameters = {
    "model": {
        "<mesh>": {
            "boundary conditions": {
                "<name>": {
                    "fsi": {
                        "harmonic initial state": {
                            "location": <[x, y, z]>,
                            "force": <[x, y, z]>,
                            "frequency": <float>,
                        },
                        ...
                    },
                    ...
                },
            },
            ...
        },
    },
    ...
}
```
:::

