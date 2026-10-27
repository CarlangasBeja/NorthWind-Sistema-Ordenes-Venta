using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Options;
using NorthWind.Membership.Backend.AspNetIdentity.Options;

namespace NorthWind.Membership.Backend.AspNetIdentity.DataContexts;

internal class NorthWindMembershipContextFactory :
    IDesignTimeDbContextFactory<NorthWindMembershipContext>
{
    public NorthWindMembershipContext CreateDbContext(string[] args)
    {
        IOptions<MembershipDBOptions> DbOptions =
            Microsoft.Extensions.Options.Options.Create(
                new MembershipDBOptions()
                {
                    ConnectionString =
                    Environment.GetEnvironmentVariable("MembershipDBOptions__ConnectionString")
                    ?? "Server=(localdb)\\mssqllocaldb;Database=NorthWindUsersDB"
                });
        return new NorthWindMembershipContext(DbOptions);
    }
}
