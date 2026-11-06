// The single product photo, framed by a 2D camera in source-pixel space (source = 1254×1254).
// screen = c + s·(p − f). The asset on disk is an AI-upscaled 3x copy, so close framings stay sharp.
import React from 'react';
import { Img, staticFile } from 'remotion';

export const SRC = 1254;
export type Cam = { fx: number; fy: number; cx: number; cy: number; s: number };
export const mixCam = (a: Cam, b: Cam, t: number): Cam => ({
  fx: a.fx + (b.fx - a.fx) * t,
  fy: a.fy + (b.fy - a.fy) * t,
  cx: a.cx + (b.cx - a.cx) * t,
  cy: a.cy + (b.cy - a.cy) * t,
  s: a.s + (b.s - a.s) * t,
});

// Full-frame framing used at the end of shot 1 and the start of shot 2 (bowl centred, cover 1080×1920).
export const CAM_FULL: Cam = { fx: 575, fy: 627, cx: 540, cy: 960, s: 1920 / SRC };

export const Photo: React.FC<{ cam: Cam; style?: React.CSSProperties }> = ({ cam, style }) => {
  const size = SRC * cam.s;
  const left = cam.cx - cam.s * cam.fx;
  const top = cam.cy - cam.s * cam.fy;
  return (
    <Img
      src={staticFile('img/photo.jpg')}
      style={{ position: 'absolute', left, top, width: size, height: size, maxWidth: 'none', ...style }}
    />
  );
};
