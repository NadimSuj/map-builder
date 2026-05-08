# Map Builder

A grid-based 2D map builder for sketching small neighborhoods — place roads, buildings, and parks on a graph-paper canvas. Built with vanilla HTML, CSS, and JavaScript, no frameworks.

**Live demo:** https://nadimsuj.github.io/map-builder/

## Why I built this

To familiarize myself with building projects and development mostly

## Features

- Click and drag to paint tiles
- Hover preview shows what tile you're about to place
- Save and load maps (persisted in browser localStorage)
- Keyboard shortcuts (1–4 for tile types)
- Clear button to reset the map

## How it's structured

The world is a 2D array of tile types — every visible cell is a rendering of that data. All interactions follow the same pattern: mutate the array, then re-render. This separation between state and rendering is the architectural backbone of the project, and what makes the planned extensions (pathfinding, agent simulation) straightforward to add.

## Tech

Vanilla JavaScript with the HTML Canvas API. No build step, no dependencies — open `index.html` in any browser and it runs.
