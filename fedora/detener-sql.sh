#!/usr/bin/env bash
set -Eeuo pipefail
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/lib.sh"
if podman container exists "$SQL_CONTAINER"; then
  podman stop "$SQL_CONTAINER"
  msg 'SQL Server detenido. El volumen y las bases de datos se mantienen.'
else
  msg 'No hay contenedor de NorthWind para detener.'
fi
