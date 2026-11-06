// Shot 4 · logo-shrink-wordmark-lockup (demos/outro/logo-shrink-wordmark-lockup/LogoShrinkWordmarkLockup.tsx),
// re-skinned warm and stacked vertically for 9:16. A glowing split ring collapses 5.4→1 (inOutCubic) with a +6%
// brake overshoot, heals into a solid ring, cross-fades into the "A8" badge on the brake (lands on beat 34),
// one shockwave, then the badge moves UP to make room, the wordmark letters slide in one by one,
// and the address fades in as the tagline. Long hold to the end.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { useCurrentFrame } from 'remotion';
import { E, lerp, seg } from '../fx/Motion';
import { Grain, Vignette } from '../fx/Polish';
import { BRAND, C, SANS, SERIF } from '../brand';
import { localBeat } from '../timeline';

export const S4_DEFAULTS = {
  line1: BRAND.line1,
  line2: BRAND.line2,
  badge: BRAND.badge,
  addr1: BRAND.addr1,
  addr2: BRAND.addr2,
};

const ICON = 200; // badge size px
const LAND = localBeat('s4_lockup', 34); // ring reaches size on this beat
// frame windows (scaled from the demo's t windows so the collapse lands on LAND)
const K0 = 2, K1 = LAND;
const BR0 = LAND - 2, BR1 = LAND + 10;
const HEAL0 = LAND - 19, HEAL1 = LAND;
const MARK0 = LAND - 4, MARK1 = LAND + 5;
const WAVE0 = LAND, WAVE1 = LAND + 22;
const SHIFT0 = LAND + 12, SHIFT1 = LAND + 30;
const LET0 = LAND + 28, LET1 = LAND + 56; // all letters started by LET1
const TAG0 = LAND + 62, TAG1 = LAND + 78;
const SHIFT = -330; // badge rises to make room for the 2-line wordmark below

const fr = (f: number, a: number, b: number, ease: (x: number) => number = E.linear) => seg(f, a, b, ease);

const scaleAt = (f: number) => {
  const k = fr(f, K0, K1, E.inOutCubic);
  const brake = Math.sin(fr(f, BR0, BR1) * Math.PI) * 0.06;
  return lerp(k, 5.4, 1) * (1 + brake);
};
const spinAt = (f: number) => -150 * fr(f, 0, LAND + 3, E.outCubic);

const arcPath = (cx: number, cy: number, r: number, a0: number, a1: number) => {
  const p = (a: number) => [cx + r * Math.cos((a * Math.PI) / 180), cy + r * Math.sin((a * Math.PI) / 180)];
  const [x0, y0] = p(a0);
  const [x1, y1] = p(a1);
  const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
  return `M${x0.toFixed(2)},${y0.toFixed(2)} A${r},${r} 0 ${large} 1 ${x1.toFixed(2)},${y1.toFixed(2)}`;
};
const Arcs: React.FC<{ col: string; w: number; blur: number; opacity: number }> = ({ col, w, blur, opacity }) => (
  <g opacity={opacity}>
    {[[-32, 122], [148, 302]].map(([b0, b1], i) => (
      <path key={i} d={arcPath(15, 15, 10.5, b0, b1)} fill="none" stroke={col} strokeWidth={w} strokeLinecap="round"
        style={blur ? { filter: `blur(${blur}px)` } : undefined} />
    ))}
  </g>
);

const Badge: React.FC<{ text: string; size: number }> = ({ text, size }) => (
  <div style={{
    width: size, height: size, borderRadius: '50%', background: `radial-gradient(circle at 35% 30%, #f0773d 0%, ${C.sauce} 45%, ${C.sauceDeep} 100%)`,
    boxShadow: `inset 0 0 0 ${size * 0.045}px ${C.cream}, inset 0 0 0 ${size * 0.075}px ${C.sauceDeep}, 0 ${size * 0.08}px ${size * 0.2}px rgba(0,0,0,0.45)`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: SANS, fontWeight: 900, fontSize: size * 0.42, color: C.cream, letterSpacing: '-0.03em',
  }}>{text}</div>
);

export const S4Lockup: React.FC<Partial<typeof S4_DEFAULTS>> = (p) => {
  const d = { ...S4_DEFAULTS, ...p };
  const f = useCurrentFrame();
  const s = scaleAt(f);
  const spin = spinAt(f);
  const shift = fr(f, SHIFT0, SHIFT1, E.inOutCubic) * SHIFT;
  const heal = fr(f, HEAL0, HEAL1, E.inOutQuad);
  const markIn = fr(f, MARK0, MARK1, E.inOutQuad);
  const ds = Math.abs(scaleAt(f) - scaleAt(f - 1));
  const trail = Math.min(1, ds / 0.35);
  const wave = fr(f, WAVE0, WAVE1, E.outCubic);
  const haloR = lerp(fr(f, K0, LAND + 3, E.inOutCubic), 900, 260);
  const haloA = 0.55 - 0.3 * fr(f, LAND + 3, LAND + 30, E.outCubic);

  const icon = (sc: number, rot: number, opacity: number, ghost = false) => (
    <div style={{
      position: 'absolute', left: '50%', top: '50%', width: ICON, height: ICON, margin: `${-ICON / 2}px 0 0 ${-ICON / 2}px`,
      transform: `translateY(${shift}px) scale(${sc})`, opacity,
    }}>
      <svg viewBox="0 0 30 30" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible', transform: `rotate(${rot}deg)` }}>
        <Arcs col="rgba(240,120,50,.65)" w={6.5} blur={0.6} opacity={1 - heal} />
        {!ghost && <Arcs col={heal > 0.5 ? C.cream : '#ffd9b0'} w={3.4} blur={0} opacity={(1 - heal * 0.75) * (1 - markIn)} />}
        {!ghost && <circle cx={15} cy={15} r={10.5} fill="none" stroke={C.cream} strokeWidth={5.5} opacity={heal * (1 - markIn)} />}
      </svg>
      {!ghost && markIn > 0 && <div style={{ position: 'absolute', inset: 0, opacity: markIn }}><Badge text={d.badge} size={ICON} /></div>}
    </div>
  );

  const letters = (text: string, idx0: number, n: number) =>
    [...text].map((ch, i) => {
      const st = LET0 + ((idx0 + i) * (LET1 - LET0)) / n;
      const lk = fr(f, st, st + 13, E.outCubic);
      return (
        <span key={i} style={{
          display: 'inline-block', whiteSpace: 'pre', opacity: lk, transform: `translateY(${lerp(lk, 30, 0)}px)`,
          filter: lk < 0.999 ? `blur(${lerp(lk, 8, 0).toFixed(2)}px)` : undefined,
        }}>{ch}</span>
      );
    });
  const n = d.line1.length + d.line2.length;
  const tag = fr(f, TAG0, TAG1, E.outQuad);
  const tagY = lerp(fr(f, TAG0, TAG1 + 4, E.outCubic), 14, 0);

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, ${C.wood2} 0%, ${C.wood} 50%, ${C.ink} 100%)` }} />
      <div style={{
        position: 'absolute', left: `calc(50% - ${haloR}px)`, top: `calc(50% + ${shift}px - ${haloR}px)`, width: haloR * 2, height: haloR * 2,
        borderRadius: '50%', opacity: haloA,
        background: 'radial-gradient(circle, rgba(240,120,50,0.42) 0%, rgba(240,120,50,0.12) 38%, rgba(240,120,50,0) 70%)',
      }} />
      {wave > 0 && wave < 1 && (
        <div style={{
          position: 'absolute', left: `calc(50% - ${lerp(wave, 110, 480)}px)`, top: `calc(50% - ${lerp(wave, 110, 480)}px)`,
          width: lerp(wave, 220, 960), height: lerp(wave, 220, 960), borderRadius: '50%', boxSizing: 'border-box',
          border: `${lerp(wave, 5, 1.2)}px solid rgba(255,230,200,${(0.6 * (1 - wave)).toFixed(3)})`,
          boxShadow: `0 0 ${lerp(wave, 20, 50)}px rgba(240,120,50,${(0.5 * (1 - wave)).toFixed(3)})`,
        }} />
      )}
      {trail > 0.02 && icon(scaleAt(f - 2), spinAt(f - 2), 0.16 * trail, true)}
      {trail > 0.02 && icon(scaleAt(f - 1), spinAt(f - 1), 0.3 * trail, true)}
      {icon(s, spin, 1)}

      {/* wordmark (2 lines) */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 960 - 130, textAlign: 'center', color: C.cream }}>
        <div style={{ fontFamily: SANS, fontSize: 132, fontWeight: 900, letterSpacing: '-0.025em', lineHeight: 1.05 }}>{letters(d.line1, 0, n)}</div>
        <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 150, fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.05, color: C.crust }}>
          {letters(d.line2, d.line1.length, n)}
        </div>
      </div>

      {/* tagline = address */}
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 1300, textAlign: 'center', opacity: tag, transform: `translateY(${tagY}px)`,
        fontFamily: SANS, color: C.cream,
      }}>
        <div style={{ width: 120, height: 4, borderRadius: 2, background: C.sauce, margin: '0 auto 44px' }} />
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 18, fontSize: 56, fontWeight: 700, letterSpacing: '-0.01em' }}>
          <svg width={44} height={56} viewBox="0 0 24 30" style={{ display: 'block' }}>
            <path d="M12 0C5.4 0 0 5.2 0 11.7 0 20.4 12 30 12 30s12-9.6 12-18.3C24 5.2 18.6 0 12 0z" fill={C.sauce} />
            <circle cx={12} cy={11.5} r={4.6} fill={C.cream} />
          </svg>
          {d.addr1}
        </div>
        <div style={{ fontSize: 46, fontWeight: 500, color: C.cream2, marginTop: 14 }}>{d.addr2}</div>
      </div>
      <Vignette strength={0.55} inner={0.4} color="#000000" />
      <Grain opacity={0.07} blend="soft-light" />
    </AbsoluteFill>
  );
};
