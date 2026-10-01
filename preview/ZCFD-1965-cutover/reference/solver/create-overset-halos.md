---
title: create overset halos
section: reference
---

# create overset halos

Search for overset donors at the halo cell centre rather than at the boundary face centre, on the background-to-overset direction. The halo centre is the interior cell centre mirrored across the face, and that is where the solver uses the value: the interface flux extrapolates the halo from it and the boundary gradient averages it with the interior cell. Sampling at the face centre instead puts the value half a cell from where it is used; on the eulervortex static overset case that leaves a 416 Pa pressure overshoot at the interface, against 4 Pa with halo centres -- what the conformal mesh gives. A uniform free stream cannot show the difference.

