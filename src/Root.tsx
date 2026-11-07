import React from 'react';
import { Composition } from 'remotion';

import { Main } from './Main';
import { SpiderTee, TEE_FPS, TEE_TOTAL } from './tee/SpiderTee';
import { FPS, H, TOTAL, W } from './timeline';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="A8Promo" component={Main} durationInFrames={TOTAL} fps={FPS} width={W} height={H} defaultProps={{ bgm: true }} />
    <Composition id="SpiderTee" component={SpiderTee} durationInFrames={TEE_TOTAL} fps={TEE_FPS} width={1080} height={1920} defaultProps={{ voice: true }} />
  </>
);
