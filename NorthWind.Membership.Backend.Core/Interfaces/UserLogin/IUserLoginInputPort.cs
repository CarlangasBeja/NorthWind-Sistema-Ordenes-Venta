using NorthWind.Membership.Entities.Dtos.UserLogin;
namespace NorthWind.Membership.Backend.Core.Interfaces.UserLogin;
public interface IUserLoginInputPort { Task Handle(UserCredentialsDto userData); }
