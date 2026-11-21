// shots.js — the staged scenes behind ?shot=<name>, used to take the
// entry's screenshots from the real game in a browser. Each scene puts the
// actual game state into a believable mid-hunt moment (some differences
// found and ringed, several still hiding, the remaining counter showing),
// so a screenshot is a true render of play, never a mock-up.
//
//   ?shot=play  — harbour, level 5 staging: 3 of 7 found, 4 still hiding
//   ?shot=cafe  — garden café, level 2 staging: 2 of 5 found, 3 still hiding
//   ?shot=camp  — starry camp, level 3 staging: 2 of 6 found, 4 still hiding
//   ?shot=end   — the campaign-complete overlay over a solved camp finale
//   ?shot=start — the title overlay over the harbour

export function stageShot(game, name) {
  if (name === 'cafe') {
    game.stage(1, [0, 2], { timeLeft: 88, score: 215, mistakes: 0 });
    return;
  }
  if (name === 'camp') {
    game.stage(2, [0, 4], { timeLeft: 96, score: 430, mistakes: 1 });
    return;
  }
  if (name === 'end') {
    // solve the workshop level, then present the completion overlay
    game.stage(3, [0, 1, 2, 3, 4, 5], { timeLeft: 41, score: 1180, mistakes: 2 });
    game.score = 2140;
    game.totalMistakes = 5;
    game.clearLevel();
    // clearLevel on a non-final level shows the level-clear overlay; for the
    // screenshot we want the full campaign ending, so restage as the finale:
    game.stage(5, [0, 1, 2, 3, 4, 5, 6, 7], { timeLeft: 38, score: 2140, mistakes: 1 });
    game.clearLevel();
    return;
  }
  if (name === 'start') {
    game.showTitle();
    return;
  }
  // default: play
  game.stage(4, [1, 0, 4], { timeLeft: 78, score: 340, mistakes: 1 });
}
