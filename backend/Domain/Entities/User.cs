using CosmetologyBooking.Domain.Enums;

namespace CosmetologyBooking.Domain.Entities;

public class User
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }

    public ICollection<Appointment> CustomerAppointments { get; set; } = new List<Appointment>();
    public ICollection<Appointment> CosmetologistAppointments { get; set; } = new List<Appointment>();
    public ICollection<TimeSlot> CosmetologistTimeSlots { get; set; } = new List<TimeSlot>();
}
