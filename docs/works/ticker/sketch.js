// Ticker
// Grown from the sketches of 2026-11-19, 2026-11-21 and 2026-11-22.
// Rings of text turn like stock tickers and fill the whole screen.
// Visitors can type their own words in the input box this piece makes.
//
// Opening: the rings start with their bottom facing us (so we only see white),
// then turn slow → fast → slow into their resting angle.
//
// Written in p5 instance mode: every p5 function starts with "p."

import { lerp, phase } from '../../js/lib/motion.js';

// The font sits next to this file. new URL(..., import.meta.url) means
// "start from where THIS js file is", so the path works from any page.
const FONT_URL = new URL('assets/RobotoCondensed-VariableFont_wght.ttf', import.meta.url).href;

const START_WORDS = 'Make some noise right now for the voices in your head.';

const CAP = 0.711;          // height of a capital letter, as a part of the font size
const ALPHA = 0.9;          // how much of a row the capital letters fill
const ROW_HEIGHT = 90;      // about how tall one ring looks on screen (smaller = more rings)
const MIN_ROWS = 9;
const TILT_X = -3;          // resting angle in degrees, same as 2026-11-22
const TILT_Z = 9;

// ---------- Opening (in seconds after the page loads) ----------
const START_X = 90;         // rotateX at the start: 90° turns the bottom of the rings toward us
const START_Z = 0;          // rotateZ at the start
const INTRO_START = 0.5;    // wait a moment on the white screen
const INTRO_END = 4;        // fully at the resting angle

const SAFE_TEXTURE = 4096;  // the widest picture every graphics card can hold (used if we can't ask)
const SPEED_REF = 308;      // ring radius on screen in 2026-11-22;
                            // used so the text moves at the same speed on any screen size


// =====================================================
// ticker
// Input: p = one p5 instance (p5 passes it in)
// Returns: nothing
// What it does: gives p its preload, setup and draw, plus p.setText() for the page to call
// =====================================================
export default function ticker(p) {
  let font;
  let words = START_WORDS;

  let radius, totalH, rowN, rowH;   // size of the rings, set in rebuild()
  let darkLabel, lightLabel;        // the two text pictures wrapped around the rings
  let offsets = [];                 // where each ring's text starts
  let startMs = 0;                  // when the piece started, for the opening
  let maxTexture = SAFE_TEXTURE;    // the widest picture THIS graphics card can hold

  p.preload = () => {
    font = p.loadFont(FONT_URL);
  };

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);

    // ask the graphics card how wide a picture it can hold (often 8192 or 16384)
    const gl = p.drawingContext;
    maxTexture = gl.getParameter(gl.MAX_TEXTURE_SIZE) || SAFE_TEXTURE;

    rebuild();
    startMs = p.millis();
    makeInput();
  };

  // the window changed size: make the canvas fit again
  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    rebuild();
  };

  // =====================================================
  // makeInput
  // Input: nothing
  // Returns: nothing
  // What it does: makes the input box for the visitor's words.
  //   The piece makes it itself, so when the Works page switches to
  //   another work and removes this piece, the box goes away with it.
  // =====================================================
  function makeInput() {
    const input = p.createInput('');
    input.addClass('voice-input');              // styled in css/works.css
    input.attribute('placeholder', 'Type your voice and press Enter');
    input.attribute('aria-label', 'Type your own words for the ticker');
    input.attribute('autocomplete', 'off');

    input.elt.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        setText(input.value());
      }
    });
  }


  // change the words on the rings; empty words are ignored
  function setText(str) {
    if (str.trim() === '') return;
    words = str;
    rebuild();
  }


  // =====================================================
  // rebuild
  // Input: nothing (uses the window size and words)
  // Returns: nothing
  // What it does: works out how big the rings are and how many,
  //   then draws the text onto the two label pictures
  // =====================================================
  function rebuild() {
    const t = words.toUpperCase();
    const diag = Math.hypot(p.width, p.height);   // the screen's diagonal

    // big enough to cover the whole screen, even with the tilt
    radius = diag * 0.55;
    totalH = diag * 1.15;
    const C = p.TWO_PI * radius;                  // length around one ring

    // how many rings: about ROW_HEIGHT each, and the words must fit around a ring at least once
    p.textFont(font);
    p.textSize(100);
    const k = p.textWidth(t) / 100;               // width of the words at font size 1
    rowN = Math.max(MIN_ROWS,
                    Math.ceil(totalH / ROW_HEIGHT),
                    Math.ceil(k * ALPHA * totalH / (CAP * C)));
    rowH = totalH / rowN;
    const fontSize = ALPHA * rowH / CAP;

    if (darkLabel) darkLabel.remove();
    if (lightLabel) lightLabel.remove();
    darkLabel = makeLabel(t, 0, 255, fontSize, C);
    lightLabel = makeLabel(t, 255, 0, fontSize, C);

    offsets = [];
    for (let i = 0; i < rowN; i++) {
      offsets[i] = p.random(p.TWO_PI);
    }
  }


  // =====================================================
  // makeLabel
  // Input: t = words; bg, fg = background and text color; fontSize; C = length around a ring
  // Returns: a picture (p5 graphics) to wrap around one ring
  // What it does: writes the words as many times as fit around the ring,
  //   with equal gaps so the ring closes without a seam.
  //   The picture is made as sharp as the screen (2× on a Retina screen),
  //   unless that is wider than the graphics card can hold; then it is made smaller.
  // =====================================================
  function makeLabel(t, bg, fg, fontSize, C) {
    const s = Math.min(p.pixelDensity(), maxTexture / C);   // how many picture pixels per screen pixel
    const g = p.createGraphics(Math.ceil(C * s), Math.ceil(rowH * s));
    g.pixelDensity(1);
    g.scale(s);
    g.background(bg);
    g.noStroke();
    g.fill(fg);
    g.textFont(font);
    g.textSize(fontSize);
    g.textAlign(p.LEFT, p.BASELINE);

    const w = g.textWidth(t);
    const n = Math.max(1, Math.floor(C / w));     // how many times the words fit
    const gap = C / n - w;                        // the black space that closes the ring
    const y = rowH - rowH * (1 - ALPHA) / 2;

    for (let j = 0; j < n; j++) {
      g.text(t, j * (w + gap), y);
    }
    return g;
  }


  p.draw = () => {
    p.background(255);

    // flat 3D (no perspective); near and far are wide so the big rings are never cut off
    p.ortho(-p.width / 2, p.width / 2, -p.height / 2, p.height / 2, -10000, 10000);
    p.orbitControl(1, 1, 0);                      // drag to look around, no zoom
    // opening: k goes 0 → 1, slow → fast → slow, then stays at 1
    const s = (p.millis() - startMs) / 1000;
    const k = phase(s, INTRO_START, INTRO_END);
    p.rotateX(p.radians(lerp(START_X, TILT_X, k)));
    p.rotateZ(p.radians(lerp(START_Z, TILT_Z, k)));
    p.noStroke();

    const turn = SPEED_REF / radius;              // bigger rings turn slower, so the text speed stays the same

    for (let i = 0; i < rowN; i++) {
      const j = i % 9;                            // the 9-ring speed pattern of 2026-11-22, repeated
      const speed = (j % 2 === 0) ? j * 0.4 + 1 : j + 1;

      p.push();
      p.translate(0, -totalH / 2 + rowH / 2 + i * rowH);
      p.rotateY(-p.radians(p.frameCount * 0.1 * speed * turn) + offsets[i]);
      p.texture(i % 2 === 0 ? darkLabel : lightLabel);
      p.cylinder(radius, rowH, 64, 1, false, false);
      p.pop();
    }
  };
}
