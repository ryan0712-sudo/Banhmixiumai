// Central SFX table. Every `from` derives from SHOTS / beatF, never a bare absolute frame.
// from = target peak frame − source peak lag − output audio offset (sound-design §4.6).
// Sources are procedurally generated (analysis/gen_sfx.py): Freesound refused automated access (HTTP 403).
import { SHOTS, beatF } from './timeline';

export type Sfx = { from: number; src: string; volume: number; dur?: number; note: string };

const OUT = 1; // AAC priming ≈1.28f at 48kHz; re-measured after render
const PEAK = { whoosh: 16, whooshSoft: 13, riser: 33, impact: 0, shutter: 0, shimmer: 0 };

const s2 = SHOTS.s2_panels.from;
const s3 = SHOTS.s3_banhmi.from;
const LAND = beatF(34); // logo badge lands (shot 4)

export const SFX: Sfx[] = [
  // shot 1: letters rush open, photo takes over on beat 8
  { from: beatF(8) - PEAK.whoosh - OUT, src: 'audio/sfx/whoosh.wav', volume: 0.8, dur: 30, note: 'rush whoosh → takeover' },
  // shot 2: three panel cuts = three shutter clicks, alternating samples, stepping down
  { from: beatF(12) - PEAK.shutter - OUT, src: 'audio/sfx/shutter-a.wav', volume: 0.8, dur: 8, note: 'cut 1' },
  { from: beatF(12.5) - PEAK.shutter - OUT, src: 'audio/sfx/shutter-b.wav', volume: 0.68, dur: 8, note: 'cut 2' },
  { from: beatF(13) - PEAK.shutter - OUT, src: 'audio/sfx/shutter-a.wav', volume: 0.58, dur: 8, note: 'cut 3' },
  // panel 3 eats the screen (sweep starts on beat 16, peak mid-sweep)
  { from: beatF(16) + 7 - PEAK.whoosh - OUT, src: 'audio/sfx/whoosh.wav', volume: 0.7, dur: 26, note: 'eat-screen sweep' },
  // shot 3: bánh mì card rises in (sheen sweep itself stays silent, per card)
  { from: s3 + 12 - PEAK.whooshSoft - OUT, src: 'audio/sfx/whoosh-soft.wav', volume: 1.0, dur: 30, note: 'card rise' },
  // shot 4: riser → impact → shimmer
  { from: LAND - PEAK.riser - OUT, src: 'audio/sfx/riser.wav', volume: 0.55, dur: 34, note: 'ring collapse riser' },
  { from: LAND - PEAK.impact - OUT, src: 'audio/sfx/impact.wav', volume: 0.6, dur: 48, note: 'badge lands' },
  { from: LAND + 62 - PEAK.shimmer - OUT, src: 'audio/sfx/shimmer.wav', volume: 0.5, dur: 54, note: 'address tagline' },
];
void s2;
