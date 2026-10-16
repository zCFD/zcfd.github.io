var e=`
# Incompressible flow

## What is in this tutorial?

This tutorial solves the flow in a lid-driven cavity: a closed square box of fluid whose top wall, the lid, slides
sideways at a constant speed. The moving lid drags the fluid beneath it round into one large swirl, or vortex, with
two small vortices turning the other way in the bottom corners. The case is one of the most widely used checks of a
CFD code, because accurate published results exist for it: here, the velocities that Ghia, Ghia and Shin (1982)
tabulate along the two lines through the middle of the box, the centrelines.

The flow is set by its Reynolds number, the ratio of the fluid's inertia to its viscosity: low values give slow,
smooth, syrupy flow, high values fast, turbulent flow. At the Reynolds number used here, 400, the flow settles to a
steady pattern that stays the same over time.

The tutorial uses zCFD's incompressible solver. An incompressible solver assumes the density of the fluid never
changes, and solves only for its velocity and pressure. That holds for liquids such as water, and for gases moving
well below the speed of sound: as a rule of thumb, below Mach 0.3, where the Mach number is the flow speed divided by
the speed of sound. The compressible solver, used in [Simple aerofoil](./1-simple-aerofoil.md), lets the density
change. Use it instead where a flow is mostly slow but the density changes somewhere, through heating or a fast
region.

## What you need?

Work through [Simple aerofoil](./1-simple-aerofoil.md) first: this tutorial relies on it for running zCFD, reading
the log and monitoring a run in zMon. The run takes about fifteen seconds on an NVIDIA RTX 3060.

::: {.track when="deck"}

## Step 1. Download the files

The tutorial bundle can be downloaded [here](https://zcfd.zenotech.com/v2026.08.14860/tutorial_6_lid_driven_cavity.tgz).
It contains a mesh file (\`cavity.h5\`), a zCFD control file (\`cavity.py\`), and Ghia's tabulated centreline velocities
at Re 400 (\`ghia_re400.csv\`).

\`\`\`bash
cd ~
wget https://zcfd.zenotech.com/v2026.08.14860/tutorial_6_lid_driven_cavity.tgz
tar xzf tutorial_6_lid_driven_cavity.tgz
cd tutorial_6_lid_driven_cavity
\`\`\`

The cavity is 1 m square. The mesh has 127 \u00d7 127 cells, clustered towards the walls where the velocity changes
fastest, and is one cell thick: the flow is two-dimensional, with symmetry conditions on the front and back faces.

## Step 2. Walk through the input

The control file, \`cavity.py\`, is a short Python script. All it does is build one Python dictionary, called
\`parameters\`, that tells zCFD everything about the run: the physics, the numerical method, what to write out, and the
mesh with its boundaries. This step walks through that dictionary from top to bottom. Each heading below is the name of
a key, written exactly as it appears in the file, and the headings nest the same way the dictionary does:
\`numerical scheme\`, for example, sits inside \`solver\`. Under each heading you'll find what that part controls, what
each setting means, and why it has the value it has here. Each section ends with a link to that part's reference page,
which lists every setting it accepts and its default; you don't need it to follow the tutorial. On a wide screen the
whole control file sits on the right, with the part being described highlighted as you scroll.

\`\`\`python
parameters = {
    "config version": 2,
    "solver": {
        "solver settings": {"type": "incompressible"},
        "equations": {"type": "viscous"},
        "fluid properties": {
            "material": "ideal gas",
            "gamma": 1.4,
            "gas constant": 287.0,
            "sutherlands const": 110.4,
            "prandtl no": 0.72,
            "turbulent prandtl no": 0.9,
        },
        "reference conditions": {
            "IC_1": {
                "temperature": 273.15,
                "pressure": 101325.0,
                "v": {"vector": [1.0, 0.0, 0.0]},
                "reynolds no": 400.0,
                "reference length": 1.0,
            },
            "IC_2": {
                "temperature": 273.15,
                "pressure": 101325.0,
                "v": {"vector": [0.0, 0.0, 0.0]},
                "reynolds no": 400.0,
            },
        },
        "initialisation": {"reference": "IC_1", "initial conditions": "IC_2"},
        "numerical scheme": {"order": "second"},
        "time settings": {"type": "steady"},
        "convergence control": {
            "scheme": {"name": "coupled", "implicit relax": 0.9},
            "cycles": 500,
        },
        "output settings": {
            "report": {"frequency": 1},
            "solution": {
                "format": "vtk",
                "surface variables": ["V", "p"],
                "volume variables": ["V", "p", "cell_centre"],
            },
        },
    },
    "model": {
        "cavity": {
            "mesh": "cavity.h5",
            "boundary conditions": {
                "BC_1": {
                    "zones": [14],
                    "type": "wall",
                    "kind": "no slip",
                    "velocity": {"type": "linear", "vector": [1.0, 0.0, 0.0]},
                },
                "BC_2": {
                    "zones": [12],
                    "type": "wall",
                    "kind": "no slip",
                },
                "BC_3": {
                    "zones": [11, 13],
                    "type": "symmetry",
                },
            },
        }
    },
}
\`\`\`

### \`config version\`

Says which layout of control file this is, so zCFD knows how to read the rest.

- \`config version\`: \`2\`, the current layout, with \`solver\` and \`model\` at the top level.

### \`solver\`

The settings shared by the whole simulation: which solver runs, what it solves, the fluid, the flow states, and how
the run marches and what it writes.

#### \`solver settings\`

Chooses the solver.

- \`type\`: \`"incompressible"\`: the solver that holds the density constant and solves for velocity and pressure. The
  lid moves at 1 m/s, far below the speed of sound, so the density does not change.

See [\`solver settings\`](/reference/solver/solver-settings).

#### \`equations\`

Sets the equations being solved.

- \`type\`: \`"viscous"\`: the Navier\u2013Stokes equations, which describe a fluid with viscosity, solved without a
  turbulence model. At a Reynolds number of 400 the flow is laminar: it moves in smooth layers, with none of the
  chaotic eddies of turbulence.

See [\`equations\`](/reference/solver/equations), and
[Choosing a turbulence model](../guide/choosing/choosing-a-turbulence-model.md) for flows that are turbulent.

#### \`fluid properties\`

Describes the fluid.

- \`material\`: \`"ideal gas"\`: pressure, density and temperature are related by the ideal gas law.
- \`gamma\`: \`1.4\`, the ratio of specific heats, a property of the gas.
- \`gas constant\`: \`287.0\` J/kg/K. With the reference pressure and temperature it gives the density, 1.29 kg/m\u00b3,
  which the solver then holds constant.
- \`sutherlands const\`: \`110.4\` K, for Sutherland's law, which varies the viscosity with temperature. The
  temperature does not change in this run, and the viscosity is set by the Reynolds number instead.
- \`prandtl no\` and \`turbulent prandtl no\`: \`0.72\` and \`0.9\`, which relate heat conduction to viscosity. This run
  solves no energy equation, so they play no part.

See [\`fluid properties\`](/reference/solver/fluid-properties).

#### \`reference conditions\`

Defines named flow states, each a set of values such as temperature, pressure and velocity. Other parts of the
file refer to them by name: to fill the domain at the start, to set conditions at boundaries, and to scale the
equations.

##### \`IC_1\`

The reference state, moving at the lid's speed.

- \`temperature\` and \`pressure\`: \`273.15\` K and \`101325.0\` Pa, which with the gas constant fix the density.
- \`v\`: \`{"vector": [1.0, 0.0, 0.0]}\`, 1 m/s along x, the lid speed.
- \`reynolds no\`: \`400.0\`, the Reynolds number of the flow, based on the reference length.
- \`reference length\`: \`1.0\` m, the side of the cavity. With the speed and density, Re 400 sets the viscosity to
  0.00323 Ns/m\u00b2.

##### \`IC_2\`

The fluid at rest.

- \`temperature\` and \`pressure\`: as \`IC_1\`.
- \`v\`: \`{"vector": [0.0, 0.0, 0.0]}\`, still fluid.
- \`reynolds no\`: \`400.0\`, as \`IC_1\`.

See [\`reference conditions\`](/reference/solver/reference-conditions) and
[Viscosity](../guide/choosing/choosing-initialisation-and-reference-state.md#viscosity).

#### \`initialisation\`

Chooses which states start the run and scale it.

- \`reference\`: \`"IC_1"\`. The solver scales its equations by this state, so the lid speed sets the scale.
- \`initial conditions\`: \`"IC_2"\`. The fluid starts at rest, and the moving lid sets it in motion.

See [\`initialisation\`](/reference/solver/initialisation) and
[Choosing initialisation and reference state](../guide/choosing/choosing-initialisation-and-reference-state.md).

#### \`numerical scheme\`

Sets how the equations are discretised in space: how the smooth flow is represented by one value in each cell of
the mesh.

- \`order\`: \`"second"\`: the solver estimates how the velocity varies across each cell, not just its average, which is
  more accurate than treating it as constant (first order).

See [\`numerical scheme\`](/reference/solver/numerical-scheme) and
[Choosing a spatial scheme](../guide/choosing/choosing-a-spatial-scheme.md).

#### \`time settings\`

Says what kind of run this is.

- \`type\`: \`"steady"\`: at Re 400 the cavity flow settles to a pattern that does not change with time, so the run
  looks for that final state directly, rather than following the flow through time.

See [\`time settings\`](/reference/solver/time-settings).

#### \`convergence control\`

Sets how the solver reaches the steady solution. It starts from a guess and improves it once per cycle, or
iteration, until the flow stops changing; the run has then converged. The incompressible solver needs no CFL number,
the step-size setting the compressible tutorials use.

##### \`scheme\`

In an incompressible flow the pressure is whatever it must be to keep the flow from piling up or emptying out
anywhere, so velocity and pressure have to be found together. The scheme says how.

- \`name\`: \`"coupled"\`: each cycle solves for velocity and pressure together, as one large set of linear equations.
  It is the scheme to start from. \`"simple"\` instead solves for them one after the other and corrects the pressure in
  between.
- \`implicit relax\`: \`0.9\`: each cycle applies 90 % of the change it computes, which keeps the iterations stable.

The linear solvers, the routines that solve those sets of equations each cycle, keep their defaults, which are tuned
for the incompressible equations; [Incompressible solver](../guide/choosing/choosing-a-linear-solver.md#incompressible-solver)
lists them.

##### \`cycles\`

- \`cycles\`: \`500\`: the run stops after 500 cycles. [Step 4](#step-4-monitor) shows the residuals, the measure of
  how far the solution is from satisfying the equations, have fallen by more than six orders of magnitude, a factor of
  a million, by then.

See [\`convergence control\`](/reference/solver/convergence-control) and
[Incompressible convergence control](../guide/choosing/choosing-a-time-marching-scheme.md#incompressible-convergence-control).

#### \`output settings\`

Sets what zCFD writes, and how often. See [\`output settings\`](/reference/solver/output-settings).

##### \`report\`

The report is a table with one row per report cycle, written to \`cavity_OUTPUT/cavity/cavity_report.csv\` and
plotted by zMon.

- \`frequency\`: \`1\`: a row every cycle. The file asks for no forces, so each row holds only the residuals: one for
  each component of momentum, \`rhoV[0]\`, \`rhoV[1]\` and \`rhoV[2]\`, and one for pressure, \`p\`.

##### \`solution\`

The flow solution, written for visualisation and post-processing.

- \`format\`: \`"vtk"\`: VTK HDF files, \`.vtkhdf\`, which ParaView opens.
- \`surface variables\`: \`V\` and \`p\`, written to one file for each type of boundary condition.
- \`volume variables\`: \`V\`, \`p\` and \`cell_centre\`, the coordinates of each cell centre, which [Step 5](#python) uses
  to pick out the cells along the centrelines.

No \`frequency\` is given, so the solution is written once, at the end of the run.
[Output variables](../guide/working-with/post-processing-and-visualisation.md#output-variables) lists the others.

### \`model\`

One entry per mesh, each with its own boundary conditions. See [\`model\`](/reference/model).

#### \`cavity\`

The name of the only model. It names the output folder, \`cavity_OUTPUT/cavity/\`, and the files in it.

##### \`mesh\`

- \`mesh\`: \`"cavity.h5"\`, the mesh file in zCFD's format, read from the case directory. Its boundary faces are
  grouped into numbered zones, which the boundary conditions refer to.

##### \`boundary conditions\`

Assigns a condition to each zone of boundary faces. See
[\`boundary conditions\`](/reference/model/boundary-conditions) and
[Choosing boundary conditions](../guide/choosing/choosing-boundary-conditions.md).

###### \`BC_1\`

The lid.

- \`zones\`: \`[14]\`, the top face of the cavity.
- \`type\` and \`kind\`: \`"wall"\`, \`"no slip"\`: the fluid at the wall moves with the wall.
- \`velocity\`: \`{"type": "linear", "vector": [1.0, 0.0, 0.0]}\`: a translating wall, sliding at 1 m/s along x. A
  \`"rotating"\` velocity would spin it about an axis instead.

###### \`BC_2\`

The other three walls.

- \`zones\`: \`[12]\`, the bottom and the two sides.
- \`type\` and \`kind\`: \`"wall"\`, \`"no slip"\`, with no velocity: the walls are still.

###### \`BC_3\`

The front and back faces.

- \`zones\`: \`[11, 13]\`.
- \`type\`: \`"symmetry"\`: a mirror plane. No flow passes through it, so the flow stays two-dimensional across the
  single cell of depth.

The cavity is closed, so this file has no inflow or outflow. For a flow through a domain, the incompressible solver
needs an inflow and an outflow boundary rather than the farfield used by the compressible tutorials.

## Step 3. Run

1. Activate your environment:

\`\`\`bash
source ./<ZCFD_INSTALL_PATH>/bin/activate
\`\`\`

2. Check the control file for errors:

\`\`\`bash
cd ~/tutorial_6_lid_driven_cavity/
validate_input cavity.py
\`\`\`

3. Run zCFD in the case directory:

\`\`\`bash
run_zcfd -c cavity.py
\`\`\`

These are extracts from the log of a run of this tutorial, with \`...\` marking lines left out:

\`\`\`text
Parameters validated successfully
...
 Reading file cavity.h5
 Global Mesh Stats: Cells: 16129 Faces: 64770
...
 Dimensional Conditions
 ----------------------
  Pressure:     101325 Pa
  Temperature:  273.15 K
  Density:      1.29251 kg/m^3
  Viscosity:    0.00323127 Ns/m^2 @ 273.15 K
  Speed:        1 m/s
...
  Reynolds No:  400 @ 273.15 K
...
Starting solve loop
...
Cycle     10 | Step    0 t=0s | CFL   1.000 | MG 1 |    16.6 ms | Total     0.212s
+--------------------------------------------------------------------------------------+
| Report: Cycle 10  Wall time: 0.212s                                                  |
...
| Residuals:                                                                           |
|   rhoV[0]  1.3464E-07  rhoV[1]  1.6890E-07  rhoV[2]  0.0000E+00  p        1.8761E-08 |
+--------------------------------------------------------------------------------------+
...
 Solve Complete: 500 cycles in 9.573s (avg 19.1 ms/cycle)
...
zCFD finished: all requested cycles are complete (500 in total).
\`\`\`

- The mesh has 16,129 cells, 127 \u00d7 127 across one cell of depth.
- The dimensional conditions show the viscosity the Reynolds number set, 0.00323 Ns/m\u00b2, for a lid speed of 1 m/s.
- The report box lists three momentum residuals and the pressure residual. \`rhoV[2]\`, across the depth, is exactly
  zero, because the flow has no velocity across the symmetry planes.
- The run takes about fifteen seconds on an NVIDIA RTX 3060.

### Output files

| File/Directory                                | Description                                                                   |
| --------------------------------------------- | ----------------------------------------------------------------------------- |
| \`cavity.log\`                                  | A copy of the output to screen during the run.                                |
| \`cavity_status.yaml\`                          | A record of how the run was started: version, control file, mesh and devices. |
| \`cavity_OUTPUT/cavity/cavity_report.csv\`      | The residuals at every cycle.                                                 |
| \`cavity_OUTPUT/cavity/cavity_results.h5\`      | The checkpoint: the flow solution in zCFD format, used to restart the run.    |
| \`cavity_OUTPUT/cavity/cavity.vtkhdf\`          | The volume output, for visualisation and post-processing.                     |
| \`cavity_OUTPUT/cavity/cavity_wall.vtkhdf\`     | The surface output on the four walls.                                         |
| \`cavity_OUTPUT/cavity/cavity_symmetry.vtkhdf\` | The surface output on the front and back symmetry planes.                     |

## Step 4. Monitor

Open the run in zMon to watch the residuals, while it runs or after it has finished:

\`\`\`bash
zmon cavity.py
\`\`\`

[Monitoring a run](../guide/working-with/monitoring-a-run.md) describes each panel. The plot below is the residual
panel as zMon draws it.

### Residuals

A residual measures how far the current solution is from satisfying one of the equations; as the run converges, the
residuals fall. The report holds the momentum residuals, named \`rhoU\`, \`rhoV\` and \`rhoW\` in zMon, and \`p\`, the
pressure residual, which measures how well the flow conserves mass. \`rhoW\` is zero throughout, so it does not appear
on the logarithmic scale.

![Residuals of the cavity run against cycle](/images/tutorial-6-plot-residuals.png)

The residuals fall steeply in the first few cycles, as the lid sets the fluid moving, then in steps as the vortex
develops, and steadily from about cycle 350. All three fall by more than six orders of magnitude over the 500 cycles,
and the solution is converged.

## Step 5. Post-process

### Python

First activate your zCFD environment, which provides Python with zutil, h5py and ParaView:

\`\`\`bash
source <ZCFD_INSTALL_PATH>/bin/activate
\`\`\`

Ghia, Ghia and Shin tabulate two profiles: the x velocity u along the vertical centreline, x = 0.5, and the y
velocity v along the horizontal centreline, y = 0.5. The mesh has an odd number of cells across, so a column of cell
centres lies exactly on each centreline, and the profiles can be read straight from the cells. This script reads the
volume output, picks out those cells, and plots them against Ghia's values. Save it as \`compare_with_ghia.py\` beside
the control file:

\`\`\`python
import h5py
import matplotlib.pyplot as plt
import numpy as np

with h5py.File("cavity_OUTPUT/cavity/cavity.vtkhdf", "r") as f:
    centre = f["VTKHDF/CellData/cell_centre"][:]
    velocity = f["VTKHDF/CellData/V"][:]

# The cells on the vertical centreline (x = 0.5), bottom to top,
# and on the horizontal centreline (y = 0.5), left to right
column = np.flatnonzero(np.isclose(centre[:, 0], 0.5, atol=1e-5))
column = column[np.argsort(centre[column, 1])]
row = np.flatnonzero(np.isclose(centre[:, 1], 0.5, atol=1e-5))
row = row[np.argsort(centre[row, 0])]

ghia = np.genfromtxt("ghia_re400.csv", delimiter=",", names=True)

fig, (left, right) = plt.subplots(1, 2, figsize=(10, 4.5))
left.plot(velocity[column, 0], centre[column, 1], label="zCFD")
left.plot(ghia["u"], ghia["y"], "o", mfc="none", label="Ghia et al. (1982)")
left.set_xlabel("u (m/s) at x = 0.5")
left.set_ylabel("y (m)")
right.plot(centre[row, 0], velocity[row, 1], label="zCFD")
right.plot(ghia["x"], ghia["v"], "o", mfc="none", label="Ghia et al. (1982)")
right.set_xlabel("x (m)")
right.set_ylabel("v (m/s) at y = 0.5")
right.legend()
fig.savefig("compare_with_ghia.png", dpi=200, bbox_inches="tight")
\`\`\`

and run it:

\`\`\`bash
python compare_with_ghia.py
\`\`\`

It writes \`compare_with_ghia.png\`:

![Centreline velocities from zCFD against Ghia et al. (1982)](/images/tutorial-6-plot-centrelines.png)

zCFD matches Ghia's values to within 0.01 m/s, 1 % of the lid speed, at every tabulated point. The minimum u on the
vertical centreline is \u22120.33 m/s, near y = 0.27, where the main vortex carries the fluid back beneath its centre.
Along the horizontal centreline, v runs from 0.30 m/s on the upward side of the vortex to \u22120.45 m/s on the downward
side, close to the right-hand wall.

::: {.note}
One of Ghia's v values, \u22120.238 at x = 0.906, lies off the curve traced by its neighbours, \u22120.228 at x = 0.945 and
\u22120.450 at x = 0.859. zCFD gives \u22120.389 there, on the curve. Leave that point out when you compare the two.
:::

### ParaView

::: {.note}
The .vtkhdf output format requires [ParaView 6.1.1](https://www.paraview.org/download/) or later.
:::

Open \`cavity_OUTPUT/cavity/cavity_symmetry.vtkhdf\` in ParaView and click "Apply". The symmetry plane spans the whole
cavity, so it shows the flow in a single view. Colour it by \`V\`, magnitude, to see the fast-moving layer beneath the
lid. To see the vortices, add a "Stream Tracer" filter, which draws the paths the fluid follows, with a "Line" seed
type across the cavity; the main vortex fills most of the cavity, with the two smaller corner vortices below it.

:::

## Next steps

- Raise the Reynolds number to 1000 in both reference conditions. Ghia also tabulates Re 1000 and above; the primary
  vortex moves towards the centre of the cavity. Check that the residuals have converged before you compare.
- Change the coupling scheme to \`"simple"\`, following
  [Incompressible convergence control](../guide/choosing/choosing-a-time-marching-scheme.md#incompressible-convergence-control),
  and compare how many cycles each scheme needs to converge.

## Citations

Ghia, U., Ghia, K. N. and Shin, C. T. (1982). High-Re solutions for incompressible flow using the Navier-Stokes
equations and a multigrid method. _Journal of Computational Physics_, 48(3), 387\u2013411.
`;export{e as default};