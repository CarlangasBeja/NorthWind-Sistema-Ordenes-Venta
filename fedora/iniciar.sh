#!/usr/bin/env bash
# Arranque completo en Fedora 44: dependencias, SQL Server (Podman), API .NET 8 y Astro.
set -Eeuo pipefail
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/lib.sh"
[[ -f /etc/fedora-release ]] || fail 'Este arranque está preparado para Fedora 44.'

bash "$FEDORA_DIR/instalar-dependencias.sh"
bash "$FEDORA_DIR/preparar-base-datos.sh"
cargar_config
mkdir -p "$LOGS"

msg 'Compilando la API (NorthWind.sln, .NET 8).'
if ! dotnet build "$BASE/NorthWind.sln" --nologo >"$LOGS/build.log" 2>&1; then
  tail -n 100 "$LOGS/build.log" >&2
  fail "Falló la compilación. Registro completo: $LOGS/build.log"
fi

if [[ ! -d "$FRONT_DIR/node_modules" ]]; then
  msg 'Instalando dependencias de Astro (npm ci, solo la primera vez).'
  ( cd "$FRONT_DIR" && npm ci --no-audit --no-fund ) >"$LOGS/npm-install.log" 2>&1 \
    || { tail -n 60 "$LOGS/npm-install.log" >&2; fail "Falló npm ci. Registro: $LOGS/npm-install.log"; }
fi

API_PID=''
FRONT_PID=''
cerrar(){
  # Detiene solo la API y Astro iniciados aquí; SQL Server y sus datos se conservan.
  [[ -z "$API_PID" ]] || kill "$API_PID" 2>/dev/null || true
  [[ -z "$FRONT_PID" ]] || kill "$FRONT_PID" 2>/dev/null || true
  wait 2>/dev/null || true
}
trap cerrar EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

msg "Iniciando API en $API_URL"
(
  exportar_config_api
  exec dotnet run --project "$API_PROJECT" --no-build --launch-profile fedora
) >"$LOGS/api.log" 2>&1 &
API_PID=$!

api_ok=0
for _ in $(seq 1 60); do
  if curl -fsS --connect-timeout 2 "$API_URL/swagger/index.html" -o /dev/null 2>/dev/null; then api_ok=1; break; fi
  kill -0 "$API_PID" 2>/dev/null || break
  sleep 1
done
if [[ "$api_ok" -ne 1 ]]; then
  tail -n 90 "$LOGS/api.log" >&2
  fail "La API no inició correctamente. Consulte $LOGS/api.log"
fi

msg "Iniciando Astro en $FRONT_URL"
(
  cd "$FRONT_DIR"
  # Astro/Vite da prioridad a esta variable sobre Frontend-Astro/.env (que en Windows apunta a HTTPS).
  export PUBLIC_API_URL="$API_URL"
  exec npm run dev
) >"$LOGS/astro.log" 2>&1 &
FRONT_PID=$!

front_ok=0
for _ in $(seq 1 90); do
  if curl -fsS --connect-timeout 2 "$FRONT_URL/login" -o /dev/null 2>/dev/null; then front_ok=1; break; fi
  kill -0 "$FRONT_PID" 2>/dev/null || break
  sleep 1
done
if [[ "$front_ok" -ne 1 ]]; then
  tail -n 90 "$LOGS/astro.log" >&2
  fail "Astro no inició correctamente. Consulte $LOGS/astro.log"
fi

# Prueba real: login JWT y búsquedas de clientes, productos y órdenes (no modifica datos).
if ! bash "$FEDORA_DIR/probar-sistema.sh" >"$LOGS/prueba-funcional.log" 2>&1; then
  tail -n 80 "$LOGS/prueba-funcional.log" >&2
  fail "La API respondió pero falló una prueba funcional. Consulte $LOGS/prueba-funcional.log"
fi

printf '\n===========================================\n'
printf ' NorthWind (Astro) en Fedora 44: activo\n'
printf ' APLICACION: %s/login\n' "$FRONT_URL"
printf ' SWAGGER:    %s/swagger\n' "$API_URL"
printf ' SQL SERVER: 127.0.0.1:%s (Podman)\n' "$DB_PORT"
printf ' Usuario demo: msanders@northwind.com / Mm1234567$\n'
printf ' Registros:  %s\n' "$LOGS"
printf ' Detener API y Astro: Ctrl+C\n'
printf '===========================================\n\n'

wait -n "$API_PID" "$FRONT_PID" || true
msg "Se cerró uno de los servidores. Revise los registros en $LOGS."
