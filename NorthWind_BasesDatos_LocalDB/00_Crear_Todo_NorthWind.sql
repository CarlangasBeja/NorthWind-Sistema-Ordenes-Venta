/* NORTHWIND - CREACION COMPLETA DE LAS 3 BASES EN (localdb)\MSSQLLocalDB */
/* Ejecutar todo el archivo conectado a la instancia LocalDB. */

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

/*
    NORTHWIND - BASE DE LOGS DE DOMINIO
    Instancia: (localdb)\MSSQLLocalDB
    Base: NorthWindLogsDB

    En la practica la tabla inicia vacia. Los registros se generan al crear ordenes.
*/

USE [master];
GO

IF DB_ID(N'NorthWindLogsDB') IS NULL
BEGIN
    CREATE DATABASE [NorthWindLogsDB];
END;
GO

USE [NorthWindLogsDB];
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

IF OBJECT_ID(N'[dbo].[DomainLogs]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[DomainLogs]
    (
        [Id] int IDENTITY(1,1) NOT NULL,
        [CreatedDate] datetime2 NOT NULL,
        [Information] nvarchar(max) NOT NULL,
        [UserName] nvarchar(max) NOT NULL,
        CONSTRAINT [PK_DomainLogs] PRIMARY KEY ([Id])
    );
END;
GO

IF NOT EXISTS (SELECT 1 FROM [dbo].[__EFMigrationsHistory] WHERE [MigrationId] = N'20261006023924_InitialCreate')
    INSERT INTO [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20261006023924_InitialCreate', N'8.0.0');
GO

/*
    No se insertan logs ficticios.
    Al crear una orden desde la aplicacion deben aparecer mensajes de auditoria,
    por ejemplo: inicio de creacion y orden creada.
*/
SELECT * FROM [dbo].[DomainLogs] ORDER BY [Id];
SELECT * FROM [dbo].[__EFMigrationsHistory] ORDER BY [MigrationId];
GO

/*
    NORTHWIND - BASE DE USUARIOS ASP.NET CORE IDENTITY
    Instancia: (localdb)\MSSQLLocalDB
    Base: NorthWindUsersDB

    Se incluye el usuario de prueba documentado textualmente en las practicas:
      Nombre: Maria
      Apellido: Sanders
      Correo: msanders@northwind.com
      Clave: Mm1234567$

    Nancy Davolio tambien aparece en una captura de la practica, pero su clave esta
    oculta. Para no inventar una credencial, no se precarga en este script.
*/

USE [master];
GO

IF DB_ID(N'NorthWindUsersDB') IS NULL
BEGIN
    CREATE DATABASE [NorthWindUsersDB];
END;
GO

USE [NorthWindUsersDB];
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

IF OBJECT_ID(N'[dbo].[AspNetRoles]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[AspNetRoles]
    (
        [Id] nvarchar(450) NOT NULL,
        [Name] nvarchar(256) NULL,
        [NormalizedName] nvarchar(256) NULL,
        [ConcurrencyStamp] nvarchar(max) NULL,
        CONSTRAINT [PK_AspNetRoles] PRIMARY KEY ([Id])
    );
END;
GO

IF OBJECT_ID(N'[dbo].[AspNetUsers]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[AspNetUsers]
    (
        [Id] nvarchar(450) NOT NULL,
        [FirstName] nvarchar(max) NOT NULL,
        [LastName] nvarchar(max) NOT NULL,
        [UserName] nvarchar(256) NULL,
        [NormalizedUserName] nvarchar(256) NULL,
        [Email] nvarchar(256) NULL,
        [NormalizedEmail] nvarchar(256) NULL,
        [EmailConfirmed] bit NOT NULL,
        [PasswordHash] nvarchar(max) NULL,
        [SecurityStamp] nvarchar(max) NULL,
        [ConcurrencyStamp] nvarchar(max) NULL,
        [PhoneNumber] nvarchar(max) NULL,
        [PhoneNumberConfirmed] bit NOT NULL,
        [TwoFactorEnabled] bit NOT NULL,
        [LockoutEnd] datetimeoffset NULL,
        [LockoutEnabled] bit NOT NULL,
        [AccessFailedCount] int NOT NULL,
        CONSTRAINT [PK_AspNetUsers] PRIMARY KEY ([Id])
    );
END;
GO

IF OBJECT_ID(N'[dbo].[AspNetRoleClaims]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[AspNetRoleClaims]
    (
        [Id] int IDENTITY(1,1) NOT NULL,
        [RoleId] nvarchar(450) NOT NULL,
        [ClaimType] nvarchar(max) NULL,
        [ClaimValue] nvarchar(max) NULL,
        CONSTRAINT [PK_AspNetRoleClaims] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_AspNetRoleClaims_AspNetRoles_RoleId]
            FOREIGN KEY ([RoleId]) REFERENCES [dbo].[AspNetRoles]([Id]) ON DELETE CASCADE
    );
END;
GO

IF OBJECT_ID(N'[dbo].[AspNetUserClaims]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[AspNetUserClaims]
    (
        [Id] int IDENTITY(1,1) NOT NULL,
        [UserId] nvarchar(450) NOT NULL,
        [ClaimType] nvarchar(max) NULL,
        [ClaimValue] nvarchar(max) NULL,
        CONSTRAINT [PK_AspNetUserClaims] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_AspNetUserClaims_AspNetUsers_UserId]
            FOREIGN KEY ([UserId]) REFERENCES [dbo].[AspNetUsers]([Id]) ON DELETE CASCADE
    );
END;
GO

IF OBJECT_ID(N'[dbo].[AspNetUserLogins]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[AspNetUserLogins]
    (
        [LoginProvider] nvarchar(450) NOT NULL,
        [ProviderKey] nvarchar(450) NOT NULL,
        [ProviderDisplayName] nvarchar(max) NULL,
        [UserId] nvarchar(450) NOT NULL,
        CONSTRAINT [PK_AspNetUserLogins] PRIMARY KEY ([LoginProvider], [ProviderKey]),
        CONSTRAINT [FK_AspNetUserLogins_AspNetUsers_UserId]
            FOREIGN KEY ([UserId]) REFERENCES [dbo].[AspNetUsers]([Id]) ON DELETE CASCADE
    );
END;
GO

IF OBJECT_ID(N'[dbo].[AspNetUserRoles]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[AspNetUserRoles]
    (
        [UserId] nvarchar(450) NOT NULL,
        [RoleId] nvarchar(450) NOT NULL,
        CONSTRAINT [PK_AspNetUserRoles] PRIMARY KEY ([UserId], [RoleId]),
        CONSTRAINT [FK_AspNetUserRoles_AspNetRoles_RoleId]
            FOREIGN KEY ([RoleId]) REFERENCES [dbo].[AspNetRoles]([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_AspNetUserRoles_AspNetUsers_UserId]
            FOREIGN KEY ([UserId]) REFERENCES [dbo].[AspNetUsers]([Id]) ON DELETE CASCADE
    );
END;
GO

IF OBJECT_ID(N'[dbo].[AspNetUserTokens]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[AspNetUserTokens]
    (
        [UserId] nvarchar(450) NOT NULL,
        [LoginProvider] nvarchar(450) NOT NULL,
        [Name] nvarchar(450) NOT NULL,
        [Value] nvarchar(max) NULL,
        CONSTRAINT [PK_AspNetUserTokens] PRIMARY KEY ([UserId], [LoginProvider], [Name]),
        CONSTRAINT [FK_AspNetUserTokens_AspNetUsers_UserId]
            FOREIGN KEY ([UserId]) REFERENCES [dbo].[AspNetUsers]([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE [name] = N'IX_AspNetRoleClaims_RoleId' AND [object_id] = OBJECT_ID(N'[dbo].[AspNetRoleClaims]'))
    CREATE INDEX [IX_AspNetRoleClaims_RoleId] ON [dbo].[AspNetRoleClaims]([RoleId]);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE [name] = N'RoleNameIndex' AND [object_id] = OBJECT_ID(N'[dbo].[AspNetRoles]'))
    CREATE UNIQUE INDEX [RoleNameIndex] ON [dbo].[AspNetRoles]([NormalizedName]) WHERE [NormalizedName] IS NOT NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE [name] = N'IX_AspNetUserClaims_UserId' AND [object_id] = OBJECT_ID(N'[dbo].[AspNetUserClaims]'))
    CREATE INDEX [IX_AspNetUserClaims_UserId] ON [dbo].[AspNetUserClaims]([UserId]);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE [name] = N'IX_AspNetUserLogins_UserId' AND [object_id] = OBJECT_ID(N'[dbo].[AspNetUserLogins]'))
    CREATE INDEX [IX_AspNetUserLogins_UserId] ON [dbo].[AspNetUserLogins]([UserId]);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE [name] = N'IX_AspNetUserRoles_RoleId' AND [object_id] = OBJECT_ID(N'[dbo].[AspNetUserRoles]'))
    CREATE INDEX [IX_AspNetUserRoles_RoleId] ON [dbo].[AspNetUserRoles]([RoleId]);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE [name] = N'EmailIndex' AND [object_id] = OBJECT_ID(N'[dbo].[AspNetUsers]'))
    CREATE INDEX [EmailIndex] ON [dbo].[AspNetUsers]([NormalizedEmail]);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE [name] = N'UserNameIndex' AND [object_id] = OBJECT_ID(N'[dbo].[AspNetUsers]'))
    CREATE UNIQUE INDEX [UserNameIndex] ON [dbo].[AspNetUsers]([NormalizedUserName]) WHERE [NormalizedUserName] IS NOT NULL;
GO

/* Usuario de prueba de las practicas 14-16. PasswordHash compatible con ASP.NET Core Identity V3. */
IF NOT EXISTS (SELECT 1 FROM [dbo].[AspNetUsers] WHERE [NormalizedUserName] = N'MSANDERS@NORTHWIND.COM')
BEGIN
    INSERT INTO [dbo].[AspNetUsers]
    (
        [Id], [FirstName], [LastName], [UserName], [NormalizedUserName],
        [Email], [NormalizedEmail], [EmailConfirmed], [PasswordHash],
        [SecurityStamp], [ConcurrencyStamp], [PhoneNumber], [PhoneNumberConfirmed],
        [TwoFactorEnabled], [LockoutEnd], [LockoutEnabled], [AccessFailedCount]
    )
    VALUES
    (
        N'6d8eb41c-28c7-4b07-9e33-9b3fc13a6c74',
        N'Maria', N'Sanders',
        N'msanders@northwind.com', N'MSANDERS@NORTHWIND.COM',
        N'msanders@northwind.com', N'MSANDERS@NORTHWIND.COM',
        0,
        N'AQAAAAIAAYagAAAAEE67pI3LR4wYrcR3iLuKzvjOSXZ4BhH0tYmRXFZHQG9l2RM03ETzV/CwA+emmHIb5g==',
        N'26d8cce4-109f-4a3c-b871-205352dd74a2',
        N'8f52d690-3c42-4c9e-b63e-502d7c247ece',
        NULL, 0, 0, NULL, 0, 0
    );
END;
GO

IF NOT EXISTS (SELECT 1 FROM [dbo].[__EFMigrationsHistory] WHERE [MigrationId] = N'20261006024430_InitialCreate')
    INSERT INTO [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20261006024430_InitialCreate', N'8.0.0');
GO

/* Verificacion. */
SELECT [Id], [FirstName], [LastName], [UserName], [Email]
FROM [dbo].[AspNetUsers]
ORDER BY [UserName];

SELECT * FROM [dbo].[__EFMigrationsHistory] ORDER BY [MigrationId];
GO
