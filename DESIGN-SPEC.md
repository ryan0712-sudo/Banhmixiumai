# Bánh Mì Xíu Mại A8 — promo film design spec (autonomous free-creation mode)

## Product brief
- Product: street-food breakfast shop "Bánh Mì Xíu Mại A8", 958 Nguyễn Văn Quá, P. Đông Hưng Thuận, TP.HCM.
- Hero: bowl of xíu mại (pork meatballs) in tomato sauce with fried egg, chả lụa, tofu, herbs; served with a crusty bánh mì,
  đồ chua (pickles) and cà phê sữa đá. Source: ONE user photo (1254², AI-upscaled 4× with Real-ESRGAN, stored as a 3× (3762px) asset for close framings).
- Audience: local customers on TikTok/Reels. Goal: appetite + remember the name + know the address.

## Requirement → execution decisions
| Requirement | Decision |
|---|---|
| 9:16 vertical | 1080×1920 @30fps, 682f (22.7s) |
| Background music | house-vibez.mp3 (Mixkit, free licence), 122.00 BPM grid (t0 0.064s, match 98.5%, mean 4.7ms); all cuts on beats; music lift at beat 32 = outro |
| Shop name + address | Outro lockup: A8 badge + 2-line wordmark + address as tagline (≥46px) |
| Only one photo | Every shot frames the same photo differently; no invented food or claims (no prices/hours) |
| Language | Vietnamese copy throughout; fonts with Vietnamese subset (Be Vietnam Pro, Playfair Display) |
| SFX | Freesound returned HTTP 403 to automated access from this sandbox → minimal procedural SFX generated in analysis/gen_sfx.py (documented deviation) |
| Two deliveries | out/promo.mp4 (BGM) and out/promo-nobgm.mp4 (SFX only), same timeline via `bgm` prop |

## Visual direction (tokens from the photo)
Cream glaze #f5ecd9, tomato sauce #e0602a / #b8461b, crust gold #e6a64c, dark wood #1a110d–#3a2417, ceramic blue #2f5597.
Type: Be Vietnam Pro 500–900 (UI/labels/wordmark), Playfair Display italic (accent words, echoing the chalkboard serif).
Motion voice: friendly small-business preset (~26f, soft ease-out, overshoot ≤1.04); the BGM supplies energy.
Styleframe skipped: the photo itself is the brand reference; colours/type validated on rendered stills (out/qa/).

## Feature → shot mapping (Gallery cards)
| Feature | Card · style | Demo source |
|---|---|---|
| Name of the dish + appetite hook | text-as-mask · text-as-mask | demos/opening/text-as-mask/TextAsMask.tsx |
| What's in the bowl (meatballs, egg) | panel-grid-moves · comic-panel-split | demos/rhythm/panel-grid-moves/ComicPanelSplit.tsx |
| Crusty bánh mì side | light-play-moves · sheen-sweep | demos/effects/light-play-moves/SheenSweepRetry.tsx |
| Brand + address | logo-shrink-wordmark-lockup | demos/outro/logo-shrink-wordmark-lockup/LogoShrinkWordmarkLockup.tsx |

## Storyboard (frames @30fps; beat n → beatF(n))
| # | Frames | Shot | Key motion | Copy |
|---|---|---|---|---|
| 1 | 0–150 | text-as-mask | cream stage, "XÍU / MẠI" letters reveal the photo drifting inside; breath; rush 46× → full photo on beat 8 (f121); hold | eyebrow "BÁNH MÌ", sub "Sốt cà chua đậm đà · nóng hổi" |
| 2 | 150–328 | comic-panel-split | full photo → 3 slanted seams cut on beats 12/12.5/13: whole bowl / xíu mại close / yolk macro; caption boxes stamp; panel 3 eats screen on beat 16 → poster | "01 · Cả tô / Đầy đặn", "02 · Xíu mại / Mềm, mọng nước", "03 · Trứng / Lòng đào"; poster (chả lụa/đậu hũ framing) "Xíu mại / mềm thơm." + "Thêm chả lụa, đậu hũ, / rau thơm." — ≥40f full hold |
| 3 | 328–475 | sheen-sweep | bánh mì card (graded −25% so the band reads) rises, turns to the light while one highlight band sweeps (beats 25→27); CTA pill | "ĂN KÈM", "Bánh mì / nóng giòn.", "Chấm sốt xíu mại là hết sẩy.", pill "Bữa sáng đậm vị Sài Gòn" |
| 4 | 475–682 | logo lockup | glowing split ring collapses 5.4→1 and lands as A8 badge on beat 34 with one shockwave; badge rises, wordmark letters slide in; address fades in; ~3s hold; music fades | "Bánh Mì / Xíu Mại", "958 Nguyễn Văn Quá", "P. Đông Hưng Thuận, TP.HCM" |

Full-frame/camera-level hits: rush takeover (beat 8), eat-screen (beat 16), badge landing (beat 34) = 3 (R4 limit ≤3, spaced ≥8… note: beats 8→16 is 8 beats apart; documented deviation from the ≥16-beat spacing because the film is only 46 beats long).

## SFX table (src/sfx.ts)
rush whoosh → beat 8 · 3 shutter clicks on the cuts (alternating, stepping down) · eat-screen whoosh · card-rise soft whoosh ·
riser → impact on beat 34 · shimmer on the address. Output audio offset measured 42.3ms (1.27f), applied via OUTPUT_AUDIO_OFFSET_SEC.

## Independent review (stage 7)
A clean-context reviewer found 6 must-fix issues (poster hold, caption cut by seam, invisible sheen, frame-0 accent, poster gradient pop, masked SFX) plus copy repeats / safe zones / loudness. All fixed and re-rendered; final mix −15.9 LUFS, peak −0.6 dBFS. Cuts measured within ≤1f of music onsets.
