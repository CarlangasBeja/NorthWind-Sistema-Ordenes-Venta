# NorthWind — Sistema de órdenes de venta

> **Prácticas 9 y 11 — aviso automático y transacción:** el proyecto envía notificaciones mediante Resend SMTP cuando una orden tiene **4 o más productos distintos**. Gmail únicamente recibe el aviso, sin formularios de correo para los usuarios. Ver [GUIA_RESEND_SIN_CAMBIOS_GMAIL.md](GUIA_RESEND_SIN_CAMBIOS_GMAIL.md) y ejecutar `Configurar-Resend.ps1` para guardar la API key de Resend fuera del repositorio.


Proyecto académico en **.NET 10**, ASP.NET Core Web API, **Blazor WebAssembly** y **SQL Server**, organizado por capas con enfoque de Clean Architecture. Esta versión reúne el código de NorthWind y los scripts de las **tres bases SQL** para que el repositorio de GitHub se pueda clonar y configurar en otro equipo.

## Funcionalidades incluidas

- Inicio de sesión y registro mediante ASP.NET Core Identity y JWT.
- Registro de órdenes de venta con validación de cliente, productos y existencias.
- Búsqueda de clientes, productos y órdenes con filtros; consulta del detalle y generación de PDF.
- Interfaz en español, adaptable a móviles, con tema claro/oscuro y mensajes de validación.
- Confirmación al crear una orden y acceso a su detalle desde **Ver orden**.
- Registro de eventos de dominio en una base separada.
- **Prácticas 9 y 11: notificación REAL a Gmail** por SMTP con STARTTLS para órdenes con **4 o más productos diferentes**. Si falla SMTP, la transacción de la orden se revierte. Correo HTML con resumen de la orden, destinatario administrador y auditoría del envío.

> **Alcance de los roles:** la versión recibida emite JWT con nombre y nombre completo, **sin claims de rol**. No debe suponerse que una diferencia visual entre usuario y administrador represente autorización segura en el backend; ese control requeriría una implementación adicional. Esta entrega organiza y documenta el código recibido; no implementa un sistema nuevo de roles.

## Tecnologías y estructura

```text
NorthWind/
├── 1. Enterprise Business Rules/      # Entidades, validaciones y contratos de dominio
├── 2. Application Business Rules/     # Casos de uso y lógica de aplicación
├── 3. Interface Adapters/             # Controladores, presentadores y vistas
├── 4. Frameworks And Drivers/        # EF Core, API, IoC y cliente Blazor
├── NorthWind.Membership.*             # Módulos de autenticación/Identity
├── BaseDeDatos/                       # SQL y guía de las 3 bases
├── Documentacion/                     # Material de apoyo existente
├── Configurar-Desarrollo.ps1          # Crea un secreto JWT local fuera del repo
├── Configurar-Resend.ps1              # Configura Resend sin cambiar Gmail ni publicar tokens
├── GUIA_RESEND_SIN_CAMBIOS_GMAIL.md  # Configuración y pruebas del correo real
├── NorthWind.sln                      # Solución principal
├── NorthWind.Membership.sln           # Solución de autenticación
├── Validate-Final.ps1                 # Validación existente del proyecto
├── .gitignore
└── README.md
```

### Bases de datos

| Base | Propósito | Tablas relevantes |
|---|---|---|
| `NorthWindDB` | Ventas y catálogo | `Customers`, `Products`, `Orders`, `OrderDetails` |
| `NorthWindLogsDB` | Auditoría de dominio | `DomainLogs` |
| `NorthWindUsersDB` | Usuarios e identidad | `AspNetUsers`, `AspNetRoles` y tablas relacionadas |

Para crear las tres bases, ejecute en SQL Server LocalDB `BaseDeDatos/00_Crear_Todo_NorthWind.sql` y, después, `BaseDeDatos/04_Verificar_Bases.sql`. La [guía detallada](BaseDeDatos/README.md) explica también la instalación archivo por archivo.

## Requisitos

- Windows 10/11 y Visual Studio Community con desarrollo web ASP.NET y componentes de SQL Server, o las herramientas equivalentes.
- SDK **.NET 10**.
- SQL Server Express LocalDB en Windows (servidor `(localdb)\MSSQLLocalDB`) o SQL Server 2022 en Podman para Fedora.
- Acceso a Internet en la primera restauración de paquetes NuGet.
- Navegador moderno para el cliente Blazor WebAssembly.

## Fedora Workstation 44 (.NET 10 y Blazor individual)

Para la entrega individual en **Fedora Workstation 44**, use [Fedora44/README.md](Fedora44/README.md). Instale `dotnet-sdk-10.0`, Podman y ejecute los scripts `Fedora44/01_...` a `Fedora44/08_...`. Las tres bases se alojan en SQL Server 2022 dentro de Podman, porque SQL Server LocalDB no funciona en Linux. Ejecute también `./Fedora44/10_verificar_net10.sh` para comprobar el target de todos los proyectos.

Las instrucciones siguientes describen el escenario **Windows opcional** (LocalDB); no sustituyen la ejecución y las evidencias en Fedora exigidas por el docente.

## Puesta en marcha paso a paso (Windows opcional)

1. Descargue y descomprima el repositorio, o clónelo con Git.
2. Abra Visual Studio, conéctese en **SQL Server Object Explorer** a `(localdb)\MSSQLLocalDB`, y ejecute `BaseDeDatos/00_Crear_Todo_NorthWind.sql`.
3. Ejecute `BaseDeDatos/04_Verificar_Bases.sql`. Debe devolver las tres bases y los registros de demostración.
4. Abra **PowerShell** desde la raíz del proyecto y genere una **clave JWT local** (no se publica en GitHub):

   ```powershell
   powershell -ExecutionPolicy Bypass -File .\Configurar-Desarrollo.ps1
   ```

   Esto guarda `JwtOptions:SecurityKey` mediante **.NET User Secrets** del proyecto Web API. La opción `UserSecretsId` se incluye en el archivo `.csproj` para que la configuración se cargue cuando el entorno sea `Development`.

5. Restaure y compile la solución:

   ```powershell
   dotnet restore .\NorthWind.sln
   dotnet build .\NorthWind.sln
   ```

6. Inicie la API en una terminal:

   ```powershell
   dotnet run --project '.\4. Frameworks And Drivers\UI\NorthWind.Sales.WebApi\NorthWind.Sales.WebApi.csproj' --launch-profile https
   ```

   Swagger: **https://localhost:7154/swagger**

7. Inicie el cliente Blazor en **otra** terminal:

   ```powershell
   dotnet run --project '.\4. Frameworks And Drivers\UIs\NorthWind.Sales.BlazorClient\NorthWind.Sales.BlazorClient.csproj' --launch-profile https
   ```

   Interfaz: **https://localhost:7254**

8. Inicie sesión con la cuenta de demostración definida en `BaseDeDatos/03_NorthWindUsersDB.sql`, o registre una cuenta nueva. Cree una orden de prueba y compruebe su detalle, el PDF y los registros de `NorthWindLogsDB`.

**Nota sobre HTTPS:** en una instalación nueva de .NET podría necesitar ejecutar `dotnet dev-certs https --trust` para confiar en el certificado local de desarrollo.

## Configuración y seguridad

La API usa:

- `DBOptions:ConnectionString` → `NorthWindDB`.
- `DBOptions:DomainLogsConnectionString` → `NorthWindLogsDB`.
- `MembershipDBOptions:ConnectionString` → `NorthWindUsersDB`.
- `JwtOptions:SecurityKey` → se establece **solo localmente** con `Configurar-Desarrollo.ps1`.
- `SmtpOptions:SmtpUserName` y `SmtpOptions:SmtpPassword` → **vacíos en GitHub**: para habilitar las alertas reales a Gmail consulte [GUIA_RESEND_SIN_CAMBIOS_GMAIL.md](GUIA_RESEND_SIN_CAMBIOS_GMAIL.md). La configuración usa `smtp.resend.com` en el puerto `587`, con TLS y una API key de Resend (no Gmail).

La configuración pública incluye las tres conexiones **locales**, pero ninguna contraseña SMTP ni clave JWT válida. Para habilitar el correo real, ejecuta el asistente en la raíz del proyecto:

```powershell
powershell -ExecutionPolicy Bypass -File .\Configurar-Resend.ps1
```

Solo durante la instalación, el administrador técnico indica el Gmail fijo del destinatario y la API key de Resend; se guarda la configuración en **User Secrets**, fuera de GitHub. Consulta la [guía de Resend y pruebas de la práctica 9](GUIA_RESEND_SIN_CAMBIOS_GMAIL.md). En entornos no `Development`, use variables de entorno o un administrador de secretos del servidor; **User Secrets no es un almacén de producción**.

**Seguridad de la demostración:** los scripts originales incluyen una cuenta precargada de práctica (su hash y credenciales se publican con el SQL). Es adecuada únicamente para pruebas locales; elimínela o cámbiela antes de exponer el servicio en Internet. **Las credenciales SMTP del ZIP original fueron retiradas de la versión GitHub; si estaban activas, rótelas.**

## Comprobaciones rápidas

```powershell
powershell -ExecutionPolicy Bypass -File .\Validate-Final.ps1
git status
```

Pruebe además:

1. Abrir Swagger e iniciar sesión en Blazor.
2. Consultar clientes y productos mediante sus filtros.
3. Crear una orden con stock disponible y comprobar el modal de confirmación.
4. Pulsar **Ver orden** y comprobar el PDF.
5. Ejecutar `BaseDeDatos/04_Verificar_Bases.sql` y verificar que se almacenaron la orden, sus detalles y los eventos generados.
6. **Práctica 9:** configurar el proveedor Resend con `Configurar-Resend.ps1` y probar 3 productos (sin correo), 4 distintos (correo real) y duplicados (no cuentan como producto adicional). Verificar también rollback si falla SMTP. Revisar Gmail y el log de la API.

## Subir a GitHub

Cree un repositorio **vacío** en GitHub (sin README, `.gitignore` ni licencia automáticos), y desde la carpeta `NorthWind` ejecute en Git Bash:

```bash
git init
git branch -M main
git add .
git commit -m "Entrega NorthWind con tres bases SQL Server LocalDB"
git remote add origin https://github.com/TU_USUARIO/NOMBRE_REPOSITORIO.git
git push -u origin main
```

Reemplace `TU_USUARIO` y `NOMBRE_REPOSITORIO` por los valores reales. Si ya existe `origin`, use `git remote -v` y `git remote set-url origin URL` en lugar de añadir otro. **No use `git push --force`** si el remoto contiene trabajo de otras personas; antes hay que integrar sus cambios.

> No se suben `.vs`, `bin`, `obj`, contraseñas SMTP, claves JWT, ni archivos físicos `.mdf/.ldf`. Los archivos de base de datos versionados son scripts `.sql`, que permiten reconstruir el esquema.

## Estado de verificación

Se incorporó el envío real a Gmail de la práctica 9 (eventos, plantilla HTML y configuración segura); se mantuvo la **eliminación de secretos publicados** de `appsettings.json` y la incorporación de `UserSecretsId` en el proyecto Web API. Se comprobó la estructura del paquete de forma estática. **No se ejecutó una compilación real ni SQL Server en este entorno**: verifique la compilación y las operaciones en su Visual Studio y LocalDB antes de presentarlo.

**Consultas para verificar el correo y rollback:** `Documentacion/CONSULTAS_VERIFICACION_ORDENES_CORREO.sql`.
