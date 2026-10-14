using System.Net;
using System.Net.Mail;
using System.Text;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using NorthWind.Entities.Interfaces;
using NorthWind.Sales.Backend.SmtpGateways.Options;

namespace NorthWind.Sales.Backend.SmtpGateways;

/// <summary>
/// Gateway de correo transaccional REAL a través de Resend SMTP con STARTTLS (puerto 587).
/// Gmail solo recibe el mensaje: no se requiere acceso a su cuenta ni cambiar su configuración.
/// </summary>
internal sealed class MailService(
    IOptions<SmtpOptions> smtpOptions,
    ILogger<MailService> logger) : IMailService
{
    public async Task SendMailToAdministrator(string subject, string body)
    {
        var settings = smtpOptions.Value;
        ValidateOptions(settings);

        var fromAddress = string.IsNullOrWhiteSpace(settings.SenderEmail)
            ? settings.SmtpUserName
            : settings.SenderEmail;

        using var message = new MailMessage
        {
            From = new MailAddress(fromAddress, "NorthWind · Notificaciones", Encoding.UTF8),
            Subject = subject,
            SubjectEncoding = Encoding.UTF8,
            Body = body,
            BodyEncoding = Encoding.UTF8,
            IsBodyHtml = true
        };
        message.To.Add(new MailAddress(settings.AdministratorEmail));

        using var client = new SmtpClient(settings.SmtpHost, settings.SmtpHostPort)
        {
            DeliveryMethod = SmtpDeliveryMethod.Network,
            UseDefaultCredentials = false,
            Credentials = new NetworkCredential(settings.SmtpUserName, settings.SmtpPassword),
            EnableSsl = true,
            Timeout = 30000
        };

        try
        {
            // SendMailAsync entrega el mensaje al servidor de Resend para su envío al Gmail receptor.
            await client.SendMailAsync(message);
            // La aceptación SMTP no garantiza la llegada a Recibidos.
            logger.LogInformation(
                "Servidor SMTP de correo aceptó la notificación de orden especial para {Recipient}.",
                settings.AdministratorEmail);
        }
        catch (SmtpException ex)
        {
            logger.LogError(ex,
                "Error SMTP al notificar al administrador {Recipient}. Compruebe el token de Resend, la dirección remitente y el destinatario.",
                settings.AdministratorEmail);
            throw;
        }
        catch (Exception ex)
        {
            logger.LogError(ex,
                "Falló el envío de la notificación al administrador {Recipient}.",
                settings.AdministratorEmail);
            throw;
        }
    }

    private static void ValidateOptions(SmtpOptions settings)
    {
        if (string.IsNullOrWhiteSpace(settings.SmtpHost) ||
            settings.SmtpHostPort is < 1 or > 65535 ||
            string.IsNullOrWhiteSpace(settings.SmtpUserName) ||
            string.IsNullOrWhiteSpace(settings.SmtpPassword) ||
            string.IsNullOrWhiteSpace(settings.SenderEmail) ||
            string.IsNullOrWhiteSpace(settings.AdministratorEmail))
        {
            throw new InvalidOperationException(
                "Configure SmtpOptions para Resend (smtp.resend.com:587, usuario resend, API Key, remitente y Gmail de destino) mediante User Secrets. Consulte GUIA_RESEND_SIN_CAMBIOS_GMAIL.md.");
        }

        // Valida direcciones antes de abrir una conexión de red.
        // En Resend el nombre de usuario SMTP es "resend", NO una dirección de correo.
        // Validar únicamente los campos que realmente representan direcciones de email.
        _ = new MailAddress(settings.AdministratorEmail);
        _ = new MailAddress(settings.SenderEmail);
    }
}
