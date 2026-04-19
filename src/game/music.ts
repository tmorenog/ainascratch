/**
 * Tiny procedural "elevator music" generator. Uses the Web Audio API to
 * play a gentle looping chord progression with sine-wave arpeggios, a soft
 * sawtooth lead melody, and a warm triangle bass — no audio files, no
 * downloads. Starts on first user gesture (browsers require that) and can
 * be muted from the UI.
 */

// Classic "Muzak" I-vi-ii-V loop in C major. Each chord is a 4-note
// arpeggio played as gentle running eighths.
const PROGRESSION: number[][] = [
  [60, 64, 67, 72], // C  major
  [57, 60, 64, 69], // Am
  [62, 65, 69, 72], // Dm
  [67, 71, 74, 79], // G  major
];

// Simple 16-note melody (one note per arpeggio step) that floats above the
// chords. MIDI notes; repeats every loop for that cozy, predictable feel.
const MELODY: number[] = [
  72, 74, 76, 79, // over C
  76, 72, 69, 72, // over Am
  74, 72, 69, 74, // over Dm
  74, 71, 74, 79, // over G
];

const NOTE_MS = 400;
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
    // Some browsers start the context suspended; resume so we actually hear it.
    if (this.ctx.state === "suspended") this.ctx.resume().catch(() => {});

    this.master = this.ctx.createGain();
    this.master.gain.value = this._muted ? 0 : 0.09;
    // A gentle delay gives a "hallway" shimmer without a convolver.
    const delay = this.ctx.createDelay();
    delay.delayTime.value = 0.28;
    const feedback = this.ctx.createGain();
    feedback.gain.value = 0.28;
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
    this.playVoice("sine", midiToHz(note), now, NOTE_MS / 1000, 0.5);

    // Lead melody — slightly louder, softer timbre, one note per step
    const melodyNote = MELODY[
      (this.chordIdx % PROGRESSION.length) * CHORD_NOTES + (this.step % CHORD_NOTES)
    ];
    this.playVoice("triangle", midiToHz(melodyNote), now, (NOTE_MS * 1.2) / 1000, 0.35);

    // Pad — hold the bass root under each chord for warmth
    if (this.step % CHORD_NOTES === 0) {
      this.playVoice("triangle", midiToHz(chord[0] - 12), now, CHORD_MS / 1000, 0.35, 0.18);
    }

    this.step += 1;
    if (this.step % CHORD_NOTES === 0) {
      this.chordIdx += 1;
    }
  }

  private playVoice(
    type: OscillatorType,
    hz: number,
    now: number,
    durS: number,
    peak: number,
    attack = 0.04,
  ) {
    if (!this.ctx || !this.master) return;
    const osc = this.ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = hz;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(peak, now + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, now + durS);
    osc.connect(g);
    g.connect(this.master);
    osc.start(now);
    osc.stop(now + durS + 0.05);
  }

  toggleMute() {
    this._muted = !this._muted;
    if (this.master) this.master.gain.value = this._muted ? 0 : 0.09;
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
