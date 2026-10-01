---
title: Monitoring a run
section: guide
group: Working with
order: 25
---

# Monitoring a run

zMon is a run monitor that opens in a web browser. It plots the residuals, forces, moments and monitor points of a
running case as the solver writes them, alongside the solver log, and can ask the solver to stop cleanly.

## Starting zMon

zMon is installed with zCFD. Activate the zCFD environment, change to the case directory and name the control file:

```bash
source <ZCFD_INSTALL_PATH>/bin/activate
cd ~/zcfd_tutorial_1/
zmon naca0012.py
```

zMon prints the address it is serving, such as `zMon is at http://localhost:40213`, and opens that address in the
default browser. Where no browser can be opened, it prints the address for you to open by hand. Run `zmon` without a
file to start with the file browser instead. zMon keeps running until you press _Ctrl + C_ in its terminal; closing
the browser tab leaves it running.

To use zMon outside a zCFD installation, install it from PyPI:

```bash
pip install zmon
```

The command accepts these options:

| Option             | Effect                                                                                                                                                   |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--port`           | The port to listen on. Without it, zMon uses the port in the `ZMON_PORT` environment variable, or else an unused port chosen by the operating system.    |
| `--host`           | The address to bind, by default `127.0.0.1`. Any other address, such as `0.0.0.0`, exposes the file browser to anyone who can reach it over the network. |
| `--no-browser`     | Print the address without opening a browser.                                                                                                             |
| `--exit-when-idle` | Shut down once no browser is connected. zMon waits 30 seconds for the first browser, and stops shortly after the last one disconnects.                   |
| `--version`        | Print the installed version and exit.                                                                                                                    |

## Opening a run

zMon opens a run from either of two files:

- **The control file.** zMon reads the deck to find every file the solver writes for it: each model's report file,
  the run log and the real time step. This is the usual way to open a run, and the only one from which the run
  can be stopped.
- **A report file.** Opening a `<model>_report.csv` directly shows that model's plots and nothing else. There is no
  deck to read, so the time step is unknown and the plots are drawn against cycles and time steps rather than
  simulated seconds.

A control file can be opened before the solver has started. zMon predicts the report file of each entry under the
deck's [`model`](/reference/input-deck#model) key, and the plots fill in once the solver begins writing them.

The file browser opens when zMon is started without a file, and from the _Open File_ button on the toolbar. It lists
one directory at a time, with a filter box, pinned folders and recently opened files and folders. Two kinds of file
carry a badge: `report` marks a report file, and `control` marks a control file with a mesh of the same name beside
it. Several files can be selected and opened together.

Each opened run appears as a tab across the top of the page, so several runs can be watched at once. Closing a tab
stops zMon watching that run; it does not affect the solver.

## Reading the dashboard

Every panel reads the model's report file, which the solver appends to every
[`frequency`](/reference/solver/output-settings#report-frequency) cycles. zMon checks the file each second and adds new
rows to the plots as they arrive, so the dashboard updates at the reporting interval. The columns themselves are
described in [The report file](../working-with/post-processing-and-visualisation.md#the-report-file).

**Drag and Lift.** Two summary cards show the latest value of a force coefficient with a short history beneath it.
Each card has a menu listing every [`forces`](/reference/solver/output-settings#report-forces) block in the report,
split into total, pressure, friction and transformed components. The X, Y and Z buttons choose the direction, which
is X for drag and Z for lift until changed.

**Residuals.** The plot has one line per equation, drawn from the report's residual columns on a logarithmic axis. The momentum
components `rhoV[0]`, `rhoV[1]` and `rhoV[2]` are labelled `rhoU`, `rhoV` and `rhoW`. When the report carries
[`residual_statistics`](/reference/solver/output-settings#report-residual-statistics) columns, a row of buttons above
the plot switches between the residual itself and the `Rinf`, `Rrms`, `Rtop` and `Neff` families; hovering over a
button describes the measure. `Neff` is a count of cells and is drawn on a linear axis. The measures are explained in
[Residual statistics columns](../working-with/post-processing-and-visualisation.md#residual-statistics-columns).

**Monitor points.** This panel lists every other named column in the report. One or more can be plotted
together. It holds the [`monitor`](/reference/solver/output-settings#report-monitor) columns and the
[`mass_flow`](/reference/solver/output-settings#report-mass-flow) columns, named as described in
[Monitor points](../working-with/post-processing-and-visualisation.md#monitor-points) and
[Mass flow](../working-with/post-processing-and-visualisation.md#mass-flow).

**Force and moment panels.** Six plots, one for each force and moment direction, each with a menu of the matching
columns. Choosing a column in any one panel moves the other five to the same forces block and component. The column
names follow [Output names](../working-with/post-processing-and-visualisation.md#output-names). Zooming along the
horizontal axis of one force or moment plot applies the same range to the others; a double-click resets the view.

Any panel can be closed with the cross at its corner and restored from the panel menu on the toolbar. The browser
remembers which panels were open.

### Cycles, time steps and spectra

A strip of buttons at the edge of each plot chooses the horizontal axis:

- **Cycle** plots every report row against the solver cycle.
- **Time step** plots against the real time step of an unsteady run. When zMon has read the deck and
  [`type`](/reference/solver/time-settings#type) is unsteady, the axis is the simulated time in seconds, from
  [`time_step`](/reference/solver/time-settings#time-step).

In either mode a second pair of buttons chooses between every inner cycle, drawn as a sawtooth, and one converged value
per real time step: the last inner cycle for forces and monitor points, and the smallest residual for the residuals.
Once the report shows an unsteady run, zMon switches the panels to the time-step axis, and all but the residuals to
converged values.

In time-step mode, the monitor-point, force and moment panels and the two summary cards offer a frequency view: the
amplitude spectrum of the converged values. A plot's spectrum covers the range visible in its time view, so zooming
in on the time view first excludes the start-up transient. The frequency is in hertz when the time step is known, and
in cycles per time step otherwise.

## Overset runs

An overset run opened from its control file appears as one tab with a sub-tab for each model, named by its key under
[`model`](/reference/input-deck#model), and an _Overview_ sub-tab. Each model's sub-tab is the full dashboard for that
model's report file. A dot beside each model's name shows whether its report has been written in the last
30 seconds (green), not recently (amber), or not at all (red).

The Overview shows two things across all the models, each model in a colour of its own:

- **Combined residuals.** The density residual of every model on one plot, or the first residual column where there
  is no density equation. The buttons above the plot show or hide each model.
- **Forces and moments summary.** A table of each model's latest transformed total force and moment, with their sum
  across all the models, and thrust and torque where a model reports a rotating zone. It reads the transformed
  columns only, so it is populated only for forces blocks that set a
  [`transform`](/reference/solver/output-settings#report-forces-transform).

The layout of an overset deck is described in [Overset meshes](../working-with/overset-meshes.md).

## Log and cycle time

Below the plots, the _Log Output_ panel shows the last 500 lines of the run log, `<case>.log` in the case directory,
with the solver's colours preserved. It refreshes every two seconds. In an overset run every sub-tab shows the same
log, because the run writes one.

The _Cycle Time_ card shows the latest `AvgCycleTime` value from the report, the mean wall-clock time of a solver
cycle over the last reporting interval, with its history beneath it. Its meaning, and why it is not comparable between
runs, is covered in [Cycle time column](../working-with/post-processing-and-visualisation.md#cycle-time-column).

## Stopping a run

The _Stop_ button on the toolbar asks the solver to stop cleanly. After confirmation, zMon writes an empty file named
`<case>.stop` into the case directory, where `<case>` is the control file's name without `.py`. One file stops the
whole run, including every model of an overset run. Creating the file by hand has the same effect:

```bash
touch naca0012.stop
```

The solver looks for the file each time it writes a report row. A steady run writes its final output and stops at the
end of that cycle. A dual time-stepping run completes the current real time step first. The solver deletes the file
when it acts on it, and removes any left over from an earlier run when it starts.

::: {.note}
The stop request reaches the solver only when the run was opened from its control file. A report file opened on its
own lies inside the output directory, and a stop file written beside it is never read.
:::

## What zMon needs to read a run

To open a control file, zMon executes it in a separate Python interpreter and reads the run's layout with the same
`zutil` routines that zCFD's own post-processing tools use. Three things follow:

- **A zCFD environment.** The interpreter running zMon must be able to import `zutil`. It can do so inside an activated zCFD environment, but not in an installation made with `pip install zmon` alone. There, opening a control file fails with a message to run zMon in a zCFD environment. A report file opens in either.
- **A single deck for the run.** The control file must declare `"config_version": 2`, with every mesh as an entry
  under [`model`](/reference/input-deck#model). A driver file that lists mesh and control-file pairs in an `override`
  dictionary is refused, with a message describing the single-deck form.
- **The solver's own layout.** zMon expects the files where the solver writes them: `<case>.log` beside the control
  file, and each model's report at `<case>_OUTPUT/<model>/<model>_report.csv`. A run whose output has been moved or
  renamed cannot be resolved from its control file, though its report files can still be opened directly.

A control file that takes longer than 20 seconds to execute is abandoned with a timeout message.
