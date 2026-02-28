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

    [HttpGet]
    [Authorize(Roles = "Admin,Cosmetologist,Customer")]
    public async Task<IActionResult> GetByRole([FromQuery] string? role = null)
    {
        var query = _context.Users.AsQueryable();

        if (!string.IsNullOrEmpty(role) && Enum.TryParse<CosmetologyBooking.Domain.Enums.UserRole>(role, out var parsedRole))
            query = query.Where(u => u.Role == parsedRole);

        var users = await query
            .Select(u => new { u.Id, u.Name, Role = u.Role.ToString() })
            .ToListAsync();

        return Ok(users);
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
}
