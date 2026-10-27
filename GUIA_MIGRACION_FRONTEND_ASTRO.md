# NorthWind — Solo Astro como interfaz web

Se eliminó el frontend anterior basado en Blazor/Razor: sus ocho proyectos C#, vistas, integración HTTP de cliente y referencias de solución. **No se modificó ningún archivo de código del backend**. Las soluciones `.sln` ahora solo incluyen proyectos de la API, dominio y servicios relacionados.

## Estructura de ejecución

- Backend: `4. Frameworks And Drivers/UI/NorthWind.Sales.WebApi` — `https://localhost:7154`
- Único frontend: `Frontend-Astro/` — `http://localhost:4321`
- Bases: `NorthWindDB`, `NorthWindLogsDB` y `NorthWindUsersDB`

## Cómo ejecutar (PowerShell)

Terminal 1, desde la raíz del proyecto:

```powershell
dotnet restore .\NorthWind.sln
dotnet build .\NorthWind.sln
dotnet run --project '.\4. Frameworks And Drivers\UI\NorthWind.Sales.WebApi\NorthWind.Sales.WebApi.csproj'
```

Terminal 2, desde la raíz:

```powershell
cd .\Frontend-Astro
npm install
npm run dev
```

Abre `http://localhost:4321/login`. Verifica el registro, clientes, productos, modales, órdenes, PDF y el aviso por Gmail desde una orden con cuatro productos distintos. Resend se configura **solo en la API**, nunca en Astro. Si se usa otra URL para la API, indica `PUBLIC_API_URL` en `Frontend-Astro/.env` y no subas ese archivo a GitHub.

## Si ya tienes el proyecto antiguo en tu PC

1. Haz copia de seguridad de la carpeta y detén Visual Studio, API y servidor web.
2. **Extrae este ZIP en una carpeta vacía**, recomendado para que no queden archivos antiguos.
3. Como alternativa, si copias el ZIP encima de tu carpeta actual, ejecuta `Eliminar-Frontend-Anterior.ps1` desde la raíz para borrar los ocho proyectos obsoletos; las soluciones `.sln` del ZIP ya estarán actualizadas.
4. Ejecuta `git status` y verifica que Git reconozca las carpetas antiguas como eliminadas, sin tocar el backend.
5. Revisa `appsettings.json` por posibles credenciales antes de publicar; .NET User Secrets es local.

## GitHub (repositorio previamente inicializado)

```bash
git status
git add -A
git diff --cached --stat
git commit -m "Dejar Astro como unico frontend de NorthWind"
git pull --rebase origin main
git push origin main
```

No subir `.vs`, `bin`, `obj`, `node_modules`, `dist`, `.env` o archivos de claves. Los datos existentes de LocalDB no se copian solos a GitHub: se incluyen scripts SQL.

Más información sobre pantallas, endpoints y limitaciones en `Frontend-Astro/README.md`.
