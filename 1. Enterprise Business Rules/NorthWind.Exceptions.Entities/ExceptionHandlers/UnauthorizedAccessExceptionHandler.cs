using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using NorthWind.Exceptions.Entities.Extensions;
using NorthWind.Exceptions.Entities.Resources;
namespace NorthWind.Exceptions.Entities.ExceptionHandlers;
internal class UnauthorizedAccessExceptionHandler : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        if (exception is not UnauthorizedAccessException) return false;
        var details = new ProblemDetails { Status = 401, Type = "https://datatracker.ietf.org/doc/html/rfc7235#section-3.1", Title = ExceptionMessages.UnauthorizedAccessExceptionTitle, Detail = ExceptionMessages.UnauthorizedAccessExceptionDetail, Instance = $"{nameof(ProblemDetails)}/{nameof(UnauthorizedAccessException)}" };
        await httpContext.WriteProblemDetailsAsync(details); return true;
    }
}
