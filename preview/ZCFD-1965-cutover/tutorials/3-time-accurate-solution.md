---
title: 3 · Time-accurate solution
section: tutorials
order: 30
---

# Time-accurate solution

## Introduction

Following on from executing the steady state simulation of [Steady-state RANS](./2-steady-state-rans.md), this
tutorial will explore the generation of a time accurate result for the unsteady laminar shedding from a 2D
cylinder.

![2D Cylinder](/images/tutorial-3-cylinder.png)

::: {.track when="deck"}

## Step 1. Download the files

You can download the required files [here](https://zcfd.zenotech.com/tutorials/3/cylinder.zip).

## Step 2. Control Dictionary Breakdown

This case uses a similar control dictionary as the previous 30p30n steady state simulation, with the main
difference being the time marching, and output regions of the file.

### Time Marching

To switch to a time accurate simulation, update the _time_settings_ and _convergence_control_ blocks.
In the steady state [Steady-state RANS](./2-steady-state-rans.md) case, _time_settings_ was `{"type": "steady"}`, and all of the pacing lived in _convergence_control_.

An unsteady, time accurate run instead declares a physical time layout on _time_settings_: _'total_time'_ is set
to 1.2, meaning the simulation will be run for a total of 1.2 seconds, and _'time_step'_ is set to 0.002 seconds,
the interval at which the solver steps time forwards. That gives a total of 1.2 / 0.002 = 600 unsteady timesteps
to perform. The _'kind'_ key says _how_ the solver advances between those timesteps - here _"dual time
stepping"_ - and it is this _kind_ that decides whether _convergence_control_ is used at all, since only dual
time stepping (and steady runs) have an inner pseudo-time loop to pace.

```python
"time settings": {
    "type": "unsteady",
    "kind": "dual time stepping",
    "total time": 1.2,
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
```

zCFD uses dual time stepping to advance in real time by first iterating to convergence on an inner steady state
'pseudo time' loop, before advancing the real time cycle. In this case the inner loop is performed using implicit
euler time marching, the number of cycles this inner loop performs is controlled by _'cycles'_. So the in the
example above the inner loop runs at a CFL of 200 for 5 cycles.

The choice of timestep size, and number of cycles per inner loop will have a significant effect on the quality and
cost of the final solution. Using too large a real time step will mean higher frequency unsteady effects are
lost, similarly too few inner cycles will result in unsteady effects being lost. A rule of thumb is to ensure the
residuals converge by at least two orders of magnitude over an inner cycle. On the other hand if too many cycles
or timesteps are performed, the cost of the simulation will quickly increase. Finally the number of cycles to
reach convergence in a pseudo time loop also depends on the step size. Meaning in some cases it is actually
beneficial to run a smaller timestep, to require fewer inner loop iterations.

### Output

The _solution_ dictionary, nested under `output_settings`, is a bit more complicated here than in
[Simple aerofoil](./1-simple-aerofoil.md) or [Steady-state RANS](./2-steady-state-rans.md).

```python
"solution": {
    "format": "vtk",
    "surface variables": ["V", "p", "T", "rho", "cp"],
    "volume variables": ["V", "p", "T", "rho", "m", "cp"],
    "frequency": {
        "volume data": 5,
        "surface data": 5,
        "checkpoint": 20,
    },
},
```

First of all, the _'frequency'_ parameter takes on a different meaning in a time-accurate simulation
([Simple aerofoil](./1-simple-aerofoil.md) and [Steady-state RANS](./2-steady-state-rans.md) are both
steady-state simulations).

In a steady-state simulation, the _'frequency'_ parameter controls how the number of pseudo-time _'cycles'_
between solver outputs. Since only the converged data at the end of a
steady-state simulation is of interest, every time the solver outputs data, it over-writes the previous output data.

Time-accurate simulations are run when the variation of the flow over time is of interest (for example, vortex
shedding), so in the time-accurate solver data outputs are not over-written, and the _'frequency'_ variable
relates to the number of real time steps between outputs, instead of number of pseudo-time cycles between
outputs.

While a single number can be used for _'frequency'_ (e.g. `"frequency": 5`), _'frequency'_ can also be given
as a dictionary for more fine grained control. This is especially relevant in time-accurate simulations, where
frequent data output can not only slow down the simulation but also quickly use up disk space. Generally the
volume data takes longest to output, so for large cases it can be a good idea to output volume data output
infrequently, and instead rely on surface data, [monitor points](/reference/solver/output-settings#report-monitor)
and [volume interpolated data](/reference/solver/output-settings#solution-frequency-volume-interpolate) for high frequency data
collection.

This case is relatively small, and outputs surface and volume data every 5 real time-steps.
Since the _'time step'_ was set to 0.002 seconds, the volume and surface data will therefore be written out every
0.01 seconds of simulated time. _Checkpoint_ data (see
[here](/reference/solver/output-settings#solution-frequency-checkpoint)) is output less frequently.

### Monitor Points

To capture the shedding frequencies of vortices behind the cylinder, a monitor point is placed in
this region to append data to the report file. A monitor point reports the requested output
variables, at the point defined within the flow. These results can be viewed alongside the force report in
zMon or plotted by a post-processing script. Monitor points are keyed on the report itself, so they nest under `monitor`, inside
`report`, inside `output_settings` — `{"output_settings": {"report": {"monitor": {...}}}}`.

```python
"report": {
    "frequency": 5,
    "monitor": {
        "MR_1": {
            "point": [0.25, 1.07, 0.313],
            "variables": ["cp"],
        },
    },
},
```

## Step 3. Running the case

You can run the case as you did for [Simple aerofoil](./1-simple-aerofoil.md), but with the following
**run_zcfd** command:

```bash
run_zcfd -m cylinder.h5 -c cylinder.py
```

## Step 4. Post Processing

### Output report

Open the run in zMon as in the previous tutorials:

```bash
zmon cylinder.py
```

Alternatively, plot the report with a [post-processing script](./1-simple-aerofoil.md#step-5-checking-convergence).

![Residuals](/images/tutorial-3-residuals.png)

zMon's monitor points panel lists the data the monitor point adds to the report. Plotting the pressure trace
[`probe_cp`] should reveal an oscillatory pattern, indicating that the predicted
vortex shedding is indeed occurring. This trace can then be used to calculate the corresponding shedding
frequency.

![Probe location](/images/tutorial-3-probe-cp.png)

### Flow field

The output frequency is set to 5, so the solver writes visualisation data
every 5 real time steps. All timesteps are stored within a single `cylinder.vtkhdf` file in the
_'cylinder_P1_OUTPUT/'_ directory — no separate per-timestep files are created.

Launch ParaView and load _'cylinder_P1_OUTPUT/cylinder.vtkhdf'_. ParaView will render a single solution time step
at a time, and time series data can be navigated using the icons at the top of the screen:

![Probe location](/images/tutorial-3-paraview-time.png)

### Animation

For unsteady data it is often useful to output an animation of the solution. This can be done in ParaView by
either exporting an image per timestep and then using a third party tool to stitch the images into a video or by
saving the animation directly. The advantage of the first approach is that it can easily be scripted and is more
suitable for large cases.
Since this case is small, this tutorial exports an mp4 video directly from ParaView. The steps to do this are:

1. Launch ParaView and load _'cylinder_P1_OUTPUT/cylinder.vtkhdf'_.

2. Set the view up to shade the output by _"cp"_ and zoom/move the image until you are happy with the view:

![Cp shaded](/images/tutorial-3-paraview.png)

3. Select _'File->Save Animation'_ in ParaView. To export as video select your preferred format, the format will
   depend on your Operating System but for Windows you should be able to select "MP4 files" and on Linux "FFMPEG
   AVI". Give the file a name and click OK.
4. On the next screen you can set the target resolution, frame rate and the timesteps to export. Set the Image
   resolution to 1920x1080 (FHD) and the frame rate to 24. To export only the end of the simulation (where the oscillation is established), set the Frame Window from 300 to 600.
5. Click OK to export the animation. This will take some time.

You should now have an exported video of the unsteady simulation.

:::
