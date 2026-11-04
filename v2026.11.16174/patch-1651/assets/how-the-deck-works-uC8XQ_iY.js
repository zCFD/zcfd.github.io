var e=`
# How the deck works

The zCFD control file is a python file that is executed at runtime. This provides a flexible way of specifying key parameters, enabling user defined functions and using the rich array of python libraries available.

The guide uses four names for this file: the control file, the control dictionary, the input deck and the deck. They are interchangeable.

A python dictionary called \`parameters\` provides the main interface to controlling zCFD:

\`\`\`python
parameters = {
    "config_version": 2,
    "solver": {....},
    "model": {....},
}
\`\`\`

\`config_version\` is a required integer identifying the schema the rest of the dictionary is validated against. \`solver\` holds the settings shared across the whole simulation; \`model\` holds one entry per mesh.

zCFD validates the \`parameters\` dictionary at run time against a pydantic schema for each key. Values that should be integers and floats are coerced to the correct type where possible; values that should be strings, booleans, lists or dictionaries raise an error if given the wrong type. Which keys are valid depends on the equation set and solver type chosen. A script is provided to check the validity of a control file before submitting a job \u2014 see [invocation and flags](../../reference/command-line/invocation-and-flags.md#input-validation).

## Required, optional and default keys

Each key in the reference is one of three kinds:

- **Required.** The deck must set it, or validation fails. The reference marks it _required_.
- **Optional, with a default.** Left out, the key takes the default the reference shows, such as \`default 1.4\`.
- **Optional, with no default.** Left out, the feature the key controls is off. The reference shows _not set by default_.

Some keys apply only under other settings: \`gravity\`, for example, applies only to the incompressible solver. The
reference states the condition after _only applies when_. Setting such a key when its condition does not hold fails
validation, and a key that is required only under a condition fails validation when that condition holds and the key
is missing.

The reference documents the keys available in a zCFD control dictionary and the valid values for each.

\`\`\`python
parameters = {
    "config_version": 2,
    "solver": {
        "solver_settings": {...},
        "equations": {...},
        "fluid_properties": {...},
        "reference_conditions": {"IC_1": {...}},
        "initialisation": {...},
        "time_settings": {...},
        "convergence_control": {...},
        "numerical_scheme": {...},
        "output_settings": {
            "report": {...},
            "solution": {...},
        },
    },
    "model": {
        "<mesh_name>": {
            "mesh": "<path.h5>",
            "boundary_conditions": {"BC_1": {...}},
            "fluid_zones": {"FZ_1": {...}},
            "transforms": {...},
        },
    },
}
\`\`\`

- \`solver\`: [\`solver_settings\`](/reference/solver/solver-settings), [\`equations\`](/reference/solver/equations), [\`fluid_properties\`](/reference/solver/fluid-properties), [\`reference_conditions\`](/reference/solver/reference-conditions), [\`initialisation\`](/reference/solver/initialisation), [\`time_settings\`](/reference/solver/time-settings), [\`convergence_control\`](/reference/solver/convergence-control), [\`numerical_scheme\`](/reference/solver/numerical-scheme), [\`output_settings\`](/reference/solver/output-settings) ([\`report\`](/reference/solver/output-settings#report), [\`solution\`](/reference/solver/output-settings#solution))
- \`model\`: [\`mesh\`](/reference/model#mesh), [\`boundary_conditions\`](/reference/model/boundary-conditions), [\`fluid_zones\`](/reference/model/fluid-zones), [\`transforms\`](/reference/model/transforms)

## Settings for one mesh

Four solver blocks may also be set inside a mesh's entry: \`initialisation\`, \`convergence_control\`, \`numerical_scheme\` and \`output_settings\`. A mesh's block lists only what differs on that mesh; everything it leaves out comes from the solver's block of the same name.

\`\`\`python
"model": {
    "rotor": {
        "mesh": "rotor.h5",
        "boundary_conditions": {"BC_1": {...}},
        "numerical_scheme": {"order": "first"},
    },
},
\`\`\`

Here the rotor mesh runs at first order and keeps every other numerical scheme setting from the solver's block. A mesh that leaves a block out uses the solver's block as it stands.

- Settings merge one by one, at every depth.
- A list, such as the variables to write, replaces the solver's list whole.
- Named forces, monitors and mass flow reports are added to the solver's.
- A sub-block that chooses a different kind, through its \`name\`, \`type\` or \`kind\`, replaces the solver's sub-block whole. A time scheme with a different \`name\` keeps none of the solver's scheme settings.
- The incompressible coupling scheme governs the whole run, so a mesh cannot set it.

A mistake in a setting the mesh inherits is reported once, at the solver's block. A mistake in a setting the mesh writes is reported at the mesh, even when the solver's block repeats it. When the deck of a running case is edited, a change that a mesh inherits is logged once, against the solver.
`;export{e as default};