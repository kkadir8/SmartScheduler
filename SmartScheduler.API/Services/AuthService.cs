using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SmartScheduler.API.Data;
using SmartScheduler.API.Models;
using SmartScheduler.API.DTOs;
using SmartScheduler.API.Services.Interfaces;

namespace SmartScheduler.API.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _config;

    public AuthService(AppDbContext context, IConfiguration config)
    {
        _context = context;
        _config = config;
    }

    public async Task<AuthResponse?> LoginAsync(LoginRequest request)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return null;

        return GenerateToken(user);
    }

    public async Task<AuthResponse?> RegisterAsync(RegisterRequest request)
    {
        if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            return null;

        var user = new AppUser
        {
            Username = request.Username,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = "User"
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return GenerateToken(user);
    }

    private AuthResponse GenerateToken(AppUser user)
    {
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));

        var expires = DateTime.UtcNow.AddHours(
            int.Parse(_config["Jwt:ExpiresHours"] ?? "24"));

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role)
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: expires,
            signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256)
        );

        return new AuthResponse
        {
            Token = new JwtSecurityTokenHandler().WriteToken(token),
            Username = user.Username,
            Email = user.Email,
            Role = user.Role,
            ExpiresAt = expires
        };
    }
}
