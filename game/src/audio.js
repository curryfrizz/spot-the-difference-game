// audio.js — all sound is synthesised with WebAudio oscillators, so the
// game ships no audio files and works fully offline. Sounds are short,
// friendly and quiet: a two-note chime for a find, a soft buzz for a miss,
// a rising arpeggio when a level is cleared, and a tick in the last seconds.

export class SoundBox {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  /** Create the context lazily, on the first user gesture that needs it. */
  ensure() {
    if (this.ctx === null) {
      const AudioCtor = window.AudioContext || window.webkitAudioContext;
      if (AudioCtor) this.ctx = new AudioCtor();
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  tone(freq, start, duration, type = 'sine', volume = 0.12) {
    const ctx = this.ensure();
    if (!ctx || this.muted) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const t0 = ctx.currentTime + start;
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.05);
  }

  find(streak = 0) {
    const base = 660 + Math.min(streak, 5) * 40;
    this.tone(base, 0, 0.14, 'sine', 0.14);
    this.tone(base * 1.5, 0.07, 0.2, 'sine', 0.12);
  }

  miss() {
    this.tone(160, 0, 0.16, 'square', 0.05);
    this.tone(120, 0.05, 0.18, 'square', 0.04);
  }

  hint() {
    this.tone(880, 0, 0.12, 'triangle', 0.1);
    this.tone(1174, 0.1, 0.16, 'triangle', 0.09);
  }

  tick() {
    this.tone(1050, 0, 0.05, 'sine', 0.05);
  }

  levelClear() {
    const notes = [523, 659, 784, 1046];
    notes.forEach((freq, i) => this.tone(freq, i * 0.09, 0.22, 'triangle', 0.12));
  }

  gameOver() {
    const notes = [392, 330, 262];
    notes.forEach((freq, i) => this.tone(freq, i * 0.14, 0.24, 'triangle', 0.1));
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }
}
