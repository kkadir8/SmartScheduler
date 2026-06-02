namespace SmartScheduler.API.Services.Interfaces;

public interface IGeneticAlgorithmService
{
    Task<ScheduleResult> GenerateScheduleAsync(WhatIfOptions? options = null);
}
