#!/usr/bin/env bash
# Funciones compartidas por los scripts de Fedora 44 (NorthWind API + Astro).
set -Eeuo pipefail
BASE="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
FEDORA_DIR="$BASE/fedora"
ENV_FILE="$FEDORA_DIR/.env"
LOGS="$FEDORA_DIR/logs"
SQL_CONTAINER="northwind-astro-sql2022"
SQL_VOLUME="northwind-astro-sql2022-datos"
SQL_IMAGE="mcr.microsoft.com/mssql/server:2022-latest"
API_PROJECT="$BASE/4. Frameworks And Drivers/UI/NorthWind.Sales.WebApi/NorthWind.Sales.WebApi.csproj"
FRONT_DIR="$BASE/Frontend-Astro"
API_URL="http://127.0.0.1:5254"
FRONT_URL="http://127.0.0.1:4321"

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
    printf '# Claves de desarrollo locales de Fedora. No subir a GitHub.\n'
    printf 'DB_SA_PASSWORD=%q\n' "$nueva_db"
    printf 'JWT_SECURITY_KEY=%q\n' "$nueva_jwt"
    printf 'DB_PORT=14333\n'
  } > "$ENV_FILE"
  chmod 600 "$ENV_FILE"
  msg 'Credenciales generadas en fedora/.env (no se muestran).'
}

cargar_config(){
  [[ -f "$ENV_FILE" ]] || fail "No existe $ENV_FILE. Ejecute: bash INICIAR_FEDORA44.sh"
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  [[ -n "${DB_SA_PASSWORD:-}" && -n "${JWT_SECURITY_KEY:-}" ]] || fail 'La configuración local de fedora/.env está incompleta.'
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

# Exporta la configuración que la API lee de variables de entorno
# (sustituye a User Secrets y a LocalDB, que solo existen en Windows).
exportar_config_api(){
  export DBOptions__ConnectionString="$(crear_conexion NorthWindDB)"
  export DBOptions__DomainLogsConnectionString="$(crear_conexion NorthWindLogsDB)"
  export MembershipDBOptions__ConnectionString="$(crear_conexion NorthWindUsersDB)"
  export JwtOptions__SecurityKey="$JWT_SECURITY_KEY"
  if [[ -n "${RESEND_API_KEY:-}" ]]; then
    [[ -n "${RESEND_SENDER_EMAIL:-}" && -n "${RESEND_ADMIN_EMAIL:-}" ]] \
      || fail 'Resend necesita remitente y administrador. Ejecute: bash fedora/configurar-correo.sh'
    export SmtpOptions__SmtpHost='smtp.resend.com'
    export SmtpOptions__SmtpHostPort='587'
    export SmtpOptions__SmtpUserName='resend'
    export SmtpOptions__SmtpPassword="$RESEND_API_KEY"
    export SmtpOptions__SenderEmail="$RESEND_SENDER_EMAIL"
    export SmtpOptions__AdministratorEmail="$RESEND_ADMIN_EMAIL"
  fi
  export ASPNETCORE_ENVIRONMENT=Development
  export DOTNET_CLI_TELEMETRY_OPTOUT=1
}
