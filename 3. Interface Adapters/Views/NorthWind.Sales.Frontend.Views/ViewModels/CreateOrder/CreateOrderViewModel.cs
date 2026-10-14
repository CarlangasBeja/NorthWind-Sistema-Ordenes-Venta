using NorthWind.RazorComponents.Validators;
using NorthWind.Sales.Entities.Dtos.CreateOrder;
using NorthWind.Sales.Entities.Dtos.Queries;
using NorthWind.Sales.Entities.ValueObjects;
using NorthWind.Sales.Frontend.BusinessObjects.Interfaces;
using NorthWind.Validation.Entities.Interfaces;
using NorthWind.Validation.Entities.ValueObjects;

namespace NorthWind.Sales.Frontend.Views.ViewModels.CreateOrder;

public class CreateOrderViewModel(
    ICreateOrderGateway gateway,
    IModelValidatorHub<CreateOrderViewModel> validator)
{
    public string CustomerId { get; set; } = string.Empty;
    public string CustomerName { get; private set; } = string.Empty;
    public string ShipAddress { get; set; } = string.Empty;
    public string ShipCity { get; set; } = string.Empty;
    public string ShipCountry { get; set; } = string.Empty;
    public string ShipPostalCode { get; set; } = string.Empty;
    public List<CreateOrderDetailViewModel> OrderDetails { get; set; } = [];
    public string InformationMessage { get; private set; } = string.Empty;
    public string ErrorMessage { get; private set; } = string.Empty;
    public string WarningMessage { get; private set; } = string.Empty;
    public int? LastOrderId { get; private set; }
    public bool IsSubmitting { get; private set; }

    public decimal Subtotal => OrderDetails.Sum(detail => detail.Subtotal);
    public decimal Tax => decimal.Round(Subtotal * SalesConstants.TaxRate, 2, MidpointRounding.AwayFromZero);
    public decimal Total => Subtotal + Tax;
    public int TotalUnits => OrderDetails.Sum(detail => detail.Quantity);
    public bool HasSelectedCustomer => !string.IsNullOrWhiteSpace(CustomerId);
    public bool HasProducts => OrderDetails.Count > 0;
    public bool HasStockIssues => OrderDetails.Any(detail => detail.Quantity <= 0 || detail.Quantity > detail.UnitsInStock);
    public bool HasSavedOrder => LastOrderId.HasValue;
    public bool CanAttemptSave => !IsSubmitting && !HasSavedOrder && HasSelectedCustomer && HasProducts && !HasStockIssues;
    public bool HasDraftData => HasSelectedCustomer || HasProducts || !string.IsNullOrWhiteSpace(ShipAddress) ||
                                !string.IsNullOrWhiteSpace(ShipCity) || !string.IsNullOrWhiteSpace(ShipCountry) ||
                                !string.IsNullOrWhiteSpace(ShipPostalCode);

    public IModelValidatorHub<CreateOrderViewModel> Validator => validator;
    public ModelValidator<CreateOrderViewModel> ModelValidatorComponentReference { get; set; } = null!;

    public void SelectCustomer(CustomerSearchItemDto customer)
    {
        CustomerId = customer.Id;
        CustomerName = customer.Name;
        ClearMessages();
        InformationMessage = $"Cliente {customer.Name} seleccionado correctamente.";
    }

    public bool AddProduct(ProductSearchItemDto product)
    {
        ClearMessages();
        if (OrderDetails.Any(detail => detail.ProductId == product.Id))
        {
            WarningMessage = $"El producto '{product.Name}' ya forma parte de la orden. Puede cambiar su cantidad desde el detalle.";
            return false;
        }

        var detail = new CreateOrderDetailViewModel();
        detail.SetProduct(product);
        OrderDetails.Add(detail);

        InformationMessage = $"Producto '{product.Name}' agregado a la orden.";
        if (product.UnitsInStock <= 5)
        {
            WarningMessage = $"El producto '{product.Name}' tiene stock bajo: quedan {product.UnitsInStock} unidad(es).";
        }

        return true;
    }

    public bool ChangeProduct(int index, ProductSearchItemDto product)
    {
        ClearMessages();
        if (index < 0 || index >= OrderDetails.Count)
        {
            ErrorMessage = "No se pudo identificar el producto que desea cambiar. Actualice la página e intente nuevamente.";
            return false;
        }

        if (OrderDetails.Where((_, currentIndex) => currentIndex != index)
            .Any(detail => detail.ProductId == product.Id))
        {
            WarningMessage = $"El producto '{product.Name}' ya está incluido en otra línea de la orden.";
            return false;
        }

        OrderDetails[index].SetProduct(product);
        InformationMessage = $"Producto actualizado a '{product.Name}'.";
        return true;
    }

    public void RemoveProduct(int index)
    {
        ClearMessages();
        if (index >= 0 && index < OrderDetails.Count)
        {
            var productName = OrderDetails[index].ProductName;
            OrderDetails.RemoveAt(index);
            InformationMessage = $"Producto '{productName}' eliminado de la orden.";
        }
    }

    public void IncreaseQuantity(int index)
    {
        ClearMessages();
        if (index < 0 || index >= OrderDetails.Count) return;

        var detail = OrderDetails[index];
        if (detail.Quantity >= detail.UnitsInStock)
        {
            WarningMessage = $"No puede agregar más unidades de '{detail.ProductName}'. El stock disponible es {detail.UnitsInStock}.";
            return;
        }

        detail.Quantity++;
    }

    public void DecreaseQuantity(int index)
    {
        ClearMessages();
        if (index < 0 || index >= OrderDetails.Count) return;

        var detail = OrderDetails[index];
        if (detail.Quantity <= 1)
        {
            WarningMessage = "La cantidad mínima permitida es 1. Si ya no necesita el producto, utilice el botón Eliminar.";
            return;
        }

        detail.Quantity--;
    }

    public void SetWarning(string message)
    {
        ClearMessages();
        WarningMessage = message;
    }

    public void SetError(string message)
    {
        ClearMessages();
        ErrorMessage = message;
    }

    public async Task Send()
    {
        if (IsSubmitting || HasSavedOrder)
        {
            return;
        }

        ClearMessages();
        LastOrderId = null;

        if (OrderDetails.Count == 0)
        {
            ErrorMessage = "Agregue al menos un producto antes de guardar la orden.";
            return;
        }

        if (OrderDetails.Any(detail => detail.Quantity <= 0))
        {
            ErrorMessage = "Todas las cantidades deben ser mayores que cero. Revise el detalle de productos.";
            return;
        }

        if (OrderDetails.Any(detail => detail.Quantity > detail.UnitsInStock))
        {
            ErrorMessage = "Una o más cantidades superan el stock disponible. Revise los productos resaltados antes de continuar.";
            return;
        }

        try
        {
            IsSubmitting = true;
            var orderId = await gateway.CreateOrderAsync((CreateOrderDto)this);
            LastOrderId = orderId;
            InformationMessage = $"La orden {SalesConstants.GetInvoiceNumber(orderId)} se guardó correctamente. El inventario fue actualizado y la orden de venta generada ya está disponible.";
        }
        catch (HttpRequestException ex)
        {
            if (ex.Data.Contains("Errors") && ex.Data["Errors"] is IEnumerable<ValidationError> errors)
            {
                ModelValidatorComponentReference.AddErrors(errors);
                ErrorMessage = "Encontramos información que necesita corrección. Revise los campos marcados y vuelva a intentarlo.";
            }
            else
            {
                ErrorMessage = GetFriendlyError(ex);
            }
        }
        catch
        {
            ErrorMessage = "No pudimos guardar la orden en este momento. Sus datos siguen en pantalla; revise su conexión y vuelva a intentarlo.";
        }
        finally
        {
            IsSubmitting = false;
        }
    }

    public void ResetForNewOrder()
    {
        CustomerId = string.Empty;
        CustomerName = string.Empty;
        ShipAddress = string.Empty;
        ShipCity = string.Empty;
        ShipCountry = string.Empty;
        ShipPostalCode = string.Empty;
        OrderDetails.Clear();
        LastOrderId = null;
        ClearMessages();
        ModelValidatorComponentReference?.ClearErrors();
    }

    public void ClearMessages()
    {
        InformationMessage = string.Empty;
        ErrorMessage = string.Empty;
        WarningMessage = string.Empty;
    }

    private static string GetFriendlyError(HttpRequestException exception)
    {
        if (exception.StatusCode == System.Net.HttpStatusCode.Unauthorized)
            return "Su sesión venció o dejó de ser válida. Inicie sesión nuevamente antes de guardar la orden.";

        if (exception.StatusCode == System.Net.HttpStatusCode.Forbidden)
            return "Su usuario no tiene permiso para guardar órdenes de venta.";

        var message = exception.Message ?? string.Empty;

        if (message.Contains("stock", StringComparison.OrdinalIgnoreCase))
            return "El stock cambió mientras se procesaba la venta. Revise nuevamente las cantidades disponibles antes de guardar.";

        if (message.Contains("saldo", StringComparison.OrdinalIgnoreCase) ||
            message.Contains("balance", StringComparison.OrdinalIgnoreCase))
            return "El cliente seleccionado tiene un saldo pendiente y no puede registrar una nueva compra.";

        if (message.Contains("cliente", StringComparison.OrdinalIgnoreCase) &&
            message.Contains("no existe", StringComparison.OrdinalIgnoreCase))
            return "El cliente seleccionado ya no está disponible. Busque y seleccione nuevamente el cliente.";

        if (message.Contains("producto", StringComparison.OrdinalIgnoreCase) &&
            message.Contains("no existe", StringComparison.OrdinalIgnoreCase))
            return "Uno de los productos ya no está disponible. Quite ese producto y vuelva a seleccionarlo desde el catálogo.";

        return "No pudimos comunicarnos correctamente con el servicio de ventas. Sus datos no se han perdido; espere unos segundos y vuelva a intentarlo.";
    }

    public static explicit operator CreateOrderDto(CreateOrderViewModel model) =>
        new(
            model.CustomerId,
            model.ShipAddress,
            model.ShipCity,
            model.ShipCountry,
            model.ShipPostalCode,
            model.OrderDetails.Select(detail =>
                new CreateOrderDetailDto(detail.ProductId, detail.UnitPrice, detail.Quantity)));
}
