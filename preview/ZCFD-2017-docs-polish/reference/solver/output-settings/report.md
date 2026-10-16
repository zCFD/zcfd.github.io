---
title: report
section: reference
---

# report

Report and monitoring settings

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `frequency` | int, >= 1 | required | Report frequency (every N cycles) |
| `variables` | list of str | not set | Variables to include in reports |
| [`monitor`](/reference/solver/output-settings/report/monitor) | named settings blocks |  | Monitor point configuration |
| [`forces`](/reference/solver/output-settings/report/forces) | named settings blocks |  | Force calculation zones |
| [`mass flow`](/reference/solver/output-settings/report/mass-flow) | named settings blocks |  | Mass flow calculation zones |
| `scale residuals by volume` | bool | `False` | Scale residuals by cell volume in reports |
| `residual statistics` | bool | `True` | Add the infinity norm of the true residual, its RMS, the participation ratio Neff and the worst cell's share of the total to the report, four columns per equation. |

::: {.deck title="report"}
```python
parameters = {
    "solver": {
        "output settings": {
            "report": {
                "frequency": <int>,
                "variables": [...],
                "monitor": {...},
                "forces": {...},
                "mass flow": {...},
                "scale residuals by volume": False,
                "residual statistics": True,
            },
            ...
        },
        ...
    },
    ...
}
```
:::

## residual statistics

Add the infinity norm of the true residual, its RMS, the participation ratio Neff and the worst cell's share of the total to the report, four columns per equation. Neff is the number of cells the residual is effectively spread over, so a small value against a large mesh means the field is converged everywhere except a handful of cells; the resshare_* output variables show which. On by default; set it False to save an extra pass over the residual field and two MPI reductions per report.

::: facts
**Type** bool · **Default** `True`
:::

