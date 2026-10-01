var e=`
# Choosing a time-marching scheme

Should the run be steady, globally time-stepped or dual time-stepped, and how should its pseudo-time loop be paced?

Run steady wherever the flow has a steady solution. For unsteady flow, use dual time stepping: each physical step is
converged by an inner pseudo-time loop, so the physical time step is set by the physics rather than by the smallest
cell. Use global time stepping only where every cell can afford the explicit time step of the smallest. For the pseudo-time loop, an implicit scheme allows a much larger CFL number, and so
far fewer cycles, at three to five times the memory of an explicit one.

| [\`time_settings\`](/reference/solver/time-settings)    | Physical time                                  | Pseudo-time loop           | \`convergence_control\` | Time accuracy from                       |
| ----------------------------------------------------- | ---------------------------------------------- | -------------------------- | --------------------- | ---------------------------------------- |
| \`{"type": "steady"}\`                                  | none                                           | the whole run              | required              | \u2014                                        |
| \`{"type": "unsteady", "kind": "global timestepping"}\` | one time step for every cell                   | none                       | must not be set       | the three-stage TVD Runge\u2013Kutta \`scheme\` |
| \`{"type": "unsteady", "kind": "dual time stepping"}\`  | one time step, each converged by an inner loop | within every physical step | required              | the backward difference \`order\`          |

The pseudo-time schemes, selected by [\`name\`](/reference/solver/convergence-control#scheme-name) under
\`convergence_control\`:

| \`name\`             | Kind                            | Linear solve                                                          | Use                                                          |
| ------------------ | ------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------ |
| \`"euler"\`          | explicit, one stage             | none                                                                  | new or problematic cases; the most stable starting point     |
| \`"runge kutta"\`    | explicit, multi-stage           | none                                                                  | explicit runs, usually with five stages; multigrid           |
| \`"implicit euler"\` | implicit                        | the assembled system, by [Petsc or AMGX](choosing-a-linear-solver.md) | the default implicit scheme                                  |
| \`"lu-sgs"\`         | implicit, matrix-free           | none; point-implicit sweeps                                           | lower memory and often faster cycles than \`"implicit euler"\` |
| \`"mf-gmres"\`       | implicit, matrix-free mean flow | restarted GMRES on the exact analytic Jacobian                        | between the two, without assembling the mean-flow matrix     |

## Time settings and convergence control

zCFD performs both steady-state and time-dependent simulations. A steady-state solution is marched in pseudo-time
towards convergence. A time-dependent simulation is either globally time-stepped, or uses local pseudo-time stepping
within a dual time-stepping iteration in physical time.

Two sibling dictionaries under \`solver\` control this:

- [\`time_settings\`](/reference/solver/time-settings) sets out physical time: whether the simulation is steady,
  globally time-stepped or dual time-stepped, and, for an unsteady run, the total time, the physical time step and
  the physical time order. \`type\` selects steady or unsteady operation, and for an unsteady run \`kind\` selects global
  or dual time stepping.
- [\`convergence_control\`](/reference/solver/convergence-control) sets how each pseudo-time step marches towards
  convergence: the number of cycles, the pseudo-time scheme, explicit or implicit, and the CFL number and its ramp.

::: {.warning}
\`convergence_control\` applies only to steady and dual time-stepping runs, since both drive an inner pseudo-time loop.
Global time stepping has no pseudo-time loop; it marches physical time directly. \`convergence_control\` must therefore
not be set when \`{"time_settings": {"kind": "global timestepping"}}\`, and a deck that sets both fails validation.
Global time stepping carries its own \`scheme\` inside \`time_settings\` instead (see
[Global time stepping](#global-time-stepping)).
:::

\`\`\`python
parameters = {
    "config_version": 2,
    "solver": {
        ...
        "time_settings": {...},
        "convergence_control": {
            "cycles": 5000,
            "scheme": {...},
            "cfl": 30.0,
        },
        ...
    },
    ...
}
\`\`\`

## Running steady state

For a steady-state simulation, set \`type\` to \`"steady"\`. It takes no further keys: a steady run has no physical time
layout, so \`total_time\`, \`time_step\` and \`kind\` are neither needed nor accepted, and all of its pacing comes from
\`convergence_control\`.

\`\`\`python
"time_settings": {
    "type": "steady",
},
\`\`\`

::: {.note}
Setting \`total_time\` equal to \`time_step\` under dual time stepping is rejected outright, as a validation error. Use
\`{"type": "steady"}\` for a steady-state run instead.
:::

## Global time stepping

Global time stepping (GTS) advances the solution in physical time alone, with the same physical time step in every
cell. There is no pseudo-time convergence loop, so \`convergence_control\` must not be set for a GTS run. Where a mesh
has very small cells, global time stepping is impractical, since every cell has to march at the pace of the smallest.

### Order of accuracy

Because GTS drives physical time directly, the \`scheme\` is the physical time integration, and carries the whole order
of accuracy of the run. There is no backward difference formula: the physical time derivative that dual time stepping
adds to the residual is not assembled under GTS, so \`order\` does not apply, and setting it is rejected. \`start\` is
rejected for the same reason: its steady start-up cycles need a pseudo-time loop to run in, and a GTS run has none. To
start from a converged field, restart the GTS run from a steady run's results instead.

\`scheme\` is therefore restricted to the one time-accurate explicit scheme zCFD carries, the three-stage TVD
Runge\u2013Kutta (SSP-RK3), which is third order in physical time. It is written either way:

\`\`\`python
"scheme": {"name": "runge kutta", "stage": 3},
"scheme": {"name": "runge kutta", "stage": "rk third order tvd"},
\`\`\`

Every other scheme is rejected, since each is either first order in physical time or not an explicit physical march
at all:

- \`"euler"\`, and \`"runge kutta"\` with \`stage: 1\`, are forward Euler, first order in time.
- \`"runge kutta"\` with \`stage: 4\` or \`5\` are Jameson-style low-storage schemes. Every stage is evaluated from the
  solution at time level _n_, and their penultimate-stage coefficients, 0.55 and 0.506, miss the 1/2 that a
  second-order scheme requires. They are formally first order, and exist to damp the error modes of a steady-state
  solve rather than to integrate physical time.
- \`"implicit euler"\`, \`"lu-sgs"\` and \`"mf-gmres"\` are pseudo-time machinery only, and cannot drive an explicit
  physical march.

Use \`kind: "dual time stepping"\` to run any of those. There they drive an inner pseudo-time loop, and the physical
time accuracy comes from \`order\` instead.

A globally time-stepped unsteady simulation:

\`\`\`python
"time_settings": {
    "type": "unsteady",
    "kind": "global timestepping",
    "total_time": 0.2,
    "time_step": 1.0e-5,
    "scheme": {
        "name": "runge kutta",
        "stage": 3,
    },
},
\`\`\`

::: {.note}
Global time stepping restricts every cell to the smallest time step, and should be used only for unsteady
simulations.
:::

## Dual time stepping

Dual time stepping (DTS) advances the solution in physical time, running an inner pseudo-time loop at each physical
time step to converge that step before advancing. The time integration uses the solution at the current physical
time step and the contribution of previous steps, through a backward difference formula;
[\`order\`](/reference/solver/time-settings#order) sets the order of the formula.

[\`start\`](/reference/solver/time-settings#start) initialises a DTS simulation with a number of steady-state
pseudo-time cycles before physical time stepping begins. These run at real-time cycle 0, with no physical time
derivative, so they are the same solve as a \`"steady"\` run of the same length. Physical time stepping begins at
real-time cycle 1, where the order of the time integration builds up from first order to \`order\`. Restarting a DTS
case from the results of a steady run, or from a results file written at the end of the start phase, skips real-time
cycle 0 and begins time-accurate stepping at once, with the restart field as the time history.

The pseudo-time scheme, CFL number and cycle count for each physical step are set in \`convergence_control\`, exactly
as for a steady run; see [Convergence control](#convergence-control).

The unsteady laminar cylinder sheds a vortex street at a particular Strouhal number. This deck runs it for 4 seconds
of physical time, at a physical time step of 0.002 seconds, small enough to capture the shedding, with 20 pseudo-time
cycles of multistage Runge\u2013Kutta per physical step to converge each step:

\`\`\`python
"time_settings": {
    "type": "unsteady",
    "kind": "dual time stepping",
    "total_time": 4.0,
    "time_step": 0.002,
    "order": 2,
    "start": 0,
},
"convergence_control": {
    "cycles": 20,
    "scheme": {"name": "runge kutta", "stage": 5},
    "cfl": {
        "cfl": 2.5,
        "cfl_ramp": [{"type": "exponential", "factor": 1.05, "initial": 0.1}],
    },
},
\`\`\`

The next uses an implicit pseudo-time scheme, so far fewer cycles are needed per physical step, and starts with 500
steady-state pseudo-time cycles before the unsteady simulation begins:

\`\`\`python
"time_settings": {
    "type": "unsteady",
    "kind": "dual time stepping",
    "total_time": tt,
    "time_step": tt / 400,
    "order": "second",
    "start": 500,
},
"convergence_control": {
    "cycles": 500,
    "scheme": {"name": "implicit euler", "stage": 1},
    "cfl": {
        "cfl": 15,
        "cfl_ramp": [{"type": "exponential", "factor": 1.02, "initial": 1.0}],
    },
},
\`\`\`

## Convergence control

\`convergence_control\` paces the inner pseudo-time loop towards convergence: how many cycles to run, which scheme
drives each pseudo-step, and, on the compressible solver, the CFL number that sizes it. It is required for steady and
dual time-stepping runs, and must be absent under global time stepping (see the warning under
[Time settings and convergence control](#time-settings-and-convergence-control)).

The rest of this section describes the compressible block. \`cycles\` is common to both solvers; the incompressible
block replaces \`scheme\` with the pressure-velocity coupling scheme, and takes no \`cfl\` (see
[Incompressible convergence control](#incompressible-convergence-control)).

\`\`\`python
"convergence_control": {
    "cycles": 5000,
    "scheme": {"name": "implicit euler"},
    "cfl": 30.0,
},
\`\`\`

### Cycles

[\`cycles\`](/reference/solver/convergence-control#cycles) is the total number of pseudo-time steps in a
[steady-state](#running-steady-state) simulation, or the number in each physical time step of a
[dual time-stepping](#dual-time-stepping) simulation.

For most explicit steady-state cases, 5000 cycles is a good starting value. Implicit simulations can use a higher CFL
number and so need fewer cycles; 100 to 500 is a good starting point for an implicit steady-state case.

\`\`\`python
"cycles": 5000,
\`\`\`

### Scheme

zCFD has five pseudo-time integration schemes: two explicit, \`"euler"\` and \`"runge kutta"\`, and three implicit,
\`"implicit euler"\`, \`"lu-sgs"\` and \`"mf-gmres"\`. All five serve steady runs and dual time-stepped unsteady runs.
Global time stepping takes only the three-stage TVD Runge\u2013Kutta (see [Global time stepping](#global-time-stepping)). A
case with an overset or sliding interface requires one of the implicit schemes (see
[Interface](choosing-boundary-conditions.md#interface)).

::: {.note}
The \`"euler"\` scheme has a single stage, and is the safest option for new or problematic cases.
:::

::: {.demo setting="reference/solver/convergence-control#scheme" values="implicit euler, runge kutta" case="cylinder" figure="cylinder-convergence-scheme"}
![Probe pressure coefficient against time behind a 2D laminar cylinder, with an implicit Euler and a Runge\u2013Kutta inner loop](/images/cylinder-convergence-scheme.svg "Implicit Euler sheds at a Strouhal number of 0.172 with 5 inner cycles per time step; Runge\u2013Kutta with multigrid sheds at 0.179 with 20. Both lie inside the case's validation band of 0.170 to 0.184. A time step costs 0.44 s with implicit Euler and 1.41 s with Runge\u2013Kutta.")

Both runs use dual time stepping with the same time step and mesh; only the inner-loop scheme, its CFL, its cycles and the multigrid levels change.
:::

#### name

The solution is integrated in pseudo-time by a scheme that is either explicit, with the variables driving the change
evaluated at the previous step, or implicit, with them evaluated at the current step. \`"euler"\` and \`"runge kutta"\`
are the explicit schemes; \`"implicit euler"\`, \`"lu-sgs"\` and \`"mf-gmres"\` the implicit ones.

An implicit scheme is more stable than an explicit one, and so can take a larger CFL number, and with it a larger
pseudo-time step.

::: {.note}
The cost of implicit time integration is memory: typically three to five times that of an explicit scheme.
:::

#### stage

The number of Runge\u2013Kutta stages in each pseudo-time step affects the order of temporal convergence and the largest
usable CFL number.

::: {.note}
Most cases run with Runge\u2013Kutta integration use five stages. This is a typical industry standard, and has proved
reliable for most cases.
:::

A five-stage explicit Runge\u2013Kutta scheme:

\`\`\`python
"convergence_control": {
    "scheme": {"name": "runge kutta", "stage": 5},
    ...
},
\`\`\`

#### implicit euler

The default implicit scheme. It solves the full linearised system at each pseudo-time step with the
[Petsc or AMGX linear solver](choosing-a-linear-solver.md). An implicit scheme with a ramped CFL number, typical of a
steady-state RANS case:

\`\`\`python
"convergence_control": {
    "scheme": {"name": "implicit euler"},
    "cfl": {
        "cfl": 100.0,
        "cfl_ramp": [{"type": "exponential", "factor": 1.1, "initial": 0.05}],
    },
    "cycles": 3000,
},
\`\`\`

#### lu-sgs

A matrix-free, point-implicit LU-SGS/DP-LUR scheme. It avoids assembling and inverting the full linear system,
trading some convergence rate for lower memory use and, often, a faster wall-clock time per cycle than
\`"implicit euler"\`. LU-SGS with a CFL ramp:

\`\`\`python
"convergence_control": {
    "scheme": {"name": "lu-sgs"},
    "cfl": {
        "cfl": 20.0,
        "cfl_ramp": [{"type": "exponential", "factor": 1.1, "initial": 0.05}],
    },
    "cycles": 30000,
},
\`\`\`

#### \`mf-gmres\`

A restarted GMRES solve of the mean-flow system that applies the exact analytic flux Jacobian matrix-free: no
mean-flow matrix is assembled. It sits between \`"implicit euler"\`, which assembles the matrix and solves it with AMG,
and \`"lu-sgs"\`, which relaxes without a Krylov method. Its solver settings sit on the scheme itself, not in
[\`linear_solver_options\`](choosing-a-linear-solver.md). \`"mf-gmres"\` is not available with the SAS turbulence model
or the SAS hybrid.

\`"mf-gmres"\` covers the mean flow only. The turbulence matrix is always assembled, and
[\`turbulence_solver\`](/reference/solver/convergence-control#scheme-turbulence-solver) chooses how it is solved:
\`"point-implicit"\` sweeps it matrix-free, and \`"amg"\` uses the assembled AMG solve. \`"point-implicit"\` is the default,
except where the backend forces \`"amg"\`: a CUDA build running on the host only, or HIP.

\`"mf-gmres"\` as FGMRES with the block-Jacobi preconditioner, for a transonic RANS wing:

\`\`\`python
"convergence_control": {
    "scheme": {
        "name": "mf-gmres",
        "flexible": True,
        "krylov_subspace": 30,
        "linear_tolerance": 0.1,
        "max_iterations": 60,
        "preconditioner": "block jacobi",
        "turbulence_solver": "point-implicit",
    },
    "cfl": 25.0,
    "cycles": 2000,
},
\`\`\`

Every setting is optional. The solver defaults are:

| Setting                                                                                                         | Default            | Effect                                                                                                                                                                                                                                                                                     |
| --------------------------------------------------------------------------------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [\`krylov_subspace\`](/reference/solver/convergence-control#scheme-krylov-subspace)                               | 10                 | Restart length m. The solver stores m+1 Krylov vectors, or 2m+1 with \`flexible\`, so this is the dominant storage cost; size it from the observed iteration count rather than padding it.                                                                                                   |
| [\`linear_tolerance\`](/reference/solver/convergence-control#scheme-linear-tolerance)                             | 0.1                | Relative residual drop required of the linear solve at each implicit step.                                                                                                                                                                                                                 |
| [\`max_iterations\`](/reference/solver/convergence-control#scheme-max-iterations)                                 | 40                 | Cap on the total Krylov iterations, across restarts, per implicit step.                                                                                                                                                                                                                    |
| [\`preconditioner\`](/reference/solver/convergence-control#scheme-preconditioner)                                 | \`"block jacobi"\`   | \`"block jacobi"\` inverts the exact analytic 5\u00d75 block diagonal, the same operator on the host and on a GPU. \`"lu-sgs"\` uses linearised symmetric Gauss\u2013Seidel sweeps. \`"lu-sgs nonlinear"\` uses the unlinearised sweep, and requires \`flexible: True\`. \`"none"\` applies no preconditioner. |
| [\`preconditioner_sweeps\`](/reference/solver/convergence-control#scheme-preconditioner-sweeps)                   | 2                  | Symmetric Gauss\u2013Seidel sweeps per application of the preconditioner (\`"lu-sgs"\` only).                                                                                                                                                                                                     |
| [\`preconditioner_over_relaxation\`](/reference/solver/convergence-control#scheme-preconditioner-over-relaxation) | 1.5                | Diagonal over-relaxation for the \`"lu-sgs"\` preconditioner sweeps.                                                                                                                                                                                                                         |
| [\`flexible\`](/reference/solver/convergence-control#scheme-flexible)                                             | \`False\`            | FGMRES instead of right-preconditioned GMRES. It permits a preconditioner that varies between iterations, at the cost of a second set of m Krylov vectors.                                                                                                                                 |
| [\`orthogonalisation\`](/reference/solver/convergence-control#scheme-orthogonalisation)                           | \`"mgs"\`            | \`"mgs"\` is modified Gram\u2013Schmidt. \`"cgs2"\` is classical Gram\u2013Schmidt with one reorthogonalisation pass and batched reductions: O(m) reductions per restart cycle rather than O(m\u00b2), at twice the vector work, so it is expected to pay only at high rank counts.                           |
| [\`turbulence_solver\`](/reference/solver/convergence-control#scheme-turbulence-solver)                           | \`"point-implicit"\` | How the assembled turbulence matrix is solved (see above).                                                                                                                                                                                                                                 |
| [\`turbulence_sweeps\`](/reference/solver/convergence-control#scheme-turbulence-sweeps)                           | 8                  | Sweeps for the \`"point-implicit"\` turbulence solve.                                                                                                                                                                                                                                        |

::: {.note}
On a GPU the \`"lu-sgs"\` preconditioner is the weaker DP-LUR Jacobi form rather than symmetric Gauss\u2013Seidel, whereas
\`"block jacobi"\` is the same operator on the host and on the device.
:::

### CFL control

The Courant\u2013Friedrichs\u2013Lewy (CFL) number sets the local pseudo-time step with which the solver approaches a converged
solution. The larger the CFL number, the faster the solver runs, and the less stable it is.
[\`cfl\`](/reference/solver/convergence-control#cfl) takes either a plain number or a dictionary for finer control.

::: {.note}
A bare number, such as \`"cfl": 30\`, is shorthand for \`"cfl": {"cfl": 30}\`. Any of the other keys can be added
alongside it; zCFD gathers them into the equivalent dictionary form.
:::

#### cfl

Sets the CFL number used in the mass, momentum and energy equations. A typical value for a RANS simulation with
explicit time marching:

\`\`\`python
"cfl": 1
\`\`\`

and with implicit time marching:

\`\`\`python
"cfl": 30
\`\`\`

::: {.note}
After mesh quality, the CFL number is the most important parameter affecting the stability of a simulation. If the
simulation does not converge, reduce it.
:::

#### cfl_turbulence

Sets the working CFL number for the turbulence transport equations, such as those for $k$ and $\\omega$. A lower value
than \`cfl\` promotes stability:

\`\`\`python
"cfl": {"cfl": 30, "cfl_turbulence": 20},
\`\`\`

::: {.note}
If the simulation does not converge, and reports high turbulence residuals that increase with successive cycles, set
\`cfl_turbulence\` lower than \`cfl\`.
:::

#### cfl_coarse

With multigrid acceleration, \`cfl_coarse\` is the CFL number on the coarse meshes, while \`cfl\` still applies to the
finest mesh. It applies only to explicit finite-volume solutions, and only when
\`{"numerical_scheme": {"multigrid": {...}}}\` is set. Agglomerated coarse meshes are typically of lower quality than the
fine mesh, so a lower CFL number may be needed for numerical stability:

\`\`\`python
"cfl": {"cfl": 2.5, "cfl_coarse": 1.0, "cfl_turbulence": 1.0},
\`\`\`

#### cfl_ramp

A ramp allows a relatively large target CFL number to be specified while the simulation starts from a smaller one, for
stability while large non-physical transients are cleared from the solution. Starting a simulation at a large CFL
number can cause an instability that crashes the solver; a gentler start reduces the effect of those transients.

\`cfl_ramp\` is always a list. Each entry describes one ramp and names its shape with a \`type\` key; a single ramp is a
list of one. A ramp that starts the CFL number at 0.1 and grows it by a factor of 1.1 until the target of 30 is
reached:

\`\`\`python
"cfl": {
    "cfl": 30,
    "cfl_ramp": [{"type": "exponential", "factor": 1.1, "initial": 0.1}],
},
\`\`\`

The available shapes are those of the ramp builders in \`zutil.control.ramp\`: \`"linear"\`, \`"stepped_linear"\` and
\`"exponential"\`.

Several entries run one after another. Every entry is called on every cycle, each acting on the output of the one
before, so an entry confines itself to its own stretch of the run with \`start_cycle\` and \`end_cycle\`. Easing in
exponentially for 200 cycles, then climbing steadily to the target:

\`\`\`python
"cfl": {
    "cfl": 30,
    "cfl_ramp": [
        {"type": "exponential", "factor": 1.1, "initial": 0.1, "end_cycle": 200},
        {"type": "linear", "increment": 0.5, "start_cycle": 201},
    ],
},
\`\`\`

A \`"linear"\` entry with an \`increment\` of \`0\` holds the CFL number steady for a stretch. This is useful when a case
needs time at a low CFL number to shed its start-up transients before the CFL number is raised: ease in, hold while the
flow settles, then climb to the target. Here the first entry eases in from 0.5, the second holds while the start-up
transients wash out, and the third climbs steadily to the target:

\`\`\`python
"cfl": {
    "cfl": 40,
    "cfl_ramp": [
        {"type": "exponential", "factor": 1.02, "initial": 0.5, "end_cycle": 150},
        {"type": "linear", "increment": 0.0, "start_cycle": 151, "end_cycle": 400},
        {"type": "linear", "increment": 0.1, "start_cycle": 401},
    ],
},
\`\`\`

![CFL rising exponentially to cycle 150, holding flat until cycle 400, then climbing linearly to the target of 40](/images/cfl_ramp_profile.svg "CFL ramp profile")

Cycles that no entry covers hold the CFL number where it is, so the middle entry above could be left out and the
profile would be the same. Writing the hold makes it visible to the next reader of the control dictionary.

Every shape takes \`initial\`, the CFL number the ramp starts from. It is returned at the ramp's \`start_cycle\`, so the
ramp sets its own starting point:

\`\`\`python
"cfl": {
    "cfl": 30,
    "cfl_ramp": [
        {
            "type": "exponential",
            "factor": 1.1,
            "initial": 0.1,
            "max_allowed": 30,
        }
    ],
},
\`\`\`

A Python callable can be given instead of the list; see the
[ramp function](../setting-up/python-functions-in-the-deck.md#ramp-cfl-function) reference. The callable is invoked as
\`func(cycle, current_cfl)\`, and returns either the new CFL number or a dictionary mapping any of \`cfl\`,
\`cfl_turbulence\` and \`cfl_coarse\` to drive those alongside it; keys it does not return keep their static value. A
three-argument \`(solve_cycle, real_time_cycle, cfl)\` callable is not accepted.

#### cfl_viscous_factor

A factor on the diffusive, viscous, time step when the CFL condition is applied. Viscous effects are rarely the cause
of solver instability, so their contribution to the time step can be reduced by setting \`cfl_viscous_factor\` below 1.

In a low Reynolds number case the viscous effects dominate, but do not contribute to instability. A value of 1e-6
then effectively discounts viscosity in setting the time step:

\`\`\`python
"cfl": {
    "cfl": 200,
    "cfl_viscous_factor": 1.0e-6,
    "cfl_ramp": [{"type": "exponential", "factor": 1.05, "initial": 0.1}],
},
\`\`\`

## Inner cycle convergence

Choosing \`cycles\` for an unsteady simulation means guessing how many pseudo-time iterations each real time step needs
at the chosen \`cfl\`. The [\`inner_convergence\`](/reference/solver/convergence-control#inner-convergence) dictionary
lets the solver decide instead: each real time step ends once its inner iteration has converged, and \`cycles\` becomes
an upper bound rather than a fixed count.

It applies only to [dual time-stepping](#dual-time-stepping) runs. A steady or globally time-stepped run has no inner
iteration to converge, and a deck that sets it for one fails validation. Leave the dictionary out to run the full
\`cycles\` on every real time step. Both solvers honour the same dictionary; what \`target_orders\` is measured on differs
between them, and is set out under [Choosing a target](#choosing-a-target).

Each real time step here runs until the mean-flow residual has dropped two orders, but never for more than 50 inner
cycles:

\`\`\`python
"time_settings": {
    "type": "unsteady",
    "kind": "dual time stepping",
    "total_time": 1.7,
    "time_step": 0.002,
    "order": "second",
},
"convergence_control": {
    "cycles": 50,
    "cfl": 2.0,
    "inner_convergence": {
        "target_orders": 2.0,
        "min_cycles": 5,
        "check_frequency": 5,
    },
},
\`\`\`

The criterion is not applied to the first real time step. That step runs the \`start\` cycles from a uniform initial
field while the CFL number is still ramping, so its residual history is not comparable with the rest of the
simulation.

::: {.note}
A real time step that converges early still runs one further inner cycle, on which it writes its report row,
checkpoint and visualisation output.
:::

### Choosing a target

[\`target_orders\`](/reference/solver/convergence-control#inner-convergence-target-orders) is measured on \`InnerRatio\`:
the largest, across the selected equations, of each residual divided by its own physical rate of change. Two
properties matter. Dividing each equation by its own rate makes the comparison dimensionless, so taking the largest
across equations is meaningful where taking the largest raw residual would not be. And taking the largest tracks the
equation with the most work still to do.

\`InnerDrop\`, by contrast, is the smallest drop across the same equations, and is reported as a diagnostic only.
Residuals are not comparable between equations, so one can start well below the others because that is its scale,
with almost nothing left to resolve. The smallest drop then picks exactly that equation, and stays near zero however
well the rest of the field converges. In a representative IDDES case the momentum equations dropped 2.2 orders while
density dropped 0.07 and governed, so a criterion on \`InnerDrop\` could never have been met. \`InnerRatio\` on the same
case fell a consistent 1.8 orders per real time step.

Because \`target_orders\` is a reduction in a ratio rather than an absolute level, one value carries between cases. To
choose it, run once with the criterion off, and follow \`InnerRatioDrop\` through a real time step. Most of the
reduction happens in the first handful of inner cycles at the chosen \`cfl\`, and the curve then has a long flat tail.
On that IDDES case it reached 0.7 orders by cycle 5, 1.0 by cycle 10 and 1.8 by cycle 50, so the first five cycles
achieved some four fifths of the reduction in residual, and the remaining forty-five the rest. Set \`target_orders\` near the knee, with
\`min_cycles\` at the knee's cycle number.

Use [\`target_ratio\`](/reference/solver/convergence-control#inner-convergence-target-ratio) only when an absolute floor
is wanted as well. It is combined with \`target_orders\` by a logical OR, and its value has to be measured case by case.

The equation governing \`InnerRatio\` can change from one inner cycle to the next, so \`InnerRatioDrop\` compares the
worst ratio now against the worst at the first cycle rather than following a single equation. It reads as how far the
bottleneck has improved, and flattens when a slower equation takes over; that is the signal, not an artefact.

::: {.note}
A solution restarted from a steady state and left to develop, from RANS into DES or a wake that has yet to break
down, looks converged on every real time step while the unsteadiness is still small: the residual starts low, barely
moves, and sits far below the physical rate of change. Ending those steps early would cut the inner iteration short
exactly while the instability that has to grow is being resolved. Use
[\`start_real_time_step\`](/reference/solver/convergence-control#inner-convergence-start-real-time-step) to leave that
phase alone, and let the criterion take over once the flow is established.
:::

#### The incompressible measure

The incompressible solver has no pseudo-time residual to form a ratio from. Its report carries the nonlinear residual
of the outer iteration, already normalised by the matrix diagonal and by each variable's own range, so it is free of
scale for each equation before anything divides it. \`target_orders\` is therefore judged on \`InnerDrop\`, the orders the
worst selected residual has fallen since the first inner cycle of the step, and \`InnerRatio\` and \`InnerRatioDrop\` are
reported as zero. \`target_ratio\` has nothing to test, and is rejected.

Under the coupled scheme, \`"mean flow"\` is momentum and pressure; the pressure row is the continuity constraint, and
is the equation that most often governs. Under SIMPLE, the pressure entry in the report is the residual left by the
pressure-correction solve, bounded by the linear solver's tolerance rather than by the flow, so it is not judged, and
\`"mean flow"\` is momentum alone.

The default of 1.0 was set on the coupled scheme, where a developed cylinder wake ends the median real time step after
10 of 50 inner cycles, and the cycles given up are worth about a quarter of an order. SIMPLE converges each step less
far. On the same flow its momentum residual falls about 0.8 orders in the first five cycles and then holds, so it needs
a lower target, 0.5 in the regression case, and meets it on most steps rather than all. Follow \`InnerDrop\` through a
few steps with the criterion off before choosing, exactly as for \`InnerRatioDrop\` above.

### Reading the inner convergence

Whether or not an automatic criterion is set, a dual time-stepping run reports its inner-cycle convergence to the
report file in the \`InnerCycle\`, \`InnerDrop\`, \`InnerRatio\` and \`InnerRatioDrop\` columns, joined by \`InnerCells\` on the
compressible solver only; see the [table of columns](#inner-cycle-convergence-columns) for which carry meaning on each
solver. \`InnerDrop\` is the number of orders of magnitude the worst mean-flow residual has dropped since the first inner
cycle of the current real time step, and is the quantity to judge \`cycles\` by.

The global residual is a poor guide here, for two reasons. It is an absolute value, never normalised per real time
step, so its magnitude says nothing about how far the current inner iteration has come. And it is an RMS over cells,
so a handful of cells whose limiter switches between iterations can hold the whole norm at a noise floor while the
bulk of the field is still converging cleanly.

To see the convergence of each real time step separately:

\`\`\`python
from zutil.plot import zCFD_Plots
plots = zCFD_Plots("cylinder.py")
plots.plot_inner_convergence()
\`\`\`

This plots \`InnerDrop\` against the inner cycle index, with one curve for each real time step. Once the start-up
transient has passed, the curves collapse onto each other, and the cycle at which they flatten is where \`cycles\`
should be set. At the end of the run the solver also logs the median drop achieved, and whether \`cycles\` looks too
high or too low.

If the curves flatten well short of the target, see
[troubleshooting](../troubleshooting/troubleshooting.md#convergence-stall). A stall caused by limiter switching is
cured by freezing the limiter, not by adding cycles; see also [Choosing a limiter](choosing-a-limiter.md).

### Inner cycle convergence columns

Dual time-stepping simulations report extra columns describing the convergence of the inner, pseudo-time, iteration
within each real time step. The residual columns themselves are absolute, and never normalised per real time step, so
they cannot say whether a real time step has converged; these columns can. The first four are always present, and
which of them carries meaning depends on the solver.

| Column           | Solver       | Meaning                                                                                                                                                                                                                                                                                 |
| ---------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| \`InnerCycle\`     | both         | The inner cycle index within the current real time step, counting from 1. Use it as the x axis when plotting the convergence of a single real time step.                                                                                                                                |
| \`InnerDrop\`      | both         | Orders of magnitude the worst selected residual has dropped since the first inner cycle of the current real time step. It is what \`target_orders\` tests on the incompressible solver; on the compressible solver it is a diagnostic only (see [Choosing a target](#choosing-a-target)). |
| \`InnerRatio\`     | compressible | The largest, across the mean-flow equations, of each residual divided by its own physical rate of change. Zero on real-time cycle 0, where there is no time history to compare against, and always zero on the incompressible solver, which has no pseudo-time residual.                |
| \`InnerRatioDrop\` | compressible | Orders of magnitude \`InnerRatio\` has fallen within the current real time step. It is what \`target_orders\` tests on the compressible solver. Always zero on the incompressible solver.                                                                                                   |
| \`InnerCells\`     | compressible | The effective number of cells carrying the residual. A small value means limiter switching in a few cells rather than a stalled field. Not written by the incompressible solver, which has no slope limiter.                                                                            |

See [Reading the inner convergence](#reading-the-inner-convergence) for how to plot these columns and use them to
choose \`cycles\`.

::: {.note}
With [\`inner_convergence\`](/reference/solver/convergence-control#inner-convergence) enabled, the number of inner cycles
varies between real time steps, so the \`Cycle\` column does not advance by a fixed stride per real time step. Group on
\`RealTimeStep\` rather than assuming a stride.
:::

## Incompressible convergence control

The incompressible solver marches each pseudo-step with an implicit solve rather than a CFL-limited time step, so its
\`convergence_control\` carries \`cycles\`, the pressure-velocity coupling \`scheme\` and two start-up ramps. There is no
\`cfl\` key.

\`\`\`python
"convergence_control": {
    "cycles": 5000,
    "scheme": {"name": "coupled", "implicit_relax": 0.9},
},
\`\`\`

### Coupling scheme

The coupling scheme decides how velocity and pressure are solved together. \`{"scheme": {"name": ...}}\` selects
\`"coupled"\` or \`"simple"\`, and the relaxation that drives it, such as
[\`implicit_relax\`](/reference/solver/convergence-control#scheme-implicit-relax), sits in the same block.

The coupling scheme applies to the whole run, since it selects the solver itself. Unlike the rest of
\`convergence_control\`, it cannot be overridden per mesh.

Under \`"simple"\` three further keys configure the pressure-correction solve:
[\`pressure_relax\`](/reference/solver/convergence-control#scheme-pressure-relax),
[\`pressure_regularisation\`](/reference/solver/convergence-control#scheme-pressure-regularisation) and
[\`pressure_correction_limit\`](/reference/solver/convergence-control#scheme-pressure-correction-limit). They are
rejected under \`"coupled"\`, which performs no such solve. The PETSc options for the SIMPLE momentum and
pressure-correction solves are separate; see [Choosing a linear solver](choosing-a-linear-solver.md).

\`\`\`python
"convergence_control": {
    "cycles": 5000,
    "scheme": {
        "name": "simple",
        "implicit_relax": 0.7,
        "pressure_relax": 0.3,
    },
},
\`\`\`

### Startup ramps

Both ramps, [\`viscosity_ramp\`](/reference/solver/convergence-control#viscosity-ramp) and
[\`relaxation_ramp\`](/reference/solver/convergence-control#relaxation-ramp), ease an impulsive start, and are active
only during the first real time step. Each takes \`initial\`, the value on the first pseudo-cycle, and \`cycles\`, the
number of pseudo-cycles it takes to reach 1. Here the run starts heavily relaxed and diffusive, and eases to the
configured values over 500 cycles:

\`\`\`python
"convergence_control": {
    "cycles": 5000,
    "scheme": {"name": "coupled", "implicit_relax": 0.9},
    "viscosity_ramp": {"initial": 100.0, "cycles": 500.0},
    "relaxation_ramp": {"initial": 0.2, "cycles": 500.0},
},
\`\`\`

## Multigrid

Multigrid is configured on [\`numerical_scheme\`](/reference/solver/numerical-scheme#multigrid), with the spatial
discretisation. It applies only to compressible cases on the explicit pseudo-time path: it needs the pseudo-time loop
to exist, in a steady or dual time-stepping run but never under global time stepping, and it needs the pseudo-time
\`scheme\` to be explicit, \`"euler"\` or \`"runge kutta"\`, or unset. Setting it under the incompressible solver, under
global time stepping, or alongside an implicit scheme is rejected.

To accelerate an explicit finite-volume solution, coarse meshes are generated from the original, fine, mesh by
agglomerating cells into larger ones. [\`levels\`](/reference/solver/numerical-scheme#multigrid-levels) sets how many
times the operation is applied, each application giving a coarser mesh with fewer cells. Solving on the hierarchy of
coarser meshes as well as on the fine mesh moves information through the domain faster, and reaches a converged
solution more efficiently. The multigrid scheme is designed so that, in theory, the acceleration does not change the
result that solving on the finest mesh alone would give; in practice, multigrid does eventually stall convergence on
most meshes.

\`levels\` is a maximum. Coarsening stops after the first level on which every partition holds fewer than
max(32, 5760/N) cells, for N partitions, or 32 cells in serial. A run on few partitions, as on GPUs, can therefore
build fewer levels than a CPU run of the same case. The log prints one coarsening ratio for each level built.

Use multigrid for a set number of [\`cycles\`](/reference/solver/numerical-scheme#multigrid-cycles), and then revert to
the finest mesh alone. This takes the more efficient scheme at the start, and avoids the stall that multigrid causes at
the end of a solution.

Three levels of multigrid are enough in most cases to cut the number of cycles by an order of magnitude. If this
causes instability, reducing it to two may cure it:

\`\`\`python
"numerical_scheme": {
    ...
    "multigrid": {"levels": 3},
    ...
},
\`\`\`

In one case, after 20000 explicit cycles the multigrid stall prevented convergence to the correct drag. Turning
multigrid off after that point recovers the correct value on the finest mesh:

\`\`\`python
"numerical_scheme": {
    ...
    "multigrid": {"levels": 3, "cycles": 20000},
    ...
},
\`\`\`

::: {.note}
Multigrid applies only to explicit finite-volume solutions on the compressible solver.
:::

## Reference entries

- [\`time_settings\`](/reference/solver/time-settings): [\`type\`](/reference/solver/time-settings#type),
  [\`kind\`](/reference/solver/time-settings#kind), [\`order\`](/reference/solver/time-settings#order),
  [\`start\`](/reference/solver/time-settings#start) and [\`scheme\`](/reference/solver/time-settings#scheme)
- [\`convergence_control\`](/reference/solver/convergence-control): [\`cycles\`](/reference/solver/convergence-control#cycles),
  [\`scheme\`](/reference/solver/convergence-control#scheme), [\`cfl\`](/reference/solver/convergence-control#cfl) and
  [\`inner_convergence\`](/reference/solver/convergence-control#inner-convergence)
- [\`multigrid\`](/reference/solver/numerical-scheme#multigrid)
`;export{e as default};