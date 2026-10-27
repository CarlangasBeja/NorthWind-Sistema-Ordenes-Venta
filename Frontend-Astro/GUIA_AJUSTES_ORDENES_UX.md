# NorthWind Astro — mejoras de órdenes y ventanas modales

## Qué se modificó

- **Detalle de productos:** ahora son tarjetas fluidas. Código, nombre completo, disponibilidad, precio unitario, cantidad, subtotal y acciones se ven sin desplazamiento horizontal.
- **Campos obligatorios:** en Crear orden se utilizan validaciones personalizadas (`novalidate`) con mensaje bajo el campo, borde destacado y notificación; las demás pantallas suprimen la burbuja nativa y señalan el campo inválido.
- **Modales:** no se cierran al hacer clic fuera ni con Escape. Se cierran con la X o con botones explícitos («Cancelar», «Conservar», «Guardar», etc.) según cada acción.
- **Salir de una orden:** al usar el botón Cancelar, enlaces de navegación internos o Cerrar sesión con cambios pendientes se abre una confirmación visual con «Continuar editando» o «Salir sin guardar».
- **Recuperación de borrador:** si el navegador recarga la página, se restauran temporalmente los datos de entrega, cliente y productos usando `sessionStorage`, separados por el usuario activo. No se envían datos a un servidor adicional y se borran al descartar o guardar. Antes de confirmar siempre se aplican las validaciones del backend.

## Instalar solamente el frontend

1. Detener el proceso Astro con `Ctrl + C`.
2. Copiar `Frontend-Astro/` sobre la carpeta del proyecto existente, respetando las rutas.
3. Abrir PowerShell en `NorthWind/Frontend-Astro/`.
4. Ejecutar `npm install` (si todavía no se instalaron dependencias) y `npm run dev`.
5. Abrir `http://localhost:4321/createorder` y forzar recarga con `Ctrl + Shift + R`.
6. Mantener funcionando por separado el backend original en `https://localhost:7154`.

## Comprobaciones de aceptación

1. Crear una orden con un producto y comprobar que **no aparece barra horizontal** en el detalle de productos.
2. Elegir cliente y productos; dejar la dirección vacía; pulsar **Revisar y guardar**. Debe verse una advertencia bajo Dirección de entrega y una mini notificación, no el aviso nativo del navegador.
3. Abrir Buscar producto; pulsar fuera y luego Escape. La ventana debe permanecer abierta. Pulsar X y verificar que sí se cierra.
4. Dejar una orden sin guardar y pulsar **Cancelar y salir**; se abre una confirmación personalizada. Pulsar «Continuar editando» para conservar los datos. Pulsar «Salir sin guardar» para descartar y volver al Inicio.
5. Repetir la operación desde el menú lateral y comprobar la misma confirmación.
6. Recargar durante una compra incompleta: los datos se restauran en la sesión activa y aparecen como borrador. **Cerrar la pestaña** no muestra un aviso personalizado porque los navegadores no permiten personalizar la confirmación del cierre; el borrador de `sessionStorage` tampoco se garantiza al cerrar definitivamente la pestaña.
7. Completar una orden y confirmar que funcionan el modal de éxito, el botón Ver orden, el cálculo del IVA y las notificaciones de Gmail del backend.

## Alcance

Solo se han cambiado archivos dentro de `Frontend-Astro/`. Ningún archivo .NET, SQL ni configuración SMTP/Resend ha sido modificado. El envío real de correo sigue dependiendo de la configuración local del backend.
