using CosmetologyBooking.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CosmetologyBooking.Infrastructure.Data.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.HasKey(u => u.Id);

        builder.Property(u => u.Email)
            .IsRequired()
            .HasMaxLength(256);

        builder.HasIndex(u => u.Email)
            .IsUnique();

        builder.Property(u => u.PasswordHash)
            .IsRequired();

        builder.Property(u => u.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(u => u.PhoneNumber)
            .HasMaxLength(50);

        builder.Property(u => u.Role)
            .IsRequired();

        builder.HasMany(u => u.CustomerAppointments)
            .WithOne(a => a.Customer)
            .HasForeignKey(a => a.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(u => u.CosmetologistTimeSlots)
            .WithOne(ts => ts.Cosmetologist)
            .HasForeignKey(ts => ts.CosmetologistId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
