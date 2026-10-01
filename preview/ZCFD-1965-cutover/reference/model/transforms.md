---
title: transforms
section: reference
---

# transforms

Initial placement and dynamic rigid mesh motion.


## transform matrix

4x4 affine transformation matrix for the initial placement of the mesh.

list or value · not set by default


## scale

Mesh scaling factors for [x, y, z] directions.

list of numbers · not set by default


## transform func

Python function defining dynamic mesh motion (e.g. rotation/translation) for the entire mesh.

Python function · not set by default · accepts a Python function


::: {.deck title="transforms"}
```python
"transforms": {
    ...
},
```
:::

