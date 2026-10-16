# NorthWind individual — actualización a .NET 10 para Fedora Workstation 44

## Modificaciones

- 31 proyectos `.csproj`: `net8.0` → `net10.0`.
- Paquetes Microsoft relacionados con ASP.NET Core, Entity Framework Core y Extensions: `10.0.13`.
- `Microsoft.IdentityModel.JsonWebTokens`: `8.22.0` para alineación con JWT Bearer 10.
- Swagger/Swashbuckle y FluentValidation: se conservan para evitar cambios de API innecesarios.
- `global.json`: SDK `10.0.100`, con avance a versiones de características posteriores de .NET 10 (`latestFeature`).
- El cliente Blazor WebAssembly configura `WasmApplicationEnvironmentName` como `Development` solo con la compilación `Debug`; el valor de publicación `Release` mantiene el comportamiento predeterminado de producción.
- Scripts de Fedora: instalación del SDK .NET 10 y comprobación de los 31 proyectos.
- Se conservan la base SQL Server 2022 Podman, las tres bases de datos, la autenticación, las órdenes, el PDF y Resend.

## Instalación y verificación en Fedora 44

```bash
sudo dnf upgrade --refresh -y
chmod +x Fedora44/*.sh
./Fedora44/01_verificar_fedora.sh
./Fedora44/02_instalar_dependencias.sh
dotnet --list-sdks
./Fedora44/10_verificar_net10.sh
dotnet restore NorthWind.sln
dotnet build NorthWind.sln
```

Si usa una copia anterior con contenedor y bases ya configurados, **no borre los volúmenes SQL**. Para una instalación nueva, continúe con `Fedora44/03_iniciar_sqlserver.sh`, `04_crear_bases.sh`, `05_configurar_api.sh` y, opcionalmente, `06_configurar_resend.sh`.

Inicie API y Blazor en dos terminales:

```bash
./Fedora44/07_ejecutar_api.sh
./Fedora44/08_ejecutar_blazor.sh
```

API: http://127.0.0.1:5254/swagger
Blazor: http://127.0.0.1:5255

## Entrega en la rama

Usar `feature-NorthWind-Fedora-Blazor`; no fusionar con `main` si esta contiene Astro.

```bash
git branch --show-current
git add -A
git diff --cached --stat
git commit -m "feat: actualizar NorthWind Blazor a .NET 10 en Fedora 44"
git push -u origin feature-NorthWind-Fedora-Blazor
```

## Evidencias reales

- `cat /etc/fedora-release` (Fedora Workstation 44)
- `dotnet --version` y `dotnet --list-sdks` (10.x)
- `./Fedora44/10_verificar_net10.sh` (31 proyectos `net10.0`)
- `dotnet build NorthWind.sln` (sin errores)
- `podman ps` (SQL Server ejecutándose)
- Inicio de sesión en Blazor, consulta de clientes y productos, orden y PDF; Gmail si Resend configurado

## Alcance

Los archivos se han migrado y verificado estáticamente. La compilación, el arranque de los servicios y las pruebas contra SQL Server deben comprobarse en Fedora 44, porque el entorno de preparación no dispone del SDK de .NET ni del servidor SQL local.
