# Matriz de verificación — práctica 9 / evento de dominio

| Prueba | Entradas | ¿Se registra la orden? | ¿Se intenta enviar correo? |
|:--|:--|:--:|:--:|
| 01 | 1 producto distinto | Sí | No |
| 02 | 3 productos distintos | Sí | No |
| 03 | 4 productos distintos | Sí | Sí |
| 04 | 5 productos distintos | Sí | Sí |
| 05 | 4 renglones, 2 de ellos del mismo ID (3 distintos) | Sí, fusiona las cantidades | No |
| 06 | 4 distintos pero stock insuficiente | No | No |
| 07 | 4 distintos con contraseña Gmail inválida | Sí | Sí, falla y registra el error; la orden no se revierte |

**Validaciones manuales:** confirme el `OrderId` en `Orders`, los IDs y cantidades en `OrderDetails`, el evento en la consola de Web API y, en casos 03–04, el mensaje *recibido realmente* en la cuenta configurada. La aceptación SMTP no equivale a confirmación de entrega.

**Estado de esta entrega:** verificada estáticamente; sin envío real ni compilación de .NET en este entorno. Las casillas no representan pruebas ejecutadas.
