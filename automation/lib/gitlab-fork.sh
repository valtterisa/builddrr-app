#!/usr/bin/env bash
source "$(dirname "$0")/_common.sh"
[[ $# == 1 ]] || err "Usage: gitlab-fork.sh <slug>"
SLUG=$1; log "🔧  Forking template → $GROUP/$SLUG"

resp=$(curl -sS -w '\nHTTP_STATUS:%{http_code}\n' -X POST \
      -H "PRIVATE-TOKEN:$GITLAB_TOKEN" \
      --data-urlencode "namespace_id=$GROUP_ID" \
      --data-urlencode "name=$SLUG" \
      --data-urlencode "path=$SLUG" \
      "https://gitlab.com/api/v4/projects/$TEMPLATE_ID/fork")
code=${resp##*$'\n'HTTP_STATUS:}
[[ $code == 201 ]] || err "GitLab fork failed (HTTP $code)"
ok "Repo $GROUP/$SLUG created"
