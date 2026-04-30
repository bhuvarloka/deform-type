import gearUrl from "../assets/images/gear.svg?url";
import closeUrl from "../assets/images/close.svg?url";
import {
  DEFAULTS,
  setMessage,
  setFontSize,
  setCols,
  setFontFamily,
  setBgColor,
  setFontColor,
  getCurrentMessage,
  getCurrentFontSize,
  getCurrentCols,
  getCurrentBgColor,
  getCurrentFontColor,
} from "./configs.js";

// ── Panel toggle ─────────────────────────────────────────────────────────────

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

trigger.addEventListener("click", () => {
  setPanelOpen(!document.body.classList.contains("panel-open"));
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && document.body.classList.contains("panel-open")) {
    setPanelOpen(false);
  }
});

document.addEventListener("click", (e) => {
  if (
    document.body.classList.contains("panel-open") &&
    !panel.contains(e.target) &&
    !trigger.contains(e.target)
  ) {
    setPanelOpen(false);
  }
});

// ── Per-control wiring ────────────────────────────────────────────────────────

// Message — apply on Enter (textarea uses Shift+Enter for newline; plain Enter applies)
const messageInput = document.getElementById("message-input");
messageInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    setMessage(messageInput.value);
  }
});

// Font upload
const fontUploadInput = document.getElementById("font-upload-input");
const fontDropLabel = document.getElementById("font-drop-label");

fontUploadInput.addEventListener("change", (e) => handleFontFile(e.target.files[0]));

const fontDropZone = document.getElementById("font-drop-zone");
fontDropZone.addEventListener("dragover", (e) => e.preventDefault());
fontDropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  handleFontFile(e.dataTransfer.files[0]);
});

async function handleFontFile(file) {
  if (!file) return;
  if (!file.name.endsWith(".ttf") && !file.name.endsWith(".otf")) {
    alert("Please select a valid TTF or OTF font file.");
    return;
  }
  const arrayBuffer = await file.arrayBuffer();
  const fontFace = new FontFace(`UploadedFont-${Date.now()}`, arrayBuffer);
  try {
    await fontFace.load();
    document.fonts.add(fontFace);
    setFontFamily(fontFace.family);
    fontDropLabel.textContent = file.name;
  } catch (err) {
    alert("Failed to load font: " + err.message);
  }
}

// Font size
const fontSizeInput = document.getElementById("font-size-input");
fontSizeInput.addEventListener("input", () => {
  setFontSize(parseFloat(fontSizeInput.value) || DEFAULTS.fontSize);
});

// Columns
const colsInput = document.getElementById("cols-input");
colsInput.addEventListener("input", () => {
  setCols(parseInt(colsInput.value) || DEFAULTS.cols);
});

const bgColorInput = document.getElementById("bg-color-input");
const bgColorSwatch = document.getElementById("bg-color-swatch");
const fontColorInput = document.getElementById("font-color-input");
const fontColorSwatch = document.getElementById("font-color-swatch");

[
  { input: bgColorInput, swatch: bgColorSwatch, setter: setBgColor },
  { input: fontColorInput, swatch: fontColorSwatch, setter: setFontColor },
].forEach(({ input, swatch, setter }) => {
  input.addEventListener("input", () => {
    swatch.style.background = input.value;
    setter(input.value);
  });
});

// Reset
document.getElementById("reset-btn").addEventListener("click", () => {
  messageInput.value = DEFAULTS.message;
  setMessage(DEFAULTS.message);

  fontSizeInput.value = DEFAULTS.fontSize;
  setFontSize(DEFAULTS.fontSize);

  colsInput.value = DEFAULTS.cols;
  setCols(DEFAULTS.cols);

  bgColorInput.value = DEFAULTS.bgColor;
  bgColorSwatch.style.background = DEFAULTS.bgColor;
  setBgColor(DEFAULTS.bgColor);

  fontColorInput.value = DEFAULTS.fontColor;
  fontColorSwatch.style.background = DEFAULTS.fontColor;
  setFontColor(DEFAULTS.fontColor);

  fontDropLabel.textContent = "Drop or click to upload";
  fontUploadInput.value = "";
});

// ── Hydrate inputs from state on load ────────────────────────────────────────
messageInput.value = getCurrentMessage();
fontSizeInput.value = getCurrentFontSize();
colsInput.value = getCurrentCols();
[
  { input: bgColorInput, swatch: bgColorSwatch, value: getCurrentBgColor() },
  { input: fontColorInput, swatch: fontColorSwatch, value: getCurrentFontColor() },
].forEach(({ input, swatch, value }) => {
  input.value = value;
  swatch.style.background = value;
});
