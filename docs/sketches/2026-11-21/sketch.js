// 2026-11-21
let roboto;
const CAP = 0.711;
const ALPHA = 0.9;

let text = "Make some noise right now for the voices in your head.";
let t = text.toUpperCase();

let rowN, rowH, C;
let darkLabel, lightLabel;
let offsets = [];

function preload() {
    roboto = loadFont('assets/RobotoCondensed-VariableFont_wght.ttf');
}

function setup() {
    createCanvas(880, 880, WEBGL);

    C = PI * width;

    textFont(roboto);
    textSize(100);
    let k = textWidth(t) / 100;             // the width of one char in size 1
    rowN = max(9, ceil(k * ALPHA * height / (CAP * C)));
    rowH = height / rowN;

    let fontSize = ALPHA * rowH / CAP;

    darkLabel = makeLabel(0, 255, fontSize);
    lightLabel = makeLabel(255, 0, fontSize);

    for (let i = 0; i < rowN; i++) {        // random offsets on where label starts
        offsets[i] = random(TWO_PI);
    }
}

function makeLabel(bg, fg, fontSize) {
    let g = createGraphics(ceil(C), ceil(rowH));
    g.pixelDensity(1);
    g.background(bg);
    g.noStroke();
    g.fill(fg);
    g.textFont(roboto);
    g.textSize(fontSize);
    g.textAlign(LEFT, BASELINE);

    let w = g.textWidth(t);
    let n = floor(C / w);                    // n times of texts
    let gap = C / n - w;                     // gap = black space for making the circle full
    let y = rowH - rowH * (1 - ALPHA) / 2;   

    for (let j = 0; j < n; j++) {           // print text on label n times 
        g.text(t, j * (w + gap), y);
    }
    return g;
}

function draw() {
    rotateX(radians(-3));
    orbitControl();
    background(255);
    ortho();
    noStroke();

    for (let i = 0; i < rowN; i++) {
        let speed = (i % 2 == 0) ? i * 0.4 + 1 : i + 1;
        push();
        translate(0, -height / 2 + rowH / 2 + i * rowH);
        rotateY(- radians(frameCount * 0.1 * speed) + offsets[i]);
        texture(i % 2 == 0 ? darkLabel : lightLabel);
        cylinder(width / 2, rowH, 64, 1, false, false);
        pop();
    }
}