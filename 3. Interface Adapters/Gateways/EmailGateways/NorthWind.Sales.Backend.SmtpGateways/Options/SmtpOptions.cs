namespace NorthWind.Sales.Backend.SmtpGateways.Options;

public sealed class SmtpOptions
{
    public const string SectionKey = nameof(SmtpOptions);

    public string SmtpHost { get; set; } = "smtp.resend.com";
    public int SmtpHostPort { get; set; } = 587;
    public string SmtpUserName { get; set; } = string.Empty;
    public string SmtpPassword { get; set; } = string.Empty;
    public string SenderEmail { get; set; } = string.Empty;
    public string AdministratorEmail { get; set; } = string.Empty;
}
