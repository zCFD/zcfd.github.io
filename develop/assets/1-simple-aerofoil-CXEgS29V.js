var e=`
# Simple aerofoil

## What is in this tutorial?

This tutorial runs your first zCFD simulation: air flowing past an aerofoil, the cross-section of a wing. The
aerofoil is the NACA 0012, a symmetrical shape that has been measured in wind tunnels and simulated so often that it
is the standard first test for a flow solver, so there are good results to compare with.

You download a ready-made mesh and control file. The mesh divides the space around the aerofoil into small cells, and
zCFD works out the flow in every cell; the control file tells zCFD what to simulate. You then run zCFD, watch the
run settle to an answer, and look at the results in Python and ParaView. The run takes under two minutes on an
NVIDIA RTX 3060.

## What you need?

To run the tutorial you will need an installation of zCFD and a valid licence (the free licence is sufficient for
this tutorial). For instructions on installing zCFD please see [installation and licensing](../guide/setting-up/installation-and-licensing.md).

The tutorial assumes that you are running all commands using a bash shell on Linux.

::: {.track when="deck"}

## Step 1. Download the files

The tutorial bundle can be downloaded [here](https://zcfd.zenotech.com/v2026.08.14860/tutorial_1_aerofoil.tgz). It
contains a mesh file (\`naca0012.h5\`) and a zCFD control file (\`naca0012.py\`).

This tutorial assumes you unpack the bundle in your home directory, which creates a directory called \`tutorial_1_aerofoil\`.

\`\`\`bash
cd ~
wget https://zcfd.zenotech.com/v2026.08.14860/tutorial_1_aerofoil.tgz
tar xzf tutorial_1_aerofoil.tgz
cd tutorial_1_aerofoil
\`\`\`

## Step 2. Walk through the input

The control file, \`naca0012.py\`, is a short Python script. All it does is build one Python dictionary, called
\`parameters\`, that tells zCFD everything about the run: the physics, the numerical method, what to write out, and
the mesh with its boundaries. This step walks through that dictionary from top to bottom. Each heading below is the
name of a key, written exactly as it appears in the file, and the headings nest the same way the dictionary does:
\`numerical scheme\`, for example, sits inside \`solver\`. Under each heading you'll find what that part controls, what
each setting means, and why it has the value it has here. Each section ends with a link to that part's reference
page, which lists every setting it accepts and its default; you don't need it to follow the tutorial. On a wide
screen the whole control file sits on the right, with the part being described highlighted as you scroll.

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
            "order": "euler_second",
            "inviscid flux scheme": "roe",
        },
        "time settings": {"type": "steady"},
        "convergence control": {
            "scheme": {"name": "implicit euler"},
            "cfl": {
                "cfl": 50,
                "cfl ramp": [{"type": "exponential", "factor": 1.1, "initial": 1.0}],
            },
            "cycles": 1500,
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

\`config version\` comes first: it is always \`2\`, and tells zCFD which form of control file to expect.

### \`solver\`

\`solver\` holds every setting shared by the whole simulation: the physics, the numerics, how the run marches to
convergence, and what it writes.

#### \`solver settings\`

\`solver settings\` chooses which solver runs the simulation.

- \`type\`: \`"compressible"\` selects the density-based solver, which suits air at any speed. The alternative,
  \`"incompressible"\`, suits liquids and very slow flows.

See [\`solver settings\`](/reference/solver/solver-settings).

#### \`equations\`

\`equations\` sets which equations are solved, and so what physics the simulation includes.

- \`type\`: \`"rans"\` solves the Reynolds-averaged Navier\u2013Stokes (RANS) equations. The Navier\u2013Stokes equations
  describe how a viscous fluid moves. Most real flows near a surface are turbulent: full of small, fast, chaotic
  eddies, far too fine to capture on a mesh like this one. RANS solves for the average flow instead, and adds a
  turbulence model to represent the effect of the eddies on it.
  How turbulent a flow is depends on its Reynolds number, which compares the fluid's momentum with its viscosity.
  Here it is 6 million, and at that value the thin layer of air next to the aerofoil, the boundary layer, is
  turbulent, so RANS is the natural choice.
- \`turbulence\`: picks the turbulence model. \`"model": "sst"\` is Menter's SST model, a robust general-purpose
  choice for flow that stays attached to an aerofoil.
- \`precondition\`: \`True\` switches on low-Mach-number preconditioning. The Mach number is the flow speed divided by
  the speed of sound; here it is 0.15. At such low Mach numbers sound waves travel far faster than the flow, which
  makes the equations zCFD solves slow to converge and less accurate. Preconditioning rescales them to remove the
  problem, and is recommended below about Mach 0.3.

See [\`equations\`](/reference/solver/equations) and
[Choosing a turbulence model](../guide/choosing/choosing-a-turbulence-model.md).

#### \`fluid properties\`

\`fluid properties\` describes the fluid: here, air treated as an ideal gas.

- \`material\`: \`"air"\` names the fluid.
- \`gamma\`: 1.4, the ratio of specific heats of air.
- \`gas constant\`: 287.0 J/kg/K, the specific gas constant of air.
- \`sutherlands const\`: 110.4 K, the constant in Sutherland's law, which sets how the viscosity varies with
  temperature.
- \`prandtl no\`: 0.72, the laminar Prandtl number, which relates heat conduction to viscosity.
- \`turbulent prandtl no\`: 0.9, the same ratio for the turbulent transport the SST model adds.

These are the standard values for air. See [\`fluid properties\`](/reference/solver/fluid-properties).

#### \`reference conditions\`

\`reference conditions\` defines named flow states. Boundary conditions, the initial flow and the force
coefficients all refer to these states by name.

##### \`IC_1\`

\`IC_1\` is the freestream: the undisturbed flow far from the aerofoil.

- \`temperature\`: 300 K.
- \`pressure\`: 101325 Pa, standard atmospheric pressure.
- \`v\`: the freestream velocity. \`vector\` gives its direction, along the mesh's x axis, and \`mach\` its size,
  Mach 0.15: about 52 m/s at this temperature.
- \`viscosity\`: $1.02145 \\times 10^{-5}\\ \\mathrm{kg\\ m^{-1}\\ s^{-1}}$. With the aerofoil's 1 m chord, this
  gives a Reynolds number of 6 million, matching the experiments this case is usually compared with.
- \`turbulence intensity\`: 0.052, the size of the velocity fluctuations in the incoming flow as a fraction of its
  speed.
- \`eddy viscosity ratio\`: 1.0, the turbulent viscosity of the incoming flow relative to its laminar viscosity.

The last two set the turbulence entering the domain; these values suit a flow with little freestream turbulence.
See [\`reference conditions\`](/reference/solver/reference-conditions) and
[Choosing initialisation and reference state](../guide/choosing/choosing-initialisation-and-reference-state.md).

#### \`initialisation\`

\`initialisation\` sets the flow the run starts from.

- \`initial conditions\`: \`"IC_1"\` fills the whole domain with the freestream at the first cycle. The same state is
  also the reference for the reported force coefficients.
- \`restart\`: \`False\` starts from that initial flow. \`True\` would continue from the solution an earlier run saved,
  as [Steady-state RANS](./2-steady-state-rans.md) shows.

See [\`initialisation\`](/reference/solver/initialisation).

#### \`numerical scheme\`

\`numerical scheme\` sets how the equations are discretised in space: how the flow in each cell is turned into the
flux between neighbouring cells.

- \`order\`: \`"euler_second"\` treats the flow variables to second order and the turbulence variables to first order.
  First order assumes the flow is constant inside each cell; second order lets it vary linearly across the cell,
  which is more accurate on the same mesh. A limiter, van Albada by default, stops the second-order values
  overshooting near sharp changes.
- \`inviscid flux scheme\`: \`"roe"\` uses Roe's scheme, a standard method for working out how much mass, momentum and
  energy flows between neighbouring cells.

See [\`numerical scheme\`](/reference/solver/numerical-scheme) and
[Choosing a spatial scheme](../guide/choosing/choosing-a-spatial-scheme.md).

#### \`time settings\`

\`time settings\` says what kind of run this is in physical time.

- \`type\`: \`"steady"\` asks for a steady solution: one that does not change with time. Real flows are rarely truly
  steady, but an attached flow round a streamlined aerofoil is close enough, and a steady run is far cheaper than a
  time-accurate one.

See [\`time settings\`](/reference/solver/time-settings) and
[Choosing a time-marching scheme](../guide/choosing/choosing-a-time-marching-scheme.md#time-settings-and-convergence-control).

#### \`convergence control\`

\`convergence control\` sets how the solver reaches that steady solution. It starts from the initial flow and
improves it a little on each pass, called a cycle. When further cycles stop changing the results you care about,
the run has converged.

##### \`scheme\`

- \`name\`: \`"implicit euler"\` takes each step by solving a linear system, which allows large steps and so few
  cycles.

##### \`cfl\`

The CFL number sets how big a step each cycle takes, relative to the size of each cell and the speed of the flow
through it. Too large and the run becomes unstable and fails; too small and it needs many more cycles.

- \`cfl\`: 50, the CFL number the run works at.
- \`cfl ramp\`: how the CFL number climbs to 50. The single ramp here is \`"exponential"\`: it starts at the \`initial\`
  value of 1 and multiplies the CFL number by the \`factor\` 1.1 each cycle, reaching 50 after about 40 cycles. The
  first cycles, far from the answer, therefore take small steps.

See [CFL control](../guide/choosing/choosing-a-time-marching-scheme.md#cfl-control).

##### \`cycles\`

- \`cycles\`: 1500, the number of cycles the run takes before it stops. This case has settled well before then.

See [\`convergence control\`](/reference/solver/convergence-control).

#### \`output settings\`

\`output settings\` sets what zCFD writes during and after the run. It has two parts: the report, a small table
written as the run goes, and the solution, the full flow field written to files for viewing.

##### \`report\`

\`report\` writes one row of residuals and forces to \`naca0012_report.csv\` at a set interval, and prints the same
values in the log. A residual measures how far the current solution is from satisfying one of the equations; the
residuals fall as the run converges. zMon plots this file.

- \`frequency\`: 10, so a row every 10 cycles.
- \`forces\`: the force blocks. Each one sums the forces on a set of boundary zones and adds them to the report.
  The single block here, \`FR_1\`:

  - \`name\`: \`"wall"\`, which prefixes the columns it adds: \`wall_Fx\`, \`wall_Fy\` and \`wall_Fz\` for the total force,
    \`wall_Fpx\`\u2026 for its pressure part and \`wall_Ffx\`\u2026 for its friction part, and \`wall_Mx\`\u2026 for the moments about
    the origin.
  - \`zones\`: \`[4]\`, the aerofoil surface.

  Forces are reported as coefficients, divided by the dynamic pressure of \`IC_1\` and a reference area that
  defaults to 1. With the mesh's 1 m chord and unit span, \`wall_Fx\` is the drag coefficient here.

See [\`report\`](/reference/solver/output-settings#report).

##### \`solution\`

\`solution\` lists the variables written to the flow-field files, for viewing in ParaView.

- \`surface variables\`: written on the boundaries, one file per boundary type: \`naca0012_wall.vtkhdf\`,
  \`naca0012_farfield.vtkhdf\` and \`naca0012_symmetry.vtkhdf\`. Here the velocity \`V\`, pressure \`p\`, Mach number,
  pressure and skin-friction coefficients \`cp\` and \`cf\`, and the pressure and friction forces on each face.
- \`volume variables\`: written in every cell, to \`naca0012.vtkhdf\`. Here the velocity, pressure, temperature \`T\`,
  density \`rho\`, Mach number, \`cp\`, and the eddy viscosity \`eddy\`.

The control file sets no \`frequency\` for the solution, so the files are written once, at the end of the run, along
with the checkpoint \`naca0012_results.h5\` used for restarts. The report frequency and the solution frequency are
separate: the report is cheap and written often, the flow-field files are large and usually written rarely.
See [\`solution\`](/reference/solver/output-settings#solution) and
[Output variables](../guide/working-with/post-processing-and-visualisation.md#output-variables).

### \`model\`

\`model\` holds one entry per mesh. Each entry is a model: a mesh with its own boundary conditions.

#### \`naca0012\`

The key, \`naca0012\`, names the model. It also names the model's output folder and files:
\`naca0012_OUTPUT/naca0012/\`, with \`naca0012_report.csv\`, \`naca0012.vtkhdf\` and the rest inside. The folder
above, \`naca0012_OUTPUT\`, takes its name from the control file.

##### \`mesh\`

- \`mesh\`: \`"naca0012.h5"\`, the mesh file, in zCFD's own HDF5 format, read from the directory zCFD runs in. Meshes
  from other tools are converted to this format first; see [Preparing a mesh](../guide/setting-up/preparing-a-mesh.md).

##### \`boundary conditions\`

\`boundary conditions\` assigns a condition to each group of boundary faces. The groups are the mesh's zones,
numbered when the mesh was made; each condition lists its zones by number in \`zones\`. A mesh converted with zCFD's
tools comes with a zone helper file that maps the zone names from the meshing tool to these numbers; see
[Zone identifiers](../guide/setting-up/preparing-a-mesh.md#zone-identifiers). This mesh has four zones: the outer
boundary, the two side faces, and the aerofoil.

The keys \`BC_1\`, \`BC_2\` and \`BC_3\` are names; any name will do.

###### \`BC_1\`

The outer boundary of the domain.

- \`zones\`: \`[1]\`.
- \`type\`: \`"farfield"\`, a boundary far enough from the aerofoil to see the undisturbed flow.
- \`condition\`: \`"IC_1"\`, the flow state it imposes.
- \`kind\`: \`"riemann"\` lets flow pass both in and out without reflecting waves back into the domain.

###### \`BC_2\`

The aerofoil surface.

- \`zones\`: \`[4]\`.
- \`type\`: \`"wall"\`.
- \`kind\`: \`"no slip"\`: the flow velocity is zero at the surface, as for any viscous flow. Note the space in the
  name.

###### \`BC_3\`

The two side faces of the mesh, normal to y.

- \`zones\`: \`[2, 3]\`.
- \`type\`: \`"symmetry"\`: no flow passes through these faces, and the flow on each side mirrors the other. This makes
  the aerofoil behave as if it had an infinite span, so the mesh needs only one cell across it.

See [Choosing boundary conditions](../guide/choosing/choosing-boundary-conditions.md).

## Step 3. Run

1. Activate your zCFD environment, which puts zCFD's commands, and the Python it uses, on your path:

\`\`\`bash
source <ZCFD_INSTALL_PATH>/bin/activate
\`\`\`

2. Check the control file for errors with \`validate_input\`:

\`\`\`bash
cd ~/tutorial_1_aerofoil/
validate_input naca0012.py
\`\`\`

3. Run zCFD in the case directory:

\`\`\`bash
run_zcfd -c naca0012.py
\`\`\`

zCFD will attempt to detect the number of CPU cores and any GPUs present and make use of them. If you want to
manually configure this see [invocation and flags](/reference/command-line/invocation-and-flags).

zCFD writes its progress to the screen and to the log file \`naca0012.log\`. These are extracts from a run of this
tutorial, with \`...\` marking lines left out:

\`\`\`text
Parameters validated successfully
...
 Reading file naca0012.h5
 Global Mesh Stats: Cells: 57344 Faces: 229856
...
 Dimensional Conditions
 ----------------------
  Pressure:     101325 Pa
  Temperature:  300 K
  Density:      1.17683 kg/m^3
  Viscosity:    1.02145e-05 Ns/m^2 @ 300 K
  Speed:        52.0783 m/s
...
  Mach:         0.15
  Reynolds No:  6.00003e+06 @ 300 K
...
Starting solve loop
...
Cycle     10 | Step    0 t=0s | CFL   2.358 | MG 1 |    17.8 ms | Total     0.271s
+------------------------------------------------------------------------------------------+
| Report: Cycle 10  Wall time: 0.271s                                                      |
...
| Residuals:                                                                               |
|   rho       1.4099E+01  rhoV[0]   1.5372E+02  rhoV[1]   1.0380E-10  rhoV[2]   6.7992E+01 |
|   rhoE      4.3532E+01  rhok      1.2966E-05  rhoOmega  2.7047E+08                       |
+------------------------------------------------------------------------------------------+
...
 Solve Complete: 1500 cycles in 41.162s (avg 27.4 ms/cycle)
...
zCFD finished: all requested cycles are complete (1500 in total).
\`\`\`

- First the control file is checked, and the mesh read: 57,344 cells.
- The reference conditions are printed in dimensional form. Check them against what you meant to set up; here
  the speed is 52 m/s and the Reynolds number 6 million.
- Each cycle then prints one line: the cycle number, the current CFL number (still ramping up at cycle 10), and the
  time the cycle took. Every 10 cycles, the report frequency, a box gives the residual of each equation.
- Between the cycle lines, the linear solver prints a short summary of each implicit solve.
- The run ends with a timing summary and a line saying why it stopped.

To stop a run early, see [Stopping a run](../guide/working-with/monitoring-a-run.md#stopping-a-run).

The run takes under two minutes on an NVIDIA RTX 3060, and longer on a CPU.

### Output files

A successful zCFD run creates the following files and directories. They are named after the control file,
\`naca0012.py\`, and each model's output is named after its key under \`model\`, which in this deck is also
\`naca0012\`.

| File/Directory                                      | Description                                                                                                                                             |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| \`naca0012.log\`                                      | A copy of the output to screen during the run.                                                                                                          |
| \`naca0012_status.yaml\`                              | A YAML file recording how the run was started: the zCFD version, the date, the control file, the mesh and its checksum, and the nodes and devices used. |
| \`naca0012_OUTPUT/naca0012/naca0012_report.csv\`      | A .csv format table which shows the variation of flow statistics with cycle number.                                                                     |
| \`naca0012_OUTPUT/naca0012/naca0012_results.h5\`      | The checkpoint: the flow solution in zCFD format, used to restart the run.                                                                              |
| \`naca0012_OUTPUT/naca0012/naca0012.vtkhdf\`          | A VTK HDF file containing the volume data from the simulation, for visualisation.                                                                       |
| \`naca0012_OUTPUT/naca0012/naca0012_wall.vtkhdf\` etc | One VTK HDF file for each boundary condition type, containing the surface data for that boundary condition.                                             |
| \`naca0012_OUTPUT/LOGGING/\`                          | A separate log for each MPI rank, used for debugging.                                                                                                   |

The status file is described in [The status file](../guide/setting-up/running-zcfd.md#the-status-file).

## Step 4. Monitor

zMon shows the residuals and forces of a run as it goes, and of a finished run. Open it on the control file:

\`\`\`bash
source <ZCFD_INSTALL_PATH>/bin/activate
cd ~/tutorial_1_aerofoil/
zmon naca0012.py
\`\`\`

A browser opens on the zMon dashboard; [Monitoring a run](../guide/working-with/monitoring-a-run.md) describes each
panel. The plots below are the residual and force panels as zMon draws them; [Step 5](#step-5-post-process) shows how to
plot the same data yourself.

### Residuals

The residual of each equation measures how far the current solution is from satisfying it: the lower the
residual, the more converged the solution. There is one for each equation: density \`rho\`, momentum in each
direction, energy \`rhoE\`, and the two turbulence variables \`rhok\` and \`rhoOmega\`. The report, the log and the
script write the momentum residuals \`rhoV[0]\`, \`rhoV[1]\` and \`rhoV[2]\`, for x, y and z; zMon names them \`rhoU\`,
\`rhoV\` and \`rhoW\`.

![Residuals of the NACA0012 run against cycle](/images/tutorial-1-plot-1.png)

The residuals fall fastest in the first few hundred cycles, as the flow develops from the uniform initial state.
The density residual falls about four orders of magnitude before levelling off. \`rhoV[1]\`, the momentum across the
span, stays near round-off throughout, because the flow has no velocity across the span. The turbulence residuals behave differently: \`rhok\`
rises as the boundary layer forms, and \`rhoOmega\` falls from a large initial value. By 1200 cycles every residual is
flat, which, with the forces below, shows the solution has converged.

### Forces

The force panels show the x and z forces on the wall. The aerofoil is symmetrical and meets the flow at zero angle
of attack, so the x force is the drag and the z force the lift. The lift should be zero and the drag positive.

![Force on the aerofoil in x and z against cycle](/images/tutorial-1-plot-2.png)

The drag falls quickly from its initial value and settles after a few damped oscillations; the lift oscillates
about zero at around $10^{-5}$ before dying away. Both traces are flat from 1200 cycles onwards. The drag
coefficient settles at 0.0082, against 0.00828 from NASA's CFL3D code on a finer grid of the same family
(897 \u00d7 257 points).

## Step 5. Post-process

First activate your zCFD environment, which provides Python with zutil, h5py and ParaView:

\`\`\`bash
source <ZCFD_INSTALL_PATH>/bin/activate
\`\`\`

### Python

This script draws the residual and force plots shown in [Step 4](#step-4-monitor). \`get_zcfd_result\` finds the
run's output from the control file, and \`report.data\` is the report as a table, one column per quantity. Save the
script as \`plot_convergence.py\` in the case directory:

\`\`\`python
import matplotlib.pyplot as plt

from zutil.fileutils import get_zcfd_result

report = get_zcfd_result("naca0012.py").report.data

fig, ax = plt.subplots()
for column in ["rho", "rhoV[0]", "rhoV[1]", "rhoV[2]", "rhoE", "rhok", "rhoOmega"]:
    ax.semilogy(report["Cycle"], report[column], label=column)
ax.set_xlabel("Cycle")
ax.set_ylabel("Residual")
ax.legend()
fig.savefig("residuals.png", dpi=200)

fig, (drag, lift) = plt.subplots(1, 2, figsize=(10, 4))
drag.plot(report["Cycle"], report["wall_Fx"])
drag.set_title("Drag coefficient (wall_Fx)")
lift.plot(report["Cycle"], report["wall_Fz"])
lift.set_title("Lift coefficient (wall_Fz)")
for ax in (drag, lift):
    ax.set_xlabel("Cycle")
fig.savefig("forces.png", dpi=200)
\`\`\`

Run it:

\`\`\`bash
python plot_convergence.py
\`\`\`

It writes \`residuals.png\` and \`forces.png\`.
[Batch post-processing with Python scripts](../guide/working-with/post-processing-and-visualisation.md#batch-post-processing-with-python-scripts)
lists what \`get_zcfd_result\` provides.

### ParaView

ParaView is a free, general-purpose tool for viewing simulation results, and the recommended way to look at zCFD's
flow fields. See [ParaView.org](https://www.paraview.org) to download and install it.

::: {.note}
The .vtkhdf output format requires [ParaView 6.1.1](https://www.paraview.org/download/) or later.
:::

#### Loading your data

The run wrote the flow in every cell to a single file, \`naca0012_OUTPUT/naca0012/naca0012.vtkhdf\`.

After opening ParaView, click the "Open" icon shown below or go into File>Open or press Ctrl+O. Locate
the directory in which you have stored your data and open \`naca0012.vtkhdf\`.

![The Open icon on ParaView's main toolbar](/images/tutorial-1-figure-1.png)

Once the file is open, the Pipeline Browser on the left lists it, and the Properties panel below lists the variables
the file holds under Array Selection:

![The Pipeline Browser and the Properties panel after opening the file, before Apply](/images/tutorial-1-figure-2.png)

Click Apply to read them in, which leads to the following layout:

![ParaView after loading \`naca0012.vtkhdf\`](/images/tutorial-1-figure-3.png)

To look at the aerofoil side-on, set the view direction to +Y with this button:

![The +Y view direction button](/images/tutorial-1-figure-17.png)

#### Visualising variables

ParaView colours the mesh by one of the output variables. You can choose which in two places, and both do the same
thing: the drop-down on the toolbar,

![The colouring drop-down on the toolbar](/images/tutorial-1-figure-4.png)

or the Coloring section of the Properties panel:

![The Coloring drop-down in the Properties panel](/images/tutorial-1-figure-4b.png)

The Properties panel holds every setting for whichever object is selected in the Pipeline Browser, so as you get
used to ParaView you will find yourself working there more and more.

Select "cp" to colour the mesh by the pressure coefficient. It compares the local pressure with the freestream
pressure, scaled by the dynamic pressure of the oncoming flow: it is negative where the flow speeds up and the
pressure drops, as it does over the front of the aerofoil, and reaches 1 where the flow comes to rest at the nose.

::: {.note}
The pressure coefficient is given by the following formula
$C_p = \\frac{p-p_{\\infty }}{\\frac{1}{2}\\rho _{\\infty }V_{\\infty }^2}$
:::

The aerofoil is small compared with the mesh, so zoom in on the centre to see it:

![Pressure coefficient around the aerofoil, in ParaView's default colour map](/images/tutorial-1-figure-5.png)

To change the colour map, open the Color Map Editor, again from either place: the Edit Color Map icon on the
toolbar, the colour bar marked "e",

![The Edit Color Map icon on the toolbar](/images/tutorial-1-figure-6a.png)

or Edit in the Coloring section of the Properties panel:

![Edit in the Coloring section of the Properties panel](/images/tutorial-1-figure-6b.png)

In the Color Map Editor, click Choose Preset:

![Choose Preset in the Color Map Editor](/images/tutorial-1-figure-6.png)

Here are the same results shown with two other presets, Viridis and Cool to Warm (Extended):

![The same view in Viridis](/images/tutorial-1-figure-7.png)

![The same view in Cool to Warm (Extended)](/images/tutorial-1-figure-8.png)

A picture shows where the pressure is high or low. To compare with experiments you usually want numbers: most
often, the pressure coefficient along the chord, the straight line from the front of the aerofoil to its back.

#### Pressure coefficient plot

Open \`naca0012_wall.vtkhdf\`. It holds only the boundaries with a \`wall\` condition, which here is the aerofoil
surface.

![Wall.vtkhdf](/images/tutorial-1-figure-9.png)

The upper and lower surfaces are usually plotted as separate lines, so first separate them with a "Clip" filter.Right-click on the \`naca0012_wall.vtkhdf\` object in the
Pipeline Browser, select Add Filter -> Alphabetical -> Clip. The properties of the "Clip" filter are displayed on
the left. Firstly, untick the "Invert" option and then you should set them to the following combination:

![Clip parameters](/images/tutorial-1-figure-10.png)

This removes the lower surface, leaving the upper one:

![Aerofoil upper surface](/images/tutorial-1-figure-11.png)

::: {.note}
To remove the upper surface instead, tick the "Invert" option in the "Clip" filter's properties.
:::

Next, take a "Slice" of the remaining surface. To do so, follow the same procedure as for the "Clip"
filter but select the "Slice" filter instead. When prompted, set the properties of the filter to be as follows:

![Slice parameters](/images/tutorial-1-figure-12.png)

You should end up with this:

![Upper aerofoil slice](/images/tutorial-1-figure-13.png)

zCFD writes one value per cell face ("cell data"). Line plots need values at points, so convert them with the
"CellDatatoPointData" filter: right-click on the "Slice" object and choose it under "Add Filter".

Once this is done, a plot can be produced in ParaView using the "PlotOnSortedLines" filter. Right-click on the
"CellDatatoPointData1" object created previously and add the "PlotOnSortedLines" filter. A plot should appear on
the right. You can select the variables to plot in the "Properties -> Series Parameters" window, as well as
changing the settings of the axis.
Select the "cp" variable in "Series Parameters', and use \`Points_X\` as the 'X Array Name'. Untick 'Show Legend',
set 'Left Axis Title' to '$C_p$' and set the 'Bottom Axis Title' to 'x'. You can also use the "Left Axis Use
Custom Range" option to change the y-axis range:

![Left axis parameters](/images/tutorial-1-figure-14.png)

Setting the maximum as a negative number inverts the y-axis and the negative numbers will be
shown "at the top".

![Cp vs Chord](/images/tutorial-1-figure-15.png)

The data can be exported as a .csv file, which can then be manipulated in Python, Excel, MATLAB or any other
software. To do so, go to File -> Save data -> _select a folder and give a name to the file_. The following
window should appear:

![CSV Writer tool](/images/tutorial-1-figure-16.png)

By default, ParaView writes all the variables into the .csv file. However, if only a few of them are of interest,
you can use the "Choose Arrays To Write" option.

Repeat these steps for the lower surface, with "Invert" ticked in the clip, to plot both surfaces for comparison
with experiment.

:::
`;export{e as default};