// Canonical defaults — matched to the p5 sketch's original values
export const DEFAULTS = {
  message: "DEFORM TYPE",
  fontSize: 320,
  cols: 4,
  fontFamily: null,
  bgColor: "#2b2b2b",
  fontColor: "#b4b4b4",
  noiseEnabled: false,
  noiseSpeed: 8,
  noiseAmount: 240,
};

const state = { ...DEFAULTS };

const callbacks = {
  onMessage: null,
  onFontSize: null,
  onCols: null,
  onFont: null,
  onBgColor: null,
  onFontColor: null,
  onNoiseEnabled: null,
  onNoiseSpeed: null,
  onNoiseAmount: null,
};

function notify(key, value) {
  if (callbacks[key]) callbacks[key](value);
}

export function setMessageCallback(fn) { callbacks.onMessage = fn; }
export function setFontSizeCallback(fn) { callbacks.onFontSize = fn; }
export function setColsCallback(fn) { callbacks.onCols = fn; }
export function setFontCallback(fn) { callbacks.onFont = fn; }
export function setBgColorCallback(fn) { callbacks.onBgColor = fn; }
export function setFontColorCallback(fn) { callbacks.onFontColor = fn; }
export function setNoiseEnabledCallback(fn) { callbacks.onNoiseEnabled = fn; }
export function setNoiseSpeedCallback(fn) { callbacks.onNoiseSpeed = fn; }
export function setNoiseAmountCallback(fn) { callbacks.onNoiseAmount = fn; }

export function setMessage(v) { state.message = v; notify("onMessage", v); }
export function setFontSize(v) { state.fontSize = v; notify("onFontSize", v); }
export function setCols(v) { state.cols = v; notify("onCols", v); }
export function setFontFamily(v) { state.fontFamily = v; notify("onFont", v); }
export function setBgColor(v) { state.bgColor = v; notify("onBgColor", v); }
export function setFontColor(v) { state.fontColor = v; notify("onFontColor", v); }
export function setNoiseEnabled(v) { state.noiseEnabled = v; notify("onNoiseEnabled", v); }
export function setNoiseSpeed(v) { state.noiseSpeed = v; notify("onNoiseSpeed", v); }
export function setNoiseAmount(v) { state.noiseAmount = v; notify("onNoiseAmount", v); }

export function getCurrentMessage() { return state.message; }
export function getCurrentFontSize() { return state.fontSize; }
export function getCurrentCols() { return state.cols; }
export function getCurrentFontFamily() { return state.fontFamily; }
export function getCurrentBgColor() { return state.bgColor; }
export function getCurrentFontColor() { return state.fontColor; }
export function getCurrentNoiseEnabled() { return state.noiseEnabled; }
export function getCurrentNoiseSpeed() { return state.noiseSpeed; }
export function getCurrentNoiseAmount() { return state.noiseAmount; }
