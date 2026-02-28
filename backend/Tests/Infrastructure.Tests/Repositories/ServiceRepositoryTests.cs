using CosmetologyBooking.Application.DTOs;
using CosmetologyBooking.Domain.Entities;
using CosmetologyBooking.Domain.Enums;
using CosmetologyBooking.Infrastructure.Data;
using CosmetologyBooking.Infrastructure.Repositories;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace CosmetologyBooking.Infrastructure.Tests.Repositories;

public class ServiceRepositoryTests
{
    private static AppDbContext CreateInMemoryContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(dbName)
            .Options;
        return new AppDbContext(options);
    }

    [Fact]
    public async Task GetAllActiveAsync_ReturnsOnlyActiveServices()
    {
        using var context = CreateInMemoryContext(nameof(GetAllActiveAsync_ReturnsOnlyActiveServices));
        context.Services.AddRange(
            new Service { Name = "Active Service", Price = 50, DurationMinutes = 30, IsActive = true },
            new Service { Name = "Inactive Service", Price = 40, DurationMinutes = 60, IsActive = false }
        );
        await context.SaveChangesAsync();

        var repo = new ServiceRepository(context);
        var result = await repo.GetAllActiveAsync();

        result.Should().HaveCount(1);
        result.Single().Name.Should().Be("Active Service");
    }

    [Fact]
    public async Task GetAllAsync_ReturnsAllServices_IncludingInactive()
    {
        using var context = CreateInMemoryContext(nameof(GetAllAsync_ReturnsAllServices_IncludingInactive));
        context.Services.AddRange(
            new Service { Name = "Active", Price = 50, DurationMinutes = 30, IsActive = true },
            new Service { Name = "Inactive", Price = 40, DurationMinutes = 60, IsActive = false }
        );
        await context.SaveChangesAsync();

        var repo = new ServiceRepository(context);
        var result = await repo.GetAllAsync();

        result.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetByIdAsync_ExistingService_ReturnsServiceDto()
    {
        using var context = CreateInMemoryContext(nameof(GetByIdAsync_ExistingService_ReturnsServiceDto));
        var service = new Service { Name = "Manicure", Price = 30, DurationMinutes = 45, IsActive = true };
        context.Services.Add(service);
        await context.SaveChangesAsync();

        var repo = new ServiceRepository(context);
        var result = await repo.GetByIdAsync(service.Id);

        result.Should().NotBeNull();
        result!.Name.Should().Be("Manicure");
        result.Price.Should().Be(30);
    }

    [Fact]
    public async Task GetByIdAsync_NonExistingService_ReturnsNull()
    {
        using var context = CreateInMemoryContext(nameof(GetByIdAsync_NonExistingService_ReturnsNull));
        var repo = new ServiceRepository(context);

        var result = await repo.GetByIdAsync(999);

        result.Should().BeNull();
    }

    [Fact]
    public async Task CreateAsync_ValidDto_CreatesAndReturnsService()
    {
        using var context = CreateInMemoryContext(nameof(CreateAsync_ValidDto_CreatesAndReturnsService));
        var repo = new ServiceRepository(context);
        var dto = new CreateServiceDto { Name = "Pedicure", Price = 40, DurationMinutes = 60, Description = "Foot care" };

        var result = await repo.CreateAsync(dto);

        result.Should().NotBeNull();
        result.Id.Should().BeGreaterThan(0);
        result.Name.Should().Be("Pedicure");
        result.IsActive.Should().BeTrue();
        (await context.Services.CountAsync()).Should().Be(1);
    }

    [Fact]
    public async Task UpdateAsync_ExistingService_UpdatesFields()
    {
        using var context = CreateInMemoryContext(nameof(UpdateAsync_ExistingService_UpdatesFields));
        var service = new Service { Name = "Old Name", Price = 10, DurationMinutes = 30, IsActive = true };
        context.Services.Add(service);
        await context.SaveChangesAsync();

        var repo = new ServiceRepository(context);
        var dto = new UpdateServiceDto { Name = "New Name", Price = 20, DurationMinutes = 45, IsActive = false };
        var result = await repo.UpdateAsync(service.Id, dto);

        result.Should().NotBeNull();
        result!.Name.Should().Be("New Name");
        result.Price.Should().Be(20);
        result.IsActive.Should().BeFalse();
    }

    [Fact]
    public async Task UpdateAsync_NonExistingService_ReturnsNull()
    {
        using var context = CreateInMemoryContext(nameof(UpdateAsync_NonExistingService_ReturnsNull));
        var repo = new ServiceRepository(context);
        var dto = new UpdateServiceDto { Name = "X", Price = 1, DurationMinutes = 1, IsActive = true };

        var result = await repo.UpdateAsync(999, dto);

        result.Should().BeNull();
    }

    [Fact]
    public async Task DeleteAsync_ExistingService_SetsIsActiveToFalse()
    {
        using var context = CreateInMemoryContext(nameof(DeleteAsync_ExistingService_SetsIsActiveToFalse));
        var service = new Service { Name = "To Delete", Price = 10, DurationMinutes = 30, IsActive = true };
        context.Services.Add(service);
        await context.SaveChangesAsync();

        var repo = new ServiceRepository(context);
        var deleted = await repo.DeleteAsync(service.Id);

        deleted.Should().BeTrue();
        var updated = await context.Services.FindAsync(service.Id);
        updated!.IsActive.Should().BeFalse();
    }

    [Fact]
    public async Task DeleteAsync_NonExistingService_ReturnsFalse()
    {
        using var context = CreateInMemoryContext(nameof(DeleteAsync_NonExistingService_ReturnsFalse));
        var repo = new ServiceRepository(context);

        var result = await repo.DeleteAsync(999);

        result.Should().BeFalse();
    }
}
