using NorthWind.Validation.Entities.Enums;
using NorthWind.Validation.Entities.Interfaces;
using NorthWind.Validation.Entities.ValueObjects;
namespace NorthWind.Validation.Entities.Services;
internal class ModelValidatorHub<ModelType>(IEnumerable<IModelValidator<ModelType>> validators) : IModelValidatorHub<ModelType>
{
    public IEnumerable<ValidationError> Errors { get; private set; } = [];
    public async Task<bool> Validate(ModelType model)
    {
        List<ValidationError> currentErrors = [];
        var ordered = validators.Where(v => v.Constraint == ValidationConstraint.AlwaysValidate).ToList();
        ordered.AddRange(validators.Where(v => v.Constraint == ValidationConstraint.ValidateIfThereAreNoPreviousErrors));
        foreach (var validator in ordered)
        {
            if (validator.Constraint == ValidationConstraint.AlwaysValidate || !currentErrors.Any())
            {
                if (!await validator.Validate(model)) currentErrors.AddRange(validator.Errors);
            }
        }
        Errors = currentErrors;
        return !currentErrors.Any();
    }
}
