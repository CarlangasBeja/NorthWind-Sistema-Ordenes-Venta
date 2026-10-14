/* Verificacion general de las tres bases. */

SELECT [name]
FROM [master].[sys].[databases]
WHERE [name] IN (N'NorthWindDB', N'NorthWindLogsDB', N'NorthWindUsersDB')
ORDER BY [name];
GO

USE [NorthWindDB];
SELECT 'Customers' AS Tabla, COUNT(*) AS Registros FROM [dbo].[Customers]
UNION ALL SELECT 'Products', COUNT(*) FROM [dbo].[Products]
UNION ALL SELECT 'Orders', COUNT(*) FROM [dbo].[Orders]
UNION ALL SELECT 'OrderDetails', COUNT(*) FROM [dbo].[OrderDetails];
SELECT * FROM [dbo].[Customers] ORDER BY [Id];
SELECT * FROM [dbo].[Products] ORDER BY [Id];
GO

USE [NorthWindLogsDB];
SELECT 'DomainLogs' AS Tabla, COUNT(*) AS Registros FROM [dbo].[DomainLogs];
SELECT * FROM [dbo].[DomainLogs] ORDER BY [Id];
GO

USE [NorthWindUsersDB];
SELECT 'AspNetUsers' AS Tabla, COUNT(*) AS Registros FROM [dbo].[AspNetUsers];
SELECT [FirstName], [LastName], [UserName], [Email] FROM [dbo].[AspNetUsers] ORDER BY [UserName];
GO
