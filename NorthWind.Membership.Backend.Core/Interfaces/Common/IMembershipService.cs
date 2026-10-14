using NorthWind.Membership.Backend.Core.Dtos;
using NorthWind.Membership.Entities.Dtos.UserLogin;
using NorthWind.Membership.Entities.Dtos.UserRegistration;
using NorthWind.Result.Entities;
using NorthWind.Validation.Entities.ValueObjects;
namespace NorthWind.Membership.Backend.Core.Interfaces.Common;
public interface IMembershipService
{
 Task<Result<IEnumerable<ValidationError>>> Register(UserRegistrationDto userData);
 Task<UserDto?> GetUserByCredentials(UserCredentialsDto userData);
}
