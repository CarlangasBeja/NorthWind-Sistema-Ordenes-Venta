#!/usr/bin/env bash
set -Eeuo pipefail
BASE="$(cd "$(dirname "$0")/.." && pwd)"
API="$BASE/4. Frameworks And Drivers/UI/NorthWind.Sales.WebApi/NorthWind.Sales.WebApi.csproj"
echo 'Gmail no necesita modificarse. Resend enviará los correos desde el servidor.'
read -r -p 'Gmail del administrador (destino): ' ADMIN
read -r -p 'Correo remitente verificado (Enter = onboarding@resend.dev): ' SENDER
SENDER="${SENDER:-onboarding@resend.dev}"
read -r -s -p 'API Key de Resend: ' RESEND_KEY; echo
[[ "$ADMIN" == *'@'* && "$SENDER" == *'@'* && "$RESEND_KEY" == re_* ]] || {
 echo 'Verifique el Gmail, remitente y API Key re_... .' >&2; exit 1;
}
for kv in \
 'SmtpOptions:SmtpHost|smtp.resend.com' \
 'SmtpOptions:SmtpHostPort|587' \
 'SmtpOptions:SmtpUserName|resend' \
 "SmtpOptions:SenderEmail|$SENDER" \
 "SmtpOptions:AdministratorEmail|$ADMIN" \
 "SmtpOptions:SmtpPassword|$RESEND_KEY"; do
 dotnet user-secrets set "${kv%%|*}" "${kv#*|}" --project "$API" >/dev/null
 done
unset RESEND_KEY
printf '\nResend configurado para desarrollo en Fedora. No se ha enviado ningún correo todavía.\n'
printf 'Nota: onboarding@resend.dev sólo puede enviar a la dirección asociada a la cuenta Resend.\n'
