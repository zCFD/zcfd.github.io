var e=`
# Parallel invocation

See [Running zCFD \u00a7 Running in parallel](../../guide/setting-up/running-zcfd.md#running-in-parallel) for the Hybrid MPI/OpenMP, Full MPI and GPU parallel execution concepts. This page covers running across multiple machines and the lower-level flags and environment variables that control MPI transport selection and thread affinity.

## Running across multiple machines with a cluster scheduler

There are many cluster scheduling systems but commonly used ones are Slurm, PBS Pro or GridEngine. Please refer to either the cluster scheduling software or your local HPC systems' documentation for how to submit jobs to the appropriate nodes on your system as configuration varies between machines.

Intel MPI has tight integration to most commonly used scheduling systems and so will typically autodetect the nodes to run on.

## Running across multiple machines without a cluster scheduler

If your cluster does not have a scheduling system then **I_MPI_HYDRA_HOST_FILE** can be set in the environment to point at a file containing the list of hostnames that zCFD will launch on. For example:

\`\`\`bash
export I_MPI_HYDRA_HOST_FILE=~/hosts.file
\`\`\`

::: {.note}
For this to run you need to be able to ssh without a password to each of the machines listed.
:::

An example contents of a hosts file is shown below:

\`\`\`bash
Compute01:2
compute02:2
Compute03:1
\`\`\`

This file specifies three hosts, compute01, compute02, compute03 where 2 ranks will be launched on each of compute01 and compute02 and 1 rank will be launched on compute03.

Alternatively this could be specified as which would launch processes round robin through the list of machines listed in the file.

\`\`\`bash
Compute01
compute02
Compute03
\`\`\`

## Libfabric provider selection

zCFD will attempt to autodetect the correct provider to use for MPI communication. It tries the following providers in order:

\`\`\`bash
efa
psm2
mlx
verbs
tcp
sockets
\`\`\`

If FI_PROVIDER is set then the autodetection is skipped.

## Using cluster provided libfabric

By default zCFD will use the version of libfabric that ships with Intel MPI. For some advanced use cases you may wish to make use of preinstalled libfabric. This may be if you have a custom network driver or a specific configuration on your cluster.
To enable this then set the **I_MPI_OFI_LIBRARY_INTERNAL** environment variable to 0

\`\`\`bash
export I_MPI_OFI_LIBRARY_INTERNAL=0
\`\`\`

## Pre launch script

On some systems the defaults setup by zcfd may not be optimal and so a custom script to modify the environment can be injected by setting the environment variable **ZCFD_PRE_LAUNCH** to the path to a script. This script will be sourced from within a bash environment just before the solver is launched.

An example use case for this is to bind a GPU to a specific network interface on a multi-homed network system.

## OpenMP affinity

By default zCFD binds its OpenMP threads to cores using the **OMP_PROC_BIND** and **OMP_PLACES** environment variables.

## Other MPI implementations

Where Intel MPI does not work on a platform, zCFD can be built against a specific implementation of MPI. This is a custom deployment for your facility; contact Zenotech if you need it.

## Running at large scale

As zCFD is partly written in python, the install consists of a large quantity of small files, which on a large scale cluster can have a negative impact on the cluster filesystem during startup. To mitigate this, the code can be staged into either local storage or memory on the compute nodes using MPI to broadcast the data.

Contact us if you want to run in this mode.
`;export{e as default};