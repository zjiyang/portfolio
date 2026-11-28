// recorder.js
// Records a canvas to a video file. Based on tools/record.js, made into a module
// so any page can import it and start or stop it from a button.
//
// It records only the canvas: no mouse pointer, no browser frame, no HTML on top.
// Recording is live: whatever moves or is typed while recording ends up in the video.
//
// Why there is a second "tape" canvas:
//   On a big full screen the canvas can be over 5000 pixels wide.
//   Video encoders often refuse anything bigger than 4K, or with an odd width or height,
//   and then fail without a word. So every frame is copied onto a tape canvas
//   that is at most 4K and always has even sides, and the tape is what gets recorded.

const MAX_SIDE = 3840;   // longest side of the video (4K)
const FPS = 60;

// video types to try, best first: mp4 is easier to edit, webm works almost everywhere
const TYPES = [
  'video/mp4;codecs=avc1',
  'video/mp4',
  'video/webm;codecs=vp9',
  'video/webm',
];


// =====================================================
// createRecorder
// Input:
//   getCanvas: a function that returns the canvas to record
//   getName:   a function that returns the file name (without .mp4 / .webm)
//   onChange:  a function called whenever recording starts, stops or fails
//              (gets "recording", "stopped" or "failed")
// Returns: an object with
//   toggle()      start if stopped, stop if recording
//   stop()        stop if recording (the video then downloads)
//   isRecording() true while recording
// What it does: wraps the browser's MediaRecorder; when recording stops,
//   the video downloads by itself
// =====================================================
export function createRecorder({ getCanvas, getName, onChange = () => {} }) {
  let recorder = null;
  let chunks = [];
  let tape = null;          // the canvas that is actually recorded
  let copying = false;      // true while frames are being copied onto the tape

  // ---------- copy the real canvas onto the tape, every frame ----------
  function makeTape(source) {
    const scale = Math.min(1, MAX_SIDE / Math.max(source.width, source.height));
    const even = (n) => Math.max(2, Math.floor(n / 2) * 2);   // round down to an even number

    tape = document.createElement('canvas');
    tape.width = even(source.width * scale);
    tape.height = even(source.height * scale);
    const ctx = tape.getContext('2d');

    copying = true;
    const copy = () => {
      if (!copying) return;
      ctx.drawImage(source, 0, 0, tape.width, tape.height);
      requestAnimationFrame(copy);
    };
    copy();
  }

  // ---------- try each video type until one works ----------
  function startWith(typeIndex) {
    if (typeIndex >= TYPES.length) {
      fail();
      return;
    }
    const type = TYPES[typeIndex];
    if (!window.MediaRecorder || !MediaRecorder.isTypeSupported(type)) {
      startWith(typeIndex + 1);
      return;
    }

    try {
      recorder = new MediaRecorder(tape.captureStream(FPS), {
        mimeType: type,
        videoBitsPerSecond: 40_000_000,           // high quality
      });
    } catch (error) {
      startWith(typeIndex + 1);                   // this type can't do this size: try the next
      return;
    }

    chunks = [];
    let failed = false;
    recorder.ondataavailable = (event) => {
      if (event.data.size) chunks.push(event.data);
    };
    recorder.onerror = () => {
      failed = true;                              // the encoder gave up: try the next type
      startWith(typeIndex + 1);
    };
    recorder.onstop = () => {
      if (failed) return;
      copying = false;
      download(type);
      onChange('stopped');
    };

    recorder.start(1000);                         // save a piece every second
    onChange('recording');
  }

  function download(type) {
    const ext = type.includes('mp4') ? 'mp4' : 'webm';
    const blob = new Blob(chunks, { type });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${getName()}.${ext}`;
    link.click();
  }

  function fail() {
    copying = false;
    recorder = null;
    onChange('failed');
  }

  function start() {
    const canvas = getCanvas();
    if (!canvas) return;
    makeTape(canvas);
    startWith(0);
  }

  function stop() {
    if (isRecording()) recorder.stop();
  }

  function isRecording() {
    return recorder !== null && recorder.state === 'recording';
  }

  function toggle() {
    if (isRecording()) {
      stop();
    } else {
      start();
    }
  }

  return { toggle, stop, isRecording };
}
