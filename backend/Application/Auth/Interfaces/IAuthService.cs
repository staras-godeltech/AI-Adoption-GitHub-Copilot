using CosmetologyBooking.Application.Auth.DTOs;

namespace CosmetologyBooking.Application.Auth.Interfaces;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<AuthResponse> LoginAsync(LoginRequest request);
}
