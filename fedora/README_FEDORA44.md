# Ejecutar NorthWind (API .NET 8 + Astro) en Fedora 44

En Fedora no existe SQL Server LocalDB (es solo para Windows), así que estos scripts usan **SQL Server 2022 en un contenedor Podman**, ejecutan la API por **HTTP** (sin certificado de desarrollo) e inician **Astro** apuntando a esa API. La configuración de Windows no cambia.

## Requisitos

- Fedora 44 **x86_64** (la imagen de SQL Server no funciona en ARM).
- 4 GB de RAM como mínimo para SQL Server (se recomiendan 6–8 GB si es una máquina virtual).
- Internet la primera vez (DNF, NuGet, npm e imagen de SQL Server).
- Un usuario con `sudo`. No ejecutar como root: Podman se usa sin root.

## Inicio

Desde la carpeta del proyecto (la que contiene `NorthWind.sln`):

```bash
bash INICIAR_FEDORA44.sh
```

El script hace todo automáticamente:

1. Instala lo que falte con DNF: `dotnet-sdk-8.0`, `nodejs`, `npm`, `podman`, `openssl`, `curl`, `python3`.
2. Genera claves aleatorias locales en `fedora/.env` (permisos 600; Git las ignora).
3. Descarga e inicia SQL Server 2022 en Podman, en `127.0.0.1:14333`, con un volumen persistente.
4. Crea las bases `NorthWindDB`, `NorthWindLogsDB` y `NorthWindUsersDB` con los scripts de `BaseDeDatos/`.
5. Compila `NorthWind.sln` y ejecuta `npm ci` en `Frontend-Astro` (solo la primera vez).
6. Inicia la API en `http://127.0.0.1:5254` (perfil `fedora`) y Astro en `http://127.0.0.1:4321`.
7. Prueba el inicio de sesión JWT y las búsquedas de clientes, productos y órdenes.

Abrir en el navegador:

- **Aplicación:** http://127.0.0.1:4321/login
- **Swagger:** http://127.0.0.1:5254/swagger
- Usuario de demostración: `msanders@northwind.com` / `Mm1234567$`

Para detener la API y Astro, pulsar **Ctrl+C**. SQL Server sigue activo y conserva los datos. Para detenerlo:

```bash
bash fedora/detener-sql.sh
```

## Otros scripts

| Comando | Para qué sirve |
|---|---|
| `bash fedora/verificar.sh` | Cuenta registros de las 3 bases y comprueba que la API y Astro respondan (con la app en marcha). |
| `bash fedora/probar-sistema.sh` | Repite la prueba de login JWT y las búsquedas. |
| `bash fedora/configurar-correo.sh` | Guarda el remitente, el administrador y la API Key de Resend en `fedora/.env` para el correo real. Equivale a `Configurar-Resend.ps1`. |

Sin Resend configurado la aplicación funciona igual, salvo que las órdenes especiales que envían correo no se completan, igual que en Windows.

## Problemas frecuentes

| Problema | Qué revisar |
|---|---|
| SQL Server no arranca | Más RAM o disco libre; `podman logs northwind-astro-sql2022` |
| `permission denied` en el volumen (SELinux) | Usar Podman sin root, como hace el script (`:Z,U`) |
| Contraseña SQL incorrecta | No editar `fedora/.env` después de crear el contenedor |
| Puerto 14333 ocupado | `ss -ltn \| grep 14333`; cambiar `DB_PORT` en `fedora/.env` antes de crear el contenedor |
| La API no responde | `tail -n 80 fedora/logs/api.log` |
| Astro no carga o no ve la API | `tail -n 80 fedora/logs/astro.log`; usar `http://127.0.0.1:5254`, no `https://localhost:7154` |
| Falla la compilación | `fedora/logs/build.log` (NuGet necesita internet la primera vez) |
| `$'\r': command not found` | El archivo `.sh` se guardó con finales CRLF de Windows; ejecutar `sed -i 's/\r$//' fedora/*.sh INICIAR_FEDORA44.sh` |

## Qué se cambió en el proyecto

- `fedora/` e `INICIAR_FEDORA44.sh`: scripts Bash que sustituyen a los `.ps1` en Fedora.
- `launchSettings.json` de la API: nuevo perfil `fedora` (HTTP en `127.0.0.1:5254`). El perfil `https` de Windows sigue igual.
- Las fábricas de contexto de EF Core (`NorthWindContext`, `NorthWindDomainLogsContextFactory`, `NorthWindMembershipContextFactory`) leen la cadena de conexión de la variable de entorno si existe; si no, usan LocalDB como antes.
- `.gitattributes`: los `.sh` se guardan siempre con finales LF.
- `.gitignore`: ignora `fedora/.env` y `fedora/logs/`.
