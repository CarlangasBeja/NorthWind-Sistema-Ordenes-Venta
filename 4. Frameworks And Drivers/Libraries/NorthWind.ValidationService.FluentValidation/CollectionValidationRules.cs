using FluentValidation;
using NorthWind.Validation.Entities.Abstractions;
using NorthWind.Validation.Entities.Interfaces;

namespace NorthWind.ValidationService.FluentValidation.Services;

internal class CollectionValidationRules<T, TProperty>(
    IRuleBuilderInitialCollection<T, TProperty> ruleBuilderInitialCollection) :
    ICollectionValidationRules<T, TProperty>
{
    public ICollectionValidationRules<T, TProperty> SetValidator(
        IModelValidator<TProperty> modelValidator)
    {
        var ModelValidator =
            modelValidator as AbstractModelValidator<TProperty>;

        var ValidationService =
            ModelValidator.ValidatorService as
            FluentValidationService<TProperty>;

        ruleBuilderInitialCollection
            .SetValidator(ValidationService.Wrapper);

        return this;
    }
}