using Microsoft.EntityFrameworkCore;
using NorthWind.Exceptions.Entities.Exceptions;

namespace NorthWind.Sales.Backend.DataContexts.EFCore.Guards;

internal static class GuardDBContext
{
    public static async Task AgainstSaveChangesErrorAsync(DbContext context)
    {
        try
        {
            await context.SaveChangesAsync();
        }
        catch (DbUpdateException ex)
        {
            throw new UpdateException(ex, ex.Entries.Select(e => e.Entity.GetType().Name));
        }
    }
}
