#!/usr/bin/env bash
# Punto de entrada en Fedora 44:  bash INICIAR_FEDORA44.sh
set -Eeuo pipefail
ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
exec bash "$ROOT/fedora/iniciar.sh" "$@"
