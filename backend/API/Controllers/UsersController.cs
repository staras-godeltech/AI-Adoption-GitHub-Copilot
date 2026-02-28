using System.Security.Claims;
using CosmetologyBooking.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CosmetologyBooking.API.Controllers;

[ApiController]
[Route("api/users")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _context;

    public UsersController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");

        if (userIdClaim is null || !int.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        var user = await _context.Users
            .Where(u => u.Id == userId)
            .Select(u => new
            {
                u.Id,
                u.Email,
                u.Name,
                u.PhoneNumber,
                Role = u.Role.ToString()
            })
            .SingleOrDefaultAsync();

        if (user is null)
            return NotFound();

        return Ok(user);
    }

    [HttpGet("cosmetologists")]
    [AllowAnonymous]
    public async Task<IActionResult> GetCosmetologists()
    {
        var cosmetologists = await _context.Users
            .Where(u => u.Role == Domain.Enums.UserRole.Cosmetologist)
            .Select(u => new
            {
                u.Id,
                u.Name,
                u.Email
            })
            .ToListAsync();

        return Ok(cosmetologists);
    }
}
