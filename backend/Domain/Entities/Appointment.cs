using CosmetologyBooking.Domain.Enums;

namespace CosmetologyBooking.Domain.Entities;

public class Appointment
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public int ServiceId { get; set; }
    public int? CosmetologistId { get; set; }
    public DateTime StartDateTime { get; set; }
    public AppointmentStatus Status { get; set; } = AppointmentStatus.Pending;
    public string? Notes { get; set; }

    public User Customer { get; set; } = null!;
    public Service Service { get; set; } = null!;
    public User? Cosmetologist { get; set; }

    public DateTime EndDateTime => Service != null
        ? StartDateTime.AddMinutes(Service.DurationMinutes)
        : throw new InvalidOperationException("Service navigation property must be loaded to compute EndDateTime.");
}
