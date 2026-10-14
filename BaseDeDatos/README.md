# Bases de datos de NorthWind (SQL Server LocalDB)

Los archivos `.sql` permiten crear en una instalación local de SQL Server las **tres bases** del proyecto, sin publicar los archivos físicos `.mdf` ni `.ldf`.

| Archivo | Uso |
|---|---|
| `00_Crear_Todo_NorthWind.sql` | Crea las tres bases, sus tablas y sus datos iniciales en una sola ejecución. **Es el recomendado**. |
| `01_NorthWindDB.sql` | Crea la base principal de clientes, productos, órdenes y detalles. |
| `02_NorthWindLogsDB.sql` | Crea la base de registro de eventos (`DomainLogs`), inicialmente vacía. |
| `03_NorthWindUsersDB.sql` | Crea el esquema ASP.NET Core Identity y un usuario **solo de demostración**. |
| `04_Verificar_Bases.sql` | Muestra qué bases, tablas y registros existen tras instalar los scripts. |
| `Guia_Crear_Bases_NorthWind_LocalDB.pdf` | Guía complementaria original de instalación. |

## Instalación (Visual Studio / SSMS)

1. Compruebe que SQL Server LocalDB esté instalado (normalmente junto con Visual Studio).
2. Abra **SQL Server Object Explorer** en Visual Studio, o **SQL Server Management Studio (SSMS)**.
3. Conéctese con autenticación de Windows al servidor `(localdb)\MSSQLLocalDB`.
4. Abra `00_Crear_Todo_NorthWind.sql` como nueva consulta y ejecute todo el script (incluidos los lotes separados por `GO`).
5. Abra y ejecute `04_Verificar_Bases.sql`.
6. Verifique que existen `NorthWindDB`, `NorthWindLogsDB` y `NorthWindUsersDB`.

**Alternativa:** ejecute los scripts `01`, `02` y `03`, **en ese orden**, en vez del archivo `00`. No es necesario ejecutar ambos métodos.

**Importante:** los scripts no son una copia de los datos privados de una instalación en uso: reconstruyen el esquema y únicamente los datos de ejemplo definidos en las prácticas. El historial de migraciones de Entity Framework se marca como aplicado para el esquema que crean los scripts. **No ejecute a ciegas migraciones sobre un esquema existente** sin revisarlas primero.

## Datos iniciales

- `NorthWindDB`: 3 clientes y 5 productos de ejemplo; órdenes nuevas se crean desde la aplicación.
- `NorthWindLogsDB`: sin logs inventados; se generan al realizar operaciones.
- `NorthWindUsersDB`: cuenta académica precargada únicamente para pruebas locales (consulte el propio script para la demostración). **Cámbiela o elimínela antes de publicar la aplicación**, porque el repositorio contiene el script de inicialización.

La Web API toma sus conexiones de `appsettings.json`, sección `DBOptions` y `MembershipDBOptions`. Si cambia de servidor, configure las conexiones locales antes de iniciar la API.
