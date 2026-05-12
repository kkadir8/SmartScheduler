using System.ComponentModel.DataAnnotations;

namespace SmartScheduler.API.Models.Auth;

public class LoginRequest
{
    [Required]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}
