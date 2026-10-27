---
title: axes
section: reference
---

# axes

Body axes the angle of attack and the forces are measured in. Alpha turns from forward towards up; drag lies along the flow and lift at right angles to it, towards up.

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `forward` | choice | `+x` | Body axis pointing forward, into the oncoming flow. |
| `up` | choice | `+z` | Body axis pointing up. |

::: {.deck title="axes"}
```python
parameters = {
    "model": {
        "<mesh>": {
            "boundary conditions": {
                "<name>": {
                    "target": {
                        "axes": {
                            "forward": "+x",
                            "up": "+z",
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

## forward

Body axis pointing forward, into the oncoming flow.

::: facts
**Type** choice · **Default** `+x`
:::

| Value | What it does |
| --- | --- |
| `+x` (default) |  |
| `-x` |  |
| `+y` |  |
| `-y` |  |
| `+z` |  |
| `-z` |  |

## up

Body axis pointing up. Lift is positive towards it.

::: facts
**Type** choice · **Default** `+z`
:::

| Value | What it does |
| --- | --- |
| `+x` |  |
| `-x` |  |
| `+y` |  |
| `-y` |  |
| `+z` (default) |  |
| `-z` |  |

