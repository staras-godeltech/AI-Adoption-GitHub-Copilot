using System.Text;
using CosmetologyBooking.Application.Auth.Interfaces;
using CosmetologyBooking.Application.Repositories;
using CosmetologyBooking.Infrastructure.Data;
using CosmetologyBooking.Infrastructure.Repositories;
using CosmetologyBooking.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Configure Swagger/OpenAPI
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Cosmetology Booking API",
        Version = "v1",
        Description = "API for managing cosmetology services, appointments, and bookings"
    });

    // Add JWT Bearer authentication to Swagger
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "JWT Authorization header using the Bearer scheme. Enter your token in the text input below."
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

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

// Register ServiceRepository
builder.Services.AddScoped<IServiceRepository, ServiceRepository>();

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
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "Cosmetology Booking API v1");
        options.RoutePrefix = "swagger";
        options.DocumentTitle = "Cosmetology Booking API";
    });

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
    documentation = "/swagger",
    endpoints = new
    {
        health = "/api/health",
        apiDocs = "/swagger",
        openApiSpec = "/swagger/v1/swagger.json"
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
