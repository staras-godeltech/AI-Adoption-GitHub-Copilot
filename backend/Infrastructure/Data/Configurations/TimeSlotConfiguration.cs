using CosmetologyBooking.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CosmetologyBooking.Infrastructure.Data.Configurations;

public class TimeSlotConfiguration : IEntityTypeConfiguration<TimeSlot>
{
    public void Configure(EntityTypeBuilder<TimeSlot> builder)
    {
        builder.HasKey(ts => ts.Id);

        builder.Property(ts => ts.StartDateTime)
            .IsRequired();

        builder.Property(ts => ts.EndDateTime)
            .IsRequired();

        builder.Property(ts => ts.IsAvailable)
            .IsRequired()
            .HasDefaultValue(true);

        // TODO: Enforce no overlapping time slots per cosmetologist via business logic
        builder.HasOne(ts => ts.Cosmetologist)
            .WithMany(u => u.CosmetologistTimeSlots)
            .HasForeignKey(ts => ts.CosmetologistId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
