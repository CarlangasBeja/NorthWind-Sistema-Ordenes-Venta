# Migración .NET 8 → .NET 10 — NorthWind para Fedora 44

## Componentes migrados

- Los **31 proyectos** `*.csproj` se compilan con `net10.0`.
- Paquetes Microsoft.AspNetCore y Microsoft.Extensions versión **10.0.11**.
- Entity Framework Core (`SqlServer`, `Tools`, `Design`) versión **10.0.11**.
- Microsoft.IdentityModel.JsonWebTokens actualizado a **8.23.0**.
- Las dependencias externas `FluentValidation 11.9.0` y `Swashbuckle.AspNetCore 6.5.0` se conservan porque su actualización mayor podría cambiar APIs y requiere validación separada.
- `global.json` impide usar por accidente SDK .NET 8/9 y permite parches de .NET 10.
- Fedora instala `dotnet-sdk-10.0` desde los repositorios DNF oficiales.
- Se conservan los scripts SQL, SQL Server 2022 en Podman y `Fedora/.env` de desarrollo, Blazor WebAssembly, API y autenticación JWT.

## Cómo iniciar

1. Extraer ZIP en Fedora Workstation 44 (64-bit x86_64).
2. Abrir terminal en la carpeta del proyecto (donde está `NorthWind.sln`).
3. Ejecutar `bash ./INICIAR_FEDORA44.sh`.
4. Ingresar a `http://127.0.0.1:5255` y Swagger `http://127.0.0.1:5254/swagger`.

## Pruebas técnicas

Con internet y el SDK instalado, ejecutar:

```bash
bash fedora/comprobar-net10.sh
bash fedora/verificar.sh
```

La primera verificación compila los 31 proyectos, la segunda comprueba acceso a datos y disponibilidad de servicios (ejecutar mientras corre la app). Los archivos `fedora/logs/` ayudan a diagnosticar problemas de NuGet, SQL Server y autenticación.

## Lo que no se puede garantizar sin ejecutar en Fedora

Este ZIP incluye validaciones estáticas de proyectos, referencias, sintaxis de scripts y estructura, pero el entorno donde se preparó no dispone de `dotnet`, acceso a NuGet o Podman/SQL Server ejecutándose; por tanto, la compilación, login, operaciones CRUD y conexiones reales requieren la ejecución en tu Fedora 44. No considerar el proyecto "probado de extremo a extremo" hasta completar esas pruebas. Los datos de ventas existentes en Windows no se transfieren sin respaldo.
