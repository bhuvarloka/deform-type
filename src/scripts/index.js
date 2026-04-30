import p5 from "p5";
import typefaceUrl from "../assets/fonts/BlackSla.otf?url";
import "./settings-panel.js";
import {
  setMessageCallback,
  setFontSizeCallback,
  setColsCallback,
  setFontCallback,
  setBgColorCallback,
  setFontColorCallback,
  setNoiseEnabledCallback,
  setNoiseSpeedCallback,
  setNoiseAmountCallback,
  getCurrentMessage,
  getCurrentFontSize,
  getCurrentCols,
  getCurrentBgColor,
  getCurrentFontColor,
  getCurrentNoiseEnabled,
  getCurrentNoiseSpeed,
  getCurrentNoiseAmount,
} from "./configs.js";
import { saveSnapshot, pulse } from "./utils.js";

new p5((sk) => {
  let draggedHandle = null;
  let hoveredHandle = null;
  let font;
  let textures = [];
  let gridVertices = [];
  let defaultDensity;

  let cols = getCurrentCols();
  let letters = getCurrentMessage()
    .split("")
    .filter((char) => char !== " ");
  let rows = Math.ceil(letters.length / cols);
  let fontSize = getCurrentFontSize();
  let currentFontFamily = null;
  let bgColor = getCurrentBgColor();
  let fontColor = getCurrentFontColor();
  let noiseEnabled = getCurrentNoiseEnabled();
  let noiseSpeed = getCurrentNoiseSpeed();
  let noiseAmount = getCurrentNoiseAmount();
  let noisePaused = false;
  let noisePausedAt = 0;
  let noiseTimeOffset = 0;
  let restVertices = [];
  const handleSize = 24;
  let activeCursor = "default";

  const recreateTextures = () => {
    textures = [];
    letters.forEach((char) => textures.push(createTexture(char)));
  };

  sk.preload = () => {
    font = sk.loadFont(typefaceUrl);
  };

  const createTexture = (char) => {
    const graphics = sk.createGraphics(sk.width / cols, sk.height / rows);
    graphics.fill(fontColor);
    if (currentFontFamily) {
      graphics.textFont(currentFontFamily);
    } else {
      graphics.textFont(font);
    }
    graphics.textAlign(graphics.CENTER, graphics.CENTER);
    graphics.textSize(fontSize);
    graphics.text(char, graphics.width / 2, graphics.height / 2);
    return graphics;
  };

  const setupGrid = () => {
    const stepX = sk.width / cols;
    const stepY = sk.height / rows;
    const offsetX = sk.width / 2;
    const offsetY = sk.height / 2;

    gridVertices = [];
    restVertices = [];
    for (let col = 0; col <= cols; col++) {
      gridVertices[col] = [];
      restVertices[col] = [];
      for (let row = 0; row <= rows; row++) {
        const x = col * stepX - offsetX;
        const y = row * stepY - offsetY;
        gridVertices[col][row] = { x, y };
        restVertices[col][row] = { x, y };
      }
    }
  };

  sk.setup = () => {
    sk.createCanvas(sk.windowWidth, sk.windowHeight, sk.WEBGL);
    defaultDensity = sk.displayDensity();

    setMessageCallback((newMessage) => {
      letters = newMessage.split("").filter((char) => char !== " ");
      rows = Math.ceil(letters.length / cols);
      recreateTextures();
      setupGrid();
    });
    setFontSizeCallback((newFontSize) => {
      fontSize = newFontSize;
      recreateTextures();
    });
    setColsCallback((newCols) => {
      cols = newCols;
      rows = Math.ceil(letters.length / cols);
      recreateTextures();
      setupGrid();
    });
    setFontCallback((newFontFamily) => {
      currentFontFamily = newFontFamily;
      recreateTextures();
    });
    setBgColorCallback((newColor) => {
      bgColor = newColor;
    });
    setFontColorCallback((newColor) => {
      fontColor = newColor;
      recreateTextures();
    });
    setNoiseEnabledCallback((v) => {
      noiseEnabled = v;
      if (!v) {
        noisePaused = false;
        noiseTimeOffset = 0;
        for (let col = 0; col <= cols; col++) {
          for (let row = 0; row <= rows; row++) {
            gridVertices[col][row].x = restVertices[col][row].x;
            gridVertices[col][row].y = restVertices[col][row].y;
          }
        }
      }
    });
    setNoiseSpeedCallback((v) => { noiseSpeed = v; });
    setNoiseAmountCallback((v) => { noiseAmount = v; });

    recreateTextures();
    setupGrid();
  };

  sk.draw = () => {
    sk.background(bgColor);

    if (noiseEnabled && !noisePaused) {
      const t = (sk.millis() / 1000 - noiseTimeOffset) * (noiseSpeed / 10);
      for (let col = 1; col < cols; col++) {
        for (let row = 1; row < rows; row++) {
          const rest = restVertices[col][row];
          const nx = sk.noise(col * 1.3, row * 1.3, t);
          const ny = sk.noise(col * 1.3 + 47, row * 1.3 + 47, t);
          gridVertices[col][row].x = rest.x + (nx - 0.5) * 2 * noiseAmount;
          gridVertices[col][row].y = rest.y + (ny - 0.5) * 2 * noiseAmount;
        }
      }
    }

    sk.noStroke();
    let textureIndex = 0;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (textureIndex < textures.length) {
          sk.texture(textures[textureIndex]);
          const topLeft = gridVertices[col][row];
          const topRight = gridVertices[col + 1][row];
          const bottomRight = gridVertices[col + 1][row + 1];
          const bottomLeft = gridVertices[col][row + 1];
          sk.quad(
            topLeft.x,
            topLeft.y,
            topRight.x,
            topRight.y,
            bottomRight.x,
            bottomRight.y,
            bottomLeft.x,
            bottomLeft.y
          );
        }
        textureIndex++;
      }
    }

    hoveredHandle = null;
    if (!noiseEnabled) {
      sk.fill(0);
      const pulseValue = pulse(sk, 12, 18, 2);
      for (let col = 1; col < cols; col++) {
        for (let row = 1; row < rows; row++) {
          const vertex = gridVertices[col][row];
          sk.ellipse(vertex.x, vertex.y, pulseValue, pulseValue);
        }
      }

      const mouseX = sk.mouseX - sk.width / 2;
      const mouseY = sk.mouseY - sk.height / 2;
      for (let col = 1; col < cols; col++) {
        for (let row = 1; row < rows; row++) {
          const vertex = gridVertices[col][row];
          if (sk.dist(mouseX, mouseY, vertex.x, vertex.y) < handleSize) {
            hoveredHandle = { col, row };
            break;
          }
        }
        if (hoveredHandle) break;
      }
    }

    const nextCursor = draggedHandle ? "grabbing" : hoveredHandle ? "grab" : "default";
    if (nextCursor !== activeCursor) {
      activeCursor = nextCursor;
      document.body.style.cursor = nextCursor;
    }
  };

  sk.mousePressed = () => {
    const panelOpen = document.body.classList.contains("panel-open");
    const trigger = document.getElementById("settings-trigger");
    const hit = document.elementFromPoint(sk.mouseX, sk.mouseY);
    const overTrigger = trigger && trigger.contains(hit);

    if (noiseEnabled && !panelOpen && !overTrigger) {
      if (!noisePaused) {
        noisePausedAt = sk.millis() / 1000;
        noisePaused = true;
      } else {
        noiseTimeOffset += sk.millis() / 1000 - noisePausedAt;
        noisePaused = false;
      }
    }
    if (hoveredHandle) {
      const vertex = gridVertices[hoveredHandle.col][hoveredHandle.row];
      const grabOffsetX = vertex.x - (sk.mouseX - sk.width / 2);
      const grabOffsetY = vertex.y - (sk.mouseY - sk.height / 2);
      draggedHandle = { col: hoveredHandle.col, row: hoveredHandle.row, grabOffsetX, grabOffsetY };
    }
  };

  sk.mouseDragged = () => {
    if (draggedHandle) {
      gridVertices[draggedHandle.col][draggedHandle.row].x = (sk.mouseX - sk.width / 2) + draggedHandle.grabOffsetX;
      gridVertices[draggedHandle.col][draggedHandle.row].y = (sk.mouseY - sk.height / 2) + draggedHandle.grabOffsetY;
    }
  };

  sk.mouseReleased = () => {
    draggedHandle = null;
  };

  sk.windowResized = () => {
    sk.resizeCanvas(sk.windowWidth, sk.windowHeight);
    setupGrid();
  };

  sk.keyPressed = () => {
    if (sk.key === "s" || sk.key === "S") {
      saveSnapshot(sk, defaultDensity, 2);
    }
  };
});
