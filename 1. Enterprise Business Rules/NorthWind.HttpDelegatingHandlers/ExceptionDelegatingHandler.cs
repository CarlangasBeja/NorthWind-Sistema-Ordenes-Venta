using System.Text.Json;
using NorthWind.Validation.Entities.ValueObjects;

namespace NorthWind.HttpDelegatingHandlers;

public class ExceptionDelegatingHandler : DelegatingHandler
{
    protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
        var response = await base.SendAsync(request, cancellationToken);
        if (response.IsSuccessStatusCode) return response;

        var content = await response.Content.ReadAsStringAsync(cancellationToken);
        try
        {
            using var doc = JsonDocument.Parse(content);
            if (doc.RootElement.TryGetProperty("extensions", out var extensions) &&
                extensions.TryGetProperty("errors", out var errorsElement))
            {
                var errors = JsonSerializer.Deserialize<IEnumerable<ValidationError>>(
                    errorsElement.GetRawText(),
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true })?.ToArray();

                if (errors?.Length > 0)
                {
                    var validationException = new HttpRequestException(
                        string.Join(Environment.NewLine, errors.Select(error => error.Message)),
                        null,
                        response.StatusCode);
                    validationException.Data["Errors"] = errors;
                    throw validationException;
                }
            }

            if (doc.RootElement.TryGetProperty("detail", out var detail))
            {
                throw new HttpRequestException(
                    detail.GetString() ?? "No se pudo completar la solicitud.",
                    null,
                    response.StatusCode);
            }

            if (doc.RootElement.TryGetProperty("message", out var message))
            {
                throw new HttpRequestException(
                    message.GetString() ?? "No se pudo completar la solicitud.",
                    null,
                    response.StatusCode);
            }
        }
        catch (JsonException)
        {
        }

        throw new HttpRequestException(
            $"No se pudo completar la solicitud (HTTP {(int)response.StatusCode}).",
            null,
            response.StatusCode);
    }
}
