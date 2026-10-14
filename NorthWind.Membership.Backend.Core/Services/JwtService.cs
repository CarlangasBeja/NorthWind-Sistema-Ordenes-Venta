using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using NorthWind.Membership.Backend.Core.Dtos;
using NorthWind.Membership.Backend.Core.Options;
namespace NorthWind.Membership.Backend.Core.Services;
public sealed class JwtService(IOptions<JwtOptions> options)
{
 private SigningCredentials GetSigningCredentials()=>new(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(options.Value.SecurityKey)),SecurityAlgorithms.HmacSha256);
 private static List<Claim> GetClaims(UserDto u)=>[new Claim(ClaimTypes.Name,u.Email),new Claim("FullName",$"{u.FirstName} {u.LastName}")];
 private SecurityTokenDescriptor GetTokenDescriptor(SigningCredentials c,List<Claim> claims)=>new(){Subject=new ClaimsIdentity(claims),Issuer=options.Value.ValidIssuer,Audience=options.Value.ValidAudience,Expires=DateTime.UtcNow.AddMinutes(options.Value.ExpireInMinutes),SigningCredentials=c};
 public string GetToken(UserDto userData)=>new JsonWebTokenHandler().CreateToken(GetTokenDescriptor(GetSigningCredentials(),GetClaims(userData)));
}
