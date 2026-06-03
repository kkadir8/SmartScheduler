namespace SmartScheduler.API.Services.Interfaces;

public interface IGeneticAlgorithmService
{
    Task<ScheduleResult> GenerateScheduleAsync(string? department = null, WhatIfOptions? options = null);
}
