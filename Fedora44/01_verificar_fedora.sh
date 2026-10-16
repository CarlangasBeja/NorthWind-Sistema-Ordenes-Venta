#!/usr/bin/env bash
set -Eeuo pipefail
printf '\n=== NorthWind · Comprobación de Fedora 44 ===\n'
if [[ ! -r /etc/os-release ]]; then echo 'No se encontró /etc/os-release.' >&2; exit 1; fi
source /etc/os-release
printf 'Sistema: %s\nVersión: %s\nArquitectura: %s\n' "${PRETTY_NAME:-Linux}" "${VERSION_ID:-desconocida}" "$(uname -m)"
if [[ "${ID:-}" != 'fedora' || "${VERSION_ID:-}" != '44' ]]; then
  echo 'ATENCIÓN: la consigna exige Fedora Workstation 44. Compruebe el sistema antes de entregar.' >&2
  exit 2
fi
if [[ "$(uname -m)" != 'x86_64' ]]; then
 echo 'ATENCIÓN: la imagen oficial de SQL Server requiere CPU x86_64. Use SQL Server remoto si usa ARM.' >&2
 exit 3
fi
printf 'Fedora 44 x86_64 verificado.\n'
