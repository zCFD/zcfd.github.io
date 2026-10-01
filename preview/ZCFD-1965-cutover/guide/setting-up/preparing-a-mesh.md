---
title: Preparing a mesh
section: guide
group: Setting up
order: 20
---

# Preparing a mesh

zCFD uses unstructured meshes written in an [HDF5](http://www.hdfgroup.org/HDF5/) file format. HDF5 provides a flexible, self describing specification supporting parallel I/O that can be tuned per filesystem type (e.g NFS, GPFS, Lustre etc).

Meshes from a wide variety of sources can be converted into this format as follows:

## OpenFOAM-x.x.x

A range of converters for popular mesh types is provided by a special version of the open-source CFD code OpenFOAM, available freely for download [here](https://github.com/zCFD/foamTozCFD.git).

Once downloaded and installed, the version of OpenFOAM will convert a range of file formats to the zCFD format. Prior to running any of these, you will need to activate your OpenFOAM environment using

```bash
source $FOAM_INST_DIR/OpenFOAM-x.x.x/etc/bashrc
```

## OpenFOAM Mesh Converter

To convert from an OpenFOAM format mesh to zCFD, run the following command in the MESH directory.

```python
foamTozCFD
```

This will create a new folder called _zInterface/_ containing the HDF5 file.

## zCFD Mesh Converter Utility

The converter for various mesh files is a utility called _convert_mesh_. This is included in the path set by activating the zCFD command line environment.

To run the utility, use

```bash
(zCFD): convert_mesh <filename> <new_filename>.h5
```

The utility auto-detects the format from the file extension. You can also explicitly specify the format using the `-f` flag:

```bash
(zCFD): convert_mesh -f <format> <filename> <new_filename>.h5
```

The following mesh formats are supported:

### Fluent Mesh Converter

The converter supports [ANSYS Fluent](http://www.ansys.com/Products/Simulation+Technology/Fluid+Dynamics/Fluid+Dynamics+Products/ANSYS+Fluent) files (`.msh`, `.cas`, `.msh.gz`, `.cas.gz`).

```bash
(zCFD): convert_mesh <filename>.msh <new_filename>.h5
```

This produces the zCFD HDF5 file and a zone helper file, `<new_filename>_zone.py`, which maps the zone names in the Fluent file to zone numbers. See [Zone numbers](#zone-numbers).

### Fluent CFF Mesh Converter

The converter also supports Fluent CFF format files (`.msh.h5`, `.cas.h5`).

```bash
(zCFD): convert_mesh <filename>.msh.h5 <new_filename>.h5
```

This produces the zCFD HDF5 file and a zone helper file, `<new_filename>_zone.py`.

### SU2 Mesh Converter

SU2 is an open source CFD solver (https://su2code.github.io/). Conversion of 2D meshes is not supported, as they are not handled in zCFD.

```bash
(zCFD): convert_mesh <filename>.su2 <new_filename>.h5
```

This produces the zCFD HDF5 file and a zone file, `<new_filename>_zones.py`.

### CGNS Mesh Converter

This utility will convert an unstructured, non-chimera, hexahedral mesh in CGNS (ref) format. The converter will handle meshes with element types (HEXA_8):

```bash
(zCFD): convert_mesh <filename>.cgns <new_filename>.h5
```

This produces the zCFD HDF5 file and a zone helper file, `<new_filename>_zone.py`. If you require support for additional element types please contact us: [`zcfd@zenotech.com`](mailto:zcfd@zenotech.com).

### UGRID Mesh Converter

UGRID is a NASA format for meshes. You must follow the naming convention for UGRID files, which describes the format and _endian-ness_ of the file data ("ascii8", "b8", "lb8", or "r8") depending upon which language (C or FORTRAN) was used to create the file. The mapbc file is optional and if provided as an extra argument, boundary conditions will be read from it; otherwise, they default to wall.

```bash
(zCFD): convert_mesh <filename>.[ascii8, b8, lb8, r8].ugrid <new_filename>.h5 <filename>.mapbc
```

This produces the zCFD HDF5 file.

### CBA Mesh Converter

The converter supports structured multiblock meshes in the University of Bristol UOBSMB / _flowcode_ CBA format (`.blk`). A CBA file is plain text: a header line giving the block count, a symmetry flag and a format version, then each block in turn — a dimension line (`ni nj nk`), the block's grid points (with _i_ varying fastest, then _j_, then _k_), and six footer lines, one per face, always in the order `imin, imax, jmin, jmax, kmin, kmax`. Each footer line is `type neighbour_block orientation`: for an inter-block face (type `2`) the other two numbers give the 1-based partner block and the 1-based partner face (`1` = `imin` ... `6` = `kmax`); for any other type they are ignored. A 2D block (`nk` = 1) is extruded by one cell along _y_, by the `--span` distance.

Every boundary face carries a type code. Without a zone file, each type maps to a default zone:

| Type | Default zone name     | `bc`       | Zone tag | Meaning                               |
| ---- | --------------------- | ---------- | -------- | ------------------------------------- |
| `-2` | `symmetry`            | `symmetry` | `7`      | symmetry plane                        |
| `-1` | `aero_wall`           | `wall`     | `4`      | aerodynamic (solid) wall              |
| `0`  | `wall`                | `wall`     | `3`      | wall                                  |
| `1`  | `farfield`            | `farfield` | `2`      | farfield                              |
| `2`  | n/a                   | n/a        | n/a      | inter-block interface, not a boundary |
| `3`  | `periodic_downstream` | `periodic` | `5`      | periodic (downstream side)            |
| `4`  | `periodic_upstream`   | `periodic` | `6`      | periodic (upstream side)              |

To convert, run through _convert_mesh_ using the `.blk` extension, or explicitly with `-f cba`:

```bash
(zCFD): convert_mesh <filename>.blk <new_filename>.h5
```

or run the converter directly:

```bash
(zCFD): cba_convert <filename>.blk <new_filename>.h5 [options]
```

Any options given after the two filenames on a _convert_mesh_ command line are passed straight through to `cba_convert`. Its options are:

| Option               | Meaning                                                                                  |
| -------------------- | ---------------------------------------------------------------------------------------- |
| `input`              | the CBA (`.blk`) mesh to read                                                            |
| `output`             | the zCFD _.h5_ mesh to write                                                             |
| `--zones FILE`       | a zone definition YAML file, overriding the default zone assignment above                |
| `--write-zones FILE` | also write the resolved zone assignment to FILE as YAML, and continue converting         |
| `--no-weld`          | keep each block's nodes separate instead of welding coincident nodes at block boundaries |
| `--span VALUE`       | extrusion distance for a 2D mesh (default `1.0`)                                         |
| `--quiet`            | suppress the summary report                                                              |

This produces the zCFD HDF5 file. A zone file is optional for CBA meshes: see [Structured Mesh Zone Files](#structured-mesh-zone-files).

### Plot3D Mesh Converter

The converter also reads ASCII (formatted), whole-format Plot3D structured multiblock grids (`.p3d`, `.fmt`). The file is a plain sequence of numbers: an optional block-count line, then one dimension line per block (`ni nj nk`, or `ni nj` for a 2D block), then for each block in turn all of its _x_ coordinates, then all of its _y_ coordinates, then (for a 3D block) all of its _z_ coordinates — again with _i_ varying fastest, then _j_, then _k_. A single block with no leading count line is also accepted. An extra _IBLANK_ integer following each point's coordinates is tolerated and ignored, and FORTRAN-style repeat counts (for example `12*0.0` for twelve repetitions of `0.0`) are expanded. A 2D grid (no _k_ dimension) is extruded by one cell along _z_, by the `--span` distance.

Binary (unformatted) Plot3D files, and the plane-by-plane streamed layout some codes write instead of the whole-block layout, are not supported; both are rejected rather than silently misread.

Unlike a CBA file, a Plot3D grid carries no connectivity or boundary information: block-to-block interfaces are discovered from coincident nodes after welding, and every boundary face must be assigned to a zone by hand — see [Structured Mesh Zone Files](#structured-mesh-zone-files). A zone file is therefore mandatory.

To convert, run through _convert_mesh_ using the `.p3d` or `.fmt` extension, or explicitly with `-f plot3d`:

```bash
(zCFD): convert_mesh <filename>.p3d <new_filename>.h5 --zones <zonefile>.yml
```

or run the converter directly:

```bash
(zCFD): plot3d_convert <filename>.p3d <new_filename>.h5 --zones <zonefile>.yml [options]
```

Any options given after the two filenames on a _convert_mesh_ command line are passed straight through to _plot3d_convert_. Its options are:

| Option               | Meaning                                                                                  |
| -------------------- | ---------------------------------------------------------------------------------------- |
| `input`              | the Plot3D (`.p3d`/`.fmt`) grid to read                                                  |
| `output`             | the zCFD _.h5_ mesh to write                                                             |
| `--zones FILE`       | the zone definition YAML file (required, unless only `--write-zones` is given)           |
| `--write-zones FILE` | write a zone template covering every discovered boundary face to FILE                    |
| `--no-weld`          | keep each block's nodes separate instead of welding coincident nodes at block boundaries |
| `--span VALUE`       | extrusion distance for a 2D grid (default `1.0`)                                         |
| `--quiet`            | suppress the summary report                                                              |

This produces the zCFD HDF5 file.

### Structured Mesh Zone Files

A zone file is optional for a CBA mesh — omit `--zones` and the default mapping in [CBA Mesh Converter](#cba-mesh-converter) is used — and mandatory for a Plot3D grid, which carries no boundary information of its own.

A zone file is YAML, with a single top-level `zones` map keyed by an integer zone tag; each tag must be unique. Here is a complete zone file for a 4-block ONERA M6 wing grid (block 1 is upstream of the wing, blocks 2 and 3 run along the wing, block 4 is downstream past the tip):

```yaml
zones:
  3:
    name: wing
    bc: wall
    patches:
      - { block: 2, face: jmin }
      - { block: 3, face: jmin }
  7:
    name: symmetry
    bc: symmetry
    patches:
      - { block: 1, face: kmin }
      - { block: 2, face: kmin }
      - { block: 3, face: kmin }
      - { block: 4, face: kmin }
  9:
    name: farfield
    bc: farfield
    patches:
      - { block: 1, face: imin }
      - { block: 1, face: jmax }
      - { block: 2, face: jmax }
      - { block: 3, face: jmax }
      - { block: 4, face: imax }
      - { block: 4, face: jmax }
```

Each zone takes:

- `name` — a free-text label, used only in the summary report (defaults to `zone_<tag>` if omitted).
- `bc` — required; one of `wall`, `inflow`, `outflow`, `symmetry`, `farfield`, `periodic`. This is what the solver acts on; the zone tag itself is an identifier for grouping and reporting.
- `patches` — an optional list of explicit block faces belonging to this zone. `block` is the 1-based block number; `face` is one of `imin`, `imax`, `jmin`, `jmax`, `kmin`, `kmax`.
- `cba_type` — CBA only, optional; a raw CBA footer type code (see [CBA Mesh Converter](#cba-mesh-converter)). Every boundary patch still carrying that type code, and not already claimed by an explicit patch in this or any other zone, is added to this zone.

A patch normally covers the whole block face. To assign only part of a face, add a 1-based, inclusive node-index range on one or both of the face's two in-plane axes:

| Face           | In-plane axes |
| -------------- | ------------- |
| `imin`, `imax` | `j`, `k`      |
| `jmin`, `jmax` | `i`, `k`      |
| `kmin`, `kmax` | `i`, `j`      |

```yaml
zones:
  3:
    name: inlet_strip
    bc: inflow
    patches:
      - { block: 1, face: imax, j: [1, 5], k: [1, 3] }
```

If a patch is listed explicitly, it always takes that zone, even where a `cba_type` catch-all on another zone would otherwise have matched it: explicit patches take precedence over `cba_type` membership.

To find the boundary faces available on a mesh without working them out by hand, write a template and edit it:

```bash
(zCFD): cba_convert mesh.blk mesh.h5 --write-zones zones.yml
(zCFD): plot3d_convert grid.p3d grid.h5 --write-zones zones.yml
```

For a CBA mesh this writes the _currently resolved_ zone assignment (the defaults above, or whatever `--zones` produced if it was also given) and still converts the mesh. For a Plot3D grid, if `--zones` is not also given, it instead writes a single template zone (tag `3`, `bc: wall`) covering every discovered boundary face — split into as many patches as the discovered block structure needs — and stops without writing an _.h5_ file. Either way, edit the `name`, `bc` and grouping of the written zones as needed, then rerun with `--zones zones.yml`.

### Structured Mesh Conversion Checks

The converter runs the same checks on every structured mesh, regardless of source format:

- **Node welding.** Coincident nodes at block boundaries are merged into a single global node, within a tolerance derived from the mesh itself (the smaller of one billionth of the mesh's bounding-box diagonal, and a thousandth of the shortest genuine edge in the mesh). `--no-weld` keeps every block's nodes separate; interfaces are still paired even when nodes are not welded.
- **Interface pairing.** For a CBA mesh, every inter-block face declared in the file's footers is checked: the partner face must exist, must point back to the same face (reciprocity), and its nodes must actually coincide with the partner's. For a Plot3D grid, which declares no connectivity, interfaces are discovered instead, purely from which welded nodes turn out to be shared between two blocks.
- **Handedness.** Every block's node ordering is classified as right- or left-handed from its signed volume, and face winding is adjusted per block so that outward normals and cell volumes come out correctly either way. Mixed handedness across blocks in the same mesh is not an error.
- **Six faces per cell, one or two cells per face.** Every cell ends up bounded by exactly six faces, and every face by exactly one cell (a boundary face) or two (an interior or interface face) — never zero, and never more than two.
- **Positive volumes.** Every cell's volume, computed from its bounding faces, must be strictly positive.
- **Periodic pairing.** Boundary faces with `bc: periodic` are grouped by zone tag and checked pairwise: each periodic zone must map onto exactly one other periodic zone under a pure rotation about the _x_, _y_ or _z_ axis, and that mapping must be reciprocal. The axis and angle found for each pair are reported.

If any of these fail, conversion stops before a mesh is written, with a message naming the blocks and faces involved:

| Failure                  | What it means                                                                                                                                                                                                                                                                                                  |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| unreciprocated interface | CBA only. One face's footer names another face as its interface partner, but that face's own footer either is not an interface or names a different partner. Fix the footer on the side that is wrong.                                                                                                         |
| non-coincident interface | A declared CBA interface's nodes do not coincide with its partner's at all — the two blocks are offset from one another where they are meant to meet. Check the grid geometry at that face.                                                                                                                    |
| partial-face abutment    | The same check as above, but only part of a declared CBA interface abuts its partner — a step or a sliver mismatch rather than a full offset. The faces reported are the ones left unpaired.                                                                                                                   |
| undeclared coincidence   | Two block faces (CBA) are geometrically coincident, but neither declares the other as its interface partner. Either move the blocks apart, or add the missing interface footer.                                                                                                                                |
| degenerate block face    | A block face has folded onto itself: the block is collapsed at that face, or wrapped with too few cells to keep the face distinct from itself, so some of its quads coincide with each other.                                                                                                                  |
| uncovered boundary quads | Some boundary quads were never placed in a zone. The message gives the 1-based node-index range on the face's two in-plane axes — paste it directly into a `patches` entry in the zone file to cover the gap. The same check, reported as quads assigned to _more than one_ zone, catches overlapping patches. |
| duplicate zone tag       | Two zones in the zone file use the same tag. Tags must be unique; give one of them a different tag.                                                                                                                                                                                                            |

Node welding that merges genuinely distinct nodes, rather than the two sides of a declared self-interface, is also rejected — the message names the block and the two node indices involved.

### Structured Mesh Conversion Report

Unless `--quiet` is given, both converters print a summary once conversion succeeds:

- the block count, and the CBA symmetry flag (always `0` for a Plot3D grid)
- the cell count
- the node count, raw and welded, and how many nodes were merged
- the face count, split into interior, interface and boundary faces
- every interface pair, with its face-quad count and whether it was found transposed and/or axis-reversed relative to its partner
- the resolved zones — tag, `name`, `bc` and the number of boundary faces each ended up with
- how many blocks came out right-handed versus left-handed
- the periodic pairs found (axis and angle in degrees), or `none`
- the minimum cell volume
- the weld tolerance used, and the shortest genuine edge it was derived from
- the time taken in each phase of the conversion (welding, face-building, zone resolution, assembly, checks)

This is the quickest way to confirm a mesh converted the way you expect — in particular, that the interface and zone face counts match what you know about the mesh, and that the minimum cell volume is sensible.

## Zone numbers

Every boundary face of a converted mesh belongs to a numbered zone, and a boundary condition lists the zone numbers it applies to in [`zones`](/reference/model/boundary-conditions). Fluid zones select cells by number in the same way. The source mesh names its zones, so the converters record which name became which number:

| Converter                | File written beside the mesh | Contents                                           |
| ------------------------ | ---------------------------- | -------------------------------------------------- |
| Fluent, Fluent CFF, CGNS | `<new_filename>_zone.py`     | the zone helper described below                    |
| SU2                      | `<new_filename>_zones.py`    | a single dict, `zones`, from zone name to number   |
| CBA, Plot3D              | none                         | the numbers are the tags in the zone file, if used |

The zone helper defines:

| Name              | Contents                                               |
| ----------------- | ------------------------------------------------------ |
| `zone_name_to_id` | a dict from each boundary zone name to its zone number |
| `to_id(names)`    | the zone numbers of a list of boundary zone names      |
| `fluid_zone`      | a dict from each fluid zone name to its zone number    |

The Fluent and Fluent CFF helpers also hold one list of zone names for each Fluent boundary type: `wall`, `symmetry`, `farfield`, `velocity_inlet`, `pressure_inlet`, `pressure_outlet` and `interior`. The CGNS helper adds `from_id(id)`, which returns the name of a zone number.

The directory of the control file is on the Python import path while the file is read, so a helper beside it can be imported by name. This keeps the deck in terms of the names given in the mesh generator:

```python
from wing_zone import to_id

{
    "boundary_conditions": {
        "BC_1": {"type": "wall", "zones": to_id(["wing_upper", "wing_lower"])},
        "BC_2": {"type": "symmetry", "zones": to_id(["symmetry"])},
    },
}
```

A helper whose name is not a valid Python module name, such as one beginning with a digit, is loaded with `zutil.get_zone_info` instead. It takes the file name, with or without `.py`, relative to the control file, and returns the helper as a module:

```python
import zutil

zone = zutil.get_zone_info("2d_aerofoil_zone")

{"boundary_conditions": {"BC_1": {"type": "wall", "zones": zone.to_id(["aerofoil"])}}}
```

### How a number in `zones` is matched

Each boundary zone of the mesh takes the boundary condition whose `zones` contains its zone number. A zone that no boundary condition names by number falls back to its boundary type code, listed in [The zCFD mesh file](#the-zcfd-mesh-file): it takes the boundary condition whose `zones` contains that code. A zone that matches neither way stops the run, with a message naming the zone and its code:

```text
Unable to determine boundary condition for zone 12 (ref: 3)
```

::: {.warning}
The fallback applies to every zone left unnamed. In a mesh with a zone numbered `3` and several unnamed wall zones, `"zones": [3]` also applies to every wall zone, since `3` is the code for a wall. List every zone by number to rule this out.
:::

## The zCFD mesh file

A zCFD mesh is an HDF5 file holding one group, `mesh`. The group carries two attributes, `numCells` and `numFaces`, and the datasets below. Every index counts from zero.

| Dataset      | Shape                   | Contents                                                                                  |
| ------------ | ----------------------- | ----------------------------------------------------------------------------------------- |
| `nodeVertex` | nodes × 3, float        | the coordinates of each node, in mesh units                                               |
| `faceType`   | faces × 1, integer      | the number of nodes of each face                                                          |
| `faceNodes`  | (sum of `faceType`) × 1 | the node indices of each face in turn, in face order                                      |
| `faceCell`   | faces × 2, integer      | the left and right cell of each face                                                      |
| `faceBC`     | faces × 1, integer      | the boundary type code of each face, `0` for an interior face                             |
| `faceInfo`   | faces × 2, integer      | the zone number of each face in the first column; the converters write `0` in the second  |
| `cellZone`   | cells × 1, integer      | optional; the fluid zone number of each cell. Without it, every cell is in fluid zone `0` |

The left cell of every face is a real cell, numbered below `numCells`. The right cell of an interior face is also a real cell. The right cell of a boundary face is a halo cell: halo cells are numbered from `numCells` upwards, one for each boundary face.

The node order of a face defines its normal by the right-hand rule. That normal must point out of the left cell and into the right cell, so on a boundary face it points out of the domain. A face wound the other way gives its cells wrong volumes.

All the faces of a zone carry the same boundary type code. The codes the solver recognises are:

| Code | Boundary type |
| ---- | ------------- |
| `0`  | interior face |
| `3`  | wall          |
| `4`  | inflow        |
| `5`  | outflow       |
| `7`  | symmetry      |
| `9`  | farfield      |
| `18` | periodic      |
| `20` | overset       |
| `21` | immersed wall |
| `22` | sliding       |

The `type` of the boundary condition that names a zone in the control file decides how the solver treats that zone; the code in the mesh does not.

## Initial placement

The model's [`transforms`](/reference/model/transforms) sets a single static affine transform applied to the whole mesh when it is read, before the solver starts.

It takes two keys, which may be given together:

- [`scale`](/reference/model/transforms#scale) multiplies the _x_, _y_ and _z_ coordinates of every node by the three factors given.
- [`transform_matrix`](/reference/model/transforms#transform-matrix) is a 4 × 4 affine matrix applied to every node.

Where both are given, `transform_matrix` is applied first and `scale` second. The matrix therefore acts in the units of the mesh file: where `scale` converts millimetres to metres, a translation in the matrix is given in millimetres.

A plain unit conversion needs only `scale`:

```python
# Scale from mm to metres
parameters["model"]["wing"]["transforms"] = {"scale": [0.001, 0.001, 0.001]}
```

```python
# Scale from inches to metres
parameters["model"]["wing"]["transforms"] = {"scale": [0.0254, 0.0254, 0.0254]}
```

A plain anisotropic mesh stretch also needs only `scale`:

```python
{
    "model": {
        "canopy_dacosta": {
            "transforms": {"scale": [50.0, 1.0, 1.0]},
            "mesh": "canopy_dacosta.h5",
            ...
        }
    }
}
```

::: {.note}
`scale` applies to the mesh only — not interpolated surface outputs etc.
:::

Build `transform_matrix` with the `zutil.transform` helpers. Each returns a 4 × 4 numpy array. Given an existing matrix as its optional last argument, `A2B`, a helper applies its own transform after that matrix, so a chain of calls applies the transforms in the order written:

| Helper                             | Transform                                                                                  |
| ---------------------------------- | ------------------------------------------------------------------------------------------ |
| `rotate(axis, angle_deg, A2B)`     | a rotation by `angle_deg` degrees about `axis`, through the origin, by the right-hand rule |
| `translate(point_b, point_c, A2B)` | a translation by `point_c` minus `point_b`                                                 |
| `scale(scale_factors, A2B)`        | a scaling of _x_, _y_ and _z_ by the three factors                                         |

```python
import zutil.transform

# Two 90-degree rotations about x, then 10 degrees about y, composed in order
mesh_transform = zutil.transform.rotate([1, 0, 0], 90.0)
mesh_transform = zutil.transform.rotate([1, 0, 0], 90.0, mesh_transform)
mesh_transform = zutil.transform.rotate([0, 1, 0], 10.0, mesh_transform)

{"model": {"naca0012": {"transforms": {"transform_matrix": mesh_transform}}}}
```

The matrix is an
[affine transform](https://www.brainvoyager.com/bv/doc/UsersGuide/CoordsAndTransforms/SpatialTransformationMatrices.html)
([Wikipedia](https://en.wikipedia.org/wiki/Affine_transformation)): the upper left 3 × 3 block describes a rotation,
reflection, scaling or shear, or any combination of them, and the fourth column a translation. Here a rotation, a
scaling and a translation are applied in turn:

```python
import zutil.transform

A2B = zutil.transform.rotate([0.0, 1.0, 0.0], 10.0)
B2C = zutil.transform.scale([0.1, 0.1, 0.1], A2B)
C2D = zutil.transform.translate([0.0, 0.0, 0.0], [-1.0, 0.0, 0.0], B2C)

parameters["model"]["wing"]["transforms"] = {"transform_matrix": C2D}
```

Rotations follow the conventions of
[pytransform3d](https://dfki-ric.github.io/pytransform3d/user_guide/rotations.html) and are active: the mesh is
rotated, not the axes. A matrix built directly with [pytransform3d](https://dfki-ric.github.io/pytransform3d) can be
given as `transform_matrix` in the same way.

::: {.note}
[`transform_func`](/reference/model/transforms#transform-func) is accepted by validation but not read by the solver, so it has no effect on the mesh. Use `transform_matrix` to place the mesh.
:::
