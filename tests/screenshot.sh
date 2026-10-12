#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
PORT="${FALL_GARDEN_PORT:-4323}"
CHROME="$(command -v google-chrome || command -v chromium || command -v chromium-browser)"
mkdir -p screenshots dist
if [[ ! -f dist/fall-garden-7b.html ]]; then python3 build.py; fi
if ! ss -ltn | grep -q "127.0.0.1:$PORT "; then
  nohup python3 server.py > /tmp/fall-garden-7b-$PORT.log 2>&1 &
  sleep 1
fi
shot() {
  local url="$1" out="$2" size="$3"; shift 3 || true
  local prof; prof="$(mktemp -d /tmp/fgshot.XXXX)"
  "$CHROME" --headless=new --no-sandbox --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
    --run-all-compositor-stages-before-draw --virtual-time-budget=28000 \
    --window-size="$size" --user-data-dir="$prof" --screenshot="$out" "$@" "$url" >/dev/null 2>&1
  rm -rf "$prof"; echo "  $out ($(wc -c < "$out") bytes)"
}
U="http://127.0.0.1:$PORT"
shot "file://$PWD/dist/fall-garden-7b.html#month" screenshots/00-best-home.png 1440,1100
shot "$U/#month" screenshots/00-desktop-month.png 1440,1000
shot "$U/#plant" screenshots/01-plant.png 1440,1000
shot "$U/#bulbs" screenshots/02-bulbs.png 1440,1000
shot "$U/#leaf" screenshots/03-leaf.png 1440,1000
shot "$U/#journal" screenshots/04-journal.png 1440,1000
shot "$U/#about" screenshots/05-about.png 1440,1000
shot "$U/#month" screenshots/06-phone.png 390,844 --user-agent="Mozilla/5.0 (iPhone)"
echo "screenshots done"
