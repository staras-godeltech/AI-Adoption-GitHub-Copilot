using CosmetologyBooking.Domain.Entities;
using CosmetologyBooking.Domain.Enums;
using CosmetologyBooking.Infrastructure.Data;
using CosmetologyBooking.Infrastructure.Repositories;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace CosmetologyBooking.Infrastructure.Tests.Repositories;

public class AppointmentRepositoryTests
{
    private static AppDbContext CreateInMemoryContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(dbName)
            .Options;
        return new AppDbContext(options);
    }

    private static (User customer, User cosmetologist, Service service) SeedBasicData(AppDbContext context)
    {
        var customer = new User { Email = "customer@test.com", Name = "Customer", Role = UserRole.Customer, PasswordHash = "hash" };
        var cosmetologist = new User { Email = "cosm@test.com", Name = "Cosmetologist", Role = UserRole.Cosmetologist, PasswordHash = "hash" };
        var service = new Service { Name = "Facial", Price = 50, DurationMinutes = 60, IsActive = true };
        context.Users.AddRange(customer, cosmetologist);
        context.Services.Add(service);
        context.SaveChanges();
        return (customer, cosmetologist, service);
    }

    [Fact]
    public async Task AddAsync_ValidAppointment_CreatesAppointment()
    {
        using var context = CreateInMemoryContext(nameof(AddAsync_ValidAppointment_CreatesAppointment));
        var (customer, cosmetologist, service) = SeedBasicData(context);

        var repo = new AppointmentRepository(context);
        var appointment = new Appointment
        {
            CustomerId = customer.Id,
            ServiceId = service.Id,
            CosmetologistId = cosmetologist.Id,
            StartDateTime = DateTime.UtcNow.AddDays(1),
            Status = AppointmentStatus.Pending
        };

        var result = await repo.AddAsync(appointment);

        result.Id.Should().BeGreaterThan(0);
        (await context.Appointments.CountAsync()).Should().Be(1);
    }

    [Fact]
    public async Task GetByCustomerIdAsync_ReturnsCorrectAppointments()
    {
        using var context = CreateInMemoryContext(nameof(GetByCustomerIdAsync_ReturnsCorrectAppointments));
        var (customer, cosmetologist, service) = SeedBasicData(context);

        context.Appointments.Add(new Appointment
        {
            CustomerId = customer.Id,
            ServiceId = service.Id,
            CosmetologistId = cosmetologist.Id,
            StartDateTime = DateTime.UtcNow.AddDays(1),
            Status = AppointmentStatus.Pending
        });
        await context.SaveChangesAsync();

        var repo = new AppointmentRepository(context);
        var result = await repo.GetByCustomerIdAsync(customer.Id);

        result.Should().HaveCount(1);
        result.First().CustomerId.Should().Be(customer.Id);
    }

    [Fact]
    public async Task GetByCustomerIdAsync_WrongCustomerId_ReturnsEmpty()
    {
        using var context = CreateInMemoryContext(nameof(GetByCustomerIdAsync_WrongCustomerId_ReturnsEmpty));
        var (customer, cosmetologist, service) = SeedBasicData(context);

        context.Appointments.Add(new Appointment
        {
            CustomerId = customer.Id,
            ServiceId = service.Id,
            CosmetologistId = cosmetologist.Id,
            StartDateTime = DateTime.UtcNow.AddDays(1),
            Status = AppointmentStatus.Pending
        });
        await context.SaveChangesAsync();

        var repo = new AppointmentRepository(context);
        var result = await repo.GetByCustomerIdAsync(9999);

        result.Should().BeEmpty();
    }

    [Fact]
    public async Task GetByCosmetologistIdAsync_ReturnsCorrectAppointments()
    {
        using var context = CreateInMemoryContext(nameof(GetByCosmetologistIdAsync_ReturnsCorrectAppointments));
        var (customer, cosmetologist, service) = SeedBasicData(context);

        var start = DateTime.UtcNow.AddDays(1);
        context.Appointments.Add(new Appointment
        {
            CustomerId = customer.Id,
            ServiceId = service.Id,
            CosmetologistId = cosmetologist.Id,
            StartDateTime = start,
            Status = AppointmentStatus.Pending
        });
        await context.SaveChangesAsync();

        var repo = new AppointmentRepository(context);
        var result = await repo.GetByCosmetologistIdAsync(cosmetologist.Id);

        result.Should().HaveCount(1);
        result.First().CosmetologistId.Should().Be(cosmetologist.Id);
    }

    [Fact]
    public async Task HasConflictAsync_OverlappingAppointment_ReturnsTrue()
    {
        using var context = CreateInMemoryContext(nameof(HasConflictAsync_OverlappingAppointment_ReturnsTrue));
        var (customer, cosmetologist, service) = SeedBasicData(context);

        var startTime = new DateTime(2026, 6, 1, 10, 0, 0, DateTimeKind.Utc);
        context.Appointments.Add(new Appointment
        {
            CustomerId = customer.Id,
            ServiceId = service.Id,
            CosmetologistId = cosmetologist.Id,
            StartDateTime = startTime,
            Status = AppointmentStatus.Pending
        });
        await context.SaveChangesAsync();

        var repo = new AppointmentRepository(context);
        // Overlapping: starts 30 min into the existing 60-min appointment
        var hasConflict = await repo.HasConflictAsync(cosmetologist.Id, startTime.AddMinutes(30), 60);

        hasConflict.Should().BeTrue();
    }

    [Fact]
    public async Task HasConflictAsync_NonOverlappingAppointment_ReturnsFalse()
    {
        using var context = CreateInMemoryContext(nameof(HasConflictAsync_NonOverlappingAppointment_ReturnsFalse));
        var (customer, cosmetologist, service) = SeedBasicData(context);

        var startTime = new DateTime(2026, 6, 1, 10, 0, 0, DateTimeKind.Utc);
        context.Appointments.Add(new Appointment
        {
            CustomerId = customer.Id,
            ServiceId = service.Id,
            CosmetologistId = cosmetologist.Id,
            StartDateTime = startTime,
            Status = AppointmentStatus.Pending
        });
        await context.SaveChangesAsync();

        var repo = new AppointmentRepository(context);
        // Non-overlapping: starts after existing 60-min appointment ends
        var hasConflict = await repo.HasConflictAsync(cosmetologist.Id, startTime.AddMinutes(60), 30);

        hasConflict.Should().BeFalse();
    }

    [Fact]
    public async Task HasConflictAsync_CancelledAppointment_DoesNotConflict()
    {
        using var context = CreateInMemoryContext(nameof(HasConflictAsync_CancelledAppointment_DoesNotConflict));
        var (customer, cosmetologist, service) = SeedBasicData(context);

        var startTime = new DateTime(2026, 6, 1, 10, 0, 0, DateTimeKind.Utc);
        context.Appointments.Add(new Appointment
        {
            CustomerId = customer.Id,
            ServiceId = service.Id,
            CosmetologistId = cosmetologist.Id,
            StartDateTime = startTime,
            Status = AppointmentStatus.Cancelled
        });
        await context.SaveChangesAsync();

        var repo = new AppointmentRepository(context);
        var hasConflict = await repo.HasConflictAsync(cosmetologist.Id, startTime, 60);

        hasConflict.Should().BeFalse();
    }

    [Fact]
    public async Task GetByIdAsync_ExistingId_ReturnsAppointmentWithNavigationProps()
    {
        using var context = CreateInMemoryContext(nameof(GetByIdAsync_ExistingId_ReturnsAppointmentWithNavigationProps));
        var (customer, cosmetologist, service) = SeedBasicData(context);

        var appointment = new Appointment
        {
            CustomerId = customer.Id,
            ServiceId = service.Id,
            CosmetologistId = cosmetologist.Id,
            StartDateTime = DateTime.UtcNow.AddDays(1),
            Status = AppointmentStatus.Pending
        };
        context.Appointments.Add(appointment);
        await context.SaveChangesAsync();

        var repo = new AppointmentRepository(context);
        var result = await repo.GetByIdAsync(appointment.Id);

        result.Should().NotBeNull();
        result!.Customer.Should().NotBeNull();
        result.Service.Should().NotBeNull();
    }

    [Fact]
    public async Task GetByIdAsync_NonExistingId_ReturnsNull()
    {
        using var context = CreateInMemoryContext(nameof(GetByIdAsync_NonExistingId_ReturnsNull));
        var repo = new AppointmentRepository(context);

        var result = await repo.GetByIdAsync(999);

        result.Should().BeNull();
    }

    [Fact]
    public async Task UpdateAsync_ChangesStatus()
    {
        using var context = CreateInMemoryContext(nameof(UpdateAsync_ChangesStatus));
        var (customer, cosmetologist, service) = SeedBasicData(context);

        var appointment = new Appointment
        {
            CustomerId = customer.Id,
            ServiceId = service.Id,
            CosmetologistId = cosmetologist.Id,
            StartDateTime = DateTime.UtcNow.AddDays(1),
            Status = AppointmentStatus.Pending
        };
        context.Appointments.Add(appointment);
        await context.SaveChangesAsync();

        var repo = new AppointmentRepository(context);
        appointment.Status = AppointmentStatus.Confirmed;
        await repo.UpdateAsync(appointment);

        var updated = await context.Appointments.FindAsync(appointment.Id);
        updated!.Status.Should().Be(AppointmentStatus.Confirmed);
    }

    [Fact]
    public async Task GetAllAsync_WithDateFilter_ReturnsFilteredResults()
    {
        using var context = CreateInMemoryContext(nameof(GetAllAsync_WithDateFilter_ReturnsFilteredResults));
        var (customer, cosmetologist, service) = SeedBasicData(context);

        var date1 = new DateTime(2026, 6, 1, 10, 0, 0, DateTimeKind.Utc);
        var date2 = new DateTime(2026, 6, 5, 10, 0, 0, DateTimeKind.Utc);

        context.Appointments.AddRange(
            new Appointment { CustomerId = customer.Id, ServiceId = service.Id, CosmetologistId = cosmetologist.Id, StartDateTime = date1, Status = AppointmentStatus.Pending },
            new Appointment { CustomerId = customer.Id, ServiceId = service.Id, CosmetologistId = cosmetologist.Id, StartDateTime = date2, Status = AppointmentStatus.Pending }
        );
        await context.SaveChangesAsync();

        var repo = new AppointmentRepository(context);
        var result = await repo.GetAllAsync(from: date1, to: date1.AddDays(1));

        result.Should().HaveCount(1);
        result.First().StartDateTime.Should().Be(date1);
    }
}
