#!/usr/bin/env bash
set -Eeuo pipefail
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/lib.sh"
generar_config
cargar_config

printf '\n=== Configurar correo REAL (Resend SMTP) en Fedora ===\n'
read -r -p 'Correo remitente verificado en Resend: ' remitente
read -r -p 'Correo del administrador que recibirá los avisos: ' administrador
read -r -s -p 'Clave SMTP/API Key de Resend (no se muestra): ' token
printf '\n'
[[ "$remitente" == *@*.* && "$administrador" == *@*.* && -n "$token" ]] || fail 'Complete los dos correos y la clave Resend.'

umask 077
temporal="$(mktemp "$FEDORA_DIR/.env.tmp.XXXXXXXX")"
trap 'rm -f "$temporal"' EXIT
# Evitar entradas duplicadas al volver a configurar el correo.
grep -vE '^(RESEND_API_KEY|RESEND_SENDER_EMAIL|RESEND_ADMIN_EMAIL)=' "$ENV_FILE" > "$temporal" || true
{
  printf '\n# Correo externo Resend para avisos de ordenes especiales.\n'
  printf 'RESEND_API_KEY=%q\n' "$token"
  printf 'RESEND_SENDER_EMAIL=%q\n' "$remitente"
  printf 'RESEND_ADMIN_EMAIL=%q\n' "$administrador"
} >> "$temporal"
chmod 600 "$temporal"
mv -f "$temporal" "$ENV_FILE"
trap - EXIT
msg 'Configuración SMTP almacenada localmente con permisos 600. Reinicie: bash INICIAR_FEDORA44.sh.'
