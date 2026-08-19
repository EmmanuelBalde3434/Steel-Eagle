/** Procedural SFX — fully offline, unlocked on first gesture. */

type Bus = { ctx: AudioContext; master: GainNode; sfx: GainNode; music: GainNode };

let bus: Bus | null = null;
let muted = false;

function getBus(): Bus | null {
  if (typeof window === "undefined") return null;
  if (bus) return bus;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  const ctx = new AC({ latencyHint: "interactive" });
  const master = ctx.createGain();
  const sfx = ctx.createGain();
  const music = ctx.createGain();
  master.gain.value = 0.7;
  sfx.gain.value = 0.85;
  music.gain.value = 0.22;
  sfx.connect(master);
  music.connect(master);
  master.connect(ctx.destination);
  bus = { ctx, master, sfx, music };
  return bus;
}

export function unlockAudio(): void {
  const b = getBus();
  if (!b) return;
  if (b.ctx.state === "suspended") void b.ctx.resume();
}

export function setMuted(v: boolean): void {
  muted = v;
  const b = bus;
  if (!b) return;
  b.master.gain.setTargetAtTime(v ? 0 : 0.7, b.ctx.currentTime, 0.02);
}

export function isMuted(): boolean {
  return muted;
}

function beep(
  freq: number,
  dur: number,
  type: OscillatorType,
  gain = 0.12,
  slide = 0,
  dest?: GainNode,
): void {
  const b = getBus();
  if (!b || muted) return;
  const t = b.ctx.currentTime;
  const o = b.ctx.createOscillator();
  const g = b.ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t + dur);
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
  o.connect(g);
  g.connect(dest ?? b.sfx);
  o.start(t);
  o.stop(t + dur + 0.02);
}

export const sfx = {
  shoot() {
    beep(620 + Math.random() * 40, 0.07, "square", 0.07, -280);
    beep(180, 0.05, "triangle", 0.05, -40);
  },
  boom(big = false) {
    beep(big ? 140 : 180, big ? 0.28 : 0.16, "sawtooth", big ? 0.16 : 0.1, -100);
    beep(big ? 90 : 120, big ? 0.34 : 0.18, "triangle", 0.08, -50);
  },
  hit() {
    beep(320, 0.06, "square", 0.06, -80);
  },
  power() {
    beep(520, 0.08, "square", 0.08, 80);
    beep(780, 0.12, "square", 0.06, 120);
  },
  life() {
    beep(440, 0.1, "square", 0.08, 0);
    beep(660, 0.12, "square", 0.07, 0);
    beep(880, 0.16, "square", 0.06, 0);
  },
  steel() {
    beep(240, 0.04, "square", 0.04, 0);
  },
  spawn() {
    beep(200, 0.12, "triangle", 0.05, 160);
  },
  stage() {
    beep(330, 0.12, "square", 0.07, 0);
    beep(440, 0.16, "square", 0.06, 0);
  },
  over() {
    beep(220, 0.2, "sawtooth", 0.1, -80);
    beep(160, 0.35, "triangle", 0.08, -60);
  },
  win() {
    [523, 659, 784, 1046].forEach((f, i) => {
      const b = getBus();
      if (!b || muted) return;
      const t = b.ctx.currentTime + i * 0.12;
      const o = b.ctx.createOscillator();
      const g = b.ctx.createGain();
      o.type = "square";
      o.frequency.setValueAtTime(f, t);
      g.gain.setValueAtTime(0.07, t);
      g.gain.exponentialRampToValueAtTime(0.0008, t + 0.2);
      o.connect(g);
      g.connect(b.sfx);
      o.start(t);
      o.stop(t + 0.22);
    });
  },
  pickup() {
    beep(880, 0.07, "square", 0.06, 200);
  },
};
