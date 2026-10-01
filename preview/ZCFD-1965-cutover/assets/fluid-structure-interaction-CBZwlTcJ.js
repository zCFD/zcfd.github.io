var e=`
# Fluid\u2013structure interaction

zCFD supports two fluid-structure interaction (FSI) coupling schemes: a built-in **modal model** driven by mode shapes imported from a Nastran modal analysis, and a **generic** loosely-coupled scheme for driving an external FEA solver through a user-supplied \`genericFSI.py\` script. Both schemes use the same underlying mesh-deformation machinery (RBF, RBF multiscale, or IDW - see [Mesh deformation](#mesh-deformation)) to propagate the motion of the coupled surface into the volume mesh.

## Where FSI settings live

An FSI coupling is attached to the wall boundary condition whose surface is the moving, coupled structural boundary, via that boundary condition's [\`'fsi'\`](/reference/model/boundary-conditions/wall#fsi) key:

\`\`\`python
{
    "model": {
        "<case_name>": {
            "boundary_conditions": {
                "BC_FSI": {
                    "zones": [1, 2, 3],
                    "type": "wall",
                    "kind": "slip",
                    "fsi": {
                        "type": "modal_model",  # or "generic_fsi"
                        ...
                    },
                },
                ...
            },
        }
    },
}
\`\`\`

The \`'fsi'\` block is discriminated by its \`'type'\` key: \`'modal_model'\` selects the built-in Nastran modal-model coupling, \`'generic_fsi'\` selects the generic external-solver coupling. For the modal model, the moving zones are **not** repeated inside the \`'fsi'\` block - they are inherited from the owning boundary condition's own \`'zones'\` list. Generic FSI is the exception: it carries its own \`'zone'\` key (singular, unlike every other zone list in zCFD, which is why it stands out below).

## Restarting an FSI simulation

FSI restart behaviour is controlled by [\`'restart'\`](/reference/solver/initialisation#restart) in the \`'initialisation'\` block - the same flag that governs restarting the flow solution. The FSI coupling resolves this flag through the same model-block-then-solver-block precedence used everywhere else in zCFD: if the model that owns the FSI-coupled boundary condition sets its own \`'initialisation'\` block, the \`'restart'\` value there takes priority; only when the model block does not set \`'initialisation'\` does the coupling fall back to the top-level solver block:

\`\`\`json
{
  "solver": { "initialisation": { "restart": true } },
  "model": { "<case_name>": { "initialisation": { "restart": true } } }
}
\`\`\`

This determines whether the modal model resumes its structural state (modal displacements and velocities, and, for the RBF transform, the previously built base-point set) from a previous run, so a per-model \`'initialisation'\` block, when present, is always the one that decides FSI restart - not the solver-level one.

## Modal model

The modal model reduces the structural response to a small set of Nastran mode shapes, integrates the modal equations of motion (via a Newmark-beta scheme) forced by the aerodynamic pressure load, and maps the resulting modal deformation back onto the fluid surface and, via RBF or IDW, into the volume mesh.

::: {.note}
Unlike generic FSI, the modal model does not accept a \`'user_variables'\` dictionary - modal-model behaviour is controlled entirely by its own keywords.
:::

### RBF multiscale transform

Set \`'transform_type': 'rbf_multiscale'\` to deform the volume mesh using the multiscale RBF scheme (see [Interpolation method](#interpolation-method) for how RBF and RBF multiscale work).

### IDW transform

Set \`'transform_type': 'idw'\` to deform the volume mesh using inverse distance weighting (see [Interpolation method](#interpolation-method) for the IDW weighting formulae).

::: {.note}
\`'support_radius'\` and \`'stencil_size'\` are alternative ways of bounding the IDW stencil - setting both explicitly is rejected as ambiguous.
:::

### External forcing

An optional [\`'forcing'\`](/reference/model/boundary-conditions/wall#fsi) block applies an additional external force to the modal equations of motion, independent of the aerodynamic pressure load.

### Modal model example

RBF multiscale coupling of a panel to a Nastran modal basis:

\`\`\`python
{
    "boundary_conditions": {
        "BC_FSI": {
            "zones": [1, 2, 3],
            "type": "wall",
            "kind": "slip",
            "fsi": {
                "type": "modal_model",
                "file_format": "nastran",
                "nastran_casename": "panel_nm_0.04m",
                "transform_type": "rbf_multiscale",
                "base_point_fraction": 1.0,
                "support_radius": 0.02,
                "scale": [1.0, 1.0, 1.0],
                "mode_mapping_max_distance": 0.01,
                "fluid_force_scaling": 0.08 / 0.000166667,
                "mode_list": [0, 4, 10, 13],
                "modal_damping": [0.0, 0.0, 0.0, 0.0],
            },
        },
    },
}
\`\`\`

The same panel coupled with an IDW transform instead, with a set of surrounding zones held fixed:

\`\`\`python
{
    "boundary_conditions": {
        "BC_FSI": {
            "zones": [1, 2, 3],
            "type": "wall",
            "kind": "slip",
            "fsi": {
                "type": "modal_model",
                "file_format": "nastran",
                "nastran_casename": "panel_nm_0.04m",
                "transform_type": "idw",
                "power": [3.0, 8.0, 10.0],
                "deformation_distance": 0.05,
                "blending_stiffness": 0.0,
                "n_nearest": 350,
                "fixed_zones": [4, 5, 6, 7, 8, 9],
                "scale": [1.0, 1.0, 1.0],
                "mode_mapping_max_distance": 0.01,
                "fluid_force_scaling": 0.08 / 0.000166667,
                "mode_list": [0, 4, 10, 13],
                "modal_damping": [0.0, 0.0, 0.0, 0.0],
            },
        },
    },
}
\`\`\`

## Generic FSI

Generic FSI is a loose (explicit) coupling to an external FEA program. By default, \`genericFSI.py\` performs no changes - it is a hook to be implemented to exchange pressures, displacements and node coordinates with your own external solver.

### Generic FSI example

\`\`\`python
{
    "boundary_conditions": {
        "BC_FSI": {
            "zones": [1, 2, 3],
            "type": "wall",
            "kind": "slip",
            "fsi": {
                "type": "generic_fsi",
                "zone": [1, 2, 3],
                "fixed_zones": [4, 5, 6],
                "transform_type": "idw",
                "n_nearest": 100,
                "deformation_distance": 1.0,
                "blending_stiffness": 0.5,
                "power": [3.0, 5.0, 10.0],
                "user_variables": {"restart_file": "structure_state.dat"},
            },
        },
    },
}
\`\`\`

## Mesh deformation

A known deformation of a surface in the mesh is propagated out into the volume using either radial basis function or inverse distance weighted interpolation. Wing deflection and turbine-blade deflection under a static load are two uses of this functionality. Set up as an entry in the model's [\`fluid_zones\`](/reference/model/fluid-zones) with [\`'type': 'rbf transform'\`](/reference/model/fluid-zones/rbf-transform) or [\`'type': 'idw transform'\`](/reference/model/fluid-zones/idw-transform).

Two zone types apply a geometric transform to a subset of the mesh rather than a physical source term: the RBF and IDW mesh deformation schemes, typically used to propagate a moving boundary's displacement into the surrounding volume mesh. Both require \`zones\` and a required \`func\` that supplies the boundary/point displacement driving the deformation.

### Interpolation method

Selects the interpolation method used to propagate the surface deformation into the volume mesh. Two \`type\` values are available:

**'rbf transform'** with [\`base_point_fraction\`](/reference/model/fluid-zones/rbf-transform#base-point-fraction) set to \`1.0\` uses the 'greedy' method of [Allan et al](https://doi.org/10.1016/j.jcp.2009.12.006), where the deformation is started with a subset of points and additional points are added until the surface deformation converges.

**'rbf transform'** with \`base_point_fraction\` set below \`1.0\` instead uses the [multiscale](https://doi.org/10.1016/j.jcp.2017.05.042) RBF method, where a subset of surface points with a fixed support radius are solved implicitly and the remaining points are solved explicitly with a support radius determined as part of the solution process. The base set of points are assigned the [\`support_radius\`](/reference/model/fluid-zones/rbf-transform#support-radius) and hence can have a wider sphere of influence than the remaining points which are used in the multiscale process.

::: {.note}
Increasing the number of points in the base set and/or increasing \`support_radius\` generally makes the surface deformation propagate further into the volume mesh, reducing the likelihood of generating poor quality cells.
:::

**'idw transform'** uses a simple inverse distance weighted interpolation. The [**power**](/reference/model/fluid-zones/idw-transform#power) parameter provides a list of three exponents used in the IDW scheme. The first (p1) is applied to the interpolation weight of points close to the surface, the second (p2) to points which are the deformation distance away from the surface and the third (p3) is used to blend between the two extremes.

$$
wt_1 = (deformation\\_distance / distance)^{p1}
$$

$$
wt_2 = (deformation\\_distance / distance)^{p2}
$$

$$
blend = ((deformation\\_distance - distance) / deformation\\_distance)^{p3}
$$

Then the weight is:

$$
wt = (wt1 * (1.0 - blend) + blend * wt2)
$$

### Examples

#### RBF Example

\`\`\`python
import zutil

alpha = 10.0

def my_transform(x, y, z):
    v = [x, y, z]
    v = zutil.rotate_vector(v, alpha, 0.0)
    return {"v1": v[0], "v2": v[1], "v3": v[2]}


{
    "fluid_zones": {
        "TR_1": {
            "type": "rbf transform",
            "zones": [4],
            "func": my_transform,
            "support_radius": 200.0,
            "basis": "c2",
        }
    }
}
\`\`\`

#### RBF Multiscale Example

\`\`\`python
import zutil

alpha = 10.0

def my_transform(x, y, z):
    v = [x, y, z]
    v = zutil.rotate_vector(v, alpha, 0.0)
    return {"v1": v[0], "v2": v[1], "v3": v[2]}


{
    "fluid_zones": {
        "TR_1": {
            "type": "rbf transform",
            "zones": [4],
            "func": my_transform,
            "support_radius": 200.0,
            "basis": "c2",
            "base_point_fraction": 0.1,
        }
    }
}
\`\`\`

#### IDW Example

\`\`\`python
import zutil

alpha = 10.0

def my_transform(x, y, z):
    v = [x, y, z]
    v = zutil.rotate_vector(v, alpha, 0.0)
    return {"v1": v[0], "v2": v[1], "v3": v[2]}


{
    "fluid_zones": {
        "TR_1": {
            "type": "idw transform",
            "zones": [4],
            "func": my_transform,
            "fixed_zones": [1],
            "n_nearest": 500,
            "power": [4.0, 8.0, 10.0],
            "deformation_distance": 100.0,
            "blending_stiffness": 0.5,
        }
    }
}
\`\`\`
`;export{e as default};