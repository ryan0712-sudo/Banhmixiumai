import React from 'react';
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile } from 'remotion';
import { S1Mask } from './scenes/S1Mask';
import { S2Panels } from './scenes/S2Panels';
import { S3Sheen } from './scenes/S3Sheen';
import { S4Lockup } from './scenes/S4Lockup';
import { SHOTS, TOTAL } from './timeline';
import { SFX } from './sfx';
import { useFonts } from './fonts';

export const SCENES = [
  { key: 's1_mask', Comp: S1Mask },
  { key: 's2_panels', Comp: S2Panels },
  { key: 's3_banhmi', Comp: S3Sheen },
  { key: 's4_lockup', Comp: S4Lockup },
] as const;

export const BGM_VOLUME = 0.62;

export const Main: React.FC<{ bgm?: boolean }> = ({ bgm = true }) => {
  useFonts();
  return (
  <AbsoluteFill style={{ background: '#1a110d' }}>
    {SCENES.map(({ key, Comp }) => (
      <Sequence key={key} from={SHOTS[key].from} durationInFrames={SHOTS[key].to - SHOTS[key].from} name={key}>
        <Comp />
      </Sequence>
    ))}
    {bgm && (
      <Audio
        src={staticFile('audio/bgm.mp3')}
        volume={(f) => BGM_VOLUME * interpolate(f, [0, 3, TOTAL - 45, TOTAL - 1], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
      />
    )}
    {SFX.map((s, i) => (
      <Sequence key={i} from={s.from} durationInFrames={s.dur ?? 90} name={`sfx ${s.note}`}>
        <Audio src={staticFile(s.src)} volume={s.volume} />
      </Sequence>
    ))}
  </AbsoluteFill>
  );
};
