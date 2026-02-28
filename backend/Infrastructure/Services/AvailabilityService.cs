using CosmetologyBooking.Application.DTOs;
using CosmetologyBooking.Application.Repositories;
using CosmetologyBooking.Application.Services;
using CosmetologyBooking.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace CosmetologyBooking.Infrastructure.Services;

public class AvailabilityService : IAvailabilityService
{
    private readonly AppDbContext _context;
    private readonly IAppointmentRepository _appointmentRepository;
    private readonly int _businessStartHour;
    private readonly int _businessEndHour;
    private readonly int _slotIntervalMinutes;

    public AvailabilityService(
        AppDbContext context,
        IAppointmentRepository appointmentRepository,
        IConfiguration configuration)
    {
        _context = context;
        _appointmentRepository = appointmentRepository;
        _businessStartHour = int.TryParse(configuration["BusinessHours:StartHour"], out var start) ? start : 9;
        _businessEndHour = int.TryParse(configuration["BusinessHours:EndHour"], out var end) ? end : 18;
        _slotIntervalMinutes = int.TryParse(configuration["BusinessHours:SlotIntervalMinutes"], out var interval) ? interval : 30;
    }

    public async Task<List<AvailableSlotDto>> GetAvailableSlotsAsync(DateTime date, int serviceId, int? cosmetologistId = null)
    {
        var service = await _context.Services.FindAsync(serviceId);
        if (service is null || !service.IsActive)
            return [];

        // Get all active cosmetologists if none specified
        var cosmetologistIds = new List<int>();
        if (cosmetologistId.HasValue)
        {
            cosmetologistIds.Add(cosmetologistId.Value);
        }
        else
        {
            var cosmetologists = await _context.Users
                .Where(u => u.Role == CosmetologyBooking.Domain.Enums.UserRole.Cosmetologist)
                .Select(u => u.Id)
                .ToListAsync();
            cosmetologistIds.AddRange(cosmetologists);
        }

        if (cosmetologistIds.Count == 0)
            return [];

        var dateOnly = date.Date;
        var slots = new List<AvailableSlotDto>();

        var current = dateOnly.AddHours(_businessStartHour);
        var businessEnd = dateOnly.AddHours(_businessEndHour);
        var now = DateTime.UtcNow;

        while (current.AddMinutes(service.DurationMinutes) <= businessEnd)
        {
            // Skip slots in the past
            if (current <= now)
            {
                current = current.AddMinutes(_slotIntervalMinutes);
                continue;
            }

            // Check if at least one cosmetologist is available for this slot
            bool anyAvailable = false;
            foreach (var cosmoId in cosmetologistIds)
            {
                var hasConflict = await _appointmentRepository.HasConflictAsync(cosmoId, current, service.DurationMinutes);
                if (!hasConflict)
                {
                    anyAvailable = true;
                    break;
                }
            }

            slots.Add(new AvailableSlotDto
            {
                StartTime = current,
                EndTime = current.AddMinutes(service.DurationMinutes),
                Available = anyAvailable
            });

            current = current.AddMinutes(_slotIntervalMinutes);
        }

        return slots;
    }

    public async Task<bool> IsSlotAvailableAsync(int cosmetologistId, DateTime startTime, int durationMinutes)
    {
        // Check business hours
        var startHour = startTime.Hour + startTime.Minute / 60.0;
        var endHour = startTime.Hour + (startTime.Minute + durationMinutes) / 60.0;
        if (startHour < _businessStartHour || endHour > _businessEndHour)
            return false;

        // Check not in the past
        if (startTime <= DateTime.UtcNow)
            return false;

        var hasConflict = await _appointmentRepository.HasConflictAsync(cosmetologistId, startTime, durationMinutes);
        return !hasConflict;
    }
}
