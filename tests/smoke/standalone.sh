#!/usr/bin/env bash
# Boots the standalone server that the Docker image runs, on an empty database (so the production
# migrations run), and checks what `next dev` cannot show: routing through the production proxy,
# the ISR cache, its revalidation when content changes, and the production-only headers.
# Run after `pnpm build`. Needs PAYLOAD_SECRET in the environment.
set -euo pipefail

port=${SMOKE_PORT:-3400}
base="http://localhost:$port"
work=$(mktemp -d)
cookies="$work/cookies"
failures=0

cp -R .next/static .next/standalone/.next/static

NODE_ENV=production PORT=$port HOSTNAME=127.0.0.1 SERVER_URL=$base ALLOW_FIRST_USER=true \
  DATABASE_URL="file:$work/smoke.db" MEDIA_DIR="$work/media" \
  node .next/standalone/server.js >"$work/server.log" 2>&1 &
server=$!
trap 'kill $server 2>/dev/null || true; rm -rf "$work"' EXIT

for _ in $(seq 1 60); do
  curl -sf -o /dev/null "$base/healthz" && break
  sleep 1
done

fail() {
  echo "FAIL: $*"
  failures=$((failures + 1))
}

status() { curl -s -o /dev/null -w '%{http_code}' --max-redirs 0 "$@"; }

expect_status() {
  local path=$1 expected=$2 actual
  actual=$(status "$base$path")
  [ "$actual" = "$expected" ] || fail "$path answered $actual, expected $expected"
}

for path in / /en /projets /en/projects /parcours /en/background /notes /en/notes /perso \
  /en/personal /mentions-legales /en/legal-notice /notes/rss.xml /en/notes/rss.xml \
  /sitemap.xml /robots.txt /healthz; do
  expect_status "$path" 200
done
expect_status /nulle-part 404
expect_status /en/nowhere 404
# No profile published yet: no CV.
expect_status /cv.pdf 404
# The prefixed French path redirects to the canonical one, once.
expect_status /fr/projets 307
[ "$(curl -s -o /dev/null -w '%{redirect_url}' "$base/fr/projets")" = "$base/projets" ] ||
  fail "/fr/projets does not redirect to /projets"

headers=$(curl -s -D - -o /dev/null "$base/projets")
grep -qi '^content-security-policy:' <<<"$headers" || fail "no CSP on the public site"
grep -qi '^strict-transport-security:' <<<"$headers" || fail "no HSTS"
grep -qi '^x-robots-tag: noindex' <<<"$headers" || fail "no X-Robots-Tag while not indexable"
curl -s -D - -o /dev/null "$base/admin" | grep -qi '^content-security-policy:' &&
  fail "the admin got the public CSP"

# Content written through the API, as the admin does, must reach the cached page.
api() { curl -s -b "$cookies" -c "$cookies" -H "Origin: $base" -H 'Content-Type: application/json' "$@"; }
api -X POST "$base/api/users/first-register" \
  -d '{"email":"smoke@test.local","password":"smoke-password"}' -o /dev/null
body='{"root":{"type":"root","format":"","indent":0,"version":1,"direction":"ltr","children":[{"type":"block","format":"","version":2,"fields":{"id":"b1","blockName":"","blockType":"Code","language":"ts","code":"const answer = 42"}}]}}'
id=$(api -X POST "$base/api/notes?locale=fr" \
  -d "{\"title\":\"Smoke v1\",\"slug\":\"smoke\",\"excerpt\":\"Smoke\",\"body\":$body,\"_status\":\"published\"}" |
  python3 -c 'import json, sys; print(json.load(sys.stdin)["doc"]["id"])')

page=$(curl -s "$base/notes/smoke")
grep -Eq '<h1[^>]*>Smoke v1</h1>' <<<"$page" || fail "the published note is not shown"
grep -q 'class="shiki' <<<"$page" || fail "the code block is not highlighted"
second=$(curl -s -D - -o /dev/null "$base/notes/smoke")
grep -qi '^x-nextjs-cache: HIT' <<<"$second" || fail "the note page is not served from the ISR cache"

api -X PATCH "$base/api/notes/$id?locale=fr" -d '{"title":"Smoke v2","_status":"published"}' -o /dev/null
grep -Eq '<h1[^>]*>Smoke v2</h1>' <<<"$(curl -s "$base/notes/smoke")" || fail "the page kept the old title"
grep -q 'Smoke v2' <<<"$(curl -s "$base/notes")" || fail "the note list kept the old title"

api -X POST "$base/api/globals/profile?locale=fr" \
  -d '{"name":"Smoke","headline":"Smoke","_status":"published"}' -o /dev/null
curl -s -o "$work/cv.pdf" "$base/cv.pdf"
[ "$(head -c 5 "$work/cv.pdf")" = '%PDF-' ] || fail "the CV is not a PDF"
# The font files must be in the image: without them react-pdf fails, or falls back.
grep -aq 'Inter' "$work/cv.pdf" || fail "the CV does not embed Inter"
grep -aq 'SpaceGrotesk' "$work/cv.pdf" || fail "the CV does not embed Space Grotesk"
curl -s -D - -o /dev/null "$base/cv.pdf" | grep -qi '^content-security-policy:' &&
  fail "the PDF got the CSP of the HTML pages"
# The profile has no English headline: no English CV.
expect_status /en/cv.pdf 404

if [ "$failures" -gt 0 ]; then
  echo "--- server log"
  tail -50 "$work/server.log"
  exit 1
fi
echo "Smoke test passed."
