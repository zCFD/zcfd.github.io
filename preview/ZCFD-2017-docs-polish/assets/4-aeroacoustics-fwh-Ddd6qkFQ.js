var e=`
# Aeroacoustics (FWH)

## What is in this tutorial?

The vortices shed by the cylinder in [Time-accurate solution](./3-time-accurate-solution.md) make a tone that can be
heard far away. This tutorial predicts that sound at two microphones, or _observers_, with the
[Ffowcs Williams\u2013Hawkings (FWH) solver](../guide/working-with/aeroacoustics-fwh.md) that comes with zCFD.

Simulating the air all the way out to a distant microphone would need an enormous mesh. An FWH solver avoids that.
zCFD solves the flow only near the cylinder, where the sound is made, and records the flow, as the run goes, on a
closed _FWH surface_ round the cylinder. After the run, the FWH solver uses those recordings to work out the sound
that reaches each observer, without solving the flow in between. You will run the CFD (computational fluid
dynamics) simulation, run the FWH solver in two ways, and plot and listen to what each observer hears.

## What you need?

Work through [Time-accurate solution](./3-time-accurate-solution.md) first: this tutorial runs the same cylinder,
and relies on it for running an unsteady case and viewing it in ParaView. The CFD run takes about ten minutes on an
NVIDIA RTX 3060, and the FWH solver a few seconds.

::: {.track when="deck"}

## Step 1. Download the files

The tutorial bundle can be downloaded [here](https://zcfd.zenotech.com/v2026.08.14860/tutorial_4_cylinder_noise.tgz).

\`\`\`bash
cd ~
wget https://zcfd.zenotech.com/v2026.08.14860/tutorial_4_cylinder_noise.tgz
tar xzf tutorial_4_cylinder_noise.tgz
cd tutorial_4_cylinder_noise
\`\`\`

It contains:

- \`cylinder.h5\`, the mesh, and \`cylinder_noise.py\`, the zCFD control file;
- \`fwh_surface_small.stl\`, the FWH surface this tutorial uses, and \`fwh_surface_medium.stl\` and
  \`fwh_surface_large.stl\`, two larger ones for the [extensions](#extensions);
- \`observers.csv\`, the observer used by the \`run_fwh\` utility;
- \`fwh_python.py\`, which runs the FWH solver from Python;
- \`plot_run_fwh.py\` and \`plot_fwh_python.py\`, which plot what the observers hear.

## Step 2. Walk through the input

The control file, \`cylinder_noise.py\`, is a short Python script. All it does is build one Python dictionary, called
\`parameters\`, that tells zCFD everything about the run: the physics, the numerical method, what to write out, and
the mesh with its boundaries. This step walks through that dictionary from top to bottom. Each heading below is the
name of a key, written exactly as it appears in the file, and the headings nest the same way the dictionary does:
\`numerical scheme\`, for example, sits inside \`solver\`. Under each heading you'll find what that part controls, what
each setting means, and why it has the value it has here. Each section ends with a link to that part's reference
page, which lists every setting it accepts and its default; you don't need it to follow the tutorial. On a wide
screen the whole control file sits on the right, with the part being described highlighted as you scroll.

\`cylinder_noise.py\` has the same settings as \`cylinder.py\` from
[Time-accurate solution](./3-time-accurate-solution.md), with two changes: the run lasts 4 seconds instead of 1.6,
and the output also records the flow on the FWH surface.

\`\`\`python
parameters = {
    "config version": 2,
    "solver": {
        "solver settings": {"type": "compressible"},
        "equations": {
            "type": "viscous",
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
                "temperature": 277.7777,
                "pressure": 101325.0,
                "v": {"vector": [0.0, 1.0, 0.0], "mach": 0.2},
                "reynolds no": 150,
                "reference length": 1.0,
            },
        },
        "initialisation": {"initial conditions": "IC_1", "restart": False},
        "numerical scheme": {
            "order": "second",
            "inviscid flux scheme": "roe",
        },
        "time settings": {
            "type": "unsteady",
            "kind": "dual time stepping",
            "total time": 4.0,
            "time step": 0.002,
            "order": "second",
            "start": 0,
        },
        "convergence control": {
            "scheme": {"name": "implicit euler"},
            "cfl": {
                "cfl": 200,
                "cfl viscous factor": 1.0e-6,
                "cfl ramp": [{"type": "exponential", "factor": 1.05, "initial": 0.1}],
            },
            "cycles": 5,
        },
        "output settings": {
            "report": {
                "frequency": 5,
                "monitor": {
                    "MR_1": {
                        "point": [0.25, 1.07, 0.313],
                        "variables": ["cp"],
                    },
                },
            },
            "solution": {
                "format": "vtk",
                "surface variables": ["V", "p", "T", "rho", "cp"],
                "volume variables": ["V", "p", "T", "rho", "m", "cp"],
                "fwh interpolate": ["fwh_surface_small.stl"],
                "frequency": {
                    "fwh interpolate": 1,
                    "volume data": 1000,
                    "surface data": 1000,
                },
            },
        },
    },
    "model": {
        "cylinder": {
            "mesh": "cylinder.h5",
            "boundary conditions": {
                "BC_1": {"zones": [2], "type": "symmetry"},
                "BC_2": {"zones": [3], "type": "wall", "kind": "no slip"},
                "BC_3": {
                    "zones": [1],
                    "type": "farfield",
                    "condition": "IC_1",
                    "kind": "riemann",
                },
            },
        },
    },
}
\`\`\`

### \`config version\`

\`"config version": 2\` says which layout of the control file this is. Every current control file declares it.

### \`solver\`

\`solver\` holds the settings shared by the whole simulation: the physics, the numerics, time marching and output.
Its blocks are walked below in the order the deck gives them.

#### \`solver settings\`

[\`solver settings\`](/reference/solver/solver-settings) chooses the solver.

- \`type\`: \`compressible\`, the density-based solver, which suits air at Mach 0.2.

#### \`equations\`

[\`equations\`](/reference/solver/equations) sets which equations are solved.

- \`type\`: \`viscous\`, the laminar Navier\u2013Stokes equations. At a Reynolds number of 150 the flow round the cylinder
  is laminar, so no turbulence model is needed.
- \`precondition\`: \`True\` switches on low-Mach-number preconditioning, recommended below about Mach 0.3.

#### \`fluid properties\`

[\`fluid properties\`](/reference/solver/fluid-properties) describes the gas.

- \`material\`: \`air\`, an ideal gas.
- \`gamma\`: 1.4, the ratio of specific heats.
- \`gas constant\`: 287.0 J/kg/K.
- \`sutherlands const\`: 110.4 K, the constant in Sutherland's law, which gives the viscosity's change with
  temperature.
- \`prandtl no\`: 0.72, the laminar Prandtl number, which sets the heat conduction.
- \`turbulent prandtl no\`: 0.9. It plays no part in a laminar run.

#### \`reference conditions\`

[\`reference conditions\`](/reference/solver/reference-conditions) defines named flow states, which the
initialisation and the boundary conditions refer to by name.

##### \`IC_1\`

\`IC_1\` is the freestream.

- \`temperature\`: 277.7777 K.
- \`pressure\`: 101325 Pa.
- \`v\`: the velocity, given as a direction, \`vector\` [0, 1, 0], and a \`mach\` number, 0.2. The flow runs along +y at
  66.8 m/s, the speed the log prints.
- \`reynolds no\`: 150. The Reynolds number compares the flow's inertia with its viscosity; at 150 the flow is slow
  and viscous enough to stay laminar. zCFD meets it by setting the viscosity.
- \`reference length\`: 1.0 m, the length the Reynolds number is based on: the cylinder's diameter.

The \`run_fwh\` utility in [Step 5](#step-5-post-process) takes its speed of sound and density from this block too.

#### \`initialisation\`

[\`initialisation\`](/reference/solver/initialisation) sets the state the run starts from.

- \`initial conditions\`: \`IC_1\`, so the whole domain starts at the freestream.
- \`restart\`: \`False\`, a fresh start rather than one from an earlier run's checkpoint.

#### \`numerical scheme\`

[\`numerical scheme\`](/reference/solver/numerical-scheme) sets how the equations are discretised in space.

- \`order\`: \`second\`, a second-order reconstruction of the flow in each cell, with the default limiter.
- \`inviscid flux scheme\`: \`roe\`, Roe's approximate Riemann solver for the flux between cells.

[Choosing a limiter](../guide/choosing/choosing-a-limiter.md) covers the order, the flux scheme and the limiter.

#### \`time settings\`

[\`time settings\`](/reference/solver/time-settings) says how the run advances in physical time.

- \`type\`: \`unsteady\`, a time-accurate run.
- \`kind\`: \`dual time stepping\`. Each physical time step is solved like a small steady problem: an inner loop of
  iterations, in a made-up _pseudo-time_, drives the flow towards its state at the end of the step. That inner loop
  is set by \`convergence control\` below.
- \`total time\`: 4.0 s of flow. The cylinder tutorial runs 1.6 s; the FWH solver needs a long, settled signal. The
  shedding takes about a second to settle, and the observers then need several seconds of it to resolve the tone.
- \`time step\`: 0.002 s, so 2000 time steps in all.
- \`order\`: \`second\`, second-order accuracy in time.
- \`start\`: 0, so no steady cycles are run before the time stepping begins.

[Choosing a time-marching scheme](../guide/choosing/choosing-a-time-marching-scheme.md#dual-time-stepping)
explains dual time stepping.

#### \`convergence control\`

[\`convergence control\`](/reference/solver/convergence-control) sets the inner loop that converges each time step.

- \`scheme\`: \`name\` \`implicit euler\`, which takes each inner step by solving a linear system, allowing large steps.
- \`cfl\`: the CFL number, which sets the size of each inner step.
  - \`cfl\`: 200.
  - \`cfl viscous factor\`: 1.0e-6. It scales the viscous part of each cell's pseudo-time step estimate, so at this
    value the convective wave speeds alone set the step, as in [Time-accurate solution](./3-time-accurate-solution.md).
  - \`cfl ramp\`: an \`exponential\` ramp that starts at 0.1 and multiplies the CFL by 1.05 each cycle. It starts the
    very first time step gently, from a flow that has not yet seen the cylinder; the log shows every inner cycle
    at 200 from the second time step on.
- \`cycles\`: 5 inner cycles per time step. They don't fully converge each step: the residuals, which measure how
  far the equations are from being satisfied, fall by a median of about 0.8 orders of magnitude (a factor of about 6) within a step. The Strouhal number in [Step 5](#step-5-post-process) shows the
  shedding is still right.

[CFL control](../guide/choosing/choosing-a-time-marching-scheme.md#cfl-control) describes the other ways to set the
CFL number.

#### \`output settings\`

[\`output settings\`](/reference/solver/output-settings) sets what zCFD writes during and after the run. It has two
parts: the \`report\`, a table written as the run goes, and the \`solution\`, the flow fields written for viewing and
post-processing.

##### \`report\`

The report is \`cylinder_noise_OUTPUT/cylinder/cylinder_report.csv\`, the table zMon plots.

- \`frequency\`: 5 cycles. In this run that writes a row at the first and the last inner cycle of every time step,
  each with the residual of every equation.
- \`monitor\`: monitor points, each recording flow variables at a fixed point. \`MR_1\` has a \`point\` in the wake,
  [0.25, 1.07, 0.313], and records its \`variables\`, the pressure coefficient \`cp\`. Without a \`name\`, its report
  column is named after its key: \`mr_1_cp\`.

##### \`solution\`

The solution output is written to files under \`cylinder_noise_OUTPUT/cylinder/\`.

- \`format\`: \`vtk\`, VTK HDF files (_.vtkhdf_) for ParaView.
- \`surface variables\`: the variables written on the boundary surfaces: velocity \`V\`, pressure \`p\`, temperature
  \`T\`, density \`rho\` and pressure coefficient \`cp\`.
- \`volume variables\`: the variables written throughout the domain: the same, with the Mach number \`m\`.
- \`fwh interpolate\`: the FWH surface files to record the flow on, here \`fwh_surface_small.stl\`. The flow is
  interpolated to the centre of each of the surface's panels and written to
  \`ACOUSTIC_DATA/fwh_surface_small_FWHData.h5\`, the FWH solver's input.
- \`frequency\`: how often each kind of output is written, in time steps.
  - \`fwh interpolate\`: 1, every time step, because the FWH solver needs every step.
  - \`volume data\` and \`surface data\`: 1000, so only at time steps 1000 and 2000. The cylinder tutorial already
    gives you the flow field in detail.

The FWH surface is made of 1000 flat panels. It surrounds the cylinder and runs far downstream alongside the
wake. Here its outline, in white, is drawn over the velocity magnitude on the mid-span plane at the end of the
run. In ParaView, show the surface as _Feature Edges_ with a thicker _Line Width_ to see it beside the volume
solution:

![The FWH surface's outline in white over the velocity magnitude at mid-span, with the cylinder's wake inside it](/images/tutorial-4-cylinder-fwh-surface1.png)

It encloses the region where the noise is made, but does not cut through the wake. Vortices crossing the surface
would be read as sound that isn't really there, so-called pseudo-sound [[1]](#citations), [[2]](#citations).

### \`model\`

[\`model\`](/reference/model) has one entry per mesh, with that mesh's boundary conditions.

#### \`cylinder\`

The model's name, \`cylinder\`, names its output folder, \`cylinder_noise_OUTPUT/cylinder/\`, and its files.

##### \`mesh\`

\`cylinder.h5\`, the mesh file, in zCFD's native format: 80,000 cells round a cylinder of 1 m diameter centred at
(0.25, 0, 0), with its span along x and one cell across it.

##### \`boundary conditions\`

[\`boundary conditions\`](/reference/model/boundary-conditions) assign a condition to each group of boundary faces.
The groups are the mesh's zones, numbered when the mesh was made, and each condition lists its zones in \`zones\`.
[Choosing boundary conditions](../guide/choosing/choosing-boundary-conditions.md) describes every type.

###### \`BC_1\`

- \`zones\`: [2], the two faces normal to the span.
- \`type\`: \`symmetry\`. With symmetry on both, the cylinder behaves as if it were infinitely long, so the mesh needs
  only one cell across the span.

###### \`BC_2\`

- \`zones\`: [3], the cylinder's surface.
- \`type\`: \`wall\`, with \`kind\` \`no slip\`: the flow velocity is zero at the surface.

###### \`BC_3\`

- \`zones\`: [1], the outer boundary.
- \`type\`: [\`farfield\`](../guide/choosing/choosing-boundary-conditions.md#farfield).
- \`condition\`: \`IC_1\`, the state the farfield imposes.
- \`kind\`: \`riemann\`, which lets flow and waves leave the domain without reflecting back into it.

## Step 3. Run

In the activated environment (see [Simple aerofoil](./1-simple-aerofoil.md#step-3-run)), check the control file and
run it:

\`\`\`bash
cd ~/tutorial_4_cylinder_noise/
validate_input cylinder_noise.py
run_zcfd -c cylinder_noise.py
\`\`\`

These are extracts from the log of a run of this tutorial, \`cylinder_noise.log\`, with \`...\` marking lines left out:

\`\`\`text
Parameters validated successfully
...
 Reading file cylinder.h5
 Global Mesh Stats: Cells: 80000 Faces: 320400
...
  Speed:        66.8165 m/s
...
  Reynolds No:  150 @ 277.778 K
...
Starting solve loop
------------------------ Cycle      1  Step    0 t=0.002s ------------------------
...
Real time cycle 1000 complete: 5 inner cycles, 0.87 orders dropped
...
Inner convergence over 2000 real time cycles: median 0.82 orders dropped, 5-5 inner cycles used
Only 0% of real time cycles reached 2.0 orders - consider increasing 'cycles' or 'cfl'
 Solve Complete: 10000 cycles in 2m 59.1s (avg 17.9 ms/cycle)
...
zCFD finished: all requested cycles are complete (10000 in total).
\`\`\`

- Each time step runs 5 inner cycles and ends with a line saying how far the residuals fell within it.
- A line starting \`FWH Interpolate Field Output\` marks each write of the FWH surface data.
- At the end, a summary gives the median fall in the residuals per time step, here 0.82 orders, with a hint that no
  step reached 2 orders. The Strouhal check in Step 5 shows that is enough for the shedding in this case. This
  extract is from a run on a faster GPU than the RTX 3060. For your own cases, [Choosing a time-marching scheme](../guide/choosing/choosing-a-time-marching-scheme.md#dual-time-stepping)
  discusses the balance between inner cycles and cost.

### Output files

As in the earlier tutorials, the output is named after the control file and the model:

| File/Directory                                                                | Description                                                        |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| \`cylinder_noise.log\`                                                          | A copy of the output to screen during the run.                     |
| \`cylinder_noise_status.yaml\`                                                  | How the run was started: version, date, control file, mesh, nodes. |
| \`cylinder_noise_OUTPUT/cylinder/cylinder_report.csv\`                          | The residuals and the monitor point, row by row.                   |
| \`cylinder_noise_OUTPUT/cylinder/cylinder_results.h5\`                          | The checkpoint, used to restart the run.                           |
| \`cylinder_noise_OUTPUT/cylinder/cylinder.vtkhdf\` etc                          | Volume and surface data, at time steps 1000 and 2000.              |
| \`cylinder_noise_OUTPUT/cylinder/ACOUSTIC_DATA/fwh_surface_small_FWHData.h5\`   | The flow on the FWH surface at every time step: the FWH input.     |
| \`cylinder_noise_OUTPUT/cylinder/ACOUSTIC_DATA/fwh_surface_small_FWHData.xdmf\` | Opens the FWH surface data in ParaView.                            |
| \`cylinder_noise_OUTPUT/LOGGING/\`                                              | A separate log for each MPI rank, used for debugging.              |

## Step 4. Monitor

Open the run in zMon, during or after it:

\`\`\`bash
zmon cylinder_noise.py
\`\`\`

[Monitoring a run](../guide/working-with/monitoring-a-run.md) describes each panel. The plot below shows the
residuals at the end of each time step against simulated time, as zMon draws them with its x axis set to time; it
was drawn in zMon's style with a script like the one in [Simple aerofoil](./1-simple-aerofoil.md#python).

### Residuals

![Residuals at the end of each time step against simulated time](/images/tutorial-4-residuals.png)

The residuals fall over the first half second as the flow settles round the cylinder, then rise as the wake
starts to shed, and from about 1 s they oscillate steadily, twice per shedding cycle: once for each vortex shed.
That steady oscillation shows the shedding has settled. \`rhoU\`, the momentum along the span, stays at round-off
level throughout, because the flow has no velocity along the span. The \`mr_1_cp\` monitor in zMon's reports panel oscillates at the shedding frequency itself.

## Step 5. Post-process

First activate your zCFD environment, which provides Python with zutil, h5py and ParaView:

\`\`\`bash
source <ZCFD_INSTALL_PATH>/bin/activate
\`\`\`

The FWH solver post-processes the surface data the run wrote. It can be run in two ways: the
[run_fwh utility](../guide/working-with/aeroacoustics-fwh.md#using-the-zcfd-run_fwh-utility), which needs no code,
and the [fwh Python module](../guide/working-with/aeroacoustics-fwh.md#using-the-zcfd-fwh-python-module), which
handles more cases.

### FWH with the run_fwh utility

The \`run_fwh\` utility calculates the noise at an observer \`Obs1\`, which stays a fixed distance from the cylinder:
for a cylinder in a wind tunnel, \`Obs1\` would be a microphone on the tunnel wall. \`run_fwh\` handles only observers
that don't move relative to the FWH surface, which it calls being in the same
[translational reference frame](../guide/working-with/aeroacoustics-fwh.md#reference-condition). \`Obs1\` is one.

![FWH Observer and surface motions - CFD frame of reference](/images/tutorial-4-fwhdiagram-cyl1-obs1only.svg)

\`run_fwh\` needs three inputs:

- a [zCFD control file](../guide/working-with/aeroacoustics-fwh.md#zcfd-control-file): \`cylinder_noise.py\`, from
  which it finds the FWH surface and its data,
  \`cylinder_noise_OUTPUT/cylinder/ACOUSTIC_DATA/fwh_surface_small_FWHData.h5\`;
- a [reference condition](../guide/working-with/aeroacoustics-fwh.md#reference-condition): the freestream, which
  is \`IC_1\` in the control file;
- an [observers .csv file](../guide/working-with/aeroacoustics-fwh.md#observer-csv-file) naming each observer and
  its position. The cylinder's centre is at (0.25, 0, 0) and \`Obs1\` stays 20 m from it along z, so
  \`observers.csv\` holds:

\`\`\`
Obs1, 0.25, 0.0,  20.0
\`\`\`

Run it in the activated environment:

\`\`\`bash
run_fwh -c cylinder_noise.py --reference_condition IC_1 --observer_locations observers.csv
\`\`\`

It writes its progress to the screen and to \`cylinder_noise.fwh.log\`, and the pressure history at \`Obs1\` to
\`cylinder_noise.fwh.Obs1.csv\`. Where there are several noise sources, the contribution of each is broken out,
with the total alongside.

### FWH with the fwh Python module

\`run_fwh\` is limited to observers and surfaces in the same translational reference frame, and to cases where no
two FWH surfaces enclose the same source, since that would
[count the source twice](../guide/working-with/aeroacoustics-fwh.md#advanced-use). The
[fwh Python module](../guide/working-with/aeroacoustics-fwh.md#using-the-zcfd-fwh-python-module) has neither
limit. This section uses it to calculate the pressure at both \`Obs1\` and \`Obs2\`, a 'fly-by' observer that
\`run_fwh\` cannot handle.

![FWH surface and observer motions - CFD frame of reference](/images/tutorial-4-fwhdiagram-cyl1.svg)

#### Observer and surface motions

The FWH equations assume a _quiescent medium_: still air. The CFD freestream is (0, 66.8, 0) m/s, so the FWH
calculation is carried out in a frame moving with the air. \`run_fwh\` makes that change of frame for you; with the
Python module you give the motions of the surface and observers through the still air yourself.

In the still-air frame, the cylinder and \`Obs1\` fly through the air together. \`Obs2\` stands still, like a
microphone on the ground as the cylinder flies overhead.

![FWH surface and observer motions - FWH (quiescent medium) frame of reference](/images/tutorial-4-fwhdiagram-cyl2.svg)

#### The script

\`fwh_python.py\` defines the surface, the observers and the solver settings, then calls \`fwh.solve()\`:

\`\`\`python
import json
import math

from fwh import fwh, motion

c = math.sqrt(1.4 * 277.7777 * 287)
v_surf = [0, -0.2 * c, 0]
surfaceCentrePoint = motion.ConstantVelocityPoint([0.0, 0.0, 0.0], v_surf)
surfaceMotion = motion.NonrotatingSurface(surfaceCentrePoint)

obs1_CFD_frame_posn = [0.25, 0, 20]
obs1Motion = motion.ConstantVelocityPoint(obs1_CFD_frame_posn, v_surf)

obs2_posn = [obs1_CFD_frame_posn[i] + 2.5 * v_surf[i] for i in range(3)]
obs2Motion = motion.StationaryPoint(obs2_posn)

solverSettings = {
    "c": c,
    "dt": 0.002,
    "rho0": 101325.0 / (277.7777 * 287),
    "p0": 101325.0,
}

surfaces = {
    "surf1": {
        "motion": surfaceMotion,
        "fileName": "./cylinder_noise_OUTPUT/cylinder/ACOUSTIC_DATA/fwh_surface_small_FWHData.h5",
    }
}
observers = {"Obs1": obs1Motion, "Obs2": obs2Motion}

pOut, tOut = fwh.solve(surfaces, observers, solverSettings)

with open("./FWH_data.json", "w") as f:
    json.dump({"p": pOut, "t": tOut}, f)
\`\`\`

The most important idea is that _motion classes_ define how observers and surfaces move. The
[point (observer) motions](../guide/working-with/aeroacoustics-fwh.md#point-observer-motion-classes) are
\`OriginPoint\`, \`StationaryPoint\` and \`ConstantVelocityPoint\`; the
[surface motions](../guide/working-with/aeroacoustics-fwh.md#surface-motion-classes), which take a point motion
for their centre, are \`NonrotatingSurface\` and \`RotatingSurface\`.
[Running the zCFD FWH solver](../guide/working-with/aeroacoustics-fwh.md#running-the-zcfd-fwh-solver) gives the
full set-up.

- The speed of sound, density and pressure in \`solverSettings\` follow from \`IC_1\` in \`cylinder_noise.py\`, and
  \`dt\` is the 0.002 s between FWH surface outputs.
- A point on the FWH surface moves as $\\mathbf{x}(t)=\\mathbf{x}_0+ \\mathbf{V}_{surf}\\ t$ in the still-air frame,
  where $\\mathbf{x}_0$ is its position in \`fwh_surface_small.stl\` and $\\mathbf{V}_{surf}$ is the surface
  velocity, the freestream reversed.
- \`Obs1\` stays 20 m from the cylinder's centre along z, so it moves as
  $\\mathbf{x}(t)= (0.25,0,20) + \\mathbf{V}_{surf} t$.
- \`Obs2\` is stationary, and placed where \`Obs1\` is at t = 2.5 s.

Run it in the activated environment:

\`\`\`bash
python3 fwh_python.py
\`\`\`

It prints the _valid min and max times_ for each surface and observer pair: the window in which the observer
hears every point of the surface. Sound takes time to travel: sound from a surface point at time _t_ reaches an
observer _r/c_ seconds later, where _r_ is the distance between them and _c_ the speed of sound. So the window
starts later than the 0.002 s to 4.0 s of surface data, and a larger surface gives a narrower window. The pressure histories are saved to \`FWH_data.json\`.

### Python

\`plot_fwh_python.py\` plots the data from the [fwh Python module](#fwh-with-the-fwh-python-module), and
\`plot_run_fwh.py\` does the same for the [run_fwh utility](#fwh-with-the-run_fwh-utility). Run either, after the
step whose data it reads:

\`\`\`bash
python3 plot_fwh_python.py
\`\`\`

They use the _zutil_ acoustic functions, which may be useful for your own acoustic post-processing, to plot the
pressure history _p(t)_ and the power spectral density (PSD), which shows how the sound's energy is spread across
frequencies, at each observer: \`Obs1_p.png\` and \`Obs1_psd.png\`,
and from the Python module data also \`Obs2_p.png\` and \`Obs2_psd.png\`. Both also write _.wav_ files,
\`Obs1_playback.wav\` and \`Obs2_playback.wav\`, so you can listen to what each observer hears.

\`Obs1\` moves with the cylinder. The noise it hears is dominated by a steady tone at 11.5 Hz, the frequency at
which the cylinder sheds vortices. As a Strouhal number, the frequency times the diameter divided by the flow
speed, that is 0.17. Harmonics, whole-number multiples of the tone, show as smaller peaks in the PSD.

![Observer 1 p(t)](/images/tutorial-4-obs1-p.png)

![Observer 1 PSD](/images/tutorial-4-obs1-psd.png)

The cylinder approaches \`Obs2\` until 2.5 s and then moves away. In the \`Obs2\` _p(t)_ plot the peaks are closer
together before 2.5 s than after it: the pitch is higher while the source approaches and lower as it recedes, the
Doppler shift you hear as a siren passes. It also spreads the shedding peak in the PSD, compared with \`Obs1\`'s.

![Observer 2 p(t)](/images/tutorial-4-obs2-p.png)

![Observer 2 PSD](/images/tutorial-4-obs2-psd.png)

### ParaView

\`cylinder_noise_OUTPUT/cylinder/ACOUSTIC_DATA/fwh_surface_small_FWHData.xdmf\` opens the FWH surface data in
ParaView, with the pressure, velocity and density at each panel centre changing with time. Use the _Time_ controls
to step through it; a _Point Gaussian_ view style, with a larger _Gaussian Radius_ in the _Properties_ panel, makes
the panel values easier to see. The volume and surface output views as in
[Time-accurate solution](./3-time-accurate-solution.md).

## Extensions

To become more comfortable with the FWH solver, various extensions to this exercise are possible. Here are some
suggestions.

1. Re-run the zCFD solver, but this time extract FWH data on the cylinder
   [wall](/reference/solver/output-settings#solution) instead of \`fwh_surface_small.stl\`. Run the FWH solver (using
   the wall data as an [impermeable](../guide/working-with/aeroacoustics-fwh.md#how-does-an-fwh-solver-work) FWH
   surface, one the flow cannot pass through) and compare the results with the \`fwh_surface_small\` surface, a
   permeable one that the flow passes through.
2. Re-run the zCFD solver, but this time also extract FWH data on the \`fwh_surface_medium.stl\` and \`fwh_surface_large.stl\`
   surfaces. These are like \`fwh_surface_small.stl\` but slightly larger. Run the FWH solver with these surfaces and
   investigate the effect of using different surfaces on the FWH results. You will have to do this using the fwh
   python module to avoid [double accounting](../guide/working-with/aeroacoustics-fwh.md#advanced-use).
3. Add extra observers of your choice to the FWH solver.
4. Use the file utility [writeFWHSurfaceFrequenciesFile](../guide/working-with/aeroacoustics-fwh.md#writefwhsurfacefrequenciesfile)
   to visually inspect the spatial distribution of different frequencies in the FWH surface.
5. Use the file utility [writeBlankedOffFwhSurfaceFile](../guide/working-with/aeroacoustics-fwh.md#writeblankedofffwhsurfacefile)
   to 'blank off' all FWH surface cells more than 5 cylinder diameters downstream of the cylinder's centre. Run
   the FWH solver using this modified surface, and based on this estimate how much of the shedding noise
   originates more than 5 diameters downstream of the cylinder.
6. Use the \`fwh.fwh_helper_functions\` module to rewrite \`fwh_python.py\` so that the \`solverSettings\`
   dictionary is automatically set based on the zCFD control file name and reference condition which were used
   in the \`run_fwh\` utility.

::: {.note}
Since the cylinder CFD simulation is '2.5D' (i.e. the mesh only has a single cell in the _x_ direction), the
distance scaling of _p(t)_ at observers will be non-physical.
:::

:::

## Citations

1. Mitchell, B., Lele, S., & Moin, P. (1999). Direct computation of the sound generated by vortex pairing in an
   axisymmetric jet. Journal of Fluid Mechanics, 383, 113-142. 10.1017/S0022112099003869
2. Ricciardi, T. R. , Wolf W. R, & Spalart P. R. (2022). On the Application of Incomplete Ffowcs Williams and
   Hawkings Surfaces for Aeroacoustic Predictions. AIAA Journal, 60:3, 1971-1977. 10.2514/1.J061285
`;export{e as default};