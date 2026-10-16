# Matriz de pruebas — Prácticas 9, 11 y 12

| Caso | Orden | Notificación | Persistencia |
|---|---|---|---|
| 01 | 1 producto distinto | No | Confirmada |
| 02 | 3 productos distintos | No | Confirmada |
| 03 | 4 productos distintos | Sí, automática | Confirmada solo si SMTP acepta |
| 04 | 5 productos distintos | Sí, automática | Confirmada solo si SMTP acepta |
| 05 | 4 líneas con un `ProductId` repetido (3 distintos) | No | Confirmada, cantidades fusionadas |
| 06 | 4 productos y stock insuficiente | No | Rechazada |
| 07 | 4 productos y token Resend inválido | SMTP rechazado | Rollback y auditoría `Creación de orden ... cancelada` |

## Evidencias que debe capturar el estudiante

1. Formulario de orden de 3 productos (sin correo).
2. Formulario y confirmación de 4 productos diferentes.
3. Gmail administrador: asunto de orden especial y detalle del correo real.
4. Historial de Resend con la operación de envío.
5. SQL: `Orders` y `OrderDetails` antes y después del éxito.
6. Error SMTP simulado con token inválido (sin mostrar credenciales) y rollback comprobado en SQL.
7. Tabla `NorthWindLogsDB.dbo.DomainLogs` con cancelación registrada.

**Estas son pruebas previstas, no resultados ya ejecutados.** El paquete no contiene evidencias ficticias.
