// Shot 1 · text-as-mask (demos/opening/text-as-mask/TextAsMask.tsx, adapted to 9:16).
// Cream glaze stage, giant "XÍU / MẠI" cut out of it; the bowl photo drifts inside the strokes.
// Breath, then the letters rush 46× (log-space t^1.8) and the photo takes over full screen on beat 8.
// Kept from the demo: wipe-in from baseline, 1.04→1 settle, breath 1→0.965, log-space rush, origin pinned
// inside a solid stroke, wrapper/inner counter-transform, takeover layer only after S≈24×, ≥30f hold.
import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { EASE, bezier, ramp } from '../fx/Polish';
import { C, SANS, SERIF } from '../brand';
import { MASK_FONT_CSS } from '../maskFont';
import { CAM_FULL, Photo, type Cam } from '../Photo';
import { beatF } from '../timeline';

export const S1_DEFAULTS = {
  eyebrow: 'BÁNH MÌ',
  sub: 'Sốt cà chua đậm đà · nóng hổi',
};

const W = 1080, H = 1920;
const FS = 420;
const LINE1_Y = 860; // baselines
const LINE2_Y = 1240;
const svgText = (fill: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><style>${MASK_FONT_CSS}</style>` +
  `<text x="540" y="${LINE1_Y}" font-family="BVPMask" font-weight="900" font-size="${FS}" letter-spacing="-14" text-anchor="middle" fill="${fill}">XÍU</text>` +
  `<text x="540" y="${LINE2_Y}" font-family="BVPMask" font-weight="900" font-size="${FS}" letter-spacing="-14" text-anchor="middle" fill="${fill}">MẠI</text></svg>`;
const MASK_URL = `url("data:image/svg+xml,${encodeURIComponent(svgText('white'))}")`;
const SHADOW_URL = `data:image/svg+xml,${encodeURIComponent(svgText(C.sauceDeep))}`;

// Rush origin: inside the solid vertical stroke of the "I" in MẠI (measured on a rendered frame).
export const ORIGIN_X = 897;
export const ORIGIN_Y = 1080;
const ORIGIN = `${ORIGIN_X}px ${ORIGIN_Y}px`;
const MAX_S = 46;

// Beat-anchored timing (local frames; shot starts at 0)
const IN_END = 18;
const DRIFT0 = 18;
const RUSH1 = beatF(8); // takeover completes on beat 8 (kick)
const RUSH0 = RUSH1 - 24;
const BREATH0 = RUSH0 - 8;
const DRIFT1 = BREATH0;
const LAND1 = RUSH1 + 4;
const PHOTO_S0 = 1.32;

export const S1Mask: React.FC<Partial<typeof S1_DEFAULTS>> = (p) => {
  const { eyebrow, sub } = { ...S1_DEFAULTS, ...p };
  const f = useCurrentFrame();
  const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

  const intro = ramp(f, 0, IN_END, EASE.snappy);
  const wipe = ramp(f, 0, 16, EASE.out);
  const introS = 1.04 - 0.04 * intro;

  const breath = ramp(f, BREATH0, RUSH0 - BREATH0, EASE.swift);
  const rush = Math.pow(ramp(f, RUSH0, RUSH1 - RUSH0, EASE.linear), 1.8);
  const s0 = introS * (1 - 0.035 * breath);
  const maskS = s0 * Math.pow(MAX_S / s0, rush);
  const cdx = (540 - ORIGIN_X) * rush;
  const cdy = (960 - ORIGIN_Y) * rush;
  const wrapT = `translate(${cdx.toFixed(2)}px, ${cdy.toFixed(2)}px) scale(${maskS})`;
  const innerT = `scale(${1 / maskS}) translate(${(-cdx).toFixed(2)}px, ${(-cdy).toFixed(2)}px)`;

  // Photo drifts vertically inside the strokes (the image's information runs top→bottom: bread → bowl).
  const drift = ramp(f, DRIFT0, DRIFT1 - DRIFT0, bezier(0.3, 0, 0.7, 1));
  const land = ramp(f, RUSH0, LAND1 - RUSH0, EASE.snappy);
  const dy = (190 - 380 * drift) * (1 - land);
  const photoS = PHOTO_S0 + (1 - PHOTO_S0) * land;
  const cover = interpolate(rush, [0.86, 0.95], [0, 1], clamp);
  const rim = 1 - interpolate(rush, [0, 0.25], [0, 1], clamp);
  const eyebrowIn = ramp(f, 6, 20, EASE.out);
  const subIn = ramp(f, 14, 18, EASE.out);
  const out = 1 - ramp(f, BREATH0, 10, EASE.exit);
  // after takeover: very slow push so the photo is alive, not a dead frame
  const hold = ramp(f, LAND1, 60, EASE.linear);
  const cam: Cam = { ...CAM_FULL, s: CAM_FULL.s * (1 + 0.012 * hold) };

  const photo = (
    <div style={{ position: 'absolute', inset: 0, transform: `translate(0px, ${dy.toFixed(2)}px) scale(${photoS.toFixed(4)})`, transformOrigin: '50% 50%' }}>
      <Photo cam={cam} />
    </div>
  );
  const clipBottom = `inset(0 0 ${((1 - wipe) * (H - LINE1_Y + FS * 0.9)).toFixed(1)}px 0)`;

  return (
    <AbsoluteFill style={{ background: C.cream, overflow: 'hidden' }}>
      {/* glaze stage: warm key light from top-left + soft vignette */}
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 80% 55% at 35% 18%, #fffaf0 0%, ${C.cream} 55%, #e7d9bd 100%)` }} />
      <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 260px rgba(90,60,30,0.22)' }} />

      <img src={SHADOW_URL} style={{
        position: 'absolute', left: 0, top: 30, width: W, height: H, opacity: 0.24 * rim * intro, filter: 'blur(24px)',
        transform: wrapT, transformOrigin: ORIGIN, clipPath: clipBottom,
      }} />

      <div style={{
        position: 'absolute', inset: 0, transform: wrapT, transformOrigin: ORIGIN, clipPath: clipBottom,
        WebkitMaskImage: MASK_URL, maskImage: MASK_URL, WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
        WebkitMaskSize: `${W}px ${H}px`, maskSize: `${W}px ${H}px`,
      }}>
        <div style={{ position: 'absolute', inset: 0, transform: innerT, transformOrigin: ORIGIN }}>{photo}</div>
      </div>

      {cover > 0 && <div style={{ position: 'absolute', inset: 0, opacity: cover }}>{photo}</div>}

      {/* eyebrow + sub */}
      <div style={{ position: 'absolute', top: 300, width: '100%', textAlign: 'center', opacity: eyebrowIn * out }}>
        <span style={{
          fontFamily: SANS, fontSize: 58, fontWeight: 800, color: C.sauceDeep,
          letterSpacing: `${(0.18 + (1 - eyebrowIn) * 0.3).toFixed(3)}em`,
        }}>{eyebrow}</span>
      </div>
      <div style={{
        position: 'absolute', top: LINE2_Y + 110, width: '100%', textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 62, fontWeight: 600,
        color: C.ink, opacity: subIn * out, transform: `translateY(${((1 - subIn) * 18).toFixed(2)}px)`,
      }}>{sub}</div>
    </AbsoluteFill>
  );
};
