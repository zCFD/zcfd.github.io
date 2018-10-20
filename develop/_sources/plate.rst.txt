Flat Plate
----------

The zero pressure-gradient flat plate exercises the near-wall turbulence model by comparing the turbulent boundary layer profile directly with an exact analytic (theoretical) model. This test is applied to a series of meshes with varying mesh density (increasing the :math:`y^{+}`) to verify that the automatic scalable wall function is operating correctly.

Conditions
^^^^^^^^^^

Turbulent flow near a flat solid boundary follows the `law of the wall <http://en.wikipedia.org/wiki/Law_of_the_wall>`_ such that in the viscous sublayer (:math:`y^{+} = y u_{\tau} / \nu < 5`) the dimensionless velocity :math:`u^{+} = u/u_{\tau}` is given by :math:`u^{+}=y^{+}`. The friction velocity :math:`u_{\tau}=\sqrt{\tau_{w}/\rho}` and :math:`\nu` is the kinematic viscosity. The wall shear stress :math:`\tau_{w}` must be determined as part of the solution.

For :math:`y^{+}>30` the dimensionless velocity is given by :math:`u^{+}=\log (y^{+})/\kappa + C^{+}` where :math:`\kappa \simeq 0.41` is the von Karman constant and :math:`C^{+} \simeq 0.5` is an empirical constant. In the buffer region :math:`5 < y^{+} < 30` the dimensionless velocity :math:`u^{+}` is a blend between the two models.

.. figure:: images/plateBCpic.jpg
	:width: 100%
	:align: center
	:alt: Flat Plate Boundary Conditions
	:figclass: align-center

Computational domain for the turbulent flat plate flow case. When the *kind* of :ref:`wall` boundary condition for the lower boundary is set to *wallfunction*, zCFD will automatically calculate :math:`y^{+}` at each time step based on the local distance field value :math:`d` and determine the appropriate values of the turbulence quantities :math:`k` and :math:`\omega` to recover the law of the wall. Further details of this formulation are provided in the zCFD Reference Guide [link - TODO].  The :math:`y^{+}` variation is determined by introducing a scaling factor :math:`f` for the mesh in the :math:`y` direction.

Mesh
^^^^

The meshes for the flat plate test case are available for download here:

.. code-block:: bash

    > wget TODO

Input Files
^^^^^^^^^^^

The input files for the flat plate test case are available for download here:

.. code-block:: bash

    > wget TODO

Six separate cases are included:

.. code-block:: bash

    plate_fine.py (544 x 384 cells)
    plate_medium.py (68 x 48 cells)
    plate_medium_f20.py (68 x 48 cells)
    plate_medium_f50.py (68 x 48 cells)
    plate_medium_f100.py (68 x 48 cells)
    plate_medium_f300.py (68 x 48 cells)

Note that the *medium* cases all use the automatic wall function, and the *fine* case uses a *no-slip* condition (i.e. no wall function).

Results
^^^^^^^

.. figure:: images/flat_plate_bl_profile_a.png
	:width: 90%
	:align: center
	:alt: alternate text
	:figclass: align-center

Boundary layer profiles (:math:`u^{+}` versus :math:`\log y^{+}`) at streamwise location :math:`x=0.97`. By varying the mesh scaling parameter :math:`f` in the :math:`y` direction, we can verify that zCFD is automatically recovering the law of the wall regardless of the first cell height. The :math:`y^{+}` value in the cell adjacent to the wall boundary shown on the graph legend is calculated by the solver. We provide a comparative CFD solution from `CFL3D <http://cfl3d.larc.nasa.gov/>`_.

.. figure:: images/flat_plate_bl_profile_b.png
    :width: 90%
    :align: center
    :alt: alternate text
    :figclass: align-center

The friction coefficient :math:`C_f=F_{x=0.97}/(0.5 \rho u^{2})` at streamwise location :math:`x=0.97` and the drag coefficient :math:`C_d=D_{PLATE}/(0.5 \rho u^{2})` should be independent of the first cell height (and hence :math:`y^{+}`) if the wall functions are working correctly. [TODO this table should be made larger]. We plot here the profile :math:`y` versus non-dimensional velocity :math:`u/u_{\infty}` to visualise the vertical extent of the boundary layer.  The friction and drag coefficient validation values should lie in the ranges :math:`0.00255<C_f<0.00275` and :math:`0.00270<C_d<0.00290` respectively.

Mesh sensitivity

.. figure:: images/flat_plate_mesh_conv_profile.png
	:width: 90%
	:align: center
	:alt: alternate text
	:figclass: align-center

Code-to-code comparison with mesh convergence (zCFD, `FUN3D <http://fun3d.larc.nasa.gov/>`_ and `CFL3D <http://cfl3d.larc.nasa.gov/>`_) of the friction coefficient :math:`C_f` at :math:`x=0.97`.

Notebook
^^^^^^^^

A python notebook containing all of the post-processing steps plus version regression data is available here: `FLATPLATE Notebook <https://github.com/zenotech/zPost/tree/master/ipynb/FLATPLATE>`_

Metric
^^^^^^

The friction and drag coefficient validation values should lie in the ranges 0.00255 < :math:`C_f` < 0.00275 and 0.00270 < :math:`C_d` < 0.00290 respectively. These values are checked as part of the verification process.


References
^^^^^^^^^^

`<http://turbmodels.larc.nasa.gov/flatplate.html>`_

`<http://turbmodels.larc.nasa.gov/flatplate_val.html>`_
