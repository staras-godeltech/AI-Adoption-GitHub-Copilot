using CosmetologyBooking.Domain.Entities;
using FluentAssertions;

namespace CosmetologyBooking.Domain.Tests.Entities;

public class ServiceEntityTests
{
    [Fact]
    public void Service_DefaultIsActive_IsTrue()
    {
        var service = new Service();
        service.IsActive.Should().BeTrue();
    }

    [Fact]
    public void Service_IsActive_CanBeToggled()
    {
        var service = new Service { IsActive = true };
        service.IsActive = false;
        service.IsActive.Should().BeFalse();
    }

    [Fact]
    public void Service_PriceAssignment_StoresCorrectValue()
    {
        var service = new Service { Price = 49.99m };
        service.Price.Should().Be(49.99m);
    }

    [Fact]
    public void Service_DurationMinutesAssignment_StoresCorrectValue()
    {
        var service = new Service { DurationMinutes = 60 };
        service.DurationMinutes.Should().Be(60);
    }

    [Fact]
    public void Service_NameAssignment_StoresCorrectValue()
    {
        var service = new Service { Name = "Facial Treatment" };
        service.Name.Should().Be("Facial Treatment");
    }

    [Fact]
    public void Service_DefaultAppointments_IsEmpty()
    {
        var service = new Service();
        service.Appointments.Should().BeEmpty();
    }

    [Fact]
    public void Service_DescriptionIsOptional_CanBeNull()
    {
        var service = new Service { Description = null };
        service.Description.Should().BeNull();
    }
}
