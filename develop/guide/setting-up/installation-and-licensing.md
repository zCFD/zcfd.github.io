---
title: Installation and licensing
section: guide
group: Setting up…
order: 10
---

# Installation and licensing

## System requirements

| Component        | Requirement                                                                                                                                                        |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Operating system | 64-bit x86 Linux with glibc 2.28 or newer, such as RHEL, Rocky Linux or AlmaLinux 8 or newer, or Ubuntu 20.04 or newer                                             |
| Windows          | Windows 10 or 11, through [WSL2](https://learn.microsoft.com/en-us/windows/wsl/install)                                                                            |
| NVIDIA GPU       | Compute capability 8.0, 8.6, 8.9, 9.0, 10.0 or 12.x: Ampere, Ada Lovelace, Hopper and Blackwell (see [Compute Capability](https://developer.nvidia.com/cuda-gpus)) |
| NVIDIA driver    | 570 or newer                                                                                                                                                       |
| CUDA             | The CUDA 12.8 runtime is included with zCFD; no CUDA toolkit is needed                                                                                             |
| MPI              | Intel MPI 2021.13 is included with zCFD                                                                                                                            |
| Python           | Python 3.12 is included with zCFD                                                                                                                                  |

On a GPU outside this list, zCFD prints a warning, disables the GPU and runs on the CPU.

An AMD GPU (HIP) version is available on request.

## Linux / Unix

If you are running Linux/Unix zCFD is provided as a stand-alone installer containing all the packages required to get started. The installer is available for download from the [zCFD website](https://zcfd.zenotech.com).
Once the zCFD installer has been downloaded run the install script and follow the prompts.

```bash
$ bash zCFD-icx-sse-impi-<INSTALL_VERSION>-Linux-64bit.sh
```

Then copy the licence file provided over email into the lic folder in the install directory.

```bash
$ cp zcfd.lic /<path to zCFD install>/lic/
```

Once zCFD has been installed the zCFD environment can be activated from a bash shell:

```bash
$ source /<path to zCFD install>/bin/activate
(zCFD)$
```

The zCFD environment's Python accepts further packages. With the environment active, `pip install <package>` installs into the zCFD installation, where the solver and any Python functions in a control file can import it. Packages installed with `pip install --user`, or into a separate virtual environment, are not visible to the solver.

## Windows

zCFD can be run locally on windows machines if Windows Subsystem for Linux 2 (WSL2) is installed. To install WSL2, follow the Microsoft instructions which can be found [here](https://learn.microsoft.com/en-us/windows/wsl/install).

The chosen Linux distribution shouldn't have an effect on how the code runs, but the Linux distributions listed above are supported.

To access your Linux filesystem on Windows it can be useful to add a quick access link in file explorer. To do this, in the address in file explorer enter

```
\\wsl$\
```

This will show you the root folders for your installed Linux distributions.

The installer is available for download from the [zCFD website](https://zcfd.zenotech.com). For WSL, download the standard Linux distribution. Once the zCFD installer has been downloaded run the install script from within the WSL2 environment and follow the prompts.

```bash
$ bash zCFD-icx-sse-impi-<INSTALL_VERSION>-Linux-64bit.sh
```

Then copy the licence file provided over email into the lic folder in the install directory.

```bash
$ cp zcfd.lic /<path to zCFD install>/lic/
```

Once zCFD has been installed the zCFD environment can be activated:

```bash
$ source /<path to zCFD install>/bin/activate
(zCFD)$
```

## Licence

zCFD requires a licence. To obtain one, contact [`zcfd@zenotech.com`](mailto:zcfd@zenotech.com). When zCFD starts, it looks for a licence in the following places:

1. Any licence file, such as `zcfd.lic`, in the directory from which the solver is started.
2. Any licence file in the `lic` directory of the zCFD installation, `/<path to zCFD install>/lic/`. This location is searched only when the zCFD environment has been activated.
3. The `RLM_LICENSE` or `zenotech_LICENSE` environment variable.

A licence file is any file whose name ends in `.lic`.

The environment variable can name a licence file:

```bash
export RLM_LICENSE=/path/to/licence/file
```

or a licence server, where `port` and `host` are the port number and hostname given in the licence file:

```bash
export RLM_LICENSE=port@host
```

A system that cannot reach the internet requires a local licence server. The RLM licence server `rlm` and the Zenotech licence server `zenotech` are installed in the `lic` directory of the zCFD installation. See http://www.reprisesoftware.com/admin/software-licensing.php for how to run them.

### Checking the licence

To check the licence before submitting a job, run:

```bash
run_zcfd --check-license
```

zCFD checks out its licence for the installed version, reports it and exits. It needs no case or mesh. A served licence with a seat limit reports:

```text
zCFD licence check passed
  zcfd-core       2026.10   4 seats         expires 31-mar-2027   5053@licserver
  zcfd-feat       2026.10   64 seats        expires 31-mar-2027   5053@licserver
  MPI ranks free now: 33
```

`zcfd-feat` needs one seat for each MPI rank, so a job of more ranks than are free waits or fails with error -22. The last column shows the licence server or licence file in use. If the checkout fails, zCFD reports the error code listed below and exits with a non-zero status.

### Licence error codes

When a licence cannot be checked out, zCFD reports `Error checking out license` followed by the RLM status value, the product, the version and the number of licences requested, and then stops. The product is `zcfd-core` for the solver itself and ends in `-feat` for a solver feature. A feature is checked out once for each MPI rank.

The table lists the status values most often encountered. For any other value, see the RLM documentation at https://reprisesoftware.com/docs/isv/appendix/appendix-b-rlm-status-values.html or contact us.

| Error Code | Description                            | Possible Remedy                                                                                                                                  |
| ---------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| -1         | No authorisation for product           | The licence does not include the product or feature named in the message. Contact us to add it                                                   |
| -3         | Licence has expired                    | Contact us to renew your licence                                                                                                                 |
| -4         | Wrong host for authorisation           | The licence is locked to a different machine. Run on the licensed machine, or contact us to move the licence                                     |
| -5         | Bad key in authorisation               | The licence file has been altered or damaged. Restore the file as issued, or contact us for a replacement                                        |
| -6         | Requested version not supported        | Your licence is for an older version of zCFD. Contact us to upgrade                                                                              |
| -8         | Checkout request for too many licences | The licence permits fewer MPI ranks than requested. Run on fewer ranks                                                                           |
| -17        | Error communicating with server        | Check the connection to the licence server, the firewall settings and any endpoint security software                                             |
| -18        | Licence server does not support this   | The server holds no licence for this product or version. Check that `RLM_LICENSE` names the correct server                                       |
| -22        | All licences in use                    | Stop other zCFD runs to free a licence, or wait for them to finish                                                                               |
| -37        | Licence start date not reached         | Your licence is not yet valid. Contact us if you believe this to be in error                                                                     |
| -102       | Can't read licence data                | No readable licence was found. Check that a licence file is in one of the places listed above, that it is readable, or that `RLM_LICENSE` is set |
| -103       | Network error                          | Check the connection to the licence server. This may require opening a port in the firewall or connecting to the internet                        |
| -104       | Error writing to network               | Check the connection to the licence server, the firewall settings and any endpoint security software                                             |
| -105       | Error reading from network             | Check the connection to the licence server, the firewall settings and any endpoint security software                                             |
| -106       | Unexpected response                    | Check that `RLM_LICENSE` names the correct licence server                                                                                        |
| -107       | HELLO message for wrong server         | Check that `RLM_LICENSE` names the correct licence server                                                                                        |
| -108       | Error in private key                   | The licence file on the server is faulty. Contact us to resolve it                                                                               |
| -109       | Error signing authorisation            | The licence file on the server is faulty. Contact us to resolve it                                                                               |
| -110       | Internal error                         | The licence server encountered an error. Contact us if it recurs                                                                                 |
| -111       | Connection refused at server           | Check the firewall settings and that `RLM_LICENSE` names the correct licence server                                                              |
| -112       | No server to connect to                | Check that the licence server is running and that `RLM_LICENSE` names it correctly                                                               |
| -113       | Bad communications handshake           | Check that the licence server is running and that `RLM_LICENSE` names it correctly                                                               |
| -114       | Can't get ethernet address             | Check that the user running zCFD has permission to query the network card                                                                        |

During a run, zCFD confirms with the licence server every 30 seconds that the licence is still held. If the server stops responding, zCFD logs `Connection to license server failed retrying` and continues. If the connection is not restored within 10 minutes, zCFD stops with `License heart beat failed`.
