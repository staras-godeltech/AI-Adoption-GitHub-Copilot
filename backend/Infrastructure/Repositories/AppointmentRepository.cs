using CosmetologyBooking.Application.Repositories;
using CosmetologyBooking.Domain.Entities;
using CosmetologyBooking.Domain.Enums;
using CosmetologyBooking.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CosmetologyBooking.Infrastructure.Repositories;

public class AppointmentRepository : IAppointmentRepository
{
    private readonly AppDbContext _context;

    public AppointmentRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Appointment>> GetAllAsync(
        DateTime? from = null,
        DateTime? to = null,
        AppointmentStatus? status = null,
        int? cosmetologistId = null)
    {
        var query = _context.Appointments
            .Include(a => a.Customer)
            .Include(a => a.Service)
            .Include(a => a.Cosmetologist)
            .AsQueryable();

        if (from.HasValue)
            query = query.Where(a => a.StartDateTime >= from.Value);
        if (to.HasValue)
            query = query.Where(a => a.StartDateTime <= to.Value);
        if (status.HasValue)
            query = query.Where(a => a.Status == status.Value);
        if (cosmetologistId.HasValue)
            query = query.Where(a => a.CosmetologistId == cosmetologistId.Value);

        return await query.OrderBy(a => a.StartDateTime).ToListAsync();
    }

    public async Task<Appointment?> GetByIdAsync(int id)
    {
        return await _context.Appointments
            .Include(a => a.Customer)
            .Include(a => a.Service)
            .Include(a => a.Cosmetologist)
            .FirstOrDefaultAsync(a => a.Id == id);
    }

    public async Task<IEnumerable<Appointment>> GetByCustomerIdAsync(int customerId)
    {
        return await _context.Appointments
            .Include(a => a.Customer)
            .Include(a => a.Service)
            .Include(a => a.Cosmetologist)
            .Where(a => a.CustomerId == customerId)
            .OrderBy(a => a.StartDateTime)
            .ToListAsync();
    }

    public async Task<IEnumerable<Appointment>> GetByCosmetologistIdAsync(int cosmetologistId)
    {
        return await _context.Appointments
            .Include(a => a.Customer)
            .Include(a => a.Service)
            .Include(a => a.Cosmetologist)
            .Where(a => a.CosmetologistId == cosmetologistId)
            .OrderBy(a => a.StartDateTime)
            .ToListAsync();
    }

    public async Task<bool> HasConflictAsync(int cosmetologistId, DateTime startDateTime, int durationMinutes, int? excludeAppointmentId = null)
    {
        var endDateTime = startDateTime.AddMinutes(durationMinutes);

        var query = _context.Appointments
            .Include(a => a.Service)
            .Where(a => a.CosmetologistId == cosmetologistId
                && a.Status != AppointmentStatus.Cancelled
                && a.StartDateTime < endDateTime
                && a.StartDateTime.AddMinutes(a.Service.DurationMinutes) > startDateTime);

        if (excludeAppointmentId.HasValue)
            query = query.Where(a => a.Id != excludeAppointmentId.Value);

        return await query.AnyAsync();
    }

    public async Task<Appointment> AddAsync(Appointment appointment)
    {
        _context.Appointments.Add(appointment);
        await _context.SaveChangesAsync();
        return appointment;
    }

    public async Task UpdateAsync(Appointment appointment)
    {
        _context.Appointments.Update(appointment);
        await _context.SaveChangesAsync();
    }
}
