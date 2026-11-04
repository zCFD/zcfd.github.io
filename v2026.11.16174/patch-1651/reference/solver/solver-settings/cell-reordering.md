---
title: cell reordering
section: reference
---

# cell reordering

Cell and face reordering options for cache locality and colouring balance.

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `rcm` | bool | `False` | Reverse Cuthill-McKee bandwidth-reducing cell reordering |
| `sloan` | bool | `False` | Sloan profile-reducing cell reordering |
| `sfc` | bool | `True` | Space-filling-curve cell reordering |
| `sfc curve` | choice | `hilbert` | Space-filling curve used when sfc is enabled |
| `face sort` | bool | `True` | Sort faces within each colour by their lowest cell index |

::: {.deck title="cell reordering"}
```python
parameters = {
    "solver": {
        "solver settings": {
            "cell reordering": {
                "rcm": False,
                "sloan": False,
                "sfc": True,
                "sfc curve": "hilbert",
                "face sort": True,
            },
            ...
        },
        ...
    },
    ...
}
```
:::

## sfc curve

Space-filling curve used when sfc is enabled

::: facts
**Type** choice · **Default** `hilbert`
:::

| Value | What it does | When to use it |
| --- | --- | --- |
| `hilbert` (default) | Orders each partition's interior cells along a Hilbert curve through their centroids. The curve has no jumps, so cells close in the ordering are close in space. | The default. The ordering is kept only if it reduces the cell-adjacency profile. |
| `morton` | Orders each partition's interior cells along a Morton (Z-order) curve, which interleaves the bits of the centroid coordinates. The curve jumps between distant regions. | An alternative to `hilbert`. It too is kept only if it reduces the cell-adjacency profile. |

