using Microsoft.AspNetCore.Http;
using NorthWind.Membership.Backend.Core.Dtos;
using NorthWind.Result.Entities;
using NorthWind.Validation.Entities.ValueObjects;
namespace NorthWind.Membership.Backend.Core.Interfaces.UserLogin;
public interface IUserLoginOutputPort { IResult Result{get;} Task Handle(Result<UserDto,IEnumerable<ValidationError>> userLoginResult); }
