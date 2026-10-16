var e=`
# Choosing a fluid-zone model

Which fluid zone represents the device, obstruction or motion in the flow?

A fluid zone is a region of cells in which the solver applies a source term or a reference frame. Each zone is a named
block in the model's \`fluid_zones\`. Its \`type\` sets what is applied. The cells are selected by \`zones\`, a list of the
mesh's cell zones, or by \`definition\`, a closed surface.

Choose the zone type by what the flow must feel. A rotor, propeller or turbine whose blades the mesh does not resolve
is an actuator disc. A distributed resistance, such as a radiator, a fence or a packed bed, is a porous zone, and a
tree canopy over terrain is a canopy zone. Any other body force is a momentum source, written as a Python function.
A part of a still mesh that turns, such as a wheel or an impeller, is a \`rotating\` zone: its cells are solved in a
rotating frame. A frame over the whole mesh, a translating frame, and a mesh that moves are not fluid zones; they are
the \`motion\` in the model's \`transforms\`, described in
[Placing and moving a mesh](../working-with/placing-and-moving-a-mesh.md).

| \`type\`                                                                                                                       | Represents                                          | Selects its cells by                                   |
| ---------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------ |
| [\`rotating\`](/reference/model/fluid-zones/rotating)                                                                          | a rotating frame over part of a still mesh          | \`cell zones\`                                           |
| [\`disc\`](/reference/model/fluid-zones/disc)                                                                                  | an actuator disc: a rotor, propeller or turbine     | its geometry and \`definition\`                          |
| [\`porous\`](/reference/model/fluid-zones/porous)                                                                              | a porous medium, as viscous and inertial resistance | \`cell zones\`, \`definition\`, or the whole mesh          |
| [\`canopy\`](/reference/model/fluid-zones/canopy)                                                                              | a tree canopy in a terrain wind model               | \`cell zones\`, \`definition\`, \`field\`, or the whole mesh |
| [\`momentum\`](/reference/model/fluid-zones/momentum)                                                                          | an arbitrary body force, from a Python function     | \`cell zones\`, \`definition\`, or the whole mesh          |
| [\`rbf transform\`](/reference/model/fluid-zones/rbf-transform), [\`idw transform\`](/reference/model/fluid-zones/idw-transform) | a surface deformation carried into the volume mesh  | \`zones\`, the moving boundary faces                     |
| [\`abl\`](/reference/model/fluid-zones/abl)                                                                                    | validated, but has no effect on the solution        | the whole mesh                                         |

Fluid zones are a dictionary of named blocks, keyed in the same way as
[boundary conditions](choosing-boundary-conditions.md):

\`\`\`python
{
    'model': {
        '<mesh_name>': {
            'mesh': '<mesh_name>.h5',
            'fluid_zones': {
                'FZ_1': {'type': '...', ...},
                'FZ_2': {'type': '...', ...},
            },
            'boundary_conditions': {...},
        }
    }
}
\`\`\`

Each block's [\`type\`](/reference/model/fluid-zones) selects the kind of zone, and determines which other keys are
valid and required in that block. An unrecognised key anywhere in a fluid zone is rejected at validation, not
silently ignored.

## Selecting cells

A fluid zone that acts on a volume selects its cells in one of three ways:

- \`cell zones\`, a list of the mesh's cell zone numbers. Every cell labelled with one of those numbers belongs to the
  fluid zone. This suits a region that was meshed as a body of its own, such as a wheel, a fan or a radiator core.
- \`definition\`, the path to a closed-surface VTP file. The cells the surface encloses belong to the
  fluid zone. This suits a region the mesh does not mark, or one drawn after the mesh was made.
- neither, in which case the fluid zone covers the whole mesh.

A fluid zone takes at most one of these. Which it may take depends on its type:

| \`type\`               | \`cell zones\` | \`definition\` | neither               |
| -------------------- | ------------ | ------------ | --------------------- |
| \`rotating\`           | required     | not accepted | not accepted          |
| \`momentum\`, \`porous\` | accepted     | accepted     | the whole mesh        |
| \`canopy\`             | accepted     | accepted     | the whole mesh        |
| \`disc\`               | not accepted | required     | not accepted          |
| \`abl\`                | not accepted | not accepted | always the whole mesh |

A \`canopy\` zone may instead give \`field\`, a canopy height map, which selects the cells beneath the canopy height; it
takes only one of \`cell zones\`, \`definition\` and \`field\`. A \`disc\` zone places its forces with its \`geometry\` and
selects the cells that receive them with its \`definition\`.

\`\`\`python
"fluid zones": {
    "fan": {"type": "momentum", "cell zones": [4], "func": fan_force},
    "screen": {"type": "porous", "definition": "screen.vtp", "alpha": 1.0e-7},
    "drive": {"type": "momentum", "func": pressure_gradient},
},
\`\`\`

Cell zone numbers belong to the cells of the mesh, and are separate from the boundary zone numbers in a boundary
condition's \`zones\`. The two may share a number without any connection between them. See
[Finding cell zone numbers](#finding-cell-zone-numbers) for how to read them from a mesh.

The \`zones\` of an \`rbf transform\` or \`idw transform\` zone are boundary zones: the moving surfaces whose deformation is
carried into the volume mesh, numbered as for [boundary conditions](choosing-boundary-conditions.md#zones).

## Fluid zones in the incompressible solver

All the source-term zone types, \`momentum\`, \`porous\`, \`canopy\`, \`disc\` and \`abl\`, are available to the incompressible
solver, \`{"solver_settings": {"type": "incompressible"}}\`, as well as to the compressible one. Three points differ.

The incompressible momentum equation is solved per unit mass, with the density divided out, so a \`momentum\` zone's
\`func\` must return a force per unit mass rather than per unit volume. The porous, canopy and actuator disc models
handle this internally, so their inputs (\`alpha\`, \`C2\`, \`cd\`, and the disc's geometry and model dictionaries) are the
same for both solvers.

A strong \`porous\` or \`canopy\` zone under the segregated SIMPLE scheme,
\`{"convergence_control": {"scheme": {"name": "simple"}}}\`, needs the scheme's \`pressure_regularisation\` set. Their
drag adds to the momentum diagonal, so in a heavily blocked cell every pressure-correction face coefficient collapses
towards zero, and that cell's row of the p\u2032 Laplacian becomes nearly empty. The conjugate-gradient solver then reports
an indefinite matrix, and the run diverges. A value around \`1e-2\` restores stability, though a near-solid block still
converges more slowly and less far than under the coupled scheme; for strong drag, prefer the \`'coupled'\` scheme.
Weak drag, such as a typical canopy, converges under either scheme with the default of \`0\`, and the two agree to
discretisation level. \`momentum\`, \`disc\` and \`abl\` zones are explicit body forces that never touch the momentum
diagonal, and are unaffected either way.

The \`canopy\` turbulence source is defined only for the \`sst\` model. Under any other turbulence model the canopy applies
its momentum sink alone, and the solver logs a warning.

## Actuator discs

A wind turbine or a propeller affects the flow, but it is often impractical to resolve the flow down to the scale of
its blades. An actuator disc represents the device instead, as a set of source terms superimposed on the flow.

Turbines and propellers behave almost identically in the actuator disc model; the differences lie only in the
coordinate systems and sign conventions usually used to define them. In zCFD an actuator disc is a
[fluid zone](/reference/model/fluid-zones/disc) of type \`'disc'\`.

The [\`type\`](/reference/model/fluid-zones/disc/model#type) key of the disc's \`model\` block selects a \`'simple'\` disc,
with fixed or curve-driven thrust and power coefficients, or a \`'bet'\` disc, based on blade-element theory.

The [\`normal\`](/reference/model/fluid-zones/disc/geometry#normal) sets the direction of the disc's force. In zCFD the
normal points in the direction of the force on the fluid: for a propeller it points with the flow, and for a turbine
it points towards the incoming flow.

A disc zone is built from four dictionaries and a few keys of its own:

| Key                                                                                                                                               | Holds                                                                                                                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [\`controller\`](/reference/model/fluid-zones/disc#controller)                                                                                      | how the disc's forces are controlled: \`fixed\`, with \`omega\` and \`pitch\`, or \`tsr curve\`, with a tip speed ratio curve                                                                                        |
| [\`geometry\`](/reference/model/fluid-zones/disc#geometry)                                                                                          | \`centre\`, \`normal\`, \`up\`, \`inner radius\` and \`outer radius\`                                                                                                                                                  |
| [\`discretisation\`](/reference/model/fluid-zones/disc#discretisation)                                                                              | the representation of the disc, such as \`{"type": "disc", "number of elements": 48}\`                                                                                                                         |
| [\`model\`](/reference/model/fluid-zones/disc#model)                                                                                                | the force model: \`simple\`, averaged over the whole disc, or \`bet\`, by blade elements                                                                                                                         |
| [\`name\`](/reference/model/fluid-zones/disc#name)                                                                                                  | the name of the disc                                                                                                                                                                                         |
| [\`definition\`](/reference/model/fluid-zones/disc#definition)                                                                                      | a closed-surface VTP file selecting the disc's cells                                                                                                                                                         |
| [\`reference_plane\`](/reference/model/fluid-zones/disc#reference-plane) and [\`reference_point\`](/reference/model/fluid-zones/disc#reference-point) | for a \`simple\` model, where the reference velocity is taken: on a reference plane when \`reference_plane\` is true, otherwise at \`reference_point\`, or from the solver's reference condition if neither is set |
| [\`update_frequency\`](/reference/model/fluid-zones/disc#update-frequency)                                                                          | how often, in cycles, the disc's source is re-sampled                                                                                                                                                        |
| [\`rotation_direction\`](/reference/model/fluid-zones/disc#rotation-direction)                                                                      | the direction of rotation, such as \`clockwise\`                                                                                                                                                               |

A simple propeller with a fixed controller:

\`\`\`json
{
  "fluid_zones": {
    "FZ_1": {
      "type": "disc",
      "name": "R01",
      "definition": "propellor_vtp/R01.vtp",
      "reference plane": true,
      "update frequency": 10,
      "rotation direction": "clockwise",
      "controller": { "type": "fixed", "omega": 314.16, "pitch": 0.0 },
      "geometry": {
        "centre": [0.0, 0.0, 0.0],
        "normal": [0.0, 0.0, -1.0],
        "up": [1.0, 0.0, 0.0],
        "inner radius": 0.039,
        "outer radius": 0.175
      },
      "discretisation": { "type": "disc", "number of elements": 24 },
      "model": {
        "type": "simple",
        "kind": "propellor",
        "power model": "fixed",
        "thrust coefficient": 0.06,
        "power coefficient": 0.048
      }
    }
  }
}
\`\`\`

A \`bet\` model in place of the simple one describes the blades: their number, chord and twist along the radius, as
fractions of it, and the lift and drag of each aerofoil against angle of attack:

\`\`\`json
{
  "model": {
    "type": "bet",
    "kind": "propellor",
    "number of blades": 2,
    "number of sections": 24,
    "blade chord": [
      [0.2, 0.03],
      [1.0, 0.015]
    ],
    "blade twist": [
      [0.2, 40.0],
      [1.0, 12.0]
    ],
    "aerofoil positions": [
      [0.0, "naca4412"],
      [1.0, "naca4412"]
    ],
    "aerofoils": {
      "naca4412": {
        "cl": [
          [-10.0, -0.6],
          [0.0, 0.4],
          [10.0, 1.4]
        ],
        "cd": [
          [-10.0, 0.02],
          [0.0, 0.01],
          [10.0, 0.02]
        ]
      }
    },
    "tip loss correction": "rstar",
    "tip loss correction radius": 0.8
  }
}
\`\`\`

::: {.note}
Keys may be written with spaces, \`'inner radius'\` and \`'tip speed ratio'\`, or with underscores, \`inner_radius\` and
\`tip_speed_ratio\`. Both forms are normalised to the same field before validation.
:::

## Rotating zones

A \`rotating\` zone solves the flow in part of a mesh in a frame that turns about an axis, while the mesh itself stays
still. It is the multiple reference frame (MRF) treatment: the cells of the zone carry the Coriolis and centrifugal
sources of the rotating frame, and the cells outside it are solved in the stationary frame. It suits a body that turns
steadily inside a stationary one, such as a road wheel under a car, a fan in a duct or the impeller of a compressor,
where a steady run is to give the time-averaged flow.

| Key                                                              | Value                       | Meaning                                                  |
| ---------------------------------------------------------------- | --------------------------- | -------------------------------------------------------- |
| [\`cell zones\`](/reference/model/fluid-zones/rotating#cell-zones) | a list of cell zone numbers | the cells solved in the rotating frame                   |
| [\`axis\`](/reference/model/fluid-zones/rotating#axis)             | a vector                    | the axis of rotation, in placed coordinates              |
| [\`origin\`](/reference/model/fluid-zones/rotating#origin)         | a point                     | a point on the axis, in placed coordinates               |
| [\`omega\`](/reference/model/fluid-zones/rotating#omega)           | rad/s                       | the rate of rotation, positive right-handed about \`axis\` |

A rotating zone is always a frame on a still mesh. It takes no \`definition\`, no \`moving mesh\` and no ramp, and it runs
at its full rate from the first cycle. A cell zone may belong to only one rotating zone, but a model may carry several
rotating zones, each with its own axis and rate.

### A rotating zone or a \`motion\`

Both a rotating zone and the \`motion\` in the model's \`transforms\` can solve flow in a rotating frame. They differ in
how much of the mesh the frame covers, and in whether the mesh may move:

| The mesh                                                            | Write                                                                                 |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| a still mesh, part of which turns                                   | a \`rotating\` fluid zone on the cell zones that turn                                   |
| a still mesh that turns as a whole, such as a rotor in its own mesh | \`transforms > motion\` with \`"moving mesh": False\`                                     |
| a still mesh in a translating frame                                 | \`transforms > motion\` of type \`translating\`, with \`"moving mesh": False\`              |
| a mesh that moves through the run                                   | \`transforms > motion\` with \`"moving mesh": True\`, and an overset or sliding interface |

A model takes one source of frame: a model with a rotating zone carries no \`motion\`, and a model with a \`motion\`
carries no rotating zone. A mesh with a sliding or overset interface turns as a whole, so it takes a \`motion\` and no
rotating zone; see [Placing and moving a mesh](../working-with/placing-and-moving-a-mesh.md). A rotating zone avoids that interface: the
turning and stationary cells stay in one mesh, joined by ordinary interior faces.

### Preparing the mesh

The region that turns must be meshed as one or more cell zones of its own, enclosing the body that turns and nothing
that does not. The surface between those cells and the stationary ones carries the change of frame, so it should:

- be a surface of revolution about the axis, such as a cylinder or a disc, so that the flow crossing it is close to
  uniform around the axis;
- lie clear of the blades or spokes, with a few cells between the body and the surface;
- be made of faces shared by the cells either side, with no boundary zone or interface on it.

A rotating cell zone that cuts through a stationary wall, or a surface that wraps closely around blades, places the
change of frame where the flow varies most around the axis, and the solution then depends on where the surface was
drawn.

A wall bounding the cells of a rotating zone turns with the frame, so the blades and hub of a body inside the zone
need no \`velocity\` of their own. A wall \`velocity\` takes precedence over the frame: a stationary wall inside the zone,
such as a shroud, carries \`"velocity": {"type": "linear", "vector": [0.0, 0.0, 0.0]}\`, and a surface that turns but
lies outside the zone, such as the tread of a tyre, carries a rotating wall
[\`velocity\`](choosing-a-wall-model.md#moving-walls) with the same axis, origin and rate as the zone.

### Finding cell zone numbers

A zCFD mesh labels each cell with a cell zone number, held in its \`cellZone\` dataset. The Fluent and Fluent CFF
converters keep the cell zone numbers of the Fluent file, and the zone helper they write beside the mesh maps each
Fluent cell zone name to its number in \`fluid_zone\`; see
[Zone numbers](../setting-up/preparing-a-mesh.md#zone-identifiers):

\`\`\`python
from wheel_zone import fluid_zone

parameters["model"]["wheel"]["fluid zones"] = {
    "wheel": {"type": "rotating", "cell zones": [fluid_zone["wheel"]], ...},
}
\`\`\`

The helper may not list every cell zone in the mesh. For any mesh, the numbers can be read from a solution: add
\`cellzone\` to the volume output variables and run a few cycles:

\`\`\`python
"output settings": {"solution": {"volume variables": ["cellzone", "V", "p"]}},
\`\`\`

Open the volume output in ParaView and colour it by \`cellzone\`. A clip or slice through the turning body shows the
number of the region around it; a Threshold filter on \`cellzone\` isolates one region, which confirms that it encloses
the turning body and no more.

### Example: a road wheel

A wheel turning on a road, with the car's speed as the oncoming flow and the floor moving with it. The wheel's
radius is 0.2635 m, so at 160 km/h it turns at 168.6 rad/s. The cells around the wheel are cell zone 17, and the
tyre's tread and sidewall are boundary zones 14 and 20:

\`\`\`python
speed = 160.0 / 3.6
wheel_radius = 0.52709 / 2.0
rot_rate = speed / wheel_radius
wheel_axis = [0.0, -0.9988, 0.0498]
wheel_origin = [0.0, -0.6593, 0.2533]

parameters["model"]["wheel"] = {
    "mesh": "wheel.h5",
    "fluid zones": {
        "wheel": {
            "type": "rotating",
            "cell zones": [17],
            "axis": wheel_axis,
            "origin": wheel_origin,
            "omega": rot_rate,
        },
    },
    "boundary conditions": {
        "floor": {
            "zones": [8],
            "type": "wall",
            "kind": "wall function",
            "velocity": {"type": "linear", "vector": [speed, 0.0, 0.0]},
        },
        "tyre": {
            "zones": [14, 20],
            "type": "wall",
            "kind": "wall function",
            "velocity": {
                "type": "rotating",
                "axis": wheel_axis,
                "origin": wheel_origin,
                "omega": rot_rate,
            },
        },
        "hub": {"zones": [10, 11, 12, 13, 15, 19], "type": "wall", "kind": "wall function"},
        "symmetry": {"zones": [9], "type": "symmetry"},
        "farfield": {"zones": [4, 5, 6, 7], "type": "farfield", "condition": "IC_1", "kind": "riemann"},
    },
}
\`\`\`

The axis is tilted slightly from the y axis, to follow the camber of the wheel, and the origin lies on the axle. The
frame carries the flow through the spokes and the rim; the tyre's walls carry the same rotation, and the floor moves at
the oncoming speed, so the contact patch is at rest relative to the road.

### Example: a turbocharger compressor

A turbocharger compressor wheel turning at 5,000 rad/s about an axis along $-x$, in still air. The Fluent mesh has two
cell zones: cell zone 1, named \`fluid\`, is the passage around the wheel, and cell zone 0 is the stationary inlet and
housing around it. The frame covers cell zone 1, and the inlet and outlet hold \`IC_2\`, a reference condition at rest:

\`\`\`python
import turbo_zone as tz

impeller_axis = [-1.0, 0.0, 0.0]
impeller_origin = [0.0, 0.005967, 0.37498]
impeller_rate = 5000.0

parameters["model"]["turbo"] = {
    "mesh": "turbo.h5",
    "fluid zones": {
        "impeller": {
            "type": "rotating",
            "cell zones": [tz.fluid_zone["fluid"]],
            "axis": impeller_axis,
            "origin": impeller_origin,
            "omega": impeller_rate,
        },
    },
    "boundary conditions": {
        "wheel": {
            "zones": tz.to_id(["comp", "comp-fine", "comp-fe", "comp-extra-fine"]),
            "type": "wall",
            "kind": "wall function",
            "velocity": {
                "type": "rotating",
                "axis": impeller_axis,
                "origin": impeller_origin,
                "omega": impeller_rate,
            },
        },
        "housing": {
            "zones": tz.to_id(["body", "body-fine"]),
            "type": "wall",
            "kind": "wall function",
            "velocity": {"type": "linear", "vector": [0.0, 0.0, 0.0]},
        },
        "ports": {
            "zones": tz.to_id(["vel-inlet", "pressure-outlet"]),
            "type": "farfield",
            "condition": "IC_2",
            "kind": "pressure",
        },
    },
}
\`\`\`

The boundary between the cell zones does not follow the walls exactly. Part of the wheel's surface lies against
stationary cells, and part of the housing lies against rotating ones, so each wall states its own \`velocity\`: the wheel
turns with the frame wherever it lies, and the housing stays still where it passes through the rotating passage.
Where the zones and walls are uncertain, a \`velocity\` on every wall that touches a rotating zone removes the doubt. A
radial pressure gradient outlet on a diffuser exit takes its axis from the frame of the cells beside it; see
[Outflow](choosing-boundary-conditions.md#outflow).

## Porous Media

A porous zone adds the momentum source

$$
S_i = -\\left( \\frac{\\mu}{\\alpha} V_i + \\frac{1}{2} \\rho C_2 |V| V_i \\right)
$$

where $S_i$ is the source term in the $i$-th direction, $\\mu$ the dynamic viscosity, $\\alpha$ the permeability,
$\\rho$ the fluid density, $C_2$ the inertial resistance factor and $V_i$ the velocity component. The first term is
Darcy's law; in laminar flow it gives the pressure drop

$$
\\Delta P = \\frac{\\mu}{\\alpha} V
$$

where $\\Delta P$ is the pressure drop, $\\mu$ the dynamic viscosity, $\\alpha$ the permeability and $V$ the velocity.

[\`alpha\`](/reference/model/fluid-zones/porous#alpha) defaults to $10^{12}$, which is effectively no resistance, so a
porous zone does nothing until \`alpha\` is lowered or [\`C2\`](/reference/model/fluid-zones/porous#c2) is raised.

::: {.note}
The model constants are given in mesh units: $\\alpha$ is an area and $C_2$ an inverse length. The values below assume
a mesh in metres, with $\\alpha$ in m\u00b2 and $C_2$ in 1/m.
:::

| Material     | Permeability $\\alpha$ (m\u00b2) |
| ------------ | -------------------------- |
| Fence        | $1 \\times 10^{-7}$         |
| Car radiator | $1 \\times 10^{-9}$         |
| Sand         | $1 \\times 10^{-11}$        |

| Material       | Inertial resistance factor $C_2$ (1/m) |
| -------------- | -------------------------------------- |
| Open cell foam | 1000                                   |
| Gravel         | 500                                    |
| Sand           | 100                                    |
| Fine mesh      | 10000                                  |

## Momentum Source

A [momentum source](/reference/model/fluid-zones/momentum) applies an arbitrary body force, supplied as a Python
function of the cell centres. The
[momentum source function](../setting-up/python-functions-in-the-deck.md#momentum-source-function) returns one source
vector per cell, in non-dimensional units. This is a force per unit volume in the compressible solver and a
force per unit mass in the incompressible solver.

\`func\` is sampled once, when the zone is set up, and is not re-evaluated during the solve; an actuator disc, by
contrast, re-samples its source at every \`update_frequency\`. \`kind\` and \`frequency\` are accepted by the schema but have
no effect on a \`momentum\` zone.

\`\`\`python
def momentum_drive(*, locations):
    return [(0.0, 0.0, body_force) for _ in locations]

{
    'fluid_zones': {
        'FZ_1': {
            'type': 'momentum',
            'definition': 'pipe_periodic_region.vtp',
            'func': momentum_drive,
        }
    }
}
\`\`\`

## Canopy

A canopy zone represents a tree canopy in a terrain wind model.

[\`cd\`](/reference/model/fluid-zones/canopy#cd), [\`beta_p\`](/reference/model/fluid-zones/canopy#beta-p),
[\`beta_d\`](/reference/model/fluid-zones/canopy#beta-d), [\`Ceps_4\`](/reference/model/fluid-zones/canopy#ceps-4) and
[\`Ceps_5\`](/reference/model/fluid-zones/canopy#ceps-5) are defined in the literature, for example Desmond (2014).

\`\`\`python
def lad_function(*, locations, wall_distances):
    lai = 5.0
    h_can = 20.0
    return [np.interp(d, a_z[0] * h_can, a_z[1]) * lai / h_can for d in wall_distances]

{
    'fluid_zones': {
        'canopy_zone': {
            'type': 'canopy',
            'definition': 'canopy_dacosta.vtp',
            'function': lad_function,
            'cd': 0.25,
            'beta_p': 0.17,
            'beta_d': 3.37,
            'Ceps_4': 0.9,
            'Ceps_5': 0.9,
        },
    }
}
\`\`\`

The leaf area density varies with height:

\`\`\`python
a_z = (
    np.asarray([0.0, 0.43, 0.1, 0.45, 0.2, 0.56, 0.3, 0.74, 0.4, 1.10,
                0.5, 1.35, 0.6, 1.48, 0.7, 1.47, 0.8, 1.35, 0.9, 1.01,
                1.0, 0.00]).reshape(11, 2).T
)
\`\`\`

::: {.note}
When [\`field\`](/reference/model/fluid-zones/canopy#field) is used instead of \`definition\`, the height of the canopy at
each cell is found from the point of the supplied VTK file nearest the cell centre, and read from a node-based scalar
array named \`'Height'\`. A file without that array is rejected at validation.
:::

## Atmospheric Boundary Layer (ABL)

::: {.warning}
An [ABL zone](/reference/model/fluid-zones/abl) has no physical effect on the solution. Its fields are validated but
not read by the solver: the zone reduces to a bare momentum-source kernel over the selected cells, with no source
derived from \`roughness_length\`, \`friction_velocity\`, \`reference_height\` or \`wind_direction\`. An atmospheric boundary
layer profile is set on a reference condition instead; see
[ABL](choosing-initialisation-and-reference-state.md#abl).
:::

## Moving or deforming a mesh

zCFD has four distinct mechanisms for placing, moving or deforming a mesh, or the frame its flow is solved in, each
configured per model, that is per mesh:

| Mechanism                    | What it does                                                                                                                              | Where it is set                                                                                                                                                                                                                                                                  |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Initial placement            | a single static rotation, translation or scaling of the whole mesh, applied once when it loads                                            | the \`scale\` and \`transform\` in the model's [\`transforms\`](/reference/model/transforms)                                                                                                                                                                                           |
| Rigid motion of a whole mesh | a mesh rotating or translating during the run, such as a rotor or a moving overset component                                              | the [\`motion\`](/reference/model/transforms#motion) in the model's \`transforms\`, with \`"moving mesh": True\`; see [Placing and moving a mesh](../working-with/placing-and-moving-a-mesh.md)                                                                                        |
| Moving reference frame       | cells of a still mesh solved in a rotating or translating frame                                                                           | for part of the mesh, a [\`rotating\`](/reference/model/fluid-zones/rotating) fluid zone on its cell zones; see [Rotating zones](#rotating-zones). For the whole mesh, the [\`motion\`](/reference/model/transforms#motion) in the model's \`transforms\`, with \`"moving mesh": False\` |
| Mesh morphing                | a known deformation of a surface, such as a wing or blade deflecting under load, carried into the volume mesh by RBF or IDW interpolation | an \`'rbf transform'\` or \`'idw transform'\` entry in [\`fluid_zones\`](/reference/model/fluid-zones); see [Fluid\u2013structure interaction](../working-with/fluid-structure-interaction.md#mesh-deformation)                                                                             |

## Reference entries

- [Fluid zones](/reference/model/fluid-zones), with each zone type
- [\`rotating\`](/reference/model/fluid-zones/rotating), [\`disc\`](/reference/model/fluid-zones/disc),
  [\`porous\`](/reference/model/fluid-zones/porous), [\`canopy\`](/reference/model/fluid-zones/canopy),
  [\`momentum\`](/reference/model/fluid-zones/momentum)
- [\`transforms\`](/reference/model/transforms), with its \`motion\`
`;export{e as default};