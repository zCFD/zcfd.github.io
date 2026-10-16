var e=`
# Choosing a spatial scheme

Which spatial order, reconstruction and inviscid flux scheme should the compressible solver use?

Keep the defaults for general work: second order, \`muscl\` reconstruction from Green\u2013Gauss gradients, and the \`roe\`
flux. Use first order only to start a difficult case, through
[\`first_order_cycles\`](/reference/solver/numerical-scheme#first-order-cycles). Use \`hllc\` or \`rusanov\` for strong
shocks, and a \`low-diss\` variant for scale-resolving simulations.

These settings are all in \`numerical_scheme\`:

\`\`\`json
{
  "numerical_scheme": {
    "order": "second",
    "reconstruction": "muscl",
    "gradient": "green-gauss",
    "inviscid_flux_scheme": "roe"
  }
}
\`\`\`

A finite-volume solver stores one value of each variable per cell. The flux through a face needs a
state on each side. The spatial order sets the accuracy of those states. The reconstruction sets how they are built
from cell values and gradients. The inviscid flux scheme turns the pair into a flux. A slope
limiter bounds the reconstruction near discontinuities; see [Choosing a limiter](choosing-a-limiter.md).

## Spatial order {#spatial-order}

[\`order\`](/reference/solver/numerical-scheme#order) sets the order of accuracy of the face states.

| \`order\`                | Face states                                                                                    |
| ---------------------- | ---------------------------------------------------------------------------------------------- |
| \`first\`                | the cell values; stable but diffusive                                                          |
| \`second\` (the default) | reconstructed from the cell values and gradients, for every variable                           |
| \`euler_second\`         | density, velocity and pressure reconstructed at second order; turbulence variables first order |

At first order a discontinuity spreads over several cells, and the error falls only linearly with mesh spacing.
Second order halves the error on the shock tube below. Use it for production work. The incompressible
solver also accepts \`central\`.

[\`first_order_cycles\`](/reference/solver/numerical-scheme#first-order-cycles) runs that number of cycles at first
order, then switches to the chosen order. It helps a case that diverges from a uniform initial state.

::: {.demo setting="reference/solver/numerical-scheme#order" values="first, second" case="shocktube" figure="shocktube-order"}
![Density along a shock tube at first and second order, against the analytic solution](/images/shocktube-order.svg "First order spreads the contact and the shock over several times as many cells. Second order halves the L1 density error, from 0.0181 to 0.0088.")

Both runs use the Roe scheme and explicit three-stage Runge\u2013Kutta on the same mesh; only the spatial order changes.
:::

## Reconstruction {#face-reconstruction}

At second order each side of a face takes its cell value plus an increment. For the left cell $L$ of face $f$, with
right neighbour $R$:

$$
u_{L,f} = u_L + \\phi_L \\left[ (1 - \\kappa)\\, \\nabla u_L \\cdot (\\mathbf{x}_f - \\mathbf{x}_L) + \\tfrac{1}{2}\\kappa\\, (u_R - u_L) \\right]
$$

and the right side is built in the same way from cell $R$. The first term extrapolates the cell gradient to the face.
The second is the jump between the two cells. The blend weight $\\kappa$ is 1/3. The limiter value $\\phi$ lies between 0 and 1.
$\\phi = 1$ gives the full reconstruction. $\\phi = 0$ gives first order on that side of the face. The reconstructed variables
are density, velocity and pressure, and the turbulence variables when they are solved.

[\`reconstruction\`](/reference/solver/numerical-scheme#reconstruction) selects how the backward difference for a
one-dimensional limiter is formed. Without limiting, all options give the same face states.

| \`reconstruction\`      | Backward difference for the limiter                                  |
| --------------------- | -------------------------------------------------------------------- |
| \`muscl\` (the default) | the cell gradient along twice the cell-to-face vector                |
| \`umuscl\`              | the cell gradient along the full vector between the two cell centres |
| \`lpumuscl\`            | as \`muscl\`                                                           |

The two forms differ only where a face does not lie midway between the cell centres, and only with the one-dimensional
limiters. The cell-based limiters compute their own bound, so the reconstruction does not affect them.

[\`permit_backward_difference_during_reconstruction\`](/reference/solver/numerical-scheme#permit-backward-difference-during-reconstruction)
switches the one-dimensional limiters to a backward difference taken from the cell gradient alone, on faces where the
two cell-to-face vectors lie within 45\u00b0 of each other. It is off by default.

### Gradients {#gradients}

The reconstruction and the cell-based limiters read the cell gradients.
[\`gradient\`](/reference/solver/numerical-scheme#gradient) selects how they are computed.

| \`gradient\`                  | Method                                                                     |
| --------------------------- | -------------------------------------------------------------------------- |
| \`green-gauss\` (the default) | the sum of face values times face areas, divided by the cell volume        |
| \`least-squares\`             | the least-squares fit to the differences between a cell and its neighbours |

The face values in the Green\u2013Gauss sum are weighted by inverse distance from the two cell centres.
[\`linear_gradients\`](/reference/solver/numerical-scheme#linear-gradients) replaces that weighting with a plain average.
It has no effect with \`least-squares\`.

## Inviscid flux scheme {#choosing-the-flux-scheme}

[\`inviscid_flux_scheme\`](/reference/solver/numerical-scheme#inviscid-flux-scheme) selects the approximate Riemann
solver that turns the two face states into a flux.

| \`inviscid_flux_scheme\` | Scheme                                                                                     |
| ---------------------- | ------------------------------------------------------------------------------------------ |
| \`roe\` (the default)    | Roe's linearised solver; each wave has its own dissipation                                |
| \`hllc\`                 | the HLLC solver, which resolves the contact and shear waves                                |
| \`rusanov\`              | local Lax\u2013Friedrichs: one dissipation scaled by the fastest wave speed; the most diffusive |
| \`roe low-diss\`         | \`roe\` with its dissipation scaled down by a sensor                                         |
| \`hllc low-diss\`        | \`hllc\` with its dissipation scaled down by a sensor                                        |

[\`entropy_fix\`](/reference/solver/numerical-scheme#entropy-fix) floors the Roe wave speeds at that fraction of the
largest. This adds dissipation where a wave speed passes through zero. It is zero by default. The other schemes
ignore it.

The \`low-diss\` variants reduce the upwind dissipation where the flow is resolved. This stops resolved turbulence in a DES
or LES being damped. [\`roe_low_dissipation_sensor\`](/reference/solver/numerical-scheme#roe-low-dissipation-sensor)
selects the sensor: \`FD\`, \`NTS\` or \`DES\`. The default, \`NONE\`, keeps the full dissipation. A \`low-diss\` scheme
therefore needs a sensor to differ from its base scheme.
[\`roe_dissipation_sensor_minimum\`](/reference/solver/numerical-scheme#roe-dissipation-sensor-minimum) is the floor on
the scaled dissipation.
[\`roe_low_dissipation_sensor_parameter\`](/reference/solver/numerical-scheme#roe-low-dissipation-sensor-parameter)
is the field the sensor reads.

::: {.demo setting="reference/solver/numerical-scheme#inviscid-flux-scheme" values="roe, rusanov" case="shocktube" figure="shocktube-inviscid-flux-scheme"}
![Density along a shock tube for the Roe and Rusanov flux schemes, against the analytic solution](/images/shocktube-inviscid-flux-scheme.svg "Rusanov rounds the head and tail of the rarefaction more than Roe. Its L1 density error is 0.0110 against 0.0088 for Roe, about 26 per cent higher. Both place the contact and the shock in the same cells.")

Both runs are second order with the van Albada limiter and explicit three-stage Runge\u2013Kutta on the same mesh; only the flux scheme changes.
:::

## Reference entries

- [\`order\`](/reference/solver/numerical-scheme#order) and
  [\`first_order_cycles\`](/reference/solver/numerical-scheme#first-order-cycles)
- [\`reconstruction\`](/reference/solver/numerical-scheme#reconstruction) and
  [\`permit_backward_difference_during_reconstruction\`](/reference/solver/numerical-scheme#permit-backward-difference-during-reconstruction)
- [\`gradient\`](/reference/solver/numerical-scheme#gradient) and
  [\`linear_gradients\`](/reference/solver/numerical-scheme#linear-gradients)
- [\`inviscid_flux_scheme\`](/reference/solver/numerical-scheme#inviscid-flux-scheme) and
  [\`entropy_fix\`](/reference/solver/numerical-scheme#entropy-fix)
- [\`roe_low_dissipation_sensor\`](/reference/solver/numerical-scheme#roe-low-dissipation-sensor)
- [\`limiter\`](/reference/solver/numerical-scheme#limiter), on [Choosing a limiter](choosing-a-limiter.md)
`;export{e as default};