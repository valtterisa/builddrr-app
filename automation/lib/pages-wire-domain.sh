#!/usr/bin/env bash
source "$(dirname "$0")/_common.sh"
[[ $# -ge 1 ]] || err "Usage: pages-wire-domain.sh <slug> [host]"
SLUG=$1; HOST=${2:-$SLUG}; FQDN="$HOST.$ROOT_SUFFIX"
log "🌐  Wiring $FQDN for project $SLUG"

SUB=$(curl -sS -H "Authorization: Bearer $CF_API_TOKEN" \
      "https://api.cloudflare.com/client/v4/accounts/$CF_ACCOUNT_ID/pages/projects/$SLUG" |
      jq -r '.result.subdomain')
[[ $SUB != null ]] || err "project $SLUG not found"

rec=$(curl -s -H "Authorization: Bearer $CF_API_TOKEN" \
      "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/dns_records?type=CNAME&name=$FQDN" |
      jq -r '.result[0]')
RID=$(jq -r '.id // empty' <<<"$rec")
body=$(json --arg type CNAME --arg name "$FQDN" --arg content "$SUB" \
            --argjson proxied false '{type:$type,name:$name,content:$content,ttl:1,proxied:$proxied}')
verb=POST url="/dns_records"; [[ -n $RID ]] && { verb=PUT; url="/dns_records/$RID"; }
curl -sS --fail -X $verb -H "Authorization: Bearer $CF_API_TOKEN" \
     -H "Content-Type: application/json" --data "$body" \
     "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID${url}" >/dev/null
log "   • grey-cloud CNAME ready"

# register with Pages
curl -sS -o /dev/null -w '%{http_code}' -X POST \
  -H "Authorization: Bearer $CF_API_TOKEN" -H "Content-Type: application/json" \
  --data "$(json --arg name "$FQDN" '{name:$name}')" \
  "https://api.cloudflare.com/client/v4/accounts/$CF_ACCOUNT_ID/pages/projects/$SLUG/domains" |
  grep -qE '^20[01]$' || err "/domains failed"

# wait TLS
for ((i=0;i<POLL_ATTEMPTS;i++)); do
  sleep "$POLL_SECONDS"
  status=$(curl -s -H "Authorization: Bearer $CF_API_TOKEN" \
    "https://api.cloudflare.com/client/v4/accounts/$CF_ACCOUNT_ID/pages/projects/$SLUG/domains/$FQDN" |
    jq -r '.result.status')
  [[ $status == active ]] && break
done
[[ $status == active ]] || err "TLS timed out"

# flip orange
curl -sS --fail -X PATCH -H "Authorization: Bearer $CF_API_TOKEN" \
     -H "Content-Type: application/json" --data '{"proxied":true}' \
     "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/dns_records/$RID" >/dev/null
ok "Domain $FQDN active & proxied"
