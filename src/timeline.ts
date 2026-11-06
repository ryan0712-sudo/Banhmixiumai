// Timeline: single source of truth. Every shot boundary is a beat of the BGM grid.
// Grid measured in analysis/beat_data.json (house-vibez.mp3): 122.00 BPM, t0 0.064s, match 98.5%, mean err 4.7ms.
export const FPS = 30;
export const W = 1080;
export const H = 1920;

export const SOURCE_BEAT0 = 0.064; // seconds, from beat_data.json (never mix render offsets in here)
export const BEAT_INT = 0.4918; // seconds per beat
export const OUTPUT_AUDIO_OFFSET_SEC = 0.0423; // measured: render audio lags source by 42.3ms (AAC priming, Remotion 4.0.484, aac 48kHz mp4)
export const beatT = (n: number) => SOURCE_BEAT0 + OUTPUT_AUDIO_OFFSET_SEC + n * BEAT_INT;
export const beatF = (n: number) => Math.round(beatT(n) * FPS);

export const SHOTS = {
  s1_mask: { from: 0, to: beatF(10) }, // "XÍU MẠI" text-as-mask → photo takeover lands on beat 8
  s2_panels: { from: beatF(10), to: beatF(20) }, // comic-panel-split: cuts on beats 12 / 12.5 / 13, eat-screen on beat 16
  s3_banhmi: { from: beatF(20), to: beatF(32) }, // sheen-sweep bánh mì card, sweep on beats 24→26
  s4_lockup: { from: beatF(32), to: beatF(46) }, // logo lockup, music lifts on beat 32, ring lands on beat 34
} as const;

export type ShotKey = keyof typeof SHOTS;
export const dur = (k: ShotKey) => SHOTS[k].to - SHOTS[k].from;
export const localBeat = (k: ShotKey, n: number) => beatF(n) - SHOTS[k].from;
export const TOTAL = SHOTS.s4_lockup.to;
