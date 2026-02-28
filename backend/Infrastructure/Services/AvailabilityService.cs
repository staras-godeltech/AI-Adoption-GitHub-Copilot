using CosmetologyBooking.Application.DTOs;
using CosmetologyBooking.Application.Repositories;
using CosmetologyBooking.Application.Services;
using CosmetologyBooking.Domain.Enums;
using CosmetologyBooking.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace CosmetologyBooking.Infrastructure.Services;

public class AvailabilityService : IAvailabilityService
{
    private readonly IAppointmentRepository _appointmentRepository;
    private readonly AppDbContext _context;
    private readonly int _businessStartHour;
    private readonly int _businessEndHour;
    private readonly int _slotIntervalMinutes;

    public AvailabilityService(IAppointmentRepository appointmentRepository, AppDbContext context, IConfiguration configuration)
    {
        _appointmentRepository = appointmentRepository;
        _context = context;
        var businessHours = configuration.GetSection("BusinessHours");
        _businessStartHour = int.TryParse(businessHours["StartHour"], out var start) ? start : 9;
        _businessEndHour = int.TryParse(businessHours["EndHour"], out var end) ? end : 18;
        _slotIntervalMinutes = int.TryParse(businessHours["SlotIntervalMinutes"], out var interval) ? interval : 30;
    }

    public async Task<List<AvailableSlotDto>> GetAvailableSlotsAsync(DateTime date, int serviceId, int? cosmetologistId = null)
    {
        var service = await _context.Services.FindAsync(serviceId);
        if (service is null)
            return [];

        // Get all cosmetologists if none specified
        List<int> cosmetologistIds;
        if (cosmetologistId.HasValue)
        {
            cosmetologistIds = [cosmetologistId.Value];
        }
        else
        {
            cosmetologistIds = await _context.Users
                .Where(u => u.Role == UserRole.Cosmetologist)
                .Select(u => u.Id)
                .ToListAsync();
        }

        var slots = new List<AvailableSlotDto>();
        var dayStart = date.Date.AddHours(_businessStartHour);
        var dayEnd = date.Date.AddHours(_businessEndHour);

        var current = dayStart;
        while (current.AddMinutes(service.DurationMinutes) <= dayEnd)
        {
            // Check if any cosmetologist is available for this slot
            var available = false;
            foreach (var cosId in cosmetologistIds)
            {
                var hasConflict = await _appointmentRepository.HasConflictAsync(cosId, current, service.DurationMinutes);
                if (!hasConflict)
                {
                    available = true;
                    break;
                }
            }

            slots.Add(new AvailableSlotDto
            {
                StartTime = current,
                EndTime = current.AddMinutes(service.DurationMinutes),
                Available = available
            });

            current = current.AddMinutes(_slotIntervalMinutes);
        }

        return slots;
    }

    public async Task<bool> IsTimeSlotAvailableAsync(int cosmetologistId, DateTime startTime, int durationMinutes)
    {
        return !await _appointmentRepository.HasConflictAsync(cosmetologistId, startTime, durationMinutes);
    }
}
