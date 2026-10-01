var e=`
# Simple aerofoil

## What is in this tutorial?

The NACA0012 is a symmetrical aerofoil which is commonly used for code validation. In this configuration it is a
quick and simple simulation to run. By downloading the tutorial bundle and following the instructions below, you
should learn to run, post-process and visualise a simple zCFD simulation. This is a small simulation which most
users should be able to run on a laptop in ~5 minutes.

## What you need?

To run the tutorial you will need an installation of zCFD and a valid licence (the free licence is sufficient for
this tutorial). For instructions on installing zCFD please see [installation and licensing](../guide/setting-up/installation-and-licensing.md).

The tutorial assumes that you are running all commands using a bash shell on Linux.

::: {.track when="deck"}

## Step 1. Download the files

The tutorial zip file can be downloaded [here](https://zcfd.zenotech.com/tutorials/1/naca0012.zip). The zip file
contains a mesh file (_naca0012.h5_) and a zCFD control file (_naca0012.py_).

This tutorial will assume you unzip the file in a directory called "zcfd_tutorial_1" in your users home directory.

\`\`\`bash
cd ~
mkdir zcfd_tutorial_1
wget https://zcfd.zenotech.com/tutorials/1/naca0012.zip
unzip naca0012.zip
\`\`\`

## Step 2. Review Control file

_naca0012.py_ is the zCFD control file. When zCFD runs, it reads the control file and uses the Python
dictionary \`parameters\` to set the solver settings. Control files declare \`"config_version": 2\`, and nest their
settings under a top-level \`solver\` key (numerics, physics and output settings shared by the whole simulation) and
a \`model\` key (one entry per mesh, holding that mesh's boundary conditions). A brief overview of the parameters
dictionary for the simulation is given below; for a more detailed description of the control file structure, see
[how the deck works](../guide/concepts/how-the-deck-works.md).

\`\`\`python
parameters = {
    "config_version": 2,
    "solver": {
        "equations": {
            "type": "rans",
            "turbulence": {"model": "sst"},
        },
        "numerical scheme": {
            "order": "euler_second",
            "inviscid flux scheme": "roe",
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
        "solver settings": {"type": "compressible"},
        "initialisation": {"initial conditions": "IC_1", "restart": False},
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
                "surface variables": ["V","p","mach","cp","cf","pressureforce","frictionforce"],
                "volume variables":  ["V", "p", "T", "rho", "mach", "cp", "eddy"],
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

### Time marching

The physical time layout and the pacing of the iterative solve are described by two sibling keys under \`solver\`:
\`time_settings\`, which describes the physical time layout (steady or unsteady), and \`convergence_control\`, which
paces the iterative solve. Keeping them separate means each one only has to say one thing: \`time_settings\` says
_what kind of run this is_, and \`convergence_control\` says _how quickly to march towards convergence_.

\`"time settings": {"type": "steady"}\` declares a steady simulation outright, as an explicit, first-class
declaration. Steady simulations assume that the simulated flow does not vary with time. Most real flows
are not truly 'steady', but steady simulations tend to be much easier and cheaper to run than unsteady
simulations. For an attached, streamlined flow like this one using a steady simulation is reasonable when
time-resolved data is not required.

CFD simulations work by iteration: the solver starts with a very rough estimate of the flow $f(x, 0)$, then during the
first 'iteration cycle' the solver uses $f(x, 0)$ to create a better approximation of the flow, $f(x,1)$. This is
repeated many times, using $f(x,1)$ to calculate $f(x,2)$, $f(x,2)$ to calculate $f(x,3)$ and so on, until
the estimate of the flow is good enough.

The flow will generally change very quickly in the first few iterations, and then converge asymptotically on the
'right' answer. The [cycles](/reference/solver/convergence-control#cycles) parameter, part of
\`convergence_control\`, states how many iterations should be used in the simulation - the higher it is the more
accurate the solution is likely to be, but given the convergence is asymptotic setting it too high will lead to
lots of computational effort being used for very little change in the solution towards the end.

The [scheme](/reference/solver/convergence-control#scheme) defines the numerical scheme used by the solver to get
from $f(x,n)$ to $f(x,n+1)$. The \`implicit euler\` scheme is a sensible choice to use for this type of simulation.

The [CFL](/reference/solver/convergence-control#cfl) essentially sets how much the flow is allowed to change
between $f(x,n)$ and $f(x,n+1)$ approximations of the flow field - if it is set too high the simulation will not
converge, and if it is set too low the simulation will take many cycles reach the appropriate flow. \`cfl ramp\` is
a list of ramps, run in order; the single one here grows the CFL each cycle, from \`initial\` by a factor of
\`factor\`, so early cycles - where the flow field is a poor approximation of the true solution - take a cautiously
small step, while later cycles converge faster.

### Equations

The [equations](/reference/solver/equations) block sets the type of flow being simulated. There are a number
of different options, depending on the assumptions made about the flow. \`rans\` is used to simulate a
compressible flow, including the effects of turbulence on the mean flow by use of a turbulence
equation. The \`turbulence\` sub-dictionary sets the turbulence model used.

How the flow is spatially discretised - its \`order\` of accuracy and its inviscid flux scheme - is a separate
concern from _what_ is being solved, so those settings live in their own \`numerical_scheme\` block, alongside
\`equations\`.

### IC_1

Now that the numerical settings have been defined, the flow needs to have boundary conditions. Boundary
conditions define what happens at exterior faces of the mesh. In this case, there are three boundary conditions.

The first boundary condition is that of the freestream air, which is at a temperature of 300 K, a
pressure of 101325 Pa and flows parallel to the mesh's x axis at a Mach number of 0.15. The \`IC_1\` entry in
\`reference_conditions\` defines a flow at these conditions.

Because the RANS equations include the effect of viscosity, the viscosity at the \`IC_1\`
flow condition must also be defined (in this case, it is set to $1.02145 {\\times}10^{-5}\\ \\mathrm{kg\\  m^{-1}\\ s^{-1}}$ at 300 K).
This corresponds to a chord based Reynolds number of 6 million. Because the RANS equations include turbulence
modelling, the \`turbulence_intensity\` and \`eddy_viscosity_ratio\` are also set. These are used as boundary
conditions for the SST turbulence model equations. The values given are sensible values for flows without
significant freestream turbulence.

\`IC_1\` also doubles as the initial guess for the flow field: \`"initialisation": {"initial conditions": "IC_1"}\`
tells the solver that at 0 cycles the entirety of the flow should be initialised to the \`IC_1\` conditions. Stating
this explicitly starts to matter once more than one reference condition is in play (see
[Steady-state RANS](./2-steady-state-rans.md)).

### BC_1

The \`BC_1\` entry assigns the \`IC_1\` flow condition to all mesh faces contained in the mesh zone \`1\` (note the
plural \`zones\` key - a boundary condition can span more than one mesh zone). Mesh zones are defined during the
meshing process, and in this case mesh zone \`1\` contains all the mesh faces which are on the farfield exterior
surface of the mesh. The \`farfield\` type means that flow can pass freely through the specified mesh faces, and the
\`riemann\` kind means that flow can pass both in and out of the mesh via the specified mesh faces.

### BC_2

The \`BC_2\` entry assigns a no-slip wall boundary condition to all mesh faces contained in the mesh zone \`4\`. Mesh
zone \`4\`, in this case, contains all faces on the aerofoil surface. Note the \`kind\` is written \`"no slip"\`, with a
space.

### BC_3

The \`BC_3\` entry assigns a symmetry boundary condition to all mesh faces contained in mesh zones \`2\` and \`3\`,
which are the +ve z and -ve z faces of the mesh. This boundary condition type is used here to
simulate an aerofoil of effectively infinite span, but with a low mesh resolution in the z axis to reduce
simulation cost.

### Report

The \`report\` sub-dictionary, nested under \`output_settings\`, defines which flow statistics zCFD should output to
the user during the simulation, and how often. The 'frequency' key here defines that zCFD should report flow
statistics to the user every 10 iteration cycles during the simulation. Exactly which flow statistics are
outputted can be changed by the user, but the defaults are enough to monitor the
convergence of the solution. The 'forces' sub-dictionary monitors the forces on specific mesh zones:
here, the forces on mesh zone 4, which is the aerofoil surface.
Some of the flow statistics (e.g. force on the aerofoil wall) are non-dimensionalised (see
[here](/reference/solver/output-settings#report)) against the reference condition named in \`initialisation\`'s
\`reference\` key. That key defaults to whichever condition \`initial_conditions\` names when it is left unset, which
here is \`IC_1\`, the freestream state - so there is nothing extra to write here.

### Write Output

The final part of \`output_settings\`, the \`solution\` sub-dictionary, defines which variables should be outputted
into VTK HDF format (.vtkhdf) for visualisation by the user at the end of the simulation.

## Step 3. Running zCFD

To run zCFD you first need to source the "activate" script and then use the "run_zcfd" path.

1. Activating your environment:

\`\`\`bash
source ./<ZCFD_INSTALL_PATH>/bin/activate
\`\`\`

2. Run zCFD validate input to check the control dictionary for errors:

\`\`\`bash
cd ~/zcfd_tutorial_1/
validate_input naca0012.py -m naca0012.h5
\`\`\`

3. Run zCFD in the case directory:

\`\`\`bash
run_zcfd -m naca0012.h5 -c naca0012.py
\`\`\`

zCFD will attempt to detect the number of CPU cores and any GPUs present and make use of them. If you want to
manually configure this see [invocation and flags](/reference/command-line/invocation-and-flags).

As the solver is running it will output information about the current CFL, Multigrid level, timing, reporting
information and file I/O. The output from zCFD will be written to the screen and also to a log file
"naca0012.log".

To watch the residuals and the wall forces converge while the solver runs, open the control file in zMon, as
described in [Monitoring a run](../guide/working-with/monitoring-a-run.md).

![zCFD Output](/images/tutorial-1-zcfd-output.png)

zCFD will run for the 1500 \`cycles\` specified in the control dictionary, if you want to stop the solver early then
you can either press CTRL+C to kill the process or update the \`cycles\` keyword to be a value smaller than the
current cycle number, zCFD will detect this change and stop the solver.

The solver should take a few minutes to complete on a modern GPU, and a bit longer on a CPU.

## Step 4. Review the output

A successful zCFD run creates the following files and directories. They are named after the control file,
\`naca0012.py\`, and each model's output is named after its key under \`model\`, which in this deck is also
\`naca0012\`.

| File/Directory                                    | Description                                                                                                                                             |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| naca0012.log                                      | A copy of the output to screen during the run.                                                                                                          |
| \`naca0012_status.yaml\`                            | A YAML file recording how the run was started: the zCFD version, the date, the control file, the mesh and its checksum, and the nodes and devices used. |
| naca0012_report.ipynb                             | An auto-generated Jupyter notebook that plots the report file against cycle number.                                                                     |
| naca0012_OUTPUT/naca0012/naca0012_report.csv      | A .csv format table which shows the variation of flow statistics with cycle number.                                                                     |
| naca0012_OUTPUT/naca0012/naca0012_results.h5      | The checkpoint: the flow solution in zCFD format, used to restart the run.                                                                              |
| naca0012_OUTPUT/naca0012/naca0012.vtkhdf          | A VTK HDF file containing the volume data from the simulation, for visualisation.                                                                       |
| naca0012_OUTPUT/naca0012/naca0012_wall.vtkhdf etc | One VTK HDF file for each boundary condition type, containing the surface data for that boundary condition.                                             |
| naca0012_OUTPUT/LOGGING/                          | A separate log for each MPI rank, used for debugging.                                                                                                   |

The status file is described in [The status file](../guide/setting-up/running-zcfd.md#the-status-file).

## Step 5. Checking convergence

Open the run in zMon to see its residuals and forces, while it runs or after it has finished:

\`\`\`bash
. ./<ZCFD_INSTALL_PATH>/bin/activate
cd ~/zcfd_tutorial_1/
zmon naca0012.py
\`\`\`

A browser opens on the zMon dashboard; [Monitoring a run](../guide/working-with/monitoring-a-run.md) describes each
panel.

A short Python script makes the same plots and can post-process a case automatically, for example at the end of a
batch job. Save this as \`naca0012_post.py\` beside the control file:

\`\`\`python
import matplotlib.pyplot as plt

from zutil.fileutils import get_zcfd_result

result = get_zcfd_result("naca0012.py")
report = result.report.data
prefix = result.force_prefix()

fig, ax = plt.subplots()
for variable in ["rho", "rhoV[0]", "rhoV[1]", "rhoV[2]", "rhoE", "rhok", "rhoOmega"]:
    ax.semilogy(report["Cycle"], report[variable], label=variable)
ax.set_xlabel("Cycle")
ax.legend()
fig.savefig("naca0012_residuals.png", dpi=200)

fig, ax = plt.subplots()
ax.plot(report["Cycle"], report[f"{prefix}_Fx"], label="x force")
ax.plot(report["Cycle"], report[f"{prefix}_Fz"], label="z force")
ax.set_xlabel("Cycle")
ax.legend()
fig.savefig("naca0012_forces.png", dpi=200)
\`\`\`

and run it in the activated environment:

\`\`\`bash
python naca0012_post.py
\`\`\`

[Batch post-processing with Python scripts](../guide/working-with/post-processing-and-visualisation.md#batch-post-processing-with-python-scripts)
lists what \`get_zcfd_result\` provides.

### Residuals

The residual variables essentially measure how close to a stable solution of the chosen flow equations (e.g. the
RANS equations) the simulation is. There is a residual for each flow variable, and the lower the residual, the
more converged the flow solution is.

![zCFD Output](/images/tutorial-1-plot-1.png)

As would be expected (note the logarithmic y axis), the residuals drop very quickly in the first couple of
hundred iterations as the flow quickly develops from the initial condition (which in this case, is the freestream
condition everywhere). After that, the flow residuals (\`rho\`, \`rhoV[0]\`, \`rhoV[1]\`, \`rhoV[2]\` and \`rhoE\`)
residuals continue to drop, while the turbulence residuals (\`rhok\` and \`rhoOmega\`) drop initially before
flatlining / increasing.

This behaviour is common - the turbulence equations can take a while to react to changes in the flow field, and
the initial guess for the turbulence equations is often poorer than the initial conditions for the flow field. A
combination of the fact that the flow residuals have dropped several orders of magnitude over the simulation
history and the fact that the residuals are in effect flat from 20,000 cycles onwards show
that the simulation is sufficiently converged.

### Forces

In the forces panel, show the x and z forces. Given this is a symmetrical aerofoil run at 0 angle of attack, the x
force corresponds to drag and the z force corresponds to lift. The lift should be zero and the drag positive.

![zCFD Output](/images/tutorial-1-plot-2.png)

The force plots tell a similar story to the residuals - there are initially large oscillations as the flow
settles down, before the force traces essentially flatline from 1200 cycles onwards.

### Plotting performance

\`\`\`python
r.plot_performance()
\`\`\`

Finally, the \`plot_performance()\` method plots the time used per cycle. The last cycle is
particularly long because it is the only cycle where the flow solution is written to a file. If an implicit
solver is used, \`plot_performance()\` will also attempt to plot the memory usage per cycle.

## Step 6. Looking at results with ParaView

ParaView is a general purpose visualisation tool that is the recommended way of post processing zCFD results.
Please see [ParaView.org](https://www.paraview.org) for download and installation instructions.

::: {.note}
The .vtkhdf output format requires [ParaView 6.1.1](https://www.paraview.org/download/) or later.
:::

### Loading your data

As mentioned above a "naca0012_OUTPUT/naca0012" folder has been generated, and contains a ".vtkhdf" file
(naca0012.vtkhdf). This is a single VTK HDF file containing all of the volume output data, making it easy to load
into ParaView.

After opening ParaView, click the "Open" icon shown below or go into File>Open or press Ctrl+O. Locate
the directory in which you have stored your data and open naca0012.vtkhdf.

![File open menu in ParaView](/images/tutorial-1-figure-1.png)

Once the file is correctly loaded in ParaView, the "Pipeline Browser" on the left of your screen should look like
this:

![ParaView Pipeline](/images/tutorial-1-figure-2.png)

Now you need to click "Apply", which will lead to the following layout:

![ParaView after loading pvd file](/images/tutorial-1-figure-3.png)

You may need to use the 'set view direction to +ve y' button:

![Set view direction to +ve y](/images/tutorial-1-figure-17.png)

### Visualising Variables

By default, ParaView shows the "cellvolume" variable. This shows that the mesh is refined near the centre of the mesh, where the airfoil is. This is common practice, as capturing the flow around a body is more
demanding than doing so in the free-stream. Naturally, having a very fine mesh over the entire fluid domain would make the problem computationally expensive.

Other variables can be selected and shown using the following scrolling menu:

![Variables drop down](/images/tutorial-1-figure-4.png)

Let's observe the pressure coefficient around the airfoil. To do so, use the scrolling menu and select the "cp"
variable.

::: {.note}
The pressure coefficient is given by the following formula
$C_p = \\frac{p-p_{\\infty }}{\\frac{1}{2}\\rho _{\\infty }V_{\\infty }^2}$
:::

This gives the following (you will need to zoom in substantially to the centre of the mesh before you can clearly
see the airfoil):

![Pressure around airfoil](/images/tutorial-1-figure-5.png)

You can change the colormap used by ParaView by clicking on the "Edit Color Map" icon:

![Edit Color Map](/images/tutorial-1-figure-6a.png)

and then the "Choose Preset" icon:

![Colour map icon](/images/tutorial-1-figure-6.png)

Here are the same results shown using different colormaps:

![Jet](/images/tutorial-1-figure-7.png)

![Cool to warm (extended)](/images/tutorial-1-figure-8.png)

These steps give a qualitative view of the solution. More advanced
analysis is also feasible. A common result in aerodynamics, especially around an airfoil, is the plot of the
pressure coefficient along the chord.

### Pressure Coefficient Plot

Open the "naca0012_wall.vtkhdf" file. Naturally, the resulting image looks different from the previous as this
only contains the zones where a "wall" boundary condition has been defined, which in this case happens to be
the airfoil itself.

![Wall.vtkhdf](/images/tutorial-1-figure-9.png)

It is usually of interest to have a plot showing the pressure coefficient on the upper and the lower surface,
therefore it is necessary to extract the data separately for each face of the airfoil. The upper and lower
surfaces of the airfoil then need to be separated.

To this end, the "Clip" filter has to be used. To use it, right-click on the "naca0012_wall.vtkhdf" object in the
Pipeline Browser, select Add Filter -> Alphabetical -> Clip. The properties of the "Clip" filter are displayed on
the left. Firstly, untick the "Invert" option and then you should set them to the following combination:

![Clip parameters](/images/tutorial-1-figure-10.png)

By default, this will "remove" the lower surface of the airfoil, leaving the following shape:

![Airfoil upper surface](/images/tutorial-1-figure-11.png)

::: {.note}
To remove the upper surface instead, tick the "Invert" option in the "Clip" filter's properties.
:::

Next, take a "Slice" of the remaining surface. To do so, follow the same procedure as for the "Clip"
filter but select the "Slice" filter instead. When prompted, set the properties of the filter to be as follows:

![Slice parameters](/images/tutorial-1-figure-12.png)

You should end up with this:

![Upper airfoil slice](/images/tutorial-1-figure-13.png)

Then the data should be converted from "cell data" to "point data". This is done by using the
"CellDatatoPointData" filter. Access by right-clicking on the "Slice" object selecting "Add filters".

Once this is done, a plot can be produced in ParaView using the "PlotOnSortedLines" filter. Right-click on the
"CellDatatoPointData1" object created previously and add the "PlotOnSortedLines" filter. A plot should appear on
the right. You can select the variables to plot in the "Properties -> Series Parameters" window, as well as
changing the settings of the axis.
Select the "cp" variable in "Series Parameters', and use 'Points_X' as the 'X Array Name'. Untick 'Show Legend',
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

Now, this procedure can be repeated for the lower surface of the airfoil. A pressure coefficient plot can then be
made for validation purposes.

:::
`;export{e as default};