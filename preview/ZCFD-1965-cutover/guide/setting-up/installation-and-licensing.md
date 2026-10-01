---
title: Installation and licensing
section: guide
group: Setting up
order: 10
---

# Installation and licensing

## System requirements

zCFD is supported on the following Linux distributions:

- RHEL 7+
- CentOS 7+
- Ubuntu 20.04+
- Windows 10/11 via [WSL2](https://learn.microsoft.com/en-us/windows/wsl/install)

By default zCFD is compiled for x86_64 but is available for ARM and IBM Power on request.

### GPU support

zCFD supports running on NVidia GPUs with a compute capability of 6.1 and above (See [Compute Capability](https://developer.nvidia.com/cuda-gpus)).

An AMD GPU (HIP) based version is available on request.

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

zCFD requires a licence. If you do not already have a licence, please contact [`zcfd@zenotech.com`](mailto:zcfd@zenotech.com) to obtain one. When zCFD starts it will look in the following locations for a licence file:

1. 'zcfd.lic' in the directory alongside the input files
2. 'zcfd.lic' in the lic directory of the zCFD installation. i.e. /<path to zCFD install>/lic/
3. RLM_LICENSE environment variable

The RLM_LICENSE environment variable can be defined as below.

```bash
export RLM_LICENSE=/path/to/license/file
```

or, where port is the port number in the licence file, and host is the hostname in the licence file

```bash
export RLM_LICENSE=port@server
```

In the case that the system running the simulation cannot access the internet a local licence server will be required. See http://www.reprisesoftware.com/admin/software-licensing.php for details.

### Licence error codes

Below is a list of some of the error codes that you may encounter due to licensing errors.
If the error code you receive is not listed, please see RLM's documentation at https://reprisesoftware.com/docs/isv/appendix/appendix-b-rlm-status-values.html or contact us.

| Error Code | Description                             | Possible Remedy                                                                                                                                                                                        |
| ---------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| -3         | Licence has expired                     | Contact us to renew your licence                                                                                                                                                                       |
| -6         | Requested version is not supported      | Your licence is for an older product version; contact us to upgrade                                                                                                                                    |
| -8         | checkout request for too many licences  | Reduce the number of ranks that you are running the solver on or stop any existing running processes.                                                                                                  |
| -17        | Error communicating with server         | There was a connectivity issue connecting to the licence server. Check that you have connectivity to the licence server; check firewall settings and any endpoint security software you may be running |
| -21        | No heartbeat                            | The licence heartbeat was not received; check that the licence server is still running and that have connectivity to it                                                                                |
| -22        | All licences in use                     | All licences are currently in use; stop any running processes to free up a licence.                                                                                                                    |
| -37        | Licence start date has not been reached | Your licence has not yet become valid. Contact us if you believe this to be in error                                                                                                                   |
| -102       | Can't read licence data                 | Check the permissions on the licence file on the server                                                                                                                                                |
| -103       | Network error                           | Check that you have connectivity to the licence server; this may involve opening a port on your firewall or connecting to the internet                                                                 |
| -104       | Error writing to network                | Check your connectivity to the licence server; check firewall settings and any endpoint security software you may be running                                                                           |
| -105       | Error reading from network              | Check your connectivity to the licence server; check firewall settings and any endpoint security software you may be running                                                                           |
| -106       | Unexpected response from licence server | Check that your licence configuration is pointing to the correct server                                                                                                                                |
| -107       | HELLO message for wrong server          | Check that your licence configuration is pointing to the correct server                                                                                                                                |
| -108       | Error in private key                    | There is an issue with your server side licence file - contact us to resolve this issue                                                                                                                |
| -109       | Error signing authorization             | There is an issue with your server side licence file - contact us to resolve this issue                                                                                                                |
| -110       | Internal error                          | An error occurred in the licence server - contact us if this error repeats itself                                                                                                                      |
| -111       | Connection refused at server            | Check your firewall settings and that you are pointing at the correct licence server                                                                                                                   |
| -112       | No server to connect to                 | Check that the server is running and that you are pointing at the correct licence server                                                                                                               |
| -113       | Bad Communication handshake             | Check that the server is running and that you are pointing at the correct licence server                                                                                                               |
| -114       | Can't get ethernet address              | Check that the user that you are running as has correct permissions to query the network card                                                                                                          |
