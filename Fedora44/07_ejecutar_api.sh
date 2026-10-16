#!/usr/bin/env bash
set -Eeuo pipefail
BASE="$(cd "$(dirname "$0")/.." && pwd)"
cd "$BASE"
export ASPNETCORE_ENVIRONMENT=Development
printf 'Iniciando API: http://127.0.0.1:5254/swagger\n'
dotnet run --project '4. Frameworks And Drivers/UI/NorthWind.Sales.WebApi/NorthWind.Sales.WebApi.csproj' --no-launch-profile --urls http://127.0.0.1:5254
