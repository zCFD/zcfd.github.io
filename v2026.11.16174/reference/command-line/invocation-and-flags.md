---
title: Command line invocation and flags
section: reference
group: Command line
order: 10
---

# Command line invocation and flags

To run zCFD on the command line:

```bash
run_zcfd -c <case> [-n <ranks>] [-t <ranks_per_node>] [-o <threads>] [-d cpu|gpu]
```

| Flag              | Default                | Meaning                                                                   |
| ----------------- | ---------------------- | ------------------------------------------------------------------------- |
| `-c`, `--case`    | required               | the control file, `<case>.py`; the `.py` extension may be left out        |
| `-n`, `--ntask`   | 1                      | the number of MPI ranks, and so the number of mesh partitions             |
| `-t`, `--tpn`     | 1                      | the number of MPI ranks on each node                                      |
| `-o`, `--otpt`    | set by zCFD            | the number of OpenMP threads for each rank, exported as `OMP_NUM_THREADS` |
| `-d`, `--device`  | detected for each rank | `cpu` or `gpu`                                                            |
| `-v`, `--version` |                        | print the zCFD version and exit                                           |
| `-h`, `--help`    |                        | print the usage and exit                                                  |

`zcfd` is a shorter name for the same command and takes the same flags.

The control file names each mesh with the [`mesh`](/reference/model#mesh) key of its entry under `model`. See [Running zCFD](../../guide/setting-up/running-zcfd.md#command-line-execution) for worked examples of these flags, and [Running zCFD § Multiple Meshes and Overset Cases](../../guide/setting-up/running-zcfd.md#multiple-meshes-and-overset-cases) for a case with more than one mesh, which is run with the same command.

## Licence check

```bash
run_zcfd --check-license
```

checks out the zCFD licence, reports each licensed product with its seats, expiry and source, and exits. It takes no case. See [Installation and licensing](../../guide/setting-up/installation-and-licensing.md#checking-the-licence).

## Input Validation

zCFD provides an input validation script which can be used to check the solver control dictionary before run time reducing the likelihood of a job spending a long time queuing only to fail at start up.

The script can be executed from the zCFD environment as follows:

```bash
validate_input <case>
```

The script checks the control file against the schema. It does not read the mesh.

## Batch Queue Submission

To run zCFD on a compute cluster with a queuing system (such as Slurm), the command-line environment activation is included within the submission script:

Example Slurm submission script "run_zcfd.sub":

```bash
#!/bin/bash
#SBATCH -J zcfd
#SBATCH --output zcfd.out
#SBATCH --nodes 2
#SBATCH --ntasks 4
#SBATCH --exclusive
#SBATCH --time=10:00:00
#SBATCH --gres=gpu:2
#SBATCH --cpus-per-task=16
source /INSTALL_LOCATION/zCFD-version/bin/activate
run_zcfd -n 4 -t 2 -d gpu -c <case>
```

This system has 2 nodes, each with 2 GPUs. One task is allocated per GPU, giving a total of 4 tasks. The value given to `-n`, in this case 4, on the last line should match Slurm 'ntasks' on line 5, and `-t` gives the 2 tasks on each node. The case is run in 'exclusive' mode which means that zCFD has uncontested use of the devices. Each node has a 64-core CPU, giving 16 CPU cores for each of the 4 tasks. The 'gres' line tells Slurm that there are 2 GPUs available on each node.

The submission script would be submitted from the command-line:

```bash
sbatch run_zcfd.sub
```

The job can then be managed using the standard Slurm commands.

::: {.note}
Users unfamiliar with the batch submission parameters in a specific system should consult the system administrator.
:::
