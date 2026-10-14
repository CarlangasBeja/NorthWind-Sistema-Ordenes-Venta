namespace NorthWind.Exceptions.Entities.Resources;
internal static class ExceptionMessages
{
    public const string ValidationExceptionTitle = "Input data error.";
    public const string ValidationExceptionDetail = "One or more validation errors were found.";
    public const string UpdateExceptionTitle = "Update error.";
    public const string UpdateExceptionDetail = "The data could not be updated. Please try again.";
    public const string UnhandledExceptionTitle = "The service is currently unavailable.";
    public const string UnhandledExceptionDetail = "Please try again later.";
    public const string UnauthorizedAccessExceptionTitle = "Unauthorized access.";
    public const string UnauthorizedAccessExceptionDetail = "You must sign in to access this resource.";
}
