using CosmetologyBooking.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace CosmetologyBooking.API.Controllers;

[ApiController]
[Route("api/availability")]
public class AvailabilityController : ControllerBase
{
    private readonly IAvailabilityService _availabilityService;

    public AvailabilityController(IAvailabilityService availabilityService)
    {
        _availabilityService = availabilityService;
    }

    /// <summary>GET /api/availability?date=2024-03-01&amp;serviceId=1&amp;cosmetologistId=2</summary>
    [HttpGet]
    public async Task<IActionResult> GetAvailableSlots(
        [FromQuery] DateTime date,
        [FromQuery] int serviceId,
        [FromQuery] int? cosmetologistId = null)
    {
        if (date == default)
            return BadRequest(new { message = "A valid date is required." });
        if (serviceId <= 0)
            return BadRequest(new { message = "A valid serviceId is required." });

        var slots = await _availabilityService.GetAvailableSlotsAsync(date, serviceId, cosmetologistId);
        return Ok(slots);
    }
}
