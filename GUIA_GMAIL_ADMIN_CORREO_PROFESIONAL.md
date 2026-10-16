# NorthWind — Gmail real del administrador y correo profesional

## Estado de la configuración

La funcionalidad está programada, pero en el ZIP público **no se guardan correos personales ni claves API**. El archivo `appsettings.json` mantiene `SmtpOptions:AdministratorEmail` y `SmtpOptions:SmtpPassword` vacíos. Hay que configurar el servidor **una sola vez en la computadora que ejecuta el backend**, no para cada comprador.

El correo **sí puede llegar a un Gmail real**. Gmail actúa únicamente como destinatario; no se necesita generar una contraseña de Gmail ni habilitar opciones en esa cuenta.

## 1. Primera configuración (una sola vez)

1. Crea una cuenta en <https://resend.com/signup> con el Gmail que recibirá la notificación.
2. Crea una API Key de envío en <https://resend.com/api-keys> (empieza con `re_`). **No es tu contraseña Gmail.**
3. Abre PowerShell en la carpeta que contiene `NorthWind.sln`.
4. Ejecuta:

   ```powershell
   powershell -ExecutionPolicy Bypass -File .\Configurar-Resend.ps1
   ```

5. Introduce el Gmail real del administrador (ejemplo **ilustrativo**: `administrador@gmail.com`).
6. Pulsa ENTER en remitente para usar `onboarding@resend.dev`.
7. Pega la API Key cuando la solicite PowerShell; no se mostrará en pantalla.
8. Reinicia el backend si estaba ejecutándose.

**Restricción del remitente de prueba:** con `onboarding@resend.dev`, Resend solo permite envío a la dirección de tu propia cuenta Resend. Si quieres recibir en un Gmail diferente, debes configurar un dominio remitente verificado en Resend. No necesitas modificar los ajustes del Gmail receptor.

## 2. Cambiar únicamente el Gmail del administrador

Cuando ya tengas configurado el proveedor, ejecuta:

```powershell
powershell -ExecutionPolicy Bypass -File .\Cambiar-Gmail-Administrador.ps1
```

Introduce el nuevo Gmail y reinicia el backend. El script cambia `SmtpOptions:AdministratorEmail` en **.NET User Secrets**, sin pedir la API Key, ni editar `appsettings.json` ni modificar tu Gmail. Recuerda la restricción del remitente de prueba si cambias a otro destinatario.

## 3. Comprobar qué Gmail está guardado

```powershell
$api = '.\4. Frameworks And Drivers\UI\NorthWind.Sales.WebApi\NorthWind.Sales.WebApi.csproj'
dotnet user-secrets list --project $api | Select-String 'AdministratorEmail|SenderEmail|SmtpHost|SmtpHostPort'
```

**No publiques la salida completa** de `dotnet user-secrets list`, porque podría incluir la clave privada del proveedor.

## 4. Ejecutar en Visual Studio

Desde la carpeta raíz del proyecto:

```powershell
dotnet restore .\NorthWind.sln
dotnet build .\NorthWind.sln
```

Terminal 1: backend

```powershell
dotnet run --project '.\4. Frameworks And Drivers\UI\NorthWind.Sales.WebApi\NorthWind.Sales.WebApi.csproj' --launch-profile https
```

Terminal 2: cliente Blazor

```powershell
dotnet run --project '.\4. Frameworks And Drivers\UIs\NorthWind.Sales.BlazorClient\NorthWind.Sales.BlazorClient.csproj' --launch-profile https
```

Abre `https://localhost:7254` e inicia sesión. Si todavía no configuraste el JWT, ejecuta previamente `Configurar-Desarrollo.ps1`.

## 5. Prueba del docente: 4 productos diferentes

1. Crea una orden para un cliente con stock disponible.
2. Agrega 4 productos de **códigos diferentes**.
3. Completa los datos de envío y guarda la orden.
4. NorthWind genera `SpecialOrderCreatedEvent`, envía por Resend y confirma la transacción cuando el SMTP acepta el mensaje.
5. Revisa Gmail (Recibidos o Spam), la consola del backend y <https://resend.com/emails>.
6. Verifica que el correo incluya número de orden, fecha, código de cliente, cuatro productos, cantidades y dirección de entrega.

**Con 3 productos distintos:** la orden se guarda, pero no se genera notificación.

**Si falla SMTP:** la transacción de la orden se revierte, según la práctica 11. La aceptación SMTP **no equivale** a entrega final: la entrega real se comprueba con el historial de Resend y la bandeja del Gmail receptor.

## 6. Vista previa del diseño

Abre en el navegador `Documentacion/Vista_Previa_Correo_Especial_Profesional.html`. Es una **vista de ejemplo**, no un correo enviado. El mensaje real se genera con los datos de cada orden y con HTML de tablas, colores, etiquetas y estilos inline, compatibles con Gmail.

No incluyas claves API, contraseñas ni datos personales al subir el repositorio a GitHub.
