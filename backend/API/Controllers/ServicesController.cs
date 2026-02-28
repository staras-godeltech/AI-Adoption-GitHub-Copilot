using CosmetologyBooking.Application.DTOs;
using CosmetologyBooking.Application.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CosmetologyBooking.API.Controllers;

[ApiController]
[Route("api/services")]
public class ServicesController : ControllerBase
{
    private readonly IServiceRepository _serviceRepository;

    public ServicesController(IServiceRepository serviceRepository)
    {
        _serviceRepository = serviceRepository;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var services = await _serviceRepository.GetAllActiveAsync();
        return Ok(services);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var service = await _serviceRepository.GetByIdAsync(id);
        if (service is null || !service.IsActive)
            return NotFound();
        return Ok(service);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Cosmetologist")]
    public async Task<IActionResult> Create([FromBody] CreateServiceDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest(new { message = "Name is required." });
        if (dto.DurationMinutes <= 0)
            return BadRequest(new { message = "Duration must be greater than zero." });
        if (dto.Price < 0)
            return BadRequest(new { message = "Price must be non-negative." });

        var created = await _serviceRepository.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin,Cosmetologist")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateServiceDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest(new { message = "Name is required." });
        if (dto.DurationMinutes <= 0)
            return BadRequest(new { message = "Duration must be greater than zero." });
        if (dto.Price < 0)
            return BadRequest(new { message = "Price must be non-negative." });

        var updated = await _serviceRepository.UpdateAsync(id, dto);
        if (updated is null)
            return NotFound();
        return Ok(updated);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin,Cosmetologist")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _serviceRepository.DeleteAsync(id);
        if (!deleted)
            return NotFound();
        return NoContent();
    }
}
