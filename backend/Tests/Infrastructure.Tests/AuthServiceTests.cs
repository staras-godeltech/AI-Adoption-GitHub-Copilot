using CosmetologyBooking.Application.Auth.DTOs;
using CosmetologyBooking.Domain.Enums;
using CosmetologyBooking.Infrastructure.Data;
using CosmetologyBooking.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace CosmetologyBooking.Infrastructure.Tests;

public class AuthServiceTests
{
    private static AppDbContext CreateInMemoryContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(dbName)
            .Options;
        return new AppDbContext(options);
    }

    private static IConfiguration CreateConfiguration()
    {
        var settings = new Dictionary<string, string?>
        {
            ["Jwt:Key"] = "TestSecretKey-ForUnitTests-AtLeast256BitsLong!",
            ["Jwt:Issuer"] = "TestIssuer",
            ["Jwt:Audience"] = "TestAudience",
            ["Jwt:ExpiryHours"] = "24"
        };
        return new ConfigurationBuilder()
            .AddInMemoryCollection(settings)
            .Build();
    }

    [Fact]
    public async Task RegisterAsync_ValidRequest_ReturnsAuthResponse()
    {
        using var context = CreateInMemoryContext(nameof(RegisterAsync_ValidRequest_ReturnsAuthResponse));
        var service = new AuthService(context, CreateConfiguration());

        var request = new RegisterRequest("test@example.com", "Password123!", "Test User", "+1-555-0001");
        var response = await service.RegisterAsync(request);

        Assert.NotNull(response);
        Assert.Equal("test@example.com", response.Email);
        Assert.Equal("Test User", response.Name);
        Assert.Equal(UserRole.Customer.ToString(), response.Role);
        Assert.NotEmpty(response.Token);
    }

    [Fact]
    public async Task RegisterAsync_DuplicateEmail_ThrowsInvalidOperationException()
    {
        using var context = CreateInMemoryContext(nameof(RegisterAsync_DuplicateEmail_ThrowsInvalidOperationException));
        var service = new AuthService(context, CreateConfiguration());

        var request = new RegisterRequest("dupe@example.com", "Password123!", "User One", null);
        await service.RegisterAsync(request);

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.RegisterAsync(new RegisterRequest("dupe@example.com", "Other123!", "User Two", null)));
    }

    [Fact]
    public async Task RegisterAsync_PasswordIsHashed()
    {
        using var context = CreateInMemoryContext(nameof(RegisterAsync_PasswordIsHashed));
        var service = new AuthService(context, CreateConfiguration());

        var plainPassword = "PlainPassword123!";
        var request = new RegisterRequest("hash@example.com", plainPassword, "Hash User", null);
        await service.RegisterAsync(request);

        var user = await context.Users.SingleAsync(u => u.Email == "hash@example.com");
        Assert.NotEqual(plainPassword, user.PasswordHash);
        Assert.True(BCrypt.Net.BCrypt.Verify(plainPassword, user.PasswordHash));
    }

    [Fact]
    public async Task LoginAsync_ValidCredentials_ReturnsAuthResponse()
    {
        using var context = CreateInMemoryContext(nameof(LoginAsync_ValidCredentials_ReturnsAuthResponse));
        var service = new AuthService(context, CreateConfiguration());

        await service.RegisterAsync(new RegisterRequest("login@example.com", "Pass123!", "Login User", null));

        var response = await service.LoginAsync(new LoginRequest("login@example.com", "Pass123!"));

        Assert.NotNull(response);
        Assert.Equal("login@example.com", response.Email);
        Assert.NotEmpty(response.Token);
    }

    [Fact]
    public async Task LoginAsync_WrongPassword_ThrowsUnauthorizedAccessException()
    {
        using var context = CreateInMemoryContext(nameof(LoginAsync_WrongPassword_ThrowsUnauthorizedAccessException));
        var service = new AuthService(context, CreateConfiguration());

        await service.RegisterAsync(new RegisterRequest("wrongpw@example.com", "Correct123!", "User", null));

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            service.LoginAsync(new LoginRequest("wrongpw@example.com", "WrongPassword!")));
    }

    [Fact]
    public async Task LoginAsync_UnknownEmail_ThrowsUnauthorizedAccessException()
    {
        using var context = CreateInMemoryContext(nameof(LoginAsync_UnknownEmail_ThrowsUnauthorizedAccessException));
        var service = new AuthService(context, CreateConfiguration());

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            service.LoginAsync(new LoginRequest("nobody@example.com", "Pass123!")));
    }

    [Fact]
    public async Task RegisterAsync_DefaultRoleIsCustomer()
    {
        using var context = CreateInMemoryContext(nameof(RegisterAsync_DefaultRoleIsCustomer));
        var service = new AuthService(context, CreateConfiguration());

        var response = await service.RegisterAsync(new RegisterRequest("role@example.com", "Role123!", "Role User", null));

        Assert.Equal(UserRole.Customer.ToString(), response.Role);
    }
}
