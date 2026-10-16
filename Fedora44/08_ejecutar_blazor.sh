#!/usr/bin/env bash
set -Eeuo pipefail
BASE="$(cd "$(dirname "$0")/.." && pwd)"
cd "$BASE"
export ASPNETCORE_ENVIRONMENT=Development
printf 'Iniciando Blazor WebAssembly: http://127.0.0.1:5255\n'
dotnet run --project '4. Frameworks And Drivers/UIs/NorthWind.Sales.BlazorClient/NorthWind.Sales.BlazorClient.csproj' --no-launch-profile --urls http://127.0.0.1:5255
