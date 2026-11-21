// main.ts — the hand-in program for Twinkle Harbour: Spot the Difference.
// Runs on Node 22 with the standard library only, in the grader's sandbox
// and locally alike. It copies the static game (game/) and the maker's
// screenshots (screenshots/) into the output directory and writes the
// dossier the judge reads, using the kit's own buildDossier library in
// vendor/ — unchanged, so the dossier here matches the gate's rebuild.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The caps below are the competition gate's own limits, passed to the
// dossier builder so an entry that would be refused is refused here first:
// at most 4 screenshots of at most 256 KiB each, at most 993 entries and
// 48 MiB under game/, and no game path longer than 1000 bytes.
const dossier = buildDossier(out, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(out, 'dossier.json'), dossier);
