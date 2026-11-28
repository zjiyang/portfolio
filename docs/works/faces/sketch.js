// Faces
// Grown from the sketch of 2026-11-15.
// In that sketch a new random face appeared twice a second and was gone the next moment.
// Here every face is kept. Each new face finds an empty spot as close to the middle as it can,
// right next to the faces already there, so a crowd grows from the center outward.
//
// When the crowd is full, it waits for the visitor. Each click on a face starts a wave from that face:
//   shocked (mouth an O, eyes wide, a little jump) → smiling (smiling eyes) → shocked → smiling → ...
// The wave spreads out, nearest faces first.
// After MAX_CLICKS clicks the faces are left alone, and a message appears in the middle of the screen.
//
// Written in p5 instance mode: every p5 function starts with "p."

// ---------- Crowd ----------
const FACE_PX = 100;     // how big an average face is on screen, in pixels (the same on any window)
const AVG_FACE = 620;    // the average face width / height in the 880 design (faces are 489 to 800)
const GAP_PX = 3;        // the smallest space between two faces, in screen pixels
const EDGE_PX = 8;       // the space between the crowd and the window's edges, in pixels

// ---------- Placing a face ----------
const SPOT_TRIES = 400;  // how many random spots to test for one face
const FACE_TRIES = 20;   // if a face fits nowhere, try this many new (maybe smaller) faces before stopping

// ---------- Timing: slow at first, then faster and faster ----------
const EVERY = 500;       // the first faces come every 500 ms = 2 a second, like 2026-11-15
const SLOW_COUNT = 6;    // this many faces come at that slow pace
const SPEED_UP = 0.88;   // after that, each wait is 88% of the one before
const MIN_EVERY = 60;    // the shortest wait, in ms

// ---------- Pop: how a new face appears (a gentle one) ----------
const POP_TIME = 0.25;   // seconds
const POP_FROM = 0.85;   // the face starts at 85% of its size
const POP_OVER = 0.6;    // how far it goes past full size before settling (0 = not at all)

// ---------- Clicks ----------
const MAX_CLICKS = 6;    // after this many waves, the faces are left alone
const MESSAGE = 'This crowd has had enough.';   // shown when the clicks are used up (reload for a new crowd)

// ---------- The waves (in seconds) ----------
const WAVE_TIME = 2.5;   // how long a wave takes to reach the farthest face
const JUMP_TIME = 0.25;  // how long one face's jump lasts
const SHOCK_JUMP = 0.08; // shocked: the face gets 8% bigger at the top of its jump
const SMILE_JUMP = 0.04; // smiling: a softer jump

// Each face is designed on an 880 × 880 canvas (the size of the original sketch).
// All positions below are in these 880 units, measured from the middle of the screen,
// Design rule (the same as Ticker): things keep their size; a bigger window shows more space.
// Every face has the same size on screen whatever the window. The crowd always fills the whole
// window, staying just inside its edges. Make the window bigger and new faces fill the new space,
// each with its own random expression: newcomers who missed the last wave (the next wave reaches them too).
// Make the window smaller and the faces stay as they are; the window simply shows less of them.
const SIZE = 880;


// =====================================================
// faces
// Input: p = one p5 instance (p5 passes it in)
// Returns: nothing
// What it does: gives p its setup and draw, and listens for clicks on the faces
// =====================================================
export default function faces(p) {
  // every face placed so far: { face, x, y, bornAt, fromMood, toMood, changeAt }
  //   the face shows fromMood until changeAt (seconds), then toMood
  const crowd = [];
  let lastMs = 0;              // when the last face was placed
  let full = true;             // true when no more faces fit (false while there is room to grow)
  let clicks = 0;              // how many waves the visitor has started

  // what the piece is doing now:
  //   'growing'  the first crowd is being made
  //   'waiting'  waiting for a click on a face
  //   'wave'     a wave is spreading (clicks wait until it is done)
  //   'rest'     the clicks are used up; the message is showing
  let stage = 'growing';
  let nextMood = 'shocked';    // what the next click turns the faces into

  p.setup = () => {
    const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
    canvas.mousePressed(onClick);     // only clicks on the canvas (not on the nav, dots or buttons)
    p.crowdLayout = makeLayout(p);    // face size and the crowd's area
    full = false;
  };

  // The window changed size.
  // Bigger: the crowd's area grows, so keep adding faces into the new space.
  // Smaller: viewScale() shrinks the whole crowd; just draw again.
  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    if (growLayout(p)) {
      full = false;
      p.loop();
    }
    drawCrowd();
  };

  // show a hand when the mouse is over a face that can be clicked
  p.mouseMoved = () => {
    const canClick = stage === 'waiting' && faceAt(p.mouseX, p.mouseY);
    p.cursor(canClick ? p.HAND : p.ARROW);
  };


  // =====================================================
  // draw
  // Input: nothing
  // Returns: nothing
  // What it does, every frame:
  //   1. if there is room and no wave is spreading, add a face when it is time
  //   2. draw the crowd
  //   3. when nothing is moving any more, stop drawing until the next click or resize
  // =====================================================
  p.draw = () => {
    if (!full && stage !== 'wave' && p.millis() - lastMs >= waitBefore(crowd.length)) {
      lastMs = p.millis();
      addFace();
    }

    const { waveDone, popping } = drawCrowd();

    if (stage === 'wave' && waveDone) {
      nextMood = nextMood === 'shocked' ? 'smile' : 'shocked';   // take turns
      if (clicks >= MAX_CLICKS) {
        stage = 'rest';
        showMessage();
      } else {
        stage = 'waiting';
      }
    }
    if (stage === 'growing' && full && !popping) {
      stage = 'waiting';
    }

    // nothing left to move: stop drawing (saves the computer's work)
    if (stage !== 'wave' && full && !popping) {
      p.noLoop();
    }
  };


  // =====================================================
  // addFace
  // Input: nothing
  // Returns: nothing
  // What it does: tries a few new random faces; the first one that fits joins the crowd.
  //   A new face always has its own random expression ('calm' = as it was made),
  //   even if the others are shocked or smiling. If none fits, the crowd is full.
  // =====================================================
  function addFace() {
    const mood = 'calm';
    for (let t = 0; t < FACE_TRIES; t++) {
      const face = randomFace(p);
      const spot = findSpot(p, face, crowd);
      if (spot) {
        crowd.push({
          face, x: spot.x, y: spot.y,
          bornAt: p.millis() / 1000,
          fromMood: mood, toMood: mood, changeAt: -Infinity,
        });
        return;
      }
    }
    full = true;
  }


  // =====================================================
  // drawCrowd
  // Input: nothing
  // Returns: { waveDone, popping }
  //   waveDone: every face has changed and finished its jump
  //   popping:  some face is still popping in
  // What it does: draws every face in its mood at this moment,
  //   with a jump right after it changes, and a gentle pop when it is new
  // =====================================================
  function drawCrowd() {
    const s = p.millis() / 1000;
    p.background(255);

    let waveDone = true;
    let popping = false;
    crowd.forEach((item) => {
      const t = s - item.changeAt;                    // seconds since this face changed (below 0 = not yet)
      const mood = t >= 0 ? item.toMood : item.fromMood;
      const size = item.toMood === 'shocked' ? SHOCK_JUMP : SMILE_JUMP;
      if (t < JUMP_TIME) waveDone = false;

      const age = s - item.bornAt;                    // seconds since this face arrived
      if (age < POP_TIME) popping = true;

      drawItem(p, item, { mood, jump: jumpAt(t, size) * popAt(age) });
    });
    return { waveDone, popping };
  }


  // =====================================================
  // showMessage
  // Input: nothing
  // Returns: nothing
  // What it does: puts MESSAGE in a box in the middle of the screen.
  //   The piece makes the box itself, so it goes away when the visitor switches works.
  // =====================================================
  function showMessage() {
    const box = p.createDiv(MESSAGE);
    box.addClass('faces-message');    // styled in css/works.css
    requestAnimationFrame(() => box.addClass('is-shown'));   // next frame: fade in
  }


  // =====================================================
  // onClick
  // Input: nothing (uses where the mouse is)
  // Returns: nothing
  // What it does: if a face was clicked while waiting, starts a wave from that face
  // =====================================================
  function onClick() {
    if (stage !== 'waiting') return;
    const clicked = faceAt(p.mouseX, p.mouseY);
    if (!clicked) return;

    clicks += 1;
    startWave(clicked, nextMood);
    stage = 'wave';
    p.cursor(p.ARROW);
    p.loop();                         // start moving again
  }


  // =====================================================
  // startWave
  // Input: first = the clicked face; mood = 'shocked' or 'smile'
  // Returns: nothing
  // What it does: every face will change from the mood it has now to the new mood:
  //   the clicked face right away, the others later the farther they are from it
  // =====================================================
  function startWave(first, mood) {
    const now = p.millis() / 1000;
    const distance = (item) => Math.hypot(item.x - first.x, item.y - first.y);
    const farthest = Math.max(...crowd.map(distance)) || 1;
    crowd.forEach((item) => {
      item.fromMood = item.toMood;
      item.toMood = mood;
      item.changeAt = now + distance(item) / farthest * WAVE_TIME;
    });
  }


  // =====================================================
  // faceAt
  // Input: mx, my = a point on the screen (e.g. the mouse)
  // Returns: the face under that point, or null
  // What it does: turns the point into 880 units, then checks each face's ellipse
  // =====================================================
  function faceAt(mx, my) {
    const scale = viewScale(p);
    const x = (mx - p.width / 2) / scale;
    const y = (my - p.height / 2) / scale;
    return crowd.find((item) => {
      const { a, b } = halfSize(item.face);
      const dx = (x - item.x) / a;
      const dy = (y - item.y) / b;
      return dx * dx + dy * dy <= 1;
    }) || null;
  }
}


// =====================================================
// waitBefore
// Input: n = how many faces are already in the crowd
// Returns: how many ms to wait before the next face
// What it does: the first SLOW_COUNT faces wait EVERY ms;
//   after that each wait is SPEED_UP times the one before, down to MIN_EVERY
// =====================================================
function waitBefore(n) {
  if (n < SLOW_COUNT) return EVERY;
  return Math.max(MIN_EVERY, EVERY * SPEED_UP ** (n - SLOW_COUNT + 1));
}


// =====================================================
// popAt
// Input: t = seconds since the face arrived
// Returns: the face's size: POP_FROM at the start, a touch above 1 near the end, then 1
// What it does: an "ease out back" curve made gentle: grows quickly from POP_FROM,
//   goes a little past full size (POP_OVER), and settles back
// =====================================================
function popAt(t) {
  if (t >= POP_TIME) return 1;
  if (t < 0) return POP_FROM;
  const x = t / POP_TIME - 1;                        // -1 at the start, 0 at the end
  const k = 1 + (POP_OVER + 1) * x ** 3 + POP_OVER * x ** 2;   // 0 → a bit above 1 → 1
  return POP_FROM + (1 - POP_FROM) * k;
}


// =====================================================
// jumpAt
// Input: t = seconds since the face changed; size = how big the jump is (e.g. 0.08)
// Returns: the face's size: 1 = normal, a bit above 1 during the jump
// What it does: up and back down in JUMP_TIME seconds, like a little start
// =====================================================
function jumpAt(t, size) {
  if (t < 0 || t >= JUMP_TIME) return 1;
  return 1 + size * Math.sin(Math.PI * t / JUMP_TIME);
}


// =====================================================
// faceScale
// Input: nothing
// Returns: how much to shrink the 880 design on screen
// What it does: makes an average face FACE_PX pixels big, whatever the window size
// =====================================================
function faceScale() {
  return FACE_PX / AVG_FACE;
}


// =====================================================
// makeLayout
// Input: p = the p5 instance (at the start of the piece)
// Returns: { limitX, limitY, gap }, in 880 units:
//   limitX, limitY: how far from the middle a face's edge may go
//   gap: the space between faces
// What it does: the crowd's area is the whole window, minus EDGE_PX at each edge
// =====================================================
function makeLayout(p) {
  const scale = faceScale();
  return {
    limitX: areaX(p),
    limitY: areaY(p),
    gap: GAP_PX / scale,
  };
}

// half the window's width / height in 880 units, minus the edge space
function areaX(p) {
  return (p.width / 2 - EDGE_PX) / faceScale();
}
function areaY(p) {
  return (p.height / 2 - EDGE_PX) / faceScale();
}


// =====================================================
// growLayout
// Input: p = the p5 instance (after the window changed size)
// Returns: true if the crowd's area got bigger (so there is new space to fill)
// What it does: the area only ever grows; on a smaller window the faces stay where they are
//   and the window just shows less of them
// =====================================================
function growLayout(p) {
  const layout = p.crowdLayout;
  const newX = areaX(p);
  const newY = areaY(p);
  if (newX <= layout.limitX + 1 && newY <= layout.limitY + 1) return false;
  layout.limitX = Math.max(layout.limitX, newX);
  layout.limitY = Math.max(layout.limitY, newY);
  return true;
}


// =====================================================
// viewScale
// Input: nothing
// Returns: how much to shrink the 880 design on screen
// What it does: always the same as faceScale(): faces never change size with the window
// =====================================================
function viewScale() {
  return faceScale();
}


// =====================================================
// radiusAt
// Input: a, b = half width and half height of an ellipse; angle = a direction (radians)
// Returns: how far the ellipse's edge is from its center in that direction
// What it does: the ellipse formula; used to check if two faces touch
// =====================================================
function radiusAt(a, b, angle) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return (a * b) / Math.sqrt((b * c) ** 2 + (a * s) ** 2);
}


// half width and half height of a face's outline, plus half the outline's thickness
function halfSize(face) {
  return { a: face.faceW / 2 + 5, b: face.faceH / 2 + 5 };
}


// =====================================================
// fits
// Input: p = the p5 instance; face = a new face; x, y = where to put it; crowd = faces already placed
// Returns: true if the face can go there
// What it does:
//   1. the face must stay inside the screen edges
//   2. for each face already placed: the distance between the two centers must be
//      bigger than both edges in that direction, plus a small gap
// =====================================================
function fits(p, face, x, y, crowd) {
  const { limitX, limitY, gap } = p.crowdLayout;
  const { a, b } = halfSize(face);
  if (Math.abs(x) + a > limitX || Math.abs(y) + b > limitY) return false;

  for (const other of crowd) {
    const dx = other.x - x;
    const dy = other.y - y;
    const angle = Math.atan2(dy, dx);
    const o = halfSize(other.face);
    const need = radiusAt(a, b, angle) + radiusAt(o.a, o.b, angle) + gap;
    if (dx * dx + dy * dy < need * need) return false;
  }
  return true;
}


// =====================================================
// findSpot
// Input: p = the p5 instance; face = a new face; crowd = faces already placed
// Returns: { x, y } of the best free spot, or null if there is none
// What it does: the first face goes in the middle. After that,
//   it tests many random spots and keeps the free one closest to the middle,
//   so the new face sits right next to the crowd
// =====================================================
function findSpot(p, face, crowd) {
  if (crowd.length === 0) {
    return fits(p, face, 0, 0, crowd) ? { x: 0, y: 0 } : null;
  }

  const { limitX, limitY } = p.crowdLayout;

  let best = null;
  let bestDist = Infinity;
  for (let i = 0; i < SPOT_TRIES; i++) {
    const x = p.random(-limitX, limitX);
    const y = p.random(-limitY, limitY);
    const d = x * x + y * y;
    if (d < bestDist && fits(p, face, x, y, crowd)) {
      best = { x, y };
      bestDist = d;
    }
  }
  return best;
}


// =====================================================
// drawItem
// Input:
//   p = the p5 instance; item = { face, x, y }
//   options (optional): mood = 'calm', 'shocked' or 'smile'; jump = 1 normal, above 1 bigger
// Returns: nothing
// What it does: moves to the middle of the screen, shrinks the 880 design,
//   moves to the face's spot, and draws the face
// =====================================================
function drawItem(p, item, { mood = 'calm', jump = 1 } = {}) {
  p.push();
  p.translate(p.width / 2, p.height / 2);
  p.scale(viewScale(p));
  p.translate(item.x, item.y);           // the face's center
  p.scale(jump);                         // the jump grows the face around its center
  p.translate(-SIZE / 2, -SIZE / 2);     // drawFace draws around (440, 440)
  drawFace(p, item.face, mood);
  p.pop();
}


// =====================================================
// randomFace (the rules of 2026-11-15)
// Input: p = the p5 instance
// Returns: a new random face, as an object of numbers
// What it does: picks random sizes, then places the eyes, nose and mouth
//   so they always fit inside the face
// =====================================================
function randomFace(p) {
  const faceW = SIZE / p.random(1.1, 1.8);
  const faceH = SIZE / p.random(1.1, 1.8);

  const eyeW = p.random(10, 60);
  const eyeH = p.random(10, 60);
  const noseW = p.random(20, 60);
  const noseH = p.random(20, 50);
  let mouthW = p.random(10, 200);
  const mouthH = p.random(10, 90);
  const mouthMode = p.random(2);

  const eyeNoseGap = p.random(0, 30);
  const noseMouthGap = p.random(30, 80);
  const chin = SIZE / 2 + faceH / 2 - 30;

  const eyeMax = Math.min(SIZE / 2 + faceH * 0.05,
                          chin - mouthH - noseMouthGap - noseH - eyeNoseGap - eyeH / 2);
  const eyeY = p.random(SIZE / 2 - faceH * 0.4, eyeMax);

  let dy = Math.abs(eyeY - SIZE / 2) + eyeH / 2;
  let halfW = faceW / 2 * Math.sqrt(Math.max(0, 1 - (dy / (faceH / 2)) ** 2));
  const eyeDist = p.random(faceW / 9, 2 * (halfW - eyeW / 2 - 10));

  const noseY = eyeY + eyeH / 2 + eyeNoseGap;
  const mouthY = noseY + noseH + noseMouthGap + mouthH / 2;

  dy = Math.abs(mouthY - SIZE / 2) + mouthH / 2;
  halfW = faceW / 2 * Math.sqrt(Math.max(0, 1 - (dy / (faceH / 2)) ** 2));
  mouthW = Math.min(mouthW, 2 * (halfW - 15));

  return { faceW, faceH, eyeY, eyeDist, eyeW, eyeH, noseY, noseW, noseH, mouthY, mouthW, mouthH, mouthMode };
}


// =====================================================
// drawFace (the drawing of 2026-11-15, plus two moods)
// Input: p = the p5 instance; f = one face; mood = 'calm', 'shocked' or 'smile'
// Returns: nothing
// What it does: draws the face on an 880 × 880 area starting at (0, 0).
//   calm:    the face as it was made
//   shocked: eyes open wide, the mouth is a small O
//   smile:   eyes curve up like ^ ^, the mouth is a soft smile
// =====================================================
function drawFace(p, f, mood = 'calm') {
  p.stroke(0);
  p.fill(255);

  // face
  p.push();
  p.strokeWeight(10);
  p.translate(SIZE / 2, SIZE / 2);
  p.ellipse(0, 0, f.faceW, f.faceH);
  p.pop();

  // eyes
  p.push();
  p.translate(SIZE / 2, f.eyeY);
  p.strokeWeight(10);
  [-f.eyeDist / 2, f.eyeDist / 2].forEach((x) => {
    if (mood === 'shocked') {
      p.ellipse(x, 0, f.eyeW * 1.15, f.eyeH * 1.4);             // wider and much taller
    } else if (mood === 'smile') {
      const w = Math.max(f.eyeW * 1.2, 24);                      // smiling eyes: an upward curve ^
      p.noFill();
      p.arc(x, w * 0.2, w, w * 0.8, p.PI, p.TWO_PI);
      p.fill(255);
    } else {
      p.ellipse(x, 0, f.eyeW, f.eyeH);
    }
  });
  p.pop();

  // nose
  p.push();
  p.fill(0);
  p.translate(SIZE / 2, f.noseY);
  p.strokeWeight(3);
  p.strokeJoin(p.ROUND);
  p.triangle(0, 0, -f.noseW, f.noseH, 0, f.noseH);
  p.pop();

  // mouth
  p.push();
  p.translate(SIZE / 2, f.mouthY);
  p.strokeWeight(10);
  if (mood === 'shocked') {
    const o = Math.min(Math.max(f.mouthW * 0.35, 24), 60);      // the O's width: between 24 and 60
    p.ellipse(0, 0, o, o * 1.25);                               // a little taller than wide
  } else if (mood === 'smile') {
    const w = Math.min(Math.max(f.mouthW, 60), 160);            // a relaxed smile: 60 to 160 wide
    p.noFill();
    p.arc(0, 0, w, w * 0.45, 0, p.PI);
  } else if (f.mouthMode < 1) {
    p.arc(0, 0, f.mouthW, f.mouthH, 0, p.radians(180));         // smile, as made
  } else {
    p.arc(0, 0, f.mouthW, f.mouthH, p.radians(180), p.radians(360));   // frown, as made
  }
  p.pop();
}
