---
title: solver
section: reference
---

# solver

Global solver configuration and overrideable defaults

| Key | What it holds |
| --- | --- |
| [solver settings](/reference/solver/solver-settings) |  |
| [fluid properties](/reference/solver/fluid-properties) | Fluid model properties and definition |
| [reference conditions](/reference/solver/reference-conditions) | Dictionary of reference conditions used throughout the simulation |
| [initialisation](/reference/solver/initialisation) | Default initialisation and restart settings for all meshes. |
| [equations](/reference/solver/equations) |  |
| [time settings](/reference/solver/time-settings) | Physical time layout (steady, global or dual timestepping) |
| [convergence control](/reference/solver/convergence-control) | Compressible pacing scheme (required for steady/DTS) |
| [create overset halos](/reference/solver/create-overset-halos) | Search for overset donors at the halo cell centre rather than at the boundary face centre, on the background-to-overset direction. The halo centre is the interior cell centre mirrored across the face, and that is where the solver uses the value: the interface flux extrapolates the halo from it and the boundary gradient averages it with the interior cell. Sampling at the face centre instead puts the value half a cell from where it is used; on the eulervortex static overset case that leaves a 416 Pa pressure overshoot at the interface, against 4 Pa with halo centres -- what the conformal mesh gives. A uniform free stream cannot show the difference. |
| [numerical scheme](/reference/solver/numerical-scheme) | Default compressible spatial numeric scheme |
| [output settings](/reference/solver/output-settings) | Default compressible output variables |

