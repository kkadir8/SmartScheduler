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
    /// <summary>Zaman çakışması sayısı: aynı saatte aynı derslik veya aynı hoca.</summary>
    public int ConflictCount { get; set; }
    /// <summary>Derslik kapasitesi yetersiz olan ders sayısı (öğrenci > kapasite).</summary>
    public int CapacityCount { get; set; }
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

    // Zaman modeli: 08:00–18:00 arası 10 adet 1 saatlik dilim (slot 0=08:00 … 9=17:00).
    // Ders süresi DERSE ÖZELDİR (Course.DurationHours, 1–6 saat). d saatlik ders en geç
    // (SlotsPerDay - d) dilimde başlayabilir; örn 6 saatlik ders en geç slot 4'te (12:00) → 12:00–18:00.
    private const int SlotsPerDay = 10;

    // İhlal ağırlıkları — "hard" kurallar (çakışma/kapasite) "soft" tercihten (müsaitlik) çok daha ağır.
    // Böylece algoritma önce gerçekten geçersiz programları eler, sonra tercihleri iyileştirir.
    private const int WRoom = 10;         // aynı derslik aynı saatte iki ders (hard)
    private const int WInstructor = 10;   // aynı hoca aynı saatte iki ders (hard)
    private const int WCapacity = 5;      // derslik kapasitesi öğrenci sayısından küçük (hard)
    private const int WAvailability = 2;  // hoca o saatte müsait değil (soft tercih)

    private static readonly DayOfWeek[] WorkDays =
        [DayOfWeek.Monday, DayOfWeek.Tuesday, DayOfWeek.Wednesday,
         DayOfWeek.Thursday, DayOfWeek.Friday];

    // Her run başında doldurulur, tüm private metodlar paylaşır
    private Dictionary<int, List<int>> _constraintMap = [];
    private Dictionary<int, int> _classroomCapacities = [];
    private Dictionary<int, int> _courseSizes = [];
    private Dictionary<int, int> _courseDurations = [];  // courseId → ders süresi (saat)
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
        // Ders süresi (1–6 saat). Geçersiz/0 ise güvenli varsayılan 2.
        _courseDurations = courses.ToDictionary(
            c => c.Id,
            c => Math.Clamp(c.DurationHours <= 0 ? 2 : c.DurationHours, 1, SlotsPerDay));

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
            .Select(_ => CreateRandomChromosome(courses))
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

        // En iyi programın gerçek (ağırlıksız) çakışma ve kapasite ihlal sayılarını raporla
        ComputePenalty(best, out int bestConflicts, out int bestCapacity);

        return new ScheduleResult
        {
            Best = best,
            FitnessHistory = fitnessHistory,
            BestGeneration = bestGeneration,
            TotalGenerations = fitnessHistory.Count,
            ElapsedMs = sw.ElapsedMilliseconds,
            StoppedEarly = stoppedEarly,
            ConflictCount = bestConflicts,
            CapacityCount = bestCapacity
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

        // Sabitlenen dersler: courseId → (gün, slot). Ders süresine göre blok 18:00'ı aşmamalı.
        _lockedGenes = options.LockedAssignments
            .Where(l => l.DayOfWeek is >= 0 and < 5 && l.StartHour >= 8 &&
                        (l.StartHour - 8) + _courseDurations.GetValueOrDefault(l.CourseId, 2) <= SlotsPerDay)
            .GroupBy(l => l.CourseId)
            .ToDictionary(
                g => g.Key,
                g => (Day: WorkDays[g.First().DayOfWeek], TimeSlot: g.First().StartHour - 8));
    }

    /// <summary>
    /// Bir ders için derslik seçer: önce constraint (izinli derslikler), sonra kapasite filtresi.
    /// Kapasitesi yeten derslik varsa onlardan, yoksa havuzdan rastgele seçer.
    /// Hem rastgele üretimde hem mutasyonda kullanılır → kapasite ihlali aktif olarak elenir.
    /// </summary>
    private int PickClassroom(int courseId, bool respectCapacity = true)
    {
        int size = _courseSizes.GetValueOrDefault(courseId);
        var pool = (_constraintMap.TryGetValue(courseId, out var allowed) && allowed.Count > 0)
            ? allowed
            : _classroomCapacities.Keys.ToList();

        if (respectCapacity)
        {
            var fitting = pool.Where(id => _classroomCapacities.GetValueOrDefault(id) >= size).ToList();
            if (fitting.Count > 0) pool = fitting;
        }
        return pool[_random.Next(pool.Count)];
    }

    /// <summary>d saatlik ders için geçerli rastgele başlangıç dilimi seçer (blok 18:00'ı aşmaz).</summary>
    private int PickTimeSlot(int duration) => _random.Next(Math.Max(1, SlotsPerDay - duration + 1));

    private Chromosome CreateRandomChromosome(List<Models.Course> courses)
    {
        var genes = courses.Select(course =>
        {
            int duration = _courseDurations.GetValueOrDefault(course.Id, 2);

            // Başlangıçta kapasiteyi gözetmeden (sadece constraint'e uyarak) seç —
            // kapasite ihlallerini ve çakışmaları GA nesiller boyunca çözer (grafik anlamlı olur).
            int classroomId = PickClassroom(course.Id, respectCapacity: false);

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
                timeSlot = PickTimeSlot(duration);
            }

            return new Gene(course.Id, course.InstructorId, classroomId, day, timeSlot, duration);
        }).ToList();

        return new Chromosome(genes);
    }

    /// <summary>GA seçimi için ağırlıklı uygunluk: 1/(1+ceza). Ceza 0 ise program kusursuz (=1.0).</summary>
    private double CalculateFitness(Chromosome chromosome)
        => 1.0 / (1.0 + ComputePenalty(chromosome, out _, out _));

    /// <summary>
    /// Programın toplam ağırlıklı ihlal puanını hesaplar. Her ders 2 saatlik blok (slot, slot+1)
    /// işgal eder; çakışma kontrolü iki saatin İKİSİ için de yapılır.
    /// <paramref name="timeConflicts"/>: derslik+hoca zaman çakışması sayısı.
    /// <paramref name="capacityViolations"/>: derslik kapasitesi yetersiz ders sayısı.
    /// </summary>
    private int ComputePenalty(Chromosome chromosome, out int timeConflicts, out int capacityViolations)
    {
        int penalty = 0;
        timeConflicts = 0;
        capacityViolations = 0;
        var genes = chromosome.Genes;

        // 1) Derslik kapasitesi (hard) — derslik öğrenci sayısını taşıyamıyorsa
        foreach (var gene in genes)
        {
            if (_classroomCapacities.TryGetValue(gene.ClassroomId, out var cap) &&
                _courseSizes.TryGetValue(gene.CourseId, out var size) && size > cap)
            {
                penalty += WCapacity;
                capacityViolations++;
            }
        }

        // 2) Hoca müsaitliği (soft) — dersin TÜM saatleri müsait olmalı
        foreach (var gene in genes)
        {
            if (gene.InstructorId == 0) continue;
            if (!_instructorAvailability.TryGetValue(gene.InstructorId, out var availableSlots)) continue;
            var dayIdx = (int)gene.Day - 1; // Monday=1 → 0 … Friday=5 → 4
            for (int d = 0; d < gene.DurationHours; d++)
            {
                int hour = 8 + gene.TimeSlot + d;
                if (!availableSlots.Contains((dayIdx, hour)))
                    penalty += WAvailability;
            }
        }

        // 3) Zaman çakışmaları — her ders kendi süresi kadar saat dilimini işgal eder.
        //    Değişken süreli iki ders aynı derslik/hocada bir dilimde buluşursa çakışma sayılır.
        var roomOcc = new Dictionary<(DayOfWeek, int), Dictionary<int, int>>();
        var instrOcc = new Dictionary<(DayOfWeek, int), Dictionary<int, int>>();
        foreach (var g in genes)
        {
            for (int d = 0; d < g.DurationHours; d++)
            {
                var key = (g.Day, g.TimeSlot + d);

                if (!roomOcc.TryGetValue(key, out var rmap)) { rmap = new(); roomOcc[key] = rmap; }
                rmap[g.ClassroomId] = rmap.GetValueOrDefault(g.ClassroomId) + 1;

                if (g.InstructorId != 0)
                {
                    if (!instrOcc.TryGetValue(key, out var imap)) { imap = new(); instrOcc[key] = imap; }
                    imap[g.InstructorId] = imap.GetValueOrDefault(g.InstructorId) + 1;
                }
            }
        }

        // Bir saat diliminde k ders aynı dersliği/hocayı paylaşıyorsa C(k,2) çakışma
        foreach (var (_, rmap) in roomOcc)
            foreach (var count in rmap.Values)
                if (count > 1) { int pairs = count * (count - 1) / 2; penalty += WRoom * pairs; timeConflicts += pairs; }

        foreach (var (_, imap) in instrOcc)
            foreach (var count in imap.Values)
                if (count > 1) { int pairs = count * (count - 1) / 2; penalty += WInstructor * pairs; timeConflicts += pairs; }

        return penalty;
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

            // Gün/saat mutasyonu — başlangıç dilimi dersin süresine göre seçilir
            if (_random.NextDouble() < mutationRate)
            {
                gene.Day = _allowedDays[_random.Next(_allowedDays.Length)];
                gene.TimeSlot = PickTimeSlot(gene.DurationHours);
            }

            // Derslik mutasyonu — kapasiteye uygun derslik havuzundan (kapasite ihlalini düzeltir)
            if (_random.NextDouble() < mutationRate)
                gene.ClassroomId = PickClassroom(gene.CourseId);
        }
    }

    private Chromosome TournamentSelect(List<Chromosome> population)
    {
        var a = population[_random.Next(population.Count)];
        var b = population[_random.Next(population.Count)];
        return a.Fitness >= b.Fitness ? a : b;
    }
}
