var e=`
# Running zCFD

zCFD is primarily run from the command line; you can run it on your local machine or submit it to a batch scheduler for parallel execution. The following sections give information on how to execute zCFD.

## Command Line Execution

zCFD includes an in-built command-line environment, which should be activated either when run directly or via a cluster management and job scheduling system, such as Slurm.

\`\`\`bash
source /INSTALL_LOCATION/zCFD-version/bin/activate
\`\`\`

This sets up the environment to enable execution of the specific version. When within the command-line environment, the command prompt will show a zCFD prefix:

\`\`\`bash
(zCFD) >
\`\`\`

To deactivate the command line environment, returning the environment to the previous state use:

\`\`\`bash
deactivate
\`\`\`

Your command prompt should return to its normal appearance.

To run zCFD on the command-line:

\`\`\`bash
run_zcfd -n <num_tasks> -d <device_type> -p <mesh_name> -c <case_name>
\`\`\`

See [Command line invocation and flags](/reference/command-line/invocation-and-flags) for what each of these flags means and for the full input validation and batch submission reference.

For example, to run zCFD from the command-line environment on a desktop computer with a single 12-core CPU processor and no GPU:

\`\`\`bash
run_zcfd -n 1 -d cpu -p <mesh_name> -c <case_name>
\`\`\`

By default, zCFD will use all 12 cores via OpenMP unless a specific number is required. To run the above case using only 6 cores (there will be one thread per CPU core):

\`\`\`bash
run_zcfd -n 1 -d cpu -o 6 -p <mesh_name> -c <case_name>
\`\`\`

or

\`\`\`bash
export OMP_NUM_THREADS=6; run_zcfd -n 1 -d cpu -p <mesh_name> -c <case_name>
\`\`\`

To run zCFD on a desktop computer with a single CPU and two GPUs:

\`\`\`bash
run_zcfd -n 2 -d gpu -p <mesh_name> -c <case_name>
\`\`\`

## Multiple Meshes and Overset Cases

A case with more than one mesh (see [overset](../working-with/overset-meshes.md)) is run from a single control dictionary: each mesh is a named entry under the top-level \`model\` key, run together with the same \`run_zcfd -c <case_name>\` invocation used for a single-mesh case \u2014 there is no separate \`-p\`/mesh argument or override file for these cases.

An example control dictionary for a background domain with a single rotating turbine:

\`\`\`python
parameters = {
    "config_version": 2,
    "solver": {....},
    "model": {
        "background": {"mesh": "background.h5", ....},
        "turbine": {"mesh": "turbine.h5", ....},
    },
}
\`\`\`

\`\`\`bash
run_zcfd -n 2 -d gpu -c <case_name>
\`\`\`

## What a run writes

A run of the control file \`<case>.py\` writes these files into the directory it is started from:

| File or directory        | Contents                                                                                                                                 |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| \`<case>.log\`             | the screen output of the run. Earlier logs are kept as \`<case>.log.1\` to \`<case>.log.10\`, the most recent first                          |
| \`<case>_status.yaml\`     | the status file, described below                                                                                                         |
| \`<case>_report.ipynb\`    | a Jupyter notebook that plots the report file                                                                                            |
| \`<case>_OUTPUT/<model>/\` | the output of each entry under \`model\`: its report file \`<model>_report.csv\`, its checkpoint \`<model>_results.h5\` and its solution files |
| \`<case>_OUTPUT/LOGGING/\` | one log for each MPI rank, \`<case>.<rank>.log\`                                                                                           |

The solution files are described in [The output directory](../working-with/post-processing-and-visualisation.md#the-output-directory).

### The status file

\`<case>_status.yaml\` is a YAML file written once, before the solve starts, and left unchanged while the run proceeds. It records how the run was started:

| Key              | Contents                                                         |
| ---------------- | ---------------------------------------------------------------- |
| \`case\`           | the control file                                                 |
| \`num processor\`  | the number of MPI ranks                                          |
| \`mesh\`           | the file name of each mesh, with its MD5 checksum                |
| \`version\`        | the zCFD version                                                 |
| \`date\`           | the time and date the run started, as \`HH:MM:SS DD-MM-YYYY\`      |
| \`nodes\`          | the host name of each node the run used                          |
| \`devices\`        | the CPU or GPU used by each rank                                 |
| \`model_ordering\` | the entries under \`model\`, in the order the solver advances them |

Three things read it:

- **A restart from another case.** When [\`restart_casename\`](/reference/solver/initialisation#restart-casename) names another case, the run reads that case's status file to find its models and its meshes. The run stops if the status file is missing, or if a mesh of the same name now has a different checksum.
- **Post-processing.** The \`zutil\` tools that open a run's output read the partition count and the model names from it.
- **The checkpoint.** A copy is stored in each \`<model>_results.h5\`, so the record survives the run directory, as described in [What a checkpoint records about the run](../working-with/post-processing-and-visualisation.md#what-a-checkpoint-records-about-the-run).

## Running in parallel

zCFD uses Intel MPI (Message Passing Interface) to enable running over multiple machines or multiple GPUs, either in one machine or across multiple. A paid licence is required for this functionality. This is achieved by decomposing the domain into parallel regions that are distributed to each MPI rank. MPI can use high-bandwidth network interconnects such as infiniband or AWS' Elastic Fabric adaptor,

There are two main strategies for running the code in parallel:

**Hybrid MPI/OpenMP** runs one MPI process per socket, reducing the number of MPI ranks at larger core counts. Running in hybrid mode assigns multiple cores to each MPI rank, allowing it to reduce the communication overheads associated with running in parallel.

**Full MPI** runs one MPI process per core and is typically the best strategy for low core count runs or GPU based runs. For GPU runs, you can run 1 MPI rank per GPU available on the node, or multiple MPI ranks per GPU. When running multiple ranks per GPU, the ranks will share the GPU resources. This can be useful for smaller problem sizes, testing and development, or workloads with low GPU utilisation.

To run in parallel you add the -n option to the run_zcfd script. The provided argument is the number of MPI processes to launch.

### Hybrid MPI/OpenMP

This is the default mode for zCFD. It will auto detect the number of sockets on each node and set the number of OpenMP threads appropriately. The \u2013tpn option to run_zcfd can be used to set the number of MPI processes to launch on each node. The number of OpenMP threads will be set automatically by dividing the total number of cores between all processes.

For example, if you had two hosts with 2 x 12 core CPUs per host and you wanted to run Hybrid MPI/OpenMP you would request 1 MPI rank per CPU socket and zCFD will automatically set the number of OpenMP threads per rank to match the number of cores per socket (12 in this example).

\`\`\`bash
run_zcfd -m <mesh_name> -c <case_name> -n 4 \u2013tpn 2
\`\`\`

The number of OpenMP threads assigned to each rank can be overridden by setting **OMP_NUM_THREADS** in the calling environment.

### Full MPI

This is achieved by running zCFD with **OMP_NUM_THREADS** set to 1 and passing -n <tasks> where tasks is the number of MPI ranks.

For example, if you had two hosts with 2 x 12 core CPUs per host and wanted to run full MPI with 1 MPI rank per core you could do the following:

\`\`\`bash
export OMP_NUM_THREADS=1
run_zcfd -p <mesh_name> -c <case_name> -n 48 \u2013tpn 24
\`\`\`

### GPU Parallel Execution

zCFD automatically assigns GPUs to MPI ranks when running on GPU-enabled nodes.

**Single Rank per GPU:** This is the default and recommended configuration for most workloads. Each MPI rank gets exclusive access to one GPU.

\`\`\`bash
# For a node with 4 GPUs, run 4 ranks (1 per GPU)
run_zcfd -p <mesh_name> -c <case_name> -n 4
\`\`\`

**Multiple Ranks per GPU (Experimental):** To enable multiple MPI ranks sharing GPUs, set the \`ZCFD_DEV_OVERSUBSCRIBE_GPU\` environment variable (see [Command line environment variables](/reference/command-line/environment-variables)). This is an experimental feature primarily intended for debugging and testing. When enabled, ranks will be assigned to GPUs using modulo arithmetic (rank % num_gpus).

::: {.warning}
GPU oversubscription is an experimental feature. It may result in reduced performance and is primarily intended for debugging purposes with limited GPU resources.
:::

This can be useful for:

- Testing and development with limited GPU resources
- Debugging with smaller problem sizes
- Workloads with low GPU compute utilisation

\`\`\`bash
# For a node with 4 GPUs, run 8 ranks (2 per GPU) - experimental
export ZCFD_DEV_OVERSUBSCRIBE_GPU=1
run_zcfd -p <mesh_name> -c <case_name> -n 8
\`\`\`

**Example assignments with oversubscription enabled:**

- 4 GPUs, 4 ranks: GPU assignment [0,1,2,3]
- 4 GPUs, 8 ranks: GPU assignment [0,1,2,3,0,1,2,3]
- 4 GPUs, 6 ranks: GPU assignment [0,1,2,3,0,1]

See [Command line parallel invocation](/reference/command-line/parallel-invocation) for running across multiple machines, libfabric provider selection and other advanced parallel settings.
`;export{e as default};