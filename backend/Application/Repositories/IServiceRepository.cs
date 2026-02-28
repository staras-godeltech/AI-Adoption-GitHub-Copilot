using CosmetologyBooking.Application.DTOs;

namespace CosmetologyBooking.Application.Repositories;

public interface IServiceRepository
{
    Task<IEnumerable<ServiceDto>> GetAllActiveAsync();
    Task<IEnumerable<ServiceDto>> GetAllAsync();
    Task<ServiceDto?> GetByIdAsync(int id);
    Task<ServiceDto> CreateAsync(CreateServiceDto dto);
    Task<ServiceDto?> UpdateAsync(int id, UpdateServiceDto dto);
    Task<bool> DeleteAsync(int id);
}
