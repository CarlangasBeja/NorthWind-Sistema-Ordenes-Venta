using NorthWind.DomainLogs.Entities.Interfaces;
using NorthWind.Sales.Backend.Repositories.Interfaces;
namespace NorthWind.Sales.Backend.Repositories.Repositories;
internal class DomainLogsRepository(INorthWindDomainLogsDataContext context):IDomainLogsRepository
{
    public Task Add(NorthWind.DomainLogs.Entities.ValueObjects.DomainLog log)=>context.AddLogAsync(new Entities.DomainLog{CreatedDate=log.DateTime,Information=log.Information,UserName=log.UserName});
    public Task SaveChanges()=>context.SaveChangesAsync();
}
