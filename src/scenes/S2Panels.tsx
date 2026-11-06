// Shot 2 · comic-panel-split (demos/rhythm/panel-grid-moves/ComicPanelSplit.tsx, adapted to 9:16).
// Same subject (the bowl), three camera positions: ① whole bowl ② xíu mại close ③ yolk macro.
// Three 12° slanted seams cut on beats 12 / 12.5 / 13, panels hard-cut in (5f 1.07→1 + flash), comic caption boxes
// stamp in 7f later, panels stay alive with slow pushes, then panel ③ eats the screen (2f pull-back + 14f sweep)
// on beat 16 and becomes the poster with the headline.
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { EASE, Grain, SpeedBlur, Vignette, mix, ramp, velocity } from '../fx/Polish';
import { TextReveal, alpha } from '../fx/Look';
import { C, SANS, SERIF } from '../brand';
import { CAM_FULL, Photo, mixCam, type Cam } from '../Photo';
import { localBeat } from '../timeline';

export const S2_DEFAULTS = {
  cap1: ['01 · Cả tô', 'Đầy đặn'],
  cap2: ['02 · Xíu mại', 'Mềm, mọng nước'],
  cap3: ['03 · Trứng', 'Lòng đào'],
  title: 'Xíu mại\nmềm thơm.',
  sub: 'Thêm chả lụa, đậu hũ,\nrau thơm.',
};

const W = 1080, H = 1920;
// —— beat-anchored time (local frames) ——
const SPLIT = localBeat('s2_panels', 12);
const CUTS = [SPLIT, localBeat('s2_panels', 12.5), localBeat('s2_panels', 13)];
const POP = 5;
const CAP = 7;
const HOLD0 = CUTS[2] + POP + 2;
const EXP0 = localBeat('s2_panels', 16) - 2; // 2f pull-back, sweep starts on beat 16
const EXP_DUR = 16;
const EXP1 = EXP0 + EXP_DUR;
const TITLE = EXP1 + 2;

// —— seam geometry: horizontal-ish seams rising 12° to the right (tan12°·1080 ≈ 230) ——
const SLANT = 230;
const Y1 = 760; // seam 1 left-end y
const Y2 = 1400; // seam 2 left-end y
const HALF = 9;

// —— cameras (source px) ——
const CAM1: Cam = { fx: 575, fy: 830, cx: 540, cy: 330, s: 0.98 }; // ① whole bowl
const CAM2: Cam = { fx: 520, fy: 690, cx: 560, cy: 960, s: 2.2 }; // ② xíu mại close
const CAM3: Cam = { fx: 470, fy: 965, cx: 540, cy: 1640, s: 2.9 }; // ③ yolk macro
const CAM_END: Cam = { fx: 760, fy: 860, cx: 540, cy: 1300, s: 2.2 }; // poster: chả lụa + đậu hũ + herbs (new information)

const expandAt = (f: number) => {
  if (f < EXP0) return 0;
  const pre = ramp(f, EXP0, 2, EASE.out);
  const go = ramp(f, EXP0 + 2, EXP_DUR - 2, EASE.snappy);
  return -0.03 * pre * (1 - go) + go;
};
const edgeAt = (f: number) => mix(Y2 + 5, -SLANT - 60, expandAt(f)); // panel ③ top edge (left end) y
const cam3At = (f: number): Cam => {
  const e = Math.max(0, expandAt(f));
  const hold = ramp(f, HOLD0, EXP0 - HOLD0, EASE.smooth);
  const c = mixCam({ ...CAM3, s: CAM3.s * (1 + 0.04 * hold) }, CAM_END, e);
  return { ...c, s: c.s * (1 + 0.015 * ramp(f, EXP1, 60, EASE.smooth)) };
};
const cam3Y = (f: number) => cam3At(f).cy;

const PanelBg: React.FC = () => <div style={{ position: 'absolute', inset: 0, background: C.ink }} />;

const Caption: React.FC<{ f: number; at: number; x: number; y: number; kicker: string; text: string; tilt: number; anchor?: 'left' | 'right' }> = ({
  f, at, x, y, kicker, text, tilt, anchor = 'left',
}) => {
  if (f < at) return null;
  const p = ramp(f, at, 9, EASE.overshoot);
  return (
    <div style={{
      position: 'absolute', top: y, [anchor]: x, transform: `rotate(${tilt}deg) scale(${mix(1.25, 1, p).toFixed(3)})`,
      transformOrigin: anchor === 'left' ? '0% 0%' : '100% 0%', opacity: Math.min(1, ramp(f, at, 3, EASE.linear)),
      background: C.cream, border: `5px solid ${C.ink}`, boxShadow: `9px 9px 0 ${C.ink}`, padding: '16px 26px 18px',
    }}>
      <div style={{ fontFamily: SANS, fontSize: 32, fontWeight: 800, color: C.sauceDeep, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{kicker}</div>
      <div style={{ fontFamily: SANS, fontSize: 64, fontWeight: 850 as never, color: C.ink, marginTop: 4, whiteSpace: 'nowrap', letterSpacing: '-0.02em' }}>{text}</div>
    </div>
  );
};

const SpeedLines: React.FC<{ f: number; at: number; cx: number; cy: number }> = ({ f, at, cx, cy }) => {
  const t = (f - at) / 12;
  if (t < 0 || t > 1) return null;
  return (
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0, opacity: 1 - EASE.out(t) }}>
      {Array.from({ length: 40 }, (_, i) => {
        const h = Math.sin(i * 91.7) * 43758.5;
        const r = h - Math.floor(h);
        const a = (i / 40) * Math.PI * 2 + r * 0.1;
        const r0 = 420 + r * 160 + t * 120;
        return <line key={i} x1={cx + Math.cos(a) * r0} y1={cy + Math.sin(a) * r0} x2={cx + Math.cos(a) * 1600} y2={cy + Math.sin(a) * 1600}
          stroke={i % 3 ? C.cream : C.sauce} strokeWidth={2 + r * 4} strokeOpacity={0.5} />;
      })}
    </svg>
  );
};

const Headline: React.FC<{ f: number; title: string; sub: string }> = ({ f, title, sub }) => (
  <div style={{ position: 'absolute', left: 90, right: 90, top: 210, color: C.cream }}>
    <div style={{ fontFamily: SERIF, fontSize: 160, fontWeight: 800, lineHeight: 1.12, letterSpacing: '-0.02em' }}>
      <TextReveal text={title} by="line" variant="rise" start={TITLE} each={16} gap={5}
        unitStyle={(i) => (i === 1 ? { color: C.crust, fontStyle: 'italic' } : {})} />
    </div>
    <div style={{ fontFamily: SANS, fontSize: 58, fontWeight: 600, color: C.cream, marginTop: 40, lineHeight: 1.3, textShadow: '0 2px 18px rgba(0,0,0,0.6)' }}>
      <TextReveal text={sub} by="line" variant="blur" start={TITLE + 8} each={14} style={{ whiteSpace: 'normal' }} />
    </div>
  </div>
);

export const S2Panels: React.FC<Partial<typeof S2_DEFAULTS>> = (p) => {
  const d = { ...S2_DEFAULTS, ...p };
  const f = useCurrentFrame();

  // poster
  if (f >= EXP1) {
    return (
      <AbsoluteFill style={{ background: C.ink, overflow: 'hidden' }}>
        <Photo cam={cam3At(f)} />
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, ${alpha(C.ink, 0.92)} 0%, ${alpha(C.ink, 0.75)} 34%, ${alpha(C.ink, 0)} 58%)` }} />
        <Headline f={f} title={d.title} sub={d.sub} />
        <Vignette strength={0.45} inner={0.5} color="#0c0604" />
        <Grain opacity={0.06} blend="soft-light" />
      </AbsoluteFill>
    );
  }

  // full-frame open (continues shot 1's takeover framing)
  if (f < SPLIT) {
    const push = ramp(f, 0, SPLIT, EASE.linear);
    return (
      <AbsoluteFill style={{ background: C.ink, overflow: 'hidden' }}>
        <Photo cam={{ ...CAM_FULL, s: CAM_FULL.s * (1.005 + 0.03 * push) }} />
        <Vignette strength={0.35 * ramp(f, 0, 20, EASE.smooth)} inner={0.5} color="#0c0604" />
      </AbsoluteFill>
    );
  }

  const hold = ramp(f, HOLD0, EXP0 - HOLD0, EASE.smooth);
  const e = edgeAt(f);
  const seamV = velocity(edgeAt, f);
  const contentV = velocity(cam3Y, f);

  const panels = [
    { clip: `polygon(0px 0px, ${W}px 0px, ${W}px ${Y1 - SLANT - HALF}px, 0px ${Y1 - HALF}px)`, oy: 330,
      shot: <Photo cam={{ ...CAM1, s: CAM1.s * (1 + 0.035 * hold) }} /> },
    { clip: `polygon(0px ${Y1 + HALF}px, ${W}px ${Y1 - SLANT + HALF}px, ${W}px ${Y2 - SLANT - HALF}px, 0px ${Y2 - HALF}px)`, oy: 960,
      shot: <Photo cam={{ ...CAM2, fx: CAM2.fx - 18 * hold, s: CAM2.s * (1 + 0.03 * hold) }} /> },
    { clip: `polygon(0px ${e + HALF}px, ${W}px ${e - SLANT + HALF}px, ${W}px ${H}px, 0px ${H}px)`, oy: 1640,
      shot: <Photo cam={cam3At(f)} /> },
  ];

  const seam = (y: number, at: number, key: string) => {
    const dd = ramp(f, at - 1, 3, EASE.out);
    if (dd <= 0) return null;
    const x2 = -20 + (W + 40) * dd;
    const y2 = y - SLANT * ((x2 + 20) / W);
    return (
      <g key={key}>
        <line x1={-20} y1={y + 4} x2={x2} y2={y2 + 4} stroke="rgba(0,0,0,0.55)" strokeWidth={34} filter="url(#seamSoft)" />
        <line x1={-20} y1={y} x2={x2} y2={y2} stroke={C.ink} strokeWidth={2 * HALF + 2} />
        <line x1={-20} y1={y} x2={x2} y2={y2} stroke={C.cream} strokeWidth={2 * HALF - 7} />
      </g>
    );
  };
  const capOut = 1 - ramp(f, EXP0 + 1, 6, EASE.exit);

  return (
    <AbsoluteFill style={{ background: C.ink, overflow: 'hidden' }}>
      {f < CUTS[2] + 2 && (
        <div style={{ position: 'absolute', inset: 0 }}>
          <Photo cam={{ ...CAM_FULL, s: CAM_FULL.s * 1.035 }} />
          <div style={{ position: 'absolute', inset: 0, background: C.ink, opacity: 0.72 }} />
        </div>
      )}
      {panels.map((pp, i) => {
        if (f < CUTS[i]) return null;
        const pop = ramp(f, CUTS[i], POP, EASE.snappy);
        const flash = 1 - ramp(f, CUTS[i], 4, EASE.out);
        return (
          <div key={i} style={{
            position: 'absolute', inset: 0, overflow: 'hidden', clipPath: pp.clip, zIndex: i === 2 ? 3 : 1,
            transform: `scale(${mix(1.07, 1, pop).toFixed(4)})`, transformOrigin: `540px ${pp.oy}px`,
          }}>
            <PanelBg />
            {i === 2 ? <SpeedBlur vx={0} vy={contentV} amount={0.14} max={20}>{pp.shot}</SpeedBlur> : pp.shot}
            {i === 2 && <SpeedLines f={f} at={CUTS[2]} cx={540} cy={CAM3.cy} />}
            {flash > 0.01 && <div style={{ position: 'absolute', inset: 0, background: C.cream, opacity: 0.55 * flash }} />}
            {i === 0 && <Caption f={f} at={CUTS[0] + CAP} x={70} y={80} kicker={d.cap1[0]} text={d.cap1[1]} tilt={-2} />}
            {i === 1 && <Caption f={f} at={CUTS[1] + CAP} x={70} y={1060} kicker={d.cap2[0]} text={d.cap2[1]} tilt={1.5} />}
            {i === 2 && <div style={{ position: 'absolute', inset: 0, opacity: capOut }}>
              <Caption f={f} at={CUTS[2] + CAP} x={70} y={1450} kicker={d.cap3[0]} text={d.cap3[1]} tilt={-1.5} />
            </div>}
          </div>
        );
      })}
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0, zIndex: 5, pointerEvents: 'none' }}>
        <defs><filter id="seamSoft" x="-10%" y="-50%" width="120%" height="200%"><feGaussianBlur stdDeviation="8" /></filter></defs>
        {e > Y1 + HALF && seam(Y1, CUTS[1], 's1')}
      </svg>
      <div style={{ position: 'absolute', inset: 0, zIndex: 5, pointerEvents: 'none' }}>
        <SpeedBlur vx={0} vy={seamV} amount={0.1} max={18}>
          <svg width={W} height={H} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
            <defs><filter id="seamSoft2" x="-10%" y="-50%" width="120%" height="200%"><feGaussianBlur stdDeviation="8" /></filter></defs>
            {f < EXP0 ? seam(Y2, CUTS[2], 's2') : seam(e, CUTS[2], 's2')}
          </svg>
        </SpeedBlur>
      </div>
      {/* poster gradient fades in during the eat-screen sweep so the poster branch has no exposure pop */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 6, pointerEvents: 'none', opacity: Math.max(0, expandAt(f)), background: `linear-gradient(180deg, ${alpha(C.ink, 0.92)} 0%, ${alpha(C.ink, 0.75)} 34%, ${alpha(C.ink, 0)} 58%)` }} />
      <Vignette strength={0.45} inner={0.5} color="#0c0604" style={{ zIndex: 7 }} />
      <Grain opacity={0.06} blend="soft-light" style={{ zIndex: 8 }} />
    </AbsoluteFill>
  );
};
