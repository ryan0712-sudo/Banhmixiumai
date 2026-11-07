// 60s 9:16 product ad for the Spider-Man tee. Every shot frames the ONE product photo
// (public/tee/shirt.jpg); the print is never redrawn, recoloured or distorted.
import React from 'react';
import { AbsoluteFill, Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame, Easing } from 'remotion';
import { useFonts } from '../fonts';

export const TEE_FPS = 30;
export const TEE_TOTAL = 60 * TEE_FPS; // exactly 60s

const SANS = '"Be Vietnam Pro", "DejaVu Sans", sans-serif';
const RED = '#e3262f';
const BLUE = '#1f4fa8';
const INK = '#0b0f1c';
const CREAM = '#f6f1e4';

// Scene table (frames). Each scene after the first starts XF frames early and fades in over them.
const XF = 12;
const SCENES = {
  intro: [0, 240], // 0–8s
  fabric: [240, 540], // 8–18s
  print: [540, 900], // 18–30s
  style: [900, 1260], // 30–42s
  points: [1260, 1560], // 42–52s
  cta: [1560, 1800], // 52–60s
} as const;

// ---------- helpers ----------
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const ease = Easing.bezier(0.22, 1, 0.36, 1);
const inOut = Easing.bezier(0.65, 0, 0.35, 1);
const ramp = (f: number, a: number, d: number, e = ease) => interpolate(f, [a, a + d], [0, 1], { ...clamp, easing: e });

// Photo camera in source units (photo = 720×716 units; file is 3× that).
type Cam = { x: number; y: number; s: number; r?: number };
const PW = 720;
const PH = 716;
const mixCam = (a: Cam, b: Cam, t: number): Cam => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
  s: a.s + (b.s - a.s) * t,
  r: (a.r ?? 0) + ((b.r ?? 0) - (a.r ?? 0)) * t,
});
// Keep a full-screen framing inside the photo so no empty edge shows.
const cover = (c: Cam): Cam => {
  const s = Math.max(c.s, 1920 / PH);
  const cl = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
  return { ...c, s, x: cl(c.x, 540 / s, PW - 540 / s), y: cl(c.y, 960 / s, PH - 960 / s) };
};

// Piecewise camera path: keys = [frame, cam]; eased between keys.
const path = (f: number, keys: [number, Cam][]): Cam => {
  if (f <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [f0, c0] = keys[i];
    const [f1, c1] = keys[i + 1];
    if (f <= f1) return mixCam(c0, c1, inOut((f - f0) / (f1 - f0)));
  }
  return keys[keys.length - 1][1];
};

const Shirt: React.FC<{ cam: Cam; cx?: number; cy?: number; style?: React.CSSProperties }> = ({ cam, cx = 540, cy = 960, style }) => (
  <Img
    src={staticFile('tee/shirt.jpg')}
    style={{
      position: 'absolute',
      width: PW * cam.s,
      height: PH * cam.s,
      left: cx - cam.x * cam.s,
      top: cy - cam.y * cam.s,
      maxWidth: 'none',
      transformOrigin: `${cam.x * cam.s}px ${cam.y * cam.s}px`,
      transform: `rotate(${cam.r ?? 0}deg)`,
      ...style,
    }}
  />
);

// Blurred, darkened copy of the photo — fills the frame behind any framing that doesn't cover it.
const BlurBg: React.FC<{ dark?: number }> = ({ dark = 0.55 }) => (
  <AbsoluteFill>
    <Shirt cam={{ x: 360, y: 358, s: 3.2 }} style={{ filter: 'blur(48px) saturate(1.2)' }} />
    <AbsoluteFill style={{ background: `rgba(8,10,20,${dark})` }} />
  </AbsoluteFill>
);

const Vignette: React.FC<{ a?: number }> = ({ a = 0.55 }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse 75% 60% at 50% 50%, transparent 55%, rgba(0,0,0,${a}) 100%)`, pointerEvents: 'none' }} />
);

// Soft studio light band sweeping across the frame.
const LightSweep: React.FC<{ p: number; strength?: number }> = ({ p, strength = 0.35 }) => (
  <AbsoluteFill style={{ mixBlendMode: 'screen', pointerEvents: 'none' }}>
    <div
      style={{
        position: 'absolute',
        top: -400,
        bottom: -400,
        width: 420,
        left: interpolate(p, [0, 1], [-700, 1300]),
        transform: 'rotate(18deg)',
        background: `linear-gradient(90deg, transparent, rgba(255,255,255,${strength}), transparent)`,
        filter: 'blur(30px)',
      }}
    />
  </AbsoluteFill>
);

const Pill: React.FC<{ children: React.ReactNode; bg?: string; color?: string; size?: number; style?: React.CSSProperties }> = ({
  children,
  bg = RED,
  color = '#fff',
  size = 30,
  style,
}) => (
  <div
    style={{
      display: 'inline-block',
      padding: `${size * 0.38}px ${size * 0.9}px`,
      borderRadius: 999,
      background: bg,
      color,
      fontFamily: SANS,
      fontWeight: 800,
      fontSize: size,
      letterSpacing: size * 0.08,
      textTransform: 'uppercase',
      ...style,
    }}
  >
    {children}
  </div>
);

// Keep the product name on one line.
const nowrapName = (t: string) =>
  t.split('Spider-Man').flatMap((part, i) => (i === 0 ? [part] : [<span key={i} style={{ whiteSpace: 'nowrap' }}>Spider-Man</span>, part]));

// Caption that rises in and fades out within [a, b].
const Caption: React.FC<{ f: number; a: number; b: number; label?: string; text: string; y?: number }> = ({ f, a, b, label, text, y = 1460 }) => {
  const inn = ramp(f, a, 18);
  const out = 1 - ramp(f, b - 12, 12, inOut);
  const o = inn * out;
  if (o <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: 70, right: 70, top: y, opacity: o, transform: `translateY(${(1 - inn) * 40}px)` }}>
      {label && <Pill size={26} style={{ marginBottom: 22 }}>{label}</Pill>}
      <div
        style={{
          fontFamily: SANS,
          fontWeight: 800,
          fontSize: 68,
          lineHeight: 1.15,
          whiteSpace: 'pre-line',
          color: '#fff',
          textShadow: '0 4px 30px rgba(0,0,0,0.6)',
        }}
      >
        {nowrapName(text)}
      </div>
    </div>
  );
};

const Fade: React.FC<{ len: number; children: React.ReactNode; first?: boolean }> = ({ len, children, first }) => {
  const f = useCurrentFrame();
  const o = first ? 1 : interpolate(f, [0, XF], [0, 1], clamp);
  const s = first ? 1 : interpolate(f, [0, XF], [1.04, 1], { ...clamp, easing: ease });
  void len;
  return <AbsoluteFill style={{ opacity: o, transform: `scale(${s})` }}>{children}</AbsoluteFill>;
};

// ---------- scene 1: intro (0–8s) ----------
const Intro: React.FC = () => {
  const f = useCurrentFrame();
  const cam = path(f, [
    [0, { x: 360, y: 400, s: 1.42 }],
    [240, { x: 380, y: 400, s: 1.95 }],
  ]);
  const lift = ramp(f, 0, 30);
  const t1 = ramp(f, 28, 22);
  const t2 = ramp(f, 40, 24);
  const t3 = ramp(f, 70, 22);
  return (
    <AbsoluteFill style={{ background: INK }}>
      <BlurBg dark={0.6} />
      <AbsoluteFill style={{ opacity: lift }}>
        <Shirt cam={cam} cy={1180} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(8,10,20,0.95) 0%, rgba(8,10,20,0.8) 24%, transparent 42%, transparent 78%, rgba(8,10,20,0.7) 100%)' }} />
      <LightSweep p={interpolate(f, [60, 200], [0, 1], clamp)} />
      <div style={{ position: 'absolute', top: 150, left: 0, right: 0, textAlign: 'center' }}>
        <div style={{ opacity: t1, transform: `translateY(${(1 - t1) * 20}px)` }}>
          <Pill bg="rgba(255,255,255,0.14)" size={26}>Bộ sưu tập mới</Pill>
        </div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 64, color: CREAM, marginTop: 26, opacity: t2, letterSpacing: 6 }}>ÁO THUN</div>
        <div
          style={{
            fontFamily: SANS,
            fontWeight: 900,
            fontSize: 132,
            lineHeight: 1,
            color: RED,
            opacity: t2,
            transform: `scale(${0.9 + 0.1 * t2})`,
            textShadow: '0 6px 40px rgba(227,38,47,0.45)',
          }}
        >
          SPIDER-MAN
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 150, left: 0, right: 0, textAlign: 'center', opacity: t3 * (1 - ramp(f, 222, 18)) }}>
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 40, color: '#fff', letterSpacing: 2 }}>Trắng kem · Cổ tròn · Hình in nổi bật</div>
      </div>
      <Vignette a={0.4} />
    </AbsoluteFill>
  );
};

// ---------- scene 2: fabric macro (8–18s) ----------
const Fabric: React.FC = () => {
  const f = useCurrentFrame();
  // three macro framings, each ~100f, cross-dissolved
  const shots: { a: number; b: number; from: Cam; to: Cam }[] = [
    { a: 0, b: 112, from: { x: 330, y: 170, s: 2.9 }, to: { x: 355, y: 180, s: 3.3 } }, // collar & neck seam
    { a: 100, b: 212, from: { x: 110, y: 450, s: 3.0 }, to: { x: 120, y: 420, s: 3.4 } }, // sleeve hem & stitching
    { a: 200, b: 312, from: { x: 260, y: 640, s: 2.7 }, to: { x: 260, y: 590, s: 3.1 } }, // hand lifting the fabric
  ];
  return (
    <AbsoluteFill style={{ background: INK }}>
      {shots.map((s, i) => {
        const o = interpolate(f, [s.a, s.a + 12, s.b - 12, s.b], [i === 0 ? 1 : 0, 1, 1, i === 2 ? 1 : 0], clamp);
        if (o <= 0) return null;
        const cam = cover(mixCam(s.from, s.to, interpolate(f, [s.a, s.b], [0, 1], { ...clamp, easing: inOut })));
        return (
          <AbsoluteFill key={i} style={{ opacity: o }}>
            <Shirt cam={cam} />
          </AbsoluteFill>
        );
      })}
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, transparent 55%, rgba(8,10,20,0.85) 100%)' }} />
      <LightSweep p={interpolate(f % 100, [0, 100], [0, 1])} strength={0.18} />
      <Caption f={f} a={8} b={108} label="Chất liệu" text="Vải mềm mại, bề mặt mịn" />
      <Caption f={f} a={108} b={208} label="Chất liệu" text="Thoáng mát cả ngày" />
      <Caption f={f} a={208} b={300} label="Chất liệu" text="Đường may tỉ mỉ" />
      <Vignette />
    </AbsoluteFill>
  );
};

// ---------- scene 3: the print (18–30s) ----------
const Print: React.FC = () => {
  const f = useCurrentFrame();
  const cam = path(f, [
    [0, { x: 450, y: 560, s: 3.0 }], // SPIDER-MAN logo
    [40, { x: 450, y: 560, s: 3.2 }],
    [90, { x: 400, y: 450, s: 3.3 }], // centre Spider-Man
    [130, { x: 310, y: 370, s: 3.4 }], // left Spider-Man
    [175, { x: 460, y: 300, s: 3.4 }], // top Spider-Man
    [205, { x: 400, y: 420, s: 2.5 }], // whole print
    [235, { x: 175, y: 400, s: 3.2 }], // left sleeve spider
    [290, { x: 175, y: 400, s: 3.4 }],
    [318, { x: 560, y: 260, s: 3.2 }], // right sleeve spider
    [372, { x: 560, y: 260, s: 3.4 }],
  ]);
  const colors = ramp(f, 112, 16);
  return (
    <AbsoluteFill style={{ background: INK }}>
      <BlurBg />
      <Shirt cam={cam} cy={900} />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, transparent 58%, rgba(8,10,20,0.88) 100%)' }} />
      <LightSweep p={interpolate(f, [20, 110], [0, 1], clamp)} strength={0.28} />
      <LightSweep p={interpolate(f, [240, 330], [0, 1], clamp)} strength={0.22} />
      <Caption f={f} a={6} b={110} label="Hình in" text="Logo SPIDER-MAN sắc nét" />
      <Caption f={f} a={110} b={218} label="Hình in" text="Ba phiên bản Spider-Man" />
      {/* red / blue / black swatches, sampled from the print */}
      <div style={{ position: 'absolute', left: 70, top: 1690, display: 'flex', gap: 18, opacity: colors * (1 - ramp(f, 206, 12)) }}>
        {[
          ['#d8232a', 'Đỏ'],
          ['#2a4f9e', 'Xanh'],
          ['#1b1b1f', 'Đen'],
        ].map(([c, n], i) => (
          <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 12, transform: `scale(${ramp(f, 112 + i * 6, 14)})` }}>
            <div style={{ width: 40, height: 40, borderRadius: 20, background: c, border: '3px solid #fff' }} />
            <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 36, color: '#fff' }}>{n}</span>
          </div>
        ))}
      </div>
      <Caption f={f} a={218} b={360} label="Tay áo" text={"Họa tiết nhện\nhai bên tay áo"} />
      <Vignette />
    </AbsoluteFill>
  );
};

// ---------- scene 4: styling with jeans (30–42s) ----------
// No model photo exists, so this scene shows the shirt + jeans styling from several "angles" on the beat.
const Style: React.FC = () => {
  const f = useCurrentFrame();
  const angles: Cam[] = [
    { x: 470, y: 400, s: 2.1, r: -2 },
    { x: 560, y: 450, s: 2.8, r: 2 },
    { x: 360, y: 380, s: 2.4, r: 0 },
    { x: 600, y: 520, s: 3.0, r: -1.5 },
    { x: 420, y: 420, s: 2.0, r: 1 },
    { x: 470, y: 400, s: 2.3, r: 0 },
  ];
  const step = 60;
  const i = Math.min(angles.length - 1, Math.floor(f / step));
  const local = f - i * step;
  const base = angles[i];
  const punch = interpolate(local, [0, 8], [1.08, 1], { ...clamp, easing: ease });
  const drift = interpolate(local, [0, step], [0, 1]);
  const cam: Cam = { ...base, s: base.s * punch * (1 + 0.04 * drift), x: base.x + 10 * drift };
  const flash = interpolate(local, [0, 6], [i === 0 ? 0 : 0.5, 0], clamp);
  const tags = ['Đi học', 'Đi chơi', 'Dạo phố'];
  return (
    <AbsoluteFill style={{ background: INK }}>
      <BlurBg dark={0.45} />
      <Shirt cam={cam} cy={1000} />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(8,10,20,0.92) 0%, rgba(8,10,20,0.6) 18%, transparent 32%, transparent 70%, rgba(8,10,20,0.8) 100%)' }} />
      <AbsoluteFill style={{ background: '#fff', opacity: flash }} />
      <div style={{ position: 'absolute', top: 150, left: 70, right: 70 }}>
        <div style={{ opacity: ramp(f, 6, 18), fontFamily: SANS, fontWeight: 700, fontSize: 40, color: CREAM, letterSpacing: 4 }}>PHỐI CÙNG</div>
        <div
          style={{
            opacity: ramp(f, 12, 18),
            transform: `translateX(${(1 - ramp(f, 12, 18)) * -60}px)`,
            fontFamily: SANS,
            fontWeight: 900,
            fontSize: 120,
            lineHeight: 1,
            color: '#fff',
          }}
        >
          QUẦN <span style={{ color: '#6f9be8' }}>JEANS</span>
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 180, left: 70, right: 70, display: 'flex', gap: 18, flexWrap: 'wrap' }}>
        {tags.map((t, k) => {
          const p = ramp(f, 90 + k * 50, 16);
          return (
            <div key={t} style={{ opacity: p, transform: `translateY(${(1 - p) * 30}px)` }}>
              <Pill bg={k === 1 ? BLUE : RED} size={34}>{t}</Pill>
            </div>
          );
        })}
      </div>
      <div style={{ position: 'absolute', bottom: 110, left: 70, opacity: ramp(f, 250, 20), fontFamily: SANS, fontWeight: 600, fontSize: 38, color: '#fff' }}>
        Trẻ trung · Năng động · Cá tính
      </div>
      <Vignette />
    </AbsoluteFill>
  );
};

// ---------- scene 5: highlights on white (42–52s) ----------
const Points: React.FC = () => {
  const f = useCurrentFrame();
  const orbit = Math.sin((f / 300) * Math.PI * 2) * 9; // gentle turn
  const rise = ramp(f, 0, 28);
  const items = ['Thiết kế Spider-Man độc đáo', 'Hình in nổi bật', 'Phong cách trẻ trung', 'Dễ phối đồ'];
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 30%, #ffffff 0%, ${CREAM} 70%)` }}>
      <div style={{ position: 'absolute', top: 120, left: 0, right: 0, display: 'flex', justifyContent: 'center', perspective: 1600 }}>
        <div
          style={{
            width: 860,
            height: 855,
            borderRadius: 44,
            overflow: 'hidden',
            position: 'relative',
            boxShadow: '0 40px 90px rgba(20,24,40,0.28), 0 8px 20px rgba(20,24,40,0.12)',
            transform: `translateY(${(1 - rise) * 80}px) rotateY(${orbit}deg) scale(${1 + 0.03 * (f / 300)})`,
            opacity: rise,
          }}
        >
          <Shirt cam={{ x: 360, y: 358, s: 860 / PW }} cx={430} cy={427.5} />
          <LightSweep p={interpolate(f, [30, 150], [0, 1], clamp)} strength={0.3} />
        </div>
      </div>
      <div style={{ position: 'absolute', top: 1040, left: 90, right: 90 }}>
        {items.map((t, k) => {
          const p = ramp(f, 30 + k * 52, 18);
          return (
            <div
              key={t}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 26,
                marginBottom: 34,
                opacity: p,
                transform: `translateX(${(1 - p) * -50}px)`,
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  flex: '0 0 64px',
                  borderRadius: 32,
                  background: k % 2 ? BLUE : RED,
                  color: '#fff',
                  fontFamily: SANS,
                  fontWeight: 900,
                  fontSize: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ✓
              </div>
              <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 48, color: INK }}>{nowrapName(t)}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------- scene 6: CTA (52–60s) ----------
const Cta: React.FC = () => {
  const f = useCurrentFrame();
  const zoom = interpolate(f, [0, 240], [1, 1.08], { ...clamp, easing: inOut });
  const h1 = ramp(f, 10, 20);
  const h2 = ramp(f, 22, 20);
  const cta = ramp(f, 96, 16, Easing.bezier(0.34, 1.56, 0.64, 1));
  const pulse = 1 + 0.035 * Math.max(0, Math.sin(((f - 112) / 30) * Math.PI * 2)) * (f > 112 ? 1 : 0);
  const end = 1 - ramp(f, 228, 12, inOut);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, #1d2a55 0%, ${INK} 70%)` }}>
      <div style={{ position: 'absolute', top: 520, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
        <div
          style={{
            width: 860,
            height: 855,
            borderRadius: 44,
            overflow: 'hidden',
            position: 'relative',
            transform: `scale(${zoom})`,
            boxShadow: '0 0 120px rgba(227,38,47,0.35), 0 40px 80px rgba(0,0,0,0.5)',
          }}
        >
          <Shirt cam={{ x: 380, y: 400, s: 1.4 }} cx={430} cy={427.5} />
        </div>
      </div>
      <div style={{ position: 'absolute', top: 120, left: 40, right: 40, textAlign: 'center' }}>
        <div style={{ opacity: h1, transform: `translateY(${(1 - h1) * 30}px)`, fontFamily: SANS, fontWeight: 900, fontSize: 84, lineHeight: 1.05, whiteSpace: 'nowrap', color: '#fff' }}>
          THỂ HIỆN CHẤT RIÊNG
        </div>
        <div style={{ opacity: h2, transform: `translateY(${(1 - h2) * 30}px)`, fontFamily: SANS, fontWeight: 800, fontSize: 62, lineHeight: 1.2, color: RED, marginTop: 14, whiteSpace: 'nowrap' }}>
          PHONG CÁCH SPIDER-MAN
        </div>
      </div>
      <div style={{ position: 'absolute', top: 1500, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${cta * pulse})`, opacity: cta }}>
          <div
            style={{
              padding: '34px 64px',
              borderRadius: 999,
              background: `linear-gradient(180deg, #ff3b44, ${RED})`,
              color: '#fff',
              fontFamily: SANS,
              fontWeight: 900,
              fontSize: 64,
              boxShadow: '0 20px 60px rgba(227,38,47,0.55)',
              whiteSpace: 'nowrap',
            }}
          >
            ĐẶT HÀNG NGAY HÔM NAY!
          </div>
        </div>
      </div>
      <AbsoluteFill style={{ background: '#000', opacity: 1 - end }} />
    </AbsoluteFill>
  );
};

// ---------- audio ----------
// Voice-over lines start ~0.5s into each scene (public/tee/vo/script.txt).
const VO: [number, number][] = [
  [SCENES.intro[0] + 30, 1],
  [SCENES.fabric[0] + 12, 2],
  [SCENES.print[0] + 12, 3],
  [SCENES.style[0] + 15, 4],
  [SCENES.points[0] + 30, 5],
  [SCENES.cta[0] + 20, 6],
];
const VO_LEN = [69, 129, 159, 100, 116, 91]; // frames, from ffprobe of vo1..vo6
const voActive = (f: number) => VO.some(([s], i) => f >= s - 6 && f <= s + VO_LEN[i] + 6);

const SFX: [number, string, number][] = [
  [SCENES.fabric[0] - 14, 'audio/sfx/whoosh-soft.wav', 0.8],
  [SCENES.print[0] - 14, 'audio/sfx/whoosh.wav', 0.6],
  [SCENES.style[0] - 14, 'audio/sfx/whoosh.wav', 0.7],
  [SCENES.points[0] - 14, 'audio/sfx/whoosh-soft.wav', 0.8],
  [SCENES.points[0] + 40, 'audio/sfx/shimmer.wav', 0.35],
  [SCENES.cta[0] - 14, 'audio/sfx/whoosh.wav', 0.6],
  [SCENES.cta[0] + 96, 'audio/sfx/impact.wav', 0.55],
];

export const SpiderTee: React.FC<{ voice?: boolean }> = ({ voice = true }) => {
  useFonts();
  const list = [
    ['intro', Intro],
    ['fabric', Fabric],
    ['print', Print],
    ['style', Style],
    ['points', Points],
    ['cta', Cta],
  ] as const;
  return (
    <AbsoluteFill style={{ background: INK }}>
      {list.map(([k, Comp], i) => {
        const [a, b] = SCENES[k];
        const from = i === 0 ? a : a - XF;
        return (
          <Sequence key={k} from={from} durationInFrames={b - from} name={k}>
            <Fade len={b - from} first={i === 0}>
              <Comp />
            </Fade>
          </Sequence>
        );
      })}
      <Audio
        src={staticFile('audio/bgm.mp3')}
        volume={(f) =>
          (voice && voActive(f) ? 0.22 : 0.5) *
          interpolate(f, [0, 10, TEE_TOTAL - 60, TEE_TOTAL - 1], [0, 1, 1, 0], clamp)
        }
      />
      {voice &&
        VO.map(([s, n]) => (
          <Sequence key={`vo${n}`} from={s} durationInFrames={VO_LEN[n - 1] + 10} name={`vo${n}`}>
            <Audio src={staticFile(`tee/vo/vo${n}.wav`)} volume={1} />
          </Sequence>
        ))}
      {SFX.map(([s, src, v], i) => (
        <Sequence key={`sfx${i}`} from={s} durationInFrames={50} name={`sfx${i}`}>
          <Audio src={staticFile(src)} volume={v} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
