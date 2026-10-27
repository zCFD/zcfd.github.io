---
title: roughness
section: reference
---

# roughness

Surface roughness; unset, the wall is smooth.

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `type` | choice | required | Which roughness measure the value gives. |
| `scalar` | float, >= 0 m | not set | Uniform roughness over the wall, as the measure 'type' names. |
| `field` | str | not set | VTP file with a point array named 'Roughness'; each wall face takes the nearest point's value. |
| `thermal model` | choice | `owen thomson` | How roughness affects wall heat transfer under the compressible wall function. |

::: {.deck title="roughness"}
```python
parameters = {
    "model": {
        "<mesh>": {
            "boundary conditions": {
                "<name>": {
                    "roughness": {
                        "type": <choice>,
                        "scalar": <float>,
                        "field": <str>,
                        "thermal model": "owen thomson",
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

## type

Which roughness measure the value gives.

::: facts
**Type** choice · **Required** yes
:::

| Value | What it does |
| --- | --- |
| `height` | The value is the equivalent sand-grain height of the roughness elements. |
| `length` | The value is the aerodynamic roughness length, converted internally to a sand-grain height of length / 0.03. |

Guidance: [Choosing a wall model › Roughness](/guide/choosing/choosing-a-wall-model#roughness)

## scalar

Uniform roughness over the wall, as the measure 'type' names.

::: facts
**Type** float, >= 0 m · **Default** not set · **Applies when** give either 'scalar' or 'field'
:::

## thermal model

How roughness affects wall heat transfer under the compressible wall function.

::: facts
**Type** choice · **Default** `owen thomson` · **Applies when** kind is 'wall function' and either temperature is set or heat flux is set
:::

| Value | What it does |
| --- | --- |
| `owen thomson` (default) | Adds a thermal sublayer resistance between the surface and the roughness crest, so the Stanton number rises less than the skin friction. |
| `reynolds analogy` | Omits that resistance, so the Stanton number rises in proportion to the skin friction. |

Guidance: [Choosing a wall model › Rough compressible walls](/guide/choosing/choosing-a-wall-model#rough-compressible-walls)

