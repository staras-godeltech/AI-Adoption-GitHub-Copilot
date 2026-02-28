using System.Security.Claims;
using CosmetologyBooking.Application.DTOs;
using CosmetologyBooking.Application.Repositories;
using CosmetologyBooking.Application.Services;
using CosmetologyBooking.Domain.Entities;
using CosmetologyBooking.Domain.Enums;
using CosmetologyBooking.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CosmetologyBooking.API.Controllers;

[ApiController]
[Route("api/appointments")]
[Authorize]
public class AppointmentsController : ControllerBase
{
    private readonly IAppointmentRepository _appointmentRepository;
    private readonly IAvailabilityService _availabilityService;
    private readonly AppDbContext _context;

    public AppointmentsController(
        IAppointmentRepository appointmentRepository,
        IAvailabilityService availabilityService,
        AppDbContext context)
    {
        _appointmentRepository = appointmentRepository;
        _availabilityService = availabilityService;
        _context = context;
    }

    /// <summary>GET /api/appointments — Admin/Cosmetologist only, with optional filters</summary>
    [HttpGet]
    [Authorize(Roles = "Admin,Cosmetologist")]
    public async Task<IActionResult> GetAll(
        [FromQuery] DateTime? from = null,
        [FromQuery] DateTime? to = null,
        [FromQuery] string? status = null,
        [FromQuery] int? cosmetologistId = null)
    {
        AppointmentStatus? statusEnum = null;
        if (!string.IsNullOrEmpty(status) && Enum.TryParse<AppointmentStatus>(status, true, out var parsed))
            statusEnum = parsed;

        var appointments = await _appointmentRepository.GetAllAsync(from, to, statusEnum, cosmetologistId);
        return Ok(appointments.Select(ToDto));
    }

    /// <summary>GET /api/appointments/my — Customer's own appointments</summary>
    [HttpGet("my")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> GetMy()
    {
        var userId = GetCurrentUserId();
        if (userId is null) return Unauthorized();

        var appointments = await _appointmentRepository.GetByCustomerIdAsync(userId.Value);
        return Ok(appointments.Select(ToDto));
    }

    /// <summary>GET /api/appointments/{id} — All authenticated; customers only see their own</summary>
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var appointment = await _appointmentRepository.GetByIdAsync(id);
        if (appointment is null) return NotFound();

        var userId = GetCurrentUserId();
        var isAdminOrCosmetologist = User.IsInRole("Admin") || User.IsInRole("Cosmetologist");
        if (!isAdminOrCosmetologist && appointment.CustomerId != userId)
            return Forbid();

        return Ok(ToDto(appointment));
    }

    /// <summary>POST /api/appointments — Customer creates a new booking</summary>
    [HttpPost]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> Create([FromBody] CreateAppointmentDto dto)
    {
        var userId = GetCurrentUserId();
        if (userId is null) return Unauthorized();

        // Validate service exists
        var service = await _context.Services.FindAsync(dto.ServiceId);
        if (service is null || !service.IsActive)
            return BadRequest(new { message = "Service not found or not available." });

        // Validate cosmetologist if specified
        if (dto.CosmetologistId.HasValue)
        {
            var cosmetologist = await _context.Users.FindAsync(dto.CosmetologistId.Value);
            if (cosmetologist is null || cosmetologist.Role != UserRole.Cosmetologist)
                return BadRequest(new { message = "Invalid cosmetologist." });

            // Check for conflict
            var hasConflict = await _appointmentRepository.HasConflictAsync(
                dto.CosmetologistId.Value, dto.StartDateTime, service.DurationMinutes);
            if (hasConflict)
                return Conflict(new { message = "This time slot is no longer available. Please choose another time." });

            // Validate slot availability (business hours, not in past)
            var isAvailable = await _availabilityService.IsSlotAvailableAsync(
                dto.CosmetologistId.Value, dto.StartDateTime, service.DurationMinutes);
            if (!isAvailable)
                return BadRequest(new { message = "The selected time is not within business hours or is in the past." });
        }
        else
        {
            // Auto-assign: check that StartDateTime is not in the past
            if (dto.StartDateTime <= DateTime.UtcNow)
                return BadRequest(new { message = "Appointment date must be in the future." });
        }

        var appointment = new Appointment
        {
            CustomerId = userId.Value,
            ServiceId = dto.ServiceId,
            CosmetologistId = dto.CosmetologistId,
            StartDateTime = dto.StartDateTime,
            Notes = dto.Notes,
            Status = AppointmentStatus.Pending
        };

        var created = await _appointmentRepository.AddAsync(appointment);

        // Reload with navigation properties
        var full = await _appointmentRepository.GetByIdAsync(created.Id);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, ToDto(full!));
    }

    /// <summary>PUT /api/appointments/{id}/status — Admin/Cosmetologist updates status</summary>
    [HttpPut("{id:int}/status")]
    [Authorize(Roles = "Admin,Cosmetologist")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateAppointmentStatusDto dto)
    {
        var appointment = await _appointmentRepository.GetByIdAsync(id);
        if (appointment is null) return NotFound();

        if (!Enum.TryParse<AppointmentStatus>(dto.Status, true, out var newStatus))
            return BadRequest(new { message = $"Invalid status value: {dto.Status}" });

        // Validate status transitions
        var validTransitions = new Dictionary<AppointmentStatus, HashSet<AppointmentStatus>>
        {
            [AppointmentStatus.Pending] = [AppointmentStatus.Confirmed, AppointmentStatus.Cancelled],
            [AppointmentStatus.Confirmed] = [AppointmentStatus.Completed, AppointmentStatus.Cancelled],
            [AppointmentStatus.Completed] = [],
            [AppointmentStatus.Cancelled] = []
        };

        if (!validTransitions[appointment.Status].Contains(newStatus))
            return BadRequest(new { message = $"Cannot transition from {appointment.Status} to {newStatus}." });

        appointment.Status = newStatus;
        await _appointmentRepository.UpdateAsync(appointment);

        var full = await _appointmentRepository.GetByIdAsync(id);
        return Ok(ToDto(full!));
    }

    /// <summary>DELETE /api/appointments/{id} — Customer cancels their pending appointment</summary>
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> Cancel(int id)
    {
        var userId = GetCurrentUserId();
        var appointment = await _appointmentRepository.GetByIdAsync(id);
        if (appointment is null) return NotFound();

        if (appointment.CustomerId != userId)
            return Forbid();

        if (appointment.Status != AppointmentStatus.Pending)
            return BadRequest(new { message = "Only pending appointments can be cancelled." });

        appointment.Status = AppointmentStatus.Cancelled;
        await _appointmentRepository.UpdateAsync(appointment);
        return NoContent();
    }

    private int? GetCurrentUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)
                 ?? User.FindFirst("sub")
                 ?? User.FindFirst("nameid");
        if (claim is null || !int.TryParse(claim.Value, out var id))
            return null;
        return id;
    }

    private static AppointmentDto ToDto(Appointment a) => new()
    {
        Id = a.Id,
        CustomerId = a.CustomerId,
        CustomerName = a.Customer?.Name ?? string.Empty,
        ServiceId = a.ServiceId,
        ServiceName = a.Service?.Name ?? string.Empty,
        ServicePrice = a.Service?.Price ?? 0,
        CosmetologistId = a.CosmetologistId,
        CosmetologistName = a.Cosmetologist?.Name,
        StartDateTime = a.StartDateTime,
        EndDateTime = a.Service != null ? a.StartDateTime.AddMinutes(a.Service.DurationMinutes) : a.StartDateTime,
        DurationMinutes = a.Service?.DurationMinutes ?? 0,
        Status = a.Status.ToString(),
        Notes = a.Notes
    };
}
