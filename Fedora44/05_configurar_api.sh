#!/usr/bin/env bash
set -Eeuo pipefail
BASE="$(cd "$(dirname "$0")/.." && pwd)"
API="$BASE/4. Frameworks And Drivers/UI/NorthWind.Sales.WebApi/NorthWind.Sales.WebApi.csproj"
[[ -f "$API" ]] || { echo 'No se encontró NorthWind.Sales.WebApi.csproj.' >&2; exit 1; }
read -r -s -p 'Contraseña sa del contenedor northwind-sql: ' SA_PASSWORD; echo
[[ -n "$SA_PASSWORD" ]] || { echo 'Contraseña vacía.' >&2; exit 1; }
for item in 'DBOptions:ConnectionString|NorthWindDB' 'DBOptions:DomainLogsConnectionString|NorthWindLogsDB' 'MembershipDBOptions:ConnectionString|NorthWindUsersDB'; do
 KEY="${item%%|*}"; DB="${item##*|}"
 CONN="Server=127.0.0.1,14333;Database=$DB;User ID=sa;Password=$SA_PASSWORD;Encrypt=True;TrustServerCertificate=True;Connect Timeout=10"
 dotnet user-secrets set "$KEY" "$CONN" --project "$API" >/dev/null
 done
unset SA_PASSWORD CONN
JWT_KEY="$(openssl rand -base64 48)"
dotnet user-secrets set 'JwtOptions:SecurityKey' "$JWT_KEY" --project "$API" >/dev/null
unset JWT_KEY
printf '\nConexiones de NorthWindDB, NorthWindLogsDB y NorthWindUsersDB guardadas en .NET User Secrets.\n'
printf 'JWT de desarrollo generado. No suba secretos a GitHub.\n'
