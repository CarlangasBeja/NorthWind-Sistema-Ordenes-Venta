#!/usr/bin/env bash
set -Eeuo pipefail
"$(dirname "$0")/01_verificar_fedora.sh"
echo 'Se instalarán .NET 8 SDK, Podman, Git y herramientas de diagnóstico.'
sudo dnf install -y dotnet-sdk-8.0 podman git curl jq openssl
printf '\nVersiones instaladas:\n'
dotnet --version
podman --version
printf '\nCompletado. Mantenga separados los orígenes de paquetes .NET de Fedora y Microsoft.\n'
