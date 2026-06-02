using SmartScheduler.API.Data;
using SmartScheduler.API.Models.Algorithm;
using SmartScheduler.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics;

namespace SmartScheduler.API.Services;

public class ScheduleResult
{
    public Chromosome Best { get; set; } = new();
    public List<double> FitnessHistory { get; set; } = [];
    public int BestGeneration { get; set; }
    public int TotalGenerations { get; set; }
    public long ElapsedMs { get; set; }
    public bool StoppedEarly { get; set; }
}

/// <summary>Tek bir dersi belirli bir güne ve saate sabitlemek için kullanılır (What-if).</summary>
public class LockedAssignment
{
    public int CourseId { get; set; }
    public int DayOfWeek { get; set; }  // 0=Pazartesi..4=Cuma
    public int StartHour { get; set; }  // 8..17
}

/// <summary>What-if analizi senaryo girdileri. Boş ise normal çalışır.</summary>
public class WhatIfOptions
{
    /// <summary>Kapalı günler (0=Pazartesi..4=Cuma). Bu günlere ders atanmaz.</summary>
    public List<int> ExcludedDays { get; set; } = [];

    /// <summary>Belirli derslerin sabitlendiği gün/saat atamaları.</summary>
    public List<LockedAssignment> LockedAssignments { get; set; } = [];
}

public class GeneticAlgorithmService : IGeneticAlgorithmService
{
    private readonly AppDbContext _context;
    private readonly Random _random = new();

    private const int PopulationSize = 50;
    private const int MaxGenerations = 200;
    private const double MutationRate = 0.02;
    private const double MaxMutationRate = 0.20;
    private const double CrossoverRate = 0.8;
    private const int StagnationLimit = 40;   // bu kadar nesil iyileşme olmazsa erken dur

    private static readonly DayOfWeek[] WorkDays =
        [DayOfWeek.Monday, DayOfWeek.Tuesday, DayOfWeek.Wednesday,
         DayOfWeek.Thursday, DayOfWeek.Friday];

    // Her run başında doldurulur, tüm private metodlar paylaşır
    private Dictionary<int, List<int>> _constraintMap = [];
    private Dictionary<int, int> _classroomCapacities = [];
    private Dictionary<int, int> _courseSizes = [];
    // instructorId → HashSet<(dayIdx 0..4, hour 8..17)> — boş set = tüm saatler müsait
    private Dictionary<int, HashSet<(int dayIdx, int hour)>> _instructorAvailability = [];

    // What-if durumu (her run başında ayarlanır)
    private DayOfWeek[] _allowedDays = WorkDays;
    private Dictionary<int, (DayOfWeek Day, int TimeSlot)> _lockedGenes = [];

    public GeneticAlgorithmService(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>Genetik algoritma ile optimum ders programı üret. options=null ise normal çalışır.</summary>
    public async Task<ScheduleResult> GenerateScheduleAsync(WhatIfOptions? options = null)
    {
        var sw = Stopwatch.StartNew();

        var courses = await _context.Courses.Include(c => c.Instructor).ToListAsync();
        var classrooms = await _context.Classrooms.ToListAsync();

        // Constraint lookup: courseId → izin verilen classroomId listesi
        _constraintMap = (await _context.Constraints.ToListAsync())
            .GroupBy(c => c.CourseId)
            .ToDictionary(g => g.Key, g => g.Select(c => c.ClassroomId).ToList());

        _classroomCapacities = classrooms.ToDictionary(c => c.Id, c => c.Capacity);
        _courseSizes = courses.ToDictionary(c => c.Id, c => c.StudentCount);

        // Instructor availability: sadece kayıt olan hocalar için filtre uygulanır
        // (kaydı olmayan hoca = tüm saatler müsait varsayılır)
        _instructorAvailability = (await _context.InstructorAvailabilities.ToListAsync())
            .GroupBy(a => a.InstructorId)
            .ToDictionary(
                g => g.Key,
                g => g.Select(a => (a.DayOfWeek, a.Hour)).ToHashSet()
            );

        // What-if seçeneklerini uygula
        ApplyWhatIfOptions(options);

        if (!courses.Any() || !classrooms.Any() || _allowedDays.Length == 0)
        {
            sw.Stop();
            return new ScheduleResult { Best = new Chromosome(), ElapsedMs = sw.ElapsedMilliseconds };
        }

        var population = Enumerable.Range(0, PopulationSize)
            .Select(_ => CreateRandomChromosome(courses, classrooms))
            .ToList();

        Chromosome best = population[0];
        var fitnessHistory = new List<double>();
        int bestGeneration = 0;
        int stagnation = 0;
        bool stoppedEarly = false;

        for (int gen = 0; gen < MaxGenerations; gen++)
        {
            // Fitness değerlendirmesi paralel — popülasyon büyüdükçe belirgin hızlanma
            Parallel.ForEach(population, chr => chr.Fitness = CalculateFitness(chr));

            var currentBest = population.MaxBy(c => c.Fitness)!;
            if (currentBest.Fitness > best.Fitness)
            {
                best = currentBest.Clone();
                bestGeneration = gen + 1;
                stagnation = 0;
            }
            else
            {
                stagnation++;
            }

            fitnessHistory.Add(Math.Round(best.Fitness, 4));

            if (best.Fitness >= 1.0) break;

            // Erken durdurma: uzun süre iyileşme yoksa boşa nesil harcama
            if (stagnation >= StagnationLimit)
            {
                stoppedEarly = true;
                break;
            }

            // Adaptif mutasyon: tıkanma arttıkça çeşitliliği artır (yerel optimumdan kaçış)
            double mutation = Math.Min(MaxMutationRate, MutationRate * (1 + stagnation / 10.0));

            var newPopulation = new List<Chromosome> { best.Clone() };  // elitizm
            while (newPopulation.Count < PopulationSize)
            {
                var parent1 = TournamentSelect(population);
                var parent2 = TournamentSelect(population);
                var child = _random.NextDouble() < CrossoverRate
                    ? Crossover(parent1, parent2)
                    : parent1.Clone();
                Mutate(child, mutation);
                newPopulation.Add(child);
            }
            population = newPopulation;
        }

        sw.Stop();
        return new ScheduleResult
        {
            Best = best,
            FitnessHistory = fitnessHistory,
            BestGeneration = bestGeneration,
            TotalGenerations = fitnessHistory.Count,
            ElapsedMs = sw.ElapsedMilliseconds,
            StoppedEarly = stoppedEarly
        };
    }

    private void ApplyWhatIfOptions(WhatIfOptions? options)
    {
        if (options is null)
        {
            _allowedDays = WorkDays;
            _lockedGenes = [];
            return;
        }

        // Kapalı günleri çıkar (geçerli aralık 0..4)
        var excluded = options.ExcludedDays.Where(d => d is >= 0 and < 5).ToHashSet();
        _allowedDays = WorkDays.Where((_, idx) => !excluded.Contains(idx)).ToArray();

        // Sabitlenen dersler: courseId → (gün, slot)
        _lockedGenes = options.LockedAssignments
            .Where(l => l.DayOfWeek is >= 0 and < 5 && l.StartHour is >= 8 and <= 17)
            .GroupBy(l => l.CourseId)
            .ToDictionary(
                g => g.Key,
                g => (Day: WorkDays[g.First().DayOfWeek], TimeSlot: g.First().StartHour - 8));
    }

    private Chromosome CreateRandomChromosome(
        List<Models.Course> courses,
        List<Models.Classroom> classrooms)
    {
        var genes = courses.Select(course =>
        {
            int classroomId;
            if (_constraintMap.TryGetValue(course.Id, out var allowed) && allowed.Count > 0)
                classroomId = allowed[_random.Next(allowed.Count)];
            else
                classroomId = classrooms[_random.Next(classrooms.Count)].Id;

            // Sabitlenmiş ders ise gün/saat kilitli, değilse rastgele (izinli günlerden)
            DayOfWeek day;
            int timeSlot;
            if (_lockedGenes.TryGetValue(course.Id, out var locked))
            {
                day = locked.Day;
                timeSlot = locked.TimeSlot;
            }
            else
            {
                day = _allowedDays[_random.Next(_allowedDays.Length)];
                timeSlot = _random.Next(10);
            }

            return new Gene(
                courseId: course.Id,
                instructorId: course.InstructorId,
                classroomId: classroomId,
                day: day,
                timeSlot: timeSlot
            );
        }).ToList();

        return new Chromosome(genes);
    }

    private double CalculateFitness(Chromosome chromosome)
    {
        int conflicts = 0;
        var genes = chromosome.Genes;

        // Kapasite ihlalleri (her gene için bağımsız kontrol)
        foreach (var gene in genes)
        {
            if (_classroomCapacities.TryGetValue(gene.ClassroomId, out var cap) &&
                _courseSizes.TryGetValue(gene.CourseId, out var size) && size > cap)
                conflicts++;
        }

        // Instructor availability ihlalleri
        // Hoca için kayıt varsa ama planlanan slot kayıtlı değilse → çakışma
        foreach (var gene in genes)
        {
            if (gene.InstructorId == 0) continue;
            if (!_instructorAvailability.TryGetValue(gene.InstructorId, out var availableSlots)) continue;
            var dayIdx = (int)gene.Day - 1; // Monday=1 → 0, Friday=5 → 4
            var hour = 8 + gene.TimeSlot;
            if (!availableSlots.Contains((dayIdx, hour)))
                conflicts++;
        }

        // Zaman dilimi çakışmaları — (gün, saat) gruplaması ile O(n)
        // Eski hali iç içe döngüyle O(n²) idi; aynı sonucu daha hızlı üretir.
        var slots = new Dictionary<(DayOfWeek, int), (Dictionary<int, int> Rooms, Dictionary<int, int> Instructors)>();
        foreach (var g in genes)
        {
            var key = (g.Day, g.TimeSlot);
            if (!slots.TryGetValue(key, out var maps))
            {
                maps = (new Dictionary<int, int>(), new Dictionary<int, int>());
                slots[key] = maps;
            }

            maps.Rooms[g.ClassroomId] = maps.Rooms.GetValueOrDefault(g.ClassroomId) + 1;
            if (g.InstructorId != 0)
                maps.Instructors[g.InstructorId] = maps.Instructors.GetValueOrDefault(g.InstructorId) + 1;
        }

        // Aynı slot içinde k ders aynı dersliği/hocayı paylaşıyorsa C(k,2) çakışma sayılır
        foreach (var (_, maps) in slots)
        {
            foreach (var count in maps.Rooms.Values)
                if (count > 1) conflicts += count * (count - 1) / 2;
            foreach (var count in maps.Instructors.Values)
                if (count > 1) conflicts += count * (count - 1) / 2;
        }

        return 1.0 / (1.0 + conflicts);
    }

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

    private void Mutate(Chromosome chromosome, double mutationRate)
    {
        foreach (var gene in chromosome.Genes)
        {
            // Sabitlenmiş dersler mutasyona uğramaz (What-if kilidi korunur)
            if (_lockedGenes.ContainsKey(gene.CourseId)) continue;

            if (_random.NextDouble() < mutationRate)
            {
                gene.Day = _allowedDays[_random.Next(_allowedDays.Length)];
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
