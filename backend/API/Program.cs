using System.Text;
using CosmetologyBooking.Application.Auth.Interfaces;
using CosmetologyBooking.Application.Repositories;
using CosmetologyBooking.Infrastructure.Data;
using CosmetologyBooking.Infrastructure.Repositories;
using CosmetologyBooking.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi("v1", options =>
{
    options.AddDocumentTransformer<BearerSecuritySchemeTransformer>();
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
    app.MapOpenApi();
    app.MapScalarApiReference(options =>
    {
        options.WithPreferredScheme("Bearer")
               .WithHttpBearerAuthentication(bearer =>
               {
                   bearer.Token = "your-jwt-token-here";
               });
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

// Document transformer to add Bearer authentication scheme to OpenAPI
internal sealed class BearerSecuritySchemeTransformer(IAuthenticationSchemeProvider authenticationSchemeProvider) : IOpenApiDocumentTransformer
{
    public async Task TransformAsync(OpenApiDocument document, OpenApiDocumentTransformerContext context, CancellationToken cancellationToken)
    {
        var authenticationSchemes = await authenticationSchemeProvider.GetAllSchemesAsync();
        if (authenticationSchemes.Any(scheme => scheme.Name == JwtBearerDefaults.AuthenticationScheme))
        {
            var bearerScheme = new OpenApiSecurityScheme
            {
                Type = SecuritySchemeType.Http,
                Scheme = "bearer",
                In = ParameterLocation.Header,
                BearerFormat = "JWT",
                Description = "JWT Authorization header using the Bearer scheme. Enter your token in the text input below."
            };

            var schemeReference = new OpenApiSecuritySchemeReference(JwtBearerDefaults.AuthenticationScheme, document);
            var requirements = new OpenApiSecurityRequirement
            {
                [schemeReference] = []
            };

            document.Components ??= new();
            if (document.Components.SecuritySchemes == null)
            {
                document.Components.SecuritySchemes = new Dictionary<string, IOpenApiSecurityScheme>();
            }
            document.Components.SecuritySchemes[JwtBearerDefaults.AuthenticationScheme] = bearerScheme;

            if (document.Paths != null)
            {
                foreach (var path in document.Paths.Values)
                {
                    if (path.Operations != null)
                    {
                        foreach (var operation in path.Operations.Values)
                        {
                            operation.Security ??= new List<OpenApiSecurityRequirement>();
                            operation.Security.Add(requirements);
                        }
                    }
                }
            }
        }
    }
}
