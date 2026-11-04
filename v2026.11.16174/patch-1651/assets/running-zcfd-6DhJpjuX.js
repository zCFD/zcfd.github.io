var e=`
# Running zCFD

zCFD is primarily run from the command line; you can run it on your local machine or submit it to a batch scheduler for parallel execution. The following sections give information on how to execute zCFD.

## Command Line Execution

zCFD includes a command-line environment, which must be activated before a run, whether zCFD is started directly or through a job scheduler such as Slurm.

\`\`\`bash
source /INSTALL_LOCATION/zCFD-version/bin/activate
\`\`\`

This sets up the environment for that version of zCFD. While the environment is active, the command prompt carries a zCFD prefix:

\`\`\`bash
(zCFD) >
\`\`\`

To deactivate the environment and restore the previous one, use:

\`\`\`bash
zdeactivate
\`\`\`

The command prompt returns to its normal appearance.

To run zCFD on the command line:

\`\`\`bash
run_zcfd -c <case> [-n <ranks>] [-t <ranks_per_node>] [-o <threads>] [-d cpu|gpu]
\`\`\`

Each flag and its default is listed in [invocation and flags](../../reference/command-line/invocation-and-flags.md).

The mesh is not given on the command line. The control file names it with the [\`mesh\`](/reference/model#mesh) key of each entry under \`model\`:

\`\`\`python
parameters = {
    "config_version": 2,
    "solver": {...},
    "model": {
        "wing": {"mesh": "wing.h5", ...},
    },
}
\`\`\`

See [Command line invocation and flags](/reference/command-line/invocation-and-flags) for input validation and batch submission.

To run zCFD on a desktop computer with a single 12-core CPU and no GPU:

\`\`\`bash
run_zcfd -n 1 -d cpu -c <case>
\`\`\`

zCFD starts one OpenMP thread for each CPU the operating system reports, unless a smaller number is requested. To run the same case with 6 threads:

\`\`\`bash
run_zcfd -n 1 -d cpu -o 6 -c <case>
\`\`\`

or

\`\`\`bash
export OMP_NUM_THREADS=6; run_zcfd -n 1 -d cpu -c <case>
\`\`\`

To run zCFD on a desktop computer with two GPUs, one rank on each:

\`\`\`bash
run_zcfd -n 2 -d gpu -c <case>
\`\`\`

## Multiple Meshes and Overset Cases

A case with more than one mesh (see [overset](../working-with/overset-meshes.md)) is run in the same way. Each mesh is a named entry under \`model\`, with its own \`mesh\` key, and the command line is unchanged.

An example control file for a background domain with a single rotating turbine:

\`\`\`python
parameters = {
    "config_version": 2,
    "solver": {...},
    "model": {
        "background": {"mesh": "background.h5", ...},
        "turbine": {"mesh": "turbine.h5", ...},
    },
}
\`\`\`

\`\`\`bash
run_zcfd -n 2 -d gpu -c <case>
\`\`\`

## What a run writes

A run of the control file \`<case>.py\` writes these files into the directory it is started from:

| File or directory        | Contents                                                                                                                                 |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| \`<case>.log\`             | the screen output of the run. Earlier logs are kept as \`<case>.log.1\` to \`<case>.log.10\`, the most recent first                          |
| \`<case>_status.yaml\`     | the status file, described below                                                                                                         |
| \`<case>_OUTPUT/<model>/\` | the output of each entry under \`model\`: its report file \`<model>_report.csv\`, its checkpoint \`<model>_results.h5\` and its solution files |
| \`<case>_OUTPUT/LOGGING/\` | one log for each MPI rank, \`<case>.<rank>.log\`                                                                                           |

The solution files are described in [The output directory](../working-with/post-processing-and-visualisation.md#the-output-directory).

### The status file

\`<case>_status.yaml\` is a YAML file written before the solve starts. It records how the run was started:

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

A run with a farfield [target](../working-with/trimming-to-a-target.md) also keeps a \`target\` record for each target,
updated as the run proceeds: its phase (\`settle\`, \`trim\` or \`hold\` during the run, \`met\` or \`not met\` at the end), the
current angle and the current coefficient. [Trimming to a target](../working-with/trimming-to-a-target.md#what-the-run-reports)
shows the record. A restart of that run reads the record to start the farfield at the recorded angle.

Three things read it:

- **A restart from another case.** When [\`restart_casename\`](/reference/solver/initialisation#restart-casename) names another case, the run reads that case's status file to find its models and its meshes. The run stops if the status file is missing, or if a mesh of the same name now has a different checksum.
- **Post-processing.** The \`zutil\` tools that open a run's output read the partition count and the model names from it.
- **The checkpoint.** A copy is stored in each \`<model>_results.h5\`, so the record survives the run directory, as described in [What a checkpoint records about the run](../working-with/post-processing-and-visualisation.md#what-a-checkpoint-records-about-the-run).

## Running in parallel

![The six ways of running zCFD in parallel, with the command that selects each. On CPUs: one rank with OpenMP threads on one machine; hybrid MPI/OpenMP with one rank per socket and threads within each, over two nodes; full MPI with one single-threaded rank per core. On GPUs: one rank driving one GPU through CUDA; one rank per GPU over two nodes, rank n of a node using GPU n; and, with ZCFD_DEV_OVERSUBSCRIBE_GPU set, four ranks sharing two GPUs, rank n using GPU n mod 2. MPI joins ranks through shared memory within a node and libfabric between nodes.](/images/parallel-execution-modes.svg "Parallel execution modes")

zCFD divides the mesh into partitions, one for each MPI rank. The \`-n\` flag sets the number of ranks and \`-t\` the number of ranks on each node. Within a CPU rank, OpenMP threads share the work of its partition. A GPU rank runs its partition on one GPU through CUDA.

The released package uses Intel MPI. Ranks on the same node communicate through shared memory, and ranks on different nodes through libfabric, which can use interconnects such as InfiniBand or the AWS Elastic Fabric Adapter. The licence is checked out for the number of ranks in the run, so it must cover that number.

There are two strategies for running on CPUs:

**Hybrid MPI/OpenMP** runs one MPI rank per socket, with OpenMP threads on the cores of that socket. At large core counts this keeps the number of ranks, and with it the cost of communication, low.

**Full MPI** runs one single-threaded MPI rank per core. It is usually the better choice at low core counts.

### Hybrid MPI/OpenMP

When \`OMP_NUM_THREADS\` is not set, zCFD sets the number of threads for each rank to the CPUs of the node divided by the number of ranks on it. Under Slurm, it divides the CPUs the job holds on each node instead. A smaller value of \`OMP_NUM_THREADS\`, or of \`-o\`, takes precedence; a larger one is reduced to this number.

For example, on two hosts each with two 12-core CPUs, request one rank per CPU socket. Where each core runs one hardware thread, each rank then runs 12 threads.

\`\`\`bash
run_zcfd -n 4 -t 2 -d cpu -c <case>
\`\`\`

### Full MPI

Set \`OMP_NUM_THREADS\` to 1 and give the number of ranks with \`-n\`.

For example, on two hosts each with two 12-core CPUs, one rank per core:

\`\`\`bash
export OMP_NUM_THREADS=1
run_zcfd -n 48 -t 24 -d cpu -c <case>
\`\`\`

### GPU Parallel Execution

zCFD assigns GPUs to MPI ranks on GPU-enabled nodes. GPUs are numbered in the order of their PCI bus.

**Single rank per GPU:** this is the default, and suits most workloads. Rank n on a node uses GPU n of that node, so each rank has a GPU to itself. When \`-d\` is left out, a rank with no GPU of its own runs on the CPU.

For a node with 4 GPUs, one rank on each:

\`\`\`bash
run_zcfd -n 4 -d gpu -c <case>
\`\`\`

**Multiple ranks per GPU (experimental):** to let several MPI ranks share a GPU, set the \`ZCFD_DEV_OVERSUBSCRIBE_GPU\` environment variable (see [Command line environment variables](/reference/command-line/environment-variables)). Rank n on a node then uses GPU n mod G, where G is the number of GPUs on the node.

::: {.warning}
GPU oversubscription is an experimental feature. It may reduce performance, and is intended for debugging where GPUs are few.
:::

It is useful for:

- testing and development with few GPUs
- debugging with smaller problem sizes
- workloads that make little use of the GPU

For a node with 4 GPUs, 8 ranks, 2 on each GPU:

\`\`\`bash
export ZCFD_DEV_OVERSUBSCRIBE_GPU=1
run_zcfd -n 8 -d gpu -c <case>
\`\`\`

**Example assignments with oversubscription enabled:**

- 4 GPUs, 4 ranks: GPU assignment [0,1,2,3]
- 4 GPUs, 8 ranks: GPU assignment [0,1,2,3,0,1,2,3]
- 4 GPUs, 6 ranks: GPU assignment [0,1,2,3,0,1]

See [Command line parallel invocation](/reference/command-line/parallel-invocation) for running across multiple machines, libfabric provider selection and other advanced parallel settings.
`;export{e as default};