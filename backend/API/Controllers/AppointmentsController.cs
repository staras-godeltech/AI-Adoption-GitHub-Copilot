using System.Security.Claims;
using CosmetologyBooking.Application.DTOs;
using CosmetologyBooking.Application.Repositories;
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
    private readonly AppDbContext _context;

    public AppointmentsController(IAppointmentRepository appointmentRepository, AppDbContext context)
    {
        _appointmentRepository = appointmentRepository;
        _context = context;
    }

    private int? GetCurrentUserId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");
        return int.TryParse(claim, out var id) ? id : null;
    }

    /// <summary>GET /api/appointments — Admin/Cosmetologist: all appointments with optional filters</summary>
    [HttpGet]
    [Authorize(Roles = "Admin,Cosmetologist")]
    public async Task<IActionResult> GetAll(
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] int? status,
        [FromQuery] int? cosmetologistId)
    {
        var appointments = await _appointmentRepository.GetAllAsync(from, to, status, cosmetologistId);
        return Ok(appointments.Select(ToDto));
    }

    /// <summary>GET /api/appointments/my — Customer: current user's appointments</summary>
    [HttpGet("my")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> GetMy()
    {
        var userId = GetCurrentUserId();
        if (userId is null) return Unauthorized();

        var appointments = await _appointmentRepository.GetByCustomerIdAsync(userId.Value);
        return Ok(appointments.Select(ToDto));
    }

    /// <summary>GET /api/appointments/{id} — All authenticated: single appointment (customers only see their own)</summary>
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var appointment = await _appointmentRepository.GetByIdAsync(id);
        if (appointment is null) return NotFound();

        var userId = GetCurrentUserId();
        if (userId is null) return Unauthorized();

        var isAdminOrCosmetologist = User.IsInRole("Admin") || User.IsInRole("Cosmetologist");
        if (!isAdminOrCosmetologist && appointment.CustomerId != userId.Value)
            return Forbid();

        return Ok(ToDto(appointment));
    }

    /// <summary>POST /api/appointments — Customer: create new booking</summary>
    [HttpPost]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> Create([FromBody] CreateAppointmentDto dto)
    {
        var userId = GetCurrentUserId();
        if (userId is null) return Unauthorized();

        // Basic validation
        if (dto.AppointmentDate <= DateTime.UtcNow)
            return BadRequest(new { message = "Appointment date must be in the future." });

        var hour = dto.AppointmentDate.Hour;
        if (hour < 9 || hour >= 18)
            return BadRequest(new { message = "Appointment must be within business hours (9:00–18:00)." });

        // Validate service exists
        var service = await _context.Services.FindAsync(dto.ServiceId);
        if (service is null)
            return BadRequest(new { message = "Service not found." });

        // Check cosmetologist conflict if specified
        if (dto.CosmetologistId.HasValue)
        {
            var hasConflict = await _appointmentRepository.HasConflictAsync(
                dto.CosmetologistId.Value, dto.AppointmentDate, service.DurationMinutes);

            if (hasConflict)
                return Conflict(new { message = "This time slot is no longer available. Please choose a different time." });
        }

        var appointment = new Appointment
        {
            CustomerId = userId.Value,
            ServiceId = dto.ServiceId,
            CosmetologistId = dto.CosmetologistId,
            StartDateTime = dto.AppointmentDate,
            Notes = dto.Notes,
            Status = AppointmentStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        var created = await _appointmentRepository.AddAsync(appointment);

        // Reload with related entities
        var loaded = await _appointmentRepository.GetByIdAsync(created.Id);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, ToDto(loaded!));
    }

    /// <summary>PUT /api/appointments/{id}/status — Admin/Cosmetologist: update status</summary>
    [HttpPut("{id:int}/status")]
    [Authorize(Roles = "Admin,Cosmetologist")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateAppointmentStatusDto dto)
    {
        var appointment = await _appointmentRepository.GetByIdAsync(id);
        if (appointment is null) return NotFound();

        if (!Enum.TryParse<AppointmentStatus>(dto.Status, ignoreCase: true, out var newStatus))
            return BadRequest(new { message = $"Invalid status: {dto.Status}. Valid values: Pending, Confirmed, Completed, Cancelled." });

        // Validate transition: Pending → Confirmed → Completed; can cancel from Pending/Confirmed
        var valid = (appointment.Status, newStatus) switch
        {
            (AppointmentStatus.Pending, AppointmentStatus.Confirmed) => true,
            (AppointmentStatus.Confirmed, AppointmentStatus.Completed) => true,
            (AppointmentStatus.Pending, AppointmentStatus.Cancelled) => true,
            (AppointmentStatus.Confirmed, AppointmentStatus.Cancelled) => true,
            _ => false
        };

        if (!valid)
            return BadRequest(new { message = $"Cannot transition from {appointment.Status} to {newStatus}." });

        appointment.Status = newStatus;
        await _appointmentRepository.UpdateAsync(appointment);
        return Ok(ToDto(appointment));
    }

    /// <summary>DELETE /api/appointments/{id} — Customer: cancel appointment (only if status is Pending)</summary>
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> Cancel(int id)
    {
        var userId = GetCurrentUserId();
        if (userId is null) return Unauthorized();

        var appointment = await _appointmentRepository.GetByIdAsync(id);
        if (appointment is null) return NotFound();

        if (appointment.CustomerId != userId.Value)
            return Forbid();

        if (appointment.Status != AppointmentStatus.Pending)
            return BadRequest(new { message = "Only pending appointments can be cancelled." });

        appointment.Status = AppointmentStatus.Cancelled;
        await _appointmentRepository.UpdateAsync(appointment);
        return NoContent();
    }

    private static AppointmentDto ToDto(Appointment a) => new()
    {
        Id = a.Id,
        CustomerId = a.CustomerId,
        CustomerName = a.Customer?.Name ?? string.Empty,
        ServiceId = a.ServiceId,
        ServiceName = a.Service?.Name ?? string.Empty,
        CosmetologistId = a.CosmetologistId,
        CosmetologistName = a.Cosmetologist?.Name,
        AppointmentDate = a.StartDateTime,
        Duration = a.Service?.DurationMinutes ?? 0,
        Status = a.Status.ToString(),
        Notes = a.Notes,
        CreatedAt = a.CreatedAt
    };
}

