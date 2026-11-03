var e=`
# Trimming to a target

A farfield can turn its own angle of attack until a force coefficient reaches a value you set. The run trims, holds the
trimmed angle, and reports the angle it found:

\`\`\`python
"BC_3": {
    "zones": [1],
    "type": "farfield",
    "condition": "IC_1",
    "kind": "riemann",
    "target": {"alpha": {"cl": 1.0778, "hold": 500}},
}
\`\`\`

This asks for the angle of attack that gives a lift coefficient of 1.0778, and for 500 cycles at that angle once it is
found.

## Setting up a trim

1. **Report the force on the body.** The coefficient is read from a force report on the walls of the body, so the
   case needs one under \`output_settings\` \u203a \`report\` \u203a \`forces\`, written as coefficients (the default) with
   \`reference_area\` set to the body's reference area (it is 1 unless set).
   With more than one force report, name the one to trim with \`of\`.

   \`\`\`python
   "report": {"frequency": 10, "forces": {"FR_1": {"name": "wall", "zones": [4]}}},
   \`\`\`

2. **Start the farfield near the answer.** The trim starts from the angle of the farfield's own condition. Any angle
   works, but a start within a few degrees of the answer saves a step or two. The speed, the Mach number and the
   sideslip of the condition are kept.

3. **Add the target** to the farfield, as above: the coefficient (\`cl\` or \`cd\`) and, usually, a \`hold\`.

4. **Give the run enough cycles.** \`cycles\` stays the budget. Allow for the trim, a few hundred cycles for each step,
   plus the hold. The aerofoil above trims from 0\u00b0 to 10\u00b0 in about 2300 cycles on a 449 \u00d7 129 mesh.

5. **Read the result.** The log ends with the trimmed angle and the coefficient it reached, the report file carries
   the angle and coefficient on every report row, and the status file records whether the target was met. To reuse
   the angle in another run, paste the vector printed on the end line into the condition, or restart from this run.

The run must be steady and compressible. Any other run keeps the condition's own angle and says so in a warning.

## What a run does

The run starts at the angle of the farfield's own \`condition\`. Before each step it waits for the coefficient to
settle: three successive means, each over a few report rows, must agree within \`tolerance\`. Two are not enough,
because after a step the coefficient can sit on a short plateau before it falls to its real value. It then steps the angle towards
the target, by no more than 4\u00b0 at a time, and waits again. The first step for \`cl\` follows from the thin-aerofoil lift
slope; later steps follow from the slope fitted through the settled values seen so far. The target is met when the
settled value lies within \`tolerance\` of it.

Well above zero lift, the coefficient creeps towards its settled value for many hundreds of cycles. When the last few
means are closing in steadily, the run works out the value they are heading for and steps on that, rather than waiting
for the creep to finish. A step taken this way shows the predicted value in its log line, as \`cl 0.7531 (heading for
1.0412)\`. A prediction only ever starts a step; the target is met, and a stall is confirmed, only on a settled value.

If a higher angle gives less lift rather than more, the aerofoil has stalled. The run does not step beyond the angle of
greatest measured lift, and a \`cl\` target above that lift is reported as not met, naming the peak it measured.

Drag is the same at plus and minus the same angle, so a \`cd\` target is searched for on one side only: on the side of
the starting angle, or at positive angles when the run starts at 0\u00b0.

Once the target is met the angle is frozen and the run carries on under its ordinary
[convergence control](/reference/solver/convergence-control). If the coefficient drifts outside \`tolerance\` while the
angle is held, the run trims again.

| Key         | Meaning                                                                                                                   |
| ----------- | ------------------------------------------------------------------------------------------------------------------------- |
| \`cl\`, \`cd\`  | the target lift or drag coefficient; give exactly one                                                                     |
| \`hold\`      | the number of cycles to run once the target is met, after which the run stops; left out, the run ends in the ordinary way |
| \`tolerance\` | the largest absolute difference from the target that counts as met; 0.001 for \`cl\` and 0.0001 for \`cd\` if left out        |
| \`of\`        | the name of the [force report](/reference/solver/output-settings/report#forces) the coefficient comes from                |
| \`axes\`      | the forward and up axes the angle is measured in; see [Axes](#axes)                                                       |

\`of\` may be left out when the deck has a single force report. With more than one it is required, and it must name one
of them.

### Hold and cycles

[\`cycles\`](/reference/solver/convergence-control#cycles) remains the budget for the whole run, and the ordinary stops
still apply, so a \`hold\` can only end a run sooner. A run whose budget runs out during the hold stops at the budget and
says so in a warning, for example \`held for only 230 of 500 cycles\`. Allow enough cycles for the trim and the hold
together.

### When the target is not met

A run that reaches the end of its budget without meeting the target still finishes normally: it writes its usual output
and exits without an error. Its last line states the shortfall plainly, and the status file records the target as not
met, so a post-processing script can check it without reading the log.

## Tuning

The defaults suit most runs, and a deck need not mention any of this. A run that steps too eagerly, or waits too long,
can be tuned with an \`advanced\` block inside \`alpha\`:

\`\`\`python
"target": {
    "alpha": {
        "cl": 1.0778,
        "hold": 500,
        "advanced": {"max_step": 1.0, "average_over": 20},
    }
}
\`\`\`

| Key            | Default   | Meaning                                                                       | When to change it                                                                                            |
| -------------- | --------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| \`max_step\`     | 4         | the largest change of angle in one step, in degrees, up to 6                  | lower it near stall or for a sensitive configuration; above 6\u00b0 a single jump can make the flow solve diverge |
| \`relaxation\`   | 1         | the fraction of the computed step that is taken, greater than 0 and at most 2 | lower it if the angle overshoots and swings about the target                                                 |
| \`average_over\` | 10        | the number of report rows averaged into each measurement                      | raise it when the coefficient oscillates from row to row                                                     |
| \`max_wait\`     | 1500      | the cycles to wait after a step before stepping anyway, settled or not        | raise it for a flow that settles slowly; lower it to trade accuracy for a shorter trim                       |
| \`slope\`        | see below | a first guess of the change of the coefficient per degree                     | set it when the lift slope is known to differ from that of a thin aerofoil, or for \`cd\`                      |

Left out, \`slope\` is 0.11 per degree for \`cl\`, the thin-aerofoil slope of 2\u03c0 per radian. For \`cd\` there is no such
guess, so the first step is a probe of half \`max_step\`.

## Axes

The angle of attack is measured in the plane of a forward and an up axis, from forward towards up. Lift is
perpendicular to the freestream, towards up, and drag lies along it.

The axes default to forward +x and up +z, the ESDU convention that \`zutil.vector_from_angle\` also uses. With angle of
attack $\\alpha$ and sideslip $\\beta$, the velocity is

$$
\\mathbf{v} = |\\mathbf{v}| \\, (\\cos\\alpha \\cos\\beta, \\; \\sin\\beta, \\; \\sin\\alpha \\cos\\beta),
$$

so $\\alpha$ turns the flow from +x towards +z and $\\beta$ turns it out of that plane towards +y. A mesh built with
another up axis states its own:

\`\`\`python
"target": {"alpha": {"cl": 0.5}, "axes": {"forward": "+x", "up": "+y"}}
\`\`\`

Each axis is one of \`+x\`, \`-x\`, \`+y\`, \`-y\`, \`+z\` and \`-z\`, and the two must be at right angles. Turning the angle keeps
the speed and the sideslip of the condition unchanged.

## What the run reports

Each line of the log about the target begins with \`target\`, followed by the boundary condition's key as the deck spells it. A line appears only when something changes: once at the start, stating the axes, then at each step,
when the target is met, and at the end. This is the NACA 0012 at Mach 0.15 trimmed to its lift coefficient at 10\u00b0:

\`\`\`text
target BC_3: trimming alpha (x\u2013z plane, forward +x, up +z) for cl 1.0778, then hold 500 cycles
target BC_3: cycle  200  alpha  0.000\u00b0 \u2192  4.000\u00b0   cl 0.0000   target 1.0778
target BC_3: cycle  600  alpha  4.000\u00b0 \u2192  8.000\u00b0   cl 0.4369 (heading for 0.4378)   target 1.0778
target BC_3: cycle 1100  alpha  8.000\u00b0 \u2192  9.790\u00b0   cl 0.8245 (heading for 0.8808)   target 1.0778
target BC_3: cycle 1500  alpha  9.790\u00b0 \u2192  9.934\u00b0   cl 1.0397 (heading for 1.0622)   target 1.0778
target BC_3: cycle 1900  alpha  9.934\u00b0 \u2192  9.980\u00b0   cl 1.0709 (heading for 1.0732)   target 1.0778
target BC_3: cycle 2100  alpha  9.980\u00b0 \u2192  9.998\u00b0   cl 1.0764   target 1.0778
target BC_3: cycle 2300  alpha  9.998\u00b0 \u2192  9.984\u00b0   cl 1.0790   target 1.0778
target BC_3: cycle 2500  cl 1.0782 met at alpha 9.984\u00b0 \u2014 holding 500 cycles
target BC_3: alpha trimmed to 9.984\u00b0 for cl 1.0778 (cl 1.0780 at end, cycle 3000); as the condition's vector: zutil.vector_from_angle(9.984, 0.000)
\`\`\`

The end line also gives the trimmed angle in a form ready to paste into a condition, \`zutil.vector_from_angle(9.984, 0.000)\`.
With axes other than the default it gives the trimmed vector itself.
A run that does not meet its target ends instead with a warning such as:

\`\`\`text
target BC_3: cl target NOT met: cl 0.6830 at alpha 6.000\u00b0 (target 1.0778, 36.6 % short) after 3000 cycles
\`\`\`

The coefficient in each of these lines, and in the end line in particular, is the settled value: the mean of the last
\`average_over\` report rows, not a single row.

The report file gains two columns for each target, written on every report cycle: the angle, \`<bc>_alpha\`, in degrees,
and the coefficient, such as \`<bc>_cl\`.

The [status file](../setting-up/running-zcfd.md#the-status-file) holds a \`target\` record for each target, keyed as the
log lines are:

\`\`\`yaml
target:
  BC_3:
    phase: met
    alpha: 9.803
    cl: 1.0783
    met_cycle: 4300
\`\`\`

The phase is \`settle\`, \`trim\` or \`hold\` while the run proceeds, and \`met\` or \`not met\` at the end. \`cl\` is the settled
value, and \`met_cycle\` is the cycle at which the target was met; it is empty until then.

## Restarting

A restarted run with a target starts the farfield at the angle recorded in the previous run's status file, not at the
angle of its \`condition\`. A run whose target was met goes straight to the hold; one still trimming carries on. The
line after the opening line says so, for example \`target BC_3: resuming at alpha 9.803\u00b0 (met in the previous run)\`. After a restart the flow
settles once more before the angle moves.

A restarted run without a target uses its \`condition\` as written. To keep a trimmed angle in a later run without a
target, paste the end line's \`zutil.vector_from_angle\` call into the condition's \`vector\`.

## What can be trimmed

A target turns the angle of attack, \`alpha\`, for a lift or drag coefficient, on a steady compressible run. The
farfield's \`condition\` must give its velocity as a \`vector\`.

On any other run, unsteady ([dual or global time stepping](../choosing/choosing-a-time-marching-scheme.md)) or
incompressible, the target is ignored: validation warns, naming the boundary condition, the log repeats the warning at
the start, and the run proceeds at the condition's own angle.
`;export{e as default};