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

---

# Áo thun Spider-Man — video quảng cáo 60 giây (9:16)

- `out/spiderman-tee-1080p.mp4` — 1080×1920 · `out/spiderman-tee-4k.mp4` — 2160×3840 (nếu có). 30fps, đúng 60 giây, có nhạc nền + giọng đọc tiếng Việt.
- Nguồn: `src/tee/SpiderTee.tsx` (composition `SpiderTee`). Ảnh sản phẩm: `public/tee/shirt.jpg` (cắt từ ảnh gốc, phóng 3×).
- Giọng đọc: `public/tee/vo/` — tạo offline bằng Piper TTS (giọng `vi_VN-vais1000-medium`); lời thoại trong `script.txt`.
- 6 cảnh: Giới thiệu (0–8s) · Chất liệu (8–18s) · Hình in (18–30s) · Phối đồ (30–42s) · Điểm nổi bật (42–52s) · Kêu gọi mua hàng (52–60s).

```bash
npx remotion render src/index.ts SpiderTee out/spiderman-tee-1080p.mp4
npx remotion render src/index.ts SpiderTee out/spiderman-tee-4k.mp4 --scale=2
# bản không giọng đọc: --props='{"voice":false}'
```
