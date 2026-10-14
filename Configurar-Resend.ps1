# Configurar notificaciones REALES con Resend, SIN modificar Gmail.
# Registro en Resend: https://resend.com/signup
# Crear clave "Sending access" en: https://resend.com/api-keys
# Para pruebas sin dominio verificado, Gmail DEBE ser el mismo email usado en Resend.
$ErrorActionPreference = 'Stop'
$apiProject = Join-Path $PSScriptRoot '4. Frameworks And Drivers\UI\NorthWind.Sales.WebApi\NorthWind.Sales.WebApi.csproj'

if (-not (Get-Command dotnet -ErrorAction SilentlyContinue)) {
    throw 'No se encontro dotnet. Instale el SDK .NET 8.'
}
if (-not (Test-Path -LiteralPath $apiProject)) {
    throw "No se encontro la Web API: $apiProject"
}

Write-Host ''
Write-Host 'NORTHWIND - ENVIO A GMAIL SIN CONFIGURAR GMAIL' -ForegroundColor Cyan
Write-Host 'Gmail es solo el DESTINATARIO. Resend se encarga de enviar el mensaje.'
Write-Host 'Primero cree una cuenta GRATUITA en https://resend.com/signup con el Gmail receptor.'
Write-Host 'Despues cree una API Key de solo envio en https://resend.com/api-keys'
Write-Host ''

$destination = (Read-Host 'Direccion Gmail que recibira las notificaciones (misma de tu cuenta Resend)').Trim()
if ($destination -notmatch '^[^\s@]+@gmail\.com$') {
    throw 'Para esta guia introduzca una direccion @gmail.com valida.'
}

Write-Host 'Para enviar a tu propio Gmail NO necesitas un dominio: usa onboarding@resend.dev.'
$sender = (Read-Host 'Remitente (ENTER para onboarding@resend.dev)').Trim()
if ([string]::IsNullOrWhiteSpace($sender)) { $sender = 'onboarding@resend.dev' }
if ($sender -notmatch '^[^\s@]+@[^\s@]+\.[^\s@]+$') {
    throw 'Remitente no valido.'
}
if ($sender -ne 'onboarding@resend.dev') {
    Write-Host 'AVISO: Para utilizar otro remitente, debes verificar que su dominio sea de tu propiedad en Resend.' -ForegroundColor Yellow
}

$secureToken = Read-Host 'Resend API Key de permiso Sending access (no es tu contrasena Gmail)' -AsSecureString
$bstr = [IntPtr]::Zero
$token = $null
try {
    $bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureToken)
    $token = [System.Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
    if ([string]::IsNullOrWhiteSpace($token) -or -not $token.StartsWith('re_')) {
        throw 'La clave no tiene el formato esperado de Resend (re_...).'
    }

    # No se incluye la API key en el codigo, ni en appsettings.json, ni en GitHub.
    # dotnet user-secrets lee la configuracion por stdin y guarda fuera del repositorio.
    $configuration = @{
        SmtpOptions = @{
            SmtpHost           = 'smtp.resend.com'
            SmtpHostPort       = 587
            SmtpUserName       = 'resend'
            SmtpPassword       = $token
            SenderEmail        = $sender
            AdministratorEmail = $destination
        }
    }
    $configuration | ConvertTo-Json -Depth 5 -Compress | dotnet user-secrets set --project "$apiProject"
    if ($LASTEXITCODE -ne 0) {
        throw 'No se pudo guardar la configuracion de Resend en .NET User Secrets.'
    }
}
finally {
    if ($bstr -ne [IntPtr]::Zero) {
        [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
    }
    $token = $null
    $secureToken = $null
}

Write-Host ''
Write-Host 'Configuracion de envio guardada correctamente.' -ForegroundColor Green
Write-Host "Gmail receptor: $destination"
Write-Host "Remitente: $sender"
Write-Host 'Envio: smtp.resend.com:587 STARTTLS'
Write-Host 'NO se modifico tu cuenta Gmail.' -ForegroundColor Green
Write-Host 'Reinicia la API y crea una orden con 4 productos distintos.' -ForegroundColor Yellow
