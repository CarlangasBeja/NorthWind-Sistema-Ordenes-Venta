#!/usr/bin/env bash
set -Eeuo pipefail
BASE="$(cd "$(dirname "$0")/.." && pwd)"
NAME='northwind-sql'
podman container exists "$NAME" || { echo 'Primero ejecute 03_iniciar_sqlserver.sh.' >&2; exit 1; }
podman start "$NAME" >/dev/null || true
read -r -s -p 'Contraseña sa de SQL Server: ' SA_PASSWORD; echo
[[ -n "$SA_PASSWORD" ]] || { echo 'Contraseña vacía.' >&2; exit 1; }
SQLCMD=''
for try in {1..40}; do
  if podman exec "$NAME" test -x /opt/mssql-tools18/bin/sqlcmd 2>/dev/null; then SQLCMD=/opt/mssql-tools18/bin/sqlcmd; break; fi
  if podman exec "$NAME" test -x /opt/mssql-tools/bin/sqlcmd 2>/dev/null; then SQLCMD=/opt/mssql-tools/bin/sqlcmd; break; fi
  sleep 2
done
[[ -n "$SQLCMD" ]] || { echo 'No se encontró sqlcmd en el contenedor. Consulte podman logs northwind-sql.' >&2; exit 1; }
for try in {1..40}; do
  if podman exec -e "SQLCMDPASSWORD=$SA_PASSWORD" "$NAME" "$SQLCMD" -S localhost -U sa -C -b -Q 'SELECT 1' >/dev/null 2>&1; then break; fi
  if [[ "$try" == 40 ]]; then echo 'SQL Server no responde. Consulte: podman logs northwind-sql' >&2; exit 1; fi
  sleep 2
done
for script in '00_Crear_Todo_NorthWind.sql' 'NorthWind_10_Productos_10_Clientes.sql' '04_Verificar_Bases.sql'; do
  printf 'Ejecutando %s ...\n' "$script"
  podman exec -i -e "SQLCMDPASSWORD=$SA_PASSWORD" "$NAME" "$SQLCMD" \
    -S localhost -U sa -C -b < "$BASE/BaseDeDatos/$script"
done
unset SA_PASSWORD
printf '\nLas tres bases se crearon o verificaron correctamente.\n'
