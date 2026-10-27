# Actualización: Clientes en modales y explicación de ventas a crédito

## Cambios incluidos

- Botón **Agregar cliente** en el encabezado de la página `/customers`.
- Modal independiente para registrar un cliente (código único de cinco caracteres, nombre y saldo inicial).
- Modal independiente para **Modificar saldo** de un cliente existente.
- Mensajes de error dentro de cada ventana, botones de cancelar y bloqueo del doble guardado.
- Después del alta, búsqueda automática por el código del cliente creado.

## Comprobar el alta real en SQL Server

El botón usa `POST /api/customers`; el backend utiliza `CustomerManagementInteractor.Create` y guarda en `NorthWindDB.dbo.Customers`. Requiere iniciar sesión.

1. Inicia backend y cliente Blazor en terminales separadas.
2. Abre `https://localhost:7254/customers`.
3. Pulsa **Agregar cliente**.
4. Completa `EC099`, `Cliente de Prueba Crédito`, `0` y pulsa **Guardar cliente**.
5. Debe cerrar el modal, mostrar confirmación y filtrar por `EC099`.
6. En SQL Server, ejecuta:

```sql
USE NorthWindDB;
SELECT Id, Name, CurrentBalance FROM dbo.Customers WHERE Id = 'EC099';
```

7. Vuelve a intentar registrar `EC099`: debe rechazarse por código repetido.
8. Pulsa **Modificar saldo** en `EC099`, establece `65.50` y guarda. Su estado debe ser **Compra bloqueada**.
9. Cambia ese saldo a `0` para habilitar al cliente nuevamente.

## Sobre endeudarse mediante una orden de venta

**La versión actual NO genera deuda automáticamente al guardar una orden.**

En el backend, `CreateOrderCustomerValidator` impide comprar si `CurrentBalance > 0`; y `CreateOrderInteractor` solo persiste la orden/detalles y rebaja existencias. No aumenta el saldo por cobrar. Por eso, modificar el saldo manualmente es una demostración de la validación, no una venta a crédito.

Para implementar ventas a crédito en otra iteración del proyecto, se requiere:

1. Añadir método de pago `Contado` / `Crédito` o campo `MontoPagado` al formulario de crear orden.
2. Definir el cálculo `DeudaGenerada = TotalOrden - MontoPagado`, validando `0 <= MontoPagado <= TotalOrden`.
3. En el backend, verificar cliente e inventario y persistir orden, detalles, descuento de stock e incremento de `Customers.CurrentBalance` dentro de una misma transacción.
4. Definir las reglas de crédito para clientes que ya deben dinero (bloquear o permitir crédito adicional con límite), ajustando la validación existente.
5. Registrar pago parcial o total mediante una operación dedicada, no modificando manualmente `CurrentBalance` en un sistema productivo.
6. Conservar la regla de correo especial si la orden contiene 4 o más productos distintos y las transacciones definidas por la práctica.
7. Añadir pruebas de compras al contado, al crédito, pagos parciales, rollback, stock insuficiente y notificación.

**Ejemplo:** si el total de una orden es $45,00 y se pagan $15,00, el saldo nuevo por cobrar sería $30,00, pero ese automatismo aún no existe en el código de esta actualización.

## Alcance

Este paquete **solo cambia la pantalla de clientes y el CSS del cliente Blazor**. No altera el código de creación de órdenes, el servicio de Gmail, las bases de datos ni las credenciales en User Secrets.
