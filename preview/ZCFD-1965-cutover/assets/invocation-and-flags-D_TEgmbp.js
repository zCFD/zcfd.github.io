var e=`
# Command line invocation and flags

To run zCFD on the command-line:

\`\`\`bash
run_zcfd -n <num_tasks> -d <device_type> -p <mesh_name> -c <case_name>
\`\`\`

where:

| Parameter       | Value      | Description                                                   |
| --------------- | ---------- | ------------------------------------------------------------- |
| **num_tasks**   | Integer    | The number of partitions (one per device socket - CPU or GPU) |
| **device_type** | CPU or GPU | Specifies whether or not to use GPU(s) if present             |
| **mesh_name**   | String     | The name of the mesh file (<mesh>.h5)                         |
| **case_name**   | String     | The name of the control dictionary (<control_dict>.py)        |

See [Running zCFD](../../guide/setting-up/running-zcfd.md#command-line-execution) for worked examples of these flags, and [Running zCFD \u00a7 Multiple Meshes and Overset Cases](../../guide/setting-up/running-zcfd.md#multiple-meshes-and-overset-cases) for the invocation used when a case has more than one mesh (no separate \`-p\` argument; \`-c\` alone is sufficient).

## Input Validation

zCFD provides an input validation script which can be used to check the solver control dictionary before run time reducing the likelihood of a job spending a long time queuing only to fail at start up.

The script can be executed from the zCFD environment as follows:

\`\`\`bash
validate_input <case_name> [-m <mesh_name>]
\`\`\`

If the -m option is given with a mesh file the script will check whether any zones specified as lists to boundary conditions, transforms or reports in the input exist in the mesh.

## Batch Queue Submission

To run zCFD on a compute cluster with a queuing system (such as Slurm), the command-line environment activation is included within the submission script:

Example Slurm submission script "run_zcfd.sub":

\`\`\`bash
#!/bin/bash
#SBATCH -J account_name
#SBATCH --output zcfd.out
#SBATCH --nodes 2
#SBATCH --ntasks 4
#SBATCH --exclusive
#SBATCH --time=10:00:00
#SBATCH --gres=gpu:2
#SBATCH --cpus-per-task=16
source /INSTALL_LOCATION/zCFD-version/bin/activate
run_zcfd -n 4 -d gpu -p <mesh_name> -c <case_name>
\`\`\`

This system has 2 nodes, each with 2 GPUs. One task is allocated per GPU, giving a total of 4 tasks. The value of num_tasks, in this case 4, on the last line should match Slurm "ntasks" on line 5. The case is run in "exclusive" mode which means that zCFD has uncontested use of the devices. Each node has a 64-core CPU, giving 16 CPU cores for each of the 4 tasks. The "gres" line tells zCFD that there are 2 GPUs available on each node.

The submission script would be submitted from the command-line:

\`\`\`bash
sbatch run_zcfd.sub
\`\`\`

The job can then be managed using the standard Slurm commands.

::: {.note}
Users unfamiliar with the batch submission parameters in a specific system should consult the system administrator.
:::
`;export{e as default};