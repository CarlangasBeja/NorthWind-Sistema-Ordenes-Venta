$ErrorActionPreference = "Stop"

Write-Host "NorthWind final validation" -ForegroundColor Cyan
Write-Host "1/4 Checking .NET SDK..."
dotnet --version

Write-Host "2/4 Restoring solution..."
dotnet restore .\NorthWind.sln

Write-Host "3/4 Building solution..."
dotnet build .\NorthWind.sln --no-restore

Write-Host "4/4 Checking required frontend and REST files..."
$requiredFiles = @(
    ".\3. Interface Adapters\Views\NorthWind.Sales.Frontend.Views\Components\CustomerSearchModal.razor",
    ".\3. Interface Adapters\Views\NorthWind.Sales.Frontend.Views\Components\ProductSearchModal.razor",
    ".\3. Interface Adapters\Views\NorthWind.Sales.Frontend.Views\Pages\InvoiceSearch.razor",
    ".\3. Interface Adapters\Controllers\NorthWind.Sales.Backend.Controllers\Queries\SalesQueriesController.cs"
)

foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) {
        throw "Required file is missing: $file"
    }
}

Write-Host "Validation completed successfully." -ForegroundColor Green
Write-Host "API: https://localhost:7154/swagger"
Write-Host "Blazor: https://localhost:7254"
