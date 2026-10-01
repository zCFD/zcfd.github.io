var e=`
# Choosing boundary conditions

Which boundary condition should each boundary of the mesh take?

Give every solid surface a wall, and choose its wall model separately. Close an external flow with a farfield on the
compressible solver, and an internal flow with an inflow and an outflow; the incompressible solver always uses the
latter pair. Put a symmetry condition on a plane of mirror symmetry. Where a boundary is not closed at all but joined
to another part of the domain, whether an overlapping mesh, an abutting rotating mesh or its own periodic partner, make
it an interface.

| \`type\`                                                        | Use it for                                                            | Selected by \`kind\`                                    | Names its flow state with |
| ------------------------------------------------------------- | --------------------------------------------------------------------- | ----------------------------------------------------- | ------------------------- |
| [\`wall\`](/reference/model/boundary-conditions/wall)           | solid surfaces; see [Choosing a wall model](choosing-a-wall-model.md) | \`slip\`, \`no slip\`, \`wall function\`                    | \u2014                         |
| [\`farfield\`](/reference/model/boundary-conditions/farfield)   | open boundaries of an external flow, compressible solver only         | \`riemann\`, \`pressure\`, \`supersonic\`, \`preconditioned\` | \`condition\`               |
| [\`inflow\`](/reference/model/boundary-conditions/inflow)       | inlets                                                                | \`default\`, \`pressure\`, \`massflow\`                     | \`reference\`               |
| [\`outflow\`](/reference/model/boundary-conditions/outflow)     | outlets                                                               | \`pressure\`, \`massflow\`, \`radial pressure gradient\`    | \`reference\`               |
| [\`mass flow\`](/reference/model/boundary-conditions/mass-flow) | a mass flow rate set on the boundary                                  | \u2014                                                     | \u2014                         |
| [\`symmetry\`](/reference/model/boundary-conditions/symmetry)   | planes of mirror symmetry                                             | \u2014                                                     | \u2014                         |
| [\`interface\`](/reference/model/boundary-conditions/interface) | overset boundaries, sliding interfaces and periodic pairs             | \`overset\`, \`sliding\`, \`periodic\`                      | \u2014                         |

## Declaring a boundary condition

Boundary conditions are a dictionary of named blocks under the mesh's model entry. Each block is keyed by a name of
your choosing, conventionally \`BC_1\`, \`BC_2\` and so on, and describes one boundary condition:

\`\`\`python
parameters = {
    "config_version": 2,
    "solver": {...},
    "model": {
        "naca0012": {
            "mesh": "naca0012_0449.h5",
            "boundary_conditions": {
                "BC_1": {"zones": [2, 3], "type": "symmetry"},
                "BC_2": {"zones": [4], "type": "wall", "kind": "no slip"},
                "BC_3": {
                    "zones": [1],
                    "type": "farfield",
                    "condition": "IC_1",
                    "kind": "riemann",
                },
            },
        }
    },
}
\`\`\`

Every block requires a \`type\`, which selects the boundary condition applied to its zones, and \`zones\`, which lists
those zones. Most types also take a \`kind\`, which selects a variant of the type with its own further keys. A wall's
\`kind\`, for example, chooses between \`slip\`, \`no slip\` and \`wall function\`, and the keys available below it change with
the choice.

## Zones

[\`zones\`](/reference/model/boundary-conditions) is a list of the integer zone numbers of the mesh to which the
boundary condition applies. The converters record which source zone name became which number; see
[Zone numbers](../setting-up/preparing-a-mesh.md#zone-numbers), which also explains how a number is matched.

## Wall

See [Choosing a wall model](choosing-a-wall-model.md).

## Farfield

A farfield boundary closes an external flow, and switches between inflow and outflow face by face according to the
local flow direction. It names its flow state through \`condition\`, a [reference condition](/reference/solver/reference-conditions)
entry. The incompressible solver has no farfield boundary; close an incompressible domain with inflow and outflow
boundaries instead.

The [\`kind\`](/reference/model/boundary-conditions/farfield#kind) sets how each face is treated:

| \`kind\`           | Treatment                                                                                          |
| ---------------- | -------------------------------------------------------------------------------------------------- |
| \`riemann\`        | Riemann invariants for a non-reflecting inflow; a viscous outflow takes the pressure from outside. |
| \`pressure\`       | a pressure boundary for both inflow and outflow.                                                   |
| \`supersonic\`     | the upstream state on inflow and outflow alike.                                                    |
| \`preconditioned\` | the reference state imposed as a supersonic inflow on every face.                                  |

The [\`driver\`](/reference/model/boundary-conditions/farfield#driver) block drives a farfield's inflow towards a target
force coefficient by adjusting a control variable, the angle of attack or the velocity magnitude. State the target,
its value and the control mode; the controller handles the feedback loop. It acts only on report cycles: from
[\`settling_period\`](/reference/model/boundary-conditions/farfield#driver-settling-period) onwards, on each reported
cycle that is a multiple of [\`update_period\`](/reference/model/boundary-conditions/farfield#driver-update-period).
Choose an \`update_period\` that falls on report cycles, or the control variable stays at its initial value.

::: {.warning}
Angle-of-attack control has failed to engage in at least one case, reporting zero update on every cycle
instead of converging the angle onto the target. Check that the angle of attack changes in the report before relying
on the driver for angle-of-attack control.
:::

## Inflow

An inflow boundary takes one of three kinds, selected by
[\`kind\`](/reference/model/boundary-conditions/inflow#kind):

| \`kind\`     | The inflow state is set from                                                             |
| ---------- | ---------------------------------------------------------------------------------------- |
| \`default\`  | the reference condition alone; this is the incompressible solver's velocity inlet        |
| \`pressure\` | a total pressure ratio and a total temperature ratio relative to the reference condition |
| \`massflow\` | a mass flow rate or a mass flow ratio                                                    |

All three name their flow state through [\`reference\`](/reference/model/boundary-conditions/inflow#reference), a
[reference condition](/reference/solver/reference-conditions) entry. The key is \`reference\`, not \`condition\`, which
belongs to the farfield. The flow enters normal to the boundary. The \`pressure\` kind also accepts a
[\`direction\`](/reference/model/boundary-conditions/inflow#direction), but the solver does not read it.

::: {.note}
A mass flow rate is given in kg/s, and can be used only if the mesh is in metres. A mass flow ratio is
non-dimensional, with $A_{in}$ in mesh units: $massflowratio = \\rho_{in} U_{in} A_{in}/(\\rho_{ref} U_{ref})$.
:::

## Outflow

An outflow boundary is a pressure, mass flow or radial-pressure-gradient outlet, selected by
[\`kind\`](/reference/model/boundary-conditions/outflow#kind) as for an [inflow](#inflow). All three kinds name their
flow state through [\`reference\`](/reference/model/boundary-conditions/outflow#reference).

::: {.note}
A mass flow rate is given in kg/s, and can be used only if the mesh is in metres. A mass flow ratio is
non-dimensional, with $A_{out}$ in mesh units: $massflowratio = \\rho_{out} U_{out} A_{out}/(\\rho_{ref} U_{ref})$.
:::

::: {.demo setting="reference/model/boundary-conditions/outflow#kind" values="massflow, pressure" case="pipe" figure="pipe-outflow-kind"}
![Outlet mass flow against cycle in a turbulent pipe, for a mass-flow outlet and a static-pressure outlet, with the imposed mass flow marked](/images/pipe-outflow-kind.svg "A mass-flow outlet scales the exit velocity until the flow through it matches the request. It settles at 9.989 kg/s, 0.1 per cent under the 10 kg/s requested. A pressure outlet fixes the exit pressure, and the flow follows from the pressure drop along the pipe. At a ratio of 101238/101325 it settles at 8.888 kg/s, 11 per cent lower, with a drop from inlet to outlet of 87 Pa against 109 Pa.")

Both runs use the same mesh, Menter SST with wall functions and a total-pressure inlet; only the outlet changes. The pressure ratio is not tuned to the 10 kg/s target: a pressure outlet sets the pressure, and the flow follows.
:::

## Mass flow

A \`mass flow\` boundary, \`{"type": "mass flow"}\`, is declared with a mass flow rate,
[\`mass_flow\`](/reference/model/boundary-conditions/mass-flow#mass-flow), and has no \`kind\` and no reference condition.
Its spelling differs from the \`massflow\` kind of an inflow or outflow: \`mass flow\` is a \`type\`, \`massflow\` a \`kind\`.

::: {.warning}
A \`mass flow\` boundary validates, but the solver does not recognise the type and stops at setup. Use an inflow or
outflow of \`kind\` \`massflow\` to set a mass flow.
:::

## Interface

An interface boundary, \`{"type": "interface"}\`, joins a boundary to another part of the domain rather than closing it:
the solution on one side is supplied by the other. The
[\`kind\`](/reference/model/boundary-conditions/interface#kind) selects how the two sides are joined:

| \`kind\`     | Use it where                                                                            | What crosses the join                          |
| ---------- | --------------------------------------------------------------------------------------- | ---------------------------------------------- |
| \`overset\`  | this mesh overlaps another                                                              | fringe values, taken from the mesh beneath     |
| \`sliding\`  | two meshes meet on a shared surface of revolution with non-matching faces               | a conservative flux                            |
| \`periodic\` | two boundaries of the same mesh are one surface, related by a rotation or a translation | the flow leaving one boundary enters the other |

Every interface names what it connects to in its
[\`connection\`](/reference/model/boundary-conditions/interface#connection) block. What the connection holds depends on
the \`kind\`, and is described under each heading below.

::: {.note}
A case with an overset or sliding interface requires an implicit pseudo-time scheme, \`"implicit euler"\`, \`"lu-sgs"\` or
\`"mf-gmres"\`; an explicit scheme alongside either is rejected at validation. See
[Choosing a time-marching scheme](choosing-a-time-marching-scheme.md#scheme).
:::

### Overset

An overset interface goes on the outer boundaries of a mesh that is overset on one or more other meshes. Its
connection names the model or models whose meshes provide donor data; without a connection, the solver maps against
every preceding model. See [Overset meshes](../working-with/overset-meshes.md) for how an overset case is set up and
solved.

\`\`\`python
"BC_2": {
    "zones": [10],
    "type": "interface",
    "kind": "overset",
    "connection": {"model": ["background"]},
},
\`\`\`

### Sliding

A sliding interface joins two models whose meshes abut without overlapping on a shared cylindrical, conical or annular
surface, typically a rotating region and the stationary region around it. The faces on the two sides need not match.
The two face sets are clipped against each other into a common set of intersection polygons, one numerical flux is
computed for each polygon, and that flux is applied to the cell on each side. The interface is therefore conservative,
not interpolated.

A sliding interface is declared on both models, and each names the other. The connection gives the model and the
boundary on the other side; that boundary must itself be a sliding interface whose connection names this one back.

The interface must be a surface of revolution about the axis of the rotating fluid zone on either side. When neither
side rotates, the two meshes are joined directly, and the axis is found from the shape of the interface itself.

The interface may be a cylinder, a cone, a flat annulus, a spherical band, a disc or spherical cap that reaches the
axis, or a whole sphere centred on the axis. It must cover the full circle about the axis; a periodic sector is not
supported. The summary printed at the start of the run names the shape the solver found, which is a quick check that
the right zones were listed.

A closed or compound surface, such as the two faces and the side of a drum, can be declared either way:

- as one sliding interface on each side that lists every zone. The solver groups the zones into single surfaces, a
  cylinder meshed as two zones counting as one, and pairs each surface with the matching one on the other side;
- as one sliding interface per surface, each naming its partner, when the pairing should be stated explicitly.

A zone that matches no surface on the other side stops the run at setup, with the zone, the model and the shape it
was found to have.

\`\`\`python
"outer": {"boundary_conditions": {
    "BC_2": {"zones": [10, 63, 62], "type": "interface", "kind": "sliding",
             "connection": {"model": "disc", "boundary": "BC_1"}}}},
"disc": {"boundary_conditions": {
    "BC_1": {"zones": [21, 22, 23], "type": "interface", "kind": "sliding",
             "connection": {"model": "outer", "boundary": "BC_2"}}}},
\`\`\`

A rotor and the stator around it, each connected to the other:

\`\`\`python
"model": {
    "rotor": {
        "mesh": "rotor.h5",
        "boundary_conditions": {
            "BC_3": {
                "zones": [21],
                "type": "interface",
                "kind": "sliding",
                "connection": {"model": "stator", "boundary": "BC_2"},
            },
        },
    },
    "stator": {
        "mesh": "stator.h5",
        "boundary_conditions": {
            "BC_2": {
                "zones": [20],
                "type": "interface",
                "kind": "sliding",
                "connection": {"model": "rotor", "boundary": "BC_3"},
            },
        },
    },
},
\`\`\`

Two settings trade conservation against other properties of the interface:

| Setting                                                       | \`conservative\` / \`segment\` (the defaults)                                                                               | \`free stream\` / \`parent\`                                                                                               |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| [\`area\`](/reference/model/boundary-conditions/interface#area) | both sides use the mean of the two parent area maps: conservative to round-off, closure error first order in cell width | each side uses its own parent map: closure and free-stream preservation exact, conservation deficit second order       |
| [\`flux\`](/reference/model/boundary-conditions/interface#flux) | one flux per intersection polygon, with a shared area vector, so the two sides cancel exactly                           | one flux per parent face, against the area-weighted average of its donors: quieter as cells pass, but not conservative |

The two \`area\` settings are identical on a planar interface and for matching meshes. Under \`parent\` the flux does not
change when the intersection pattern changes, so the noise a rotating interface makes as cells pass one another is
lower; but each side fluxes its own faces and nothing cancels. \`segment\` is the default for that reason.

[\`segment_capacity_factor\`](/reference/model/boundary-conditions/interface#segment-capacity-factor),
[\`sliver_tolerance\`](/reference/model/boundary-conditions/interface#sliver-tolerance) and
[\`closure_tolerance\`](/reference/model/boundary-conditions/interface#closure-tolerance) are rarely needed. The first
sizes the segment storage reserved for each interface face; setup sweeps a full revolution, and stops with the factor
actually needed if it is too small. The closure tolerance is the largest fraction of a face's area that may be left
uncovered before setup stops, so that a real gap between the two sides, from mismatched radii, a partial annulus or a
wrong axis, shows at setup rather than as a silent leak.

To rotate the mesh itself rather than run the rotating side as a reference frame, set \`moving_mesh\` on its rotating
fluid zone; see [Choosing a fluid-zone model](choosing-a-fluid-zone-model.md#rotating-and-translating-zones).

### Periodic

A periodic interface treats two boundaries of the same mesh as one surface: the flow leaving one boundary enters the
other. It is declared in pairs. Each boundary's connection names the other boundary of the pair, and that boundary
must name this one back.

Each side carries the [\`transform\`](/reference/model/boundary-conditions/interface#transform) that maps it onto the
other, so the two transforms must be inverses of each other. A rotation of \u03b8 about an axis pairs with a rotation of \u2212\u03b8
about the same axis line, or equivalently \u03b8 about the reversed axis; a translation by a vector pairs with the
translation by its negative. Both sides of a pair use the same transform \`type\`, \`'linear'\` or \`'rotated'\`.

::: {.warning}
The incompressible solver supports only the \`'linear'\`, translational, periodic transform; \`'rotated'\` periodic
interfaces need the compressible solver. A rotated pair on an incompressible case,
\`{"solver_settings": {"type": "incompressible"}}\`, passes validation but is ignored, with a warning in the log.
:::

A linear periodic pair:

\`\`\`python
"BC_3": {
    "zones": [11],
    "type": "interface",
    "kind": "periodic",
    "connection": {"boundary": "BC_4"},
    "transform": {"type": "linear", "vector": [0.0, 0.0, 1.0]},
},
"BC_4": {
    "zones": [12],
    "type": "interface",
    "kind": "periodic",
    "connection": {"boundary": "BC_3"},
    "transform": {"type": "linear", "vector": [0.0, 0.0, -1.0]},
},
\`\`\`

A rotated periodic pair for a 120\u00b0 sector:

\`\`\`python
"BC_5": {
    "zones": [5],
    "type": "interface",
    "kind": "periodic",
    "connection": {"boundary": "BC_6"},
    "transform": {
        "type": "rotated",
        "theta": math.radians(120.0),
        "axis": [1.0, 0.0, 0.0],
        "origin": [0.0, 0.0, 0.0],
    },
},
"BC_6": {
    "zones": [6],
    "type": "interface",
    "kind": "periodic",
    "connection": {"boundary": "BC_5"},
    "transform": {
        "type": "rotated",
        "theta": math.radians(-120.0),
        "axis": [1.0, 0.0, 0.0],
        "origin": [0.0, 0.0, 0.0],
    },
},
\`\`\`

## Reference entries

- [Boundary conditions](/reference/model/boundary-conditions), with \`type\` and \`zones\`
- [\`wall\`](/reference/model/boundary-conditions/wall), [\`farfield\`](/reference/model/boundary-conditions/farfield),
  [\`inflow\`](/reference/model/boundary-conditions/inflow), [\`outflow\`](/reference/model/boundary-conditions/outflow),
  [\`mass flow\`](/reference/model/boundary-conditions/mass-flow),
  [\`symmetry\`](/reference/model/boundary-conditions/symmetry) and
  [\`interface\`](/reference/model/boundary-conditions/interface)
- [Reference conditions](/reference/solver/reference-conditions)
`;export{e as default};