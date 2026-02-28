using CosmetologyBooking.Application.DTOs;
using CosmetologyBooking.Application.Repositories;
using CosmetologyBooking.Domain.Entities;
using CosmetologyBooking.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CosmetologyBooking.Infrastructure.Repositories;

public class ServiceRepository : IServiceRepository
{
    private readonly AppDbContext _context;

    public ServiceRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ServiceDto>> GetAllActiveAsync()
    {
        return await _context.Services
            .Where(s => s.IsActive)
            .Select(s => ToDto(s))
            .ToListAsync();
    }

    public async Task<IEnumerable<ServiceDto>> GetAllAsync()
    {
        return await _context.Services
            .Select(s => ToDto(s))
            .ToListAsync();
    }

    public async Task<ServiceDto?> GetByIdAsync(int id)
    {
        var service = await _context.Services.FindAsync(id);
        return service is null ? null : ToDto(service);
    }

    public async Task<ServiceDto> CreateAsync(CreateServiceDto dto)
    {
        var service = new Service
        {
            Name = dto.Name,
            Description = dto.Description,
            DurationMinutes = dto.DurationMinutes,
            Price = dto.Price,
            IsActive = true
        };

        _context.Services.Add(service);
        await _context.SaveChangesAsync();
        return ToDto(service);
    }

    public async Task<ServiceDto?> UpdateAsync(int id, UpdateServiceDto dto)
    {
        var service = await _context.Services.FindAsync(id);
        if (service is null) return null;

        service.Name = dto.Name;
        service.Description = dto.Description;
        service.DurationMinutes = dto.DurationMinutes;
        service.Price = dto.Price;
        service.IsActive = dto.IsActive;

        await _context.SaveChangesAsync();
        return ToDto(service);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var service = await _context.Services.FindAsync(id);
        if (service is null) return false;

        service.IsActive = false;
        await _context.SaveChangesAsync();
        return true;
    }

    private static ServiceDto ToDto(Service s) => new()
    {
        Id = s.Id,
        Name = s.Name,
        Description = s.Description,
        DurationMinutes = s.DurationMinutes,
        Price = s.Price,
        IsActive = s.IsActive
    };
}
