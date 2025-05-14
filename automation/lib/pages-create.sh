#!/usr/bin/env bash
# ---------------------------------------------------------------------------
#  pages-create.sh  <slug>
#
#  • <slug> must already exist in the GitLab namespace $GROUP            (fork)
#  • The script creates a Pages project of the same name and links it
#    to that repo. Environment comes from .env via lib/_common.sh
# ---------------------------------------------------------------------------
source "$(dirname "$0")/_common.sh"

[[ $# == 1 ]] || err "Usage: pages-create.sh <slug>"
SLUG=$1

log "🛠  Creating Pages project $SLUG"

# ---------- build JSON payload --------------------------------------------
payload=$(json --arg name "$SLUG" --arg owner "$GROUP" '
  {
    name: $name,
    production_branch: "main",
    "build_config": {
      "build_command": "npm run pages:build",
      "destination_dir": ".vercel/output/static"
    },
    source: {
      type: "gitlab",
      config: { owner: $owner, repo_name: $name, deployments_enabled: true }
    },
    deployment_configs: {
      production: { environment_variables: { NODE_VERSION: "20" } },
      preview:    { environment_variables: { NODE_VERSION: "20" } }
    }
  }')

# ---------- call Cloudflare API -------------------------------------------
response=$(curl -sS -w '\nHTTP_STATUS:%{http_code}\n' -X POST \
           -H "Authorization: Bearer $CF_API_TOKEN" \
           -H "Content-Type: application/json" \
           --data "$payload" \
           "https://api.cloudflare.com/client/v4/accounts/$CF_ACCOUNT_ID/pages/projects")

body=${response%$'\n'HTTP_STATUS:*}
code=${response##*$'\n'HTTP_STATUS:}

# ---------- evaluate result -----------------------------------------------
success=$(jq -r '.success' <<<"$body")

if [[ $success != true ]]; then
  log "⚠️  API payload:"
  jq . <<<"$body"
  err "Pages creation returned success=false (HTTP $code)"
fi

if [[ $code != 201 && $code != 200 ]]; then
  err "Unexpected HTTP status $code"
fi

ok "Pages project $SLUG created"
