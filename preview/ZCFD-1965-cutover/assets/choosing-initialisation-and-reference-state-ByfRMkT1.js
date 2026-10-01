var e=`
# Choosing initialisation and reference state

Which named flow state fills the field at the start, which one non-dimensionalises the results, and when should a run
restart instead?

Define each flow state once, as a named entry of \`reference_conditions\`, and refer to it by name wherever it is used.
Name the state that fills the field in \`initial_conditions\`. Leave \`reference\` out unless the results must be
non-dimensionalised against a different state; it then follows \`initial_conditions\`. Where a solution already exists,
restart from it instead: on the same mesh with \`restart\`, and on a different mesh with \`interpolate_restart\` as well.

| Role                                   | Set by                                                                      | Where                         | If left out                                 |
| -------------------------------------- | --------------------------------------------------------------------------- | ----------------------------- | ------------------------------------------- |
| fill the flow field at the start       | [\`initial_conditions\`](/reference/solver/initialisation#initial-conditions) | \`initialisation\`              | a validation error, unless \`restart\` is set |
| non-dimensionalise the force reporting | [\`reference\`](/reference/solver/initialisation#reference)                   | \`initialisation\`              | the name given in \`initial_conditions\`      |
| set the flow entering or leaving       | \`condition\` on a farfield, \`reference\` on an inflow or outflow              | the boundary condition        | \u2014                                           |
| continue from an earlier solution      | [\`restart\`](/reference/solver/initialisation#restart)                       | \`initialisation\`, or per mesh | a fresh start                               |

## Reference conditions

A reference-condition entry defines a fluid state. The entries sit in the
[\`reference_conditions\`](/reference/solver/reference-conditions) dictionary under \`solver\`, each keyed by a name,
conventionally \`IC_1\`, \`IC_2\` and so on:

\`\`\`python
parameters["solver"]["reference_conditions"] = {
    "IC_1": {....},
    "IC_2": {....},
}
\`\`\`

The same dictionary, and the same shape of entry, serves three roles; there is no structural split between the
initial condition and a reference condition:

- [\`initial_conditions\`](#initial-state) in \`initialisation\` names the entry that fills the flow field at the start of
  the simulation. There is no default such as \`IC_1\`: the entry must be named.
- [\`reference\`](#reference-state) in \`initialisation\` names the entry that non-dimensionalises the force reporting.
- A boundary condition names the entry that sets the flow entering or leaving the domain: a farfield through
  \`condition\`, and an inflow or outflow through \`reference\` (see [boundary conditions](choosing-boundary-conditions.md)).

Each entry is validated against a model chosen by \`{"equations": {"type": ...}}\`. An \`euler\` entry rejects the
viscosity and turbulence keys outright, a \`viscous\` entry adds viscosity, and a \`rans\` or \`les\` entry adds the full
turbulence set. The routing is automatic: the deck supplies the keys relevant to its equation type, and the schema
picks the model.

One entry can inherit from another by naming the base entry in a \`reference\` key of its own. The inheritance is
resolved before validation: the keys are merged and overridden, and \`reference\` is then discarded, so it never reaches
the solver. This is how a lean, ratio-only entry, used for boundary conditions specified relative to a base flow
state, is written without repeating every key. See
[\`total_pressure_ratio\`](/reference/solver/reference-conditions#total-pressure-ratio) and its siblings for the
ratio keys available on every entry.

An initial condition can also be prescribed by a
[driving function](../setting-up/python-functions-in-the-deck.md#driven-initial-condition): a Python callable that
returns a reference-condition dictionary when evaluated. When \`initial_conditions\` is a callable, \`reference\` must name
a static entry for the non-dimensionalisation.

\`\`\`python
parameters["solver"]["reference_conditions"] = {
    "IC_1": {
        "v": {
            "vector": [1.0, 0.0, 0.0],
            "mach": 0.15,
        },
        "pressure": 101325.0,
        "temperature": 273.15,
        "reynolds_no": 6.0e6,
        "reference_length": 1.0,
        "turbulence_intensity": 5.2e-2,
        "eddy_viscosity_ratio": 1.0,
        "ambient_turbulence_intensity": 5.2e-2,
        "ambient_eddy_viscosity_ratio": 1.0,
    },
}
\`\`\`

## Initial state

\`\`\`python
parameters["solver"]["initialisation"] = {
    "initial_conditions": "IC_1",
}
\`\`\`

[\`initial_conditions\`](/reference/solver/initialisation#initial-conditions) names the entry of \`reference_conditions\`
that provides the initial flow field. If a Python callable is given instead of a name, it is called to provide the
initial flow variables (see the
[driving function](../setting-up/python-functions-in-the-deck.md#driven-initial-condition) form), and \`reference\`
must then be set explicitly (see [Reference state](#reference-state)).

::: {.note}
There is no implicit fallback. \`initial_conditions\` must be set, to a name or a callable, unless \`restart\` is \`True\`;
leaving it out of a fresh run is a validation error.
:::

Any mesh in the \`model\` block can override the solver-level initialisation and restart settings with an
\`initialisation\` dictionary of its own. This is useful in a multi-mesh case, an overset case for example, where only
one mesh should restart, or where the meshes start from different named conditions:

\`\`\`python
parameters["model"]["wing"]["initialisation"] = {
    "initial_conditions": "IC_1",
    "restart": True,
}
\`\`\`

## Reference state

\`\`\`python
parameters["solver"]["initialisation"] = {
    "reference": "IC_1",
    "initial_conditions": "IC_1",
}
\`\`\`

[\`reference\`](/reference/solver/initialisation#reference) names the reference condition that provides the reference
quantities for the non-dimensionalisation of the force reporting. The name must be an entry defined in
\`reference_conditions\`.

Left out, \`reference\` falls back to the name given in \`initial_conditions\`. It must be set explicitly when
\`initial_conditions\` is a Python callable, a
[driving function](../setting-up/python-functions-in-the-deck.md#driven-initial-condition), since a callable has no
static name to fall back on; a missing \`reference\` is then a validation error, not a silent default.

If the initial condition has zero velocity, as in a quiescent cavity, set \`reference\` to a different reference
condition that carries the physical velocity and Reynolds number, so that the solver has something non-zero to
non-dimensionalise against.

## Velocity

Velocity is given in one of two ways: as a bare vector, or as a vector and a Mach number. With a Mach number, the
vector gives the direction, and the magnitude is computed from the Mach number and the speed of sound at the given
pressure and temperature.

A velocity of 50 mesh units per second in the x direction:

\`\`\`python
..
"v": {"vector": [50.0, 0.0, 0.0]}
..
\`\`\`

A velocity of Mach 0.2 in the x direction:

\`\`\`python
..
"v": {"vector": [1.0, 0.0, 0.0], "mach": 0.2}
..
\`\`\`

## Viscosity

The dynamic viscosity, also called the shear, absolute or molecular viscosity, is defined at the static temperature of
the entry. It is given either as a dimensional quantity or through a Reynolds number and a reference length. Both
forms are valid only for the \`viscous\`, \`rans\` and \`les\` equation types; leave both out for \`euler\`.

\`\`\`python
"viscosity": 1.83e-5,
\`\`\`

or

\`\`\`python
"reynolds_no": 5.0e6,
"reference_length": 1.0,
\`\`\`

The Reynolds number is defined as

$$
Re = \\frac{\\rho V L_{ref}}{\\mu}
$$

with $\\rho$ the density, $V$ the velocity, $L_{ref}$ the reference length and $\\mu$ the viscosity. Exactly one of
[\`reynolds_no\`](/reference/solver/reference-conditions#reynolds-no) and
[\`viscosity\`](/reference/solver/reference-conditions#viscosity) must be set; setting both, or neither, is a validation
error.

## Turbulence intensity and eddy viscosity

Turbulence intensity is the ratio of the velocity fluctuations $u'$ to the mean flow velocity. An intensity of 1 per
cent is considered low, and one above 10 per cent high. The keys below apply to the \`rans\` and \`les\` equation types,
and are not valid for \`euler\` or \`viscous\`.
[\`turbulence_intensity\`](/reference/solver/reference-conditions#turbulence-intensity) defaults to 0.01 and
[\`eddy_viscosity_ratio\`](/reference/solver/reference-conditions#eddy-viscosity-ratio) to 0.1.

\`\`\`python
"turbulence_intensity": 0.01,
"ambient_turbulence_intensity": 0.01,
\`\`\`

Both intensities are given as fractions. The ambient keys set the level at which the turbulence is sustained.

The eddy viscosity ratio, $\\mu_t/\\mu$, depends on the type of flow. For external flows it varies from 0.1 to 1, and in
a wind tunnel from 1 to 10.

For internal flows it depends more strongly on the Reynolds number, since the largest eddies are limited by the
characteristic lengths of the geometry, such as the height of a channel or the diameter of a pipe. Typical values are:

| Re   | 3000 | 5000 | 10,000 | 15,000 | 20,000 | > 100,000 |
| ---- | ---- | ---- | ------ | ------ | ------ | --------- |
| eddy | 11.6 | 16.5 | 26.7   | 34.0   | 50.1   | 100       |

\`\`\`python
"eddy_viscosity_ratio": 0.1,
"ambient_eddy_viscosity_ratio": 0.1,
\`\`\`

Both ambient keys, [\`ambient_turbulence_intensity\`](/reference/solver/reference-conditions#ambient-turbulence-intensity)
and [\`ambient_eddy_viscosity_ratio\`](/reference/solver/reference-conditions#ambient-eddy-viscosity-ratio), default to
1.0e-20: a near-zero numerical floor, not the freestream value. They do not fall back to the freestream turbulence
level; to sustain the ambient level at the freestream value, set them explicitly to the same values:

\`\`\`python
"reference_conditions": {
    "IC_1": {
        ..
        "turbulence_intensity": 5.2e-2,
        "eddy_viscosity_ratio": 1.0,
        "ambient_turbulence_intensity": 5.2e-2,
        "ambient_eddy_viscosity_ratio": 1.0,
    }
},
\`\`\`

## Velocity profile

A reference condition can also carry a [\`profile\`](/reference/solver/reference-conditions#profile): the variation of
the flow state near a boundary, read from a file or given as an atmospheric boundary layer.

### field

The file named by [\`field\`](/reference/solver/reference-conditions#profile-field) is in the ParaView/VTK VTP format.
It contains a node array with one or more of the array names \`'Pressure'\`, \`'Temperature'\`, \`'Velocity'\`, \`'TI'\` and
\`'EddyViscosity'\`. zCFD looks up those values in the solution by finding the nearest point in the file.
[\`use_wall_distance\`](/reference/solver/reference-conditions#profile-use-wall-distance) localises the field by wall
distance rather than by the z coordinate.

\`\`\`python
..
"profile": {
    "field": "inflow_field.vtp",
    "use_wall_distance": True,
},
..
\`\`\`

::: {.note}
The field overrides the conditions given elsewhere in the entry, so the entry need specify only the conditions that
differ from the default.
:::

### ABL

An atmospheric boundary layer profile is set on a reference-condition entry as
[\`abl\`](/reference/solver/reference-conditions#profile-abl) in its \`profile\`:

\`\`\`json
{ "profile": { "abl": { "roughness_length": 0.1, "friction_velocity": 0.5 } } }
\`\`\`

[\`ground_level\`](/reference/solver/reference-conditions#profile-abl-ground-level) is the canonical spelling; \`z0\` is
also accepted, and normalised to \`ground_level\`. [\`up\`](/reference/solver/reference-conditions#profile-abl-up) is a
vertical direction vector of its own, independent of the gravity vector set on the fluid model.

::: {.note}
\`surface_layer_height\`, \`monin_obukhov_length\`, \`tke\`, \`up\` and \`ground_level\` are accepted only when the solver is
compressible, or when \`{"solver_settings": {"type": ...}}\` is unset. The incompressible inflow boundary reads only
\`roughness_length\` and \`friction_velocity\` from the profile, so setting any of the other five on an incompressible deck
is a validation error rather than a setting that would silently have no effect.
:::

#### roughness_length

[\`roughness_length\`](/reference/solver/reference-conditions#profile-abl-roughness-length) is a measure of the height
at which the mean wind speed falls to zero, through the friction between the air and the surface.

It is usually written $z_0$. It is the height above the surface at which the logarithmic wind profile, extrapolated
downwards, reaches zero speed. The logarithmic profile describes the variation of wind speed with height in the
atmospheric boundary layer.

The roughness length depends on the surface and on the objects on it. Forests, urban areas and bodies of water have
different roughness lengths: smooth open water has a small one, and a densely forested area a larger one.

The wall boundary of the mesh is taken to lie at the height of the roughness length rather than at ground level, so
the first cell should not be smaller than the roughness length.

#### friction_velocity

The friction velocity, [\`friction_velocity\`](/reference/solver/reference-conditions#profile-abl-friction-velocity),
usually written $u_\\star$ and read 'u-star', is the characteristic velocity of the turbulent motion in the surface
layer of the atmosphere, generated by the shear stress between the air and the surface. It is the square root of the
shear stress divided by the air density:

$$
u_\\star = \\sqrt{\\frac{\\tau}{\\rho}}
$$

where $u_\\star$ is the friction velocity, $\\tau$ the shear stress between the air and the surface, and $\\rho$ the
density of the air.

The shear stress arises from the transfer of momentum between the moving air and the roughness elements of the
surface. It is related to the wind speed and the roughness length through the logarithmic wind profile,

$$
u(z) = \\frac{u_\\star}{\\kappa} \\ln{\\frac{z}{z_0}}
$$

where $u(z)$ is the wind speed at height $z$ above the surface, $\\kappa$ the von K\u00e1rm\u00e1n constant, approximately 0.4,
and $z_0$ the roughness length.

The friction velocity measures the intensity of the turbulence near the surface. It bears on heat and moisture
exchange, on the dispersion of pollutants and on the structure of the boundary layer. Its magnitude depends on the
surface roughness, the wind speed and the atmospheric stability, among other factors.

#### surface_layer_height

The surface layer is the lowest part of the atmospheric boundary layer, in which the wind speed, temperature, humidity
and turbulence are governed by the surface beneath, and in which the logarithmic profile holds. Its height is usually
estimated from empirical relationships or from the atmospheric stability. It can range from a few metres to a few
hundred metres, depending on the roughness length, the wind speed and the stability, and it changes through the day
with daytime heating and night-time cooling.

In zCFD, [\`surface_layer_height\`](/reference/solver/reference-conditions#profile-abl-surface-layer-height) caps the
profile: above it, the profile holds the value it reaches there. With the SST model, a surface layer height left
unset while \`friction_velocity\` is given is taken as the height at which the logarithmic profile reaches the reference
speed, $z_0 \\exp(\\kappa U_{ref}/u_\\star)$; a \`friction_velocity\` left unset is derived from the surface layer height in
the same way.

#### monin_obukhov_length

The Monin\u2013Obukhov length,
[\`monin_obukhov_length\`](/reference/solver/reference-conditions#profile-abl-monin-obukhov-length), usually written
$L$, characterises the stability of the air near the surface. It is named after A. S. Monin and A. M. Obukhov, whose
work founded the similarity theory of the surface layer.

It is formed from the friction velocity and the surface buoyancy flux:

$$
L = -\\frac{u_\\star^3 \\, \\theta_v}{\\kappa \\, g \\, \\overline{w'\\theta_v'}}
$$

where $L$ is the Monin\u2013Obukhov length, $u_\\star$ the friction velocity, $\\theta_v$ the virtual potential temperature,
$\\kappa$ the von K\u00e1rm\u00e1n constant, approximately 0.4, $g$ the acceleration due to gravity, and $\\overline{w'\\theta_v'}$
the vertical flux of virtual potential temperature.

$L$ measures the balance between the mechanical production of turbulence by wind shear and its buoyant production or
suppression by vertical temperature gradients; $|L|$ is roughly the height above which buoyancy matters as much as
shear. Positive values indicate stable conditions, and negative values unstable ones. A neutral atmosphere, with no
buoyancy flux, corresponds to $|L| \\rightarrow \\infty$. $L = 0$ is rejected as an input value; leave the key out for
neutral stability.

The Monin\u2013Obukhov length bears on the structure of the turbulence, on heat and moisture exchange and on the dispersion
of pollutants. It plays a large part in the behaviour of the atmospheric boundary layer, including the vertical mixing
of air and the development of turbulence. It depends on the surface properties, the wind speed, and the gradients of
temperature and humidity.

## Restart

A restart loads a solution from a previous run and continues the solver from that point. By default the solver looks
for a \`<casename>_results.h5\` file to restart from; [\`restart_casename\`](/reference/solver/initialisation#restart-casename)
names a different case. [\`restart_ignore_history\`](/reference/solver/initialisation#restart-ignore-history) set to
\`True\` begins the simulation from that results file while ignoring its cycle history.

The default restart assumes the same mesh. A solution from another mesh is mapped onto the new one with
[\`interpolate_restart\`](/reference/solver/initialisation#interpolate-restart). This requires both
[\`restart_meshname\`](/reference/solver/initialisation#restart-meshname) and \`restart_casename\`, and the schema enforces
the pairing at validation rather than leaving a missing name to fail later, during the solve.

The restart settings sit in \`initialisation\`, as the global default, and a mesh can override them in its own
\`initialisation\`. [\`solution_smooth_cycles\`](/reference/solver/solver-settings#solution-smooth-cycles) is a system
setting rather than a restart one, and sits separately in \`solver_settings\`:

\`\`\`json
{ "solver_settings": { "solution_smooth_cycles": 0 } }
\`\`\`

A restart from the previous solution of the case \`cylinder_steady_start_init\`:

\`\`\`python
parameters["solver"]["initialisation"] = {
    "initial_conditions": "IC_1",
    "restart": True,
    "restart_casename": "cylinder_steady_start_init",
}
\`\`\`

A restart from a previous solution on a different mesh:

\`\`\`python
parameters["solver"]["initialisation"] = {
    "initial_conditions": "IC_1",
    "restart": True,
    "interpolate_restart": True,
    "restart_meshname": "different_mesh",
}
parameters["solver"]["solver_settings"]["solution_smooth_cycles"] = 0
\`\`\`

### Restarting on a different number of tasks

A restart appends to the VTKHDF output it finds rather than replacing it, so a restarted case continues one time
series instead of starting a second. That holds only while the partition count is unchanged. A VTKHDF series stores
its sizes as one entry per partition per step, so a run appending at a different task count cannot extend the series,
and the earlier output would in practice be lost.

When a restart is about to run on a different number of tasks from the solution it restarts from, the \`.vtkhdf\` files
already in the output directory are therefore moved into a subdirectory named for the partition count that produced
them, before the solver opens its output:

\`\`\`text
plate_coarse_OUTPUT/background/P2/background.vtkhdf
plate_coarse_OUTPUT/background/P2/background_wall.vtkhdf
\`\`\`

The new run then starts its own series at the new count, and the old output stays where it is, and readable. The log
reports the move:

\`\`\`text
Restarting from a solution generated on 2 partition(s) with 1 task(s):
moved 4 VTKHDF file(s) aside so the existing output is not written over.
plate_coarse_OUTPUT/background/P2
\`\`\`

The archive follows these rules:

- Only the case's own output directory is swept. With \`restart_casename\` naming another case, that case's output is
  left alone, since this run does not write into it.
- Each file is labelled from its own recorded partition count, so output left by an earlier run of the same case at a
  third count is labelled correctly, not by the restart source's count.
- A file already written at the new task count is left in place, so a restart on the same number of tasks extends its
  series as usual.
- Passing through the same count twice, as in 2, then 1, then 2, then 1, archives into \`P2\` and then \`P2.1\`; an
  existing archive is never written over.
- The archive is a subdirectory of the model directory, which post-processing does not look inside: \`zutil\` finds
  models one level below \`<case>_OUTPUT\` and lists output non-recursively. An archive is therefore never mistaken for a
  mesh, nor picked up as live output.
- Checkpoint (\`_results.h5\`) and report files are not moved. Only \`.vtkhdf\` output is affected.

### Advanced restart

The SA-neg solver can restart from results generated by the Menter SST solver, and the SST solver from SA-neg results;
by default the turbulence fields are reset to zero. An approximate SA-neg field cannot be generated from SST results
from a control file, since the turbulence schema has no key for it.

## Reference entries

- [\`reference_conditions\`](/reference/solver/reference-conditions), with
  [\`v\`](/reference/solver/reference-conditions#v), [\`reynolds_no\`](/reference/solver/reference-conditions#reynolds-no),
  [\`viscosity\`](/reference/solver/reference-conditions#viscosity) and
  [\`profile\`](/reference/solver/reference-conditions#profile)
- [\`initialisation\`](/reference/solver/initialisation):
  [\`initial_conditions\`](/reference/solver/initialisation#initial-conditions),
  [\`reference\`](/reference/solver/initialisation#reference), [\`restart\`](/reference/solver/initialisation#restart) and
  [\`interpolate_restart\`](/reference/solver/initialisation#interpolate-restart)
`;export{e as default};