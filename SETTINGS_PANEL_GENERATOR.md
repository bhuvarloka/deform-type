# Settings Panel Generator

A self-contained prompt/skill for adding a slide-in right-side settings panel to any Vite + Tailwind v4 project.

The chrome (panel structure, toggle behavior, component classes) is fixed. The **settings themselves are project-specific** — discover them per project before writing any code.

Visual language: **black-on-white, `border-black/30`, `rounded-lg`, uppercase tracking-widest section headings, `text-sm` everywhere by default.** Hints sit *below* their control, left-aligned with `pl-0.5`. Inputs use `border-black/30`, focus to `border-black/50`. The whole panel is a floating white card with `border-2 border-black rounded-xl`, padded `p-2` away from the viewport edge so it looks detached.

---

## Step 0 — Discover the project's settings

Before writing any code, ask the user what settings this project needs. Do not assume.

Capture for each:

- **Label** (panel heading, will be rendered uppercase)
- **Type** — `text` / `textarea` / `number` / `file-drop` / `color-swatches` / `select` / `action-button`, or a custom control
- **Default value** + state key it writes to
- **Persistence** — none / localStorage
- **Hint** (optional sub-line shown below the control)

Also ask: is there a global **Reset** action at the bottom?

If the user says "just guess", read the main source file, propose a minimal schema, and confirm before writing code.

---

## Step 1 — Files

| Path | Action |
| --- | --- |
| `index.html` | Panel `<aside>` + trigger `<button>` at end of `<body>` |
| `src/scripts/settings-panel.js` | Panel toggle + per-control wiring |
| `src/scripts/configs.js` | Pure state module: defaults, getters, setters, callbacks |
| `src/styles/style.css` | `@import "tailwindcss";` + `@import "./settings-panel.css";` + `body.panel-open main` rule |
| `src/styles/settings-panel.css` | All panel component classes (via `@apply`) |
| `src/assets/images/gear.svg` | Provided by user — monochrome black |
| `src/assets/images/close.svg` | Provided by user — monochrome black |

Adjust paths to the project's actual layout, but keep the split: state in its own file, panel wiring in its own file, panel styles in their own file.

---

## Step 2 — `settings-panel.css` (component classes)

The HTML stays semantic. All visual rules live here as `@apply` recipes — the same names are reused across projects.

```css
@reference "tailwindcss";

/* ── Panel chrome ───────────────────────────────────────────── */
.panel {
  @apply fixed top-0 right-0 h-screen w-96 z-1000 overflow-y-auto transition-transform duration-300 ease-in-out p-2;
}
.panel-card {
  @apply bg-white border-2 border-black rounded-xl flex flex-col gap-8 pt-4 pb-6 px-6 h-full w-full;
}
.panel-title {
  @apply text-lg tracking-wider;
}
.panel-section {
  @apply flex flex-col gap-2;
}
.section-heading {
  @apply text-sm font-bold tracking-widest uppercase pl-0.5;
}
.hint {
  @apply text-sm text-black/50 pl-0.5;
}

/* ── Inputs ─────────────────────────────────────────────────── */
.panel-textarea {
  @apply w-full text-sm border border-black/30 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-black/50 transition-colors resize-none font-[inherit];
}
.drop-zone {
  @apply flex items-center justify-center w-full h-16 border border-dashed border-black/30 rounded-lg cursor-pointer text-sm text-black/75 hover:border-black/50 hover:text-black/50 transition-colors;
}
.panel-row {
  @apply flex items-center justify-between gap-3;
}
.panel-row-label {
  @apply text-base;
}
.number-input {
  @apply w-16 text-sm border border-black/30 rounded pl-2 pr-0.5 py-0.5 focus:outline-none focus:border-black/50;
}

/* ── Color swatches ─────────────────────────────────────────── */
.swatch-row {
  @apply flex gap-2;
}
.color-swatch {
  @apply relative cursor-pointer w-10 h-10 rounded-lg border border-black/30 overflow-hidden block;
}
.color-swatch input[type="color"] {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}
.swatch-fill {
  @apply block w-full h-full;
}

/* ── Footer / reset ─────────────────────────────────────────── */
.panel-footer {
  @apply mt-auto;
}
.panel-reset-btn {
  @apply w-full text-sm font-bold tracking-wider uppercase py-3 px-4 border border-black/30 rounded-lg hover:bg-black hover:text-white transition-colors duration-200 cursor-pointer;
}

/* ── Trigger ────────────────────────────────────────────────── */
.panel-trigger {
  @apply fixed top-6 right-6 w-6 h-6 z-2000 bg-transparent border-none cursor-pointer flex items-center justify-center opacity-5 hover:opacity-100 transition-opacity duration-300;
}
/* Trigger icon inversion: dark gear on dark canvas → invert to white;
   when open, the X needs to read black against the white panel → no invert. */
#settings-trigger {
  filter: invert(1);
}
#settings-trigger.is-open {
  filter: none;
}
```

Add project-specific component classes here when the schema needs them — keep the same visual language (`border-black/30`, `rounded-lg`, `text-sm`).

---

## Step 3 — `style.css` (global rules + import)

```css
@import "tailwindcss";
@import "./settings-panel.css";

*, *::before, *::after { box-sizing: border-box; }

body {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

main {
  width: 100%;
  height: 100%;
  transition: margin-right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

body.panel-open main { margin-right: 20rem; }

@media (max-width: 768px) {
  body.panel-open main { margin-right: 0; }
}
```

---

## Step 4 — HTML blueprint

Use `<aside>` for the panel — it's the correct landmark for complementary content (announced as such by AT, doesn't imply modal blocking like `<dialog>`). Keep classes semantic — almost everything is a single component class.

```html
<aside id="settings-panel" class="panel translate-x-full">
  <div class="panel-card">
    <h2 class="panel-title">Settings</h2>

    <!-- Repeat one .panel-section per setting (see Control patterns) -->

    <div class="panel-footer">
      <button id="reset-btn" class="panel-reset-btn">Reset</button>
    </div>
  </div>
</aside>

<button id="settings-trigger" class="panel-trigger">
  <img alt="Settings" class="w-full h-full object-contain" />
</button>
```

The trigger image `src` is set in JS (Vite-resolved URL).

### Control patterns

Each control is a `.panel-section` containing a `.section-heading`, the control itself, and an optional `.hint` *below* the control.

#### Textarea (apply on Enter)

```html
<div class="panel-section">
  <h3 class="section-heading">Message</h3>
  <textarea id="message-input" rows="2" placeholder="…" class="panel-textarea"></textarea>
  <p class="hint">Press Enter to apply.</p>
</div>
```

#### File drop zone

```html
<div class="panel-section">
  <h3 class="section-heading">Font</h3>
  <label id="font-drop-zone" class="drop-zone">
    <span id="font-drop-label">Drop or click to upload</span>
    <input type="file" id="font-upload-input" accept=".ttf,.otf" class="sr-only" />
  </label>
  <p class="hint">Accepts .TTF or .OTF</p>
</div>
```

#### Inline number row

Range hint sits left of the input as a `panel-row-label`:

```html
<div class="panel-section">
  <h3 class="section-heading">Font Size</h3>
  <label class="panel-row">
    <span class="panel-row-label">72 – 640</span>
    <input id="font-size-input" type="number" min="72" max="640" value="320" class="number-input" />
  </label>
</div>
```

#### Color swatches

The native picker is `sr-only`; clicking the visible `<span>` opens it. Group multiple swatches in a `.swatch-row` and use a single `.hint` below to label them in order:

```html
<div class="panel-section">
  <h3 class="section-heading">Colors</h3>
  <div class="swatch-row">
    <label class="color-swatch">
      <input type="color" id="bg-color-input" value="#2b2b2b" class="sr-only" />
      <span id="bg-color-swatch" class="swatch-fill" style="background:#2b2b2b"></span>
    </label>
    <label class="color-swatch">
      <input type="color" id="font-color-input" value="#b4b4b4" class="sr-only" />
      <span id="font-color-swatch" class="swatch-fill" style="background:#b4b4b4"></span>
    </label>
  </div>
  <p class="hint">Background and Type</p>
</div>
```

> The `style="background:…"` on `.swatch-fill` is the **only** sanctioned inline style — JS updates it on `input` events. Defaults still belong in `configs.js`; the inline value is pre-paint hydration to avoid a flash of unstyled swatch.

#### Toggle (boolean)

The toggle is a custom `<span>` — no native checkbox appearance. The `<input type="checkbox">` is `sr-only` (accessibility only); the visible state is driven by the `.is-on` class toggled via JS on the `.toggle` wrapper.

**HTML:**

```html
<label class="panel-row">
  <span class="panel-row-label">Label</span>
  <span class="toggle">
    <input type="checkbox" id="my-toggle-input" class="sr-only" />
    <span class="toggle-track"><span class="toggle-thumb"></span></span>
  </span>
</label>
```

**CSS** (add to `settings-panel.css`):

```css
.toggle {
  @apply relative inline-flex items-center cursor-pointer select-none;
}
.toggle-track {
  @apply relative block w-9 h-5 rounded-full bg-black/15 transition-colors duration-200;
}
.toggle-thumb {
  @apply absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200;
}
.toggle.is-on .toggle-track { @apply bg-black; }
.toggle.is-on .toggle-thumb  { @apply left-[1.125rem]; }
```

Key rules:

- No border on the track — fill alone communicates state (`bg-black/15` off → `bg-black` on).
- Thumb is white with `shadow-sm`; it slides via `left` transition, not `transform`.
- `.toggle` uses `inline-flex items-center` so it aligns to the label text baseline in `.panel-row`.
- JS toggles `.is-on` on the `.toggle` span (not the input): `input.parentElement.classList.toggle("is-on", checked)`.

**JS wiring:**

```js
const myToggleInput = document.getElementById("my-toggle-input");
function syncToggle(isOn) {
  myToggleInput.parentElement.classList.toggle("is-on", isOn);
}
myToggleInput.addEventListener("change", () => {
  syncToggle(myToggleInput.checked);
  setMyValue(myToggleInput.checked);
});
// hydrate
myToggleInput.checked = getCurrentMyValue();
syncToggle(getCurrentMyValue());
```

#### Action button (mid-panel)

Same shape as `.panel-reset-btn`, with its own id.

For new control types (sliders, segmented controls, etc.), add a new component class to `settings-panel.css` rather than inlining utilities in HTML.

---

## Step 5 — Icons

User provides `gear.svg` and `close.svg`, both monochrome black. The CSS `filter: invert(1)` flips the gear white over a dark canvas; the `.is-open` class drops the filter so the close X reads black on the white panel. **Do not invent fallback SVGs** — if missing, ask.

---

## Step 6 — `configs.js` (pure state)

State, defaults, getters, setters, and a callback registry. **No DOM access.** Other modules subscribe via callbacks; the sketch reads via getters.

```js
export const DEFAULTS = {
  message: "Hello",
  fontSize: 320,
  bgColor: "#2b2b2b",
  fontColor: "#b4b4b4",
};

const state = { ...DEFAULTS };
const callbacks = { onMessage: null, onFontSize: null, onBgColor: null, onFontColor: null };

function notify(key, value) { if (callbacks[key]) callbacks[key](value); }

export const setMessageCallback   = (fn) => (callbacks.onMessage = fn);
export const setFontSizeCallback  = (fn) => (callbacks.onFontSize = fn);
export const setBgColorCallback   = (fn) => (callbacks.onBgColor = fn);
export const setFontColorCallback = (fn) => (callbacks.onFontColor = fn);

export const setMessage   = (v) => { state.message = v;   notify("onMessage", v); };
export const setFontSize  = (v) => { state.fontSize = v;  notify("onFontSize", v); };
export const setBgColor   = (v) => { state.bgColor = v;   notify("onBgColor", v); };
export const setFontColor = (v) => { state.fontColor = v; notify("onFontColor", v); };

export const getCurrentMessage   = () => state.message;
export const getCurrentFontSize  = () => state.fontSize;
export const getCurrentBgColor   = () => state.bgColor;
export const getCurrentFontColor = () => state.fontColor;
```

---

## Step 7 — `settings-panel.js` (toggle + wiring)

Vite-resolved icon URLs, panel toggle (click / Escape / click-outside), per-control wiring, reset, and one-time hydration from state.

```js
import gearUrl from "../assets/images/gear.svg?url";
import closeUrl from "../assets/images/close.svg?url";
import {
  DEFAULTS, setMessage, setFontSize, setBgColor, setFontColor,
  getCurrentMessage, getCurrentFontSize, getCurrentBgColor, getCurrentFontColor,
} from "./configs.js";

const panel = document.getElementById("settings-panel");
const trigger = document.getElementById("settings-trigger");
const triggerImg = trigger.querySelector("img");
triggerImg.src = gearUrl;

function setPanelOpen(isOpen) {
  panel.classList.toggle("translate-x-0", isOpen);
  panel.classList.toggle("translate-x-full", !isOpen);
  document.body.classList.toggle("panel-open", isOpen);
  trigger.classList.toggle("is-open", isOpen);
  triggerImg.src = isOpen ? closeUrl : gearUrl;
}

trigger.addEventListener("click", () =>
  setPanelOpen(!document.body.classList.contains("panel-open"))
);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && document.body.classList.contains("panel-open")) setPanelOpen(false);
});
document.addEventListener("click", (e) => {
  if (
    document.body.classList.contains("panel-open") &&
    !panel.contains(e.target) &&
    !trigger.contains(e.target)
  ) setPanelOpen(false);
});

// ── Per-control wiring (one block per schema entry) ─────────────

// textarea — apply on plain Enter, Shift+Enter for newline
const messageInput = document.getElementById("message-input");
messageInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); setMessage(messageInput.value); }
});

// number
const fontSizeInput = document.getElementById("font-size-input");
fontSizeInput.addEventListener("input", () =>
  setFontSize(parseFloat(fontSizeInput.value) || DEFAULTS.fontSize)
);

// color swatches — keep the visible span's background in sync with the input
const bgColorInput = document.getElementById("bg-color-input");
const bgColorSwatch = document.getElementById("bg-color-swatch");
const fontColorInput = document.getElementById("font-color-input");
const fontColorSwatch = document.getElementById("font-color-swatch");

[
  { input: bgColorInput,   swatch: bgColorSwatch,   setter: setBgColor },
  { input: fontColorInput, swatch: fontColorSwatch, setter: setFontColor },
].forEach(({ input, swatch, setter }) => {
  input.addEventListener("input", () => {
    swatch.style.background = input.value;
    setter(input.value);
  });
});

// reset
document.getElementById("reset-btn").addEventListener("click", () => {
  messageInput.value = DEFAULTS.message;     setMessage(DEFAULTS.message);
  fontSizeInput.value = DEFAULTS.fontSize;   setFontSize(DEFAULTS.fontSize);
  bgColorInput.value = DEFAULTS.bgColor;     bgColorSwatch.style.background = DEFAULTS.bgColor;     setBgColor(DEFAULTS.bgColor);
  fontColorInput.value = DEFAULTS.fontColor; fontColorSwatch.style.background = DEFAULTS.fontColor; setFontColor(DEFAULTS.fontColor);
});

// hydrate inputs from state on load
messageInput.value = getCurrentMessage();
fontSizeInput.value = getCurrentFontSize();
[
  { input: bgColorInput,   swatch: bgColorSwatch,   value: getCurrentBgColor() },
  { input: fontColorInput, swatch: fontColorSwatch, value: getCurrentFontColor() },
].forEach(({ input, swatch, value }) => { input.value = value; swatch.style.background = value; });
```

The main entry imports `settings-panel.js` for its side effects, then registers `*Callback` listeners with `configs.js`.

---

## Step 8 — Verification checklist

- [ ] Panel slides in from the right; gear ↔ close icons swap.
- [ ] Trigger is `opacity-5` when closed, full on hover, full while open.
- [ ] `filter: invert(1)` flips off when `.is-open` is set on the trigger.
- [ ] `body.panel-open` adds margin to `<main>` on desktop, no shift on mobile.
- [ ] Outer `.panel` keeps `p-2`; inner `.panel-card` is `rounded-xl border-2 border-black` (detached look).
- [ ] Every section is `.panel-section` → `.section-heading`, control, optional `.hint` below.
- [ ] Escape and click-outside both close the panel.
- [ ] Inputs hydrate from `configs.js` getters on load.
- [ ] Reset restores defaults *and* re-syncs every visible input (incl. swatch backgrounds).

---

## Optional extensions

- **localStorage persistence** — wrap `setX` calls in `configs.js` with a `save()` step; hydrate state from `JSON.parse(localStorage.getItem(KEY))` at module init.
- **Conditional sections** — toggle a body class from JS and hide a section with `body:not(.feature-on) #feature-section { display: none; }` rather than inline `style.display`.

---

## Prompt to give Claude Code

> Read `SETTINGS_PANEL_GENERATOR.md`. Follow it to add a settings panel to this project.
>
> First, **ask me** what settings this project needs — label, type, default, state key, optional hint. If I say "just guess", read the main source file, propose a minimal schema, and confirm before writing code.
>
> Generate `index.html` (semantic — use the component classes), `src/styles/settings-panel.css` (the full `@apply` recipe set), `src/styles/style.css` (imports + `body.panel-open main`), `src/scripts/configs.js` (pure state), and `src/scripts/settings-panel.js` (toggle + wiring). Assume `gear.svg`/`close.svg` exist; if not, stop and ask. Run the verification checklist before reporting done.
