# Bánh Mì Xíu Mại A8 — video quảng cáo (9:16)

- `out/promo.mp4` — bản có nhạc nền · `out/promo-nobgm.mp4` — bản chỉ có hiệu ứng âm thanh
- 1080×1920, 30fps, 22,7 giây. Dựng bằng [Remotion](https://www.remotion.dev/) theo skill video-shotcraft.
- Kịch bản & quyết định thiết kế: `DESIGN-SPEC.md`. Nguồn nhạc/âm thanh: `public/audio/CREDITS.md`.

## Render lại
```bash
npm install
npx remotion render src/index.ts A8Promo out/promo.mp4
npx remotion render src/index.ts A8Promo out/promo-nobgm.mp4 --props=props-nobgm.json
```
Chỉnh chữ: các hằng `*_DEFAULTS` trong `src/scenes/*.tsx` và `src/brand.ts`.
