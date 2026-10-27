var e=`
# Polars and trimming to a target

## What is in this tutorial?

Two questions come up on almost every aerofoil or wing. How do the lift (the force at right angles to the oncoming
air) and the drag (the force along it) change with the angle of attack, the angle between the aerofoil's chord line
and the oncoming air? And what angle gives the lift you need? This tutorial answers both on the NACA 0012 aerofoil
from [Simple aerofoil](./1-simple-aerofoil.md).

First you run the aerofoil at three angles and plot its polar: the lift against the angle, and the lift against the
drag. Then you let zCFD trim the aerofoil: it turns the oncoming flow, a step at a time, until the lift reaches a value
you ask for. Lift and drag are given as coefficients, CL and CD, the force divided by the dynamic pressure of the
oncoming air and a reference area, so that they do not depend on the size or speed of the test.

## What you need?

Work through [Simple aerofoil](./1-simple-aerofoil.md) first: this tutorial uses the same mesh, and relies on it for
running zCFD, reading the log and monitoring a run in zMon. On an NVIDIA RTX 3060 each polar run takes about four
minutes, and the trim about five.

::: {.track when="deck"}

## Step 1. Download the files

The tutorial bundle can be downloaded [here](https://zcfd.zenotech.com/v2026.08.14860/tutorial_8_aerofoil_polar_and_trim.tgz).
It contains the mesh (\`naca0012.h5\`) and four control files: \`naca0012.py\` at zero angle of attack,
\`naca0012_alpha5.py\` and \`naca0012_alpha10.py\` for the polar, and \`naca0012_target_cl.py\` for the trim.

\`\`\`bash
cd ~
wget https://zcfd.zenotech.com/v2026.08.14860/tutorial_8_aerofoil_polar_and_trim.tgz
tar xzf tutorial_8_aerofoil_polar_and_trim.tgz
cd tutorial_8_aerofoil_polar_and_trim
\`\`\`

## Step 2. Walk through the input

The control file, \`naca0012.py\`, is a short Python script. All it does is build one Python dictionary, called
\`parameters\`, that tells zCFD everything about the run: the physics, the numerical method, what to write out, and the
mesh with its boundaries. This step walks through that dictionary from top to bottom. Each heading below is the name of
a key, written exactly as it appears in the file, and the headings nest the same way the dictionary does:
\`numerical scheme\`, for example, sits inside \`solver\`. Under each heading you'll find what that part controls, what
each setting means, and why it has the value it has here. Each section ends with a link to that part's reference page,
which lists every setting it accepts and its default; you don't need it to follow the tutorial. On a wide screen the
whole control file sits on the right, with the part being described highlighted as you scroll.

\`naca0012.py\` is the base control file: the other three load it and change only a few keys, so they are described
after it, by the keys they change. The base file is the one from
[Simple aerofoil](./1-simple-aerofoil.md#step-2-walk-through-the-input) with two parts changed for an aerofoil that
makes lift: \`numerical scheme\` and \`convergence control\`.

\`\`\`python
parameters = {
    "config version": 2,
    "solver": {
        "solver settings": {"type": "compressible"},
        "equations": {
            "type": "rans",
            "turbulence": {"model": "sst"},
            "precondition": True,
        },
        "fluid properties": {
            "material": "air",
            "gamma": 1.4,
            "gas constant": 287.0,
            "sutherlands const": 110.4,
            "prandtl no": 0.72,
            "turbulent prandtl no": 0.9,
        },
        "reference conditions": {
            "IC_1": {
                "temperature": 300,
                "pressure": 101325.0,
                "v": {"vector": [1.0, 0.0, 0.0], "mach": 0.15},
                "viscosity": 1.02145e-05,
                "turbulence intensity": 5.2e-2,
                "eddy viscosity ratio": 1.0,
            },
        },
        "initialisation": {"initial conditions": "IC_1", "restart": False},
        "numerical scheme": {
            "order": "second",
            "limiter": "van albada",
            "inviscid flux scheme": "roe",
        },
        "time settings": {"type": "steady"},
        "convergence control": {
            "scheme": {"name": "implicit euler"},
            "cfl": {
                "cfl": 100,
                "cfl ramp": [{"type": "exponential", "factor": 1.1, "initial": 0.05}],
            },
            "cycles": 2000,
        },
        "output settings": {
            "report": {
                "frequency": 10,
                "forces": {
                    "FR_1": {"name": "wall", "zones": [4]},
                },
            },
            "solution": {
                "surface variables": [
                    "V",
                    "p",
                    "mach",
                    "cp",
                    "cf",
                    "pressureforce",
                    "frictionforce",
                ],
                "volume variables": [
                    "V",
                    "p",
                    "T",
                    "rho",
                    "mach",
                    "cp",
                    "eddy",
                ],
            },
        },
    },
    "model": {
        "naca0012": {
            "mesh": "naca0012.h5",
            "boundary conditions": {
                "BC_1": {
                    "zones": [1],
                    "type": "farfield",
                    "condition": "IC_1",
                    "kind": "riemann",
                },
                "BC_2": {
                    "zones": [4],
                    "type": "wall",
                    "kind": "no slip",
                },
                "BC_3": {
                    "zones": [2, 3],
                    "type": "symmetry",
                },
            },
        },
    },
}
\`\`\`

### \`config version\`

Says which layout of control file this is, so zCFD knows how to read the rest.

- \`config version\`: \`2\`, the current layout, with \`solver\` and \`model\` at the top level.

### \`solver\`

The settings shared by the whole simulation: which solver runs, what it solves, the fluid, the flow state, and how
the run marches and what it writes.

#### \`solver settings\`

Chooses the solver.

- \`type\`: \`"compressible"\`: the solver that lets the air's density change, as in Simple aerofoil.

See [\`solver settings\`](/reference/solver/solver-settings).

#### \`equations\`

Sets the equations being solved.

- \`type\`: \`"rans"\`, the Reynolds-averaged Navier\u2013Stokes equations. These solve for the average flow and represent
  the effect of turbulence, the small chaotic eddies, with a turbulence model.
- \`turbulence\`: \`{"model": "sst"}\`, Menter's SST model, a widely used general-purpose turbulence model.
- \`precondition\`: \`True\`: low-speed preconditioning, which helps the compressible solver converge for slow flows. It
  is recommended below about Mach 0.3, 0.3 times the speed of sound; this flow is at Mach 0.15.

See [\`equations\`](/reference/solver/equations) and
[Choosing a turbulence model](../guide/choosing/choosing-a-turbulence-model.md).

#### \`fluid properties\`

Describes the gas.

- \`material\`: \`"air"\`, as an ideal gas.
- \`gamma\` and \`gas constant\`: \`1.4\` and \`287.0\` J/kg/K, the standard values for air.
- \`sutherlands const\`: \`110.4\` K, for Sutherland's law, which sets how the viscosity changes with temperature.
- \`prandtl no\` and \`turbulent prandtl no\`: \`0.72\` and \`0.9\`, which relate how fast heat spreads to how fast momentum
  does, in smooth and turbulent flow.

See [\`fluid properties\`](/reference/solver/fluid-properties).

#### \`reference conditions\`

Defines named flow states, each a set of values such as temperature, pressure and velocity. Other parts of the
file refer to them by name: to fill the domain at the start, to set conditions at boundaries, and to scale the
equations.

##### \`IC_1\`

The freestream: the undisturbed air far from the aerofoil.

- \`temperature\` and \`pressure\`: \`300\` K and \`101325.0\` Pa.
- \`v\`: \`{"vector": [1.0, 0.0, 0.0], "mach": 0.15}\`: Mach 0.15 along x, along the chord, so the aerofoil is at zero
  angle of attack. The polar control files turn this vector.
- \`viscosity\`: \`1.02145e-05\` kg/m/s, which gives a Reynolds number, the ratio of the air's inertia to its viscosity,
  of 6 million on the 1 m chord.
- \`turbulence intensity\` and \`eddy viscosity ratio\`: \`5.2e-2\` and \`1.0\`, the turbulence in the incoming flow.

See [\`reference conditions\`](/reference/solver/reference-conditions).

#### \`initialisation\`

Chooses which state starts the run.

- \`initial conditions\`: \`"IC_1"\`: the whole domain starts at the freestream.
- \`restart\`: \`False\`: start afresh rather than from a previous solution.

See [\`initialisation\`](/reference/solver/initialisation).

#### \`numerical scheme\`

Sets how the equations are discretised in space: how the smooth flow is represented by one value in each cell of
the mesh. This is the first of the two parts that differ from [Simple aerofoil](./1-simple-aerofoil.md).

- \`order\`: \`"second"\`: the solver estimates how every variable, the turbulence variables included, varies across
  each cell, which is more accurate than treating it as constant. Simple aerofoil's \`"euler_second"\` does this for
  the flow but treats the turbulence variables as constant in each cell.
- \`limiter\`: \`"van albada"\`: where the flow changes sharply, as it does accelerating round the leading edge, that
  estimate can overshoot; the limiter damps it. It is also the default, so Simple aerofoil uses it too; here it is
  written out.
- \`inviscid flux scheme\`: \`"roe"\`: Roe's method for working out how much mass, momentum and energy flows between
  neighbouring cells.

See [\`numerical scheme\`](/reference/solver/numerical-scheme) and
[Choosing a limiter](../guide/choosing/choosing-a-limiter.md).

#### \`time settings\`

Says what kind of run this is.

- \`type\`: \`"steady"\`: at these angles the flow stays attached to the aerofoil and does not change with time, so the
  run looks for that final state directly.

See [\`time settings\`](/reference/solver/time-settings).

#### \`convergence control\`

Sets how the solver reaches the steady solution. It starts from a guess and improves it once per cycle, or
iteration, until the flow stops changing; the run has then converged. This is the second part that differs from
Simple aerofoil.

##### \`scheme\`

- \`name\`: \`"implicit euler"\`: each step solves a linear system, which allows large steps.

##### \`cfl\`

- \`cfl\`: \`100\`, the CFL number the run ramps up to, twice Simple aerofoil's. The CFL number sets how big a step each
  cycle takes towards the answer: too large and the run becomes unstable, too small and it needs many cycles.
- \`cfl ramp\`: \`[{"type": "exponential", "factor": 1.1, "initial": 0.05}]\`: start at 0.05, lower than Simple
  aerofoil's 1, and multiply by 1.1 each cycle, so the first cycles, far from the answer, take very small steps.

##### \`cycles\`

- \`cycles\`: \`2000\`, enough for each angle in this tutorial to settle: the 10\u00b0 lift changes by less than 0.0004
  over the last 500 cycles.

See [\`convergence control\`](/reference/solver/convergence-control) and
[CFL control](../guide/choosing/choosing-a-time-marching-scheme.md#cfl-control).

#### \`output settings\`

Sets what zCFD writes, and how often. See [\`output settings\`](/reference/solver/output-settings).

##### \`report\`

The report is a table with one row per report cycle, written to \`<control file>_OUTPUT/naca0012/naca0012_report.csv\`
and plotted by zMon.

- \`frequency\`: \`10\`: a row every 10 cycles.
- \`forces\`: one block, \`FR_1\`, which sums the forces on a set of zones:

  - \`name\`: \`"wall"\`, which prefixes its report columns: \`wall_Fx\`, \`wall_Fy\` and \`wall_Fz\` for the force, in the
    axes of the mesh, with their pressure and friction parts.
  - \`zones\`: \`[4]\`, the aerofoil surface.

  Forces are reported as coefficients, against \`IC_1\` and a reference area of 1.

##### \`solution\`

The flow solution, written once at the end of the run for visualisation.

- \`surface variables\`: velocity, pressure, Mach number, \`cp\`, skin friction \`cf\`, and the pressure and friction
  forces on each face.
- \`volume variables\`: velocity, pressure, temperature, density, Mach number, \`cp\` and the eddy viscosity \`eddy\`.

### \`model\`

One entry per mesh, each with its own boundary conditions. See [\`model\`](/reference/model).

#### \`naca0012\`

The name of the only model. It names the folder under each run's output, \`<control file>_OUTPUT/naca0012/\`, and
the files in it.

##### \`mesh\`

- \`mesh\`: \`"naca0012.h5"\`: the aerofoil, with its span along y and one cell across it.

##### \`boundary conditions\`

Assigns a condition to each zone of boundary faces. See
[\`boundary conditions\`](/reference/model/boundary-conditions) and
[Choosing boundary conditions](../guide/choosing/choosing-boundary-conditions.md).

###### \`BC_1\`

The outer boundary.

- \`zones\`: \`[1]\`.
- \`type\` and \`kind\`: \`"farfield"\`, \`"riemann"\`: the outer edge of the domain, far from the aerofoil. Air passes in
  and out, and pressure waves leave without bouncing back in.
- \`condition\`: \`"IC_1"\`, the freestream.

###### \`BC_2\`

The aerofoil.

- \`zones\`: \`[4]\`.
- \`type\` and \`kind\`: \`"wall"\`, \`"no slip"\`: the flow velocity is zero at the surface.

###### \`BC_3\`

The two faces normal to y.

- \`zones\`: \`[2, 3]\`.
- \`type\`: \`"symmetry"\`: mirror planes. The aerofoil behaves as if it were infinitely long, so the flow is
  two-dimensional and the mesh needs only one cell across it.

### \`naca0012_alpha5.py\` and \`naca0012_alpha10.py\`

The polar control files load \`naca0012.py\` with \`get_parameters_from_file\` and change one key.

\`naca0012_alpha5.py\`:

\`\`\`python
import zutil
from zutil.fileutils import get_parameters_from_file

parameters = get_parameters_from_file("naca0012.py")

parameters["solver"]["reference conditions"]["IC_1"]["v"]["vector"] = (
    zutil.vector_from_angle(5.0, 0.0)
)
\`\`\`

\`naca0012_alpha10.py\`:

\`\`\`python
import zutil
from zutil.fileutils import get_parameters_from_file

parameters = get_parameters_from_file("naca0012.py")

parameters["solver"]["reference conditions"]["IC_1"]["v"]["vector"] = (
    zutil.vector_from_angle(10.0, 0.0)
)
\`\`\`

#### \`solver \u203a reference conditions \u203a IC_1 \u203a v \u203a vector\`

- \`zutil.vector_from_angle(alpha, beta)\` returns the direction of the oncoming flow, as a vector of length 1, for an
  angle of attack \`alpha\` and a sideslip angle \`beta\` (sideways), both in degrees. It turns the flow from +x towards +z, so the aerofoil, whose chord lies along x, meets the flow at 5\u00b0 or
  10\u00b0. The Mach number is unchanged, and the mesh stays where it is.

### \`naca0012_target_cl.py\`

The trim control file loads \`naca0012.py\` and gives its farfield a target.

\`\`\`python
from zutil.fileutils import get_parameters_from_file

parameters = get_parameters_from_file("naca0012.py")

parameters["model"]["naca0012"]["boundary conditions"]["BC_1"]["target"] = {
    "alpha": {"cl": 1.0778, "hold": 500}
}
parameters["solver"]["convergence control"]["cycles"] = 5000
\`\`\`

#### \`model \u203a naca0012 \u203a boundary conditions \u203a BC_1 \u203a target\`

A farfield with a \`target\` trims the aerofoil: it turns the direction of the oncoming flow, and so the angle of
attack, until the lift coefficient reaches the value you ask for.

- \`alpha\`: the setting the farfield turns, the angle of attack, and what it aims for:
  - \`cl\`: \`1.0778\`, the lift coefficient wanted. It is CFL3D's value at 10\u00b0, so the trimmed angle should come out
    close to 10\u00b0.
  - \`hold\`: \`500\`: once the settled lift is within 0.001 of the target, the farfield freezes its angle and the run
    goes on for 500 more cycles, then stops.

The run starts at the farfield's own angle, 0\u00b0, waits for the lift to settle, steps the angle towards the target,
and repeats. See [Trimming to a target](../guide/working-with/trimming-to-a-target.md), which describes the other
options, such as trimming for drag instead of lift.

#### \`solver \u203a convergence control \u203a cycles\`

- \`cycles\`: \`5000\`: the budget for the whole run, the trim steps and the hold together.

## Step 3. Run

1. Activate your environment:

\`\`\`bash
source ./<ZCFD_INSTALL_PATH>/bin/activate
\`\`\`

2. Check the control files for errors:

\`\`\`bash
cd ~/tutorial_8_aerofoil_polar_and_trim/
validate_input naca0012.py
\`\`\`

3. Run the three polar control files and the trim, one after the other:

\`\`\`bash
run_zcfd -c naca0012.py
run_zcfd -c naca0012_alpha5.py
run_zcfd -c naca0012_alpha10.py
run_zcfd -c naca0012_target_cl.py
\`\`\`

Each log reads like the one in [Simple aerofoil](./1-simple-aerofoil.md#step-3-run). The trim run also writes a
line each time it steps the angle, and a last line with the angle it found:

\`\`\`bash
grep "target BC_1" naca0012_target_cl.log
\`\`\`

In a run of this tutorial it printed:

\`\`\`text
target BC_1: trimming alpha (x\u2013z plane, forward +x, up +z) for cl 1.0778, then hold 500 cycles
target BC_1: cycle  300  alpha  0.000\u00b0 \u2192  4.000\u00b0   cl -0.0000   target 1.0778
target BC_1: cycle  700  alpha  4.000\u00b0 \u2192  8.000\u00b0   cl 0.4332 (heading for 0.4360)   target 1.0778
target BC_1: cycle 1200  alpha  8.000\u00b0 \u2192  9.671\u00b0   cl 0.8208 (heading for 0.8916)   target 1.0778
target BC_1: cycle 1600  alpha  9.671\u00b0 \u2192  9.927\u00b0   cl 1.0304 (heading for 1.0498)   target 1.0778
target BC_1: cycle 2000  alpha  9.927\u00b0 \u2192  9.974\u00b0   cl 1.0710 (heading for 1.0733)   target 1.0778
target BC_1: cycle 2300  cl 1.0776 met at alpha 9.974\u00b0 \u2014 holding 500 cycles
target BC_1: alpha trimmed to 9.974\u00b0 for cl 1.0778 (cl 1.0781 at end, cycle 2800); as the condition's vector: zutil.vector_from_angle(9.974, 0.000)
\`\`\`

Each step waits for the lift to settle, then moves the angle towards the target, with large steps at first and
smaller ones as it closes in. Once the settled lift is within 0.001 of the target, the angle is frozen for the
500-cycle hold, and the run stops well inside its 5000-cycle budget. The last line gives the inflow vector to use
for a plain run at the trimmed angle.

### Output files

Each run writes its own output, named after its control file:

| File/Directory                                        | Description                                                        |
| ----------------------------------------------------- | ------------------------------------------------------------------ |
| \`<control file>.log\`                                  | A copy of the output to screen during the run.                     |
| \`<control file>_status.yaml\`                          | A record of how the run was started; the trim run adds its result. |
| \`<control file>_OUTPUT/naca0012/naca0012_report.csv\`  | The residuals and forces every 10 cycles.                          |
| \`<control file>_OUTPUT/naca0012/naca0012.vtkhdf\`      | The volume output, for visualisation.                              |
| \`<control file>_OUTPUT/naca0012/naca0012_wall.vtkhdf\` | The surface output on the aerofoil.                                |

For example, the 10\u00b0 run writes \`naca0012_alpha10_OUTPUT/naca0012/naca0012_report.csv\`.

## Step 4. Monitor

Open each run in zMon, while it runs or after it has finished, to check it has converged:

\`\`\`bash
zmon naca0012_alpha10.py
\`\`\`

[Monitoring a run](../guide/working-with/monitoring-a-run.md) describes each panel. Check each run before you trust
its forces: the residuals, which measure how far the solution is from satisfying the equations, should have stopped
falling, and the lift should be flat over the last few hundred cycles.

The trim run's report gains two columns, \`BC_1_alpha\` and \`BC_1_cl\`, which zMon plots alongside the forces: the angle
steps up, the lift follows, and both go flat for the hold.

## Step 5. Post-process

### Python

First activate your zCFD environment, which provides Python with zutil, h5py and ParaView:

\`\`\`bash
source <ZCFD_INSTALL_PATH>/bin/activate
\`\`\`

The force report is in the axes of the mesh: x along the chord and z normal to it. Once the flow is turned, lift and
drag are the components normal to and along the freestream, so the x and z forces must be rotated through the angle
of attack $\\alpha$:

$$
C_L = C_z \\cos\\alpha - C_x \\sin\\alpha, \\qquad C_D = C_x \\cos\\alpha + C_z \\sin\\alpha
$$

This script reads the last report row of each polar run, rotates the forces, prints the polar and plots it. Save it
as \`plot_polar.py\` beside the control files:

\`\`\`python
import math

import matplotlib.pyplot as plt

from zutil.fileutils import get_zcfd_result

runs = {"naca0012.py": 0.0, "naca0012_alpha5.py": 5.0, "naca0012_alpha10.py": 10.0}

lift, drag = [], []
for control_file, alpha in runs.items():
    result = get_zcfd_result(control_file)
    final = result.report.data.iloc[-1]
    prefix = result.force_prefix()
    cx, cz = final[f"{prefix}_Fx"], final[f"{prefix}_Fz"]
    a = math.radians(alpha)
    lift.append(cz * math.cos(a) - cx * math.sin(a))
    drag.append(cx * math.cos(a) + cz * math.sin(a))
    print(f"alpha {alpha:4.1f}  cl {lift[-1]:.4f}  cd {drag[-1]:.5f}")

fig, (ax_lift, ax_polar) = plt.subplots(1, 2, figsize=(10, 4))
ax_lift.plot(list(runs.values()), lift, "o-")
ax_lift.set_xlabel("Angle of attack (degrees)")
ax_lift.set_ylabel("$C_L$")
ax_polar.plot(drag, lift, "o-")
ax_polar.set_xlabel("$C_D$")
ax_polar.set_ylabel("$C_L$")
fig.savefig("polar.png", dpi=200)
\`\`\`

and run it:

\`\`\`bash
python plot_polar.py
\`\`\`

It prints the lift and drag coefficient at each angle and writes \`polar.png\`:

![Lift against angle of attack, and the drag polar, at 0\u00b0, 5\u00b0 and 10\u00b0](/images/tutorial-8-polar.png)

NASA's CFL3D code gives a lift coefficient of 1.0778 at 10\u00b0, and drag coefficients of 0.00828 at 0\u00b0 and 0.01245 at
10\u00b0, on a finer grid of the same aerofoil. At 5\u00b0, Ladson's wind-tunnel measurements give a lift coefficient of about
0.54. On this grid zCFD's lift lies within a few hundredths of these values, and its drag within a thousandth of
CFL3D's.

Closer to stall, the angle at which the flow separates from the upper surface and the lift stops rising, the flow
is much harder to converge. Ladson's measured lift peaks near 17\u00b0, and at 15\u00b0 a steady run on
this grid needs many times more cycles than at 10\u00b0 before its forces stop changing. Above about 10\u00b0, always check in
zMon that the lift has stopped drifting before you add a point to the polar.

The trimmed angle comes out close to 10\u00b0, consistent with the polar. The status file
\`naca0012_target_cl_status.yaml\` records whether the target was met and at which angle.

### ParaView

::: {.note}
The .vtkhdf output format requires [ParaView 6.1.1](https://www.paraview.org/download/) or later.
:::

Each run's output opens in ParaView as in [Simple aerofoil](./1-simple-aerofoil.md#paraview). Colour the volume
output of the 10\u00b0 run by \`cp\` to see the suction peak move forward onto the upper surface, and the stagnation point
move round under the leading edge, as the angle rises.

:::
`;export{e as default};