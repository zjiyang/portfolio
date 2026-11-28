// Coming soon
// A placeholder for the next work. Always the last dot on the Works page.

export default function comingSoon(p) {

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.textFont('sans-serif');
    p.textAlign(p.CENTER, p.CENTER);
    p.noLoop();                         // nothing moves, so draw only once
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    p.redraw();                         // draw once more at the new size
  };

  p.draw = () => {
    p.background(255);
    p.fill(0);
    p.noStroke();
    p.textSize(14);
    p.text('Coming soon.', p.width / 2, p.height / 2);
  };
}
