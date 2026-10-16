---
title: Converting an older control file
section: guide
group: Concepts
order: 25
---

# Converting an older control file

A control file written for an earlier release of zCFD does not carry `"config_version": 2` in its `parameters` dictionary. Such a file is rejected at start-up, and by `validate_input`. The message names the command that converts it, `update_input`.

The converter reads the old file and writes a new one in the current format. It does not change the original, and it does not run on the solver's start-up path.

## Running the converter

```bash
update_input wing.py --mesh wing.h5
```

The `--mesh` option is optional, but the draft is more complete with it. The mesh supplies three things:

- the name of the model, taken from the file name, so that the model is labelled `wing`;
- the path to the mesh, set as `"mesh": "wing.h5"`. An absolute path is written as given. A relative path is written relative to the converted file when the mesh lies in or below its directory, and as an absolute path otherwise;
- the zone lists for any boundary condition that the old file gives only as a type code, for which the converter reads the zone numbers of that type from the mesh.

Without a mesh, the model name, the mesh path and each such boundary condition are left for you to decide.

## What the converter writes

Two files appear beside the original:

- `wing_v2.py`, the converted control file;
- `wing_v2.conversion.md`, a report of every decision the converter made.

The `parameters` dictionary is rewritten, together with the `def` line of each function it uses. Everything else in the file is kept as written: imports, function bodies, constants and comments. A name used inside the dictionary, such as a time step held in a variable, stays a name in the converted file.

zCFD calls every function in the deck with keyword arguments only. The converter therefore gives each function a `def` line that names those keywords after a `*`. A mesh deformation function becomes:

```python file=wing.py
def bend(x, y, z):
    return (x, y, z + 0.01 * x * x)
```

```python file=wing_v2.py
def bend(*, location):
    x, y, z = location
    return (x, y, z + 0.01 * x * x)
```

The rest of the body is unchanged. The report gives each function's old and new `def` line once, with every key that uses it, and what the body returns where the converter can tell. A body that still returns an older `{"v1": x, "v2": y, "v3": z}` dict needs no change, since that form is still accepted.

Where the arguments cannot be matched to the keywords with certainty, or other code in the file calls the function, the function is left as written and becomes a DECIDE item that gives the `def` line to write and the value to return, such as `rewrite bend as def bend(*, location), returning the deformed position as three numbers`. Rewrite the `def` line and the body, then replace the placeholder with the function's name. [Python functions in the deck](../setting-up/python-functions-in-the-deck.md) lists what each function receives and returns.

A translation function has no counterpart, since a mesh's motion is not a function. The converter writes a translating `motion` in the model's `transforms`. Where the older file moved the mesh, it sets `"moving mesh": True` and leaves a DECIDE item asking for the `velocity` and the `ramp time`: if the body starts from rest with a linear rise, give the full velocity and the seconds it takes to reach it. Any other profile cannot be expressed. Where the older file did not move the mesh, it sets `"moving mesh": False`, and the DECIDE item asks for the fixed `velocity`. See [Placing and moving a mesh](../working-with/placing-and-moving-a-mesh.md).

## Reading the summary

When it finishes, the converter prints a summary. The figures below are illustrative.

```text
$ update_input wing.py --mesh wing.h5
Converting wing.py (config_version 0) to config_version 2

  moved       41 keys
  re-spelled   3 values
  dropped      2 keys   (units: always SI · material: one fluid_properties block)
  DECIDE       2 keys

  1. time marching > scheme > name = "runge kutta", with an unsteady block
     Choose time settings > kind: "dual time stepping" (pseudo-time loop
     each step) or "global timestepping" (explicit march).
  2. BC_3 > ref = 3, with no zone list
     ...

Wrote wing_v2.py (draft: 2 decisions open; replace each DECIDE string)
Wrote wing_v2.conversion.md (every key and where it went)
```

Each key in the original file receives exactly one of four dispositions.

- **Moved.** The key keeps its name and its value, and appears at its new place in the dictionary.
- **Re-spelled.** The key or its value is written differently in the current format, with the same meaning.
- **Dropped.** The current format has no use for the key. The report gives a one-sentence reason for each. The solver always works in SI units, for example, so `units` is dropped.
- **DECIDE.** The converter cannot choose on the engineer's behalf. The draft holds a placeholder string, and the report explains the choice.

The report lists every key under its disposition. It is the reference for anything the summary shows only as a count.

## Clearing the DECIDE items

A DECIDE item appears in the draft as a string that names the choice:

```python file=wing_v2.py
"time_settings": {
    "type": "unsteady",
    "kind": "DECIDE: 'dual time stepping' or 'global timestepping' (see conversion report, item 1)",
    ...
}
```

The draft will not run as intended until each one is replaced. Most such strings fail validation, but one that stands in for free text, such as the mesh file name, does not. Validate the draft, and search it for the remaining strings:

```bash
validate_input wing_v2.py
grep -n DECIDE wing_v2.py
```

Each validation error names one open item and the key that holds it. Take the item to the report, read the explanation, replace the string with the value chosen, and validate again. Repeat until the file validates and no DECIDE string remains. An item for a function can leave no string in the file, so work through every numbered item in the report, not only those that the search finds.

For the item above, the two options are as follows.

- `"dual time stepping"` advances physical time in steps, and iterates in pseudo-time within each step until it converges. It suits an unsteady flow that must be time-accurate.
- `"global timestepping"` marches physical time directly, with one update per step and no inner iteration. It suits a flow in which the cost of inner iterations is not justified.

Having chosen, enter the value in place of the placeholder:

```python file=wing_v2.py
"time_settings": {
    "type": "unsteady",
    "kind": "dual time stepping",
    ...
}
```

See [Choosing a time marching scheme](../choosing/choosing-a-time-marching-scheme.md) for the choice between the schemes.

## When the original file has errors

The converter first checks the original file against the rules of the release that it was written for. If the file fails, the converter stops and lists the errors. A converted file would carry the faults across.

A file that the original names but that cannot be read from where the converter runs, such as the results of the run to restart from or a field file, does not stop the conversion. The report lists it among its notes. Make sure it is in place before the run.

Correct the original and run the converter again. To convert the file regardless, add `--ignore-legacy-errors`:

```bash
update_input wing.py --mesh wing.h5 --ignore-legacy-errors
```

The errors then remain in the draft, and may appear again as DECIDE items or as validation errors.

## Converting an overset group

An older overset case is run from a file such as `override.py`, which pairs each mesh with its own control file:

```python file=override.py
override = {
    "mesh_case_pair": [
        ("background.h5", "background.py"),
        ("rotor.h5", "rotor.py"),
    ]
}
```

Convert the group, not the files it lists:

```bash
update_input override.py
```

The result is a single control file, `override_v2.py`, with its report beside it. Each pair becomes one model, named after its control file and set to run on its mesh, so the example gives the models `background` and `rotor`. The files the group lists are read but not rewritten. The group names its own meshes, so `--mesh` is not used.

The converter then sorts the settings.

- A setting that every model gives the same value is written once, in `solver`.
- Initialisation, convergence control, the numerical scheme and the output settings may differ from model to model. A block that every model shares is written once, in `solver`. Otherwise every model carries its own block in full, and `solver` holds the settings of the most common block that every model's block also sets. The coupling scheme of an incompressible run is the exception: it holds for the whole run, and is treated as below.
- Any other setting holds for the whole run. Where the models give it different values, it becomes a DECIDE item, and the report lists the value each model gave.
- A sponge layer, or extra overset layers, set in a file that every model shares is applied only to the models that have a farfield or an overset boundary respectively.

Values are written out as numbers in the new file, because each old file's own variables are not carried across. A function is copied into the new file when it needs nothing from its old file except imported modules. Where the old `def` line cannot take the keywords zCFD calls it with, the copy has a keyword-only `def` line in its place. Any other function becomes a DECIDE item: copy it into the new file and write its name in place of the placeholder.

## Before running the converted file

Validation shows that the file is well formed. It does not show that the simulation is unchanged. Compare the physics of the converted file with the original before submitting a job.

- Read the dropped keys in the report. Each reason should agree with the intended simulation.
- Check every decision made at a DECIDE item against the intent of the original case.
- Confirm the reference conditions, the boundary conditions and the time settings against the original file.

::: {.note}
If a file converted without `--ignore-legacy-errors` has no DECIDE items and fails validation, the fault lies in the converter, not in the file. The command exits with an error and asks for the file to be reported to Zenotech.
:::
