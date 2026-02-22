using System.Text;
using CosmetologyBooking.Application.Auth.Interfaces;
using CosmetologyBooking.Infrastructure.Data;
using CosmetologyBooking.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();

// Configure CORS for frontend (React on port 5173)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Register EF Core DbContext with SQLite
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("Default")));

// Register AuthService
builder.Services.AddScoped<IAuthService, AuthService>();

// Configure JWT authentication
var jwtSettings = builder.Configuration.GetSection("Jwt");
var key = Encoding.UTF8.GetBytes(jwtSettings["Key"]!);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(key)
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();

    // Initialize and seed the database in Development
    await DbInitializer.InitializeAsync(app.Services);
}

app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Root endpoint - API information
app.MapGet("/", () => Results.Ok(new
{
    name = "CosmetologyBooking API",
    version = "1.0.0",
    status = "Running",
    documentation = "/scalar/v1",
    endpoints = new
    {
        health = "/api/health",
        apiDocs = "/scalar/v1",
        openApiSpec = "/openapi/v1.json"
    }
}))
.WithName("ApiInfo")
.WithTags("Info")
.ExcludeFromDescription();

// Health check endpoint
app.MapGet("/api/health", () => Results.Ok(new 
{ 
    status = "Healthy", 
    timestamp = DateTime.UtcNow,
    service = "CosmetologyBooking.API"
}))
.WithName("HealthCheck")
.WithTags("Health");

// Services endpoint - returns seeded services to verify DB connectivity
app.MapGet("/api/services", async (AppDbContext db) =>
{
    var services = await db.Services
        .Where(s => s.IsActive)
        .Select(s => new
        {
            s.Id,
            s.Name,
            s.Description,
            s.DurationMinutes,
            s.Price,
            s.IsActive
        })
        .ToListAsync();

    return Results.Ok(services);
})
.WithName("GetServices")
.WithTags("Services");

// DB diagnostic endpoint - returns counts of Users/Services/Appointments
app.MapGet("/api/test/db", async (AppDbContext db) =>
{
    var counts = new
    {
        users = await db.Users.CountAsync(),
        services = await db.Services.CountAsync(),
        appointments = await db.Appointments.CountAsync(),
        timeSlots = await db.TimeSlots.CountAsync()
    };
    return Results.Ok(counts);
})
.RequireAuthorization()
.WithName("DbTest")
.WithTags("Diagnostics");

app.Run();
