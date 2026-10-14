namespace NorthWind.Membership.Backend.Core.Options;
public sealed class JwtOptions
{
 public const string SectionKey=nameof(JwtOptions);
 public string SecurityKey{get;set;}=string.Empty;
 public string ValidIssuer{get;set;}=string.Empty;
 public string ValidAudience{get;set;}=string.Empty;
 public int ExpireInMinutes{get;set;}=1440;
 public bool ValidateIssuer{get;set;}=true;
 public bool ValidateAudience{get;set;}=true;
 public bool ValidateLifetime{get;set;}=true;
 public bool ValidateIssuerSigningKey{get;set;}=true;
}
