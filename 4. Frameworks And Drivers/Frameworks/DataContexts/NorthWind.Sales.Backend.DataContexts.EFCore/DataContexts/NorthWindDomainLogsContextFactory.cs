using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Options;
using NorthWind.Sales.Backend.DataContexts.EFCore.Options;

namespace NorthWind.Sales.Backend.DataContexts.EFCore.DataContexts;

internal class NorthWindDomainLogsContextFactory :
    IDesignTimeDbContextFactory<NorthWindDomainLogsContext>
{
    public NorthWindDomainLogsContext CreateDbContext(string[] args)
    {
        IOptions<DBOptions> DbOptions =
            Microsoft.Extensions.Options.Options.Create(
            new DBOptions
            {
                DomainLogsConnectionString =
                    "Server=(localdb)\\mssqllocaldb;Database=NorthWindLogsDB"
            });

        return new NorthWindDomainLogsContext(DbOptions);
    }
}
