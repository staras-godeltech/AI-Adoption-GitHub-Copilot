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

// TODO: Add SQLite DbContext here when database is configured
// builder.Services.AddDbContext<AppDbContext>(options =>
//     options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseCors("AllowFrontend");
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

app.Run();
