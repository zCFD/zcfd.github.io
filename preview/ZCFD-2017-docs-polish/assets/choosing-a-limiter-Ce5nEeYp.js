var e=`
# Choosing a limiter

Which slope limiter should bound the second-order reconstruction of the compressible solver?

## What a limiter does {#what-a-limiter-does}

At second order the solver builds each face state from the cell value plus an increment taken from the cell gradient;
see [Reconstruction](choosing-a-spatial-scheme.md#face-reconstruction). In smooth flow this increment is accurate. Across a
shock or a contact the gradient is large. The extrapolated face value can then overshoot the values in the
neighbouring cells. The overshoot creates a new maximum or minimum. This grows into oscillations on either side of the
discontinuity and can drive density or pressure negative.

A slope limiter prevents this. It multiplies the increment by a factor between 0 and 1. The factor is chosen so that the face value
creates no new maximum or minimum. In smooth regions the factor stays at or near 1, so the reconstruction keeps its
second-order accuracy. At a discontinuity it falls towards 0, and the face takes the cell value, as at first order.

The limiter has two costs. It also acts at smooth extrema, such as the peak of a vortex or the suction peak on an
aerofoil. It clips them, which lowers the accuracy there. Where its factor switches between iterations, the
residual can stall at a noise floor instead of converging.

## The limiters {#limiter-options}

The limiters fall into two families. A one-dimensional limiter works face by face. It compares the jump across the
face with a backward difference taken from the cell gradient. A cell-based limiter bounds every face value of a cell by
the range of values over all of its neighbours. This is the stricter guarantee.

| \`limiter\`                  | Family          | Behaviour                                                                                 |
| -------------------------- | --------------- | ----------------------------------------------------------------------------------------- |
| \`van albada\` (the default) | one-dimensional | smooth; the most diffusive of the three in the shock-tube comparison below                             |
| \`van leer\`                 | one-dimensional | smooth; slightly more compressive than van Albada                                         |
| \`symmetric ratio\`          | one-dimensional | no limiting over a wide range of difference ratios; the least dissipative of the three  |
| \`none\`                     | \u2014               | no limiting: second order everywhere, with overshoots at discontinuities                  |
| \`barth jespersen\`          | cell-based      | bounded by the neighbours; limits wherever the bound is active, and can stall the residual    |
| \`michalak gooch\`           | cell-based      | bounded by the neighbours; smooth; switches off in smooth flow                           |
| \`venkatakrishnan\`          | cell-based      | bounded by the neighbours; switches off in smooth flow; its shape has one kink |

## Which to use {#which-to-use}

Keep the default, \`van albada\`, for general work. Where the reconstructed face values must stay within the range of
the neighbouring cells, as they must across a strong shock, use \`michalak gooch\`: it is bound preserving, smooth enough
not to stall the residual, and switches itself off in smooth flow so that second-order accuracy survives mesh
refinement. Use \`none\` only for smooth flow with no shocks or strong gradients.

The choice is made with [\`limiter\`](/reference/solver/numerical-scheme#limiter) in \`numerical_scheme\`:

\`\`\`json
{ "numerical_scheme": { "order": "second", "limiter": "michalak gooch" } }
\`\`\`

The limiter acts on the second-order reconstruction only. It has no effect when
[\`order\`](/reference/solver/numerical-scheme#order) is \`"first"\`, nor during the cycles covered by
[\`first_order_cycles\`](/reference/solver/numerical-scheme#first-order-cycles); see
[Choosing a spatial scheme](choosing-a-spatial-scheme.md). It belongs to the compressible solver;
the incompressible solver limits its gradients through
[\`gradient_limiter_type\`](/reference/solver/equations#gradient-limiter-type) and
[\`gradient_limiter\`](/reference/solver/equations#gradient-limiter) in \`equations\` instead.

::: {.demo setting="reference/solver/numerical-scheme#limiter" values="van albada, van leer, symmetric ratio, barth jespersen, michalak gooch" case="shocktube" figure="shocktube-limiter"}
![Density across the contact and the shock of a shock tube for five limiters, against the analytic solution](/images/shocktube-limiter.svg "The five limiters place the contact and the shock in the same cells. Their L1 density errors lie between 0.0082 and 0.0088, within 7 per cent of one another. Van Albada, the default, is the most diffusive, and the others overshoot slightly at the top of the contact.")

Every run is second-order Roe with implicit dual time stepping on the same mesh; only the limiter changes.
:::

## One-dimensional limiters {#one-dimensional-limiters}

\`van albada\`, \`van leer\` and \`symmetric ratio\` are functions $\\psi(a, b)$ of two directional differences: $a$ is the
jump across the face and $b$ a backward difference reconstructed from the cell gradient. Each is applied independently
to every reconstructed variable and to each side of every face, and $\\psi$ scales the whole reconstruction increment on
that side.

They are regularised by a threshold

$$
\\varepsilon = 0.001 \\cdot \\tfrac{1}{2}(u_L + u_R) + 10^{-8}
$$

which is proportional to the magnitude of the variable itself; \`symmetric ratio\` uses its absolute value. For a
variable that changes sign, a velocity component for example, $\\varepsilon$ becomes small where the variable passes
through zero, and the limiter then acts on correspondingly smaller variations.

### The symmetric-ratio plateau {#symmetric-ratio-plateau}

Writing $r = b/a$ for the ratio of the two differences, \`symmetric ratio\` is

$$
\\psi = \\min\\left(1, \\frac{4\\min(a, b)}{a + b}\\right)
$$

It is zero for $r \\leq 0$, rises as $4r/(1 + r)$, is exactly 1 across the whole plateau $r \\in [1/3, 3]$, and then
decays as $4/(1 + r)$. It satisfies $\\psi(1/r) = \\psi(r)$. The wide plateau is why it is the least dissipative of the
one-dimensional limiters: \`van albada\` and \`van leer\` reach $\\psi = 1$ only at $r = 1$ exactly.

| $r$ | \`symmetric ratio\` | \`van albada\` | \`van leer\` |
| --- | ----------------- | ------------ | ---------- |
| 0.1 | 0.364             | 0.198        | 0.331      |
| 1/3 | 1.000             | 0.600        | 0.750      |
| 1   | 1.000             | 1.000        | 1.000      |
| 3   | 1.000             | 0.600        | 0.750      |
| 10  | 0.364             | 0.198        | 0.331      |

## Cell-based limiters {#cell-based-limiters}

\`barth jespersen\`, \`michalak gooch\` and \`venkatakrishnan\` are multidimensional. They bound the reconstructed face value
by the range of values over the cell's whole set of face neighbours, which the one-dimensional limiters do not. They
are evaluated per cell, in a pass of their own, and the reconstruction then reads the result.

For cell $i$, take $u_{\\max}$ and $u_{\\min}$ over its face neighbours, and write

$$
\\Delta_f = \\nabla u_i \\cdot (\\mathbf{x}_f - \\mathbf{x}_i)
$$

for the unlimited extrapolation to face $f$. Define

$$
y_f =
\\begin{cases}
(u_{\\max} - u_i)/\\Delta_f & \\Delta_f > 0 \\\\
(u_{\\min} - u_i)/\\Delta_f & \\Delta_f < 0
\\end{cases}
$$

Then $\\phi_i = \\min_f P(y_f)$, where the shape $P(y)$ distinguishes the three limiters:

| \`limiter\`         | $P(y)$                                            | Continuity                             |
| ----------------- | ------------------------------------------------- | -------------------------------------- |
| \`barth jespersen\` | $\\min(1, y)$                                      | $C^0$: a kink at $y = 1$               |
| \`michalak gooch\`  | $y - \\tfrac{4}{27}y^3$ for $y < 3/2$, otherwise 1 | $C^1$, and never above $\\min(1, y)$    |
| \`venkatakrishnan\` | $\\min\\left(1, (y^2 + 2y)/(y^2 + y + 2)\\right)$    | $C^0$: the clip adds a kink at $y = 2$ |

A kink makes the limiter value flicker between cycles, which can hold the residual at a noise floor. That is the case
against \`barth jespersen\`, and the reason \`michalak gooch\` is preferred.

::: {.note}
$\\phi$ scales the whole reconstruction increment, the gradient term and the face-jump term together. $\\phi = 0$ in a
cell therefore gives first order there exactly, and $\\phi = 1$ the full $\\kappa = 1/3$ reconstruction.
:::

### Switching off in smooth flow {#limiter-coefficient}

\`michalak gooch\` and \`venkatakrishnan\` blend $\\phi$ towards 1 wherever the flow is smooth. A cell counts as smooth
when the range $u_{\\max} - u_{\\min}$ over its neighbours, normalised by the reference state, is small against the
threshold

$$
\\varepsilon^2 = \\left(\\frac{K h}{L_{ref}}\\right)^3
$$

where $K$ is [\`limiter_coefficient\`](/reference/solver/numerical-scheme#limiter-coefficient), $h$ the cell length scale
and $L_{ref}$ the [\`reference_length\`](/reference/solver/reference-conditions#reference-length) of the reference
condition named by \`reference\` in \`initialisation\`. $K$ defaults to 5.0. A larger value treats more of the flow as
smooth, and so limits less. The cube falls faster than the $O(h^2)$ reconstruction error, so under refinement the
limiter switches itself off in smooth regions and formal order is kept. \`barth jespersen\` has no such switch and limits
wherever the bound binds; the one-dimensional limiters ignore \`limiter_coefficient\`.

## Freezing the limiter

If a few cells whose limiter switches between iterations hold the residual at a noise floor, freeze the limiter with
[\`freeze_limiter_cycle\`](/reference/solver/numerical-scheme#freeze-limiter-cycle). With a cell-based limiter the values
are held per cell rather than per face. See [Limiter switching](../troubleshooting/troubleshooting.md#limiter-switching)
for when the freeze applies under each kind of time marching.

## Reference entries

- [\`limiter\`](/reference/solver/numerical-scheme#limiter), with the formula for each option
- [\`limiter_coefficient\`](/reference/solver/numerical-scheme#limiter-coefficient)
- [\`freeze_limiter_cycle\`](/reference/solver/numerical-scheme#freeze-limiter-cycle)
- [\`order\`](/reference/solver/numerical-scheme#order), on [Choosing a spatial scheme](choosing-a-spatial-scheme.md)
`;export{e as default};