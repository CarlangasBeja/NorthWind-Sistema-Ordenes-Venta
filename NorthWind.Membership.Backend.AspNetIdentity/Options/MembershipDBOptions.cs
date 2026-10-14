namespace NorthWind.Membership.Backend.AspNetIdentity.Options;

public class MembershipDBOptions
{
    public const string SectionKey = nameof(MembershipDBOptions);
    public string ConnectionString { get; set; }
}
