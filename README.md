# NorthWind | Sistema web de órdenes de venta

**Proyecto académico de gestión de ventas desarrollado con ASP.NET Core Web API, Blazor WebAssembly, .NET 8 y SQL Server LocalDB**, estructurado por capas con un enfoque de **Clean Architecture**.

La aplicación permite consultar clientes y productos, registrar órdenes de venta, buscar órdenes emitidas y visualizar sus comprobantes en PDF. Incorpora autenticación de usuarios con ASP.NET Core Identity y JWT, validaciones de negocio y almacenamiento separado para ventas, usuarios y registros de auditoría.

## 1. Características principales

- **Autenticación:** registro e inicio de sesión mediante ASP.NET Core Identity y tokens JWT.
- **Órdenes de venta:** selección de cliente y productos, cantidades, validación de datos y comprobación de existencias.
- **Búsqueda de clientes y productos:** filtros por código o nombre, con consulta paginada.
- **Historial de órdenes:** búsqueda por número de orden, código o nombre de cliente.
- **Detalle y comprobantes:** consulta de información de la orden y generación de archivos PDF.
- **Experiencia de usuario:** interfaz adaptable a diferentes tamaños de pantalla, cambio entre tema claro y oscuro, mensajes en español y confirmación visual de las operaciones.
- **Auditoría:** almacenamiento de eventos de dominio en una base independiente.

**Nota:** la autenticación JWT está implementada, pero la versión incluida no incorpora una autorización completa por roles en los endpoints. No se debe asumir que una opción visual para usuario o administrador representa una restricción de seguridad en el servidor.

## 2. Tecnologías utilizadas

| Componente | Tecnología |
| --- | --- |
| Lenguaje | C# |
| Framework | .NET 8 |
| Backend | ASP.NET Core Web API |
| Frontend | Blazor WebAssembly y componentes Razor |
| Acceso a datos | Entity Framework Core |
| Base de datos | SQL Server Express LocalDB |
| Autenticación | ASP.NET Core Identity y JWT |
| Validaciones | FluentValidation y reglas del dominio |
| Documentación de API | Swagger / OpenAPI |
| Entorno de desarrollo | Visual Studio Community, Windows 10/11 |
| Control de versiones | Git y GitHub |

## 3. Arquitectura del proyecto

El repositorio está organizado en capas que separan las reglas de negocio, los casos de uso, los adaptadores y la infraestructura.

```text
NorthWind/
├── 1. Enterprise Business Rules/
├── 2. Application Business Rules/
├── 3. Interface Adapters/
├── 4. Frameworks And Drivers/
├── NorthWind.Membership.*
├── BaseDeDatos/
│   ├── 00_Crear_Todo_NorthWind.sql
│   ├── 01_NorthWindDB.sql
│   ├── 02_NorthWindLogsDB.sql
│   ├── 03_NorthWindUsersDB.sql
│   ├── 04_Verificar_Bases.sql
│   └── README.md
├── Documentacion/
├── Configurar-Desarrollo.ps1
├── Validate-Final.ps1
├── NorthWind.sln
├── NorthWind.Membership.sln
├── .gitignore
└── README.md
```

### Responsabilidades de las capas

**1. Enterprise Business Rules**

Contiene entidades, contratos, validadores y reglas de negocio que definen el comportamiento principal del sistema.

**2. Application Business Rules**

Implementa los casos de uso y coordina las operaciones necesarias para ejecutar las funcionalidades del sistema.

**3. Interface Adapters**

Incluye controladores, presentadores, gateways y vistas Razor que permiten la comunicación entre la aplicación, los usuarios y los servicios externos.

**4. Frameworks And Drivers**

Contiene los componentes vinculados con infraestructura y tecnología, como la Web API, el cliente Blazor, Entity Framework Core y la configuración de dependencias.

## 4. Bases de datos

El proyecto utiliza **tres bases SQL Server LocalDB** con responsabilidades independientes.

| Base de datos | Descripción | Tablas principales |
| --- | --- | --- |
| `NorthWindDB` | Catálogo, clientes y operaciones comerciales | `Customers`, `Products`, `Orders`, `OrderDetails` |
| `NorthWindLogsDB` | Registros y auditoría de eventos del dominio | `DomainLogs` |
| `NorthWindUsersDB` | Autenticación y administración de identidades | `AspNetUsers`, `AspNetRoles` y tablas relacionadas de Identity |

Los scripts entregados crean el esquema y algunos registros de demostración. No representan un respaldo de todas las ventas realizadas en una instalación previa.

### Instalación de las tres bases

1. Abrir Visual Studio y entrar en **View > SQL Server Object Explorer**, o utilizar SQL Server Management Studio (SSMS).
2. Conectarse al servidor `(localdb)\MSSQLLocalDB` mediante autenticación de Windows.
3. Abrir `BaseDeDatos/00_Crear_Todo_NorthWind.sql` y ejecutar el script completo, incluidos sus separadores `GO`.
4. Abrir `BaseDeDatos/04_Verificar_Bases.sql` y ejecutarlo para verificar la creación de las bases y tablas.
5. Confirmar que existen `NorthWindDB`, `NorthWindLogsDB` y `NorthWindUsersDB`.

**Alternativa:** en lugar del archivo `00`, ejecutar los archivos `01`, `02` y `03`, en ese orden.

### Datos iniciales

Los scripts proporcionan:

- Tres clientes de ejemplo.
- Cinco productos de ejemplo.
- Una cuenta de Identity para prácticas locales.
- Tablas de órdenes y detalles para registrar nuevas ventas.
- Una base de auditoría inicialmente vacía.

Las operaciones realizadas desde la aplicación permiten generar nuevos registros.

## 5. Requisitos de instalación

- Windows 10 o Windows 11.
- Visual Studio Community con la carga de trabajo Desarrollo de ASP.NET y web.
- SDK de .NET 8.
- SQL Server Express LocalDB.
- Git para clonar o publicar el repositorio.
- Conexión a Internet para restaurar paquetes NuGet por primera vez.

Comprobar la instalación de .NET:

```powershell
dotnet --version
```

## 6. Instalación y ejecución

### Paso 1. Clonar el proyecto

```bash
git clone https://github.com/TU_USUARIO/NorthWind-Sistema-Ordenes-Venta.git
cd NorthWind-Sistema-Ordenes-Venta
```

Reemplazar `TU_USUARIO` por el propietario real del repositorio.

Si se descarga un ZIP, extraerlo y abrir una terminal en la carpeta que contiene `NorthWind.sln`.

### Paso 2. Crear las bases de datos

Ejecutar los scripts indicados en la sección 4.

De forma predeterminada, la API apunta a `(localdb)\MSSQLLocalDB`.

### Paso 3. Configurar la clave JWT de desarrollo

En PowerShell, desde la raíz del proyecto, ejecutar:

```powershell
powershell -ExecutionPolicy Bypass -File .\Configurar-Desarrollo.ps1
```

El script genera una clave aleatoria y almacena `JwtOptions:SecurityKey` en .NET User Secrets del proyecto de la API, sin escribirla en los archivos versionados de GitHub.

### Paso 4. Restaurar dependencias y compilar

```powershell
dotnet restore .\NorthWind.sln
dotnet build .\NorthWind.sln
```

### Paso 5. Iniciar el backend

Abrir una terminal en la raíz y ejecutar:

```powershell
dotnet run --project '.\4. Frameworks And Drivers\UI\NorthWind.Sales.WebApi\NorthWind.Sales.WebApi.csproj' --launch-profile https
```

Documentación Swagger:

https://localhost:7154/swagger

### Paso 6. Iniciar el frontend

Abrir otra terminal en la misma carpeta y ejecutar:

```powershell
dotnet run --project '.\4. Frameworks And Drivers\UIs\NorthWind.Sales.BlazorClient\NorthWind.Sales.BlazorClient.csproj' --launch-profile https
```

Aplicación:

https://localhost:7254

Si el sistema operativo no confía en el certificado HTTPS local, ejecutar:

```powershell
dotnet dev-certs https --trust
```

## 7. Endpoints principales de la API

Los siguientes endpoints corresponden a las rutas definidas en el proyecto.

| Método | Endpoint | Función |
| --- | --- | --- |
| `POST` | `/user/Login` | Inicio de sesión |
| `POST` | `/user/Register` | Registro de usuarios |
| `GET` | `/api/customers/search` | Consulta y búsqueda de clientes |
| `GET` | `/api/products/search` | Consulta y búsqueda de productos |
| `POST` | `/CreateOrder` | Registro de una orden de venta |
| `GET` | `/api/orders/search` | Consulta de órdenes |
| `GET` | `/api/orders/{orderId}` | Detalle de una orden |
| `GET` | `/api/orders/{orderId}/pdf` | Comprobante PDF de una orden |

Los endpoints de ventas requieren autenticación.

Los endpoints de búsqueda admiten parámetros `search`, `field`, `page` y `pageSize`.

Para comprobar los esquemas de petición y respuesta vigentes, abrir Swagger y consultar cada operación.

## 8. Pruebas funcionales sugeridas

1. **Conexión:** comprobar que la API inicia y que Swagger se abre correctamente.
2. **Usuarios:** iniciar sesión con una cuenta de demostración local o registrar un usuario nuevo.
3. **Clientes:** localizar un cliente usando los filtros disponibles.
4. **Productos:** localizar un producto y comprobar sus datos y existencias.
5. **Venta:** seleccionar cliente y productos, indicar cantidades válidas y registrar una orden.
6. **Confirmación:** comprobar el mensaje de creación exitosa y utilizar **Ver orden**.
7. **Consulta:** buscar la orden por número o por los datos del cliente.
8. **PDF:** visualizar o descargar el comprobante correspondiente.
9. **Persistencia:** consultar `Orders` y `OrderDetails` en `NorthWindDB`.
10. **Auditoría:** inspeccionar `DomainLogs` en `NorthWindLogsDB` para comprobar los eventos que la aplicación haya registrado.

Para comprobar las bases de manera conjunta se puede volver a ejecutar `BaseDeDatos/04_Verificar_Bases.sql`.

## 9. Configuración y seguridad

La configuración de la API reside en:

`4. Frameworks And Drivers/UI/NorthWind.Sales.WebApi/appsettings.json`

Las principales claves son:

| Clave | Uso |
| --- | --- |
| `DBOptions:ConnectionString` | Conexión a `NorthWindDB` |
| `DBOptions:DomainLogsConnectionString` | Conexión a `NorthWindLogsDB` |
| `MembershipDBOptions:ConnectionString` | Conexión a `NorthWindUsersDB` |
| `JwtOptions:SecurityKey` | Firma de tokens; debe mantenerse privada |
| `SmtpOptions:SmtpUserName` | Usuario del servicio SMTP |
| `SmtpOptions:SmtpPassword` | Contraseña del servicio SMTP |

**No publicar contraseñas, tokens ni claves reales.**

En el paquete preparado para GitHub, las credenciales SMTP están vacías y la clave JWT se crea localmente.

Ejemplo opcional de configuración SMTP local:

```powershell
$api = '.\4. Frameworks And Drivers\UI\NorthWind.Sales.WebApi\NorthWind.Sales.WebApi.csproj'

dotnet user-secrets set 'SmtpOptions:SmtpUserName' 'USUARIO_SMTP' --project $api

dotnet user-secrets set 'SmtpOptions:SmtpPassword' 'CLAVE_SMTP' --project $api
```

La cuenta de ejemplo almacenada por el script SQL debe emplearse solo en desarrollo.

Antes de publicar la aplicación en Internet, deben revisarse credenciales, permisos, CORS, despliegue HTTPS y controles de autorización por rol.

## 10. Solución de problemas frecuentes

| Situación | Comprobación recomendada |
| --- | --- |
| `dotnet` no se reconoce | Instalar el SDK .NET 8 y abrir una terminal nueva. |
| Error de conexión SQL | Confirmar que LocalDB esté instalado, que el servidor sea `(localdb)\MSSQLLocalDB` y que las tres bases existan. |
| Error al validar o firmar un JWT | Ejecutar `Configurar-Desarrollo.ps1` y reiniciar la API en modo `Development`. |
| El cliente no se conecta con el backend | Verificar que la API esté activa en `https://localhost:7154` y que ese valor coincida con `wwwroot/appsettings.json` del cliente. |
| Error de certificado HTTPS | Ejecutar `dotnet dev-certs https --trust`. |
| Error 401 al consultar ventas | Iniciar sesión y enviar un token JWT válido al consumir endpoints protegidos. |
| Conflicto al hacer `git push` | Comprobar `git remote -v` e integrar los cambios remotos antes de volver a subir; evitar `--force`. |

## 11. Publicación en GitHub

Crear un repositorio vacío con el nombre sugerido:

**NorthWind-Sistema-Ordenes-Venta**

Desde la carpeta que contiene `NorthWind.sln`, ejecutar en Git Bash:

```bash
git init
git branch -M main
git add .
git commit -m "Proyecto NorthWind con tres bases de datos SQL Server LocalDB"
git remote add origin https://github.com/TU_USUARIO/NorthWind-Sistema-Ordenes-Venta.git
git push -u origin main
```

Si `origin` ya existe, comprobarlo con `git remote -v` y actualizar su URL mediante `git remote set-url origin URL`; no añadir el remoto dos veces.

El `.gitignore` excluye archivos temporales de Visual Studio (`.vs`), resultados de compilación (`bin`, `obj`) y otros archivos que no deben versionarse.

Las bases de datos se publican mediante sus scripts `.sql`, no como archivos físicos de LocalDB.

## 12. Alcance y estado del proyecto

Este repositorio tiene fines académicos y de aprendizaje, centrados en la aplicación de C#, ASP.NET Core, Blazor, Clean Architecture, persistencia de datos y servicios web.

El paquete integra el proyecto de aplicación y los scripts de las tres bases necesarios para preparar un entorno local.

**Verificación:** se inspeccionaron las rutas y la organización de los archivos. La compilación y las pruebas completas contra SQL Server LocalDB deben ejecutarse en un equipo que disponga de Visual Studio y SQL Server.

---

**NorthWind — Proyecto académico de Ingeniería de Software.**
