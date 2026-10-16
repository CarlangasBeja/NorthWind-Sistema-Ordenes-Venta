#!/usr/bin/env bash
set -Eeuo pipefail
"$(dirname "$0")/01_verificar_fedora.sh"
echo 'Se instalarán .NET 10 SDK, Podman, Git y herramientas de diagnóstico.'
sudo dnf install -y dotnet-sdk-10.0 podman git curl jq openssl
printf '\nVersiones instaladas:\n'
dotnet --version
echo "SDK .NET 10 instalados:"
dotnet --list-sdks | grep -E "^10\." || { echo "No se encontró el SDK .NET 10." >&2; exit 1; }
podman --version
printf '\nCompletado. Mantenga separados los orígenes de paquetes .NET de Fedora y Microsoft.\n'
