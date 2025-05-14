#!/usr/bin/env bash
source "$(dirname "$0")/_common.sh"
[[ $# == 1 ]] || err "Usage: pages-deploy.sh <slug>"
SLUG=$1; log "🚀  Triggering first build for $SLUG"

curl -sS -o /dev/null -w '%{http_code}' -X POST \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  "https://api.cloudflare.com/client/v4/accounts/$CF_ACCOUNT_ID/pages/projects/$SLUG/deployments" |
  grep -qE '^20[01]$' || err "deployment trigger failed"
ok "Build queued"
