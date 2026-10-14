using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
namespace NorthWind.Exceptions.Entities.Extensions;
internal static class HttpContextExtensions
{
    public static async ValueTask WriteProblemDetailsAsync(this HttpContext context, ProblemDetails details)
    {
        context.Response.ContentType = "application/problem+json";
        context.Response.StatusCode = details.Status ?? StatusCodes.Status500InternalServerError;
        await JsonSerializer.SerializeAsync(context.Response.Body, details);
    }
}
