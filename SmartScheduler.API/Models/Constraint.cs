namespace SmartScheduler.API.Models;

/// <summary>
/// Bir dersin hangi derslikte yapılabileceğini tanımlayan kısıt kaydı.
/// Eğer bir dersin hiç Constraint kaydı yoksa algoritma istediği dersliği seçebilir.
/// En az bir kayıt varsa algoritma yalnızca izin verilen dersliklerden birini seçer.
/// </summary>
public class Constraint
{
    public int Id { get; set; }

    /// <summary>Kısıt uygulanan ders</summary>
    public int CourseId { get; set; }
    public Course Course { get; set; } = null!;

    /// <summary>İzin verilen derslik</summary>
    public int ClassroomId { get; set; }
    public Classroom Classroom { get; set; } = null!;

    /// <summary>Kısıt için isteğe bağlı açıklama notu</summary>
    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
