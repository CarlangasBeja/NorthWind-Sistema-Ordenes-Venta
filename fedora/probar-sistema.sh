#!/usr/bin/env bash
set -Eeuo pipefail
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/lib.sh"
command -v python3 >/dev/null 2>&1 || fail 'Python 3 no está instalado.'
BASE_API='http://127.0.0.1:5254'
TEMP="$(mktemp -d)"
trap 'rm -rf "$TEMP"' EXIT

msg 'Probando inicio de sesión con el usuario de demostración almacenado en SQL Server.'
if ! curl -fSs --max-time 15 -H 'Content-Type: application/json' \
  --data '{"email":"msanders@northwind.com","password":"Mm1234567$"}' \
  "$BASE_API/user/Login" -o "$TEMP/login.json"; then
  fail 'No se pudo iniciar sesión. Revisar SQL UsersDB y fedora/logs/api.log.'
fi
TOKEN="$(python3 - "$TEMP/login.json" <<'PY'
import json,sys
try:
  response=json.load(open(sys.argv[1],encoding='utf-8'))
  print(response.get('accessToken',''))
except Exception:
  sys.exit(1)
PY
)"
[[ "$TOKEN" == *.*.* ]] || fail 'El login no generó un token JWT válido.'
msg 'JWT recibido correctamente. Probando consultas reales de SQL Server.'
for section in customers products orders; do
  if ! curl -fSs --max-time 15 -H "Authorization: Bearer $TOKEN" \
      "$BASE_API/api/$section/search?page=1&pageSize=10" -o "$TEMP/$section.json"; then
    fail "No funcionó /api/$section/search (consulte fedora/logs/api.log)."
  fi
  python3 - "$TEMP/$section.json" "$section" <<'PY'
import json,sys
try:
  response=json.load(open(sys.argv[1],encoding='utf-8'))
  assert isinstance(response.get('items'),list), 'No hay lista de resultados'
  assert isinstance(response.get('totalItems'),int), 'No hay total de resultados'
  print(f"[OK] {sys.argv[2]}: {response['totalItems']} registros")
except Exception as e:
  sys.exit(f"Respuesta incorrecta para {sys.argv[2]}: {e}")
PY
done
msg 'Login JWT y endpoints de clientes/productos/órdenes probados contra la base real.'
