using System.Linq.Expressions;
using NorthWind.Validation.Entities.Interfaces;
using NorthWind.Validation.Entities.ValueObjects;

namespace NorthWind.ValidationService.FluentValidation.Services;

internal class FluentValidationService<T> : IValidationService<T>
{
    // Wrapper utilizado para encapsular la funcionalidad
    // de AbstractValidator<T> de FluentValidation.
    internal readonly AbstractValidatorImplementation<T> Wrapper =
        new AbstractValidatorImplementation<T>();

    public IValidationRules<T, TProperty> AddRuleFor<TProperty>(
        Expression<Func<T, TProperty>> expression) =>
        new ValidationRules<T, TProperty>(
            Wrapper.RuleFor(expression));

    public ICollectionValidationRules<T, TProperty> AddRuleForEach<TProperty>(
        Expression<Func<T, IEnumerable<TProperty>>> expression) =>
        new CollectionValidationRules<T, TProperty>(
            Wrapper.RuleForEach(expression));

    public async Task<IEnumerable<ValidationError>?> Validate(T model)
    {
        var Result = await Wrapper.ValidateAsync(model);

        IEnumerable<ValidationError>? Errors = default;

        if (!Result.IsValid)
        {
            Errors = Result.Errors
                .Select(e => new ValidationError(
                    e.PropertyName,
                    e.ErrorMessage));
        }

        return Errors;
    }
}