using Microsoft.AspNetCore.Identity;
using NorthWind.Membership.Backend.AspNetIdentity.Resources;
using NorthWind.Membership.Entities.Dtos.UserRegistration;
using NorthWind.Validation.Entities.ValueObjects;

namespace NorthWind.Membership.Backend.AspNetIdentity.Extensions;

internal static class IdentityErrorExtensions
{
    public static IEnumerable<ValidationError> ToValidationErrors(
        this IEnumerable<IdentityError> errors)
    {
        List<ValidationError> Result = [];

        foreach (var Error in errors)
        {
            switch (Error.Code)
            {
                case nameof(IdentityErrorDescriber.DuplicateUserName):
                    Result.Add(new ValidationError(
                        nameof(UserRegistrationDto.Email),
                        Messages.DuplicateUserNameErrorMessage));
                    break;
                default:
                    Result.Add(new ValidationError(
                        Error.Code, Error.Description));
                    break;
            }
        }

        return Result;
    }
}
