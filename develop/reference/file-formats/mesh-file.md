---
title: Mesh file
section: reference
group: File formats
order: 10
---

# Mesh file

A zCFD mesh is an HDF5 file holding one group, `mesh`. The group carries two attributes, `numCells` and `numFaces`, and the datasets below. Every index counts from zero. [Preparing a mesh](/guide/setting-up/preparing-a-mesh) describes how to convert a mesh into this format.

![The group mesh in an HDF5 file, with its two attributes and seven datasets; faceType gives the number of nodes of each face, and so splits faceNodes into one run of node indices per face](/images/mesh-file-layout.svg "Layout of a zCFD mesh file")

## Datasets

| Dataset      | Shape                   | Contents                                                                                     |
| ------------ | ----------------------- | -------------------------------------------------------------------------------------------- |
| `nodeVertex` | nodes × 3, float        | the coordinates of each node, in mesh units                                                  |
| `faceType`   | faces × 1, integer      | the number of nodes of each face                                                             |
| `faceNodes`  | (sum of `faceType`) × 1 | the node indices of each face in turn, in face order                                         |
| `faceCell`   | faces × 2, integer      | the left and right cell of each face                                                         |
| `faceBC`     | faces × 1, integer      | the boundary type code of each face, `0` for an interior face                                |
| `faceInfo`   | faces × 2, integer      | the zone identifier of each face in the first column; the converters write `0` in the second |
| `cellZone`   | cells × 1, integer      | optional; the cell zone number of each cell, which a fluid zone's `cell zones` selects       |

## Cells and faces

The left cell of every face is a real cell, numbered below `numCells`. The right cell of an interior face is also a real cell. The right cell of a boundary face is a halo cell: halo cells are numbered from `numCells` upwards, one for each boundary face.

The node order of a face defines its normal by the right-hand rule. That normal must point out of the left cell and into the right cell, so on a boundary face it points out of the domain. A face wound the other way gives its cells wrong volumes.

![An interior face between cells 0 and 1, with its normal pointing from cell 0 into cell 1, and a boundary face between cell 1 and a halo cell numbered from numCells, with its normal pointing out of the domain](/images/mesh-file-faces.svg "Left and right cells of a face")

A boundary condition in the control file names the zones it applies to by the zone identifiers in `faceInfo`.

## Boundary type codes

`faceBC` holds `0` for an interior face and, for a boundary face, the code of its boundary type:

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
| `22` | sliding       |

The `type` of the boundary condition that names a zone decides how the solver treats that zone; the code in the mesh does not.
