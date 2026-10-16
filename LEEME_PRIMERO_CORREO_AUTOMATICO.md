# LEEME PRIMERO — correo automático del administrador

- **Usuario:** no introduce ningún email al comprar.
- **Administrador:** recibe correo HTML al crear una orden con 4 o más productos distintos.
- **Configuración inicial:** `Configurar-Resend.ps1` (una vez, en la computadora que ejecuta la API). Gmail solo recibe; no se configura.
- **Práctica 11:** SMTP falla ⇒ rollback de la orden e inventario, y auditoría de cancelación.
- **Pruebas completas:** `GUIA_RESEND_SIN_CAMBIOS_GMAIL.md`.

Esta versión conserva las tres bases y la interfaz del proyecto; añade la corrección transaccional de las prácticas 9 y 11.
