---
title: Aeroacoustics (FWH)
section: guide
group: Working with
order: 10
---

# Aeroacoustics (FWH)

A Ffowcs-Williams Hawkings (FWH) solver, which is used for prediction of farfield noise, is included in the zCFD distribution. The zCFD FWH solver uses the [Farassat 1A formulation](https://ntrs.nasa.gov/citations/20070010579), and can accept both permeable and impermeable FWH surfaces.

## What is an FWH solver for?

A common problem in CFD is the prediction of the farfield aerodynamic noise which results from a particular airflow.
Two issues make prediction of farfield aerodynamic noise challenging. First of all, many of the sources of aerodynamic noise (turbulence, vortex shedding etc.) require high fidelity, time accurate simulations and fine CFD meshes to be properly captured. Secondly, a mesh must be very fine and the simulation must have very low numerical dissipation to propagate aerodynamic noise any distance within a CFD mesh.

The first issue of noise simulation can be made tractable by the use of techniques like FRPM (Fast Random Particle Method), but the second issue of far-field mesh requirements for noise propagation means that e.g. predicting the noise from a helicopter main rotor a kilometre away is not feasible using a conventional CFD simulation.

This issue of noise propagation in the far-field is solved by the use of the Ffowcs-Williams Hawkings (FWH) equations. These equations propagate sound to an observer an arbitrary distance away without the use of a mesh which extends all the way to the observer.

## How does an FWH solver work?

To use the FWH equations to propagate noise to a far-field observer, a CFD simulation is run first to record the flow variables ($p(\mathbf{x},t)$, $\rho(\mathbf{x},t)$ and $\mathbf{u}(\mathbf{x},t)$) on an 'FWH surface' in the near-field, noise generating region. Figure 1 shows an FWH surface enclosing the nearfield for a simulation of an aerofoil in a wind tunnel.

![CFD simulation of an aerofoil, including an FWH surface](/images/fwhdiagram_1.svg "Figure 1")

The FWH surface should enclose the noise generating region, and the CFD mesh should be sufficiently fine in the near-field region to propagate noise to the FWH surface without excessive dissipation. Ideally, the FWH surface should not intersect the nearfield region of any wakes.

In some situations, it is sufficient to collect FWH surface data on the wall instead of using a separate FWH surface inside the fluid domain. FWH surfaces coincident with the wall are called _impermeable_ (as opposed to _permeable_) FWH surfaces, and only require $p$ (not $p$, $\rho$ and $\mathbf{u}$) to be recorded.

Once the flow variables have been recorded on the FWH surface, the noise can be propagated to the observers using an FWH solver. To do so, the motion of the FWH surface and observers must be defined in the FWH simulation. The FWH equations assume a quiescent medium (i.e. still air, with a free-stream velocity of zero), which means that the FWH surface and observer motions are frequently different to the motions used in the CFD simulation used to produce the FWH surface data.

In the example of an aerofoil in a wind tunnel, the CFD simulation has a freestream velocity, which does not satisfy the 'quiescent medium' condition. When using an FWH simulation to calculate the noise at the farfield observer microphone in Figure 1, a co-ordinate transformation is therefore required, in which both the FWH surface and the observer microphone are 'flown' forwards through the quiescent medium, as in Figure 2.

![FWH simulation of an aerofoil, with quiescent medium co-ordinate transformation applied](/images/fwhdiagram_2.svg "Figure 2")

Once the FWH surface data has been collected from a CFD simulation and the FWH surface and observer microphone settings have been correctly defined, the FWH equations are used to propagate the pressure and velocity signals from the FWH surface to the farfield observer locations. The equations used in the zCFD FWH solver are the [Farassat 1A equations](https://ntrs.nasa.gov/citations/20070010579), with a retarded time formulation. The retarded time is the time $\tau_*$ at which a sound wave must be emitted by a point on the FWH surface in order for it to reach an observer at time $t$, given the prescribed motions of both surface and observer.

::: {.note}
The [Farassat 1A equations](https://ntrs.nasa.gov/citations/20070010579) used by the zCFD FWH solver are only valid when the FWH surface moves through the quiescent medium subsonically. The retarded time algorithm in the FWH solver will also struggle to converge as the closing speed between an FWH surface and an observer approaches the speed of sound.
:::

## Running the zCFD FWH solver

There are two ways of running the zCFD FWH solver - the [fwh python module](#using-the-zcfd-fwh-python-module) and the [run_fwh utility](#using-the-zcfd-run_fwh-utility). The _fwh python module_ is flexible and intended for advanced users with knowledge of the python programming language. The _run_fwh utility_ is a simpler interface which requires no knowledge of the python programming language and is intended for FWH data generated using _zCFD_.

This documentation actually introduces the _fwh python module_ first, since doing so illustrates some mechanics of FWH solvers which all users should be aware of. The simpler _run_fwh utility_ method is subsequently introduced as an alternative, more automated method to get the same results. For a quick introduction to the zCFD FWH solver which starts with the _run_fwh utility_, see the [FWH tutorial](../../tutorials/4-aeroacoustics-fwh.md).

To use the zCFD FWH solver in either format, FWH surface data must first be generated during a zCFD simulation (see [`output_settings`](/reference/solver/output-settings) for more details). The FWH surface data is stored in a HDF5 format. While no mesh conversion tools are provided, the zCFD FWH file format can easily be interrogated and replicated with tools like `h5ls` and `h5py` should you wish to convert data from other simulation tools to this format.

### Using the zCFD FWH python module

The zCFD FWH solver consists of a series of python modules, which are accessible from within the [zCFD command-line environment](../setting-up/running-zcfd.md#command-line-execution).
Three python dictionaries, controlling the surface, observer, and solver settings, are required as inputs to the `fwh.solve` function.
This function then returns time histories of the pressures at the specified observer points, in the nested dictionaries `pOut` and `tOut`.

```
from solvers import fwh, motion

mySurfaces = { surfaces }
myObservers = { observers }
mySolverSettings = { solverSettings }

pOut,tOut = fwh.solve(mySurfaces, myObservers, solverSettings)
```

For an aerofoil in a wind tunnel (as in Figure 1 and Figure 2), an appropriate python script (including a small amount of post-processing) might look like this:

```python
from solvers import fwh, motion
from matplotlib import pyplot as plt
import json

v = [-50,0,0]
surfaceCentreMotion = motion.ConstantVelocityPoint([0,0,0],v)
surfaceMotion = motion.NonrotatingSurface(surfaceCentreMotion)
obs1Motion = motion.ConstantVelocityPoint([1,0,0],v)
obs2Motion = motion.ConstantVelocityPoint([2,0,0],v)

mySurfaces = {
    "fwhSurf1": {
        "motion": surfaceMotion,
        "fileName": "./zcfdSim_OUTPUT/aerofoil/ACOUSTIC_DATA/fwhsurf1_FWHData.h5"
    }
}
myObservers = {"Obs1": obs1Motion, "Ob2": obs2Motion}
mySolverSettings = { "c": 340, "rho0": 1.2, "p0": 1e5}

pOut,tOut = fwh.solve(mySurfaces,myObservers,solverSettings)

fig,ax = plt.subplots()
ax.plot(tOut["fwhSurf1"]["Obs1"],pOut["fwhSurf1"]["Obs1"],label="Obs1")
ax.plot(tOut["fwhSurf1"]["Obs2"],pOut["fwhSurf1"]["Obs2"],lable="Obs2")
ax.set_xlabel("t (s)")
ax.set_ylabel("p (Pa)")
fig.savefig("./FWH_figure.pdf")

dataForJson = {"p": pOut, "t": tOut}
with open("./FWH_data.json","w") as f:
    json.dump(dataForJson,f)
```

When there is more than one surface, the `pOut` and `tOut` dictionaries will contain a `Surface Summation` entry in addition to the entries for each surface.
This contains, for each observer, a sum of the contributions from each surface. This is useful when noise originates from several distinct regions, each covered by separate FWH surfaces (e.g. UAVs with several propellors).
The `Surface Summation` entry will likely cover a shorter time period than the individual surface entries, because it only covers the time period when the observer is receiving valid noise signals from all of the FWH surfaces.

#### Surfaces dictionary

The zCFD FWH solver is capable of using multiple FWH surfaces in the same FWH calculation. The Surfaces dictionary therefore contains a key-value pair for each FWH surface to be used, where the key is the surface's name (to be used in the FWH solver) and the value is an [individual surface definition dictionary](#individual-surface-definition-dictionary).
The surface name must be a string, and cannot be 'Surface Summation'.

Example usage:

```python
from solvers import motion
v = [-50,0,0]
surfaceCentreMotion = motion.ConstantVelocityPoint([0,0,0],v)
surfaceMotion = motion.NonrotatingSurface(surfaceCentreMotion)

mySurfaces = {
    "fwhSurf1": {
        "motion": surfaceMotion,
        "fileName": "./zcfdSim_OUTPUT/aerofoil/ACOUSTIC_DATA/fwhsurf1_FWHData.h5"
    }
}
```

##### Individual surface definition dictionary

| Keyword                    | Required | Default                                              | Valid values                                      | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| -------------------------- | -------- | ---------------------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 'motion'                   | Yes      |                                                      | A [surface motion class](#surface-motion-classes) | The motion of the surface through the FWH medium                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 'fileName'                 | Yes      |                                                      | A readable file path                              | The FWH surface data, in the FWH HDF5 format outputted by the zCFD solver                                                                                                                                                                                                                                                                                                                                                                                                           |
| 'permeable'                | No       | Automatically deduced from the FWH surface data file | True \| False                                     | Whether or not the surface is permeable or not (see [above](#how-does-an-fwh-solver-work)).                                                                                                                                                                                                                                                                                                                                                                                         |
| 'flipSurfaceNormals'       | No       | False                                                | True \| False                                     | Whether or not to invert the FWH surface normals before running the FWH solver. The surface normals should always point outwards towards the farfield. For FWH surface data generated using the [fwh interpolate](/reference/solver/output-settings#solution-fwh-interpolate) keyword in the zCFD solver, the surface normal direction depends on the .stl file used to define the FWH surface, and can be checked using a visualisation tool (e.g. ParaView).                      |
| 'transformSurfaceVelocity' | No       | True                                                 | True \| False                                     | Relevant for permeable surfaces only, and should normally be kept `True`. Setting this to `False` means that the FWH surface fluid velocity used in the FWH solver does not include the velocity resulting from the motion of the surface (as defined my the 'motion' keyword above). This option may be required when using data from other solvers, in the case where the FWH surface moves through a quiescent medium during the simulation used to create the FWH surface data. |

#### Observers dictionary

The Observers dictionary defines a list of observer microphones at which farfield noise should be calculated. In the observers dictionary, keys are used to set the observer's name in the FWH solver output, and the value sets the motion of the observer. Observer motions must be defined using the [point motion classes](#point-observer-motion-classes).

Example usage:

```python
from solvers import motion
v = [-50,0,0]
obs1Motion = motion.ConstantVelocityPoint([1,0,0],v)
obs2Motion = motion.ConstantVelocityPoint([2,0,0],v)

myObservers = {"Obs1": obs1Motion, "Ob2": obs2Motion}
```

#### Solver settings dictionary

The solver settings dictionary sets the properties of the FWH medium, and the numerical settings used in the FWH solver.

Example usage:

```python
mySolverSettings = { "c": 340, "rho0": 1.2, "p0": 1e5}
```

| Keyword             | Required | Default                                                                                                                                           | Valid values     | Description                                                                                                                                                                                  |
| ------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 'c'                 | Yes      |                                                                                                                                                   | Positive number  | speed of sound in the far-field medium, m/s                                                                                                                                                  |
| 'rho0'              | Yes      |                                                                                                                                                   | Positive number  | density of the far-field medium, kg/s                                                                                                                                                        |
| 'p0'                | Yes      |                                                                                                                                                   | Positive number  | static pressure of the far-field medium, Pa                                                                                                                                                  |
| 'dt'                | No       | set equal to the smallest timestep between outputs in all the FWH surface data files specified in the [surfaces dictionary](#surfaces-dictionary) | Positive number  | timestep between observer microphone recording times, s                                                                                                                                      |
| 'breakTolAbs'       | No       | 'dt' set in the solver settings dictionary / 1000                                                                                                 | Positive number  | the time accuracy (s) required of the prediction of the retarded time $\tau_*$ in the retarded time calculation.                                                                             |
| 'maxIts'            | No       | 50                                                                                                                                                | Positive integer | The maximum number of iterations to use in the algorithm used to predict retarded time                                                                                                       |
| 'observerStartTime' | No       |                                                                                                                                                   | Number           | The simulation time (s) at which observers start recording data. If this is not set, this will be set automatically to be the earliest time when a surface/observer pair has a valid signal. |
| 'observerEndTime'   | No       |                                                                                                                                                   | Number           | The simulation time (s) at which observers end recording data. If this is not set, this will be set automatically to be the last time when a surface/observer pair has a valid signal.       |

#### Point (observer) motion classes

FWH Observers are points which move through the FWH quiescent medium according to the function $x=f(t)$. In the zCFD FWH solver, the motion of observers is defined using one of the following classes, which are available inside the `solvers.motion` module inside the zCFD command line environment (see [above](#running-the-zcfd-fwh-solver)).

| Motion Class                     | Inputs                                                               | Description                                                                    |
| -------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `OriginPoint()`                  |                                                                      | A point which is always on the origin, i.e. $f(t)=[0,0,0]$.                    |
| `StationaryPoint(X0)`            | X0: a 3-d vector $[x0,y0,z0]$                                        | A point which is stationary, i.e. $f(t)=[x0,y0,z0]$.                           |
| `ConstantVelocityPoint(X0,dXdt)` | X0: a 3-d vector $[x0,y0,z0]$; dXdt: a 3-d vector $[dxdt,dydt,dzdt]$ | A point with constant velocity, i.e. $f(t) = [x0+t*dxdt, y0+t*dydt,z0+t*dzdt]$ |

#### Surface motion classes

Just like FWH Observers, FWH Surfaces require their motion to be defined. There are two surface motion classes - NonrotatingSurface and RotatingSurface. Both use a [point motion class](#point-observer-motion-classes) to define the motion of their 'centre point'. In this way, complex motions like that of a propellor which is both rotating and translating through the FWH medium can be defined.

| Motion Class                               | Inputs                                                                                                                       | Description                                                                                                                                                                            |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NonrotatingSurface(centrePoint)`          | centrePoint: a [point motion class](#point-observer-motion-classes)                                                          | A surface which does not rotate, and translates at the same velocity as the 'centrePoint'.                                                                                             |
| `RotatingSurface(centrePoint,axis, omega)` | centrePoint: a [point motion class](#point-observer-motion-classes); axis: a 3-d vector $[ax_x,ax_y,ax_z]$; omega: a number. | A surface which translates at the same velocity as the `centrePoint`, and also rotates about the centrePoint with rotation axis `axis` and rotation angular velocity (rad / s) `omega` |

### Using the zCFD run_fwh utility

When using the [fwh python module](#using-the-zcfd-fwh-python-module) defined above, the FWH [surface](#surfaces-dictionary), [observer](#observers-dictionary) and [solver settings](#solver-settings-dictionary) dictionaries used in `fwh.solve()` are defined by hand. This gives fine-grained control, but for most FWH simulations which are based on zCFD CFD simulations, the input dictionaries to `fwh.solve()` can actually be generated automatically by reading the [zCFD input parameters file](../concepts/how-the-deck-works.md). This is what the `run_fwh` utility does. Within the [zCFD command-line environment](../setting-up/running-zcfd.md#command-line-execution), the `run_fwh` utility can be called as below:

```
run_fwh -c <zcfd control file> --reference_condition <reference condition> --observer_locations <observers .csv file>
```

The `run_fwh` utility reads the [zcfd control file](#zcfd-control-file) and the [observers .csv file](#observer-csv-file), and based on these, automatically runs the FWH solver. Assuming the `zcfd control file` input was `zcfdSim.py` and the `observers .csv file` specified the observers `Obs1` and `Obs2`, the `run_fwh` utility would:

1. automatically generate the inputs to the `fwh.solve()` function, setting the observer and surface motions based on the [reference condition](#reference-condition) and using all FWH surfaces that the CFD simulation defined by `zcfdSim.py` outputs
2. Run the `fwh.solve()` function, saving the screen output to `zcfdSim.fwh.log`
3. Save the sum of the contributions of all FWH surfaces at the observers `Obs1` and `Obs2` to the `.csv` files `zcfdSim.fwh.Obs1.csv` and `zcfdSim.fwh.Obs2.csv` respectively.

For the example outlined in the [fwh python module example](#using-the-zcfd-fwh-python-module), the `run_fwh` command would look something like this:

```bash
run_fwh -c zcfdSim.py --reference_condition IC_1 --observer_locations observers.csv
```

#### zCFD control file

The first input to the `run_fwh` utility is the `zCFD control file`. This is the control file for the zCFD simulation which generated the FWH surface data files which are to be used. For the example outlined in Figure 1 and the [fwh python module example](#using-the-zcfd-fwh-python-module), the `zCFD control file` would be called `zcfdSim.py` and would look something like the example below.

```python
parameters = {
    "config_version": 2,
    "solver": {
        ...
        "reference_conditions": {
            "IC_1": {
                "temperature": 288.0,
                "pressure": 1e5,
                "v": {"vector": [50.0, 0.0, 0.0]},
                ...
            },
        },
        "output_settings": {
            "solution": {
                ...
                "fwh_interpolate": ["fwhsurf1.stl"],
            },
        },
    },
    "model": {
        "aerofoil": {...},
    },
}
```

The `run_fwh` utility reads the zCFD parameter file and finds the paths to all the FWH surface output files which were generated by the zCFD CFD simulation defined by `zcfdSim.py`. In this case, it would find the file `./zcfdSim_OUTPUT/aerofoil/ACOUSTIC_DATA/fwhsurf1_FWHData.h5`.

#### Reference condition

In the [fwh python module example](#using-the-zcfd-fwh-python-module), the solver settings and the motions of the observers and surfaces through the FWH quiescent medium are defined by hand. However, if all the surfaces and observers are in the same _translational reference frame_, the motions and solver settings can be set directly from an entry in zCFD's [`reference_conditions`](/reference/solver/reference-conditions).

Being in the same _translational reference frame_ means that all the surfaces and observers translate through the FWH quiescent medium at the same velocity. In practice, this means that all observers are _static_ in the 'mesh' frame of reference, i.e. do not 'fly by'. Figure 1 and Figure 2 show that for the example, `Obs1`, `Obs2` and the FWH surface are in the same translational reference frame, hence can be used in the `run_fwh` utility.

In the example case, the reference frame would be set to `IC_1`. This is the freestream conditions in the [zcfdSim.py](#zcfd-control-file) CFD simulation. The pressure and temperature in `IC_1` set the `c`, `p0` and `rho0` in the [solverSettings dictionary](#solver-settings-dictionary). The velocity in `IC_1` sets the motion of the surfaces and observers through the FWH quiescent medium. Since `IC_1` defines a freestream velocity of `[50,0,0]`, the surface and observers move through the FWH quiescent medium at a velocity of `[-50,0,0]`, just as in Figure 1 and Figure 2.

In most cases, a zCFD control file already contains a reference condition suitable for `run_fwh`. A control file can hold reference conditions that nothing else uses, so add a suitable one if none exists.

Which _translational reference frame_ an FWH surface is in is independent of whether the FWH surface is rotating or not - see [below](#advanced-use) for more details.

#### Observer .csv file

In the Observers .csv file, the locations of the observers are defined (in the 'mesh fixed' frame of reference). To match the observers shown in Figure 1 and Figure 2, the `observers .csv file` should contain the following:

```
Obs1, 1.0,  0.0,  0.0
Obs2, 2.0,  0.0,  0.0
```

#### Advanced use

The `run_fwh` utility allows and accounts for [overset](overset-meshes.md) zCFD simulations and FWH surfaces which exist in zCFD `rotating fluid zones`. This means that even complex simulations like drones with multiple rotating propellors can be simulated with the `run_fwh` utility.

Where the input [zCFD control file](#zcfd-control-file) is an [overset](overset-meshes.md) 'override' file, FWH surfaces from all control files specified in the override dictionary are used and the reference condition (e.g. `IC_1`) is taken from the first control file specified in the override dictionary. Where FWH surfaces exist in `rotating fluid zones`, the surfaces remain in the same [translational reference frame](#reference-condition) as the observers, but also rotate as specified in the rotating fluid zone specification.

The `run_fwh` utility does not allow translating meshes or translational boundary conditions, since both would introduce ambiguity into what the correct [translational reference frame](#reference-condition) for the FWH surfaces and observers should be. As explained [above](#reference-condition), 'fly-by' observers are also not possible in the `run_fwh` utility.

In the [fwh python module](#using-the-zcfd-fwh-python-module), `fwh.solve()` outputs the contribution from each FWH surface to each observer pressure history, as well as the sum of all contributions. The `run_fwh` utility only records the sum of contributions from all FWH surfaces in the output `.csv` files. This means that in the `run_fwh` utility, every noise source in the zCFD simulation is assumed to be enclosed by a single FWH surface. This means that, for instance, including both `fwh_interpolate` and `fwh_wall_data` FWH surface data output in a zCFD control file is likely to lead to double accounting in the `run_fwh` utility.

Where the `run_fwh` utility is not suitable, it is still possible to use components of the `run_fwh` utility to automate parts of a [fwh python module](#using-the-zcfd-fwh-python-module) workflow. A simplified summary of what happens within the `run_fwh` executable is detailed below, showing the use of the `fwh_helper_functions` which can be used in the `fwh python module` to automate workflows.

```python
from solvers import fwh_helper_functions
rho0, p0, c, freestreamV = fwh_helper_functions.get_zcfd_ref_conditions(
    "zcfdSim.py", "IC_1"
)
surfaces = fwh_helper_functions.get_zcfd_surfaces(
    "zcfdSim.py", freestreamV
)
observers = fwh_helper_functions.get_csv_observers(
    "observers.csv", freestreamV
)
solverSettings = {"rho": rho0, "p0": p0, "c": c}
pOut, tOut = fwh.solve(surfaces, observers, solverSettings)
fwh_helper_functions.write_fwh_data_to_zcfd_csv("zcfdSim.py", tOut, pOut)
```

## FWH file utilities

As well as the FWH solver itself, two FWH file utilities are provided - `writeFWHSurfaceFrequenciesFile` and `writeBlankedOffFWHSurfaceFile`.
Users may find these utilities useful for investigating the sources of noise within their CFD simulation.

### writeFWHSurfaceFrequenciesFile

This python function takes an FWH surface file as input, and creates a file where the FWH surface data can be viewed in the frequency, instead of time, domain.

This can be useful for visually indicating where particular frequencies originate from in an FWH observer pressure signal.
To generate the FWH surface frequencies file, an FFT (using a Hann window) of the FWH data is calculated at each surface face.
The data stored in the surface frequencies file at a particular surface face and chosen frequency is then the magnitude of that FFT's amplitude, at the chosen frequency.
The data can be viewed by opening the `.xdmf` file corresponding to the output file in ParaView - the 'time' chosen in ParaView corresponds to the frequency being viewed.
The data at frequency = 0 corresponds to the time average of the FWH surface data.

Example usage:

```python
from solvers import fileManipulation
fileManipulation.writeFWHSurfaceFrequenciesFile("./myFWHSurface.h5","./myFWHSurface_Frequencies.h5")
```

### writeBlankedOffFWHSurfaceFile

This python function writes a copy of an FWH surface file where specified faces are ignored by the FWH solver.

Sometimes it is useful to 'blank off' certain areas from an FWH surface output file
before the FWH solver is run - for example, if CFD setup constraints mean the noise from that region of the
FWH surface is non-physical and should therefore be ignored when calculating FWH noise data.
This function takes an input FWH surface file, copies it to an output FWH surface file,
then sets to zero the face area of any face in the output file where the python function
shouldBlankOff(x,y,z) returns 'True' for the face's (x,y,z) co-ordinates.
When the face area of a face has been artificially set to 0, that face will not contribute to the observer location pressures
calculated by the FWH solver.
The region which has been set to have 0 face area can be inspected visually by opening the `.xdmf` corresponding to the output file in ParaView

Example usage:

```python
from solvers import fileManipulation

def isPositiveX(x: float, y: float, z: float):
    if x > 0:
        return True
    else:
        return False

fileManipulation.writeBlankedOffFWHSurfaceFile("./myFWHSurface.h5","./myFWHSurface_IgnorePositiveX.h5", isPositiveX)
```
