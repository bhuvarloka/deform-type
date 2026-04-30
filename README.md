# Deform Type

![Deform Type Screenshot](./readme-images/deform-type.png)

A generative art tool built with p5.js and Vite that lets you interactively deform text on a warped grid — or animate it with Perlin noise.

## Features

- **Interactive deformation** — drag handles at grid intersections to warp the text mesh
- **Noise animation** — enable Perlin noise to animate the grid automatically with configurable speed and amount
- **Custom fonts** — drop any `.ttf` or `.otf` file to render your text in a custom typeface
- **Full color control** — pick background and type colors independently via color swatches
- **Snapshot export** — save a high-resolution PNG of the current state at 2× pixel density

## Getting started

```bash
pnpm install
pnpm dev
```

Open `http://localhost:5173` in your browser.

## Controls

| Action | How |
| --- | --- |
| Deform text | Click and drag the pulsing handles at grid intersections |
| Open settings | Click the settings button (bottom-right corner) |
| Save snapshot | Press `S` |

> Handles are only visible and draggable when **Noise** is disabled.

## Settings panel

| Setting | Description | Range / Default |
| --- | --- | --- |
| **Message** | Text to display (spaces ignored) | `DEFORM TYPE` |
| **Font** | Upload a `.ttf` / `.otf` file | Built-in display font |
| **Size** | Font size in pixels | 72 – 640 / `320` |
| **Columns** | Number of columns in the grid | 2 – 6 / `4` |
| **Noise** | Toggle animated Perlin noise deformation | Off |
| **Speed** | Noise animation speed | 1 – 24 / `8` |
| **Amount** | Maximum noise displacement in pixels | 48 – 480 / `240` |
| **Colors** | Background and type color swatches | `#2b2b2b` / `#b4b4b4` |
| **Reset** | Restore all settings to defaults | — |

## Tech stack

- [p5.js](https://p5js.org/) — canvas rendering and Perlin noise
- [Vite](https://vitejs.dev/) — bundler and dev server
- [Tailwind CSS](https://tailwindcss.com/) — settings panel styling
