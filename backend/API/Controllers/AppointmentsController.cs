using System.Security.Claims;
using System.Text;
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
        [FromQuery] string? status,
        [FromQuery] int? cosmetologistId,
        [FromQuery] int? customerId)
    {
        // Parse comma-separated statuses (e.g., "Pending,Confirmed") or numeric values
        int[]? statuses = null;
        if (!string.IsNullOrWhiteSpace(status))
        {
            var parts = status.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
            var parsed = new List<int>();
            foreach (var part in parts)
            {
                if (int.TryParse(part, out var numericStatus))
                    parsed.Add(numericStatus);
                else if (Enum.TryParse<AppointmentStatus>(part, ignoreCase: true, out var namedStatus))
                    parsed.Add((int)namedStatus);
            }
            if (parsed.Count > 0) statuses = parsed.ToArray();
        }

        var query = _context.Appointments
            .Include(a => a.Customer)
            .Include(a => a.Service)
            .Include(a => a.Cosmetologist)
            .AsQueryable();

        if (from.HasValue) query = query.Where(a => a.StartDateTime >= from.Value);
        if (to.HasValue) query = query.Where(a => a.StartDateTime <= to.Value);
        if (statuses is { Length: > 0 }) query = query.Where(a => statuses.Contains((int)a.Status));
        if (cosmetologistId.HasValue) query = query.Where(a => a.CosmetologistId == cosmetologistId.Value);
        if (customerId.HasValue) query = query.Where(a => a.CustomerId == customerId.Value);

        var appointments = await query.OrderByDescending(a => a.StartDateTime).ToListAsync();
        return Ok(appointments.Select(ToDto));
    }

    /// <summary>GET /api/appointments/statistics — Admin/Cosmetologist: dashboard metrics</summary>
    [HttpGet("statistics")]
    [Authorize(Roles = "Admin,Cosmetologist")]
    public async Task<IActionResult> GetStatistics()
    {
        var today = DateTime.UtcNow.Date;
        var tomorrow = today.AddDays(1);

        var todayTotal = await _context.Appointments
            .CountAsync(a => a.StartDateTime >= today && a.StartDateTime < tomorrow);
        var pendingCount = await _context.Appointments.CountAsync(a => a.Status == AppointmentStatus.Pending);
        var confirmedCount = await _context.Appointments.CountAsync(a => a.Status == AppointmentStatus.Confirmed);
        var completedCount = await _context.Appointments.CountAsync(a => a.Status == AppointmentStatus.Completed);
        var cancelledCount = await _context.Appointments.CountAsync(a => a.Status == AppointmentStatus.Cancelled);

        return Ok(new AppointmentStatisticsDto
        {
            TodayTotal = todayTotal,
            PendingCount = pendingCount,
            ConfirmedCount = confirmedCount,
            CompletedCount = completedCount,
            CancelledCount = cancelledCount
        });
    }

    /// <summary>GET /api/appointments/calendar — Admin/Cosmetologist: appointments for calendar view</summary>
    [HttpGet("calendar")]
    [Authorize(Roles = "Admin,Cosmetologist")]
    public async Task<IActionResult> GetCalendar([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
    {
        var appointments = await _context.Appointments
            .Include(a => a.Customer)
            .Include(a => a.Service)
            .Include(a => a.Cosmetologist)
            .Where(a => (!startDate.HasValue || a.StartDateTime >= startDate.Value)
                     && (!endDate.HasValue || a.StartDateTime <= endDate.Value))
            .OrderBy(a => a.StartDateTime)
            .ToListAsync();

        var result = appointments.Select(a => new CalendarAppointmentDto
        {
            Id = a.Id,
            Title = $"{a.Customer?.Name ?? "Customer"} – {a.Service?.Name ?? "Service"}",
            Start = a.StartDateTime,
            End = a.Service != null ? a.StartDateTime.AddMinutes(a.Service.DurationMinutes) : a.StartDateTime.AddHours(1),
            Status = a.Status.ToString(),
            CustomerName = a.Customer?.Name ?? string.Empty,
            ServiceName = a.Service?.Name ?? string.Empty,
            CosmetologistName = a.Cosmetologist?.Name
        });

        return Ok(result);
    }

    /// <summary>PUT /api/appointments/bulk-status — Admin/Cosmetologist: bulk status update</summary>
    [HttpPut("bulk-status")]
    [Authorize(Roles = "Admin,Cosmetologist")]
    public async Task<IActionResult> BulkUpdateStatus([FromBody] BulkStatusUpdateDto dto)
    {
        if (dto.AppointmentIds is null || dto.AppointmentIds.Length == 0)
            return BadRequest(new { message = "No appointment IDs provided." });

        if (!Enum.TryParse<AppointmentStatus>(dto.NewStatus, ignoreCase: true, out var newStatus))
            return BadRequest(new { message = $"Invalid status: {dto.NewStatus}. Valid values: Pending, Confirmed, Completed, Cancelled." });

        var appointments = await _context.Appointments
            .Where(a => dto.AppointmentIds.Contains(a.Id))
            .ToListAsync();

        if (appointments.Count != dto.AppointmentIds.Length)
            return BadRequest(new { message = "One or more appointment IDs were not found." });

        var invalidTransitions = appointments.Where(a =>
        {
            var valid = (a.Status, newStatus) switch
            {
                (AppointmentStatus.Pending, AppointmentStatus.Confirmed) => true,
                (AppointmentStatus.Confirmed, AppointmentStatus.Completed) => true,
                (AppointmentStatus.Pending, AppointmentStatus.Cancelled) => true,
                (AppointmentStatus.Confirmed, AppointmentStatus.Cancelled) => true,
                _ => false
            };
            return !valid;
        }).ToList();

        if (invalidTransitions.Count > 0)
        {
            var ids = string.Join(", ", invalidTransitions.Select(a => a.Id));
            return BadRequest(new { message = $"Invalid status transition for appointments: {ids}." });
        }

        foreach (var appointment in appointments)
            appointment.Status = newStatus;

        await _context.SaveChangesAsync();
        return Ok(new { updated = appointments.Count });
    }

    /// <summary>GET /api/appointments/export — Admin/Cosmetologist: export appointments as CSV</summary>
    [HttpGet("export")]
    [Authorize(Roles = "Admin,Cosmetologist")]
    public async Task<IActionResult> Export(
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        [FromQuery] string format = "csv")
    {
        var query = _context.Appointments
            .Include(a => a.Customer)
            .Include(a => a.Service)
            .Include(a => a.Cosmetologist)
            .AsQueryable();

        if (startDate.HasValue) query = query.Where(a => a.StartDateTime >= startDate.Value);
        if (endDate.HasValue) query = query.Where(a => a.StartDateTime <= endDate.Value);

        var appointments = await query.OrderBy(a => a.StartDateTime).ToListAsync();

        var csv = new StringBuilder();
        csv.AppendLine("Id,Date,Customer,Service,Cosmetologist,Duration (min),Status,Notes,Created At");

        foreach (var a in appointments)
        {
            var cosmetologist = a.Cosmetologist?.Name ?? "";
            var notes = (a.Notes ?? "").Replace("\"", "\"\"").Replace("\r\n", " ").Replace("\n", " ").Replace("\r", " ");
            csv.AppendLine($"{a.Id}," +
                           $"{a.StartDateTime:yyyy-MM-dd HH:mm}," +
                           $"\"{a.Customer?.Name ?? ""}\"," +
                           $"\"{a.Service?.Name ?? ""}\"," +
                           $"\"{cosmetologist}\"," +
                           $"{a.Service?.DurationMinutes ?? 0}," +
                           $"{a.Status}," +
                           $"\"{notes}\"," +
                           $"{a.CreatedAt:yyyy-MM-dd HH:mm}");
        }

        var bytes = Encoding.UTF8.GetBytes(csv.ToString());
        return File(bytes, "text/csv", $"appointments-{DateTime.UtcNow:yyyyMMdd}.csv");
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

