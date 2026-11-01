#!/usr/bin/env bash
# Renders each HyperFrames overlay with an alpha channel (WebM/VP9) straight into the Remotion project.
set -euo pipefail
cd "$(dirname "$0")"
OUT=../remotion/public/overlays
mkdir -p "$OUT"
for c in intro chapter outro; do
  npx --yes hyperframes@0.8.225 render -c "compositions/$c.html" --format webm --fps 30 --quality delivery -o "$OUT/$c.webm" --quiet
done
ls -la "$OUT"
