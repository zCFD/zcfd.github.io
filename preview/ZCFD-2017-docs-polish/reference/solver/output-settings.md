---
title: output settings
section: reference
---

# output settings

Default output variables and monitors for all meshes.

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| [`solution`](/reference/solver/output-settings/solution) | settings block |  | Solution file output settings |
| [`report`](/reference/solver/output-settings/report) | settings block |  | Report and monitoring settings |
| `compute average and rms` | bool | `False` | Compute time-averaged and RMS statistics |
| `average start time cycle` | int, >= 0 | `0` | Cycle to start averaging |
| `output directory` | str | not set | Output directory path |

::: {.deck title="output settings"}
```python
parameters = {
    "solver": {
        "output settings": {
            "solution": {...},
            "report": {...},
            "compute average and rms": False,
            "average start time cycle": 0,
            "output directory": <str>,
        },
        ...
    },
    ...
}
```
:::

