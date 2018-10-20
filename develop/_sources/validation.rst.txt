Verification
============

zCFD is verified against a set of standard test cases for every formal code release.  These test cases are public and fully accessible. All meshes, input files and post-processed results are included in the pack for download and use.  We include reference material and comparison with validation data via pre-populated iPython notebooks as part of the `zPost repository <https://github.com/zenotech/zPost>`_. In addition to these verification test cases, we provide a library of :ref:`examples` that may help in setting up new simulations.

The mesh files are much larger than the input and post-processing files, and so are stored in a publicly accessible Amazon S3 directory.  Links to the appropriate S3 files are included with each test case description.

.. include:: plate.rst

.. include:: naca0012.rst

.. include:: nasacrm.rst

.. include:: cylinder.rst

.. include:: caratung.rst
