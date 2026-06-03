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
    public int ConflictCount { get; set; }
    public int CapacityCount { get; set; }
}

public class LockedAssignment
{
    public int CourseId { get; set; }
    public int DayOfWeek { get; set; }  // 0=Pazartesi..4=Cuma
    public int StartHour { get; set; }  // 8..17
}

public class WhatIfOptions
{
    public string? Department { get; set; }
    public List<int> ExcludedDays { get; set; } = [];
    public List<LockedAssignment> LockedAssignments { get; set; } = [];
}

/// <summary>
/// Genetik Algoritma ile haftalık ders programı optimizasyonu.
///
/// NASIL ÇALIŞIR?
///   1. Rastgele 50 aday çözüm (Chromosome) üretilir — her biri tüm derslerin
///      gün/saat/derslik atamasını içerir.
///   2. Her çözüme fitness skoru hesaplanır: çakışma ve ihlal sayısına göre ceza
///      verilir; ceza ne kadar düşükse skor o kadar yüksek (fitness = 1/(1+ceza)).
///   3. En iyi bireyler turnuva seçimiyle çiftleştirilir (crossover), yeni nesil
///      üretilir ve küçük rastgele değişiklikler (mutasyon) uygulanır.
///   4. İlerleme durduğunda (stagnation) veya mükemmel çözüm bulunduğunda algoritma durur.
/// </summary>
public class GeneticAlgorithmService : IGeneticAlgorithmService
{
    private readonly AppDbContext _context;
    private readonly Random _random = new();

    // ── GA HİPERPARAMETRELERİ ──────────────────────────────────────────────────
    private const int PopulationSize = 50;      // Her nesildeki aday çözüm sayısı
    private const int MaxGenerations = 200;     // Maksimum iterasyon limiti
    private const double MutationRate = 0.02;   // Başlangıç mutasyon olasılığı (%2)
    private const double MaxMutationRate = 0.20;// Stagnasyonda ulaşabilecek tavan (%20)
    private const double CrossoverRate = 0.8;   // İki ebeveynden çocuk üretme olasılığı
    // FIX-3: base değer; gerçek limit = Math.Max(BaseStagnationLimit, ders_sayısı * 3)
    private const int BaseStagnationLimit = 40; // İyileşme yoksa kaç nesil beklenecek

    // Zaman modeli: 08:00–18:00 arası 10 adet 1 saatlik dilim.
    private const int SlotsPerDay = 10;

    // ── CEZA AĞIRLIKLARI (penalty weights) ────────────────────────────────────
    // Yüksek ağırlık = algoritmaya "bu kuralı çiğneme" mesajı
    private const int WRoom = 10;        // Aynı anda aynı derslik: HARD kural
    private const int WInstructor = 10;  // Aynı anda aynı hoca: HARD kural
    private const int WCapacity = 5;     // Derslik kapasitesi yetersiz: HARD kural
    private const int WAvailability = 2; // Hocanın müsait olmadığı saat: SOFT kural
    // FIX-6: hocasız derslerin aynı slota yığılmasına soft ceza
    private const int WUnassigned = 1;   // Hocasız dersler aynı slotta: SOFT yayılım teşviki

    // FIX-2: müsaitlik kaydı olmayan hocalar için tam çalışma haftası varsayılanı
    private static readonly HashSet<(int dayIdx, int hour)> FullAvailability =
        new(from d in Enumerable.Range(0, 5)
            from h in Enumerable.Range(8, 10)
            select (d, h));

    private static readonly DayOfWeek[] WorkDays =
        [DayOfWeek.Monday, DayOfWeek.Tuesday, DayOfWeek.Wednesday,
         DayOfWeek.Thursday, DayOfWeek.Friday];

    private Dictionary<int, List<int>> _constraintMap = [];
    private Dictionary<int, int> _classroomCapacities = [];
    private Dictionary<int, int> _courseSizes = [];
    private Dictionary<int, int> _courseDurations = [];
    // FIX-2: artık her hoca için kesin bir set var; kayıtsız → FullAvailability
    private Dictionary<int, HashSet<(int dayIdx, int hour)>> _instructorAvailability = [];

    private DayOfWeek[] _allowedDays = WorkDays;
    private Dictionary<int, (DayOfWeek Day, int TimeSlot)> _lockedGenes = [];

    public GeneticAlgorithmService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ScheduleResult> GenerateScheduleAsync(string? department = null, WhatIfOptions? options = null)
    {
        var sw = Stopwatch.StartNew();

        // ── ADIM 1: Veritabanından veri yükle ─────────────────────────────────
        var coursesQuery = _context.Courses.Include(c => c.Instructor).AsQueryable();
        if (!string.IsNullOrWhiteSpace(department))
            coursesQuery = coursesQuery.Where(c => c.Instructor!.Department == department);
        var courses = await coursesQuery.ToListAsync();
        var classrooms = await _context.Classrooms.ToListAsync();

        // Her ders için izin verilen derslikler (Constraint tablosu)
        _constraintMap = (await _context.Constraints.ToListAsync())
            .GroupBy(c => c.CourseId)
            .ToDictionary(g => g.Key, g => g.Select(c => c.ClassroomId).ToList());

        _classroomCapacities = classrooms.ToDictionary(c => c.Id, c => c.Capacity);
        _courseSizes = courses.ToDictionary(c => c.Id, c => c.StudentCount);
        // DurationHours <= 0 ise varsayılan 2 saat; SlotsPerDay'i aşamaz
        _courseDurations = courses.ToDictionary(
            c => c.Id,
            c => Math.Clamp(c.DurationHours <= 0 ? 2 : c.DurationHours, 1, SlotsPerDay));

        // Her hoca için (gün, saat) çiftleri kümesi — penalty hesabında kullanılır
        _instructorAvailability = (await _context.InstructorAvailabilities.ToListAsync())
            .GroupBy(a => a.InstructorId)
            .ToDictionary(
                g => g.Key,
                g => g.Select(a => (a.DayOfWeek, a.Hour)).ToHashSet()
            );

        // What-if: kapalı günler ve kilitli atamalar uygulanır
        ApplyWhatIfOptions(options);

        if (!courses.Any() || !classrooms.Any() || _allowedDays.Length == 0)
        {
            sw.Stop();
            return new ScheduleResult { Best = new Chromosome(), ElapsedMs = sw.ElapsedMilliseconds };
        }

        // ── ADIM 2: Başlangıç popülasyonu oluştur ─────────────────────────────
        // FIX-3: problem büyüklüğüne göre ölçeklenen stagnation limiti
        int stagnationLimit = Math.Max(BaseStagnationLimit, courses.Count * 3);

        // 50 adet rastgele çözüm üret; her biri tüm derslerin tam atamasını içerir
        var population = Enumerable.Range(0, PopulationSize)
            .Select(_ => CreateRandomChromosome(courses))
            .ToList();

        Chromosome best = population[0];
        var fitnessHistory = new List<double>();
        int bestGeneration = 0;
        int stagnation = 0;
        bool stoppedEarly = false;

        // ── ADIM 3: Ana evrim döngüsü ──────────────────────────────────────────
        for (int gen = 0; gen < MaxGenerations; gen++)
        {
            // Tüm bireylerin fitness değeri paralel hesaplanır (performans için)
            Parallel.ForEach(population, chr => chr.Fitness = CalculateFitness(chr));

            var currentBest = population.MaxBy(c => c.Fitness)!;
            if (currentBest.Fitness > best.Fitness)
            {
                best = currentBest.Clone(); // En iyi çözümü sakla
                bestGeneration = gen + 1;
                stagnation = 0;
            }
            else
            {
                stagnation++; // İyileşme olmadı; stagnation sayacını artır
            }

            fitnessHistory.Add(Math.Round(best.Fitness, 4)); // Grafik için kaydet

            if (best.Fitness >= 1.0) break; // Mükemmel çözüm bulundu, erken çık

            if (stagnation >= stagnationLimit)  // FIX-3: yetersiz ilerleme → dur
            {
                stoppedEarly = true;
                break;
            }

            // Stagnation arttıkça mutasyon da artar: çeşitlilik zorunlu hale gelir
            double mutation = Math.Min(MaxMutationRate, MutationRate * (1 + stagnation / 10.0));

            // ── Elitizm: en iyi birey doğrudan bir sonraki nesile aktarılır ──
            var newPopulation = new List<Chromosome> { best.Clone() };
            while (newPopulation.Count < PopulationSize)
            {
                var parent1 = TournamentSelect(population);
                var parent2 = TournamentSelect(population);
                // %80 ihtimalle crossover, %20 ihtimalle klonlama
                var child = _random.NextDouble() < CrossoverRate
                    ? Crossover(parent1, parent2)
                    : parent1.Clone();
                Mutate(child, mutation);
                newPopulation.Add(child);
            }
            population = newPopulation;
        }

        sw.Stop();

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

        var excluded = options.ExcludedDays.Where(d => d is >= 0 and < 5).ToHashSet();
        _allowedDays = WorkDays.Where((_, idx) => !excluded.Contains(idx)).ToArray();

        // FIX-7: kapalı güne atanmış kilit sessizce düşürülür (çelişkili senaryo engellenir)
        _lockedGenes = options.LockedAssignments
            .Where(l => l.DayOfWeek is >= 0 and < 5
                     && !excluded.Contains(l.DayOfWeek)
                     && l.StartHour >= 8
                     && (l.StartHour - 8) + _courseDurations.GetValueOrDefault(l.CourseId, 2) <= SlotsPerDay)
            .GroupBy(l => l.CourseId)
            .ToDictionary(
                g => g.Key,
                g => (Day: WorkDays[g.First().DayOfWeek], TimeSlot: g.First().StartHour - 8));
    }

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

    private int PickTimeSlot(int duration) => _random.Next(Math.Max(1, SlotsPerDay - duration + 1));

    private Chromosome CreateRandomChromosome(List<Models.Course> courses)
    {
        var genes = courses.Select(course =>
        {
            int duration = _courseDurations.GetValueOrDefault(course.Id, 2);

            // FIX-1: başlangıçtan kapasiteye uygun derslik seç;
            // algoritma ilk nesilden itibaren gerçek optimizasyona odaklanır.
            int classroomId = PickClassroom(course.Id, respectCapacity: true);

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

    // fitness = 1 / (1 + ceza): ceza 0 → fitness 1.0 (mükemmel); ceza büyüdükçe 0'a yaklaşır
    private double CalculateFitness(Chromosome chromosome)
        => 1.0 / (1.0 + ComputePenalty(chromosome, out _, out _));

    /// <summary>
    /// Bir çözümün toplam ceza puanını hesaplar.
    /// Üç kategori kontrol edilir:
    ///   1. Kapasite ihlali   — öğrenci sayısı > derslik kapasitesi (HARD)
    ///   2. Müsaitlik ihlali  — hocanın o saatte müsait olmaması (SOFT)
    ///   3. Zaman çakışmaları — aynı anda aynı derslik veya aynı hoca (HARD)
    /// </summary>
    private int ComputePenalty(Chromosome chromosome, out int timeConflicts, out int capacityViolations)
    {
        int penalty = 0;
        timeConflicts = 0;
        capacityViolations = 0;
        var genes = chromosome.Genes;

        // ── 1) Derslik kapasitesi (hard) ──────────────────────────────────────
        foreach (var gene in genes)
        {
            if (_classroomCapacities.TryGetValue(gene.ClassroomId, out var cap) &&
                _courseSizes.TryGetValue(gene.CourseId, out var size) && size > cap)
            {
                penalty += WCapacity;
                capacityViolations++;
            }
        }

        // ── 2) Hoca müsaitliği (soft) ──────────────────────────────────────────
        // FIX-2: kayıtsız hoca → FullAvailability (tüm çalışma saatleri); davranış explicit ve tutarlı
        foreach (var gene in genes)
        {
            if (gene.InstructorId == 0) continue; // Hoca atanmamış ders — kontrol etme
            var availableSlots = _instructorAvailability.GetValueOrDefault(gene.InstructorId, FullAvailability);
            int dayIdx = (int)gene.Day - 1;  // Monday=1 → 0 … Friday=5 → 4
            // Ders birden fazla saat sürebilir; her saat ayrı ayrı kontrol edilir
            for (int d = 0; d < gene.DurationHours; d++)
            {
                int hour = 8 + gene.TimeSlot + d;
                if (!availableSlots.Contains((dayIdx, hour)))
                    penalty += WAvailability;
            }
        }

        // ── 3) Zaman çakışmaları (hard) ───────────────────────────────────────
        // Her (gün, slot) için hangi derslik/hoca kaç kez kullanılıyor?
        var roomOcc   = new Dictionary<(DayOfWeek, int), Dictionary<int, int>>();
        var instrOcc  = new Dictionary<(DayOfWeek, int), Dictionary<int, int>>();
        // FIX-6: hocasız derslerin slot başına yoğunluğu
        var unassignedOcc = new Dictionary<(DayOfWeek, int), int>();

        foreach (var g in genes)
        {
            // Ders kaç saat süryorsa o kadar slotu işgal eder (blok mantığı)
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
                else
                {
                    // FIX-6: aynı slotta birden fazla hocasız ders → yayılım teşviki
                    unassignedOcc[key] = unassignedOcc.GetValueOrDefault(key) + 1;
                }
            }
        }

        // Aynı slotta N kez kullanım → N*(N-1)/2 çakışan çift → o kadar ceza
        foreach (var (_, rmap) in roomOcc)
            foreach (var count in rmap.Values)
                if (count > 1) { int pairs = count * (count - 1) / 2; penalty += WRoom * pairs; timeConflicts += pairs; }

        foreach (var (_, imap) in instrOcc)
            foreach (var count in imap.Values)
                if (count > 1) { int pairs = count * (count - 1) / 2; penalty += WInstructor * pairs; timeConflicts += pairs; }

        // FIX-6: hocasız dersler farklı slotlara yayılsın (soft)
        foreach (var count in unassignedOcc.Values)
            if (count > 1) penalty += WUnassigned * (count - 1);

        return penalty;
    }

    // FIX-5: uniform crossover — her gen bağımsız olarak ebeveynlerden birinden alınır;
    // single-point'ten çok daha iyi çeşitlilik sağlar.
    // Örnek: P1=[A,B,C,D]  P2=[a,b,c,d]  → Çocuk=[A,b,C,d] (coin flip per gene)
    private Chromosome Crossover(Chromosome p1, Chromosome p2)
    {
        if (p1.Genes.Count == 0) return p2.Clone();
        var childGenes = p1.Genes
            .Zip(p2.Genes, (g1, g2) => (_random.NextDouble() < 0.5 ? g1 : g2).Clone())
            .ToList();
        return new Chromosome(childGenes);
    }

    /// <summary>
    /// Mutasyon: her gene için verilen olasılıkla rastgele gün/saat veya derslik değiştirilir.
    /// Kilitli genler (what-if LockedAssignments) asla değiştirilmez.
    /// Stagnation arttıkça mutationRate yükselir → sıkışmadan çıkış mekanizması.
    /// </summary>
    private void Mutate(Chromosome chromosome, double mutationRate)
    {
        foreach (var gene in chromosome.Genes)
        {
            if (_lockedGenes.ContainsKey(gene.CourseId)) continue; // Kilitli → dokunma

            if (_random.NextDouble() < mutationRate)
            {
                gene.Day = _allowedDays[_random.Next(_allowedDays.Length)];
                gene.TimeSlot = PickTimeSlot(gene.DurationHours);
            }

            if (_random.NextDouble() < mutationRate)
                gene.ClassroomId = PickClassroom(gene.CourseId); // Farklı derslik dene
        }
    }

    // FIX-4: aynı birey iki kez seçilemiyor — gerçek rekabetçi turnuva
    // İki farklı birey rastgele seçilir; yüksek fitness kazanır.
    private Chromosome TournamentSelect(List<Chromosome> population)
    {
        int idxA = _random.Next(population.Count);
        int idxB;
        do { idxB = _random.Next(population.Count); } while (idxB == idxA && population.Count > 1);
        return population[idxA].Fitness >= population[idxB].Fitness ? population[idxA] : population[idxB];
    }
}
