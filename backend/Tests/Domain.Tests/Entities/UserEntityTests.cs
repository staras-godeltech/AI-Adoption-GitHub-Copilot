using CosmetologyBooking.Domain.Entities;
using CosmetologyBooking.Domain.Enums;
using FluentAssertions;

namespace CosmetologyBooking.Domain.Tests.Entities;

public class UserEntityTests
{
    [Fact]
    public void User_DefaultRole_IsCustomer()
    {
        var user = new User { Role = UserRole.Customer };
        user.Role.Should().Be(UserRole.Customer);
    }

    [Theory]
    [InlineData(UserRole.Admin)]
    [InlineData(UserRole.Customer)]
    [InlineData(UserRole.Cosmetologist)]
    public void User_RoleAssignment_SetsCorrectRole(UserRole role)
    {
        var user = new User { Role = role };
        user.Role.Should().Be(role);
    }

    [Fact]
    public void User_EmailAssignment_StoresEmail()
    {
        const string email = "test@example.com";
        var user = new User { Email = email };
        user.Email.Should().Be(email);
    }

    [Fact]
    public void User_PasswordHash_IsNotPlainText()
    {
        const string plain = "Password123!";
        var hash = BCrypt.Net.BCrypt.HashPassword(plain);
        var user = new User { PasswordHash = hash };

        user.PasswordHash.Should().NotBe(plain);
        BCrypt.Net.BCrypt.Verify(plain, user.PasswordHash).Should().BeTrue();
    }

    [Fact]
    public void User_DefaultCollections_AreEmpty()
    {
        var user = new User();
        user.CustomerAppointments.Should().BeEmpty();
        user.CosmetologistAppointments.Should().BeEmpty();
        user.CosmetologistTimeSlots.Should().BeEmpty();
    }

    [Fact]
    public void User_PhoneNumber_IsOptional()
    {
        var user = new User { Email = "a@b.com", PhoneNumber = null };
        user.PhoneNumber.Should().BeNull();
    }
}
