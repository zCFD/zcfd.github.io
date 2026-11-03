var e=`
# Python functions in the deck

Several parameters in the zCFD control dictionary accept a Python function in place of a value. The solver calls the
function when it needs the value, so a field, a source or a ramp can follow any expression you can write in Python.

## How zCFD calls a function

Every function is called with keyword arguments only, each named for what it holds. Write the parameters after a bare
\`*\`, so that the signature says at once what the function receives:

\`\`\`python
def shock(*, location, wall_distance, pressure, temperature, velocity):
    return {"pressure": 2.0 * pressure if location[0] < 0.5 else pressure}
\`\`\`

A function must name every keyword it is given, even one it does not use, or collect them with \`**kwargs\`.

A vector, whether it comes in or goes out, is three numbers in order x, y, z. Return it as a tuple, a list or a numpy
array; a \`{"v1": x, "v2": y, "v3": z}\` dict is also read. Lengths are in metres, times in seconds, and pressures,
temperatures and velocities are dimensional, in Pa, K and m/s.

| Parameter                                                                            | Called with                                                        | Returns                                                         |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------ | --------------------------------------------------------------- |
| [\`cfl_ramp\`](/reference/solver/convergence-control/cfl/cfl-ramp)                     | \`cycle\`, \`current_cfl\`                                             | the new CFL, or a dict of \`cfl\`, \`cfl_turbulence\`, \`cfl_coarse\` |
| [\`transform\`](/reference/solver/output-settings/report/forces#transform)             | \`vector\`                                                           | the transformed vector                                          |
| [\`initial_conditions\`](/reference/solver/initialisation#initial-conditions)          | \`location\`, \`wall_distance\`, \`pressure\`, \`temperature\`, \`velocity\` | a dict of any of \`pressure\`, \`temperature\`, \`velocity\`          |
| [\`func\`](/reference/model/fluid-zones/momentum#func) of a momentum zone              | \`locations\`                                                        | one source vector per location                                  |
| [\`function\`](/reference/model/fluid-zones/canopy#function) of a canopy zone          | \`locations\`, \`wall_distances\`                                      | one leaf area density per location                              |
| [\`func\`](/reference/model/fluid-zones/rbf-transform#func) of a mesh deformation zone | \`location\`                                                         | the deformed position                                           |

## What validation checks

zCFD checks each function when it reads the control file. It binds the signature to the keywords above, calls the
function with representative values, and checks the shape of what comes back. The first call puts any location at the
origin or on the x axis. If that call raises, zCFD calls the function again at a point off the axes, so a function that
is singular only on an axis, such as a swirl about the z axis, is accepted. A function that raises at both points, or
returns the wrong shape, is rejected with a message that names it:

\`\`\`text
solver \u203a output settings \u203a report \u203a forces \u203a FR_1 \u203a transform
  The forces transform my_transform(x, y, z) cannot take the keywords zCFD calls it with: vector. Write it as def my_transform(*, vector).
\`\`\`

\`\`\`text
solver \u203a initialisation \u203a initial conditions
  The initial conditions function shock returned {'density': 1.2} (dict) when called with location=(0.0, 0.0, 0.0), wall_distance=1.0, pressure=101325.0, temperature=288.15, velocity=(1.0, 0.0, 0.0); it must return a dict of any of 'pressure', 'temperature' and 'velocity'; 'density' is not one of them.
\`\`\`

Because of those calls, a function should give the same answer however many times it is called. One that keeps count
of its own calls sees one or two more than the solver makes.

## Ramp CFL Function

The named shapes in [cfl_ramp](/reference/solver/convergence-control/cfl/cfl-ramp) cover most cases. Where the CFL needs
to respond to something they cannot express, \`cfl_ramp\` accepts a function instead of the list.

The function is called once per pseudo-time cycle with the cycle number and the CFL in use, and returns the CFL for
that cycle. The result is limited to the \`cfl\` target.

\`\`\`python
def my_cfl_ramp(*, cycle, current_cfl):
    if cycle < 500:
        return min(1.0 * 1.005 ** (cycle - 1), 10.0)
    elif cycle < 1000:
        return 15.0
    return 30.0
\`\`\`

\`\`\`python
{"convergence_control": {"cfl": {"cfl": 30.0, "cfl_ramp": my_cfl_ramp}}}
\`\`\`

Returning a dictionary drives the turbulence and coarse-level CFL targets alongside the mean-flow one. Any key left out
keeps the value from the control dictionary:

\`\`\`python
def my_cfl_ramp(*, cycle, current_cfl):
    cfl = min(1.0 * 1.005 ** (cycle - 1), 30.0)
    return {"cfl": cfl, "cfl_turbulence": 0.5 * cfl}
\`\`\`

## Transform Function

A transform on a force report turns each force and moment vector into a different coordinate system before it is
written. It is most often used to report lift and drag, which lie in the wind axes rather than the solver axes.

\`\`\`python
import zutil

alpha = 10.0


def wind_axes(*, vector):
    return zutil.rotate_vector(vector, alpha, 0.0)
\`\`\`

\`\`\`python
{"report": {"forces": {"FR_1": {"name": "wing", "zones": [3], "transform": wind_axes}}}}
\`\`\`

## Initialisation Function

A function as the initial condition is called once for every cell, with the cell centre, its wall distance and the
state the cell holds before the function runs. It returns the quantities it sets; any it leaves out keep their value.

\`\`\`python
def shock(*, location, wall_distance, pressure, temperature, velocity):
    if location[0] < 0.5:
        return {"pressure": 100000.0, "temperature": 348.4, "velocity": (0.0, 0.0, 0.0)}
    return {"pressure": 10000.0, "temperature": 278.7, "velocity": (0.0, 0.0, 0.0)}
\`\`\`

A function as the initial condition needs a [\`reference\`](/reference/solver/initialisation#reference) condition beside
it:

\`\`\`python
{"initialisation": {"reference": "IC_1", "initial_conditions": shock}}
\`\`\`

## Momentum source function

A momentum zone's \`func\` is called once, when the zone is set up, with the centre of every cell in the zone. It returns
one source vector for each centre, in the units of the zone's [\`source\`](/reference/model/fluid-zones/momentum#source).

\`\`\`python
def momentum_drive(*, locations):
    return [(0.0, 0.0, body_force) for _ in locations]
\`\`\`

## Leaf area density function

A canopy zone's \`function\` is called with the centre of every cell in the canopy and its wall distance, in the same
order. It returns the leaf area density of each cell, in 1/m.

\`\`\`python
def lad_function(*, locations, wall_distances):
    lai = 5.0
    h_can = 20.0
    return [np.interp(d, a_z[0] * h_can, a_z[1]) * lai / h_can for d in wall_distances]
\`\`\`

## Mesh deformation function

The \`func\` of an RBF or IDW mesh deformation zone is called with the position of each surface node it moves, and returns
the node's deformed position. The zone then spreads the surface displacement through the volume mesh.

\`\`\`python
def pitch(*, location):
    return zutil.rotate_vector(location, 2.0, 0.0)
\`\`\`
`;export{e as default};