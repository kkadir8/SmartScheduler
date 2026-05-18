using SmartScheduler.API.Data;
using SmartScheduler.API.Models.Algorithm;
using Microsoft.EntityFrameworkCore;

namespace SmartScheduler.API.Services;

public class ScheduleResult
{
    public Chromosome Best { get; set; } = new();
    public List<double> FitnessHistory { get; set; } = [];
    public int BestGeneration { get; set; }
    public int TotalGenerations { get; set; }
}

public class GeneticAlgorithmService
{
    private readonly AppDbContext _context;
    private readonly Random _random = new();

    private const int PopulationSize = 50;
    private const int MaxGenerations = 200;
    private const double MutationRate = 0.02;
    private const double CrossoverRate = 0.8;
    private static readonly DayOfWeek[] WorkDays =
        [DayOfWeek.Monday, DayOfWeek.Tuesday, DayOfWeek.Wednesday,
         DayOfWeek.Thursday, DayOfWeek.Friday];

    public GeneticAlgorithmService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ScheduleResult> GenerateScheduleAsync()
    {
        var courses = await _context.Courses.Include(c => c.Instructor).ToListAsync();
        var classrooms = await _context.Classrooms.ToListAsync();

        if (!courses.Any() || !classrooms.Any())
            return new ScheduleResult { Best = new Chromosome() };

        var population = Enumerable.Range(0, PopulationSize)
            .Select(_ => CreateRandomChromosome(courses, classrooms))
            .ToList();

        Chromosome best = population[0];
        var fitnessHistory = new List<double>();
        int bestGeneration = 0;

        for (int gen = 0; gen < MaxGenerations; gen++)
        {
            foreach (var chr in population)
                chr.Fitness = CalculateFitness(chr);

            var currentBest = population.MaxBy(c => c.Fitness)!;
            if (currentBest.Fitness > best.Fitness)
            {
                best = currentBest.Clone();
                bestGeneration = gen + 1;
            }

            fitnessHistory.Add(Math.Round(best.Fitness, 4));

            if (best.Fitness >= 1.0) break;

            var newPopulation = new List<Chromosome> { best.Clone() };
            while (newPopulation.Count < PopulationSize)
            {
                var parent1 = TournamentSelect(population);
                var parent2 = TournamentSelect(population);
                var child = _random.NextDouble() < CrossoverRate
                    ? Crossover(parent1, parent2)
                    : parent1.Clone();
                Mutate(child);
                newPopulation.Add(child);
            }
            population = newPopulation;
        }

        return new ScheduleResult
        {
            Best = best,
            FitnessHistory = fitnessHistory,
            BestGeneration = bestGeneration,
            TotalGenerations = fitnessHistory.Count
        };
    }

    private Chromosome CreateRandomChromosome(
        List<Models.Course> courses,
        List<Models.Classroom> classrooms)
    {
        var genes = courses.Select(course => new Gene(
            courseId: course.Id,
            instructorId: course.InstructorId,
            classroomId: classrooms[_random.Next(classrooms.Count)].Id,
            day: WorkDays[_random.Next(WorkDays.Length)],
            timeSlot: _random.Next(10)
        )).ToList();

        return new Chromosome(genes);
    }

    private double CalculateFitness(Chromosome chromosome)
    {
        int conflicts = 0;
        var genes = chromosome.Genes;

        for (int i = 0; i < genes.Count; i++)
        {
            for (int j = i + 1; j < genes.Count; j++)
            {
                var a = genes[i];
                var b = genes[j];

                if (a.Day != b.Day || a.TimeSlot != b.TimeSlot) continue;

                // Aynı sınıf çakışması
                if (a.ClassroomId == b.ClassroomId) conflicts++;
                // Aynı hoca çakışması
                if (a.InstructorId == b.InstructorId && a.InstructorId != 0) conflicts++;
            }
        }

        return 1.0 / (1.0 + conflicts);
    }

    /// <summary>Tek-nokta crossover operatörü</summary>
    private Chromosome Crossover(Chromosome p1, Chromosome p2)
    {
        if (p1.Genes.Count == 0) return p2.Clone();
        int point = _random.Next(1, p1.Genes.Count);
        var childGenes = p1.Genes.Take(point)
            .Concat(p2.Genes.Skip(point))
            .Select(g => g.Clone())
            .ToList();
        return new Chromosome(childGenes);
    }

    /// <summary>Rastgele gen mutasyon operatörü</summary>
    private void Mutate(Chromosome chromosome)
    {
        foreach (var gene in chromosome.Genes)
        {
            if (_random.NextDouble() < MutationRate)
            {
                gene.Day = WorkDays[_random.Next(WorkDays.Length)];
                gene.TimeSlot = _random.Next(10);
            }
        }
    }

    private Chromosome TournamentSelect(List<Chromosome> population)
    {
        var a = population[_random.Next(population.Count)];
        var b = population[_random.Next(population.Count)];
        return a.Fitness >= b.Fitness ? a : b;
    }
}
