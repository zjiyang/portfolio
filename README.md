# Portfolio

My portfolio of interactive and generative work, made with code in p5.js.

**Live site:** https://zjiyang.github.io/portfolio/

## About

I came to computer science from film production. Here I make visual work with code: some pieces are small 2D studies with a grid, a wave or an orbit, others are 3D scenes or pieces that visitors can change with the mouse or by typing. Many ideas start from [Tim Rodenbröker](https://timrodenbroeker.de/)'s creative coding tutorials, which I build again in p5.js and take further.

## Artist Statement

Every few days I start a new sketch: write it, run it, change a number, and watch what happens on screen. These sketches started as practice, so there is no single theme yet. I find it while making, in the small details I choose to change. As a theme takes shape, I bring it together in finished pieces under Works.

I made this site to keep my creativity going, and to share what I make. For me, making visual work is what keeps the joy of writing code alive. That joy feels rare, and I'd like to hold on to it. I care about what an image tells people, and how a small change makes them feel. That is where a single line of code comes alive for me.

What I want to see is often very subtle. To get there, I need to understand what each line of code really does. Only then can I change the small details that matter to me.

## How the site is designed

- **Two sections.** **Works** is the home page, for finished pieces. **Sketches** is where ongoing studies live, collected on a calendar. Over time, the strongest sketches grow into finished works.
- **One data file drives the calendar.** `calendar.js` lists which days have a sketch and which reference images go with it. The calendar is built from that list, so adding a day means adding one line.
- **Each piece runs in its own iframe.** One sketch can't break another or the rest of the page. The iframe grows to fit its content, so a sketch with controls under the canvas still shows in full.
- **Notes load only when needed.** A day's short note is fetched when you open that day. If you click through days quickly, an older note can't replace the newer one.
- **No build step.** Plain HTML, CSS and JavaScript, with shared style and script files across pages.
- **Every change goes through a pull request.** Each new sketch is made on its own branch and merged into `main`, and GitHub Pages deploys it from the `docs/` folder.

## Built with

p5.js (including WebGL for 3D) · HTML · CSS · JavaScript · GitHub Pages

## Project structure

```
docs/
├── index.html          Works (home page)
├── css/                shared styles
├── js/calendar.js      sketch list and calendar
└── sketches/
    ├── index.html      Sketches: viewer and calendar
    └── 2026-11-10/     one folder per day: sketch.js, optional note and reference images
```

## What's next

- Fill the Works page with finished pieces grown from the strongest sketches
- Rebuild the site as a React app

## Author

Jiyang Zhang · [github.com/zjiyang](https://github.com/zjiyang)
