using System.Linq.Expressions;
using FluentValidation;
using FluentValidation.Validators;
using NorthWind.Validation.Entities.Interfaces;

namespace NorthWind.ValidationService.FluentValidation.Services;

internal sealed class ValidationRules<T, TProperty>(IRuleBuilderInitial<T, TProperty> rule) : IValidationRules<T, TProperty>
{
    private readonly IRuleBuilderInitial<T, TProperty> _rule = rule;

    public IValidationRules<T, TProperty> NotEmpty(string errorMessage)
    { _rule.NotEmpty().WithMessage(errorMessage); return this; }

    public IValidationRules<T, TProperty> NotNull(string errorMessage)
    { _rule.NotNull().WithMessage(errorMessage); return this; }

    public IValidationRules<T, TProperty> Must(Func<TProperty, bool> predicate, string errorMessage)
    { _rule.Must(predicate).WithMessage(errorMessage); return this; }

    public IValidationRules<T, TProperty> StopOnFirstFailure()
    { _rule.Cascade(CascadeMode.Stop); return this; }

    public IValidationRules<T, TProperty> GreaterThan<TValue>(TValue valueToCompare, string errorMessage)
        where TValue : TProperty, IComparable<TValue>, IComparable
    {
        _rule.Must(value => value is not null && Comparer<TProperty>.Default.Compare(value, valueToCompare) > 0)
             .WithMessage(errorMessage);
        return this;
    }

    public IValidationRules<T, TProperty> Equal(Expression<Func<T, TProperty>> expression, string errorMessage)
    { _rule.Equal(expression).WithMessage(errorMessage); return this; }

    public IValidationRules<T, string> Length(int length, string errorMessage)
    {
        StringRule().Length(length).WithMessage(errorMessage);
        return (IValidationRules<T, string>)(object)this;
    }

    public IValidationRules<T, string> MaximumLength(int length, string errorMessage)
    {
        StringRule().MaximumLength(length).WithMessage(errorMessage);
        return (IValidationRules<T, string>)(object)this;
    }

    public IValidationRules<T, string> MinimumLength(int length, string errorMessage)
    {
        StringRule().MinimumLength(length).WithMessage(errorMessage);
        return (IValidationRules<T, string>)(object)this;
    }

    public IValidationRules<T, string> EmailAddress(string errorMessage)
    {
        StringRule().EmailAddress(EmailValidationMode.AspNetCoreCompatible).WithMessage(errorMessage);
        return (IValidationRules<T, string>)(object)this;
    }

    private IRuleBuilder<T, string> StringRule() =>
        _rule is IRuleBuilder<T, string> stringRule
            ? stringRule
            : throw new InvalidOperationException("This rule can only be applied to string properties.");
}
