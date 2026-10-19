# Ejecutar NorthWind-Blazor en Fedora Workstation 44

Esta carpeta contiene la adaptación del proyecto original para **Fedora Workstation 44 x86_64**. Se conservan el **frontend Blazor WebAssembly**, la **API ASP.NET Core**, **Identity/JWT** y las **tres bases de SQL Server**, sin instalar LocalDB (Windows-only).

## Requisitos de la máquina virtual

- Fedora 44 Workstation **x86_64**, con acceso a internet para la primera ejecución.
- Recomendado: **6–8 GB de RAM** asignada a la VM, 2+ CPU, 20 GB libres en disco. SQL Server necesita suficiente memoria; con menos de 4 GB pueden darse errores de arranque.
- Acceso a `sudo` para instalar paquetes DNF por primera vez.
- No ejecutar los comandos como root; Podman utiliza contenedores **rootless**.

## Inicio (copiar y pegar)

La aplicación ha sido migrada a **.NET 10 LTS**, con **Entity Framework Core 10**, Blazor WebAssembly 10, ASP.NET Core Identity 10, JwtBearer 10 y bibliotecas Microsoft.Extensions 10. El servidor SQL continúa en SQL Server 2022 por compatibilidad con las bases de datos existentes. **No se requiere el SDK 8**.

1. Extraer el ZIP dentro de Fedora en **Descargas** o en otra carpeta local. No ejecutarlo desde una carpeta compartida de Windows montada como `noexec`.
2. Abrir una terminal dentro de la carpeta `NorthWind-Blazor-Fedora44` (la que contiene `NorthWind.sln`).
3. Ejecutar:

```bash
bash ./INICIAR_FEDORA44.sh
```

Este comando, automáticamente:

1. Instala desde los repositorios Fedora los paquetes que falten (`dotnet-sdk-10.0`, `podman`, `openssl`, `curl`).
2. Crea credenciales aleatorias locales en `fedora/.env` (permisos 600).
3. Descarga SQL Server 2022 Developer y lo inicia en Podman con almacenamiento persistente (puerto TCP `127.0.0.1:14333`).
4. Crea/actualiza de forma idempotente `NorthWindDB`, `NorthWindLogsDB`, `NorthWindUsersDB` y carga el SQL con diez productos y diez clientes adicionales.
5. Compila `NorthWind.sln` con .NET 10.
6. Inicia la API y Blazor **en HTTP local**, evitando problemas de certificado HTTPS de desarrollo.
7. Ejecuta automáticamente pruebas reales de **login JWT y búsquedas de clientes, productos y órdenes**, y guarda sus resultados en `fedora/logs/prueba-funcional.log`.

En el navegador de Fedora, abrir:

- **Aplicación:** http://127.0.0.1:5255
- **Swagger API:** http://127.0.0.1:5254/swagger

Dejar abierta la terminal. Para detener API y Blazor, pulsar **Ctrl+C**. SQL Server queda iniciado para reusar sus datos en el siguiente arranque; para detenerlo:

```bash
bash fedora/detener-sql.sh
```

Para volver a usar el proyecto otro día, ejecutar de nuevo:

```bash
bash ./INICIAR_FEDORA44.sh
```

## Comprobar migración a .NET 10

Después de instalar las dependencias, ejecutar `bash fedora/comprobar-net10.sh`. Revisa que los 31 proyectos apunten a net10.0 y compila la solución completa. El primer inicio necesita internet para NuGet.

## Probar las tres bases y los dos servicios

Mientras está abierta otra terminal con `INICIAR_FEDORA44.sh` ejecutándose:

```bash
bash fedora/verificar.sh
```

Este script comprueba las tablas de clientes/productos/órdenes, usuarios, auditoría y que la API y Blazor respondan HTTP. Para repetir las pruebas de autenticación y búsquedas, ejecutar `bash fedora/probar-sistema.sh`. Los logs están en `fedora/logs/`.

## Credenciales y datos de prueba

La cuenta de prueba de las prácticas que se conserva en el SQL original es `msanders@northwind.com`, con la clave documentada en `BaseDeDatos/03_NorthWindUsersDB.sql`. **Solo para demostración local**, nunca en producción. También se pueden registrar nuevos usuarios desde la interfaz.

- Las contraseñas del administrador SQL Server y de firma JWT son **aleatorias por instalación** y se almacenan en `fedora/.env`; nunca se incluyen en el ZIP ni en Git.
- Las tres bases se guardan en el volumen **`northwind-sql2022-datos`** de Podman. No se borran al detener o reiniciar.
- **No eliminar el contenedor ni el volumen para intentar solucionar un error sin guardar antes un respaldo.** Si se modifica `DB_SA_PASSWORD` tras crear el contenedor, dejará de coincidir con la contraseña SQL original.
- No usar esta configuración de desarrollo sin configurar TLS y otros controles necesarios en un despliegue público.

## Configuración del correo

Se mantiene la función de correo existente. El envío REAL requiere credenciales SMTP/Resend propias, que no se incluyen. Para configurarlas de forma segura y sin cambiar la cuenta Gmail receptora, ejecutar una vez:

```bash
bash fedora/configurar-correo.sh
```

Introducir un remitente ya verificado en Resend, el correo administrador y la API Key SMTP, y reiniciar `bash ./INICIAR_FEDORA44.sh`. El script guarda los valores únicamente en el `.env` local (permisos 600) y el backend los recibe mediante variables de entorno. La falta de estas credenciales **no impide** iniciar la aplicación, pero **las órdenes especiales que disparan notificación SMTP se cancelan y revierten la transacción** hasta que se configure Resend. Este comportamiento de seguridad es el mismo del proyecto original; no se simula el envío de correos. El script de correo configura los parámetros `SmtpOptions` necesarios sin incluir secretos en `appsettings.json` ni el repositorio.

## Incidencias habituales

| Incidencia | Qué comprobar |
|---|---|
| `podman: command not found` | `sudo dnf install -y podman` |
| `dotnet: command not found` | `sudo dnf install -y dotnet-sdk-10.0` |
| SQL Server no inicia | Aumentar RAM de la VM y espacio libre; `podman logs northwind-sql2022-fedora44` |
| Error `permission denied` en volumen / SELinux | Usar Podman rootless con volumen `:Z,U` tal como lo hace el script |
| Contraseña SQL incorrecta | No editar `fedora/.env` después de crear el contenedor; mantener los secretos locales |
| Puerto 14333 ocupado | Revisar `ss -ltn | grep 14333`; se puede cambiar `DB_PORT` antes de crear el contenedor |
| API no responde | `tail -n 70 fedora/logs/api.log` |
| Blazor pantalla en blanco | `tail -n 70 fedora/logs/blazor.log` y consola del navegador; comprobar la API primero |
| NuGet sin conexión | Activar internet en Fedora y repetir el comando de inicio |
| `Fedora` arranca y no aparece Swagger | Abrir `http://127.0.0.1:5254/swagger`, no `https://localhost:7154/swagger` |

El SQL original también puede importarse mediante un cliente SQL gráfico conectado a `127.0.0.1,14333` con usuario `sa` y la contraseña que está en `fedora/.env` (solo su propia VM).

## Notas de compatibilidad

- Los 31 proyectos usan `net10.0`, con paquetes Microsoft actualizados y SDK .NET 10 fijado por `global.json`.
- `wwwroot/appsettings.json` apunta a `http://127.0.0.1:5254` para Fedora. El ajuste anterior de Windows se conserva como `wwwroot/appsettings.Windows.json`.
- Los perfiles `https` originales permanecen; se agregó un perfil `fedora` en ambos proyectos para no depender de certificados.
- El ZIP no contiene un respaldo de órdenes antiguas de Windows: los scripts recrean el esquema y los datos de demostración. Para trasladar ventas previas se necesita un `.bak` de SQL Server o un procedimiento de exportación y restauración.
- Los scripts PowerShell originales siguen en el ZIP para Windows, pero **en Fedora se usa Bash** y se configuran JWT y conexiones desde variables de entorno.
