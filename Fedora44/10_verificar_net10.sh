#!/usr/bin/env bash
set -Eeuo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
if ! command -v dotnet >/dev/null; then echo 'No se encontró dotnet. Instale dotnet-sdk-10.0.' >&2; exit 1; fi
if ! dotnet --list-sdks | grep -qE '^10\.'; then echo 'No hay un SDK .NET 10 instalado.' >&2; exit 1; fi
printf '=== SDK seleccionado ===\n'
dotnet --version
printf '\n=== Verificación del target de todos los proyectos ===\n'
if grep -RE '<TargetFrameworks?>net(8|9)\.' --include='*.csproj' .; then
 echo 'Se encontraron proyectos en una versión inferior a .NET 10.' >&2; exit 1
fi
count="$(find . -type f -name '*.csproj' | wc -l)"
count_ok="$(grep -Rl '<TargetFramework>net10.0</TargetFramework>' --include='*.csproj' . | wc -l)"
printf 'Proyectos: %s; targeting net10.0: %s\n' "$count" "$count_ok"
if [[ "$count" != "$count_ok" || "$count" -lt 1 ]]; then
 echo 'No todos los proyectos apuntan a net10.0.' >&2; exit 1
fi
printf '\nComprobación estática correcta. Compile con dotnet restore y dotnet build.\n'
