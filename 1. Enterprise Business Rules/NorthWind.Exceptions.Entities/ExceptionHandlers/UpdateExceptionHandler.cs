using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using NorthWind.Exceptions.Entities.Exceptions;
using NorthWind.Exceptions.Entities.Extensions;
using NorthWind.Exceptions.Entities.Resources;
namespace NorthWind.Exceptions.Entities.ExceptionHandlers;
internal class UpdateExceptionHandler(ILogger<UpdateExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        if (exception is not UpdateException ex) return false;
        var details = new ProblemDetails { Status = 500, Type = "https://datatracker.ietf.org/doc/html/rfc7231#section-6.6.1", Title = ExceptionMessages.UpdateExceptionTitle, Detail = ex.Entities.Any() ? ExceptionMessages.UpdateExceptionDetail : ex.Message, Instance = $"{nameof(ProblemDetails)}/{nameof(UpdateException)}" };
        logger.LogError(exception, "{Title}: {Entities}", ExceptionMessages.UpdateExceptionTitle, string.Join(" ", ex.Entities));
        await httpContext.WriteProblemDetailsAsync(details); return true;
    }
}
