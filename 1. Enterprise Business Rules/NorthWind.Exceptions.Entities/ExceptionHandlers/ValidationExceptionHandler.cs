using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using NorthWind.Exceptions.Entities.Exceptions;
using NorthWind.Exceptions.Entities.Extensions;
using NorthWind.Exceptions.Entities.Resources;
namespace NorthWind.Exceptions.Entities.ExceptionHandlers;
internal class ValidationExceptionHandler : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        if (exception is not ValidationException ex) return false;
        var details = new ProblemDetails { Status = 400, Type = "https://datatracker.ietf.org/doc/html/rfc7231#section-6.5.1", Title = ExceptionMessages.ValidationExceptionTitle, Detail = ExceptionMessages.ValidationExceptionDetail, Instance = $"{nameof(ProblemDetails)}/{nameof(ValidationException)}" };
        details.Extensions.Add("errors", ex.Errors);
        await httpContext.WriteProblemDetailsAsync(details); return true;
    }
}
