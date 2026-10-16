# NorthWind — Prácticas 9 y 11: notificación automática al administrador y rollback

## Qué sucede de forma automática

Cuando el usuario registra una orden con **más de tres productos distintos** (4 o más), el backend genera `SpecialOrderCreatedEvent`. Su manejador llama al gateway SMTP de Resend y dirige el mensaje al Gmail **fijo** del administrador. El usuario solo llena el formulario normal de orden: **nunca** escribe datos SMTP, claves ni dirección del administrador. **Registrar un usuario nuevo no envía correo**: la condición del docente corresponde a la creación de una orden especial.

**Práctica 11:** la orden, sus detalles y el descuento de stock se confirman solo si el SMTP acepta el envío. Cuando SMTP falla, el servidor hace rollback y escribe una auditoría de cancelación en `NorthWindLogsDB`. La auditoría independiente no requiere un coordinador de transacciones distribuidas. Una vez aceptado el correo, si falla posteriormente el commit SQL, no es posible retirar el email remoto; por eso esto ilustra el ejercicio, pero no representa atomicidad distribuida perfecta.

## Paso 1. Preparar el entorno (solo la primera vez)

1. En Visual Studio Community, abrir `NorthWind.sln`.
2. Usar SQL Server Object Explorer y conectarse a `(localdb)\MSSQLLocalDB`.
3. Si las tres bases aún no existen, abrir y ejecutar `BaseDeDatos/00_Crear_Todo_NorthWind.sql`. **No recrear las bases si ya contienen tus órdenes**, para evitar reemplazar información.
4. Verificar `NorthWindDB`, `NorthWindLogsDB` y `NorthWindUsersDB`.
5. Tener instalado el SDK de .NET 8. Ejecutar en PowerShell, dentro de la carpeta que contiene `NorthWind.sln`:

```powershell
dotnet restore .\NorthWind.sln
dotnet build .\NorthWind.sln
```

## Paso 2. Configurar el remitente Resend (UNA SOLA VEZ)

**No hay que modificar Gmail.** Esta es una configuración interna del servidor, previa al uso de la aplicación.

1. Abrir <https://resend.com/signup>, crear una cuenta con el **mismo Gmail donde deseas recibir las alertas**, y verificarla si la plataforma lo solicita.
2. Abrir <https://resend.com/api-keys> y crear una clave `re_...` con permiso de envío.
3. En PowerShell, desde la raíz de NorthWind, ejecutar:

```powershell
powershell -ExecutionPolicy Bypass -File .\Configurar-Resend.ps1
```

4. Cuando lo pregunte, escribir **una vez** el Gmail del administrador (el asociado con la cuenta Resend), pulsar Enter para usar `onboarding@resend.dev` como remitente e introducir la clave Resend. **La clave es de Resend, NO de Gmail.**
5. El script almacena la dirección y el token en .NET **User Secrets del backend**. No quedan en el formulario de compras ni en GitHub.
6. Si aún no tienes JWT local, ejecutar una sola vez:

```powershell
powershell -ExecutionPolicy Bypass -File .\Configurar-Desarrollo.ps1
```

**Limitación del modo de prueba de Resend:** `onboarding@resend.dev` puede enviar al correo de tu propia cuenta Resend. Si el administrador usa un Gmail distinto, necesitas verificar un dominio remitente propio en Resend y configurarlo, pero **no modificar ese Gmail**. No compartas aquí el token `re_...`.

Para revisar que la dirección quedó guardada sin revelar la clave, ejecuta en PowerShell:

```powershell
$api = '.\4. Frameworks And Drivers\UI\NorthWind.Sales.WebApi\NorthWind.Sales.WebApi.csproj'
dotnet user-secrets list --project $api | Select-String 'AdministratorEmail|SenderEmail|SmtpHost|SmtpHostPort|SmtpUserName'
```

No publiques la salida completa del comando `dotnet user-secrets list`: también puede contener el token SMTP.

## Paso 3. Ejecutar el servidor y la página web

Abre **dos terminales PowerShell diferentes** en la raíz del repositorio.

**Terminal 1 (backend; mantenerla abierta):**

```powershell
dotnet run --project '.\4. Frameworks And Drivers\UI\NorthWind.Sales.WebApi\NorthWind.Sales.WebApi.csproj' --launch-profile https
```

La documentación de API aparecerá en <https://localhost:7154/swagger>.

**Terminal 2 (frontend; mantenerla abierta):**

```powershell
dotnet run --project '.\4. Frameworks And Drivers\UIs\NorthWind.Sales.BlazorClient\NorthWind.Sales.BlazorClient.csproj' --launch-profile https
```

La web se abre en <https://localhost:7254>. Si Windows rechaza el certificado local, ejecuta `dotnet dev-certs https --trust`.

## Paso 4. Prueba positiva: el administrador recibe correo

1. Abrir la web e iniciar sesión con un usuario válido (no hace falta iniciar sesión como administrador).
2. Entrar a **Crear orden de venta**, seleccionar un cliente, completar la dirección de entrega y añadir **4 productos de IDs diferentes**, con cantidades disponibles.
3. Presionar **Guardar/Finalizar orden**. No saldrá ningún campo para correo electrónico.
4. La API validará la orden, realizará el guardado provisional, disparará `SpecialOrderCreatedEvent`, enviará mediante SMTP y finalmente confirmará la transacción SQL.
5. Comprobar el modal de orden registrada y abrir **Ver orden**.
6. Revisar el Gmail del administrador en **Recibidos** o **Spam**. Comprobar también <https://resend.com/emails> y la consola de la API.
7. El mensaje HTML debe mostrar número de orden, cliente, fecha, dirección, número de productos y tabla de cantidades.

**Importante:** aceptación por el servidor SMTP no garantiza su entrega final a Recibidos. La entrega se confirma revisando Gmail o los eventos de Resend.

## Paso 5. Pruebas del docente

| Prueba | Resultado esperado |
|---|---|
| 3 productos diferentes | Se guarda la orden; no hay correo |
| 4 productos diferentes | Se guarda y se intenta el correo; comprobar entrega real |
| 5 productos diferentes | Igual que con 4 |
| 4 líneas, pero 2 con el mismo `ProductId` | Solo 3 distintos, no hay correo |
| Cantidad total de 10 unidades de un mismo producto | Solo 1 producto distinto; no hay correo |
| 4 productos con stock insuficiente | Orden rechazada, sin correo |
| SMTP rechazado: token erróneo | El backend devuelve error y revierte orden, detalles y stock; se audita cancelación |

Para demostrar el **rollback** sin revelar credenciales, sustituye *temporalmente* la clave SMTP local por una de prueba inválida:

```powershell
$api = '.\4. Frameworks And Drivers\UI\NorthWind.Sales.WebApi\NorthWind.Sales.WebApi.csproj'
dotnet user-secrets set 'SmtpOptions:SmtpPassword' 're_prueba_invalida' --project $api
```

Reinicia la API; intenta registrar una orden de 4 productos distintos. Debe aparecer un error (NO una confirmación exitosa). Verifica que la cantidad de órdenes y el stock no cambiaron y que `NorthWindLogsDB` registró la cancelación. **Después restaura la clave verdadera** ejecutando nuevamente `Configurar-Resend.ps1` y reiniciando la API. Este paso es opcional: no lo hagas en un entorno con ventas reales.

Consultas SQL orientativas (ejecutar por separado en SSMS o SQL Server Object Explorer):

```sql
USE NorthWindDB;
SELECT TOP (10) * FROM dbo.Orders ORDER BY Id DESC;
SELECT TOP (10) * FROM dbo.OrderDetails ORDER BY OrderId DESC;
SELECT Id AS ProductId, UnitsInStock FROM dbo.Products ORDER BY Id;

USE NorthWindLogsDB;
SELECT TOP (20) * FROM dbo.DomainLogs ORDER BY 1 DESC;
```

## Solución de problemas

- **No se envía:** comprobar que son 4 IDs distintos, stock suficiente y API en ejecución.
- **SMTP 401 o 403:** comprobar clave Resend y que el Gmail destino corresponde a tu cuenta Resend de pruebas.
- **Problemas TLS / timeout:** comprobar conexión a `smtp.resend.com:587` y que el firewall no bloquee SMTP saliente.
- **La API muestra error:** comprobar el primer error de consola y que las tres bases LocalDB estén disponibles.
- **Gmail no recibe, pero SMTP aceptó:** revisar Spam y actividad del proveedor. El mensaje puede estar retenido o rechazado más tarde.

**Nota técnica:** las tres bases SQL se mantienen. El frontend solo muestra la creación exitosa cuando la API devuelve una respuesta exitosa. No hay simulación de correo ni intervención del comprador.

**Verificación del paquete:** comprobaciones estáticas de estructura y flujo. La compilación .NET, SQL Server y entrega efectiva deben comprobarse desde tu equipo.
