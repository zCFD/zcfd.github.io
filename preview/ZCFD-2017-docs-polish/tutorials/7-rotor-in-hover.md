---
title: 7 · Rotor in hover
section: tutorials
order: 70
---

# Rotor in hover

## What is in this tutorial?

This tutorial simulates a helicopter-style rotor hovering in still air, and compares the pressure on its blades
with wind-tunnel measurements. Along the way it shows three things you will need for your own cases: converting a
mesh made by another program, referring to boundaries by name, and two ways of cutting the cost of a rotor run. The
first is a rotating frame, which lets a spinning rotor be solved as a flow that does not change with time. The second
is a periodic boundary, which lets you model only one of the identical blades.

The rotor is the one Caradonna and Tung tested at NASA in 1981[^1]. It has two straight blades, each the same
NACA 0012 aerofoil shape from root to tip, six times as long as they are wide, set at a collective pitch of 8°: every
blade meets the air at the same 8° angle. The tips move at 0.877 times the speed of sound (Mach 0.877), fast enough
for a shock wave, a sudden jump in pressure, to form near the tip. The experiment measured the pressure on the blade
surface at five distances from the shaft, and those measurements are the reference here.

## What you need?

Work through [Simple aerofoil](./1-simple-aerofoil.md) first: this tutorial relies on it for running zCFD, reading
the log and monitoring a run in zMon. The mesh has 447,468 cells, and the run takes about nine and a half minutes on an NVIDIA
RTX 3060. The Python step in Step 5 also uses ParaView's Python modules, which come with zCFD.

::: {.track when="deck"}

## Step 1. Download the files

The tutorial bundle can be downloaded [here](https://zcfd.zenotech.com/ZCFD-2017-docs-polish/tutorial_7_rotor_in_hover.tgz).

```bash
cd ~
wget https://zcfd.zenotech.com/ZCFD-2017-docs-polish/tutorial_7_rotor_in_hover.tgz
tar xzf tutorial_7_rotor_in_hover.tgz
cd tutorial_7_rotor_in_hover
```

| File                     | Contents                                                               |
| ------------------------ | ---------------------------------------------------------------------- |
| `caradonna_tung.msh.h5`  | the mesh as Fluent wrote it                                            |
| `caradonna_tung.h5`      | the same mesh, converted for zCFD                                      |
| `caradonna_tung_zone.py` | the zone helper written by the conversion                              |
| `caradonna_tung.py`      | the control file                                                       |
| `data/cp-0p50.txt` …     | the measured surface pressure at r/R = 0.50, 0.68, 0.80, 0.89 and 0.96 |

### Converting the mesh

zCFD reads its own mesh format. A mesh from another program is converted once, before the first run:

```bash
convert_mesh caradonna_tung.msh.h5 caradonna_tung.h5
```

The converter recognises the Fluent CFF format from the file name, and writes two files: the zCFD mesh,
`caradonna_tung.h5`, and a zone helper, `caradonna_tung_zone.py`. The bundle already holds both, so this step can be
skipped; running it replaces them with identical copies. [Preparing a mesh](../guide/setting-up/preparing-a-mesh.md)
lists the converters for the other formats.

A mesh's boundary faces are grouped into zones, each with a number. The zone helper maps the names the boundaries
were given in the mesh generator to those numbers:

```python
zone_name_to_id={
    "farfield": 48,
    "periodic2": 50,
    "core": 51,
    "lower_surface": 52,
    "upper_surface": 53,
    "tip": 54,
    "periodic1": 732,
    "interior--enclosure-enclosure": 1909,
}
```

Its `to_id` function turns a list of names into a list of numbers. The control file imports it, so every boundary
condition below names its boundaries as the mesh generator did. See
[Zone identifiers](../guide/setting-up/preparing-a-mesh.md#zone-identifiers).

## Step 2. Walk through the input

The control file, `caradonna_tung.py`, is a short Python script. All it does is build one Python dictionary, called
`parameters`, that tells zCFD everything about the run: the physics, the numerical method, what to write out, and the
mesh with its boundaries. This step walks through that dictionary from top to bottom. Each heading below is the name
of a key, written exactly as it appears in the file, and the headings nest the same way the dictionary does:
`numerical scheme`, for example, sits inside `solver`. Under each heading you'll find what that part controls, what
each setting means, and why it has the value it has here. Each section ends with a link to that part's reference page,
which lists every setting it accepts and its default; you don't need it to follow the tutorial. On a wide screen the
whole control file sits on the right, with the part being described highlighted as you scroll.

Two parts are new since [Simple aerofoil](./1-simple-aerofoil.md): the rotating frame, under the model's `transforms`,
and the pair of periodic boundaries among its boundary conditions. The file also starts with two Python import lines,
which get their own heading.

```python
import math

from caradonna_tung_zone import to_id

parameters = {
    "config version": 2,
    "solver": {
        "solver settings": {
            "type": "compressible",
            "partitioner": "metis",
        },
        "equations": {
            "type": "rans",
            "turbulence": {"model": "sst"},
            "precondition": False,
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
                "temperature": 289.75,
                "pressure": 103037.0,
                "v": {"vector": [0.0, 0.0, -1.0], "mach": 0.877},
                "reynolds no": 3.93e6,
                "reference length": 1.0,
                "turbulence intensity": 0.01,
                "eddy viscosity ratio": 0.1,
            },
            "IC_2": {
                "temperature": 289.75,
                "pressure": 103037.0,
                "v": {"vector": [0.0, 0.0, -1.0], "mach": 0.00001},
                "reynolds no": 3.93e6 * 0.00001 / 0.87,
                "reference length": 1.0,
                "turbulence intensity": 0.01,
                "eddy viscosity ratio": 0.1,
            },
        },
        "initialisation": {"initial conditions": "IC_2", "reference": "IC_1"},
        "numerical scheme": {
            "order": "second",
            "limiter": "van albada",
        },
        "time settings": {"type": "steady"},
        "convergence control": {
            "scheme": {"name": "lu-sgs"},
            "cfl": {
                "cfl": 20.0,
                "cfl ramp": [{"type": "exponential", "factor": 1.05, "initial": 0.1}],
            },
            "cycles": 1500,
        },
        "output settings": {
            "report": {
                "frequency": 10,
                "forces": {
                    "FR_1": {
                        "name": "blade",
                        "zones": to_id(["lower_surface", "upper_surface", "tip"]),
                    },
                },
            },
            "solution": {
                "format": "vtk",
                "surface variables": ["V", "p", "T", "rho", "mach", "yplus"],
                "volume variables": ["V", "p", "T", "rho", "mach", "cell_velocity"],
            },
        },
    },
    "model": {
        "rotor": {
            "mesh": "caradonna_tung.h5",
            "transforms": {
                "motion": {
                    "type": "rotating",
                    "omega": 49.873,
                    "axis": [0.0, 0.0, 1.0],
                    "origin": [0.0, 0.0, 0.0],
                    "moving mesh": False,
                }
            },
            "boundary conditions": {
                "BC_1": {
                    "zones": to_id(["lower_surface", "upper_surface", "tip"]),
                    "type": "wall",
                    "kind": "wall function",
                },
                "BC_2": {
                    "zones": to_id(["farfield"]),
                    "type": "farfield",
                    "kind": "riemann",
                    "condition": "IC_2",
                },
                "BC_3": {"zones": to_id(["core"]), "type": "symmetry"},
                "BC_4": {
                    "zones": to_id(["periodic2"]),
                    "type": "interface",
                    "kind": "periodic",
                    "connection": {"boundary": "BC_5"},
                    "transform": {
                        "type": "rotated",
                        "theta": math.radians(180.0),
                        "axis": [0.0, 0.0, 1.0],
                        "origin": [0.0, 0.0, 0.0],
                    },
                },
                "BC_5": {
                    "zones": to_id(["periodic1"]),
                    "type": "interface",
                    "kind": "periodic",
                    "connection": {"boundary": "BC_4"},
                    "transform": {
                        "type": "rotated",
                        "theta": math.radians(-180.0),
                        "axis": [0.0, 0.0, 1.0],
                        "origin": [0.0, 0.0, 0.0],
                    },
                },
            },
        }
    },
}
```

### `from caradonna_tung_zone import to_id`

The control file is Python, so it can import helpers before it defines `parameters`.

- `import math` supplies `math.radians`, which turns the periodic angles below from degrees to radians.
- `from caradonna_tung_zone import to_id` imports the zone helper written by the mesh conversion in
  [Step 1](#converting-the-mesh). `to_id(["farfield"])` returns the zone numbers of the boundaries the mesh
  generator named `farfield`, so the boundary conditions name their boundaries rather than number them.

See [Zone identifiers](../guide/setting-up/preparing-a-mesh.md#zone-identifiers).

### `config version`

Says which layout of control file this is, so zCFD knows how to read the rest.

- `config version`: `2`, the current layout, with `solver` and `model` at the top level.

### `solver`

The settings shared by the whole simulation: which solver runs, what it solves, the fluid, the flow states, and how
the run marches and what it writes.

#### `solver settings`

Chooses the solver and how the mesh is shared out.

- `type`: `"compressible"`: the solver that lets the air's density change. The tip moves at Mach 0.877, fast enough
  to squeeze the air noticeably.
- `partitioner`: `"metis"`: when the run is spread over more than one processor or GPU, the METIS tool decides which
  cells each one handles.

See [`solver settings`](/reference/solver/solver-settings).

#### `equations`

Sets the equations being solved.

- `type`: `"rans"`, the Reynolds-averaged Navier–Stokes equations. These solve for the average flow and represent
  the effect of turbulence, the small chaotic eddies, with a turbulence model rather than resolving every eddy.
- `turbulence`: `{"model": "sst"}`, Menter's SST model, a widely used general-purpose turbulence model.
- `precondition`: `False`: low-speed preconditioning, a technique that helps the compressible solver with slow flows,
  is off. The flow the blades see is fast, up to Mach 0.877 at the tip.

See [`equations`](/reference/solver/equations) and
[Choosing a turbulence model](../guide/choosing/choosing-a-turbulence-model.md).

#### `fluid properties`

Describes the gas.

- `material`: `"air"`, as an ideal gas.
- `gamma` and `gas constant`: `1.4` and `287.0` J/kg/K, the standard values for air.
- `sutherlands const`: `110.4` K, for Sutherland's law, which sets how the viscosity changes with temperature.
- `prandtl no` and `turbulent prandtl no`: `0.72` and `0.9`, which relate how fast heat spreads to how fast momentum
  does, in smooth and turbulent flow.

See [`fluid properties`](/reference/solver/fluid-properties).

#### `reference conditions`

Defines named flow states, each a set of values such as temperature, pressure and velocity. Other parts of the
file refer to them by name: to fill the domain at the start, to set conditions at boundaries, and to scale the
equations.

##### `IC_1`

The conditions at the blade tip, used as the reference.

- `temperature` and `pressure`: `289.75` K and `103037.0` Pa, the test conditions.
- `v`: `{"vector": [0.0, 0.0, -1.0], "mach": 0.877}`: the tip Mach number, 299 m/s.
- `reynolds no`: `3.93e6`, the Reynolds number at the tip: the ratio of the air's inertia to its viscosity, based on
  the blade's width (its chord). The solver sets the viscosity to give this value.
- `reference length`: `1.0` m, the blade chord.
- `turbulence intensity` and `eddy viscosity ratio`: `0.01` and `0.1`, the turbulence in the incoming air: very
  little here.

##### `IC_2`

The still air the rotor turns in.

- `temperature` and `pressure`: as `IC_1`.
- `v`: `{"vector": [0.0, 0.0, -1.0], "mach": 0.00001}`: a speed so small that the air is, in effect, still.
- `reynolds no`: `3.93e6 * 0.00001 / 0.87`: `IC_1`'s Reynolds number scaled down with the speed, so that both
  states have very nearly the same viscosity.
- `reference length`, `turbulence intensity` and `eddy viscosity ratio`: as `IC_1`.

See [`reference conditions`](/reference/solver/reference-conditions).

#### `initialisation`

Chooses which states start the run and scale it.

- `initial conditions`: `"IC_2"`: the air starts still.
- `reference`: `"IC_1"`: internally the solver works with values divided by a reference velocity. Still air would
  give it almost none to divide by, so the tip conditions provide one that matches the flow the blades see.

See [`initialisation`](/reference/solver/initialisation) and
[Reference state](../guide/choosing/choosing-initialisation-and-reference-state.md#reference-state).

#### `numerical scheme`

Sets how the equations are discretised in space: how the smooth flow is represented by one value in each cell of
the mesh.

- `order`: `"second"`: the solver estimates how each variable, the turbulence variables included, varies across each
  cell, which is more accurate than treating it as constant.
- `limiter`: `"van albada"`: near a sharp change such as the shock on the outer blade, that estimate can overshoot
  and produce unphysical wiggles; the limiter damps them.

See [`numerical scheme`](/reference/solver/numerical-scheme) and
[Choosing a limiter](../guide/choosing/choosing-a-limiter.md).

#### `time settings`

Says what kind of run this is.

- `type`: `"steady"`: the run looks for a flow that does not change with time. In hover that is true for an
  observer turning with the blades, which [`transforms`](#transforms) sets up.

See [`time settings`](/reference/solver/time-settings).

#### `convergence control`

Sets how the solver reaches the steady solution. It starts from a guess and improves it once per cycle, or
iteration, until the flow stops changing; the run has then converged.

##### `scheme`

- `name`: `"lu-sgs"`: each cycle updates the solution with a cheap sweep through the mesh (lower–upper symmetric
  Gauss–Seidel). A cycle costs less than with the `"implicit euler"` scheme of
  [Simple aerofoil](./1-simple-aerofoil.md), but it needs a smaller CFL number, so more cycles.

##### `cfl`

- `cfl`: `20.0`, the CFL number the run ramps up to. The CFL number sets how big a step each cycle takes towards the
  answer: too large and the run becomes unstable, too small and it needs many cycles.
- `cfl ramp`: `[{"type": "exponential", "factor": 1.05, "initial": 0.1}]`: start at 0.1 and multiply by 1.05 each
  cycle, so the early cycles, far from the answer, take small steps.

##### `cycles`

- `cycles`: `1500`: the run stops after 1500 cycles. [Step 4](#step-4-monitor) shows the thrust, the upward force
  on the rotor, has settled by then.

See [`convergence control`](/reference/solver/convergence-control) and
[CFL control](../guide/choosing/choosing-a-time-marching-scheme.md#cfl-control).

#### `output settings`

Sets what zCFD writes, and how often. See [`output settings`](/reference/solver/output-settings).

##### `report`

The report is a table with one row per report cycle, written to `caradonna_tung_OUTPUT/rotor/rotor_report.csv` and
plotted by zMon.

- `frequency`: `10`: a row every 10 cycles, holding the residuals and the forces.
- `forces`: one block, `FR_1`, which sums the forces on a set of zones:

  - `name`: `"blade"`, which prefixes its report columns: `blade_Fx`, `blade_Fy` and `blade_Fz` for the force,
    `blade_Mx` to `blade_Mz` for the moment, and their pressure (`Fp`, `Mp`) and friction (`Ff`, `Mf`) parts.
  - `zones`: the lower surface, upper surface and tip of the blade, by name through `to_id`.

  On a rotating model the block also reports the thrust (the force along the shaft), the torque (the turning
  resistance about it) and the power: `blade_rotor_Thrust`, `blade_rotor_Tq` and `blade_rotor_Tqp`, named after the
  block and the model.

##### `solution`

The flow solution, written for visualisation and post-processing.

- `format`: `"vtk"`: VTK HDF files, `.vtkhdf`, which ParaView opens.
- `surface variables`: velocity `V`, pressure `p`, temperature `T`, density `rho`, Mach number `mach` and `yplus`,
  which measures how close the first cell is to the wall. The pressure coefficient `cp` is left out. It compares the
  local pressure with the pressure of the oncoming flow, and in hover there is no oncoming flow, so
  [Step 5](#python) works out the experiment's version from `p` instead.
- `volume variables`: the same flow variables, and `cell_velocity`, the velocity of the turning frame at each cell.

No `frequency` is given, so the solution is written once, at the end of the run.
[Output variables](../guide/working-with/post-processing-and-visualisation.md#output-variables) lists the others.

### `model`

One entry per mesh, each with its own placement, motion and boundary conditions. See [`model`](/reference/model).

#### `rotor`

The name of the only model. It names the output folder, `caradonna_tung_OUTPUT/rotor/`, and the files in it, and
appears in the thrust column.

##### `mesh`

- `mesh`: `"caradonna_tung.h5"`, the mesh converted in [Step 1](#converting-the-mesh). It holds one blade in a
  half-cylinder.

##### `transforms`

Places and moves the mesh. Here it holds only a `motion`, which sets up a rotating frame.

In hover the air far from the rotor is still, and each blade always sees the same flow. To an observer standing
still the flow keeps changing as the blades sweep past, but to an observer turning with the blades it does not change
at all. Solving the flow as that turning observer sees it, in a rotating frame, turns the rotor into a steady problem,
which is far cheaper than following the blades round in time.

- `motion`:
  - `type`: `"rotating"`.
  - `omega`: `49.873` rad/s, the rotor speed: 476 revolutions a minute, which at a radius of 6 m gives the tip
    Mach number of `IC_1`.
  - `axis`: `[0.0, 0.0, 1.0]`, the rotor shaft, along z.
  - `origin`: `[0.0, 0.0, 0.0]`, a point on the shaft.
  - `moving mesh`: `False`: the mesh stays where it is. Instead, the solver adds to every cell the extra forces a
    turning observer feels, the centrifugal and Coriolis forces.

The frame is valid while the flow is steady in it. A rotor in forward flight, or one interacting with a body that
does not turn with it, sees a flow that changes as it goes round, and needs a moving mesh in a time-accurate run.
See [`transforms`](/reference/model/transforms) and
[Placing and moving a mesh](../guide/working-with/placing-and-moving-a-mesh.md).

##### `boundary conditions`

Assigns a condition to each zone of boundary faces. See
[`boundary conditions`](/reference/model/boundary-conditions) and
[Choosing boundary conditions](../guide/choosing/choosing-boundary-conditions.md).

###### `BC_1`

The blade.

- `zones`: the lower surface, upper surface and tip.
- `type` and `kind`: `"wall"`, `"wall function"`: the air sticks to the blade, and the thin layer next to the
  surface, where the speed drops to zero, is represented by a formula, a wall function, rather than resolved with
  very fine cells. See
  [Choosing a wall model](../guide/choosing/choosing-a-wall-model.md).

###### `BC_2`

The outer boundary.

- `zones`: `farfield`.
- `type` and `kind`: `"farfield"`, `"riemann"`: the outer edge of the domain, far from the rotor. Air can pass in
  and out, and pressure waves leave without bouncing back in.
- `condition`: `"IC_2"`, the still air.

###### `BC_3`

The hub.

- `zones`: `core`.
- `type`: `"symmetry"`: no flow passes through it.

###### `BC_4`

One flat face of the half-cylinder.

The two blades are identical and half a turn apart, so the flow round one blade is a copy of the flow round the
other, turned through 180°. The mesh therefore holds only half the rotor, one blade in a half-cylinder, and two
periodic boundaries join its two flat faces: flow leaving through one comes back in through the other, turned through
180°. Modelling one blade halves the cost of the run.

- `zones`: `periodic2`.
- `type` and `kind`: `"interface"`, `"periodic"`.
- `connection`: `{"boundary": "BC_5"}`, its partner.
- `transform`: the rotation that maps this face onto its partner: `type` `"rotated"`, `theta` 180° in radians,
  about `axis` z through `origin`.

See [Periodic](../guide/choosing/choosing-boundary-conditions.md#periodic).

###### `BC_5`

The other flat face.

- `zones`: `periodic1`.
- `type` and `kind`: `"interface"`, `"periodic"`.
- `connection`: `{"boundary": "BC_4"}`.
- `transform`: the same rotation the other way, `theta` −180°: each side carries the rotation that maps it onto its
  partner, so the two angles are opposite.

## Step 3. Run

1. Activate your environment:

```bash
source ./<ZCFD_INSTALL_PATH>/bin/activate
```

2. Check the control file for errors:

```bash
cd ~/tutorial_7_rotor_in_hover/
validate_input caradonna_tung.py
```

3. Run zCFD in the case directory:

```bash
run_zcfd -c caradonna_tung.py
```

These are extracts from the log of a run of this tutorial, with `...` marking lines left out:

```text
Parameters validated successfully
...
 Reading file caradonna_tung.h5
 Global Mesh Stats: Cells: 447468 Faces: 2529579
...
 Setup periodic boundaries
...
 Dimensional Conditions
 ----------------------
  Pressure:     103037 Pa
  Temperature:  289.75 K
  Density:      1.23905 kg/m^3
  Viscosity:    9.43434e-05 Ns/m^2 @ 289.75 K
  Speed:        299.238 m/s
...
  Mach:         0.877
  Reynolds No:  3.93e+06 @ 289.75 K
...
LU-SGS: rotating-frame Coriolis diagonal enabled (omega = 0.172947, cells = 447468)
...
Starting solve loop
...
Cycle     10 | Step    0 t=0s | CFL   0.155 | MG 1 |   375.3 ms | Total     3.779s
+------------------------------------------------------------------------------------------+
| Report: Cycle 10  Wall time: 3.779s                                                      |
...
| Residuals:                                                                               |
|   rho       1.1218E+02  rhoV[0]   2.6131E+01  rhoV[1]   9.9169E-01  rhoV[2]   2.1170E+01 |
|   rhoE      4.1126E+02  rhok      5.6513E-01  rhoOmega  7.7031E+06                       |
+------------------------------------------------------------------------------------------+
...
 Solve Complete: 1500 cycles in 9m 24.5s (avg 376.4 ms/cycle)
...
zCFD finished: all requested cycles are complete (1500 in total).
```

- The mesh is read and its periodic faces paired.
- The dimensional conditions are those of the reference state, the blade tip: 299 m/s, Mach 0.877.
- The LU-SGS line confirms the rotating frame is active; its `omega` is the control file's 49.873 rad/s in the solver's
  non-dimensional units.
- The CFL number is still ramping up at cycle 10, from 0.1 towards 20.
- The run takes about nine and a half minutes on an NVIDIA RTX 3060.

### Output files

| File                                            | Contents                             |
| ----------------------------------------------- | ------------------------------------ |
| `caradonna_tung.log`                            | the solver log                       |
| `caradonna_tung_status.yaml`                    | the run status                       |
| `caradonna_tung_OUTPUT/rotor/rotor_report.csv`  | residuals and forces every 10 cycles |
| `caradonna_tung_OUTPUT/rotor/rotor.vtkhdf`      | the volume solution                  |
| `caradonna_tung_OUTPUT/rotor/rotor_wall.vtkhdf` | the blade surface solution           |

## Step 4. Monitor

Open the run in zMon to watch the residuals and forces, while it runs or after it has finished:

```bash
zmon caradonna_tung.py
```

[Monitoring a run](../guide/working-with/monitoring-a-run.md) describes each panel. The plots below are the residual
and thrust panels as zMon draws them.

### Residuals

![Residuals of the rotor run against cycle](/images/tutorial-7-plot-residuals.png)

A residual measures how far the current solution is from satisfying one of the equations; as the run converges,
the residuals fall. The mean-flow residuals fall by between three and five and a half orders of magnitude (factors of
a thousand to a few hundred thousand) over the 1500 cycles, and the turbulence residual `rhok` by about four and a
half. The `rhoOmega` residual jumps about throughout and is no guide to convergence here; the thrust is.

### Thrust

The force block is named `blade` and the model `rotor`, so the thrust is in the column `blade_rotor_Thrust`.

![Thrust on the blade against cycle](/images/tutorial-7-plot-thrust.png)

The thrust overshoots as the flow starts up, then settles. It is within 1% of its final value by cycle 1300, and
changes by less than 1% over the last 200 cycles.

## Step 5. Post-process

### Python

First activate your zCFD environment, which provides Python with zutil, h5py and ParaView:

```bash
source <ZCFD_INSTALL_PATH>/bin/activate
```

The pressure coefficient, Cp, compares the pressure at a point on the blade with a reference pressure, divided by the
dynamic pressure, ½ × density × speed², which measures how hard the air is pushing. The experiment refers each
station at radius r to the speed of the blade section there, $\Omega r$, where $\Omega$ is the rotor speed. This script cuts the
blade surface at r/R = 0.80, works out Cp round the section that way, and plots it against the measured values. It
uses ParaView's Python modules to make the cut. Save it as `plot_blade_cp.py` beside the control file:

```python
import matplotlib.pyplot as plt
import numpy as np
import paraview.simple as pvs

from zutil.post import clean_vtk
from zutil.post.post import slice_metric

# Values from the control file
tip_radius = 6.0  # m
omega = 49.873  # rad/s
p_ref = 103037.0  # Pa
rho_ref = p_ref / (287.0 * 289.75)  # kg/m^3, the still air

# The experiment refers Cp to the blade section's own dynamic pressure
radius = 0.80 * tip_radius
q_local = 0.5 * rho_ref * (omega * radius) ** 2

# Cut the blade surface at r/R = 0.80 and read the pressure round the section
wall = clean_vtk(pvs.VTKHDFReader(FileName="caradonna_tung_OUTPUT/rotor/rotor_wall.vtkhdf"))
profile = slice_metric(wall, [0.0, 1.0, 0.0], [0.0, radius, 0.0], "p")

# The measured file stores -Cp against x/c
measured = np.loadtxt("data/cp-0p80.txt", skiprows=1)

fig, ax = plt.subplots(figsize=(8, 4.5))
for block in profile.values():
    cp = (np.asarray(block["p"]) - p_ref) / q_local
    ax.plot(block["chord"], cp, ".", label="zCFD")
ax.plot(measured[:, 0], -measured[:, 1], "o", mfc="none", label="Experiment")
ax.invert_yaxis()
ax.set_xlabel("x/c")
ax.set_ylabel("Cp")
ax.legend()
fig.savefig("blade_cp.png", dpi=200, bbox_inches="tight")
```

and run it:

```bash
python plot_blade_cp.py
```

It writes `blade_cp.png`:

![Pressure coefficient at r/R = 0.80 from zCFD against the experiment](/images/tutorial-7-plot-cp-0p80.png)

Cp is plotted with negative values upwards, as is usual for aerofoils, so the low-pressure upper surface is the top
curve. zCFD follows the experiment closely on the lower surface and in the suction peak near the leading edge.

Adding up the pressure all round each section gives the normal-force coefficient, $C_n$: the force pushing the section
up, relative to its dynamic pressure. The table compares $C_n$ from zCFD with $C_n$ worked out the same way from the
measured pressures:

| r/R  | zCFD | Experiment |
| ---- | ---- | ---------- |
| 0.50 | 0.21 | 0.20       |
| 0.68 | 0.27 | 0.28       |
| 0.80 | 0.33 | 0.30       |
| 0.89 | 0.31 | 0.32       |
| 0.96 | 0.23 | 0.28       |

The loading is predicted to within 0.03 at the inner stations. The station nearest the tip, r/R = 0.96, is furthest
from the experiment. Each blade trails a swirling tip vortex, and the vortex of the blade ahead passes close to this
station. This mesh captures that vortex for only about a quarter turn behind the blade before its cells grow too
coarse, so the tutorial makes no claim for the wake.

### ParaView

::: {.note}
The .vtkhdf output format requires [ParaView 6.1.1](https://www.paraview.org/download/) or later.
:::

Open `caradonna_tung_OUTPUT/rotor/rotor_wall.vtkhdf` in ParaView to see the blade. To colour it by the
pressure coefficient of the experiment, apply a **Calculator** with the expression

```
(p-103037)/(0.5*1.2390*49.873^2*(coordsX^2+coordsY^2))
```

where 1.2390 kg/m³ is the density of the still air. To see both blades, apply a **Transform** that rotates the
surface by 180° about z, and show it alongside the original. The volume solution,
`caradonna_tung_OUTPUT/rotor/rotor.vtkhdf`, holds the velocity, from which a slice through the rotor axis shows the
air driven down through the disc.

![The Caradonna–Tung rotor in hover, coloured by local-section Cp, with the air driven down below it](/images/tutorial-7-rotor-in-hover.png)

:::

## Citations

[^1]:
    Caradonna, F. X. and Tung, C., _Experimental and Analytical Studies of a Model Helicopter Rotor in Hover_,
    NASA TM-81232, 1981.
