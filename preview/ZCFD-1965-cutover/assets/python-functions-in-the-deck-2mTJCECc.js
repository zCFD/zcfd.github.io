var e=`
# Python functions in the deck

Several parameters in the zCFD control dictionary will accept functions as arguments. These functions are then evaluated by the solver when required. This allows you to customise and tune the solver as it runs.

## Ramp CFL Function

The named shapes in [cfl_ramp](/reference/solver/convergence-control#cfl-cfl-ramp) cover most cases. Where the CFL needs to respond to something they cannot express, \`cfl_ramp\` accepts a Python callable instead of the list.

The function is called once per pseudo-time cycle as \`f(cycle, current_cfl)\`, and returns the CFL for that cycle. The result is clamped to the \`cfl\` target.

| Field                   | Value                                                             |
| ----------------------- | ----------------------------------------------------------------- |
| **Description**         | Provide a dynamic CFL number                                      |
| **Valid for parameter** | [cfl_ramp](/reference/solver/convergence-control#cfl-cfl-ramp)    |
| **Parameters**          | solve_cycle, current_cfl                                          |
| **Returns**             | float, or a dictionary of \`cfl\` / \`cfl_turbulence\` / \`cfl_coarse\` |

Example:

\`\`\`python
# Hold a low CFL until the shock has settled, then step up
def my_cfl_ramp(solve_cycle, current_cfl):
    if solve_cycle < 500:
        return min(1.0 * 1.005 ** (solve_cycle - 1), 10.0)
    elif solve_cycle < 1000:
        return 15.0
    return 30.0
\`\`\`

\`\`\`python
parameters = {
 ...
 "solver": {
   ...
   "convergence control": {
     "cfl": {"cfl": 30.0, "cfl ramp": my_cfl_ramp},
     ...
     }
   ...
   }
 ...
}
\`\`\`

Returning a dictionary drives the turbulence and coarse-level CFL targets alongside the mean-flow one. Any key left out keeps the value from the control dictionary:

\`\`\`python
def my_cfl_ramp(solve_cycle, current_cfl):
    cfl = min(1.0 * 1.005 ** (solve_cycle - 1), 30.0)
    return {"cfl": cfl, "cfl_turbulence": 0.5 * cfl}
\`\`\`

## Transform Function

A transformation function my be supplied to the force report block to transform the force into a different coordinate system. This is particularly useful for reporting lift and drag, which are often rotated from the solver coordinate system.

| Field                   | Value                                                               |
| ----------------------- | ------------------------------------------------------------------- |
| **Description**         | Transform a supplied point - rotate, scale or translate.            |
| **Valid for parameter** | [Forces transform](/reference/solver/output-settings#report-forces) |
| **Parameters**          | (x, y, z): floats                                                   |
| **Returns**             | (x, y, z): floats                                                   |

Example:

\`\`\`python
#zutil is a Zenotech python library providing various utilities, available within a zCFD installation
import zutil

# Angle of attack
alpha = 10.0
# Transform into wind axis
def my_transform(x,y,z):
    v = [x,y,z]
    v =  zutil.rotate_vector(v,alpha,0.0)
    return  {v[0], v[1], v[2]}
\`\`\`

## Initialisation Function

| Field                   | Value                                                                                           |
| ----------------------- | ----------------------------------------------------------------------------------------------- |
| **Description**         | Provide the initial flow field variables on a cell-by-cell basis                                |
| **Valid for parameter** | [initial_conditions](/reference/solver/initialisation#initial-conditions)                       |
| **Parameters**          | kwargs dictionary containing "pressure", "temperature", "velocity", "wall_distance", "location" |
| **Returns**             | dictionary containing one or more of "pressure", "temperature" or "velocity"                    |

\`\`\`python
def my_initialisation(**kwargs):
  # Dimensional primitive variables
  pressure = kwargs['pressure']
  temperature = kwargs['temperature']
  velocity = kwargs['velocity']
  wall_distance = kwargs['wall_distance']
  # Cell centre localtion [X, Y, Z]
  location = kwargs['location']

  if location[0] > 10.0:
    velocity[0] *= 2.0

  # Return a dictionary with user defined quantity.
  return { 'velocity' : velocity }
\`\`\`

A function as the initial condition needs a [\`reference\`](/reference/solver/initialisation#reference) condition beside it:

\`\`\`python
{"initialisation": {"reference": "IC_1", "initial_conditions": my_initialisation}}
\`\`\`

## Driven initial condition

A 'driving function' provides another way of prescribing a farfield initial condition, which on evaluation returns an initial condition dictionary.

The driving function is re-evaluated at zCFD's reporting frequency, meaning that the condition (e.g. inlet velocity) can be programmed to change as the simulation progresses.

At startup, the function is only provided with the key word arguments RealTimeStep=0, Cycle=0. However, the driving function is subsequently provided with key word arguments containing all the data in the '\\_report.csv' file, evaluated at the previous timestep. For any driven initial condition, every value in the initial condition dictionary is also appended to the \\_report.csv file.

This means that the initial condition can be programmed to respond to the flow. An example is shown below, where the driven IC will continually adjust inlet angle of attack until a specified lift coefficient is achieved.

If the driven initial condition has been programmed to respond to changes in the flow, it is important to ensure that the flow has had enough time to propagate from the farfield through to the region of interest and settle before readjusting the driven initial condition. For simulations where the farfield is distant from the geometry, local and implicit time-stepping will likely give the fastest propagation of adjusted farfield conditions through the domain.

::: {.note}
Driven initial conditions **cannot** be used as reference conditions, to initialise the flow (e.g 'IC_1') or within a restarted simulation.
:::

| Field                   | Value                                                                                         |
| ----------------------- | --------------------------------------------------------------------------------------------- |
| **Description**         | Provides a farfield initial condition that can respond to changes in the flow.                |
| **Valid for parameter** | [initial condition](/reference/solver/initialisation)                                         |
| **Parameters**          | kwargs dictionary containing "RealTimeStep", "Cycle" and all reporting variables              |
| **Returns**             | dictionary containing valid keys for an [initial condition](/reference/solver/initialisation) |

\`\`\`python
def example_ic_func(**kwargs):
  """
  Example driver function to target a lift coefficient by varying
  angle of attack
  """
  alpha_init = 0 # Initial angle of attack
  lift_target= 0.5 # Targeted lift coefficient
  update_period = 1000 # How often alpha should be updated
  flow_settling_period = 1500

  assumed_d_cL_d_alpha = 0.1 # Used to estimate alpha which would give required lift
  relaxation_factor = 1.15 # <1: under-relaxation, >1: over-relaxation


  if 'lift_target_alpha' in kwargs.keys(): # If timestep > 1
      alpha_current = kwargs['lift_target_alpha']
      F_xyz = [kwargs['wall_Fx'], kwargs['wall_Fy'], kwargs['wall_Fz']]
      F_LDS = zutil.rotate_vector(F_xyz, alpha_current, 0.0)
      lift_current = F_LDS[2] # Lift coefficient, having rotated to account for alpha
  else:
      lift_current = 0 # placeholder value

  if kwargs['Cycle'] < flow_settling_period:
      alpha_new = alpha_init
  else:
      if (kwargs['Cycle'] % update_period) == 0:
          d_cL_required = lift_target - lift_current
          d_alpha = relaxation_factor / assumed_d_cL_d_alpha *  d_cL_required
          alpha_new = alpha_current + d_alpha
          print("Alpha updated from {} to {}".format(alpha_current, alpha_new), flush = True)
      else:
          alpha_new = alpha_current

  dict_out = {
      "temperature": 300,
      "pressure": 101325.0,
      'v': {
          'mach' : 0.15,
          'vector' : zutil.vector_from_angle(alpha_new, 0.0)
          },
      "reynolds no": 6.0e6,
      "eddy viscosity ratio": 1.0,
      "monitor": { # Monitor entries can be floats or lists of floats
                    "prefix": "lift_target",
                    "alpha": alpha_new,   # Extra keys can be added to a driven IC dictionary,
                    "lift": lift_current,  # allowing monitoring of key parameters flow in the _report.csv
                  },
  }

  return dict_out
\`\`\`

\`\`\`python
{"reference_conditions": {"IC_2": example_ic_func}}
\`\`\`
`;export{e as default};