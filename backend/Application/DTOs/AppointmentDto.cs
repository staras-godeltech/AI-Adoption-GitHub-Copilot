namespace CosmetologyBooking.Application.DTOs;

public class AppointmentDto
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public int ServiceId { get; set; }
    public string ServiceName { get; set; } = string.Empty;
    public int? CosmetologistId { get; set; }
    public string? CosmetologistName { get; set; }
    public DateTime AppointmentDate { get; set; }
    public int Duration { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateAppointmentDto
{
    public int ServiceId { get; set; }
    public int? CosmetologistId { get; set; }
    public DateTime AppointmentDate { get; set; }
    public string? Notes { get; set; }
}

public class UpdateAppointmentStatusDto
{
    public string Status { get; set; } = string.Empty;
}

public class AvailableSlotDto
{
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public bool Available { get; set; }
}
