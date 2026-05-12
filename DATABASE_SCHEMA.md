# Veritabanı Şeması

**Veritabanı:** PostgreSQL 16
**ORM:** Entity Framework Core 8

---

## ER Diyagramı

> dbdiagram.io kodu ([dbdiagram.io](https://dbdiagram.io/d) üzerinde görselleştirilebilir)

```dbml
Table Users {
  Id uuid [pk]
  Email varchar(255) [unique, not null]
  PasswordHash varchar(500) [not null]
  FirstName varchar(100) [not null]
  LastName varchar(100) [not null]
  Role varchar(50) [not null] // Admin, DepartmentHead, Instructor, Viewer
  CreatedAt timestamp [default: `now()`]
  UpdatedAt timestamp
  IsActive boolean [default: true]
}

Table Departments {
  Id uuid [pk]
  Name varchar(200) [not null]
  Code varchar(20) [unique, not null]
  CreatedAt timestamp [default: `now()`]
}

Table Instructors {
  Id uuid [pk]
  UserId uuid [ref: > Users.Id, not null]
  DepartmentId uuid [ref: > Departments.Id, not null]
  Title varchar(100) // Prof. Dr., Doç. Dr., Dr. Öğr. Üyesi
  EmployeeNumber varchar(50) [unique]
  CreatedAt timestamp [default: `now()`]
}

Table Classrooms {
  Id uuid [pk]
  Name varchar(100) [not null]
  Building varchar(100)
  Capacity int [not null]
  HasProjector boolean [default: true]
  HasLab boolean [default: false]
  IsActive boolean [default: true]
}

Table Courses {
  Id uuid [pk]
  Code varchar(20) [unique, not null] // CS101, MATH201
  Name varchar(200) [not null]
  Credit int [not null]
  Theory int [not null] // Teorik saat/hafta
  Practice int [default: 0] // Uygulama saat/hafta
  Semester int [not null] // 1-8
  DepartmentId uuid [ref: > Departments.Id]
  InstructorId uuid [ref: > Instructors.Id]
  RequiresLab boolean [default: false]
  StudentCount int [not null]
  IsActive boolean [default: true]
}

Table TimeSlots {
  Id uuid [pk]
  Day int [not null] // 1=Pazartesi, 5=Cuma
  StartTime time [not null]
  EndTime time [not null]
  SlotOrder int [not null] // 1-9 (günde 9 slot)
}

Table InstructorAvailability {
  Id uuid [pk]
  InstructorId uuid [ref: > Instructors.Id, not null]
  TimeSlotId uuid [ref: > TimeSlots.Id, not null]
  IsAvailable boolean [default: true]
  Preference int [default: 0] // 0=normal, 1=tercih, -1=kaçınma
}

Table Schedules {
  Id uuid [pk]
  CourseId uuid [ref: > Courses.Id, not null]
  ClassroomId uuid [ref: > Classrooms.Id, not null]
  TimeSlotId uuid [ref: > TimeSlots.Id, not null]
  Semester varchar(20) [not null] // "2025-Bahar"
  GeneratedAt timestamp [default: `now()`]
  GenerationRunId uuid [ref: > GenerationRuns.Id]

  Indexes {
    (Semester, ClassroomId, TimeSlotId) [unique]
    (Semester, CourseId, TimeSlotId) [unique]
  }
}

Table GenerationRuns {
  Id uuid [pk]
  Semester varchar(20) [not null]
  StartedAt timestamp [default: `now()`]
  CompletedAt timestamp
  Status varchar(50) [default: 'Running'] // Running, Completed, Failed
  FitnessScore decimal(10,4)
  GenerationCount int
  HardConstraintViolations int [default: 0]
  SoftConstraintScore decimal(10,4)
  TriggeredBy uuid [ref: > Users.Id]
}
```

## Tablo Açıklamaları

### Users
Sistemdeki tüm kullanıcılar (admin, bölüm başkanı, hoca). Authentication ve role-based authorization için kullanılır.

### Departments
Üniversite bölümleri. Her dersin ve hocanın bağlı olduğu bölüm.

### Instructors
Öğretim üyeleri. Users tablosuyla 1-1 ilişki, Departments ile çoklu ilişki.

### Classrooms
Derslik ve laboratuvar bilgileri. Kapasite ve donanım özellikleri kısıt motoru için kritik.

### Courses
Açılan dersler. Her ders bir hocaya atanmıştır (gelecek versiyonlarda M:N olabilir).

### TimeSlots
Sabit zaman dilimleri (örn. Pazartesi 09:00-09:50). Genetik algoritma bu slotları gen olarak kullanır.

### InstructorAvailability
Hocaların hangi zaman dilimlerinde müsait olduğu ve tercih puanı. Yumuşak kısıt için kullanılır.

### Schedules
Üretilmiş ders programının final hali. Her satır bir (Course, Classroom, TimeSlot) atamasını temsil eder.

### GenerationRuns
Algoritma çalıştırma kayıtları. Performans takibi ve farklı çözümleri karşılaştırma imkanı.

## İndexleme

```sql
-- Sık kullanılan sorgular için
CREATE INDEX idx_schedules_semester ON Schedules(Semester);
CREATE INDEX idx_schedules_courseid ON Schedules(CourseId);
CREATE INDEX idx_courses_departmentid ON Courses(DepartmentId);
CREATE INDEX idx_instructor_availability ON InstructorAvailability(InstructorId, TimeSlotId);

-- Unique constraints (yukarıda tanımlı, EF Core migration ile gelir)
CREATE UNIQUE INDEX idx_users_email ON Users(Email);
CREATE UNIQUE INDEX idx_courses_code ON Courses(Code);
```

## Migration Yönetimi

EF Core migration komutları:

```bash
# Yeni migration oluştur
dotnet ef migrations add InitialCreate -p src/SmartScheduler.Infrastructure

# Veritabanına uygula
dotnet ef database update

# Migration geri al
dotnet ef database update <PreviousMigrationName>
```

---

**Hazırlayan:** Hamza Hakverir (Database Lead)
**Son Güncelleme:** Sprint 1
