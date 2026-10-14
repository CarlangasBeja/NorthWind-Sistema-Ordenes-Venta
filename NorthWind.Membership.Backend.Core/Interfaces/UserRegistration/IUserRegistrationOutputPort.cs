using Microsoft.AspNetCore.Http;
using NorthWind.Result.Entities;
using NorthWind.Validation.Entities.ValueObjects;
namespace NorthWind.Membership.Backend.Core.Interfaces.UserRegistration;
public interface IUserRegistrationOutputPort { IResult Result{get;} Task Handle(Result<IEnumerable<ValidationError>> userRegistrationResult); }
