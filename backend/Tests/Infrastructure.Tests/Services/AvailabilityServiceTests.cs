using CosmetologyBooking.Domain.Entities;
using CosmetologyBooking.Domain.Enums;
using CosmetologyBooking.Infrastructure.Data;
using CosmetologyBooking.Infrastructure.Repositories;
using CosmetologyBooking.Infrastructure.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace CosmetologyBooking.Infrastructure.Tests.Services;

public class AvailabilityServiceTests
{
    private static AppDbContext CreateInMemoryContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(dbName)
            .Options;
        return new AppDbContext(options);
    }

    private static IConfiguration CreateConfiguration(int startHour = 9, int endHour = 18, int slotInterval = 30)
    {
        var settings = new Dictionary<string, string?>
        {
            ["BusinessHours:StartHour"] = startHour.ToString(),
            ["BusinessHours:EndHour"] = endHour.ToString(),
            ["BusinessHours:SlotIntervalMinutes"] = slotInterval.ToString(),
            ["Jwt:Key"] = "TestSecretKey-ForUnitTests-AtLeast256BitsLong!",
            ["Jwt:Issuer"] = "TestIssuer",
            ["Jwt:Audience"] = "TestAudience"
        };
        return new ConfigurationBuilder().AddInMemoryCollection(settings).Build();
    }

    [Fact]
    public async Task GetAvailableSlotsAsync_NonExistentService_ReturnsEmptyList()
    {
        using var context = CreateInMemoryContext(nameof(GetAvailableSlotsAsync_NonExistentService_ReturnsEmptyList));
        var repo = new AppointmentRepository(context);
        var service = new AvailabilityService(repo, context, CreateConfiguration());

        var result = await service.GetAvailableSlotsAsync(DateTime.UtcNow, serviceId: 999);

        result.Should().BeEmpty();
    }

    [Fact]
    public async Task GetAvailableSlotsAsync_ReturnsSlotsCoveringBusinessHours()
    {
        using var context = CreateInMemoryContext(nameof(GetAvailableSlotsAsync_ReturnsSlotsCoveringBusinessHours));
        var cosmetologist = new User { Email = "c@test.com", Name = "Cosm", Role = UserRole.Cosmetologist, PasswordHash = "h" };
        var svc = new Service { Name = "Haircut", Price = 30, DurationMinutes = 30, IsActive = true };
        context.Users.Add(cosmetologist);
        context.Services.Add(svc);
        await context.SaveChangesAsync();

        var repo = new AppointmentRepository(context);
        var availabilityService = new AvailabilityService(repo, context, CreateConfiguration(startHour: 9, endHour: 18, slotInterval: 30));

        var date = new DateTime(2026, 8, 1, 0, 0, 0, DateTimeKind.Utc);
        var result = await availabilityService.GetAvailableSlotsAsync(date, svc.Id);

        // 9:00-18:00 with 30-min service and 30-min intervals → 18 slots
        result.Should().HaveCount(18);
        result.First().StartTime.Hour.Should().Be(9);
        result.Last().StartTime.Hour.Should().Be(17);
        result.Last().StartTime.Minute.Should().Be(30);
        result.All(s => s.Available).Should().BeTrue();
    }

    [Fact]
    public async Task GetAvailableSlotsAsync_WithBookedSlot_MarksSlotUnavailable()
    {
        using var context = CreateInMemoryContext(nameof(GetAvailableSlotsAsync_WithBookedSlot_MarksSlotUnavailable));
        var customer = new User { Email = "cu@test.com", Name = "Customer", Role = UserRole.Customer, PasswordHash = "h" };
        var cosmetologist = new User { Email = "c@test.com", Name = "Cosm", Role = UserRole.Cosmetologist, PasswordHash = "h" };
        var svc = new Service { Name = "Facial", Price = 50, DurationMinutes = 60, IsActive = true };
        context.Users.AddRange(customer, cosmetologist);
        context.Services.Add(svc);
        await context.SaveChangesAsync();

        var date = new DateTime(2026, 8, 1, 0, 0, 0, DateTimeKind.Utc);
        // Book the 9:00 slot
        context.Appointments.Add(new Appointment
        {
            CustomerId = customer.Id,
            ServiceId = svc.Id,
            CosmetologistId = cosmetologist.Id,
            StartDateTime = date.AddHours(9),
            Status = AppointmentStatus.Confirmed
        });
        await context.SaveChangesAsync();

        var repo = new AppointmentRepository(context);
        var availabilityService = new AvailabilityService(repo, context, CreateConfiguration(startHour: 9, endHour: 18, slotInterval: 60));

        var result = await availabilityService.GetAvailableSlotsAsync(date, svc.Id, cosmetologist.Id);

        // The 9:00 slot should be unavailable
        var nineOclock = result.FirstOrDefault(s => s.StartTime.Hour == 9);
        nineOclock.Should().NotBeNull();
        nineOclock!.Available.Should().BeFalse();

        // The 10:00 slot should be available
        var tenOclock = result.FirstOrDefault(s => s.StartTime.Hour == 10);
        tenOclock.Should().NotBeNull();
        tenOclock!.Available.Should().BeTrue();
    }

    [Fact]
    public async Task IsTimeSlotAvailableAsync_NoConflict_ReturnsTrue()
    {
        using var context = CreateInMemoryContext(nameof(IsTimeSlotAvailableAsync_NoConflict_ReturnsTrue));
        var cosmetologist = new User { Email = "c@test.com", Name = "Cosm", Role = UserRole.Cosmetologist, PasswordHash = "h" };
        context.Users.Add(cosmetologist);
        await context.SaveChangesAsync();

        var repo = new AppointmentRepository(context);
        var availabilityService = new AvailabilityService(repo, context, CreateConfiguration());

        var result = await availabilityService.IsTimeSlotAvailableAsync(cosmetologist.Id, DateTime.UtcNow.AddDays(1), 60);

        result.Should().BeTrue();
    }

    [Fact]
    public async Task IsTimeSlotAvailableAsync_WithConflict_ReturnsFalse()
    {
        using var context = CreateInMemoryContext(nameof(IsTimeSlotAvailableAsync_WithConflict_ReturnsFalse));
        var customer = new User { Email = "cu@test.com", Name = "Customer", Role = UserRole.Customer, PasswordHash = "h" };
        var cosmetologist = new User { Email = "c@test.com", Name = "Cosm", Role = UserRole.Cosmetologist, PasswordHash = "h" };
        var svc = new Service { Name = "Facial", Price = 50, DurationMinutes = 60, IsActive = true };
        context.Users.AddRange(customer, cosmetologist);
        context.Services.Add(svc);
        await context.SaveChangesAsync();

        var startTime = new DateTime(2026, 8, 1, 10, 0, 0, DateTimeKind.Utc);
        context.Appointments.Add(new Appointment
        {
            CustomerId = customer.Id,
            ServiceId = svc.Id,
            CosmetologistId = cosmetologist.Id,
            StartDateTime = startTime,
            Status = AppointmentStatus.Confirmed
        });
        await context.SaveChangesAsync();

        var repo = new AppointmentRepository(context);
        var availabilityService = new AvailabilityService(repo, context, CreateConfiguration());

        var result = await availabilityService.IsTimeSlotAvailableAsync(cosmetologist.Id, startTime, 60);

        result.Should().BeFalse();
    }
}
