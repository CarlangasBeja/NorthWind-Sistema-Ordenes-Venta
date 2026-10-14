namespace NorthWind.Sales.Backend.DataContexts.EFCore.Options;

public sealed class DBOptions
{
    public const string SectionKey = "DBOptions";
    public string ConnectionString { get; set; } = string.Empty;
    public string DomainLogsConnectionString { get; set; } = string.Empty;
}
