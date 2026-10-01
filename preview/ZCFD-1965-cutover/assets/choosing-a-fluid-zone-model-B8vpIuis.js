var e=`
# Choosing a fluid-zone model

Which fluid zone represents the device, obstruction or motion in the flow?

Choose the zone type by what the flow must feel. A rotor, propeller or turbine whose blades the mesh does not resolve
is an actuator disc. A distributed resistance, such as a radiator, a fence or a packed bed, is a porous zone, and a
tree canopy over terrain is a canopy zone. Any other body force is a momentum source, written as a Python function. A
zone of cells that rotates or translates is a rotating or translating zone, run either as a reference frame or as a
mesh that moves.

| \`type\`                                                                                                                       | Represents                                                   | Selects its cells by    |
| ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ----------------------- |
| [\`disc\`](/reference/model/fluid-zones/disc)                                                                                  | an actuator disc: a rotor, propeller or turbine              | \`zones\` or \`definition\` |
| [\`porous\`](/reference/model/fluid-zones/porous)                                                                              | a porous medium, as viscous and inertial resistance          | \`zones\` or \`definition\` |
| [\`canopy\`](/reference/model/fluid-zones/canopy)                                                                              | a tree canopy in a terrain wind model                        | \`zones\` or \`definition\` |
| [\`momentum\`](/reference/model/fluid-zones/momentum)                                                                          | an arbitrary body force, from a Python function              | \`zones\` or \`definition\` |
| [\`rotating\`](/reference/model/fluid-zones/rotating)                                                                          | a rotating reference frame, or a mesh that rotates           | \`zones\`                 |
| [\`translating\`](/reference/model/fluid-zones/translating)                                                                    | a zone of cells translating relative to the rest of the mesh | \`zones\`                 |
| [\`rbf transform\`](/reference/model/fluid-zones/rbf-transform), [\`idw transform\`](/reference/model/fluid-zones/idw-transform) | a surface deformation carried into the volume mesh           | \`zones\`                 |
| [\`abl\`](/reference/model/fluid-zones/abl)                                                                                    | validated, but has no effect on the solution                 | \`zones\`                 |

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

Most zone types select the cells they act on with \`zones\`, a list of the mesh's numbered cell zones, numbered in the
same way as for [boundary conditions](choosing-boundary-conditions.md#zones). The \`momentum\`, \`porous\`, \`disc\` and
\`canopy\` types also accept \`definition\` as an alternative: the path to a closed-surface VTP file describing the
region. For \`momentum\`, \`porous\` and \`canopy\` zones, validation requires exactly one of the two. For \`disc\` zones both
are optional in the schema, although the solver needs one of them to select any cells. Rotating, translating and ABL
zones accept only \`zones\`; they have no VTP-region equivalent.

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

The [\`type\`](/reference/model/fluid-zones/disc#model-type) key of the disc's \`model\` block selects a \`'simple'\` disc,
with fixed or curve-driven thrust and power coefficients, or a \`'bet'\` disc, based on blade-element theory.

The [\`normal\`](/reference/model/fluid-zones/disc#geometry-normal) sets the direction of the disc's force. In zCFD the
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
| [\`definition\`](/reference/model/fluid-zones/disc#definition)                                                                                      | a VTP file selecting the disc's cells, as an alternative to \`zones\`                                                                                                                                          |
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

## Rotating and translating zones

A zone of cells is rotated or translated relative to the rest of the mesh by a
[\`'rotating'\`](/reference/model/fluid-zones/rotating) or [\`'translating'\`](/reference/model/fluid-zones/translating)
entry in the model's \`fluid_zones\`. The same entry serves two purposes. On its own it is a rotating reference frame,
for a spinning cylinder or a rotor in its own non-overset mesh, for example. Combined with an overset or sliding
[interface](/reference/model/boundary-conditions/interface) and \`moving_mesh: True\`, it is a mesh that moves every
time step and is coupled afresh to the mesh on the other side of the interface.

| Setting                                                                        | The zone is                                                                    | Requires                                                              |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| \`moving_mesh: False\` (the default)                                             | a rotating reference frame, with Coriolis and centrifugal momentum sources     | nothing further                                                       |
| [\`moving_mesh\`](/reference/model/fluid-zones/rotating#moving-mesh)\`: True\`     | rotated by an angle that the overset mapper and the sliding intersection apply | an unsteady run, and an overset or sliding interface on the same mesh |
| [\`move_mesh\`](/reference/model/fluid-zones/rotating#move-mesh)\`: True\` as well | a mesh physically rotated every time step, solved in the inertial frame        | \`moving_mesh: True\`                                                   |

By default a rotating zone applies the momentum source of a rotating reference frame without moving the mesh: the
classic MRF treatment.

[\`moving_mesh\`](/reference/model/fluid-zones/rotating#moving-mesh)\`: True\` moves the zone physically instead. It
requires an unsteady run, and an overset or sliding interface declared on the same mesh; setting it in any other case
is rejected at validation. The physical location of the zone is then recalculated every step, together with the
overset mapping or the sliding-interface intersection. The mesh coordinates themselves stay where they are: the
rotation is carried as an angle, which the overset mapper and the sliding intersection apply to what they transfer.

[\`move_mesh\`](/reference/model/fluid-zones/rotating#move-mesh)\`: True\` as well rotates the mesh physically every
time step and solves the zone in the inertial frame, so that the interface reads the mesh's true position rather than
reconstructing it. Both treatments are exact for the interior, since a pure rotation changes no volume and no area.
\`move_mesh\` requires \`moving_mesh\`. Without it the zone is a rotating reference frame carrying Coriolis and
centrifugal sources, and the rotation would be applied twice, so that combination is rejected.

A rotating reference frame, with the mesh placed by an initial rotation; there is no overset interface, so
\`moving_mesh\` keeps its default:

\`\`\`python
import zutil.transform

{
    "model": {
        "background": {
            "mesh": "cylinder.h5",
            "transforms": {"transform_matrix": zutil.transform.rotate([0, 1, 0], -90.0)},
            "fluid_zones": {
                "rotating_zone": {
                    "type": "rotating",
                    "zones": [3],
                    "axis": [0, 0, 1],
                    "origin": [0, 0, 0],
                    "omega": 17.453292519943297,
                }
            },
            "boundary_conditions": {...},
        }
    }
}
\`\`\`

An overset mesh rotated in place every time step, with \`moving_mesh: True\` and an overset interface on the same
model:

\`\`\`python
{
    "model": {
        "cylinder_1": {
            "mesh": "cylinder_origin.h5",
            "transforms": {
                "transform_matrix": [
                    [1.0, 0.0, 0.0, 0.0],
                    [0.0, 1.0, 0.0, 1.2],
                    [0.0, 0.0, 1.0, 1.2],
                    [0.0, 0.0, 0.0, 1.0],
                ]
            },
            "fluid_zones": {
                "FZ_1": {
                    "type": "rotating",
                    "zones": [0],
                    "axis": [1.0, 0.0, -0.0],
                    "origin": [0.0, 1.2, 1.2],
                    "omega": 104.71975511965978,
                    "moving_mesh": True,
                }
            },
            "boundary_conditions": {
                "BC_1": {"zones": [7], "type": "interface", "kind": "overset"}
            },
        }
    }
}
\`\`\`

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
function of the cell centres.

\`func\` is sampled once, when the zone is set up, and is not re-evaluated during the solve; an actuator disc, by
contrast, re-samples its source at every \`update_frequency\`. \`kind\` and \`frequency\` are accepted by the schema but have
no effect on a \`momentum\` zone.

\`\`\`python
def momentum_drive(cell_centre_list):
    """Return a constant +z body force (fx, fy, fz) per cell."""
    return [(0.0, 0.0, body_force) for _ in cell_centre_list]

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
def lad_function(cell_centre_list):
    lai = 5.0  # for example following Da Costa 2007
    h_can = 20.0
    lad_list = []
    for cell in cell_centre_list:
        wall_distance = cell[3]
        lad = (np.interp(wall_distance, a_z[0] * h_can, a_z[1]) * lai / h_can,)
        lad_list.append(lad)
    return lad_list

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
array named \`'Height'\`.
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

zCFD has three distinct mechanisms for moving or deforming a mesh, each configured independently and per model, that
is per mesh:

| Mechanism                 | What it does                                                                                                                              | Where it is set                                                                                                                                                                                      |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Initial placement         | a single static rotation, translation or scaling of the whole mesh, applied once when it loads                                            | the model's [\`transforms\`](/reference/model/transforms)                                                                                                                                              |
| Dynamic rigid-body motion | a zone of cells rotating or translating relative to the rest of the mesh, such as a rotor or a moving overset component                   | a \`'rotating'\` or \`'translating'\` entry in [\`fluid_zones\`](/reference/model/fluid-zones); see [Rotating and translating zones](#rotating-and-translating-zones)                                      |
| Mesh morphing             | a known deformation of a surface, such as a wing or blade deflecting under load, carried into the volume mesh by RBF or IDW interpolation | an \`'rbf transform'\` or \`'idw transform'\` entry in [\`fluid_zones\`](/reference/model/fluid-zones); see [Fluid\u2013structure interaction](../working-with/fluid-structure-interaction.md#mesh-deformation) |

## Reference entries

- [Fluid zones](/reference/model/fluid-zones), with each zone type
- [\`disc\`](/reference/model/fluid-zones/disc), [\`porous\`](/reference/model/fluid-zones/porous),
  [\`canopy\`](/reference/model/fluid-zones/canopy), [\`momentum\`](/reference/model/fluid-zones/momentum)
- [\`rotating\`](/reference/model/fluid-zones/rotating) and [\`translating\`](/reference/model/fluid-zones/translating)
- [\`transforms\`](/reference/model/transforms)
`;export{e as default};