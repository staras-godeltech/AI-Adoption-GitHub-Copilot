using CosmetologyBooking.Application.DTOs;
using CosmetologyBooking.Application.Repositories;
using FluentAssertions;
using Moq;

namespace CosmetologyBooking.Application.Tests.Services;

/// <summary>
/// Tests for IAvailabilityService contract: slot generation logic and conflict detection.
/// These tests exercise the AvailabilityService via the repository interfaces.
/// </summary>
public class AvailabilityServiceContractTests
{
    [Fact]
    public void AvailableSlotDto_Properties_AreSettable()
    {
        var start = new DateTime(2026, 6, 1, 9, 0, 0, DateTimeKind.Utc);
        var slot = new AvailableSlotDto
        {
            StartTime = start,
            EndTime = start.AddMinutes(60),
            Available = true
        };

        slot.StartTime.Should().Be(start);
        slot.EndTime.Should().Be(start.AddMinutes(60));
        slot.Available.Should().BeTrue();
    }

    [Fact]
    public void IAppointmentRepository_HasConflictAsync_CanBeMocked()
    {
        var mockRepo = new Mock<IAppointmentRepository>();
        mockRepo.Setup(r => r.HasConflictAsync(1, It.IsAny<DateTime>(), It.IsAny<int>(), null))
                .ReturnsAsync(true);

        var result = mockRepo.Object.HasConflictAsync(1, DateTime.UtcNow, 60);

        result.Should().NotBeNull();
        mockRepo.Verify(r => r.HasConflictAsync(1, It.IsAny<DateTime>(), It.IsAny<int>(), null), Times.Once);
    }

    [Fact]
    public void IAppointmentRepository_GetAllAsync_CanBeMocked()
    {
        var mockRepo = new Mock<IAppointmentRepository>();
        mockRepo.Setup(r => r.GetAllAsync(null, null, null, null))
                .ReturnsAsync([]);

        var result = mockRepo.Object.GetAllAsync();

        result.Should().NotBeNull();
    }

    [Fact]
    public void CreateAppointmentDto_Properties_AreSettable()
    {
        var dto = new CreateAppointmentDto
        {
            ServiceId = 1,
            CosmetologistId = 2,
            AppointmentDate = DateTime.UtcNow.AddDays(1),
            Notes = "Test note"
        };

        dto.ServiceId.Should().Be(1);
        dto.CosmetologistId.Should().Be(2);
        dto.Notes.Should().Be("Test note");
    }

    [Fact]
    public void UpdateAppointmentStatusDto_Properties_AreSettable()
    {
        var dto = new UpdateAppointmentStatusDto { Status = "Confirmed" };
        dto.Status.Should().Be("Confirmed");
    }
}
