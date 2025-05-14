#!/usr/bin/env bash
set -euo pipefail
root="$(cd "$(dirname "$0")" && pwd)"
lib="$root/lib"

usage(){ echo "Usage: siteforge {new|fork|pages-create|wire-domain|deploy} …"; exit 1; }

[[ $# -ge 1 ]] || usage
cmd=$1; shift
export VERBOSE=1            # default noisy

case $cmd in
  new)
    [[ $# -ge 1 ]] || usage
    slug=$1; host=${2:-$slug}
    bash "$lib/gitlab-fork.sh"       "$slug"
    bash "$lib/pages-create.sh"      "$slug"
    bash "$lib/pages-deploy.sh"      "$slug"
    bash "$lib/pages-wire-domain.sh" "$slug" "$host"
    ;;
  fork)         bash "$lib/gitlab-fork.sh"       "$@" ;;
  pages-create) bash "$lib/pages-create.sh"      "$@" ;;
  wire-domain)  bash "$lib/pages-wire-domain.sh" "$@" ;;
  deploy)       bash "$lib/pages-deploy.sh"      "$@" ;;
  *) usage ;;
esac
