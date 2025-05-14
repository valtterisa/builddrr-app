#!/usr/bin/env bash
set -euo pipefail
shopt -s inherit_errexit

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$root/.env"

VERBOSE=${VERBOSE:-1}                 # 1 = talkative
log()  { [[ $VERBOSE == 1 ]] && echo -e "$*"; }
ok()   { echo "✅ $*"; }
err()  { echo "❌ $*" >&2; exit 1; }
json() { jq -nc "$@"; }
