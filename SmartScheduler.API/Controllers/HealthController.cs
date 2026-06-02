using Microsoft.AspNetCore.Mvc;

namespace SmartScheduler.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new
        {
            status = "OK",
            project = "SmartScheduler",
            team = "DevArchitechs",
            version = "1.0.0",
            timestamp = DateTime.UtcNow
        });
    }
}
