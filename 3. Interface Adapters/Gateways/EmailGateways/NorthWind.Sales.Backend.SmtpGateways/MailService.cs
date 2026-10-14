using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using NorthWind.Entities.Interfaces;
using NorthWind.Sales.Backend.SmtpGateways.Options;

namespace NorthWind.Sales.Backend.SmtpGateways;

internal class MailService(IOptions<SmtpOptions> smtpOptions,
    ILogger<MailService> logger) : IMailService
{
    public async Task SendMailToAdministrator(
        string subject, string body)
    {
        try
        {
            MailMessage Message =
                new MailMessage(smtpOptions.Value.SenderEmail,
                    smtpOptions.Value.AdministratorEmail);
            Message.Subject = subject;
            Message.Body = body;

            SmtpClient Client = new SmtpClient(
                smtpOptions.Value.SmtpHost,
                smtpOptions.Value.SmtpHostPort)
            {
                Credentials = new NetworkCredential(
                    smtpOptions.Value.SmtpUserName,
                    smtpOptions.Value.SmtpPassword),
                EnableSsl = true
            };

            await Client.SendMailAsync(Message);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, ex.Message);
        }
    }
}
