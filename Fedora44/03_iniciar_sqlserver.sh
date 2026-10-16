#!/usr/bin/env bash
set -Eeuo pipefail
"$(dirname "$0")/01_verificar_fedora.sh"
command -v podman >/dev/null || { echo 'Instale Podman con 02_instalar_dependencias.sh' >&2; exit 1; }
NAME='northwind-sql'
if podman container exists "$NAME"; then
 echo "El contenedor $NAME ya existe. Iniciándolo sin borrar sus datos."
 podman start "$NAME" >/dev/null || true
 podman ps --filter "name=$NAME"
 exit 0
fi
printf 'Defina una contraseña NUEVA para sa (8+ caracteres, mayúsculas, minúsculas, números y símbolos).\n'
read -r -s -p 'Contraseña de SQL Server: ' SA_PASSWORD; echo
if [[ ${#SA_PASSWORD} -lt 12 ]]; then echo 'Use al menos 12 caracteres.' >&2; exit 1; fi
if [[ "$SA_PASSWORD" == *[[:space:]]* ]]; then echo 'Evite espacios para simplificar el entorno de prácticas.' >&2; exit 1; fi
podman volume create northwind_sql_data >/dev/null
podman run -d --name "$NAME" --hostname northwind-sql \
 -e ACCEPT_EULA=Y -e MSSQL_PID=Developer -e "MSSQL_SA_PASSWORD=$SA_PASSWORD" \
 -p 127.0.0.1:14333:1433 \
 -v northwind_sql_data:/var/opt/mssql:Z,U \
 mcr.microsoft.com/mssql/server:2022-latest >/dev/null
unset SA_PASSWORD
printf '\nContenedor creado: %s\nSQL Server accesible en 127.0.0.1,14333 (únicamente desde Fedora).\n' "$NAME"
printf 'El primer inicio puede tomar varios segundos. Use: podman logs northwind-sql\n'
