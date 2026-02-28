using CosmetologyBooking.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CosmetologyBooking.Infrastructure.Data.Configurations;

public class AppointmentConfiguration : IEntityTypeConfiguration<Appointment>
{
    public void Configure(EntityTypeBuilder<Appointment> builder)
    {
        builder.HasKey(a => a.Id);

        builder.Property(a => a.StartDateTime)
            .IsRequired();

        builder.Property(a => a.Status)
            .IsRequired();

        builder.Property(a => a.Notes)
            .HasMaxLength(1000);

        // EndDateTime is computed; ignore it in persistence
        builder.Ignore(a => a.EndDateTime);

        builder.HasOne(a => a.Customer)
            .WithMany(u => u.CustomerAppointments)
            .HasForeignKey(a => a.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.Service)
            .WithMany(s => s.Appointments)
            .HasForeignKey(a => a.ServiceId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.Cosmetologist)
            .WithMany(u => u.CosmetologistAppointments)
            .HasForeignKey(a => a.CosmetologistId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
