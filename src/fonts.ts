import { useEffect, useState } from 'react';
import { continueRender, delayRender } from 'remotion';
import '@fontsource/be-vietnam-pro/500.css';
import '@fontsource/be-vietnam-pro/600.css';
import '@fontsource/be-vietnam-pro/700.css';
import '@fontsource/be-vietnam-pro/800.css';
import '@fontsource/be-vietnam-pro/900.css';
import '@fontsource/playfair-display/600-italic.css';
import '@fontsource/playfair-display/700-italic.css';
import '@fontsource/playfair-display/800.css';

const FACES = [
  '500 40px "Be Vietnam Pro"', '600 40px "Be Vietnam Pro"', '700 40px "Be Vietnam Pro"', '800 40px "Be Vietnam Pro"', '900 40px "Be Vietnam Pro"',
  'italic 600 40px "Playfair Display"', 'italic 700 40px "Playfair Display"', '800 40px "Playfair Display"',
];
const PROBE = 'ÁẠÍỨđươ Bánh Mì Xíu Mại';

// Hold the frame until every weight (incl. the Vietnamese subset) is loaded.
export const useFonts = () => {
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => {
    Promise.all(FACES.map((f) => document.fonts.load(f, PROBE))).then(
      () => continueRender(handle),
      () => continueRender(handle),
    );
  }, [handle]);
};
