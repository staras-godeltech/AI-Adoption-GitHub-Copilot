using CosmetologyBooking.Domain.Entities;
using CosmetologyBooking.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace CosmetologyBooking.Infrastructure.Data;

public static class DbInitializer
{
    public static async Task InitializeAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<AppDbContext>>();

        try
        {
            await context.Database.MigrateAsync();
            await SeedAsync(context);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while initializing the database.");
            throw;
        }
    }

    private static async Task SeedAsync(AppDbContext context)
    {
        if (await context.Users.AnyAsync())
            return;

        // Use a consistent password for all seeded users for testing
        const string seedPassword = "Password123!";

        var users = new List<User>
        {
            new()
            {
                Name = "Admin User",
                Email = "admin@cosmetology.local",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(seedPassword),
                Role = UserRole.Admin,
                PhoneNumber = "+1-555-0001"
            },
            new()
            {
                Name = "Jane Smith",
                Email = "jane.smith@cosmetology.local",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(seedPassword),
                Role = UserRole.Cosmetologist,
                PhoneNumber = "+1-555-0002"
            },
            new()
            {
                Name = "John Doe",
                Email = "john.doe@cosmetology.local",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(seedPassword),
                Role = UserRole.Customer,
                PhoneNumber = "+1-555-0003"
            }
        };

        context.Users.AddRange(users);

        var services = new List<Service>
        {
            new() { Name = "Classic Facial", Description = "A rejuvenating 60-minute facial treatment.", DurationMinutes = 60, Price = 85.00m, IsActive = true },
            new() { Name = "Eyebrow Shaping", Description = "Precision eyebrow shaping and tinting.", DurationMinutes = 30, Price = 35.00m, IsActive = true },
            new() { Name = "Full Body Massage", Description = "Relaxing full body massage.", DurationMinutes = 90, Price = 120.00m, IsActive = true },
            new() { Name = "Manicure", Description = "Classic manicure with nail polish.", DurationMinutes = 45, Price = 40.00m, IsActive = true },
            new() { Name = "Pedicure", Description = "Luxurious pedicure with foot soak.", DurationMinutes = 60, Price = 55.00m, IsActive = true }
        };

        context.Services.AddRange(services);
        await context.SaveChangesAsync();

        // Seed a time slot for the cosmetologist
        var cosmetologist = users[1];
        var tomorrow = DateTime.UtcNow.Date.AddDays(1);
        context.TimeSlots.Add(new TimeSlot
        {
            CosmetologistId = cosmetologist.Id,
            StartDateTime = tomorrow.AddHours(9),
            EndDateTime = tomorrow.AddHours(17),
            IsAvailable = true
        });

        // Seed an appointment for verification
        var customer = users[2];
        var firstService = services[0];
        context.Appointments.Add(new Appointment
        {
            CustomerId = customer.Id,
            ServiceId = firstService.Id,
            StartDateTime = tomorrow.AddHours(10),
            Status = AppointmentStatus.Confirmed,
            Notes = "First appointment - verification seed"
        });

        await context.SaveChangesAsync();
    }
}
