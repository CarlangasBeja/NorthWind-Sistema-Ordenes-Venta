#!/usr/bin/env bash
set -Eeuo pipefail
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/lib.sh"
cargar_config
command -v podman >/dev/null || fail 'Podman no está instalado.'
[[ "$(podman inspect -f '{{.State.Running}}' "$SQL_CONTAINER" 2>/dev/null || true)" == true ]] \
  || fail 'SQL Server no está iniciado. Ejecute bash ./INICIAR_BACKEND_FEDORA44.sh.'

printf '\n--- SQL Server ---\n'
sqlcmd -d NorthWindDB -Q 'SELECT COUNT(*) AS Clientes FROM dbo.Customers; SELECT COUNT(*) AS Productos FROM dbo.Products; SELECT COUNT(*) AS Ordenes FROM dbo.Orders;'
sqlcmd -d NorthWindUsersDB -Q 'SELECT COUNT(*) AS Usuarios FROM dbo.AspNetUsers;'
sqlcmd -d NorthWindLogsDB -Q 'SELECT COUNT(*) AS Logs FROM dbo.DomainLogs;'

printf '\n--- Web API ---\n'
if curl -fsS --connect-timeout 2 http://127.0.0.1:5254/swagger/index.html -o /dev/null; then
  echo 'OK http://127.0.0.1:5254/swagger'
else
  fail 'La Web API no responde en http://127.0.0.1:5254. Consulte fedora/logs/backend-api.log.'
fi

if ! "$FEDORA_DIR/probar-sistema.sh"; then
  fail 'Fallaron las pruebas de autenticación o de consultas de la API.'
fi
msg 'Backend, SQL Server, login JWT y búsquedas comprobados.'
