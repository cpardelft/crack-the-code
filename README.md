# Crack the Code — Geocache Riddle

A single mobile-friendly screen that presents a "crack the code" logic
riddle: five clues lead to a hidden 3-digit code, the visitor dials it in
with tap up/down steppers, and gets an enjoyable success or a gentle
"try again" on failure.

No build step, no dependencies, no backend — just `index.html`, `style.css`
and `script.js`. Works offline once loaded.

## Running it locally

Just open `index.html` in a browser, or serve the folder with any static
server, e.g.:

```bash
npx serve .
```

## The puzzle

The clues on screen are a Mastermind-style logic puzzle: each clue shows
three digits and tells you how many of them are in the real code and
whether they're in the right spot. The code itself lives in `script.js` as
`SECRET_CODE` — change the clue text in `index.html` and that constant
together if you ever swap in a different code.

Note: the check happens entirely in the browser, so the answer is visible
to anyone who opens the page's source. That's normal for this kind of
puzzle (the challenge is reading the clues, not reverse-engineering the
JavaScript) — just don't rely on it for anything that needs real secrecy.

## Deploying

### Push to GitHub

```bash
cd crack-the-code
git init
git add .
git commit -m "Crack the code geocache riddle"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

### Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and import the GitHub
   repo you just pushed.
2. Framework preset: choose **Other** (it's a static site, no build
   command or output directory needed).
3. Click **Deploy**. Vercel will serve `index.html` as-is.

You can also deploy straight from your machine without GitHub using the
[Vercel CLI](https://vercel.com/docs/cli):

```bash
npm i -g vercel
vercel
```

## Customizing

- **Theme / colors**: CSS custom properties at the top of `style.css`
  (`--bg-0`, `--gold`, `--parchment`, etc).
- **Copy**: the intro text, clue wording and success/fail messages are
  plain text in `index.html` / `script.js` — edit freely.
- **Sound & confetti**: generated in `script.js` with the Web Audio API
  and a small canvas particle loop — no audio files or libraries to swap
  in or manage. A mute toggle (top-right of the dial section) remembers
  the visitor's preference between visits.
- **Reduced motion**: shake/glow/confetti animations are skipped
  automatically when the visitor's OS has "reduce motion" turned on.
