using CosmetologyBooking.Domain.Entities;
using CosmetologyBooking.Domain.Enums;
using FluentAssertions;

namespace CosmetologyBooking.Domain.Tests.Entities;

public class AppointmentEntityTests
{
    [Fact]
    public void Appointment_DefaultStatus_IsPending()
    {
        var appointment = new Appointment();
        appointment.Status.Should().Be(AppointmentStatus.Pending);
    }

    [Fact]
    public void Appointment_StatusTransition_PendingToConfirmed()
    {
        var appointment = new Appointment { Status = AppointmentStatus.Pending };
        appointment.Status = AppointmentStatus.Confirmed;
        appointment.Status.Should().Be(AppointmentStatus.Confirmed);
    }

    [Fact]
    public void Appointment_StatusTransition_ConfirmedToCompleted()
    {
        var appointment = new Appointment { Status = AppointmentStatus.Confirmed };
        appointment.Status = AppointmentStatus.Completed;
        appointment.Status.Should().Be(AppointmentStatus.Completed);
    }

    [Fact]
    public void Appointment_StatusTransition_PendingToCancelled()
    {
        var appointment = new Appointment { Status = AppointmentStatus.Pending };
        appointment.Status = AppointmentStatus.Cancelled;
        appointment.Status.Should().Be(AppointmentStatus.Cancelled);
    }

    [Fact]
    public void Appointment_StatusTransition_ConfirmedToCancelled()
    {
        var appointment = new Appointment { Status = AppointmentStatus.Confirmed };
        appointment.Status = AppointmentStatus.Cancelled;
        appointment.Status.Should().Be(AppointmentStatus.Cancelled);
    }

    [Fact]
    public void Appointment_CreatedAt_DefaultsToUtcNow()
    {
        var before = DateTime.UtcNow.AddSeconds(-1);
        var appointment = new Appointment();
        var after = DateTime.UtcNow.AddSeconds(1);

        appointment.CreatedAt.Should().BeAfter(before).And.BeBefore(after);
    }

    [Fact]
    public void Appointment_EndDateTime_ThrowsWhenServiceNotLoaded()
    {
        var appointment = new Appointment { StartDateTime = DateTime.UtcNow };
        var act = () => _ = appointment.EndDateTime;
        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*Service navigation property must be loaded*");
    }

    [Fact]
    public void Appointment_EndDateTime_ReturnsStartPlusDuration()
    {
        var start = new DateTime(2026, 6, 1, 10, 0, 0, DateTimeKind.Utc);
        var service = new Service { DurationMinutes = 60 };
        var appointment = new Appointment
        {
            StartDateTime = start,
            Service = service
        };

        appointment.EndDateTime.Should().Be(start.AddMinutes(60));
    }

    [Fact]
    public void Appointment_NotesIsOptional_CanBeNull()
    {
        var appointment = new Appointment { Notes = null };
        appointment.Notes.Should().BeNull();
    }

    [Fact]
    public void Appointment_CosmetologistIdIsOptional_CanBeNull()
    {
        var appointment = new Appointment { CosmetologistId = null };
        appointment.CosmetologistId.Should().BeNull();
    }
}
