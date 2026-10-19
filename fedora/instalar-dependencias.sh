#!/usr/bin/env bash
set -Eeuo pipefail
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/lib.sh"
[[ -f /etc/fedora-release ]] || fail 'Este instalador está preparado para Fedora Workstation 44.'
[[ "$(uname -m)" == 'x86_64' ]] || fail 'La imagen oficial SQL Server 2022 requiere x86_64 (no ARM64).'
paquetes=()
command -v dotnet  >/dev/null 2>&1 || paquetes+=(dotnet-sdk-10.0)
command -v podman  >/dev/null 2>&1 || paquetes+=(podman)
command -v openssl >/dev/null 2>&1 || paquetes+=(openssl)
command -v curl    >/dev/null 2>&1 || paquetes+=(curl)
if (( ${#paquetes[@]} )); then
  msg "Instalando en Fedora: ${paquetes[*]}"
  sudo dnf install -y "${paquetes[@]}" || fail 'No se pudieron instalar las dependencias desde DNF.'
fi
# Si ya existe otra versión, dotnet --list-sdks debe incluir 10.x.
if ! dotnet --list-sdks | grep -qE '^10\.'; then
  msg 'Falta el SDK .NET 10 (la aplicación utiliza net10.0).'
  sudo dnf install -y dotnet-sdk-10.0 || fail 'No se pudo instalar .NET 10.'
fi
# global.json exige .NET 10; versiones 8/9 instaladas en paralelo no bastan.
actual="$(dotnet --list-sdks)"
[[ "$actual" == *"10."* ]] || fail 'No se detectó un SDK .NET 10.'
msg 'SDK .NET 10 y Podman disponibles.'
