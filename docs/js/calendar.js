// When a new sketch is ready, uncomment its date here
// In the brackets, list the image files in that day's references folder, or leave it empty []
const sketches = {
    '2026-11-01': [],
    // '2026-11-02': [],
    // '2026-11-03': [],
    // '2026-11-04': [],
    // '2026-11-05': [],
    // '2026-11-06': [],
    '2026-11-07': [],
    '2026-11-08': [],
    '2026-11-09': ['IMG_9740.JPG'],
    '2026-11-10': [],
    '2026-11-11': [],
    '2026-11-12': [],
    '2026-11-13': [],
    '2026-11-14': [],
    '2026-11-15': [],
    // '2026-11-16': [],
    '2026-11-17': [],
    // '2026-11-18': [],
    '2026-11-19': [],
    // '2026-11-20': [],
    '2026-11-21': [],
    '2026-11-22': [],
    // '2026-11-23': [],
    '2026-11-24': [],
    // '2026-11-25': [],
    // '2026-11-26': [],
    // '2026-11-27': [],
    // '2026-11-28': [],
    // '2026-11-29': [],
    // '2026-11-30': [],
};
const dates = Object.keys(sketches);

const year = 2026;
const month = 11;

const calendar = document.getElementById('calendar');
const viewer = document.getElementById('viewer');
const big = document.getElementById('big');
const note = document.getElementById('note');
document.getElementById('title').textContent = `${year} / ${month}`;


const daysInMonth = new Date(year, month, 0).getDate();
const firstWeekday = new Date(year, month - 1, 1).getDay();

for (let i = 0; i < firstWeekday; i++) {
  calendar.appendChild(document.createElement('div'));
}


for (let d = 1; d <= daysInMonth; d++) {
  const date = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const btn = document.createElement('button');
  btn.textContent = d;
  btn.className = 'day';

  if (dates.includes(date)) {
    btn.classList.add('has-sketch');
    btn.onclick = () => show(date, btn);
  }
  calendar.appendChild(btn);
}

function show(date, btn) {
  viewer.src = `${date}/index.html`;
  document.querySelectorAll('.day').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  showRefs(date);
  showNote(date);
}
// The iframe's height follows the content of the sketch page
// Only a canvas → stays square; a slider under the canvas → grows taller
let observer = null;
viewer.addEventListener('load', () => {
  if (observer) observer.disconnect();
  const doc = viewer.contentDocument;
  const body = doc.body;
  // A canvas is an inline element by default, which leaves a small gap below it; make it block to remove the gap
  const style = doc.createElement('style');
  style.textContent = 'canvas { display: block; }';
  doc.head.appendChild(style);
  const fit = () => {
    viewer.style.height = body.scrollHeight + 'px';
  };
  observer = new ResizeObserver(fit);   // measure again whenever the content height changes
  observer.observe(body);
  fit();
});

// Show this day's note under the calendar
// The note lives in <date>/note.html; if the file is missing, show nothing
let currentDate = null;
function showNote(date) {
  currentDate = date;
  note.innerHTML = '';
  fetch(`${date}/note.html`)
    .then(res => (res.ok ? res.text() : ''))
    .then(html => {
      if (date === currentDate) note.innerHTML = html;   // if you click fast, don't show the previous day's note
    })
    .catch(() => {});
}

// Show this day's reference images under the calendar
// If there are several, click the image to see the next one
function showRefs(date) {
  big.innerHTML = '';
  const files = sketches[date];
  if (files.length === 0) return;

  let n = 0;
  const img = document.createElement('img');
  img.src = `${date}/references/${files[n]}`;
  big.appendChild(img);

  if (files.length > 1) {
    img.style.cursor = 'pointer';
    img.onclick = () => {
      n = (n + 1) % files.length;   // after the last one, go back to the first
      img.src = `${date}/references/${files[n]}`;
    };
  }
}

// When the page opens, show the latest sketch
if (dates.length > 0) {
  const latest = dates[dates.length - 1];
  const latestBtn = [...document.querySelectorAll('.has-sketch')].pop();
  show(latest, latestBtn);
}