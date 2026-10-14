using Microsoft.AspNetCore.Components; using NorthWind.Membership.Frontend.RazorViews.ViewModels.UserRegistration;
namespace NorthWind.Membership.Frontend.RazorViews.Components; public partial class UserRegistrationComponent{[Parameter] public UserRegistrationViewModel ViewModel{get;set;}}
