#!/usr/bin/env bash
set -Eeuo pipefail
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/lib.sh"
cargar_config
command -v podman >/dev/null || fail 'Podman no está instalado.'
[[ "$(podman inspect -f '{{.State.Running}}' "$SQL_CONTAINER" 2>/dev/null || true)" == true ]] || fail 'No está iniciado SQL Server. Ejecute ./INICIAR_FEDORA44.sh.'
printf '\n--- SQL Server ---\n'
sqlcmd -d NorthWindDB -Q 'SELECT COUNT(*) AS Clientes FROM dbo.Customers; SELECT COUNT(*) AS Productos FROM dbo.Products; SELECT COUNT(*) AS Ordenes FROM dbo.Orders;'
sqlcmd -d NorthWindUsersDB -Q 'SELECT COUNT(*) AS Usuarios FROM dbo.AspNetUsers;'
sqlcmd -d NorthWindLogsDB -Q 'SELECT COUNT(*) AS Logs FROM dbo.DomainLogs;'
printf '\n--- Aplicaciones HTTP ---\n'
for url in 'http://127.0.0.1:5254/swagger/index.html' 'http://127.0.0.1:5255/'; do
  if curl -fsS --connect-timeout 2 "$url" -o /dev/null; then
    echo "OK $url"
  else
    echo "ERROR $url"
    exit 1
  fi
done
msg 'Comprobaciones completas.'
