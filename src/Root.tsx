import React from 'react';
import { Composition } from 'remotion';

import { Main } from './Main';
import { FPS, H, TOTAL, W } from './timeline';

export const RemotionRoot: React.FC = () => (
  <Composition id="A8Promo" component={Main} durationInFrames={TOTAL} fps={FPS} width={W} height={H} defaultProps={{ bgm: true }} />
);
