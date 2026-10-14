/*
    NORTHWIND - CARGA DE DATOS ADICIONALES
    Base: NorthWindDB (SQL Server LocalDB)
    Agrega 10 clientes ficticios y 10 productos de supermercado en español.
    No elimina ni modifica registros existentes.
    Es idempotente: puede ejecutarse varias veces sin duplicar estos datos.
    Precios de EJEMPLO en USD; no son cotizaciones comerciales.
*/

USE [NorthWindDB];
GO
SET NOCOUNT ON;
SET XACT_ABORT ON;

BEGIN TRY
    BEGIN TRANSACTION;

    -- Clientes: Id es nchar(5), Name nvarchar(60), CurrentBalance money.
    DECLARE @Clientes TABLE
    (
        Id nchar(5) NOT NULL PRIMARY KEY,
        Name nvarchar(60) NOT NULL,
        CurrentBalance money NOT NULL
    );

    INSERT INTO @Clientes (Id, Name, CurrentBalance)
    VALUES
        (N'EC001', N'María Fernanda López',         0.00),
        (N'EC002', N'Juan Carlos Paredes',         0.00),
        (N'EC003', N'Valeria Alejandra Sánchez',   0.00),
        (N'EC004', N'Andrés Felipe Molina',        0.00),
        (N'EC005', N'Daniela Carolina Ruiz',       0.00),
        (N'EC006', N'Luis Alberto Morales',        0.00),
        (N'EC007', N'Camila Estefanía Torres',     0.00),
        (N'EC008', N'José David Salazar',          0.00),
        (N'EC009', N'Paola Cristina Vega',         0.00),
        (N'EC010', N'Miguel Ángel Herrera',        0.00);

    INSERT INTO dbo.Customers ([Id], [Name], [CurrentBalance])
    SELECT c.Id, c.Name, c.CurrentBalance
    FROM @Clientes AS c
    WHERE NOT EXISTS
    (
        SELECT 1
        FROM dbo.Customers AS existente WITH (UPDLOCK, HOLDLOCK)
        WHERE existente.Id = c.Id
    );

    -- Productos: Id es IDENTITY (se genera automáticamente).
    -- Name nvarchar(80), UnitsInStock smallint, UnitPrice money.
    DECLARE @Productos TABLE
    (
        Name nvarchar(80) NOT NULL PRIMARY KEY,
        UnitsInStock smallint NOT NULL,
        UnitPrice money NOT NULL
    );

    INSERT INTO @Productos (Name, UnitsInStock, UnitPrice)
    VALUES
        (N'Arroz blanco 1 kg',                   85, 1.60),
        (N'Aceite de girasol 1 L',               45, 3.45),
        (N'Leche entera UHT 1 L',                90, 1.15),
        (N'Atún en agua 170 g',                  70, 1.80),
        (N'Azúcar blanca 1 kg',                  75, 1.20),
        (N'Café molido 250 g',                   40, 4.50),
        (N'Pasta espagueti 400 g',               85, 1.10),
        (N'Harina de trigo 1 kg',                65, 1.30),
        (N'Galletas de avena 6 unidades',        60, 2.10),
        (N'Detergente líquido 1 L',              50, 3.90);

    INSERT INTO dbo.Products ([Name], [UnitsInStock], [UnitPrice])
    SELECT p.Name, p.UnitsInStock, p.UnitPrice
    FROM @Productos AS p
    WHERE NOT EXISTS
    (
        SELECT 1
        FROM dbo.Products AS existente WITH (UPDLOCK, HOLDLOCK)
        WHERE existente.Name = p.Name
    );

    COMMIT TRANSACTION;
    PRINT N'Carga completada. Datos existentes conservados.';
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;

-- Verificación. Los totales pueden superar 15 y 13 si ya había otros datos.
SELECT [Id], [Name], [UnitsInStock], [UnitPrice]
FROM dbo.Products
ORDER BY [Id];

SELECT [Id], [Name], [CurrentBalance]
FROM dbo.Customers
ORDER BY [Id];

SELECT (SELECT COUNT(*) FROM dbo.Products) AS TotalProductos,
       (SELECT COUNT(*) FROM dbo.Customers) AS TotalClientes;
GO
