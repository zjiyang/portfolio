// voice.js
// Makes short vowel sounds ("oh", "ah") with the browser's Web Audio, no sound files needed.
//
// How a vowel is made (the same way a voice works):
//   a buzzing tone (like the vocal cords) goes through two filters
//   that let only some frequencies through (like the shape of the mouth).
//   Different filter settings = different vowels.
//
// Browsers only allow sound after the visitor has clicked or typed on the page.
// Before that, voice() stays silent.

// the two filter frequencies (formants) of each vowel
const VOWELS = {
  o: [450, 800],
  a: [750, 1150],
};

let ctx = null;      // the audio "studio", made on first use
let out = null;      // every voice goes here, then to the speakers


// make the audio studio once: a master volume, then a compressor so many voices at once don't get too loud
function studio() {
  if (!ctx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    ctx = new AudioContext();

    const compressor = ctx.createDynamicsCompressor();
    out = ctx.createGain();
    out.gain.value = 0.9;
    out.connect(compressor);
    compressor.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}


// =====================================================
// voice
// Input (all optional):
//   pitch:  the voice's note in Hz (around 120 = low, 300 = high)
//   from:   pitch at the start, as a part of pitch (1 = same)
//   to:     pitch at the end, as a part of pitch (above from = rising, below = falling)
//   length: seconds
//   vowel:  'o' or 'a'
//   volume: 0 to 1
// Returns: nothing
// What it does: plays one short sung vowel
// =====================================================
export function voice({ pitch = 200, from = 1, to = 1, length = 0.3, vowel = 'o', volume = 0.5 } = {}) {
  const ac = studio();
  if (!ac || ac.state !== 'running') return;   // no sound yet: the visitor hasn't clicked

  const now = ac.currentTime;

  // the buzz (vocal cords), sliding from one pitch to another
  const buzz = ac.createOscillator();
  buzz.type = 'sawtooth';
  buzz.frequency.setValueAtTime(pitch * from, now);
  buzz.frequency.exponentialRampToValueAtTime(pitch * to, now + length);

  // the volume shape: quick start, hold, fade out
  const env = ac.createGain();
  env.gain.setValueAtTime(0, now);
  env.gain.linearRampToValueAtTime(volume, now + 0.03);
  env.gain.setValueAtTime(volume, now + length * 0.6);
  env.gain.exponentialRampToValueAtTime(0.0001, now + length);
  env.connect(out);

  // the mouth shape: two filters side by side
  const [f1, f2] = VOWELS[vowel];
  [[f1, 8, 1], [f2, 10, 0.5]].forEach(([freq, q, level]) => {
    const filter = ac.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = freq;
    filter.Q.value = q;
    const gain = ac.createGain();
    gain.gain.value = level;
    buzz.connect(filter);
    filter.connect(gain);
    gain.connect(env);
  });

  buzz.start(now);
  buzz.stop(now + length + 0.05);
}
