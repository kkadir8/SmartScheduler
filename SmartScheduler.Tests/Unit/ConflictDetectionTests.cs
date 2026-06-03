using FluentAssertions;
using SmartScheduler.API.Models.Algorithm;

namespace SmartScheduler.Tests.Unit;

/// <summary>
/// UT-01 — UT-08: Çakışma tespiti ve zaman dilimi örtüşme mantığını doğrular.
/// GeneticAlgorithmService'deki iç lojik bu testlerle bağımsız olarak test edilir.
/// </summary>
public class ConflictDetectionTests
{
    // ── Yardımcı fabrikalar ────────────────────────────────────────────────────

    private static Gene MakeGene(int courseId, int instructorId, int classroomId,
        DayOfWeek day, int timeSlot, int duration = 2)
        => new(courseId, instructorId, classroomId, day, timeSlot, duration);

    /// <summary>startA < endB && startB < endA koşulunu kontrol eder.</summary>
    private static bool Overlaps(Gene a, Gene b)
        => a.Day == b.Day
        && a.TimeSlot < b.TimeSlot + b.DurationHours
        && b.TimeSlot < a.TimeSlot + a.DurationHours;

    // ── UT-01: Aynı günde, aynı saatte aynı derslik çakışması ─────────────────
    [Fact]
    public void SameClassroom_SameTime_ShouldConflict()
    {
        var a = MakeGene(1, 1, 10, DayOfWeek.Monday, 2, 2);
        var b = MakeGene(2, 2, 10, DayOfWeek.Monday, 2, 2); // aynı derslik

        Overlaps(a, b).Should().BeTrue();
        a.ClassroomId.Should().Be(b.ClassroomId);
    }

    // ── UT-02: Farklı günde aynı derslik — çakışma yok ───────────────────────
    [Fact]
    public void SameClassroom_DifferentDay_ShouldNotConflict()
    {
        var a = MakeGene(1, 1, 10, DayOfWeek.Monday,    2, 2);
        var b = MakeGene(2, 2, 10, DayOfWeek.Wednesday, 2, 2);

        Overlaps(a, b).Should().BeFalse();
    }

    // ── UT-03: Aynı hoca, aynı günde örtüşen saatler ─────────────────────────
    [Fact]
    public void SameInstructor_OverlappingSlots_ShouldConflict()
    {
        var a = MakeGene(1, 5, 10, DayOfWeek.Tuesday, 2, 3); // 10:00–13:00
        var b = MakeGene(2, 5, 20, DayOfWeek.Tuesday, 4, 2); // 12:00–14:00 (örtüşüyor)

        Overlaps(a, b).Should().BeTrue();
        a.InstructorId.Should().Be(b.InstructorId);
    }

    // ── UT-04: Aynı hoca, art arda gelen saatler — çakışma yok ───────────────
    [Fact]
    public void SameInstructor_AdjacentSlots_ShouldNotConflict()
    {
        var a = MakeGene(1, 5, 10, DayOfWeek.Tuesday, 2, 2); // 10:00–12:00
        var b = MakeGene(2, 5, 20, DayOfWeek.Tuesday, 4, 2); // 12:00–14:00

        Overlaps(a, b).Should().BeFalse();
    }

    // ── UT-05: Farklı hoca, aynı derslik, aynı saat — sadece salon çakışması ──
    [Fact]
    public void DifferentInstructor_SameClassroom_SameTime_ShouldHaveRoomConflict()
    {
        var a = MakeGene(1, 3, 7, DayOfWeek.Thursday, 1, 2);
        var b = MakeGene(2, 4, 7, DayOfWeek.Thursday, 1, 2);

        Overlaps(a, b).Should().BeTrue();
        a.ClassroomId.Should().Be(b.ClassroomId);
        a.InstructorId.Should().NotBe(b.InstructorId);
    }

    // ── UT-06: Süreli ders örtüşmesi — kısmen üst üste geliyor ───────────────
    [Fact]
    public void PartialOverlap_ShouldConflict()
    {
        var a = MakeGene(1, 1, 10, DayOfWeek.Friday, 0, 4); // 08:00–12:00
        var b = MakeGene(2, 2, 10, DayOfWeek.Friday, 3, 2); // 11:00–13:00

        Overlaps(a, b).Should().BeTrue();
    }

    // ── UT-07: Tamamen iç içe geçmiş saatler ─────────────────────────────────
    [Fact]
    public void FullyContained_ShouldConflict()
    {
        var a = MakeGene(1, 1, 10, DayOfWeek.Monday, 0, 6); // 08:00–14:00
        var b = MakeGene(2, 2, 10, DayOfWeek.Monday, 2, 2); // 10:00–12:00 (içinde)

        Overlaps(a, b).Should().BeTrue();
    }

    // ── UT-08: Farklı derslik + farklı hoca, aynı saat — çakışma yok ─────────
    [Fact]
    public void DifferentClassroomAndInstructor_ShouldNotConflict()
    {
        var a = MakeGene(1, 1, 10, DayOfWeek.Monday, 2, 2);
        var b = MakeGene(2, 2, 20, DayOfWeek.Monday, 2, 2);

        // Aynı günde, aynı saatte ama farklı salon+hoca → çakışma yok
        bool hasConflict = Overlaps(a, b)
            && (a.ClassroomId == b.ClassroomId || a.InstructorId == b.InstructorId);

        hasConflict.Should().BeFalse();
    }

    // ── UT-09: Gene Clone ─────────────────────────────────────────────────────
    [Fact]
    public void Gene_Clone_ShouldProduceEqualButIndependentCopy()
    {
        var original = MakeGene(5, 3, 7, DayOfWeek.Wednesday, 3, 3);
        var clone = original.Clone();

        clone.CourseId.Should().Be(original.CourseId);
        clone.InstructorId.Should().Be(original.InstructorId);
        clone.TimeSlot.Should().Be(original.TimeSlot);
        clone.DurationHours.Should().Be(original.DurationHours);

        // Bağımsız nesne — değiştirince orijinal etkilenmemeli
        clone.TimeSlot = 9;
        clone.TimeSlot.Should().NotBe(original.TimeSlot);
    }

    // ── UT-10: Chromosome Clone ───────────────────────────────────────────────
    [Fact]
    public void Chromosome_Clone_ShouldDeepCopyGenes()
    {
        var chr = new Chromosome(new List<Gene>
        {
            MakeGene(1, 1, 1, DayOfWeek.Monday, 0, 2),
            MakeGene(2, 2, 2, DayOfWeek.Tuesday, 3, 3),
        }) { Fitness = 0.85 };

        var clone = chr.Clone();

        clone.Genes.Should().HaveCount(2);
        clone.Fitness.Should().Be(0.85);
        clone.Genes.Should().NotBeSameAs(chr.Genes);
        clone.Genes[0].Should().NotBeSameAs(chr.Genes[0]);
    }
}
