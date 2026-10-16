-- Ejecutar en SQL Server Object Explorer / SSMS.
-- Son consultas: no alteran datos ni eliminan órdenes.
USE NorthWindDB;
GO
SELECT COUNT(*) AS TotalOrdenes FROM dbo.Orders;
SELECT TOP (10) Id, CustomerId, OrderDate FROM dbo.Orders ORDER BY Id DESC;
SELECT TOP (15) OrderId, ProductId, Quantity FROM dbo.OrderDetails ORDER BY OrderId DESC, ProductId;
SELECT Id AS ProductId, Name, UnitsInStock FROM dbo.Products ORDER BY Id;
GO
USE NorthWindLogsDB;
GO
SELECT TOP (20) Id, CreatedDate, Information, UserName FROM dbo.DomainLogs ORDER BY Id DESC;
GO
