using CosmetologyBooking.Application.DTOs;

namespace CosmetologyBooking.Application.Services;

public interface IAvailabilityService
{
    Task<List<AvailableSlotDto>> GetAvailableSlotsAsync(DateTime date, int serviceId, int? cosmetologistId = null);
    Task<bool> IsTimeSlotAvailableAsync(int cosmetologistId, DateTime startTime, int durationMinutes);
}
