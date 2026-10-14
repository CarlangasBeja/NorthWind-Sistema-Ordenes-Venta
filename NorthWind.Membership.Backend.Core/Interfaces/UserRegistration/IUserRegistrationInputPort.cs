using NorthWind.Membership.Entities.Dtos.UserRegistration;
namespace NorthWind.Membership.Backend.Core.Interfaces.UserRegistration;
public interface IUserRegistrationInputPort { Task Handle(UserRegistrationDto userData); }
