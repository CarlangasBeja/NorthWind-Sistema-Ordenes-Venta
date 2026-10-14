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
