using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using CosmetologyBooking.Application.Auth.DTOs;
using CosmetologyBooking.Application.Auth.Interfaces;
using CosmetologyBooking.Domain.Entities;
using CosmetologyBooking.Domain.Enums;
using CosmetologyBooking.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace CosmetologyBooking.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthService(AppDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            throw new InvalidOperationException("A user with this email already exists.");

        var user = new User
        {
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Name = request.Name,
            PhoneNumber = request.Phone,
            Role = UserRole.Customer
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return new AuthResponse(GenerateToken(user), user.Id, user.Email, user.Name, user.Role.ToString());
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var user = await _context.Users.SingleOrDefaultAsync(u => u.Email == request.Email)
            ?? throw new UnauthorizedAccessException("Invalid email or password.");

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Invalid email or password.");

        return new AuthResponse(GenerateToken(user), user.Id, user.Email, user.Name, user.Role.ToString());
    }

    private string GenerateToken(User user)
    {
        var jwtSettings = _configuration.GetSection("Jwt");
        var keyString = jwtSettings["Key"] ?? throw new InvalidOperationException("JWT Key is not configured.");
        var keyBytes = Encoding.UTF8.GetBytes(keyString);

        if (keyBytes.Length < 32)
            throw new InvalidOperationException("JWT Key must be at least 256 bits (32 bytes) long.");

        var key = new SymmetricSecurityKey(keyBytes);
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(ClaimTypes.Name, user.Name),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(double.Parse(jwtSettings["ExpiryHours"] ?? "24")),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
