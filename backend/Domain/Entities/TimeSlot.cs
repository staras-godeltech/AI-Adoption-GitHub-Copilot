namespace CosmetologyBooking.Domain.Entities;

public class TimeSlot
{
    public int Id { get; set; }
    public int CosmetologistId { get; set; }
    public DateTime StartDateTime { get; set; }
    public DateTime EndDateTime { get; set; }
    public bool IsAvailable { get; set; } = true;

    public User Cosmetologist { get; set; } = null!;
}
