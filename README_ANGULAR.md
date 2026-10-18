# NorthWind | Front-end en Angular — Guía de configuración

Esta rama (`feature/NortWind_FrontAngular`) reemplaza el **front-end Blazor** por un **cliente Angular**.
El **back-end no cambia**: la misma Web API ASP.NET Core (.NET 8), las mismas capas de Clean Architecture,
las mismas tres bases de datos y la misma seguridad con JWT. Angular solo consume los servicios REST de la API,
igual que lo hacía Blazor.

Esta guía sirve para dejar funcionando el sistema **en otra computadora** (por ejemplo, la laptop de la presentación)
partiendo de cero.

---

## 1. Qué se va a ejecutar

| Programa | Tecnología | Dirección | Carpeta |
| --- | --- | --- | --- |
| Web API (back-end) | ASP.NET Core 8 | `http://localhost:5254` y `https://localhost:7154/swagger` | `4. Frameworks And Drivers/UI/NorthWind.Sales.WebApi` |
| Cliente web (front-end) | **Angular 21** | `http://localhost:4200` | `4. Frameworks And Drivers/UIs/NorthWind.Sales.AngularClient` |
| Bases de datos | SQL Server **LocalDB** | `(localdb)\MSSQLLocalDB` | Scripts en `BaseDeDatos/` |

El cliente Blazor sigue en el repositorio (`NorthWind.Sales.BlazorClient`) sin cambios, pero **no es necesario
ejecutarlo**.

---

## 2. Programas que debe tener la laptop

| Programa | Versión | Para qué | Cómo comprobarlo |
| --- | --- | --- | --- |
| **.NET SDK** | 8 (o uno más nuevo que tenga instalado el *runtime* de .NET 8) | Compilar y ejecutar la API | `dotnet --list-sdks` y `dotnet --list-runtimes` |
| **SQL Server Express LocalDB** | 2019 o superior | Las tres bases de datos | `SqlLocalDB info` (debe aparecer `MSSQLLocalDB`) |
| **Node.js** | **22.12 o superior** (o 20.19+, o 24+) | Ejecutar Angular | `node -v` |
| **npm** | 10 o superior (viene con Node.js) | Instalar paquetes de Angular | `npm -v` |
| Git | Cualquiera | Descargar el repositorio | `git --version` |
| SSMS o Visual Studio | Opcional | Ver las bases y ejecutar scripts con interfaz gráfica | — |

Descargas:

- .NET 8 SDK: <https://dotnet.microsoft.com/download/dotnet/8.0>
- Node.js LTS: <https://nodejs.org> (elija la versión **LTS**)
- LocalDB: se instala con Visual Studio (carga de trabajo *Desarrollo de ASP.NET y web*) o con el instalador de
  **SQL Server Express** eligiendo la opción *LocalDB*.

> **No hace falta instalar Angular CLI de forma global.** El proyecto trae su propia versión y se usa con `npm start`.

Se necesita **Internet** la primera vez (para `npm install` y para restaurar los paquetes NuGet). Después, el sistema
funciona sin conexión.

---

## 3. Copiar el proyecto en una ruta CORTA (muy importante)

Windows tiene un límite clásico de **260 caracteres por ruta**. Este proyecto tiene carpetas con nombres largos
(`4. Frameworks And Drivers\Frameworks\DataContexts\...`) y, si además está dentro de
`C:\Users\<usuario>\Documents\...\...`, la compilación falla con un error como:

```text
error MSB3030: No se pudo copiar el archivo "obj\Debug\net8.0\...dll" porque no se encontró.
```

Por eso, en la laptop, **coloque el proyecto directamente en `C:\NorthWind`**:

```powershell
git clone -b feature/NortWind_FrontAngular https://github.com/CarlangasBeja/NorthWind-Sistema-Ordenes-Venta.git C:\NorthWind
cd C:\NorthWind
```

Si lo copia con una memoria USB o un ZIP, extraiga el contenido para que el archivo `NorthWind.sln` quede en
`C:\NorthWind\NorthWind.sln`. **No copie** las carpetas `bin`, `obj`, `node_modules`, `.angular` ni `dist`:
se regeneran solas y pesan mucho.

> Todos los comandos de esta guía se ejecutan en **PowerShell**, dentro de `C:\NorthWind`, salvo que se indique otra
> carpeta.

---

## 4. Crear las bases de datos en LocalDB

1. Asegúrese de que LocalDB esté iniciado:

   ```powershell
   SqlLocalDB start MSSQLLocalDB
   ```

2. Ejecute el script que crea las tres bases (NorthWindDB, NorthWindLogsDB y NorthWindUsersDB):

   ```powershell
   sqlcmd -S "(localdb)\MSSQLLocalDB" -E -I -i ".\BaseDeDatos\00_Crear_Todo_NorthWind.sql"
   ```

3. (Recomendado para la demostración) Cargue 10 clientes y 10 productos más, para que se vea la paginación:

   ```powershell
   sqlcmd -S "(localdb)\MSSQLLocalDB" -E -I -i ".\BaseDeDatos\NorthWind_10_Productos_10_Clientes.sql"
   ```

4. Compruebe el resultado:

   ```powershell
   sqlcmd -S "(localdb)\MSSQLLocalDB" -E -I -i ".\BaseDeDatos\04_Verificar_Bases.sql"
   ```

**Sin `sqlcmd`:** abra SSMS (o *Ver → Explorador de objetos de SQL Server* en Visual Studio), conéctese a
`(localdb)\MSSQLLocalDB` con autenticación de Windows, abra cada archivo `.sql` y ejecútelo completo con **F5**,
en el mismo orden.

> El parámetro `-I` activa `QUOTED_IDENTIFIER`, necesario para los índices de las tablas de usuarios. SSMS ya lo
> activa por defecto.

Las cadenas de conexión ya apuntan a LocalDB en
`4. Frameworks And Drivers/UI/NorthWind.Sales.WebApi/appsettings.json`. Si usa otra instancia de SQL Server,
cambie ahí `DBOptions` y `MembershipDBOptions`.

---

## 5. Configurar la clave JWT (una sola vez por computadora)

```powershell
powershell -ExecutionPolicy Bypass -File .\Configurar-Desarrollo.ps1
```

El script genera una clave aleatoria y la guarda en los *User Secrets* de .NET del usuario de Windows (no en el
repositorio). Sin este paso, el inicio de sesión no funciona.

---

## 6. Compilar y levantar la Web API

```powershell
dotnet build .\NorthWind.sln
dotnet run --project ".\4. Frameworks And Drivers\UI\NorthWind.Sales.WebApi\NorthWind.Sales.WebApi.csproj" --launch-profile https
```

Deje esta terminal abierta. Cuando aparezca `Now listening on: https://localhost:7154`, la API está lista.

- Swagger: <https://localhost:7154/swagger>
- Angular usa la dirección **`http://localhost:5254`** (el mismo programa también escucha por HTTP), así no
  depende del certificado HTTPS de desarrollo.

Si el navegador muestra una advertencia de certificado al abrir Swagger, ejecute una vez:

```powershell
dotnet dev-certs https --trust
```

---

## 7. Instalar y levantar el cliente Angular

Abra **otra** terminal:

```powershell
cd "C:\NorthWind\4. Frameworks And Drivers\UIs\NorthWind.Sales.AngularClient"
npm install
npm start
```

- `npm install` solo se necesita la primera vez (descarga Angular y Bootstrap en `node_modules`).
- `npm start` compila y sirve la aplicación. Cuando muestre `Local: http://localhost:4200/`, abra esa dirección.

### Dirección de la API

El cliente lee la dirección de la API al arrancar desde:

`4. Frameworks And Drivers/UIs/NorthWind.Sales.AngularClient/public/appsettings.json`

```json
{
  "WebApiAddress": "http://localhost:5254"
}
```

Es el equivalente al `wwwroot/appsettings.json` de Blazor. Si la API se ejecuta en otra dirección o puerto, cambie
este valor y recargue el navegador; **no hace falta volver a compilar**.

---

## 8. Usuario de demostración

El script `03_NorthWindUsersDB.sql` (incluido en el `00`) crea una cuenta de prueba:

- Correo: `msanders@northwind.com`
- Contraseña: está escrita en el comentario al inicio de `BaseDeDatos/03_NorthWindUsersDB.sql`.

También puede crear una cuenta nueva desde **Crear cuenta**.

---

## 9. Correo de "orden especial" (más de 3 productos)

Regla de las prácticas 9 y 11: cuando una orden tiene **más de 3 productos distintos**, la API envía un correo al
administrador; **si el correo no se puede enviar, la orden se cancela** (y queda registrado en `DomainLogs`).

En una laptop recién configurada **no hay credenciales de correo**, por lo tanto:

- Las órdenes con **1 a 3 productos** se guardan normalmente.
- Una orden con **4 o más productos** se cancela y Angular muestra: *"No pudimos comunicarnos correctamente con el
  servicio de ventas..."*. Esto **no es un error del front-end**: es la transacción de la práctica 11 funcionando.

Para que el correo funcione de verdad, configure Resend con el script del proyecto (las pruebas de correo están
descritas en `Documentacion/PRUEBAS_CORREO_PRACTICA_09.md`):

```powershell
powershell -ExecutionPolicy Bypass -File .\Configurar-Resend.ps1
```

Después reinicie la API.

---

## 10. Arranque rápido el día de la presentación

Con todo ya instalado (pasos 2 a 7 hechos al menos una vez):

1. `SqlLocalDB start MSSQLLocalDB`
2. Terminal 1 (en `C:\NorthWind`):

   ```powershell
   dotnet run --project ".\4. Frameworks And Drivers\UI\NorthWind.Sales.WebApi\NorthWind.Sales.WebApi.csproj" --launch-profile https
   ```

3. Terminal 2:

   ```powershell
   cd "C:\NorthWind\4. Frameworks And Drivers\UIs\NorthWind.Sales.AngularClient"
   npm start
   ```

4. Abrir <http://localhost:4200> e iniciar sesión.

### Lista de comprobación (hágala el día anterior en la misma laptop)

- [ ] Swagger abre en `https://localhost:7154/swagger`.
- [ ] Angular abre en `http://localhost:4200` y se puede iniciar sesión.
- [ ] **Crear orden:** buscar cliente (ANTON aparece bloqueado por saldo), agregar 2 productos, cambiar cantidades,
      guardar y ver el modal *"Orden de compra realizada correctamente"*.
- [ ] **Ver orden** abre la factura; **Ver PDF**, **Descargar** e **Imprimir** funcionan.
- [ ] **Ver clientes:** registrar un cliente y modificar su saldo.
- [ ] **Ver productos:** aparecen también los agotados (Chang).
- [ ] **Consultar órdenes:** filtrar por número, código o nombre de cliente.
- [ ] **Cerrar sesión** y comprobar que el menú de ventas desaparece.

---

## 11. Solución de problemas

| Síntoma | Causa | Solución |
| --- | --- | --- |
| `error MSB3030: No se pudo copiar el archivo ... porque no se encontró` al compilar | Ruta de más de 260 caracteres | Mover el proyecto a `C:\NorthWind` (sección 3). |
| `npm error Cannot read properties of null (reading 'edgesOut')` | Error de npm 10 al resolver dependencias | El archivo `.npmrc` del cliente ya lo evita. Si aparece, ejecute `npm install --legacy-peer-deps`. |
| `npm start` dice que Node es demasiado antiguo | Node.js menor a 20.19 / 22.12 | Instalar Node.js LTS actual. |
| Pantalla en blanco y en la consola del navegador `NG0203` | El proyecto se abrió desde una unidad virtual (`subst`) o un acceso directo distinto de la ruta real | Ejecutar `npm start` desde la ruta real (`C:\NorthWind\...`), borrar la carpeta `.angular` y volver a iniciar. |
| *"No fue posible comunicarnos con el servicio..."* en todas las pantallas | La API no está encendida o `public/appsettings.json` apunta a otra dirección | Levantar la API (sección 6) y revisar `WebApiAddress`. |
| *"El correo o la contraseña no coinciden..."* con datos correctos | Falta la clave JWT o la base de usuarios | Ejecutar `Configurar-Desarrollo.ps1` y el script `00` (secciones 4 y 5). |
| La sesión se cierra sola | El token venció (dura 24 h) o la API cambió de clave JWT | Volver a iniciar sesión. |
| `Cannot open database "NorthWindDB"` en la terminal de la API | Las bases no existen en LocalDB | Ejecutar los scripts de la sección 4. |
| `A network-related or instance-specific error` | LocalDB detenido o no instalado | `SqlLocalDB start MSSQLLocalDB`; si no existe, instalar LocalDB. |
| `Failed to bind to address ... address already in use` | El puerto 5254/7154 o 4200 está ocupado | Cerrar la otra terminal que usa ese puerto, o reiniciar la laptop. |
| Una orden con 4 o más productos se cancela | Correo no configurado (sección 9) | Usar 1 a 3 productos, o configurar Resend. |
| Al ejecutar un `.ps1`: *"la ejecución de scripts está deshabilitada"* | Política de ejecución de PowerShell | Usar `powershell -ExecutionPolicy Bypass -File .\script.ps1` como en esta guía. |

---

## 12. Cómo está hecho el cliente Angular (para la defensa)

El back-end y sus capas son los de las prácticas. El cliente Angular vive en la **capa 4 (Frameworks And Drivers)**,
junto a Blazor, porque la interfaz de usuario es un *detalle* que se puede cambiar sin tocar las reglas de negocio.

```text
NorthWind.Sales.AngularClient/
├── public/
│   ├── appsettings.json         Dirección de la Web API (se lee al iniciar)
│   └── js/theme.js              Tema claro/oscuro (el mismo script de Blazor)
└── src/app/
    ├── app.config.ts            Composición: router, HttpClient + interceptor, configuración
    ├── app.routes.ts            Rutas (equivalen a los @page de Blazor)
    ├── core/
    │   ├── models/              DTOs (copia en TypeScript de NorthWind.Sales.Entities)
    │   ├── gateways/            Llamadas REST a la API (equivalen a los WebApiGateways)
    │   ├── auth/                Token JWT, interceptor "Bearer" y guard de rutas
    │   ├── api/api-error.ts     Lee los ProblemDetails de la API (como ExceptionDelegatingHandler)
    │   └── validation/          Mensajes por campo (como ModelValidator / ValidationMessage)
    ├── layout/                  Menú lateral y barra superior (MainLayout)
    └── pages/                   Inicio, Crear orden, Clientes, Productos, Órdenes, Login, Registro, Salir
```

| Blazor | Angular |
| --- | --- |
| `CreateOrderViewModel` (MVVM) | `create-order.view-model.ts` (servicio con *signals*) |
| `CreateOrderComponent.razor` + modales de búsqueda | `create-order-page` + `customer-search-modal` + `product-search-modal` |
| `SalesQueriesGateway`, `CreateOrderGateway`, `MembershipGateway` | `core/gateways/*.gateway.ts` |
| `MembershipBearerTokenHandler` | `auth.interceptor.ts` (agrega `Authorization: Bearer`) |
| `JWTAuthenticationStateProvider` + `TokenLocalStorage` | `auth.service.ts` (token en `localStorage`) |
| `[Authorize]` en las páginas | `auth.guard.ts` |
| `<NavigationLock>` (salir sin guardar) | `unsaved-order.guard.ts` |
| `ExceptionDelegatingHandler` | `api-error.ts` |
| `wwwroot/css/app.css` | `src/styles.css` (mismo diseño) + Bootstrap 5.3.3 |

Tecnologías del cliente: **Angular 21** (componentes *standalone*, *signals*, control de flujo `@if`/`@for`),
**TypeScript**, **Bootstrap 5.3.3**, `HttpClient` con interceptores y `Router` con *guards*.
