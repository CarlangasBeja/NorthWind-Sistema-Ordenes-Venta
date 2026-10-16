using System.Transactions;
using NorthWind.Transactions.Entities.Interfaces;
namespace NorthWind.Transactions.Entities.Services;
internal class DomainTransaction : IDomainTransaction, IDisposable
{
    TransactionScope? TransactionScope;
    public void BeginTransaction()
    {
        // En Fedora las transacciones distribuidas MSDTC no están disponibles.
        // La transacción de órdenes usa una conexión SQL Server. La auditoría
        // de la segunda base se escribe fuera de esta transacción.
        if (OperatingSystem.IsWindows())
            TransactionManager.ImplicitDistributedTransactions = true;
        TransactionScope = new TransactionScope(TransactionScopeOption.Required,
            new TransactionOptions { IsolationLevel = IsolationLevel.ReadCommitted },
            TransactionScopeAsyncFlowOption.Enabled);
    }
    public void CommitTransaction() { TransactionScope?.Complete(); Dispose(); }
    public void RollbackTransaction() => Dispose();
    public void Dispose() { TransactionScope?.Dispose(); TransactionScope = null; }
}
