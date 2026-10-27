#!/usr/bin/env bash
set -Eeuo pipefail
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/lib.sh"
command -v podman >/dev/null 2>&1 || fail 'No está instalado Podman.'
generar_config
cargar_config
[[ "$(uname -m)" == 'x86_64' ]] || fail 'SQL Server 2022 necesita una VM x86_64.'

if ! podman container exists "$SQL_CONTAINER"; then
  msg 'Creando contenedor SQL Server 2022 y su almacenamiento persistente.'
  podman volume create "$SQL_VOLUME" >/dev/null
  podman run --detach \
    --name "$SQL_CONTAINER" \
    --restart=unless-stopped \
    --publish "127.0.0.1:${DB_PORT}:1433" \
    --volume "${SQL_VOLUME}:/var/opt/mssql:Z,U" \
    --env ACCEPT_EULA=Y \
    --env MSSQL_PID=Developer \
    --env "MSSQL_SA_PASSWORD=$DB_SA_PASSWORD" \
    "$SQL_IMAGE" >/dev/null || fail 'Podman no pudo crear SQL Server. Compruebe la RAM y el espacio.'
else
  estado="$(podman inspect -f '{{.State.Running}}' "$SQL_CONTAINER")"
  if [[ "$estado" != true ]]; then
    msg 'Iniciando el SQL Server persistente existente.'
    podman start "$SQL_CONTAINER" >/dev/null || fail 'No se pudo iniciar el contenedor existente.'
  fi
fi

# SQL Server: si se reutiliza el contenedor, conservar la contraseña de fedora/.env.
msg 'Comprobando la conexión a SQL Server.'
listo=0
for _ in $(seq 1 90); do
  if sqlcmd -Q 'SELECT 1' >/dev/null 2>&1; then listo=1; break; fi
  if [[ "$(podman inspect -f '{{.State.Running}}' "$SQL_CONTAINER" 2>/dev/null || true)" != true ]]; then
    podman logs --tail 45 "$SQL_CONTAINER" >&2 || true
    fail 'SQL Server se ha detenido durante el arranque.'
  fi
  sleep 2
done
if [[ "$listo" -ne 1 ]]; then
  podman logs --tail 45 "$SQL_CONTAINER" >&2 || true
  fail 'No se pudo entrar a SQL Server. Revise la contraseña de fedora/.env, RAM y mensajes del contenedor.'
fi

# Verifica que el puerto publicado coincide con la configuración local.
puerto="$(podman port "$SQL_CONTAINER" 1433/tcp 2>/dev/null || true)"
[[ "$puerto" == *":${DB_PORT}" ]] || fail "Contenedor usa '$puerto', pero DB_PORT=$DB_PORT. Revise .env."

# Cada archivo incluye GO; ejecutar dentro del contenedor con el sqlcmd oficial.
# Todos los SQL originales son idempotentes: conservan registros previos.
SQL_FILES=(
  'BaseDeDatos/01_NorthWindDB.sql'
  'BaseDeDatos/02_NorthWindLogsDB.sql'
  'BaseDeDatos/03_NorthWindUsersDB.sql'
  'BaseDeDatos/NorthWind_10_Productos_10_Clientes.sql'
)
for relative in "${SQL_FILES[@]}"; do
  fichero="${relative##*/}"
  msg "Validando esquema y datos: $fichero"
  podman cp "$BASE/$relative" "$SQL_CONTAINER:/tmp/$fichero" \
    || fail "No se pudo copiar el SQL: $relative"
  sqlcmd -i "/tmp/$fichero" -o /dev/null \
    || fail "Error al ejecutar $relative. Revise el SQL y los permisos de la base."
done
msg 'Verificando las tres bases y registros iniciales.'
sqlcmd -Q "SELECT name FROM sys.databases WHERE name IN ('NorthWindDB','NorthWindLogsDB','NorthWindUsersDB') ORDER BY name;"
sqlcmd -d NorthWindDB -Q 'SELECT (SELECT COUNT(*) FROM dbo.Customers) AS Clientes, (SELECT COUNT(*) FROM dbo.Products) AS Productos;'
sqlcmd -d NorthWindUsersDB -Q 'SELECT COUNT(*) AS Usuarios FROM dbo.AspNetUsers;'
msg 'SQL Server funcionando; los datos se guardan en un volumen de Podman.'
