using NorthWind.Validation.Entities.Enums;
using NorthWind.Validation.Entities.ValueObjects;
namespace NorthWind.Validation.Entities.Interfaces;
public interface IModelValidator<T>
{
    ValidationConstraint Constraint { get; }
    IEnumerable<ValidationError> Errors { get; }
    Task<bool> Validate(T model);
}
