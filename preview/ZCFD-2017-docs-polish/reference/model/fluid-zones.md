---
title: fluid zones
section: reference
---

# fluid zones

Fluid zone models (e.g. porous, actuator disc).

| Type | What it is |
| --- | --- |
| [momentum](/reference/model/fluid-zones/momentum) | Momentum source fluid zone. |
| [rotating](/reference/model/fluid-zones/rotating) | A rotating frame on mesh cell zones (MRF); the mesh stays still. |
| [disc](/reference/model/fluid-zones/disc) | Actuator disc fluid zone. |
| [porous](/reference/model/fluid-zones/porous) | Porous media fluid zone. |
| [canopy](/reference/model/fluid-zones/canopy) | Canopy model fluid zone for atmospheric boundary layer simulations with vegetation. |
| [abl](/reference/model/fluid-zones/abl) | Atmospheric boundary layer fluid zone, applied to the whole mesh. |
| [idw transform](/reference/model/fluid-zones/idw-transform) | Inverse Distance Weighting transform fluid zone. |
| [rbf transform](/reference/model/fluid-zones/rbf-transform) | Radial Basis Function transform fluid zone.  Full RBF when base_point_fraction=1.0 (default), Multiscale RBF when base_point_fraction < 1.0. |

