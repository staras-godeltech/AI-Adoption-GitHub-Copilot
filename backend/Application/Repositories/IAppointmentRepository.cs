using CosmetologyBooking.Domain.Entities;

namespace CosmetologyBooking.Application.Repositories;

public interface IAppointmentRepository
{
    Task<IEnumerable<Appointment>> GetAllAsync(DateTime? from = null, DateTime? to = null, int? status = null, int? cosmetologistId = null);
    Task<Appointment?> GetByIdAsync(int id);
    Task<IEnumerable<Appointment>> GetByCustomerIdAsync(int customerId);
    Task<IEnumerable<Appointment>> GetByCosmetologistIdAsync(int cosmetologistId, DateTime? from = null, DateTime? to = null);
    Task<bool> HasConflictAsync(int cosmetologistId, DateTime appointmentDate, int durationMinutes, int? excludeAppointmentId = null);
    Task<Appointment> AddAsync(Appointment appointment);
    Task UpdateAsync(Appointment appointment);
}
