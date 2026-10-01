var e=`
# Steady-state RANS

[Simple aerofoil](./1-simple-aerofoil.md) showed how to run a case in zCFD and visualise the results. This
tutorial uses a more complex case to show more of the features of the solver: the 30P30N aerofoil, which is a 2D multi element aerofoil, developed as an acoustic benchmark case
[[1]](#citations). The geometry of this case can be seen below:

![30P 30N](/images/tutorial-2-30p30n.png)

The first step is a steady state RANS solution.

::: {.track when="deck"}

## Step 1. Download the files

The required meshes and control dictionary can be found [here](https://zcfd.zenotech.com/tutorials/2/30p30n_tutorial_2.zip).
The case has 64,000 cells, and will run in less than 10 minutes on an NVIDIA RTX 3060 GPU.

This case is run as a steady state simulation, using an implicit time marching scheme. The Reynolds Averaged
Navier-Stokes equations are solved using Menter's SST turbulence model with wall functions.

## Step 2. Control Dictionary Breakdown

The setup for this case is very similar to the previous NACA0012 cases, but the control dictionary does feature
some extra terms which can be useful for a more streamlined workflow. As in
[Simple aerofoil](./1-simple-aerofoil.md), settings are nested under a top-level \`solver\` key and a \`model\` key,
one entry per mesh.

### Reference variables

At the top of the control file, the key variables for the case - Reynolds number, Mach number, temperature etc...
are all hard coded, and then referred to later in the script. In cases where you might want to run many
simulations with slightly different values to change, this can be an effective way to ensure consistency with
variables. Additionally this allows implicit values such as the reference velocity, and freestream Mach to be
calculated automatically in the script.

\`\`\`python
# create variables to assign main experimental parameters
reynolds = 1.71e6
mach = 0.17
T = 295.56
p = 101325
R = 287.6
gamma = 1.4
reference_length = 0.457
alpha = 5.5

# calculate implicit values
rho = p / (R * T)
U = math.sqrt(gamma * R * T) * mach

# assign each mesh zone to a boundary
wall = [6]
symmetry = [4,5]
farfield =[7]
\`\`\`

### Scale

In this case a scaling is applied to convert the size of the mesh. The .h5 mesh file was generated with units of
inches, whereas the flow conditions are specified in SI units, therefore a scaling of 0.0254 is applied to
convert the mesh into metres. The z (spanwise) direction has been scaled to be 1 metre wide. The mesh has only a
single cell in the z direction so no spanwise flow is expected - making the z extent of the mesh 1 metre means that the forces and moments reported by zCFD will already be per unit span.

Mesh scaling is a property of a specific mesh, so it is set under that mesh's own entry in \`model\`, in a
\`transforms\` sub-dictionary.

\`\`\`python
# scale the mesh to match the experimental data
"transforms": {"scale": [0.0254, 0.0254, 0.0254 / 0.127]},
\`\`\`

### Inflow vector

This case simulates the aerofoil at an angle of attack of 4 degrees. Rather than rotating
the mesh, it is easier to rotate the inflow vector relative to the mesh, an example of a Galilean transformation.
The \`zutil\` function \`vector_from_angle()\` calculates the inflow vector given an x-z angle of attack, x-y angle of
attack and flow speed.

\`\`\`python
"IC_1": {
    "temperature": T,
    "pressure": p,
    "v": {
        # calculate the inflow vector based on the angle of attack
        "vector": zutil.vector_from_angle(0.0, alpha, U),
    },
    "reynolds no": reynolds,
    "reference length": reference_length,
    "turbulence intensity": 0.01,
    "eddy viscosity ratio": 0.1,
    "ambient turbulence intensity": 1e-20,
    "ambient eddy viscosity ratio": 1e-20,
},
\`\`\`

### Transform

The lift and drag forces acting on a body are defined relative to the freestream flow, lift normal and drag
parallel. Where the relative inflow vector has been rotated to a specific angle of attack, it is also
useful to rotate the force report by the same vector. The transformed forces will appear as Ft\\_ terms in the
report file.

\`\`\`python
# define a function to rotate the output forces by the angle of attack
def my_transform(x,y,z):
    v = [x,y,z]
    v =  zutil.rotate_vector(v,0.0,alpha)
    return {'v1' : v[0], 'v2' : v[1], 'v3' : v[2]}
\`\`\`

## Step 3. Running the case

You can run the case as you did for [Simple aerofoil](./1-simple-aerofoil.md), but with the following
**run_zcfd** command:

\`\`\`bash
run_zcfd -m 30p30n_coarse.h5 -c 30p30n_steady.py
\`\`\`

## Step 4. Monitoring convergence

Open the case in zMon to follow the residuals for the continuity, momentum and energy equations, and those of the
turbulence model, as the solver runs:

\`\`\`bash
zmon 30p30n_steady.py
\`\`\`

The plots update as the solver appends to 30p30n_steady_report.csv. The same plots can be made after the run, or
automatically, with a [post-processing script](./1-simple-aerofoil.md#step-5-checking-convergence) as in the first tutorial.

![Convergence](/images/tutorial-2-figure-1.png)

You will notice that case is set to run for 1000 cycles but looking at the plots, it looks like the residuals are
still converging. The next step restarts the solver from where it finished and runs on for another 1000 cycles.

### Performing a restart

To restart the solver, update the _'restart'_ parameter, which lives under \`initialisation\` (nested
under \`solver\`) \u2014 \`{"solver": {"initialisation": {"restart": True}}}\`. If this is set to _False_ the solver will
always perform a fresh start, if it is _True_ then a results file will be read in and the solve will start based
on the data in that file. To enable the restart edit _30p30n_steady.py_ and change restart to _True_. You will
also need to update _'cycles'_ to 2000 - since this is a steady simulation, \`cycles\` lives under
\`convergence_control\` (nested under \`solver\`) \u2014 \`{"solver": {"convergence_control": {"cycles": 2000}}}\`.

\`\`\`python
parameters["solver"]["initialisation"]["restart"] = True
parameters["solver"]["convergence control"]["cycles"] = 2000
\`\`\`

By default zCFD will look for a results file with the same name as the current case file, appended with
'\\_results.h5'. Here it looks for "30p30n_steady_results.h5". When you have edited the control
dictionary, restart the simulation again using the same **run_zcfd** command:

\`\`\`bash
run_zcfd -m 30p30n_coarse.h5 -c 30p30n_steady.py
\`\`\`

zMon follows the restarted run, which appends to the same report. Once the solver has finished, the residuals
look converged:

![Convergence](/images/tutorial-2-figure-1a.png)

## Step 5. Plotting force convergence

The force convergence history of interest is that of the x and y forces, transformed by the
inflow vector, so the wall_Ftx and wall_Fty series in zMon's forces panel are of interest.

![Forces Ftx](/images/tutorial-2-figure-2.png)

![Forces Fty](/images/tutorial-2-figure-3.png)

Which show reasonable agreement with experimental results, and additionally that the forces are at least nearing
convergence. The grid for this case is still extremely coarse, accounting for the differences in lift and drag
coefficients.

## Step 6. ParaView

Opening ParaView, and loading in the \`30p30n_steady_wall.vtkhdf\` results will allow you to view the aerofoil
surface results:

![30p30n C_p shaded](/images/tutorial-2-figure-4.png)

To get a continuous plot of cp against x/c you need to use a plot over sorted lines filter. To do this:

1. On the surface data apply a _'cell data to point data'_ filter.
2. On the _cell data to point data_ apply a _'slice'_ filter, ensuring the slice uses a z normal, and is centred
   through the middle of the aerofoil
3. On the _slice_ data apply a _'plot on sorted lines'_ filter and click apply. This will then bring up a new
   _'line graph'_ view.
4. Ensure all 3 segments are selected in the composite data set dialogue box, then ensure only the cp variables
   are selected in the series parameters. Finally for the X Array name, select _'Points_X'_
5. Modify the style and markers until you are happy with the result.

![cp against x/c](/images/tutorial-2-figure-5.png)

:::

## Citations

1. Zhang, Yufei & Chen, Haixin & Wang, Kan & Wang, Meng. (2017). Aeroacoustic Prediction of a Multi-Element
   Airfoil Using Wall-Modeled Large-Eddy Simulation. AIAA Journal. 55. 1-15. 10.2514/1.J055853.
`;export{e as default};