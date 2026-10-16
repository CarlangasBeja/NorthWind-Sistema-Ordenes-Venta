# NorthWind individual · Fedora Workstation 44 + Blazor WebAssembly

Esta carpeta permite ejecutar la **versión Blazor del trabajo individual** de NorthWind sobre **Fedora Workstation 44 x86_64**, con API ASP.NET Core 8 y tres bases SQL Server 2022 dentro de un contenedor Podman.

## Decisiones técnicas

- **Blazor WebAssembly** permanece como frontend del trabajo individual. **Astro no sustituye Blazor** si el docente exige específicamente Blazor.
- Fedora 44 ejecuta `dotnet-sdk-8.0` desde sus repositorios.
- **LocalDB es exclusivo de Windows**. En Fedora se usan `NorthWindDB`, `NorthWindLogsDB` y `NorthWindUsersDB` en SQL Server 2022 dentro de Podman.
- Los scripts incluyen **10 productos y 10 clientes adicionales en español** como datos de demostración, sin copiar las órdenes que existan únicamente en LocalDB de Windows.
- Las conexiones se escriben en **.NET User Secrets** local, no en `appsettings.json` ni GitHub.
- Se usa **HTTP local** exclusivamente para la demostración en `127.0.0.1`; no es configuración de producción. La conexión local con SQL Server usa `Encrypt=True;TrustServerCertificate=True` para desarrollo.
- El evento de orden especial y Resend se conservan, pero requieren una nueva configuración de credenciales en Fedora.

## Requisitos

- Fedora **Workstation 44** instalado, procesador **x86_64**. Se recomiendan al menos 8 GB de RAM para usar el escritorio, la API, Blazor y el contenedor, con más memoria si es máquina virtual.
- Acceso a Internet para descargar paquetes NuGet e imagen de SQL Server.
- Espacio libre para contenedores y paquetes; la imagen de SQL Server ocupa varios GB.
- Entorno bash, `sudo`, Podman y .NET 8.

## Secuencia de ejecución (terminal Fedora)

En el directorio de NorthWind:

```bash
chmod +x Fedora44/*.sh
./Fedora44/01_verificar_fedora.sh
./Fedora44/02_instalar_dependencias.sh
./Fedora44/03_iniciar_sqlserver.sh
./Fedora44/04_crear_bases.sh
./Fedora44/05_configurar_api.sh
```

Opcional: activar correo real con `./Fedora44/06_configurar_resend.sh` (requiere cuenta y API Key de Resend). Nunca coloque la API Key en el proyecto.

Compilar y restaurar dependencias:

```bash
dotnet restore NorthWind.sln
dotnet build NorthWind.sln
```

Terminal 1 (API):

```bash
./Fedora44/07_ejecutar_api.sh
```

Terminal 2 (Blazor):

```bash
./Fedora44/08_ejecutar_blazor.sh
```

Direcciones:

- **API Swagger:** http://127.0.0.1:5254/swagger
- **Blazor:** http://127.0.0.1:5255

Si los puertos están ocupados, ciérrelos o cambie **ambas** direcciones: el script de Blazor y `4. Frameworks And Drivers/UIs/NorthWind.Sales.BlazorClient/wwwroot/appsettings.json`.

## Validaciones requeridas para la entrega

1. `cat /etc/fedora-release` demuestra Fedora 44.
2. `dotnet --info` muestra .NET 8.
3. `podman ps` muestra `northwind-sql` ejecutándose.
4. Swagger abre en el navegador.
5. Blazor abre con la cuenta de Identity creada con los scripts SQL, o una cuenta nueva registrada.
6. En Clientes y Productos se muestran los catálogos.
7. Se puede crear una orden, consultar sus detalles y verificar su registro en SQL Server.
8. Si configura Resend, pruebe una orden de **cuatro productos distintos** y verifique correo en Gmail.
9. Realice capturas originales de cada operación; no invente resultados.

## Protección de credenciales

No suba al repositorio las claves de Resend, contraseñas `sa` ni secretos JWT. Los User Secrets en Fedora están en `~/.microsoft/usersecrets/` y no se incluyen en el ZIP. **No use `dotnet user-secrets list` durante una captura pública**: podría mostrar contraseñas.

## Limitaciones

- El ZIP está **preparado para Fedora**, pero no significa que se haya ejecutado en una estación real Fedora 44.
- La configuración de desarrollador `TrustServerCertificate=True` y HTTP localhost **no se debe utilizar en producción**.
- Un contenedor SQL Server 2022 ejecutado con Podman en Fedora es válido para realizar pruebas académicas locales, pero no equivale a una instalación nativa de SQL Server con soporte empresarial específico para Fedora.
- En Linux no hay MSDTC para transacciones distribuidas. Se condicionó la propiedad `TransactionManager.ImplicitDistributedTransactions` para ejecutarse únicamente en Windows. La aplicación guarda la auditoría fuera de la transacción de la orden.
- La cuenta de ejemplo del script de Identity se proporciona únicamente para prácticas; no debe utilizarse públicamente.
