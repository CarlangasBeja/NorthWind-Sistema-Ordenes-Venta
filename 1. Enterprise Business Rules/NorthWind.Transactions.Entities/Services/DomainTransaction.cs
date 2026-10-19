using System.Transactions;
using NorthWind.Transactions.Entities.Interfaces;
namespace NorthWind.Transactions.Entities.Services;
internal class DomainTransaction : IDomainTransaction, IDisposable
{
    TransactionScope? TransactionScope;
    public void BeginTransaction()
    {
        // La promoción automática a MSDTC solo está disponible en Windows.
        // Fedora usa una transacción local ligera contra una única base SQL Server.
        if (OperatingSystem.IsWindows())
        {
            TransactionManager.ImplicitDistributedTransactions = true;
        }
        TransactionScope = new TransactionScope(TransactionScopeOption.Required,
            new TransactionOptions { IsolationLevel = IsolationLevel.ReadCommitted },
            TransactionScopeAsyncFlowOption.Enabled);
    }
    public void CommitTransaction() { TransactionScope?.Complete(); Dispose(); }
    public void RollbackTransaction() => Dispose();
    public void Dispose() { TransactionScope?.Dispose(); TransactionScope = null; }
}
