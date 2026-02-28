using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using CosmetologyBooking.Domain.Entities;
using CosmetologyBooking.Domain.Enums;
using CosmetologyBooking.Infrastructure.Data;
using FluentAssertions;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;

namespace CosmetologyBooking.API.Tests.Controllers;

/// <summary>
/// Integration tests for ServicesController using WebApplicationFactory with SQLite in-memory.
/// </summary>
public class ServicesControllerTests
{
    private static WebApplicationFactory<Program> CreateFactory(string dbName)
    {
        return new WebApplicationFactory<Program>().WithWebHostBuilder(builder =>
        {
            builder.UseEnvironment("Testing");
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

    private static async Task<string> RegisterAndLoginAsync(HttpClient client, AppDbContext seedCtx, string email, string password, string name, UserRole role = UserRole.Customer)
    {
        await client.PostAsJsonAsync("/api/auth/register", new { email, password, name });

        if (role == UserRole.Admin)
        {
            var user = await seedCtx.Users.SingleAsync(u => u.Email == email);
            user.Role = UserRole.Admin;
            await seedCtx.SaveChangesAsync();
        }

        var loginResp = await client.PostAsJsonAsync("/api/auth/login", new { email, password });
        var body = await loginResp.Content.ReadFromJsonAsync<Dictionary<string, object>>();
        return body!["token"].ToString()!;
    }

    [Fact]
    public async Task GetAll_Unauthenticated_ReturnsOnlyActiveServices()
    {
        const string dbName = nameof(GetAll_Unauthenticated_ReturnsOnlyActiveServices);
        await using var ctx = CreateSeedContext(dbName);
        ctx.Services.AddRange(
            new Service { Name = "Active Service", Price = 50, DurationMinutes = 30, IsActive = true },
            new Service { Name = "Inactive Service", Price = 40, DurationMinutes = 60, IsActive = false }
        );
        await ctx.SaveChangesAsync();

        await using var factory = CreateFactory(dbName);
        var client = factory.CreateClient();
        var response = await client.GetAsync("/api/services");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var services = await response.Content.ReadFromJsonAsync<List<Dictionary<string, object>>>();
        services.Should().NotBeNull();
        services!.Should().AllSatisfy(s => s["isActive"].ToString().Should().Be("True"));
    }

    [Fact]
    public async Task GetById_ExistingActiveService_Returns200()
    {
        const string dbName = nameof(GetById_ExistingActiveService_Returns200);
        await using var ctx = CreateSeedContext(dbName);
        var svc = new Service { Name = "Test Service", Price = 30, DurationMinutes = 45, IsActive = true };
        ctx.Services.Add(svc);
        await ctx.SaveChangesAsync();

        await using var factory = CreateFactory(dbName);
        var client = factory.CreateClient();
        var response = await client.GetAsync($"/api/services/{svc.Id}");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetById_NonExistingService_Returns404()
    {
        const string dbName = nameof(GetById_NonExistingService_Returns404);
        await using var ctx = CreateSeedContext(dbName);

        await using var factory = CreateFactory(dbName);
        var client = factory.CreateClient();
        var response = await client.GetAsync("/api/services/99999");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task Create_AsAdmin_Returns201()
    {
        const string dbName = nameof(Create_AsAdmin_Returns201);
        await using var ctx = CreateSeedContext(dbName);
        await using var factory = CreateFactory(dbName);
        var client = factory.CreateClient();
        var token = await RegisterAndLoginAsync(client, ctx, "admin@test.com", "Password123!", "Admin User", UserRole.Admin);

        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        var dto = new { name = "New Service", price = 99.99, durationMinutes = 60 };

        var response = await client.PostAsJsonAsync("/api/services", dto);

        response.StatusCode.Should().Be(HttpStatusCode.Created);
    }

    [Fact]
    public async Task Create_AsCustomer_Returns403()
    {
        const string dbName = nameof(Create_AsCustomer_Returns403);
        await using var ctx = CreateSeedContext(dbName);
        await using var factory = CreateFactory(dbName);
        var client = factory.CreateClient();
        var token = await RegisterAndLoginAsync(client, ctx, "customer@test.com", "Password123!", "Customer User", UserRole.Customer);

        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        var dto = new { name = "New Service", price = 99.99, durationMinutes = 60 };

        var response = await client.PostAsJsonAsync("/api/services", dto);

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task Create_Unauthenticated_Returns401()
    {
        const string dbName = nameof(Create_Unauthenticated_Returns401);
        await using var ctx = CreateSeedContext(dbName);
        await using var factory = CreateFactory(dbName);
        var client = factory.CreateClient();
        var dto = new { name = "New Service", price = 99.99, durationMinutes = 60 };

        var response = await client.PostAsJsonAsync("/api/services", dto);

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}
