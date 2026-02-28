namespace CosmetologyBooking.Application.Auth.DTOs;

public record RegisterRequest(string Email, string Password, string Name, string? Phone);
