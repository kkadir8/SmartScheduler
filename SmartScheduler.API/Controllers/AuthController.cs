using Microsoft.AspNetCore.Mvc;
using SmartScheduler.API.Models.Auth;
using SmartScheduler.API.Services;

namespace SmartScheduler.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;

    public AuthController(AuthService authService)
    {
        _authService = authService;
    }

    /// <summary>Kullanıcı girişi</summary>
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var result = await _authService.LoginAsync(request);
        if (result == null)
            return Unauthorized(new { message = "E-posta veya şifre hatalı." });

        return Ok(result);
    }

    /// <summary>Yeni kullanıcı kaydı</summary>
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var result = await _authService.RegisterAsync(request);
        if (result == null)
            return BadRequest(new { message = "Bu e-posta adresi zaten kullanımda." });

        return Ok(result);
    }
}
