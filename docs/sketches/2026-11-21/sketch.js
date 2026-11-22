// 2026-11-21
let helvetica;
let roboto;
const CAP = 0.717;
const ALPHA = 0.9;

let text = "The nose and eyes have minds of their own.";
let t = text.toUpperCase();

let rowN, rowH, C;
let darkLabel, lightLabel;
let offsets = [];

function preload() {
    helvetica = loadFont('assets/Helvetica.ttf');
    roboto = loadFont('assets/RobotoCondensed-VariableFont_wght.ttf');
}

function setup() {
    createCanvas(880, 880, WEBGL);

    C = PI * width;

    textFont(helvetica);
    textSize(100);
    let k = textWidth(t) / 100;
    rowN = max(9, ceil(k * ALPHA * height / (CAP * C)));
    rowH = height / rowN;

    let fontSize = ALPHA * rowH / CAP;

    darkLabel = makeLabel(0, 255, fontSize);
    lightLabel = makeLabel(255, 0, fontSize);

    // random offsets on where label starts
    for (let i = 0; i < rowN; i++) {
        offsets[i] = random(TWO_PI);
    }
}

function makeLabel(bg, fg, fontSize) {
    let g = createGraphics(ceil(C), ceil(rowH));
    g.pixelDensity(1);
    g.background(bg);
    g.noStroke();
    g.fill(fg);
    //g.textFont(helvetica);
    g.textFont(roboto);
    g.textSize(fontSize);
    g.textAlign(LEFT, BASELINE);

    let w = g.textWidth(t);
    let n = floor(C / w);                    // n times of texts
    let gap = C / n - w;                     // gap = black space for making the circle full
    let y = rowH - rowH * (1 - ALPHA) / 2;   

    for (let j = 0; j < n; j++) {
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
        //rotateY(-frameCount * 0.003 + offsets[i]);
        texture(i % 2 == 0 ? darkLabel : lightLabel);
        cylinder(width / 2, rowH, 64, 1, false, false);
        pop();
    }
}