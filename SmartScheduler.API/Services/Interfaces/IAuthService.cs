using SmartScheduler.API.DTOs;

namespace SmartScheduler.API.Services.Interfaces;

public interface IAuthService
{
    Task<AuthResponse?> LoginAsync(LoginRequest request);
    Task<AuthResponse?> RegisterAsync(RegisterRequest request);
}
