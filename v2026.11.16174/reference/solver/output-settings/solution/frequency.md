---
title: frequency
section: reference
---

# frequency

Output frequency (every N cycles)

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `surface data` | int, >= 1 | `100000000` | Frequency for surface variable output |
| `volume data` | int, >= 1 | `100000000` | Frequency for volume variable output |
| `volume interpolate` | int, >= 1 | `100000000` | Frequency for volume data interpolation |
| `fwh interpolate` | int, >= 1 | `100000000` | Frequency for FWH surface interpolation |
| `fwh wall data` | int, >= 1 | `100000000` | Frequency for FWH wall data output |
| `checkpoint` | int, >= 1 | `100000000` | Frequency for writing checkpoint/restart files |
| `volume data start` | int, >= 0 | `1` | Cycle to start volume data output |
| `surface data start` | int, >= 0 | `1` | Cycle to start surface data output |
| `volume interpolate start` | int, >= 0 | `1` | Cycle to start volume data interpolation |
| `checkpoint start` | int, >= 0 | `1` | Cycle to start writing checkpoint/restart files |
| `fwh interpolate start` | int, >= 0 | `1` | Cycle to start FWH surface interpolation |
| `fwh wall data start` | int, >= 0 | `1` | Cycle to start FWH wall data output |

::: {.deck title="frequency"}
```python
parameters = {
    "solver": {
        "output settings": {
            "solution": {
                "frequency": {
                    "surface data": 100000000,
                    "volume data": 100000000,
                    "volume interpolate": 100000000,
                    "fwh interpolate": 100000000,
                    "fwh wall data": 100000000,
                    "checkpoint": 100000000,
                    "volume data start": 1,
                    "surface data start": 1,
                    "volume interpolate start": 1,
                    "checkpoint start": 1,
                    "fwh interpolate start": 1,
                    "fwh wall data start": 1,
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

