# Elimina exclusivamente directorios del frontend antiguo (no toca el backend).
# Ejecutar desde la raiz del proyecto NorthWind DESPUES de copiar los nuevos .sln.
$ErrorActionPreference = 'Stop'
$raiz = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not (Test-Path -LiteralPath (Join-Path $raiz 'NorthWind.sln'))) { throw 'No se encuentra NorthWind.sln en la carpeta del script.' }
if (-not (Test-Path -LiteralPath (Join-Path $raiz 'Frontend-Astro\package.json'))) { throw 'No se encuentra Frontend-Astro. Primero copie el nuevo paquete completo.' }
$carpetas = @(
    '1. Enterprise Business Rules\NorthWind.HttpDelegatingHandlers',
    '2. Application Business Rules\NorthWind.Sales.Frontend.BusinessObjects',
    '3. Interface Adapters\Gateways\WebApiGateways\NorthWind.Sales.Frontend.WebApiGateways',
    '3. Interface Adapters\Views\NorthWind.RazorComponents',
    '3. Interface Adapters\Views\NorthWind.Sales.Frontend.Views',
    '4. Frameworks And Drivers\IoC\NorthWind.Sales.Frontend.IoC',
    '4. Frameworks And Drivers\UIs\NorthWind.Sales.BlazorClient',
    'NorthWind.Membership.Frontend.RazorViews'
)
foreach ($rel in $carpetas) {
    $abs = Join-Path $raiz $rel
    if (Test-Path -LiteralPath $abs) {
        Remove-Item -LiteralPath $abs -Recurse -Force
        Write-Host "Eliminado: $rel"
    }
}
Write-Host 'Limpieza terminada. Verifique git status y compile NorthWind.sln.'
