---
title: zCFD documentation
---

# Welcome to the zCFD documentation!

zCFD is a GPU-accelerated finite-volume CFD solver. These pages cover installing it, setting up and running a case, and every setting the input deck accepts.

## New to zCFD

- [What zCFD is](guide/concepts/what-zcfd-is.md): what the solver does and how it is put together.
- [Installation and licensing](guide/setting-up/installation-and-licensing.md): installing zCFD and obtaining a licence.
- [Tutorials](tutorials/index.md): five worked cases, from a simple aerofoil to overset meshes.

## Guide

How zCFD works and how to use it.

- [Concepts](guide/concepts/how-the-deck-works.md): the solver and its input deck.
- [Setting up](guide/setting-up/preparing-a-mesh.md): meshes, Python functions in the deck, and running a case.
- [Choosing…](guide/choosing/choosing-boundary-conditions.md): boundary conditions, turbulence models, time-marching schemes and the other choices a case needs.
- [Working with](guide/working-with/monitoring-a-run.md): monitoring, post-processing, overset meshes, fluid–structure interaction and aeroacoustics.
- [Troubleshooting](guide/troubleshooting/troubleshooting.md): when a run fails or will not converge.

## Reference

Every setting, output and command, in full.

- [Input deck](/reference/input-deck): every key the control dictionary accepts.
- [Output variables](/reference/output-variables): the fields zCFD can write.
- [Command line](reference/command-line/invocation-and-flags.md): invocation, flags and environment variables.

## Release notes

- [Release notes](release-notes/unreleased.md): what has changed in each release.
