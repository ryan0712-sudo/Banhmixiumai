// Shot 3 · sheen-sweep (demos/effects/light-play-moves/SheenSweepRetry.tsx, adapted to 9:16 + photo card).
// The bánh mì is the hero card on a dark wood stage. The card turns toward the light while ONE 115° highlight
// band sweeps across it (beats 24→26), clipped by the rounded corners, mounted only during the sweep.
// Kept from the demo: slow no-bounce spring entrance, 2-layer shadow, wide soft band 0.14 + narrow core 0.5 (screen),
// rotateY turn during the sweep, top hairline catching the light, CTA after the sweep, long quiet hold.
import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import { EASE, Grain, Vignette, mix, ramp } from '../fx/Polish';
import { TextReveal, alpha, springAt } from '../fx/Look';
import { C, SANS, SERIF } from '../brand';
import { dur, localBeat } from '../timeline';

export const S3_DEFAULTS = {
  eyebrow: 'ĂN KÈM',
  title: 'Bánh mì\nnóng giòn.',
  body: 'Chấm sốt xíu mại là hết sẩy.',
  cta: 'Bữa sáng đậm vị Sài Gòn',
};

const W = 960;
const H = 501; // card crop of the loaf (source 20..740 × 165..541, aspect 1.915)
const R = 40;
const CX = 540;
const CY = 1000;

const SWEEP_START = localBeat('s3_banhmi', 25);
const SWEEP_END = localBeat('s3_banhmi', 27);
const TURN_END = SWEEP_END + 6;

export const S3Sheen: React.FC<Partial<typeof S3_DEFAULTS>> = (p) => {
  const d = { ...S3_DEFAULTS, ...p };
  const frame = useCurrentFrame();
  const total = dur('s3_banhmi');

  const enter = springAt(frame, 0, { damping: 24, stiffness: 70, mass: 1.1 });
  const shadowIn = springAt(frame, 4, { damping: 24, stiffness: 70, mass: 1.1 });
  const turn = ramp(frame, SWEEP_START - 4, TURN_END - SWEEP_START + 4, EASE.smooth);
  const drift = ramp(frame, TURN_END, total - TURN_END, EASE.out);
  const rotY = mix(-30, -16, enter) + 8 * turn + 1.5 * drift;
  const rotX = mix(22, 12, enter) - 2 * turn;
  const lift = mix(160, 0, enter) - 8 * drift;
  const scale = mix(0.94, 1, enter);
  const appear = ramp(frame, 0, 8, EASE.out);

  const sweepOn = frame >= SWEEP_START && frame <= SWEEP_END;
  const pr = ramp(frame, SWEEP_START, SWEEP_END - SWEEP_START, EASE.swift);
  const bandC = mix(-0.45 * W, 1.45 * W, pr);
  const bandX = bandC - W;
  const topX = bandC + ((H / 2) * Math.cos((65 * Math.PI) / 180)) / Math.sin((115 * Math.PI) / 180);
  const cta = ramp(frame, SWEEP_END + 2, 16, EASE.snappy);

  return (
    <AbsoluteFill style={{ overflow: 'hidden', fontFamily: SANS }}>
      {/* dark wood stage, warm key light top-left (like the morning sun in the photo) */}
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, ${C.wood2} 0%, ${C.wood} 48%, ${C.ink} 100%)` }} />
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 70% 45% at 22% 12%, ${alpha('#ffcf8a', 0.32)} 0%, ${alpha('#ffcf8a', 0)} 70%)` }} />
      <div style={{ position: 'absolute', inset: 0, background: `repeating-linear-gradient(176deg, rgba(0,0,0,0.0) 0px, rgba(0,0,0,0.0) 26px, rgba(0,0,0,0.12) 27px, rgba(0,0,0,0.0) 31px)`, opacity: 0.6 }} />

      {/* card shadows */}
      <div style={{
        position: 'absolute', left: CX - W * 0.42, top: CY + H * 0.42 + mix(70, 0, shadowIn), width: W * 0.84, height: 80,
        borderRadius: '50%', background: alpha('#000000', mix(0.12, 0.5, shadowIn)), filter: 'blur(28px)', opacity: appear,
      }} />
      <div style={{
        position: 'absolute', left: CX - W * 0.5, top: CY + H * 0.28, width: W, height: 260,
        borderRadius: '50%', background: alpha('#000000', mix(0.08, 0.34, shadowIn)), filter: 'blur(70px)', opacity: appear,
      }} />

      {/* hero card */}
      <div style={{ position: 'absolute', inset: 0, perspective: 2600, perspectiveOrigin: `${CX}px ${CY - 200}px` }}>
        <div style={{
          position: 'absolute', left: CX - W / 2, top: CY - H / 2, width: W, height: H, opacity: appear, transformStyle: 'preserve-3d',
          transform: `translateY(${lift.toFixed(2)}px) rotateX(${rotX.toFixed(3)}deg) rotateY(${rotY.toFixed(3)}deg) scale(${scale.toFixed(4)})`,
        }}>
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} style={{ position: 'absolute', inset: 0, borderRadius: R, transform: `translateZ(${(-(i + 1) * 1.2).toFixed(1)}px)`, background: i < 2 ? '#c9b48f' : '#6d5a43' }} />
          ))}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: R, overflow: 'hidden',
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.10), inset 0 1.5px 0 rgba(255,255,255,0.25)',
          }}>
            <Img src={staticFile('img/banhmi.jpg')} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 90% at 15% 0%, rgba(255,240,215,0.10) 0%, rgba(255,240,215,0) 60%), linear-gradient(180deg, rgba(20,10,5,0.22) 0%, rgba(20,10,5,0.3) 100%)' }} />
            {sweepOn && (
              <>
                <div style={{
                  position: 'absolute', top: 0, left: bandX, width: 2 * W, height: H, mixBlendMode: 'screen', pointerEvents: 'none',
                  background: 'linear-gradient(115deg, transparent 36%, rgba(255,240,215,0.06) 43%, rgba(255,240,215,0.22) 47.5%, rgba(255,248,236,0.85) 50%, rgba(255,240,215,0.14) 52.5%, rgba(255,240,215,0.06) 57%, transparent 64%)',
                }} />
                <div style={{
                  position: 'absolute', left: 0, top: 0, right: 0, height: 2,
                  background: `linear-gradient(90deg, transparent ${(topX - 170).toFixed(1)}px, rgba(255,250,240,0.9) ${topX.toFixed(1)}px, transparent ${(topX + 170).toFixed(1)}px)`,
                }} />
              </>
            )}
          </div>
        </div>
      </div>

      {/* headline column */}
      <div style={{ position: 'absolute', left: 90, right: 90, top: 250 }}>
        <div style={{
          fontFamily: SANS, fontSize: 40, fontWeight: 800, color: C.crust, opacity: ramp(frame, 6, 18, EASE.out),
          letterSpacing: `${mix(0.5, 0.24, ramp(frame, 6, 26, EASE.snappy)).toFixed(3)}em`, display: 'flex', alignItems: 'center', gap: 18,
        }}>
          <span style={{ width: 14, height: 14, borderRadius: 7, background: C.sauce, display: 'inline-block' }} />
          {d.eyebrow}
        </div>
        <div style={{ marginTop: 30 }}>
          <TextReveal text={d.title} by="line" variant="rise" start={12} each={24} gap={7}
            style={{ fontFamily: SERIF, fontSize: 150, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.04, color: C.cream }}
            unitStyle={(i) => (i === 1 ? { color: C.crust, fontStyle: 'italic' } : {})} />
        </div>
      </div>
      <div style={{
        position: 'absolute', left: 90, right: 90, top: CY + H / 2 + 120, fontSize: 58, fontWeight: 500, lineHeight: 1.32, color: C.cream2,
        opacity: ramp(frame, 30, 18, EASE.out), transform: `translateY(${mix(14, 0, ramp(frame, 30, 22, EASE.snappy)).toFixed(1)}px)`,
      }}>{d.body}</div>
      <div style={{
        position: 'absolute', left: 90, top: CY + H / 2 + 250, display: 'inline-flex', alignItems: 'center', gap: 16, padding: '22px 36px', borderRadius: 999,
        background: C.cream, color: C.ink, fontSize: 44, fontWeight: 700,
        boxShadow: `0 14px 30px -12px ${alpha('#000000', 0.6)}`, opacity: cta, transform: `translateY(${mix(26, 0, cta).toFixed(1)}px)`,
      }}>
        {d.cta}
      </div>
      <Vignette strength={0.5} inner={0.45} color="#0c0604" />
      <Grain opacity={0.07} blend="soft-light" />
    </AbsoluteFill>
  );
};
