/*
    NORTHWIND - BASE PRINCIPAL
    Instancia: (localdb)\MSSQLLocalDB
    Base: NorthWindDB
    Basado en las migraciones y datos seed de las practicas.

    Este script NO elimina una base existente.
*/

USE [master];
GO

IF DB_ID(N'NorthWindDB') IS NULL
BEGIN
    CREATE DATABASE [NorthWindDB];
END;
GO

USE [NorthWindDB];
GO

IF OBJECT_ID(N'[dbo].[__EFMigrationsHistory]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[__EFMigrationsHistory]
    (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

IF OBJECT_ID(N'[dbo].[Customers]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[Customers]
    (
        [Id] nchar(5) NOT NULL,
        [Name] nvarchar(60) NOT NULL,
        [CurrentBalance] money NOT NULL,
        CONSTRAINT [PK_Customers] PRIMARY KEY ([Id])
    );
END;
GO

IF OBJECT_ID(N'[dbo].[Products]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[Products]
    (
        [Id] int IDENTITY(1,1) NOT NULL,
        [Name] nvarchar(80) NOT NULL,
        [UnitsInStock] smallint NOT NULL,
        [UnitPrice] money NOT NULL,
        CONSTRAINT [PK_Products] PRIMARY KEY ([Id])
    );
END;
GO

IF OBJECT_ID(N'[dbo].[Orders]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[Orders]
    (
        [Id] int IDENTITY(1,1) NOT NULL,
        [CustomerId] nchar(5) NOT NULL,
        [ShipAddress] nvarchar(60) NOT NULL,
        [ShipCity] nvarchar(15) NOT NULL,
        [ShipCountry] nvarchar(15) NOT NULL,
        [ShipPostalCode] nvarchar(10) NULL,
        [ShippingType] int NOT NULL,
        [DiscountType] int NOT NULL,
        [Discount] float NOT NULL,
        [OrderDate] datetime2 NOT NULL,
        CONSTRAINT [PK_Orders] PRIMARY KEY ([Id])
    );
END;
GO

IF OBJECT_ID(N'[dbo].[OrderDetails]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[OrderDetails]
    (
        [OrderId] int NOT NULL,
        [ProductId] int NOT NULL,
        [UnitPrice] money NOT NULL,
        [Quantity] smallint NOT NULL,
        CONSTRAINT [PK_OrderDetails] PRIMARY KEY ([OrderId], [ProductId]),
        CONSTRAINT [FK_OrderDetails_Orders_OrderId]
            FOREIGN KEY ([OrderId]) REFERENCES [dbo].[Orders]([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_OrderDetails_Products_ProductId]
            FOREIGN KEY ([ProductId]) REFERENCES [dbo].[Products]([Id])
    );
END;
GO

IF NOT EXISTS
(
    SELECT 1 FROM sys.indexes
    WHERE [name] = N'IX_OrderDetails_ProductId'
      AND [object_id] = OBJECT_ID(N'[dbo].[OrderDetails]')
)
BEGIN
    CREATE INDEX [IX_OrderDetails_ProductId]
        ON [dbo].[OrderDetails]([ProductId]);
END;
GO

IF NOT EXISTS
(
    SELECT 1 FROM sys.indexes
    WHERE [name] = N'IX_Orders_CustomerId'
      AND [object_id] = OBJECT_ID(N'[dbo].[Orders]')
)
BEGIN
    CREATE INDEX [IX_Orders_CustomerId]
        ON [dbo].[Orders]([CustomerId]);
END;
GO

IF NOT EXISTS
(
    SELECT 1
    FROM sys.foreign_keys
    WHERE [name] = N'FK_Orders_Customers_CustomerId'
)
BEGIN
    ALTER TABLE [dbo].[Orders]
        ADD CONSTRAINT [FK_Orders_Customers_CustomerId]
        FOREIGN KEY ([CustomerId]) REFERENCES [dbo].[Customers]([Id]);
END;
GO

/* Datos de clientes definidos en CustomerConfiguration de la practica. */
IF NOT EXISTS (SELECT 1 FROM [dbo].[Customers] WHERE [Id] = N'ALFKI')
    INSERT INTO [dbo].[Customers] ([Id], [Name], [CurrentBalance])
    VALUES (N'ALFKI', N'Alfreds Futterkiste', 0);

IF NOT EXISTS (SELECT 1 FROM [dbo].[Customers] WHERE [Id] = N'ANATR')
    INSERT INTO [dbo].[Customers] ([Id], [Name], [CurrentBalance])
    VALUES (N'ANATR', N'Ana Trujillo Emparedados y helados', 0);

IF NOT EXISTS (SELECT 1 FROM [dbo].[Customers] WHERE [Id] = N'ANTON')
    INSERT INTO [dbo].[Customers] ([Id], [Name], [CurrentBalance])
    VALUES (N'ANTON', N'Antonio Moreno Taquería', 100);
GO

/* Datos de productos definidos en ProductConfiguration de la practica. */
SET IDENTITY_INSERT [dbo].[Products] ON;

IF NOT EXISTS (SELECT 1 FROM [dbo].[Products] WHERE [Id] = 1)
    INSERT INTO [dbo].[Products] ([Id], [Name], [UnitsInStock], [UnitPrice])
    VALUES (1, N'Chai', 20, 35);

IF NOT EXISTS (SELECT 1 FROM [dbo].[Products] WHERE [Id] = 2)
    INSERT INTO [dbo].[Products] ([Id], [Name], [UnitsInStock], [UnitPrice])
    VALUES (2, N'Chang', 0, 55);

IF NOT EXISTS (SELECT 1 FROM [dbo].[Products] WHERE [Id] = 3)
    INSERT INTO [dbo].[Products] ([Id], [Name], [UnitsInStock], [UnitPrice])
    VALUES (3, N'Aniseed Syrup', 20, 65);

IF NOT EXISTS (SELECT 1 FROM [dbo].[Products] WHERE [Id] = 4)
    INSERT INTO [dbo].[Products] ([Id], [Name], [UnitsInStock], [UnitPrice])
    VALUES (4, N'Chef Anton''s Cajun Seasoning', 40, 75);

IF NOT EXISTS (SELECT 1 FROM [dbo].[Products] WHERE [Id] = 5)
    INSERT INTO [dbo].[Products] ([Id], [Name], [UnitsInStock], [UnitPrice])
    VALUES (5, N'Chef Anton''s Gumbo Mix', 20, 50);

SET IDENTITY_INSERT [dbo].[Products] OFF;
GO

/* Registrar las migraciones ya representadas por este script. */
IF NOT EXISTS (SELECT 1 FROM [dbo].[__EFMigrationsHistory] WHERE [MigrationId] = N'20261006022936_InitialCreate')
    INSERT INTO [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20261006022936_InitialCreate', N'8.0.0');

IF NOT EXISTS (SELECT 1 FROM [dbo].[__EFMigrationsHistory] WHERE [MigrationId] = N'20261011180500_AddOrderCustomerForeignKey')
    INSERT INTO [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20261011180500_AddOrderCustomerForeignKey', N'8.0.0');
GO

/* Verificacion. */
SELECT * FROM [dbo].[Customers] ORDER BY [Id];
SELECT * FROM [dbo].[Products] ORDER BY [Id];
SELECT * FROM [dbo].[Orders] ORDER BY [Id];
SELECT * FROM [dbo].[OrderDetails] ORDER BY [OrderId], [ProductId];
SELECT * FROM [dbo].[__EFMigrationsHistory] ORDER BY [MigrationId];
GO
