---
title: Unreleased
section: release-notes
order: 0
---

# Unreleased

- The `numerical_scheme` `limiter` value `'barth jespersen'` now selects the multidimensional Barth & Jespersen limiter. It previously selected the one-dimensional function now called `'symmetric ratio'`, which takes no minimum or maximum over the cell's neighbours and so was never the Barth-Jespersen limiter. Decks that relied on the old behaviour must change to `'symmetric ratio'`.
- Added the `'michalak gooch'` and `'venkatakrishnan'` limiter options, and a `limiter_coefficient` key.
- Removed the `'immersed wall'` boundary condition, its `immersed_wall_normal_type` key, the `immersed_boundary_surface` output key and the `immersed boundary yplus`, `immersed boundary friction velocity`, `immersed boundary vector` and `immersed boundary normal` output variables. Decks that use them are rejected at input validation. `update_input` asks the engineer to choose a wall type for an `'immersed wall'` boundary in a v1 deck.
