#!/usr/bin/env bash
set -Eeuo pipefail
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/lib.sh"
[[ -f /etc/fedora-release ]] || fail 'Este arranque está preparado para Fedora Workstation 44.'
"$FEDORA_DIR/instalar-dependencias.sh"
"$FEDORA_DIR/preparar-base-datos.sh"
cargar_config

API_PROJECT="$BASE/4. Frameworks And Drivers/UI/NorthWind.Sales.WebApi/NorthWind.Sales.WebApi.csproj"
FRONT_PROJECT="$BASE/4. Frameworks And Drivers/UIs/NorthWind.Sales.BlazorClient/NorthWind.Sales.BlazorClient.csproj"
LOGS="$FEDORA_DIR/logs"
mkdir -p "$LOGS"

msg 'Compilando NorthWind (.NET 10, API y Blazor).'
if ! dotnet build "$BASE/NorthWind.sln" --nologo >"$LOGS/build.log" 2>&1; then
  tail -n 100 "$LOGS/build.log" >&2
  fail "Falló la compilación. Registro completo: $LOGS/build.log"
fi

API_PID=''
CLIENT_PID=''
cerrar(){
  # Detener solo aplicaciones iniciadas aquí; NO eliminar SQL Server ni datos.
  [[ -z "$API_PID" ]] || kill "$API_PID" 2>/dev/null || true
  [[ -z "$CLIENT_PID" ]] || kill "$CLIENT_PID" 2>/dev/null || true
  wait 2>/dev/null || true
}
trap cerrar EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

msg 'Iniciando API en http://127.0.0.1:5254'
(
  export DBOptions__ConnectionString="$(crear_conexion NorthWindDB)"
  export DBOptions__DomainLogsConnectionString="$(crear_conexion NorthWindLogsDB)"
  export MembershipDBOptions__ConnectionString="$(crear_conexion NorthWindUsersDB)"
  export JwtOptions__SecurityKey="$JWT_SECURITY_KEY"
  # El correo real solo se habilita cuando el usuario añade su propia clave Resend.
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
) >"$LOGS/api.log" 2>&1 &
API_PID=$!

api_ok=0
for _ in $(seq 1 60); do
  if curl -fsS --connect-timeout 2 http://127.0.0.1:5254/swagger/index.html -o /dev/null 2>/dev/null; then
    api_ok=1;break
  fi
  if ! kill -0 "$API_PID" 2>/dev/null; then break; fi
  sleep 1
done
if [[ "$api_ok" -ne 1 ]]; then
  tail -n 90 "$LOGS/api.log" >&2
  fail "La Web API no inició correctamente. Consulte $LOGS/api.log"
fi

msg 'Iniciando Blazor en http://127.0.0.1:5255'
(
  export ASPNETCORE_ENVIRONMENT=Development
  exec dotnet run --project "$FRONT_PROJECT" --no-build --launch-profile fedora
) >"$LOGS/blazor.log" 2>&1 &
CLIENT_PID=$!
front_ok=0
for _ in $(seq 1 60); do
  if curl -fsS --connect-timeout 2 http://127.0.0.1:5255/ -o /dev/null 2>/dev/null; then
    front_ok=1;break
  fi
  if ! kill -0 "$CLIENT_PID" 2>/dev/null; then break; fi
  sleep 1
done
if [[ "$front_ok" -ne 1 ]]; then
  tail -n 90 "$LOGS/blazor.log" >&2
  fail "Blazor no inició correctamente. Consulte $LOGS/blazor.log"
fi

# Verificación integrada: autenticación real y consultas de las tres vistas.
# No modifica registros ni crea órdenes durante la comprobación.
if ! "$FEDORA_DIR/probar-sistema.sh" >"$LOGS/prueba-funcional.log" 2>&1; then
  tail -n 80 "$LOGS/prueba-funcional.log" >&2
  fail "La API respondió pero falló una prueba funcional. Consulte $LOGS/prueba-funcional.log"
fi

printf '\n===========================================\n'
printf ' NorthWind para Fedora 44: servicios activos\n'
printf ' APLICACION: http://127.0.0.1:5255\n'
printf ' SWAGGER:    http://127.0.0.1:5254/swagger\n'
printf ' SQL SERVER: 127.0.0.1:%s (Podman)\n' "$DB_PORT"
printf ' Registros:  %s\n' "$LOGS"
printf ' Detener API y Blazor: Ctrl+C\n'
printf '===========================================\n\n'

# Si alguno falla en ejecución, limpiar los dos procesos. La base conserva los datos.
wait -n "$API_PID" "$CLIENT_PID" || true
msg "Se cerró un servidor. Revise los registros en $LOGS."
