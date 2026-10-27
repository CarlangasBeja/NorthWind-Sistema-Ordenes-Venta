# NorthWind — Guía para probar Astro (sin modificar backend)

## Paso 1. Ejecutar API

En PowerShell, desde la carpeta `NorthWind`:

```powershell
dotnet run --project '.\4. Frameworks And Drivers\UI\NorthWind.Sales.WebApi\NorthWind.Sales.WebApi.csproj'
```

Comprobar `https://localhost:7154/swagger`. Mantén el backend en ejecución.

## Paso 2. Ejecutar Astro

Abre otra terminal:

```powershell
cd .\Frontend-Astro
npm install
npm run dev
```

Entra a **http://localhost:4321/login** y accede con un usuario existente.

## Paso 3. Comprobar Clientes y Productos

1. Entra a **Clientes**; la primera consulta viene de SQL Server. En visitas posteriores, dentro de 45 segundos, aparecen resultados recientes de inmediato y se actualizan en segundo plano.
2. Escribe parte de un nombre: la búsqueda se ejecuta tras 320 ms sin escribir. Prueba cambiar la búsqueda rápido; ya no se descartan las peticiones nuevas.
3. Abre **Agregar cliente**, crea un cliente de prueba y comprueba que se actualiza la tabla.
4. Pulsa **Modificar saldo**, cambia el saldo y comprueba el estado de deuda actualizado.
5. Abre **Productos** y consulta por código y por nombre. Comprueba el stock y los artículos agotados.
6. Desconecta la API y vuelve a cargar los catálogos; después del tiempo de espera aparecerá un mensaje claro y **Reintentar**. Vuelve a iniciar la API y utiliza el botón.

## Paso 4. Registro: mostrar contraseñas

1. Entra a `http://localhost:4321/register`.
2. Escribe una contraseña y una confirmación diferente.
3. Pulsa **Ver** en la primera: solo la contraseña principal se muestra.
4. Pulsa **Ver** en la segunda: ahora puedes verificar la confirmación.
5. Pulsa **Ocultar** en cada una. La comprobación visual de contraseñas iguales sigue funcionando.
6. Completa el formulario para registrar el usuario en la API.

## Paso 5. Comprobar solicitudes lentas

En Chrome/Brave pulsa **F12 → Network → Fetch/XHR**. Selecciona la llamada `/api/customers/search` y consulta **Timing**.

- Si la petición tarda mucho, revisar SQL Server LocalDB y los mensajes del backend. Astro no puede acelerar consultas ejecutadas en SQL Server.
- Si aparece **CORS** o **ERR_CERT_AUTHORITY_INVALID**, revisa `https://localhost:7154/swagger`, ejecuta `dotnet dev-certs https --trust` y reinicia el navegador.
- Si no aparecen peticiones, revisa `Frontend-Astro/.env` y que `PUBLIC_API_URL` coincida con la URL de tu backend.

## Importante: cambios mínimos

Solo cambiaron archivos del frontend Astro y esta guía. El backend, el envío de Gmail, las reglas de las órdenes, la autenticación JWT y las tres bases SQL siguen como estaban.
