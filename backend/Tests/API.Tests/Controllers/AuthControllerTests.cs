using System.Net;
using System.Net.Http.Json;
using CosmetologyBooking.Application.Auth.DTOs;
using CosmetologyBooking.Infrastructure.Data;
using FluentAssertions;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;

namespace CosmetologyBooking.API.Tests.Controllers;

/// <summary>
/// Integration tests for AuthController using WebApplicationFactory with an in-memory SQLite database.
/// </summary>
public class AuthControllerTests
{
    private static WebApplicationFactory<Program> CreateFactory(string dbName)
    {
        return new WebApplicationFactory<Program>().WithWebHostBuilder(builder =>
        {
            builder.UseEnvironment("Testing");
            // Use SQLite in-memory with a named shared-cache database (same provider, no conflict)
            builder.UseSetting("ConnectionStrings:Default", $"DataSource=file:{dbName}?mode=memory&cache=shared");
        });
    }

    private static AppDbContext CreateSeedContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlite($"DataSource=file:{dbName}?mode=memory&cache=shared")
            .Options;
        var ctx = new AppDbContext(options);
        ctx.Database.EnsureCreated();
        return ctx;
    }

    [Fact]
    public async Task Register_ValidRequest_Returns200()
    {
        await using var factory = CreateFactory(nameof(Register_ValidRequest_Returns200));
        await using var ctx = CreateSeedContext(nameof(Register_ValidRequest_Returns200));
        var client = factory.CreateClient();
        var request = new { email = "register@test.com", password = "Password123!", name = "Test User" };

        var response = await client.PostAsJsonAsync("/api/auth/register", request);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task Register_DuplicateEmail_Returns409Conflict()
    {
        await using var factory = CreateFactory(nameof(Register_DuplicateEmail_Returns409Conflict));
        await using var ctx = CreateSeedContext(nameof(Register_DuplicateEmail_Returns409Conflict));
        var client = factory.CreateClient();
        var request = new { email = "dup@test.com", password = "Password123!", name = "User One" };

        await client.PostAsJsonAsync("/api/auth/register", request);
        var response = await client.PostAsJsonAsync("/api/auth/register", request);

        response.StatusCode.Should().Be(HttpStatusCode.Conflict);
    }

    [Fact]
    public async Task Login_ValidCredentials_Returns200WithToken()
    {
        await using var factory = CreateFactory(nameof(Login_ValidCredentials_Returns200WithToken));
        await using var ctx = CreateSeedContext(nameof(Login_ValidCredentials_Returns200WithToken));
        var client = factory.CreateClient();
        const string email = "login@test.com";
        const string password = "Password123!";

        await client.PostAsJsonAsync("/api/auth/register", new { email, password, name = "Login User" });
        var loginResponse = await client.PostAsJsonAsync("/api/auth/login", new { email, password });

        loginResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await loginResponse.Content.ReadFromJsonAsync<AuthResponse>();
        body.Should().NotBeNull();
        body!.Token.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task Login_InvalidPassword_Returns401()
    {
        await using var factory = CreateFactory(nameof(Login_InvalidPassword_Returns401));
        await using var ctx = CreateSeedContext(nameof(Login_InvalidPassword_Returns401));
        var client = factory.CreateClient();
        const string email = "badpw@test.com";

        await client.PostAsJsonAsync("/api/auth/register", new { email, password = "Correct123!", name = "User" });
        var response = await client.PostAsJsonAsync("/api/auth/login", new { email, password = "WrongPassword!" });

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Login_UnknownEmail_Returns401()
    {
        await using var factory = CreateFactory(nameof(Login_UnknownEmail_Returns401));
        await using var ctx = CreateSeedContext(nameof(Login_UnknownEmail_Returns401));
        var client = factory.CreateClient();
        var response = await client.PostAsJsonAsync("/api/auth/login", new { email = "nobody@test.com", password = "Pass123!" });

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}
