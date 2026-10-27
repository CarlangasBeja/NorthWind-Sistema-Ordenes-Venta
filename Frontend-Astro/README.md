# NorthWind — Frontend Astro

Frontend profesional desarrollado con **Astro 5 y TypeScript**. Es el único frontend incluido en el repositorio y consume la API ASP.NET Core 8 existente, sin modificar sus endpoints, la autenticación JWT, SQL Server ni el servicio de correos.

## 1. Requisitos

- Windows 10/11 y Node.js compatible con Astro 5 (se recomienda Node.js 22 LTS).
- API NorthWind funcionando en `https://localhost:7154`.
- Bases de datos `NorthWindDB`, `NorthWindLogsDB` y `NorthWindUsersDB` ya restauradas.
- JWT (`Configurar-Desarrollo.ps1`) y Resend (`Configurar-Resend.ps1`) configurados *en el backend*. Las contraseñas y API Keys nunca van al frontend.

## 2. Ejecutar

En una terminal PowerShell situada en la raíz del proyecto NorthWind, inicia el **backend**, que no se modifica:

```powershell
dotnet run --project '.\4. Frameworks And Drivers\UI\NorthWind.Sales.WebApi\NorthWind.Sales.WebApi.csproj'
```

Comprueba `https://localhost:7154/swagger`.

En otra terminal:

```powershell
cd .\Frontend-Astro
npm install
npm run dev
```

Visita **http://localhost:4321/login**. Este paquete ya no incluye un cliente .NET adicional; Astro es la única interfaz web. Registra una cuenta desde `/register` o ingresa con una cuenta existente.

Si tu API utiliza otra dirección, crea un archivo `.env` (sin incluirlo en Git) con:

```env
PUBLIC_API_URL=https://localhost:7154
```

La variable contiene solo la dirección de la API, nunca claves privadas. Si tu navegador rechaza certificados locales ejecuta `dotnet dev-certs https --trust` en PowerShell y acepta el certificado.

Para comprobar la compilación de Astro:

```bash
npm run build
npm run preview
```

## Mejoras de rendimiento y experiencia de usuario (v1.1)

- **Clientes y Productos**: buscan automáticamente al escribir (espera breve de 320 ms), cancelan peticiones anteriores para evitar que una respuesta lenta reemplace a una nueva, y conservan durante 45 segundos los últimos resultados en la **caché de sesión**. Al volver a la pantalla, los resultados de caché aparecen primero mientras se solicitan datos actuales a SQL Server. La caché se elimina al cerrar sesión y se invalida al crear/modificar un cliente o registrar una orden.
- **Tiempo de espera controlado**: tras 17 segundos sin respuesta de la API, se muestra un error y el botón **Reintentar** en vez de un indicador infinito. Esto no acelera SQL Server ni sustituye una conexión lenta: evita que la interfaz quede aparentemente bloqueada.
- **Conexión real**: el indicador superior solo se pone verde cuando alguna petición recibe respuesta del servidor; se pone rojo ante una falla de conexión.
- **Interfaz actualizada**: tabla legible, navegación con íconos SVG, botones alineados (sin superponer la fecha), modo claro/oscuro, carga visual de filas y respuesta móvil.
- **Registro de usuario**: las casillas **Contraseña** y **Confirmar contraseña** tienen botones independientes para *Ver/Ocultar*, con controles accesibles. Se conserva la comprobación de requisitos y coincidencia.

**Diagnóstico de carga lenta:** abre F12 → Network → Fetch/XHR, revisa cuánto tarda la llamada a `/api/customers/search` o `/api/products/search`. Si la petición tarda muchos segundos aun con caché, el cuello de botella está en la API, la conexión o LocalDB, que no se modificaron. Comprueba también `https://localhost:7154/swagger` y ejecuta `dotnet dev-certs https --trust` si hay un error de certificado.

## 3. Funcionalidades migradas

| Ruta | Características |
| --- | --- |
| `/login` | Login real con `POST /user/Login`, token JWT en `sessionStorage` y mostrar contraseña |
| `/register` | Registro con `POST /user/Register`, validaciones, dos botones Ver/Ocultar y modal de confirmación |
| `/` | Panel con indicadores reales, actividad reciente y accesos rápidos |
| `/customers` | Buscador con filtros y paginación, modal **Agregar cliente**, modal **Modificar saldo**, estado de deuda |
| `/products` | Catálogo por código o nombre, precio, inventario, agotados y paginación |
| `/createorder` | Seleccionar cliente/productos por modal, cantidades, stock, eliminación/cambio con confirmación, IVA 15 %, guardar con confirmación, éxito con **Ver orden** y advertencia al salir |
| `/invoices` | Filtros por orden/cliente, paginación, modal de detalle, abrir/descargar PDF autorizado |

**Correo automático:** permanece exclusivamente en el backend. Después de crear una orden especial con cuatro o más productos distintos, se envía al Gmail del administrador configurado con Resend. Los datos reales de cliente/producto en el correo siguen generándose en la API.

**Validación por deuda:** si `Customers.CurrentBalance > 0`, la selección de ese cliente se bloquea en el frontend; el backend lo valida nuevamente.

## 4. Pruebas rápidas

1. Abre `/login`, ingresa con un usuario válido y confirma la navegación al inicio.
2. En **Clientes**, registra uno nuevo con `EC099` y saldo cero. Luego usa el modal **Modificar saldo** y coloca `$50`; verifica el bloqueo.
3. En **Productos**, comprueba artículos con y sin stock.
4. En **Nueva orden**, selecciona un cliente sin deuda; añade cuatro productos distintos. Cambia cantidades, revisa el IVA y confirma.
5. Tras guardar, aparece el modal de éxito con **Ver orden**, que abre el detalle en `/invoices`.
6. Verifica que la API guardó la orden y, con Resend previamente configurado, que Gmail recibió la notificación con nombres y códigos reales.
7. Descarga el PDF y comprueba el número y los detalles.
8. Activa el modo oscuro y comprueba la vista en móvil.

## 5. Seguridad y limitaciones

- El token se guarda en `sessionStorage` y desaparece al cerrar la sesión/pestaña; no se escribe en el repositorio.
- Este frontend consume las mismas rutas existentes y no modifica permisos. **El backend actualmente solo exige autenticación en los endpoints comerciales: no hay autorización real por roles administrador/usuario**, ni una API de edición del perfil; una restricción visual no sustituiría estas validaciones.
- No existe venta a crédito automática: el saldo pendiente puede editarse manualmente y bloquea ventas posteriores. Implementar crédito al generar órdenes necesitaría modificar backend y base de datos, fuera del alcance de esta migración.
- La confirmación de una orden depende de la respuesta real `POST /CreateOrder`. Las reglas de transacción/envío del correo las conserva el backend original.
- El botón «Ver PDF» requiere que el navegador permita nuevas pestañas. «Descargar PDF» funciona con autenticación sin exponer el token en la URL.

## 6. Archivos y arquitectura

```text
Frontend-Astro/
├── astro.config.mjs
├── package.json
├── .env.example
├── public/favicon.svg
└── src/
    ├── layouts/AppLayout.astro
    ├── pages/           # Rutas Astro
    ├── lib/api.ts       # Cliente HTTP JWT y DTO tipados
    ├── lib/ui.ts        # Modales, toasts y paginación
    ├── scripts/         # Comportamiento TypeScript por página
    └── styles/global.css
```

## 7. Publicar en GitHub

Desde la raíz `NorthWind`:

```bash
git add .gitignore Frontend-Astro/
git diff --cached --name-only
git commit -m "Dejar Astro como interfaz unica de NorthWind"
git pull --rebase origin main
git push origin main
```

Nunca hagas `git add -f` de `.env`, `node_modules`, `dist`, `secrets.json` ni claves de Resend/JWT.

> **Validación en la entrega:** los scripts TypeScript fueron comprobados con el compilador `tsc`. No fue posible ejecutar `npm install` ni `astro build` en el entorno de preparación porque el registro npm no era accesible. Haz ambas verificaciones en tu equipo antes de entregar la práctica.
