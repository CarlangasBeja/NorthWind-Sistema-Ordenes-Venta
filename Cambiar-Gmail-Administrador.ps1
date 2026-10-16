# Cambia SOLO la direccion del administrador en .NET User Secrets.
# No toca Gmail, no solicita el token Resend y no modifica appsettings.json.
$ErrorActionPreference = 'Stop'
$apiProject = Join-Path $PSScriptRoot '4. Frameworks And Drivers\UI\NorthWind.Sales.WebApi\NorthWind.Sales.WebApi.csproj'

if (-not (Get-Command dotnet -ErrorAction SilentlyContinue)) {
    throw 'No se encontro dotnet. Es necesario el SDK de .NET 10.'
}
if (-not (Test-Path -LiteralPath $apiProject)) {
    throw "No se encontro el proyecto de la API: $apiProject"
}

Write-Host ''
Write-Host 'NORTHWIND - CAMBIAR GMAIL DEL ADMINISTRADOR' -ForegroundColor Cyan
Write-Host 'Este correo recibira de forma automatica las alertas por ordenes especiales.'
Write-Host 'No se realiza ningun cambio en tu cuenta de Gmail.'

$recipient = (Read-Host 'Gmail real del administrador').Trim()
if ($recipient -notmatch '^[^\s@]+@gmail\.com$') {
    throw 'Introduce una direccion valida que termine en @gmail.com.'
}

dotnet user-secrets set 'SmtpOptions:AdministratorEmail' "$recipient" --project "$apiProject"
if ($LASTEXITCODE -ne 0) {
    throw 'No se pudo guardar el destinatario en User Secrets.'
}

Write-Host ''
Write-Host "Destinatario guardado: $recipient" -ForegroundColor Green
Write-Host 'Si es la primera vez, aun debes ejecutar Configurar-Resend.ps1 para configurar el proveedor de envio.' -ForegroundColor Yellow
Write-Host 'IMPORTANTE: onboarding@resend.dev solo envia al correo registrado en tu cuenta Resend.' -ForegroundColor Yellow
Write-Host 'Si usas otro Gmail, deberas verificar un dominio remitente propio en Resend.' -ForegroundColor Yellow
Write-Host 'Reinicia el backend antes de probar una orden con 4 productos distintos.'
