#!/usr/bin/env bash
set -Eeuo pipefail
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/lib.sh"
[[ -f /etc/fedora-release ]] || fail 'Este arranque está preparado para Fedora Workstation 44.'
[[ "$EUID" -ne 0 ]] || fail 'No ejecute este script como root; Podman debe ejecutarse en modo rootless.'
cd "$BASE"
"$FEDORA_DIR/instalar-dependencias.sh"
"$FEDORA_DIR/preparar-base-datos.sh"
cargar_config

API_PROJECT="$BASE/4. Frameworks And Drivers/UI/NorthWind.Sales.WebApi/NorthWind.Sales.WebApi.csproj"
LOGS="$FEDORA_DIR/logs"
mkdir -p "$LOGS"

msg 'Compilando solo NorthWind.Sales.WebApi y sus dependencias.'
if ! dotnet build "$API_PROJECT" --nologo >"$LOGS/backend-build.log" 2>&1; then
  tail -n 100 "$LOGS/backend-build.log" >&2
  fail "Falló la compilación del backend. Registro completo: $LOGS/backend-build.log"
fi

API_PID=''
cerrar(){
  [[ -z "$API_PID" ]] || kill "$API_PID" 2>/dev/null || true
  wait 2>/dev/null || true
}
trap cerrar EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

msg 'Iniciando únicamente la Web API en http://127.0.0.1:5254.'
(
  export DBOptions__ConnectionString="$(crear_conexion NorthWindDB)"
  export DBOptions__DomainLogsConnectionString="$(crear_conexion NorthWindLogsDB)"
  export MembershipDBOptions__ConnectionString="$(crear_conexion NorthWindUsersDB)"
  export JwtOptions__SecurityKey="$JWT_SECURITY_KEY"
  if [[ -n "${RESEND_API_KEY:-}" ]]; then
    [[ -n "${RESEND_SENDER_EMAIL:-}" && -n "${RESEND_ADMIN_EMAIL:-}" ]] \
      || fail 'Resend necesita remitente y administrador. Ejecute bash fedora/configurar-correo.sh.'
    export SmtpOptions__SmtpHost='smtp.resend.com'
    export SmtpOptions__SmtpHostPort='587'
    export SmtpOptions__SmtpUserName='resend'
    export SmtpOptions__SmtpPassword="$RESEND_API_KEY"
    export SmtpOptions__SenderEmail="$RESEND_SENDER_EMAIL"
    export SmtpOptions__AdministratorEmail="$RESEND_ADMIN_EMAIL"
  fi
  export ASPNETCORE_ENVIRONMENT=Development
  exec dotnet run --project "$API_PROJECT" --no-build --launch-profile fedora
) >"$LOGS/backend-api.log" 2>&1 &
API_PID=$!

api_ok=0
for _ in $(seq 1 60); do
  if curl -fsS --connect-timeout 2 http://127.0.0.1:5254/swagger/index.html -o /dev/null 2>/dev/null; then
    api_ok=1
    break
  fi
  if ! kill -0 "$API_PID" 2>/dev/null; then break; fi
  sleep 1
done
if [[ "$api_ok" -ne 1 ]]; then
  tail -n 90 "$LOGS/backend-api.log" >&2
  fail "La Web API no inició correctamente. Consulte $LOGS/backend-api.log"
fi

if ! "$FEDORA_DIR/probar-sistema.sh" >"$LOGS/backend-smoke-test.log" 2>&1; then
  tail -n 80 "$LOGS/backend-smoke-test.log" >&2
  fail "La API inició pero falló una prueba funcional. Consulte $LOGS/backend-smoke-test.log"
fi

printf '\n===========================================\n'
printf ' NorthWind: backend API activo en Fedora 44\n'
printf ' SWAGGER:    http://127.0.0.1:5254/swagger\n'
printf ' SQL SERVER: 127.0.0.1:%s (Podman)\n' "$DB_PORT"
printf ' Registros:  %s\n' "$LOGS"
printf ' Detener la API: Ctrl+C\n'
printf '===========================================\n\n'

wait "$API_PID" || true
msg "Se cerró la Web API. Revise los registros en $LOGS."
