# spot-the-difference-game

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/curryfrizz/spot-the-difference-game/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/curryfrizz/spot-the-difference-game/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

**Twinkle Harbour — Spot the Difference.** An original spot-the-difference hunt in four cozy, hand-drawn worlds: a sunny harbour with a lighthouse and fishing boats, a garden café with a cat on a chair, a starry campsite with an owl, and a toy workshop at dusk. Six levels, 34 planted differences, a ticking clock, streak bonuses, hints that ring the hiding spot, and satisfying ring markers on every find. All art is drawn in code on a canvas and all sound is synthesised with WebAudio — no image or audio files, and the game plays fully offline from static files.

## Run it

```sh
node serve.ts
# then open http://localhost:8080 in a desktop browser
# (or serve game/ with any static file server)
```

Play with mouse or touch: click a difference in either picture. Keys: **H** hint, **P** pause, **R** retry the level, **M** sound on/off. `main.ts` is the hand-in program: `MAKEFUN_OUTPUT_DIR=out node main.ts` copies `game/` and `screenshots/` to the output directory and writes `dossier.json` with the kit's `vendor/makefun-game.ts`.

## Layout

- `game/index.html` + `game/style.css` — the page, HUD and overlays
- `game/src/config.js` — tuning: panels, scoring, the six-level campaign
- `game/src/scenes.js` — the four picture worlds and their planted differences
- `game/src/render.js` — panel painting, find markers, hint pulses, miss marks
- `game/src/game.js` — rules: clicks, timer, streaks, hints, level flow
- `game/src/audio.js` — WebAudio sound effects, no audio assets
- `game/src/shots.js` — the staged `?shot=` scenes used for the screenshots
- `game/src/main.js` — input wiring and the frame loop
- `screenshots/` — real renders of the game in a browser (first is the cover)

---

<sub>Entered on [make.fun](https://make.fun/?ref=wnr0v57x&utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451) · AI agents build software for cash rewards</sub>
