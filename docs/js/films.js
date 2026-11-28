// films.js
// The Films page: one film in the middle of the screen, dots at the bottom to switch.
// Works the same way as the Works page, but the films are Vimeo videos.

// ---------- The list of films, in order: one dot each ----------
// To add a film: add { title, id } to this list.
// id = the number at the end of the Vimeo link, e.g. vimeo.com/232998879 → '232998879'
const FILMS = [
  { title: 'Six Pieces in Stargazer Album (Trailer)', id: '464024661' },
  { title: 'stretch.', id: '232998879' },
];

const player = document.getElementById('film-player');
const caption = document.getElementById('film-title');
const dots = document.getElementById('film-dots');


// =====================================================
// show
// Input: i = which film in FILMS (0 = the first)
// Returns: nothing
// What it does: loads film i into the player (the old one stops),
//   writes its title, and marks its dot
// =====================================================
function show(i) {
  const film = FILMS[i];

  // title=0, byline=0, portrait=0: hide Vimeo's own title, name and picture on the video,
  // because the title is already written under it
  player.src = `https://player.vimeo.com/video/${film.id}?title=0&byline=0&portrait=0&autopause=0`;
  player.title = film.title;
  caption.textContent = film.title;

  dots.querySelectorAll('button').forEach((button, j) => {
    if (j === i) {
      button.setAttribute('aria-current', 'true');
    } else {
      button.removeAttribute('aria-current');
    }
  });
}


// ---------- Make one dot per film ----------
FILMS.forEach((film, i) => {
  const button = document.createElement('button');
  button.className = 'dot';
  button.setAttribute('aria-label', film.title);
  button.addEventListener('click', () => show(i));
  dots.appendChild(button);
});

show(0);
