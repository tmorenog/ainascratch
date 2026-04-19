/**
 * Tiny procedural "jazz lounge / elevator music" generator. Uses the
 * Web Audio API to layer a mellow Rhodes-ish pad, a walking quarter-note
 * bass, a breathy lead melody on the blues scale, and a soft brushed
 * hi-hat swish. Plays a classic ii-V-I-vi turnaround in C major — no
 * audio files, no downloads. Starts on first user gesture and is
 * mutable from the UI.
 */

// ii-V-I-vi turnaround in C major, each chord a 4-note 7th voicing.
// Bar length = 8 eighth-note steps; one chord per bar.
const PROGRESSION: { chord: number[]; root: number; fifth: number }[] = [
  { chord: [62, 65, 69, 72], root: 38, fifth: 45 }, // Dm7  (ii)
  { chord: [55, 59, 62, 65], root: 43, fifth: 50 }, // G7   (V)
  { chord: [60, 64, 67, 71], root: 36, fifth: 43 }, // Cmaj7 (I)
  { chord: [57, 60, 64, 67], root: 33, fifth: 40 }, // Am7  (vi)
];

// A breathy lead melody floating over each chord (8 eighth-note slots
// per bar; undefined = rest). Stays in the C blues-ish scale so the
// feel is jazzy but cozy.
const MELODY: (number | null)[][] = [
  // Dm7: A – – C  D – F –
  [69, null, null, 72, 74, null, 77, null],
  // G7: B – D – F – E D
  [71, null, 74, null, 77, null, 76, 74],
  // Cmaj7: E – G – B – C –
  [64, null, 67, null, 71, null, 72, null],
  // Am7: A – E – G – A –
  [69, null, 76, null, 79, null, 81, null],
];

// Brushed hi-hat "ts-ts" pattern (true = play). Off-beat accents for a
// lounge swing feel.
const HIHAT: boolean[] = [false, true, false, true, false, true, false, true];

const NOTE_MS = 340; // eighth note @ ~88 bpm
const STEPS_PER_BAR = 8;
const BAR_MS = NOTE_MS * STEPS_PER_BAR;

function midiToHz(n: number): number {
  return 440 * Math.pow(2, (n - 69) / 12);
}

export class CozyMusic {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private padBus: GainNode | null = null;
  private padFilter: BiquadFilterNode | null = null;
  private timer: number | null = null;
  private step = 0;
  private chordIdx = 0;
  private _muted = false;
  private noiseBuf: AudioBuffer | null = null;

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
    if (this.ctx.state === "suspended") this.ctx.resume().catch(() => {});

    this.master = this.ctx.createGain();
    this.master.gain.value = this._muted ? 0 : 0.1;

    // Mellow delay for that hallway shimmer.
    const delay = this.ctx.createDelay();
    delay.delayTime.value = 0.33;
    const feedback = this.ctx.createGain();
    feedback.gain.value = 0.22;
    delay.connect(feedback);
    feedback.connect(delay);

    // Warm low-pass on the pad so comped chords sound soft.
    this.padBus = this.ctx.createGain();
    this.padBus.gain.value = 0.9;
    this.padFilter = this.ctx.createBiquadFilter();
    this.padFilter.type = "lowpass";
    this.padFilter.frequency.value = 1400;
    this.padFilter.Q.value = 0.5;
    this.padBus.connect(this.padFilter);
    this.padFilter.connect(this.master);
    this.padFilter.connect(delay);

    this.master.connect(delay);
    delay.connect(this.ctx.destination);
    this.master.connect(this.ctx.destination);

    // Pre-baked white-noise buffer for the brushed hi-hat swish.
    const sampleRate = this.ctx.sampleRate;
    const buf = this.ctx.createBuffer(1, sampleRate * 0.5, sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.6;
    }
    this.noiseBuf = buf;

    this.schedule();
  }

  private schedule() {
    if (!this.ctx || !this.master) return;
    this.playNextNote();
    this.timer = window.setTimeout(() => this.schedule(), NOTE_MS);
  }

  private playNextNote() {
    if (!this.ctx || !this.master || !this.padBus) return;
    const now = this.ctx.currentTime;
    const bar = PROGRESSION[this.chordIdx % PROGRESSION.length];
    const stepInBar = this.step % STEPS_PER_BAR;

    // --- Downbeat of each bar: lay down the full chord pad for warmth.
    if (stepInBar === 0) {
      const dur = BAR_MS / 1000 + 0.25;
      for (const note of bar.chord) {
        this.playPad(midiToHz(note), now, dur, 0.18);
      }
    }

    // --- Walking bass: root on beat 1, fifth on beat 3.
    if (stepInBar === 0) {
      this.playBass(midiToHz(bar.root), now, 0.75);
    } else if (stepInBar === 4) {
      this.playBass(midiToHz(bar.fifth), now, 0.75);
    } else if (stepInBar === 6) {
      // little approach-note walk back to the next chord
      const nextBar = PROGRESSION[(this.chordIdx + 1) % PROGRESSION.length];
      this.playBass(midiToHz(nextBar.root - 1), now, 0.55, 0.15);
    }

    // --- Lead melody (Rhodes-ish triangle with chorus-y vibrato).
    const melodyNote = MELODY[this.chordIdx % PROGRESSION.length][stepInBar];
    if (melodyNote != null) {
      this.playLead(midiToHz(melodyNote), now, 0.55, 0.28);
    }

    // --- Brushed hi-hat swish on off-beats.
    if (HIHAT[stepInBar]) {
      this.playHat(now, 0.12);
    }

    this.step += 1;
    if (this.step % STEPS_PER_BAR === 0) {
      this.chordIdx += 1;
    }
  }

  private playPad(hz: number, now: number, durS: number, peak: number) {
    if (!this.ctx || !this.padBus) return;
    const osc = this.ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = hz;
    // Slight detune on a second voice for a chorus-y Rhodes feel.
    const osc2 = this.ctx.createOscillator();
    osc2.type = "triangle";
    osc2.frequency.value = hz * 1.003;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(peak, now + 0.18);
    g.gain.linearRampToValueAtTime(peak * 0.6, now + durS * 0.6);
    g.gain.exponentialRampToValueAtTime(0.0001, now + durS);
    osc.connect(g);
    osc2.connect(g);
    g.connect(this.padBus);
    osc.start(now);
    osc2.start(now);
    osc.stop(now + durS + 0.1);
    osc2.stop(now + durS + 0.1);
  }

  private playBass(hz: number, now: number, durS: number, peak = 0.32) {
    if (!this.ctx || !this.master) return;
    const osc = this.ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = hz;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(peak, now + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now + durS);
    // Softer high end so it sits under the pad.
    const lp = this.ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 500;
    osc.connect(lp);
    lp.connect(g);
    g.connect(this.master);
    osc.start(now);
    osc.stop(now + durS + 0.05);
  }

  private playLead(hz: number, now: number, durS: number, peak: number) {
    if (!this.ctx || !this.master) return;
    const osc = this.ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = hz;
    // Tiny vibrato LFO for a breathy jazz feel.
    const lfo = this.ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 5.5;
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = hz * 0.004;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(peak, now + 0.05);
    g.gain.linearRampToValueAtTime(peak * 0.9, now + durS * 0.6);
    g.gain.exponentialRampToValueAtTime(0.0001, now + durS);
    osc.connect(g);
    g.connect(this.master);
    lfo.start(now);
    osc.start(now);
    lfo.stop(now + durS + 0.1);
    osc.stop(now + durS + 0.1);
  }

  private playHat(now: number, peak: number) {
    if (!this.ctx || !this.master || !this.noiseBuf) return;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    src.playbackRate.value = 1.0;
    const hp = this.ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 6000;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(peak, now + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
    src.connect(hp);
    hp.connect(g);
    g.connect(this.master);
    src.start(now);
    src.stop(now + 0.2);
  }

  toggleMute() {
    this._muted = !this._muted;
    if (this.master) this.master.gain.value = this._muted ? 0 : 0.1;
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
      this.padBus = null;
      this.padFilter = null;
      this.noiseBuf = null;
    }
  }
}
