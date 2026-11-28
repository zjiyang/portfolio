// works.js
// The Works page is a stage: one work fills the whole screen at a time.
// The dots at the bottom switch between works.
//
// Every work lives in works/<name>/sketch.js and exports one function: function (p) { ... }
// That is the only thing this file needs to know about a work.

import ticker from '../works/ticker/sketch.js';
import faces from '../works/faces/sketch.js';
import comingSoon from '../works/coming-soon/sketch.js';
import { createRecorder } from './lib/recorder.js';


// ---------- The list of works, in order: one dot each ----------
// To add a work: make works/<name>/sketch.js, import it above,
// and add it to this list. Keep "Coming soon" last.
// grownFrom: the days of the sketches the work grew from; each one links to that day.
const WORKS = [
  {
    title: 'Ticker',
    sketch: ticker,
    grownFrom: ['2026-11-19', '2026-11-21', '2026-11-22'],
  },
  {
    title: 'Faces',
    sketch: faces,
    grownFrom: ['2026-11-15'],
  },
  {
    title: 'Coming soon',
    sketch: comingSoon,
  },
];


const stage = document.getElementById('stage');
const dots = document.getElementById('work-dots');
const caption = document.getElementById('caption');

let piece = null;   // the p5 instance that is running now
let current = 0;    // which work is showing (its number in WORKS)


// =====================================================
// show
// Input: i = which work in WORKS (0 = the first)
// Returns: nothing
// What it does:
//   1. stops and removes the work that is running (its canvas and input box go too)
//   2. starts work i on the stage
//   3. marks its dot and updates the caption
// =====================================================
function show(i) {
  recorder.stop();    // switching works ends a recording (the video downloads)
  if (piece) {
    piece.remove();
  }
  current = i;
  const work = WORKS[i];
  piece = new p5(work.sketch, stage);

  dots.querySelectorAll('button').forEach((button, j) => {
    if (j === i) {
      button.setAttribute('aria-current', 'true');
    } else {
      button.removeAttribute('aria-current');
    }
  });

  updateCaption(work);
}


// =====================================================
// updateCaption
// Input: work = one item of WORKS
// Returns: nothing
// What it does: writes "Title · grown from Sketches …" in the corner,
//   where each date links to that day on the Sketches page.
//   Hides the caption when the work has no grownFrom
// =====================================================
function updateCaption(work) {
  caption.textContent = '';
  if (!work.grownFrom) {
    caption.hidden = true;
    return;
  }
  caption.hidden = false;

  const title = document.createElement('b');
  title.textContent = work.title;

  caption.append(title, ' · grown from sketches ');

  work.grownFrom.forEach((date, i) => {
    if (i > 0) caption.append(', ');
    const link = document.createElement('a');
    link.href = `sketches/#${date}`;          // opens the Sketches page on that day
    link.textContent = date.slice(5);           // "2026-11-19" → "11-19"
    caption.append(link);
  });
}


// ---------- Record button ----------
const recordButton = document.getElementById('record');
const recordLayers = document.querySelectorAll('.record');   // the button and the text layer under it
let recordStart = 0;      // when recording started (ms)
let timer = null;         // updates the clock while recording

const recorder = createRecorder({
  getCanvas: () => stage.querySelector('canvas'),
  getName: () => WORKS[current].title,
  onChange: updateRecordButton,
});

// =====================================================
// setRecordLabel
// Input: text = the words to show after the red dot
// Returns: nothing
// What it does: writes the same words in both layers, so they stay exactly on top of each other
// =====================================================
function setRecordLabel(text) {
  recordLayers.forEach((layer) => {
    layer.querySelector('.rec-label').textContent = text;
  });
}

// seconds → "00:12"
function clock(ms) {
  const sec = Math.floor(ms / 1000);
  const mm = String(Math.floor(sec / 60)).padStart(2, '0');
  const ss = String(sec % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

const IDLE_LABEL = 'Record video';
let labelTimeout = null;   // brings the label back to IDLE_LABEL after "Saved" or "Can't record here"

// =====================================================
// updateRecordButton
// Input: state = "recording", "stopped" or "failed"
// Returns: nothing
// What it does:
//   recording → a blinking red dot and "00:12  Stop", counting up
//               (the red dot only shows while recording, so no one thinks the site is always recording)
//   stopped   → "Saved" for 2 seconds (the video has downloaded), then "Record video"
//   failed    → "Can't record here" for 3 seconds, then "Record video"
// =====================================================
function updateRecordButton(state) {
  const on = state === 'recording';
  recordLayers.forEach((layer) => layer.classList.toggle('is-recording', on));

  clearInterval(timer);
  clearTimeout(labelTimeout);

  if (on) {
    recordStart = Date.now();
    const tick = () => setRecordLabel(`${clock(Date.now() - recordStart)}  Stop`);
    tick();
    timer = setInterval(tick, 250);
  } else if (state === 'failed') {
    setRecordLabel("Can't record here");
    labelTimeout = setTimeout(() => setRecordLabel(IDLE_LABEL), 3000);
  } else {
    setRecordLabel('Saved');
    labelTimeout = setTimeout(() => setRecordLabel(IDLE_LABEL), 2000);
  }
}

recordButton.addEventListener('click', () => {
  recorder.toggle();
});


// ---------- Make one dot per work ----------
WORKS.forEach((work, i) => {
  const button = document.createElement('button');
  button.className = 'dot';
  button.setAttribute('aria-label', work.title);
  button.addEventListener('click', () => show(i));
  dots.appendChild(button);
});

show(0);
