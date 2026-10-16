# NorthWind — Actualización exclusiva del frontend

Este paquete parte del `NorthWind.zip` compartido en esta conversación. Solo modifica **dos archivos** del frontend Blazor. No modifica SQL Server, API, entidades, repositorios, seguridad ni lógica de guardado.

## Instalar

1. Cierra Visual Studio y guarda una copia del proyecto actual.
2. Extrae este ZIP en una carpeta temporal.
3. Copia **las dos carpetas** `3. Interface Adapters` y `4. Frameworks And Drivers` dentro de la carpeta raíz de tu proyecto `NorthWind`, permitiendo **combinar carpetas y sobrescribir únicamente los dos archivos** que contiene el parche. No elimines ninguna carpeta existente.
4. Abre tu solución `NorthWind.sln` y compila. Inicia el frontend como habitualmente.
5. Registra una orden de prueba con un cliente y productos válidos. Tras confirmar y recibir el ID del servidor, debe mostrarse el nuevo modal. Pulsa **Ver orden**: navega a `/invoices?orderId=<id>` y la página existente de consultas carga automáticamente el detalle real desde la API.

## Archivos modificados

- `3. Interface Adapters/Views/NorthWind.Sales.Frontend.Views/Components/CreateOrderComponent.razor`
- `4. Frameworks And Drivers/UIs/NorthWind.Sales.BlazorClient/wwwroot/css/app.css`

## Comportamiento

- El modal **no aparece** cuando la operación falla o no devuelve identificador válido.
- Incluye número de orden, cliente, cantidad de productos y total calculado por el ViewModel existente.
- **Ver orden** aprovecha `InvoiceSearch.razor`, que ya soporta el parámetro de consulta `orderId` y consulta el detalle persistido mediante `ISalesQueriesGateway.GetOrderInvoiceAsync`.
- **Cerrar** cierra el modal y mantiene accesible la confirmación anterior y su enlace. Puedes usar **Crear otra orden** para iniciar una venta nueva.
- Respeta el tema claro/oscuro actual y se adapta a pantallas pequeñas.

## Verificación

Se han inspeccionado el código y las rutas reales dentro del ZIP proporcionado; se verificaron la estructura del parche y sus referencias. **No fue posible compilar ni ejecutar el proyecto original .NET 8 en este entorno**, por lo que corresponde hacer la prueba final en Visual Studio con la API y SQL Server disponibles.
