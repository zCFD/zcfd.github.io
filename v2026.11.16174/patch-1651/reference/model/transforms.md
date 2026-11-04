---
title: transforms
section: reference
---

# transforms

Placement and motion of the mesh. Coordinates go through 'scale', then 'transform', then 'motion'.

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `scale` | list of float | `[1, 1, 1]` | Factors that multiply the mesh file's x, y and z coordinates, for example to convert inches to metres. |
| `transform` | list or value or Python function, or a Python function | not set | Static placement of the scaled mesh, applied once when the mesh is read: a 4x4 affine matrix whose translation part is in metres, or a function of the scaled node position, called as f(*, location); it returns the placed position as three numbers. |
| [`motion`](/reference/model/transforms/motion) | choice of settings blocks |  | Rigid motion of the placed mesh, or the frame its flow is solved in. |

::: {.deck title="transforms"}
```python
parameters = {
    "model": {
        "<mesh>": {
            "transforms": {
                "scale": [1.0, 1.0, 1.0],
                "transform": [...],
                "motion": {...},
            },
            ...
        },
    },
    ...
}
```
:::

## scale

Factors that multiply the mesh file's x, y and z coordinates, for example to convert inches to metres. Coordinates go through 'scale', then 'transform', then 'motion'.

::: facts
**Type** list of float · **Default** `[1, 1, 1]`
:::

## transform

Static placement of the scaled mesh, applied once when the mesh is read: a 4x4 affine matrix whose translation part is in metres, or a function of the scaled node position, called as f(*, location); it returns the placed position as three numbers. Coordinates go through 'scale', then 'transform', then 'motion'.

::: facts
**Type** list or value or Python function, or a Python function · **Default** not set
:::

