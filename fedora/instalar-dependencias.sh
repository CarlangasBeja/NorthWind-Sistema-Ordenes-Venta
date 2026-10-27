#!/usr/bin/env bash
# Instala lo que falte en Fedora 44: .NET 8 SDK, Node.js/npm, Podman y utilidades.
set -Eeuo pipefail
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/lib.sh"
[[ -f /etc/fedora-release ]] || fail 'Este instalador está preparado para Fedora 44.'
[[ "$(uname -m)" == 'x86_64' ]] || fail 'La imagen oficial de SQL Server 2022 requiere x86_64 (no ARM64).'

paquetes=()
if ! command -v dotnet >/dev/null 2>&1 || ! dotnet --list-sdks 2>/dev/null | grep -qE '^8\.'; then
  paquetes+=(dotnet-sdk-8.0)
fi
command -v node    >/dev/null 2>&1 || paquetes+=(nodejs)
command -v npm     >/dev/null 2>&1 || paquetes+=(npm)
command -v podman  >/dev/null 2>&1 || paquetes+=(podman)
command -v openssl >/dev/null 2>&1 || paquetes+=(openssl)
command -v curl    >/dev/null 2>&1 || paquetes+=(curl)
command -v python3 >/dev/null 2>&1 || paquetes+=(python3)

if (( ${#paquetes[@]} )); then
  msg "Instalando con DNF: ${paquetes[*]}"
  sudo dnf install -y "${paquetes[@]}" || fail 'No se pudieron instalar las dependencias con DNF.'
fi

dotnet --list-sdks | grep -qE '^8\.' || fail 'No se detectó el SDK de .NET 8 (sudo dnf install -y dotnet-sdk-8.0).'
node_major="$(node -p 'process.versions.node.split(".")[0]')"
(( node_major >= 20 )) || fail "Astro 5 necesita Node.js 20 o superior (instalado: $(node --version))."
msg "Listo: .NET $(dotnet --list-sdks | grep -E '^8\.' | tail -1 | cut -d' ' -f1), Node $(node --version), $(podman --version)."
