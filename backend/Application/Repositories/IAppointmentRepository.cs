using CosmetologyBooking.Domain.Entities;
using CosmetologyBooking.Domain.Enums;

namespace CosmetologyBooking.Application.Repositories;

public interface IAppointmentRepository
{
    Task<IEnumerable<Appointment>> GetAllAsync(DateTime? from = null, DateTime? to = null, AppointmentStatus? status = null, int? cosmetologistId = null);
    Task<Appointment?> GetByIdAsync(int id);
    Task<IEnumerable<Appointment>> GetByCustomerIdAsync(int customerId);
    Task<IEnumerable<Appointment>> GetByCosmetologistIdAsync(int cosmetologistId);
    Task<bool> HasConflictAsync(int cosmetologistId, DateTime startDateTime, int durationMinutes, int? excludeAppointmentId = null);
    Task<Appointment> AddAsync(Appointment appointment);
    Task UpdateAsync(Appointment appointment);
}
