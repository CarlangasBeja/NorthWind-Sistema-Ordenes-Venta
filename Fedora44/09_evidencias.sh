#!/usr/bin/env bash
set -Eeuo pipefail
"$(dirname "$0")/01_verificar_fedora.sh"
printf '\n=== SDK y sistema ===\n'
dotnet --info | head -32
printf '\n=== SDK .NET 10 ===\n'
dotnet --list-sdks
printf '\n=== Framework de los proyectos ===\n'
grep -m1 '<TargetFramework>' '4. Frameworks And Drivers/UI/NorthWind.Sales.WebApi/NorthWind.Sales.WebApi.csproj' '4. Frameworks And Drivers/UIs/NorthWind.Sales.BlazorClient/NorthWind.Sales.BlazorClient.csproj'
printf '\n=== Contenedor de bases de datos ===\n'
podman ps --filter name=northwind-sql --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
printf '\n=== API ===\n'
curl -sSI --connect-timeout 4 'http://127.0.0.1:5254/swagger/index.html' | head -6 || true
printf '\n=== Blazor ===\n'
curl -sSI --connect-timeout 4 'http://127.0.0.1:5255/' | head -6 || true
printf '\nTome capturas reales en Fedora 44 de estas salidas y del navegador.\n'
