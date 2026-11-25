// 2026-11-24

const LOOP = 3;   // loop duration in seconds
const FPS = 60;

// timeline (in seconds)
const SMILE_DURATION = 0.25;
const HOLD_DURATION  = 1.25;
const BACK_DURATION  = 0.25;

const SMILE_START = 0.3 * LOOP;
const SMILE_END   = SMILE_START + SMILE_DURATION;
const BACK_START  = SMILE_END + HOLD_DURATION;
const BACK_END    = BACK_START + BACK_DURATION;

// face param
const faceW = 492, faceH = 564;
const eyeY = 10, eyeDist = 258, eyeW = 20, eyeH = 36;
const noseY = 38, noseW = 46, noseH = 42;
const mouthY = 150, mouthW = 118;


function setup() {
  createCanvas(880, 880);
}

function draw() {
    background(255);
  
    // ---------- 1. Get the time ----------
    // frameCount keeps growing → divide by FPS to get seconds → % LOOP to get "seconds inside this loop"
    // s is always between 0 and LOOP
    const s = (frameCount / FPS) % LOOP;
  
    // ---------- 2. Get the face knob k ----------
    // k = 0: sad face, k = 1: smile face
    // first phase: goes from 0 to 1 between SMILE_START and SMILE_END, then stays at 1
    // second phase: goes from 0 to 1 between BACK_START and BACK_END, then stays at 1
    // first minus second → 0 → 1 → hold → 0
    const k = phase(s, SMILE_START, SMILE_END) - phase(s, BACK_START, BACK_END);
  
    // ---------- 3. Draw the face (everything that changes uses k) ----------
    push();
    translate(width / 2, height / 2);
    rotate(radians(lerp(0, -5, k)));   // head: tilts from 0° to -5°
  
    stroke(0);
    strokeWeight(10);
    strokeJoin(ROUND);
    strokeCap(ROUND);
  
    //face
    fill(255);
    ellipse(0, 0, faceW, faceH);
  
    //left eye: height goes from 36 down to 21.6 (a little squint)
    ellipse(-eyeDist / 2, eyeY, eyeW, lerp(eyeH, eyeH * 0.6, k));
  
    //right eye: wink
    drawWinkEye(eyeDist / 2, eyeY, k);
  
    //nose (does not change)
    push();
    fill(0);
    strokeWeight(3);
    triangle(0, noseY, -noseW, noseY + noseH, 0, noseY + noseH);
    pop();
  
    //mouth
    drawMouth(k);
  
    pop();
  }
  
  
  // =====================================================
  // ease
  // Input: t, a progress value (can be any number)
  // Returns: a number from 0 to 1, the smoothed progress
  // What it does:
  //   1. Keep t between 0 and 1 (below 0 becomes 0, above 1 becomes 1)
  //   2. Turn even progress into "slow - fast - slow"
  // =====================================================
  function ease(t) {
    t = constrain(t, 0, 1);
    return t * t * (3 - 2 * t);
  }
  
  
  // =====================================================
  // phase
  // Input:
  //   s: the current second (inside one loop)
  //   a: the second this change starts
  //   b: the second this change ends
  // Returns: a number from 0 to 1, how much of this change is done (smoothed)
  // What it does:
  //   1. (s - a) / (b - a) = seconds already passed / total seconds of this change
  //      before it starts: below 0; after it ends: above 1
  //   2. Pass it to ease: keep it in range + make it smooth
  // =====================================================
  function phase(s, a, b) {
    return ease((s - a) / (b - a));
  }
  
  
  // =====================================================
  // drawWinkEye
  // Input: x, y = eye position; k = face knob (0 to 1)
  // What it does:
  //   The eye closes before the mouth finishes (fully closed when k reaches 0.625)
  //   First part: the ellipse gets flatter and flatter
  //   Second part: it turns into an upward curve ^
  // =====================================================
  function drawWinkEye(x, y, k) {
    const close = constrain(k * 1.6, 0, 1);   // eye-closing progress, runs faster than k
  
    if (close < 0.85) {
      // ellipse: height goes from 36 down to 2
      ellipse(x, y, eyeW, lerp(eyeH, 2, close / 0.85));
    } else {
      // curve: width opens from 20 to 44
      noFill();
      const w = lerp(eyeW, 44, (close - 0.85) / 0.15);
      arc(x, y + 3, w - 6, 26, PI, TWO_PI);
      fill(255);
    }
  }
  
  
  // =====================================================
  // drawMouth
  // Input: k = face knob (0 to 1)
  // What it does:
  //   Draws the mouth as one curve: left corner → middle control point → right corner
  //   Each point's height uses lerp(sad value, smile value, k)
  //   (y goes down when it gets bigger, so a negative number = up)
  // =====================================================
  function drawMouth(k) {
    const leftY  = lerp(18, 4, k);     // left corner: from down → almost flat
    const rightY = lerp(18, -22, k);   // right corner: from down → up
    const midY   = lerp(20, 34, k);   // middle: from arched up → curved down
    const shiftX = lerp(0, 10, k);     // move the whole mouth a little to the right (wink side)
  
    noFill();
    beginShape();
    vertex(-mouthW / 2 + shiftX, mouthY + leftY);
    quadraticVertex(shiftX, mouthY + midY, mouthW / 2 + shiftX, mouthY + rightY);
    endShape();
  }