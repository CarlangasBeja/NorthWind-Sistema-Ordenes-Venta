using NorthWind.Sales.Entities.Dtos.Queries;

namespace NorthWind.Sales.Frontend.Views.ViewModels.CreateOrder;

public class CreateOrderDetailViewModel
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    public short Quantity { get; set; } = 1;
    public short UnitsInStock { get; set; }
    public decimal Subtotal => UnitPrice * Quantity;

    public void SetProduct(ProductSearchItemDto product)
    {
        ProductId = product.Id;
        ProductName = product.Name;
        UnitPrice = product.UnitPrice;
        UnitsInStock = product.UnitsInStock;
        if (Quantity <= 0)
        {
            Quantity = 1;
        }
    }
}
