---
title: Placing and moving a mesh
section: guide
group: Working with
order: 27
---

# Placing and moving a mesh

Every mesh is placed and moved by one block: the [`transforms`](/reference/model/transforms) of its model entry. It
holds three settings. `scale` converts the units of the mesh file, `transform` puts the mesh where it belongs in the
case, and `motion` describes how it moves, or the frame its flow is solved in, during the run. Each is optional.

## The order of operations

The coordinates of every node pass through the three settings in a fixed order:

```text
x_file ──scale──▶ x_m ──transform──▶ x_placed ──motion(t)──▶ x(t)
```

1. `scale` multiplies the coordinates read from the mesh file, so that they are in metres.
2. `transform` is applied once, when the mesh is read, to the scaled coordinates. A translation in a `transform` matrix
   is therefore in metres, whatever the units of the file.
3. `motion` acts on the placed mesh. Its `axis`, `origin` and `velocity` are given in placed coordinates: the
   position of the mesh in the case, after `scale` and `transform`.

A rotor whose mesh was built about the origin in inches, and placed 2 m along x, therefore turns about an `origin` of
`[2.0, 0.0, 0.0]`, not about the origin of its mesh file.

## Keys

| Key                                                                          | Value                                                                  | Effect                                                                                                                                                              |
| ---------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`scale`](/reference/model/transforms#scale)                                 | three positive numbers, default `[1, 1, 1]`                            | Multiplies the x, y and z coordinates of the mesh file, for example to convert inches to metres.                                                                    |
| [`transform`](/reference/model/transforms#transform)                         | a 4 × 4 matrix, or a function of `location` that returns three numbers | Places the scaled mesh, once, when it is read.                                                                                                                      |
| [`motion`](/reference/model/transforms#motion)                               | a settings block                                                       | Rigid motion of the placed mesh, or the frame its flow is solved in.                                                                                                |
| `motion` › [`type`](/reference/model/transforms/motion#type)                 | `rotating` or `translating`                                            | The kind of motion.                                                                                                                                                 |
| `motion` › [`axis`](/reference/model/transforms/motion#axis)                 | a vector                                                               | Rotating only. The axis of rotation, in placed coordinates.                                                                                                         |
| `motion` › [`origin`](/reference/model/transforms/motion#origin)             | a point                                                                | Rotating only. A point on the axis, in placed coordinates.                                                                                                          |
| `motion` › [`omega`](/reference/model/transforms/motion#omega)               | rad/s                                                                  | Rotating only. The rate, positive right-handed about `axis`.                                                                                                        |
| `motion` › [`velocity`](/reference/model/transforms/motion#velocity)         | m/s, three numbers                                                     | Translating only. The full velocity.                                                                                                                                |
| `motion` › [`moving mesh`](/reference/model/transforms/motion#moving-mesh)   | `True` or `False`, default `False`                                     | `True` moves the nodes through an unsteady run. `False` keeps the mesh still and solves its flow in the moving frame, the multiple reference frame (MRF) treatment. |
| `motion` › [`ramp time`](/reference/model/transforms/motion#ramp-time)       | seconds                                                                | A moving mesh rises linearly from rest to its full rate over this time.                                                                                             |
| `motion` › [`rotate nodes`](/reference/model/transforms/motion#rotate-nodes) | `True` or `False`, default `False`                                     | Rotates the nodes of a rotating moving mesh every time step, instead of carrying the rotation as an angle.                                                          |

## Which settings go together

Validation applies these rules and names the setting and its remedy when a deck breaks one.

- A mesh may carry one `motion`.
- `"moving mesh": True` requires an unsteady compressible run and an overset or sliding interface on that mesh. A
  steady rotor, or any motion in the incompressible solver, is written with `"moving mesh": False`.
- `ramp time` is allowed only with `"moving mesh": True`. A frame runs at its full rate from the first cycle.
- `rotate nodes` is allowed only on a rotating motion with `"moving mesh": True`. A frame never moves the nodes.
- `transform` is either a matrix or a function. A function is called once during validation with a representative
  location, and must return three numbers.

A motion, moving mesh or frame, always covers the whole mesh. A region that moves on its own, such as a fan inside a
duct, is either a mesh of its own, joined to the rest by a [sliding](../choosing/choosing-boundary-conditions.md#sliding)
or [overset](overset-meshes.md) interface and carrying its own `motion`, or, when it turns steadily, a set of cell
zones solved in a rotating frame by a [`rotating` fluid zone](../choosing/choosing-a-fluid-zone-model.md#rotating-zones).
A model with a rotating fluid zone carries no `motion` and no overset or sliding interface. A wall's
[`velocity`](../choosing/choosing-boundary-conditions.md#wall) turns or slides that surface without moving the mesh.

A moving mesh and a frame differ in what the solver integrates. A moving mesh is advanced to its new position every
real time step, and every overset mapping or sliding intersection that involves it is recomputed. A frame leaves the
mesh where it is and adds the Coriolis and centrifugal sources of a rotating frame, or the velocity of a translating
one, to every cell. The incompressible solver applies the frame velocity at every cell and face but adds no Coriolis or
centrifugal source.

## Examples

### A rotor

An overset cylinder, placed at y = 1.2 m and z = 1.2 m, turning about its own axis at 104.72 rad/s. The `origin` is the
placed centre of the cylinder:

```python
parameters["model"]["cylinder_1"] = {
    "mesh": "cylinder_origin.h5",
    "transforms": {
        "transform": [
            [1.0, 0.0, 0.0, 0.0],
            [0.0, 1.0, 0.0, 1.2],
            [0.0, 0.0, 1.0, 1.2],
            [0.0, 0.0, 0.0, 1.0],
        ],
        "motion": {
            "type": "rotating",
            "axis": [1.0, 0.0, 0.0],
            "origin": [0.0, 1.2, 1.2],
            "omega": 104.72,
            "moving mesh": True,
        },
    },
    "boundary conditions": {"BC_1": {"type": "interface", "kind": "overset", "zones": [7]}},
}
```

Each model entry sits under a label of its own, so several entries may load the same mesh file, each with its own
placement and motion. A rotor turning inside a stator across a sliding interface carries its motion in the same way;
see [Sliding](../choosing/choosing-boundary-conditions.md#sliding).

### A frame

A steady rotor in a mesh of its own is the same block with `"moving mesh": False`. The flow is solved in the rotating
frame and the mesh does not move:

```python
parameters["model"]["rotor"]["transforms"] = {
    "motion": {
        "type": "rotating",
        "axis": [0.0, 0.0, 1.0],
        "origin": [0.0, 0.0, 0.0],
        "omega": 100.0,
        "moving mesh": False,
    }
}
```

A frame over only part of a mesh, such as a wheel or an impeller meshed as cell zones of their own, is a
[`rotating` fluid zone](../choosing/choosing-a-fluid-zone-model.md#rotating-zones) instead of a `motion`.

A sliding interface whose rotating side is a frame is a frozen rotor. The two meshes keep their relative
position, the rotor is solved in its own frame, and the interface takes its axis from the frame. The run may be steady.

### A translating body that starts from rest

A train, placed 110 m along x, accelerated from rest to 69.4 m/s over the first 1.5 s:

```python
parameters["model"]["train"] = {
    "mesh": "train.h5",
    "transforms": {
        "transform": [
            [1.0, 0.0, 0.0, 110.0],
            [0.0, 1.0, 0.0, 0.0],
            [0.0, 0.0, 1.0, 0.0],
            [0.0, 0.0, 0.0, 1.0],
        ],
        "motion": {
            "type": "translating",
            "velocity": [-69.4, 0.0, 0.0],
            "moving mesh": True,
            "ramp time": 1.5,
        },
    },
    "boundary conditions": {"BC_2": {"type": "interface", "kind": "overset", "zones": [9]}},
}
```

Without `ramp time` the mesh moves at its full rate from the start of the run. With it, the rate rises linearly from
rest over `ramp time` seconds of physical time, which avoids the transient of an impulsive start. For a ramp time $T$
the angle turned by time $t$ is $\omega t^2 / (2T)$ during the ramp and $\omega (t - T/2)$ after it, and a translation
follows the same law.

### A scaled and placed mesh

A mesh built in inches, converted to metres and then turned 10 degrees about y and moved 1 m upstream. The matrix acts
on the scaled coordinates, so its translation is in metres:

```python
import zutil.transform

placement = zutil.transform.rotate([0.0, 1.0, 0.0], 10.0)
placement = zutil.transform.translate([0.0, 0.0, 0.0], [-1.0, 0.0, 0.0], placement)

parameters["model"]["wing"]["transforms"] = {
    "scale": [0.0254, 0.0254, 0.0254],
    "transform": placement,
}
```

The `zutil.transform` helpers and the conventions of an affine matrix are described in
[Initial placement](../setting-up/preparing-a-mesh.md#initial-placement).

### A placement function

`transform` may instead be a function. It is called with each node's scaled position as the keyword argument
`location`, and returns the placed position as three numbers. Here the mesh is wrapped about the z axis:

```python
import math


def place(*, location):
    x, y, z = location
    radius = 5.0 + y
    angle = x / 5.0
    return (radius * math.sin(angle), radius * math.cos(angle), z)


parameters["model"]["duct"]["transforms"] = {"transform": place}
```

A function is evaluated node by node in Python, so it is slower than a matrix on a large mesh. It cannot place a mesh
that carries non-conformal interface faces; give such a mesh a matrix.

## Each time step of a moving mesh

At each real time step a moving mesh is placed where its motion puts it at the end of the step. Its velocity over the
step is the distance moved divided by the time step, so the volumes swept by the moving faces are consistent with the
motion. A restart is described in the next section.

## Restarting a run with a moving mesh

A restart carries on from the mesh as the stored solution left it. The results file records where the mesh was, and
the run resumes from that position, whatever has been changed in the deck. A restart therefore continues the run as
an uninterrupted one would, or stops at start-up with an error that names the model, the file, both values and what to
do.

### Changing the motion

You may change `omega` or `velocity`, reverse the direction, or change or remove `ramp time`. The mesh moves on from
its stored position at the new rate. With `rotate nodes`, you may also change `axis` or `origin`: the new rotation is
applied to the mesh where it stands. A rotating motion may be replaced by a translating one, and the reverse, in the
same way.

`ramp time` counts from the time the motion first appears. A motion present from the start of the run ramps from time
zero. A motion added at a restart ramps from the restart time. A motion removed at a restart leaves the mesh where it
was.

The rate of the first step after a restart is the mean over the step that produced the stored solution, so a mesh in
the middle of a ramp resumes at the rate it had reached.

```python
parameters["model"]["cylinder_1"]["transforms"]["motion"]["omega"] = 62.83
```

A steady run may be restarted as an unsteady run with a moving mesh. The clock starts at zero and the mesh keeps the
position stored in the file. An unsteady run restarted as a steady one holds the mesh where it was.

### Changing the time step

A restart may use a different `time step`. The first step at the new size is taken at first order, and the order of
accuracy then rises as usual. The same applies when the step is edited during a run. A step that was stopped part way
is finished at its own size before the new one takes over. Dual and global time stepping may be exchanged.

### Restarting the clock

[`restart_ignore_history`](/reference/solver/initialisation#restart-ignore-history) restarts the clock at zero and ignores the cycle history, but the mesh stays where
the file left it. `ramp time` then counts from zero.

### Changes that stop the run

The run stops at start-up, before the solution is read, when a restart would otherwise be inconsistent. Each error
names the file and both values.

| What was done                                                                                       | What to do instead                                                                                         |
| --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `total time` set below the time stored in the file                                                  | Raise `total time`. A value equal to the stored time ends the run at once, with a note.                    |
| A moving mesh restarted from a file that holds no physical time                                     | Restart from a results file written by this version of zCFD, or start afresh with `restart` off.           |
| `axis` or `origin` changed on a rotating mesh that carries its rotation as an angle                 | Keep the stored `axis` and `origin`, or start afresh with `restart` off.                                   |
| A rotating mesh that carried its rotation as an angle given `rotate nodes`, another motion, or none | Keep the rotating motion with `moving mesh` on and `rotate nodes` off, or start afresh with `restart` off. |
| `moving mesh` switched between `True` and `False`                                                   | Keep the setting of the original run.                                                                      |
| `scale` or `transform` changed since the file was written                                           | Restore the original placement. Changes of position belong in `motion`.                                    |
| A model of a several-model case restarted from a file written at a different cycle or time          | Restart every model from files of the same step.                                                           |

Results files written before these records were kept are accepted. The mesh is taken to have moved by the current
motion from time zero, and a warning names the file.
