# Configuración local de NorthWind (no guarda secretos en GitHub).
$ErrorActionPreference = 'Stop'
$apiProject = Join-Path $PSScriptRoot '4. Frameworks And Drivers\UI\NorthWind.Sales.WebApi\NorthWind.Sales.WebApi.csproj'

if (-not (Get-Command dotnet -ErrorAction SilentlyContinue)) {
    throw 'No se encontró dotnet. Instale el SDK de .NET 10 y abra una terminal nueva.'
}
if (-not (Test-Path -LiteralPath $apiProject)) {
    throw "No se encontró el proyecto Web API: $apiProject"
}

# Clave JWT criptográficamente aleatoria (se conserva en el almacén User Secrets de .NET).
$keyBytes = New-Object byte[] 48
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
try { $rng.GetBytes($keyBytes) }
finally { $rng.Dispose() }
$key = [Convert]::ToBase64String($keyBytes)

dotnet user-secrets set 'JwtOptions:SecurityKey' "$key" --project "$apiProject"
if ($LASTEXITCODE -ne 0) { throw 'No se pudo configurar JwtOptions:SecurityKey.' }

Write-Host 'Clave JWT de desarrollo configurada en User Secrets.' -ForegroundColor Green
Write-Host 'No se guardó esta clave dentro del repositorio.' -ForegroundColor DarkGray
Write-Host 'Para activar el correo REAL sin cambiar Gmail, ejecute Configurar-Resend.ps1 y consulte GUIA_RESEND_SIN_CAMBIOS_GMAIL.md.' -ForegroundColor Yellow
