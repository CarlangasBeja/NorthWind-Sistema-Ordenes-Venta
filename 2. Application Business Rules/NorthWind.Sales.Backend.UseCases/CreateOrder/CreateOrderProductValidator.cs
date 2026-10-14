using NorthWind.Sales.Backend.BusinessObjects.Interfaces.Repositories;
using NorthWind.Sales.Backend.BusinessObjects.ValueObjects;
using NorthWind.Sales.Backend.UseCases.Resources;
using NorthWind.Sales.Entities.Dtos.CreateOrder;
using NorthWind.Validation.Entities.Enums;
using NorthWind.Validation.Entities.Interfaces;
using NorthWind.Validation.Entities.ValueObjects;
namespace NorthWind.Sales.Backend.UseCases.CreateOrder;
internal class CreateOrderProductValidator(IQueriesRepository repository) : IModelValidator<CreateOrderDto>
{
    readonly List<ValidationError> ErrorsField=[];
    public IEnumerable<ValidationError> Errors=>ErrorsField;
    public ValidationConstraint Constraint=>ValidationConstraint.ValidateIfThereAreNoPreviousErrors;
    public async Task<bool> Validate(CreateOrderDto model)
    {
        ErrorsField.Clear();
        var required=model.OrderDetails.GroupBy(d=>d.ProductId).Select(d=>new ProductUnitsInStock(d.Key,(short)d.Sum(x=>x.Quantity))).ToList();
        var stock=(await repository.GetProductsUnitsInStock(required.Select(d=>d.ProductId))).ToList();
        var compare=required.GroupJoin(stock,r=>r.ProductId,s=>s.ProductId,(r,ss)=>new{r,ss}).SelectMany(x=>x.ss.DefaultIfEmpty(),(x,s)=>new{x.r.ProductId,Required=x.r.UnitsInStock,InStock=s?.UnitsInStock});
        foreach(var item in compare)
        {
            if(!item.InStock.HasValue) ErrorsField.Add(new(GetPropertyNameWithIndex(model,item.ProductId,nameof(CreateOrderDetailDto.ProductId)),string.Format(CreateOrderMessages.ProductIdNotFoundErrorTemplate,item.ProductId)));
            else if(item.InStock<item.Required) ErrorsField.Add(new(GetPropertyNameWithIndex(model,item.ProductId,nameof(CreateOrderDetailDto.Quantity)),string.Format(CreateOrderMessages.UnitsInStockLessThanQuantityErrorTemplate,item.Required,item.InStock,item.ProductId)));
        }
        return !ErrorsField.Any();
    }
    static string GetPropertyNameWithIndex(CreateOrderDto model,int productId,string propertyName)
    {
        var list=model.OrderDetails.ToList(); var detail=list.First(i=>i.ProductId==productId); var index=list.IndexOf(detail);
        return $"{nameof(model.OrderDetails)}[{index}].{propertyName}";
    }
}
