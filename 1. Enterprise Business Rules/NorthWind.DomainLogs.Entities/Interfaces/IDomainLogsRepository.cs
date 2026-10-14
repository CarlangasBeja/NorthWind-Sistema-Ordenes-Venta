using NorthWind.DomainLogs.Entities.ValueObjects;
using NorthWind.Entities.Interfaces;
namespace NorthWind.DomainLogs.Entities.Interfaces;
public interface IDomainLogsRepository : IUnitOfWork { Task Add(DomainLog log); }
