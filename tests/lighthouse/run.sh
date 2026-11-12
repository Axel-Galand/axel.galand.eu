#!/usr/bin/env bash
# Lighthouse budgets (PLAN.md, "Design et animation"): boots the standalone server on an empty
# database, publishes a little content through the API (an album with photos included), and audits
# the main pages with Lighthouse CI. Run after `pnpm build`. Needs PAYLOAD_SECRET and a Chrome or
# Chromium (CHROME_PATH). Extra arguments go to `lhci autorun`.
#
# The build is not indexable (noindex), so the crawlability audit is skipped: the rest of the SEO
# category still has to score 100.
set -euo pipefail

port=${LIGHTHOUSE_PORT:-3500}
base="http://localhost:$port"
work=$(mktemp -d)
cookies="$work/cookies"

if curl -s -o /dev/null "$base/healthz"; then
  echo "FAIL: something already listens on port $port (set LIGHTHOUSE_PORT)"
  exit 1
fi

mkdir -p .next/standalone/.next/static
cp -R .next/static/. .next/standalone/.next/static/

NODE_ENV=production PORT=$port HOSTNAME=127.0.0.1 SERVER_URL=$base ALLOW_FIRST_USER=true \
  DATABASE_URL="file:$work/lighthouse.db" MEDIA_DIR="$work/media" \
  node .next/standalone/server.js >"$work/server.log" 2>&1 &
server=$!

finish() {
  local status=$?
  if [ "$status" -ne 0 ]; then
    echo "--- server log"
    tail -50 "$work/server.log" || true
  fi
  kill $server 2>/dev/null || true
  rm -rf "$work"
  exit "$status"
}
trap finish EXIT

ready=false
for _ in $(seq 1 60); do
  curl -sf -o /dev/null "$base/healthz" && ready=true && break
  sleep 1
done
$ready || { echo "FAIL: the server did not answer /healthz within 60 s"; exit 1; }

# Each call fails loudly, with the response body, so a seed broken by a schema change is obvious.
api() {
  local out="$work/response" code
  code=$(curl -s -o "$out" -w '%{http_code}' -b "$cookies" -c "$cookies" -H "Origin: $base" "$@")
  if [ "${code:0:1}" != 2 ]; then
    echo "FAIL: $* answered $code"
    cat "$out"
    exit 1
  fi
  cat "$out"
}
json() { api -H 'Content-Type: application/json' "$@" >/dev/null; }
text() { printf '{"type":"text","text":"%s","detail":0,"format":0,"mode":"normal","style":"","version":1}' "$1"; }
element() { printf '{"type":"%s","format":"","indent":0,"version":1,"direction":"ltr"%s,"children":[%s]}' "$1" "$2" "$3"; }
paragraph() { element paragraph ',"textFormat":0,"textStyle":""' "$(text "$1")"; }
heading() { element heading ",\"tag\":\"$1\"" "$(text "$2")"; }
richtext() { printf '{"root":{"type":"root","format":"","indent":0,"version":1,"direction":"ltr","children":[%s]}}' "$1"; }

json -X POST "$base/api/users/first-register" \
  -d '{"email":"lighthouse@test.local","password":"lighthouse-password"}'

long="Une plateforme de location présente dans plusieurs pays, et le travail de performance qui va avec."
code='{"type":"block","format":"","version":2,"fields":{"id":"b1","blockName":"","blockType":"Code","language":"ts","code":"export const revalidate = 3600"}}'
body=$(richtext "$(heading h2 'Le contexte'),$(paragraph "$long"),$code,$(heading h2 'Le résultat'),$(paragraph "$long")")

json -X POST "$base/api/globals/profile?locale=fr" -d "{
  \"name\":\"Axel Galand\",\"headline\":\"Développeur web full-stack\",\"location\":\"Bordeaux\",
  \"email\":\"contact@example.com\",\"bio\":$(richtext "$(paragraph "$long")"),\"_status\":\"published\"}"
json -X POST "$base/api/globals/profile?locale=en" -d "{
  \"headline\":\"Full-stack web developer\",\"bio\":$(richtext "$(paragraph "$long")"),\"_status\":\"published\"}"
json -X POST "$base/api/case-studies?locale=fr" -d "{
  \"title\":\"Location de self-stockage\",\"slug\":\"lighthouse\",\"summary\":\"$long\",
  \"sector\":\"Location\",\"period\":{\"start\":\"2023-01-01T00:00:00.000Z\"},\"featured\":true,
  \"visual\":\"web-vitals\",\"metrics\":[{\"value\":\"5\",\"label\":\"pays\"}],
  \"context\":$body,\"work\":$body,\"_status\":\"published\"}"
json -X POST "$base/api/notes?locale=fr" -d "{
  \"title\":\"Migrer les médias vers Cloudinary\",\"slug\":\"lighthouse\",\"excerpt\":\"$long\",
  \"body\":$body,\"tags\":[\"cloudinary\"],\"featured\":true,
  \"publishedAt\":\"2026-11-01T00:00:00.000Z\",\"_status\":\"published\"}"
json -X POST "$base/api/experiences?locale=fr" -d "{
  \"kind\":\"job\",\"organization\":\"Kanbios\",\"role\":\"Développeur full-stack\",
  \"start\":\"2022-09-01T00:00:00.000Z\",\"description\":\"$long\",\"_status\":\"published\"}"

# Photos at the size Cloudinary serves a phone (t_pf_w960): this build has no Cloudinary, so the
# page gets the stored file itself.
photos=()
for spec in 'un 960 720 #a84' 'deux 720 960 #48a' 'trois 960 720 #8a4' 'quatre 960 320 #a48'; do
  read -r name width height color <<<"$spec"
  node -e '
    const [file, width, height, background] = process.argv.slice(1)
    require("sharp")({ create: { width: +width, height: +height, channels: 3, background } })
      .jpeg({ quality: 80 }).toFile(file)
  ' "$work/$name.jpg" "$width" "$height" "$color"
  id=$(api -X POST "$base/api/media" -F "file=@$work/$name.jpg;type=image/jpeg" \
    -F "_payload={\"alt\":\"Photo $name\"}" |
    node -e 'let s = ""; process.stdin.on("data", (d) => (s += d)).on("end", () => console.log(JSON.parse(s).doc.id))')
  photos+=("$id")
done
json -X POST "$base/api/albums?locale=fr" -d "{
  \"title\":\"Saison d'enduro\",\"slug\":\"lighthouse\",\"season\":2026,\"category\":\"enduro\",
  \"cover\":${photos[0]},\"photos\":[$(IFS=,; echo "${photos[*]}")],\"_status\":\"published\"}"

urls=()
for path in / /en /projets /projets/lighthouse /parcours /notes /notes/lighthouse /perso \
  /perso/lighthouse /mentions-legales; do
  urls+=(--collect.url="$base$path")
done

pnpm exec lhci autorun --config=tests/lighthouse/lighthouserc.json "${urls[@]}" "$@"
