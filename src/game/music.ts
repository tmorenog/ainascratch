/**
 * Tiny procedural "elevator music" generator. Uses the Web Audio API to
 * play a gentle looping chord progression with sine-wave arpeggios — no
 * audio files, no downloads. Starts on first user gesture (browsers
 * require that) and can be muted from the UI.
 */

// Simple I-vi-IV-V progression in C major, each chord as a 4-note arpeggio.
// Notes are MIDI numbers; we convert to Hz.
const PROGRESSION: number[][] = [
  [60, 64, 67, 72], // C  major
  [57, 60, 64, 69], // Am
  [65, 69, 72, 77], // F  major
  [67, 71, 74, 79], // G  major
];

const NOTE_MS = 350;
const CHORD_NOTES = 4;
const CHORD_MS = NOTE_MS * CHORD_NOTES;

function midiToHz(n: number): number {
  return 440 * Math.pow(2, (n - 69) / 12);
}

export class CozyMusic {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private timer: number | null = null;
  private step = 0;
  private chordIdx = 0;
  private _muted = false;

  get muted(): boolean {
    return this._muted;
  }

  start() {
    if (this.ctx) return;
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = this._muted ? 0 : 0.08;
    // A tiny delay gives a bit of "room" without needing a convolver.
    const delay = this.ctx.createDelay();
    delay.delayTime.value = 0.22;
    const feedback = this.ctx.createGain();
    feedback.gain.value = 0.25;
    delay.connect(feedback);
    feedback.connect(delay);
    this.master.connect(delay);
    delay.connect(this.ctx.destination);
    this.master.connect(this.ctx.destination);

    this.schedule();
  }

  private schedule() {
    if (!this.ctx || !this.master) return;
    this.playNextNote();
    this.timer = window.setTimeout(() => this.schedule(), NOTE_MS);
  }

  private playNextNote() {
    if (!this.ctx || !this.master) return;
    const now = this.ctx.currentTime;
    const chord = PROGRESSION[this.chordIdx % PROGRESSION.length];
    const note = chord[this.step % CHORD_NOTES];

    // Arpeggio voice — soft sine
    const osc = this.ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = midiToHz(note);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.6, now + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, now + NOTE_MS / 1000);
    osc.connect(g);
    g.connect(this.master);
    osc.start(now);
    osc.stop(now + NOTE_MS / 1000 + 0.05);

    // Pad — hold the bass root under each chord for warmth
    if (this.step % CHORD_NOTES === 0) {
      const bass = this.ctx.createOscillator();
      bass.type = "triangle";
      bass.frequency.value = midiToHz(chord[0] - 12);
      const bg = this.ctx.createGain();
      bg.gain.setValueAtTime(0, now);
      bg.gain.linearRampToValueAtTime(0.3, now + 0.15);
      bg.gain.exponentialRampToValueAtTime(0.0001, now + CHORD_MS / 1000);
      bass.connect(bg);
      bg.connect(this.master);
      bass.start(now);
      bass.stop(now + CHORD_MS / 1000 + 0.05);
    }

    this.step += 1;
    if (this.step % CHORD_NOTES === 0) {
      this.chordIdx += 1;
    }
  }

  toggleMute() {
    this._muted = !this._muted;
    if (this.master) this.master.gain.value = this._muted ? 0 : 0.08;
    try {
      localStorage.setItem("ainas-bakery-muted", this._muted ? "1" : "0");
    } catch {
      /* ignore */
    }
  }

  restoreMutedFromStorage() {
    try {
      this._muted = localStorage.getItem("ainas-bakery-muted") === "1";
    } catch {
      /* ignore */
    }
  }

  stop() {
    if (this.timer != null) {
      window.clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.ctx) {
      this.ctx.close().catch(() => {});
      this.ctx = null;
      this.master = null;
    }
  }
}
