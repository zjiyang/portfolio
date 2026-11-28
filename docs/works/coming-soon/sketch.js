// Coming soon
// A placeholder for the next work. Always the last dot on the Works page.

export default function comingSoon(p) {

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.noLoop();                         // nothing moves, so draw only once
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    p.redraw();                         // draw once more at the new size
  };

  // The words are drawn with the canvas's own fillText, in the same font as the page.
  // (p5's textFont() puts quotes around the font name, which breaks names like sans-serif.)
  p.draw = () => {
    p.background(255);

    const ctx = p.drawingContext;
    ctx.font = `14px ${getComputedStyle(document.body).fontFamily}`;
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Coming soon.', p.width / 2, p.height / 2);
  };
}
