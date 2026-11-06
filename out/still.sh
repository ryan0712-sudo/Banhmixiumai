#!/bin/bash
# usage: still.sh tag frame1 frame2 ...  -> out/qa/<tag>-f<N>.png (half scale) + contact sheet
cd "$(dirname "$0")/.."
B=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
tag=$1; shift; ins=(); n=0
for fr in "$@"; do
  npx remotion still src/index.ts A8Promo out/qa/$tag-f$fr.png --frame=$fr --concurrency=1 --browser-executable=$B --scale=0.5 --log=error >/dev/null 2>&1 || echo "fail $fr"
  ins+=(-i out/qa/$tag-f$fr.png); n=$((n+1))
done
ffmpeg -loglevel error -y "${ins[@]}" -filter_complex "hstack=$n" -frames:v 1 -update 1 out/qa/$tag-sheet.png
