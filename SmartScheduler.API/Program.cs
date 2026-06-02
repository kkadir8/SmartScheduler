using System.Text;
using QuestPDF.Infrastructure;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using SmartScheduler.API.Data;
using SmartScheduler.API.Services;
using SmartScheduler.API.Services.Interfaces;

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.UseUrls("http://0.0.0.0:5000");

// EF Core + PostgreSQL
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// QuestPDF Community Lisansı (ücretsiz, açık kaynak projeler için)
QuestPDF.Settings.License = LicenseType.Community;

// Auth, Algorithm & Export Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IGeneticAlgorithmService, GeneticAlgorithmService>();
builder.Services.AddScoped<IExportService, ExportService>();

// JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"]!;
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Swagger with JWT support
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new()
    {
        Title = "SmartScheduler API",
        Version = "v1",
        Description = "AI Destekli Akıllı Ders Programı Oluşturucu — DevArchitechs"
    });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "JWT token giriniz: Bearer {token}"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

var app = builder.Build();

// Otomatik migration
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "SmartScheduler API v1");
    c.RoutePrefix = string.Empty;
});

app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
