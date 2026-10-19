#!/usr/bin/env bash
set -Eeuo pipefail
BASE="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
FEDORA_DIR="$BASE/fedora"
ENV_FILE="$FEDORA_DIR/.env"
SQL_CONTAINER="northwind-sql2022-fedora44"
SQL_VOLUME="northwind-sql2022-datos"
SQL_IMAGE="mcr.microsoft.com/mssql/server:2022-latest"

msg(){ printf '\n[NorthWind] %s\n' "$*"; }
fail(){ printf '\n[ERROR] %s\n' "$*" >&2; exit 1; }

generar_config(){
  if [[ -f "$ENV_FILE" ]]; then return; fi
  command -v openssl >/dev/null 2>&1 || fail 'Falta openssl: sudo dnf install -y openssl'
  local nueva_db nueva_jwt
  nueva_db="Aa1!$(openssl rand -hex 24)"
  nueva_jwt="$(openssl rand -hex 48)"
  umask 077
  {
    printf '# Claves de desarrollo locales. No subir a GitHub.\n'
    printf 'DB_SA_PASSWORD=%q\n' "$nueva_db"
    printf 'JWT_SECURITY_KEY=%q\n' "$nueva_jwt"
    printf 'DB_PORT=14333\n'
  } > "$ENV_FILE"
  chmod 600 "$ENV_FILE"
  msg 'Credenciales generadas en fedora/.env (no se mostrarán).'
}

cargar_config(){
  [[ -f "$ENV_FILE" ]] || fail "No existe $ENV_FILE. Ejecute INICIAR_FEDORA44.sh."
  # El archivo solo se genera localmente y tiene permisos de lectura restringidos.
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  [[ -n "${DB_SA_PASSWORD:-}" && -n "${JWT_SECURITY_KEY:-}" ]] || fail 'La configuración local está incompleta.'
  DB_PORT="${DB_PORT:-14333}"
  [[ "$DB_PORT" =~ ^[0-9]+$ ]] || fail 'DB_PORT debe ser un número.'
}

sqlcmd(){
  podman exec --env "SQLCMDPASSWORD=$DB_SA_PASSWORD" "$SQL_CONTAINER" \
    /opt/mssql-tools18/bin/sqlcmd -S 127.0.0.1 -U sa -C -b -l 8 "$@"
}

crear_conexion(){
  local bd="$1"
  printf 'Server=127.0.0.1,%s;Database=%s;User Id=sa;Password=%s;Encrypt=True;TrustServerCertificate=True;Connection Timeout=10' \
    "$DB_PORT" "$bd" "$DB_SA_PASSWORD"
}
