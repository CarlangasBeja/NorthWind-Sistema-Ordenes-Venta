using Microsoft.AspNetCore.Identity;
namespace NorthWind.Membership.Backend.AspNetIdentity.Entities;
public sealed class NorthWindUser:IdentityUser { public string FirstName{get;set;}=string.Empty; public string LastName{get;set;}=string.Empty; }
