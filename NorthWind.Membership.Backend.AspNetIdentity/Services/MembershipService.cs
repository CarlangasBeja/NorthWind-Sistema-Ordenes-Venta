using Microsoft.AspNetCore.Identity;
using NorthWind.Membership.Backend.AspNetIdentity.Entities;
using NorthWind.Membership.Backend.AspNetIdentity.Extensions;
using NorthWind.Membership.Backend.Core.Dtos;
using NorthWind.Membership.Backend.Core.Interfaces.Common;
using NorthWind.Membership.Entities.Dtos.UserLogin;
using NorthWind.Membership.Entities.Dtos.UserRegistration;
using NorthWind.Result.Entities;
using NorthWind.Validation.Entities.ValueObjects;
namespace NorthWind.Membership.Backend.AspNetIdentity.Services;
internal sealed class MembershipService(UserManager<NorthWindUser> userManager):IMembershipService
{
 public async Task<Result<IEnumerable<ValidationError>>> Register(UserRegistrationDto d)
 {
  var user=new NorthWindUser{UserName=d.Email,Email=d.Email,FirstName=d.FirstName,LastName=d.LastName};
  var result=await userManager.CreateAsync(user,d.Password);
  return result.Succeeded?new Result<IEnumerable<ValidationError>>():new Result<IEnumerable<ValidationError>>(result.Errors.ToValidationErrors());
 }
 public async Task<UserDto?> GetUserByCredentials(UserCredentialsDto d)
 {
  var user=await userManager.FindByEmailAsync(d.Email); if(user is null||!await userManager.CheckPasswordAsync(user,d.Password)) return null;
  return new UserDto(user.Email??d.Email,user.FirstName,user.LastName);
 }
}
