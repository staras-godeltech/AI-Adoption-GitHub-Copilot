namespace CosmetologyBooking.Application.Auth.DTOs;

public record AuthResponse(string Token, int UserId, string Email, string Name, string Role);
