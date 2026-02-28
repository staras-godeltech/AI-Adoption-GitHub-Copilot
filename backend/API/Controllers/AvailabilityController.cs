using CosmetologyBooking.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CosmetologyBooking.API.Controllers;

[ApiController]
[Route("api/availability")]
[Authorize]
public class AvailabilityController : ControllerBase
{
    private readonly IAvailabilityService _availabilityService;

    public AvailabilityController(IAvailabilityService availabilityService)
    {
        _availabilityService = availabilityService;
    }

    /// <summary>GET /api/availability?date=2024-03-01&amp;serviceId=1&amp;cosmetologistId=2 — available time slots</summary>
    [HttpGet]
    public async Task<IActionResult> GetAvailableSlots(
        [FromQuery] DateTime date,
        [FromQuery] int serviceId,
        [FromQuery] int? cosmetologistId)
    {
        if (date == default)
            return BadRequest(new { message = "Date is required." });

        if (serviceId <= 0)
            return BadRequest(new { message = "ServiceId is required." });

        var slots = await _availabilityService.GetAvailableSlotsAsync(date, serviceId, cosmetologistId);
        return Ok(slots);
    }
}
