import p5 from "p5";
import typefaceUrl from "../assets/fonts/BlackSla.otf?url";
import {
  initSettings,
  setMessageChangeCallback,
  setFontSizeChangeCallback,
  setColsChangeCallback,
  setFontChangeCallback,
  getCurrentMessage,
  getCurrentFontSize,
  getCurrentCols,
} from "./settings.js";
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
  let isLightTheme = false;
  const handleSize = 24;

  const recreateTextures = () => {
    textures = [];
    letters.forEach((char) => textures.push(createTexture(char)));
  };

  sk.preload = () => {
    font = sk.loadFont(typefaceUrl);
  };

  const createTexture = (char) => {
    const graphics = sk.createGraphics(sk.width / cols, sk.height / rows);
    graphics.fill(isLightTheme ? 0 : 180);
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
    for (let col = 0; col <= cols; col++) {
      gridVertices[col] = [];
      for (let row = 0; row <= rows; row++) {
        gridVertices[col][row] = {
          x: col * stepX - offsetX,
          y: row * stepY - offsetY,
        };
      }
    }
  };

  sk.setup = () => {
    sk.createCanvas(sk.windowWidth, sk.windowHeight, sk.WEBGL);
    defaultDensity = sk.displayDensity();
    initSettings();
    setMessageChangeCallback((newMessage) => {
      letters = newMessage.split("").filter((char) => char !== " ");
      rows = Math.ceil(letters.length / cols);
      recreateTextures();
      setupGrid();
    });
    setFontSizeChangeCallback((newFontSize) => {
      fontSize = newFontSize;
      recreateTextures();
    });
    setColsChangeCallback((newCols) => {
      cols = newCols;
      rows = Math.ceil(letters.length / cols);
      recreateTextures();
      setupGrid();
    });
    setFontChangeCallback((newFontFamily) => {
      currentFontFamily = newFontFamily;
      recreateTextures();
    });
    recreateTextures();
    setupGrid();
  };

  sk.draw = () => {
    sk.background(isLightTheme ? 255 : 36);

    // Draw textured quads
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

    // Draw handles
    sk.fill(0);
    const pulseValue = pulse(sk, 12, 18, 2);
    for (let col = 1; col < cols; col++) {
      for (let row = 1; row < rows; row++) {
        const vertex = gridVertices[col][row];
        sk.ellipse(vertex.x, vertex.y, pulseValue, pulseValue);
      }
    }

    // Update hovered handle
    hoveredHandle = null;
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

    // Update cursor
    if (draggedHandle) {
      document.body.style.cursor = "grabbing";
    } else if (hoveredHandle) {
      document.body.style.cursor = "grab";
    } else {
      document.body.style.cursor = "default";
    }
  };

  sk.mousePressed = () => {
    if (hoveredHandle) {
      draggedHandle = { col: hoveredHandle.col, row: hoveredHandle.row };
    }
  };

  sk.mouseDragged = () => {
    if (draggedHandle) {
      const deltaX = sk.mouseX - sk.pmouseX;
      const deltaY = sk.mouseY - sk.pmouseY;
      gridVertices[draggedHandle.col][draggedHandle.row].x += deltaX;
      gridVertices[draggedHandle.col][draggedHandle.row].y += deltaY;
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
    if (sk.key === "h" || sk.key === "H") {
      isLightTheme = !isLightTheme;
      recreateTextures();
    }
    if (sk.key === "s" || sk.key === "S") {
      saveSnapshot(sk, defaultDensity, 2);
    }
  };
});
