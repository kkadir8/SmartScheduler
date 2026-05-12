# Mimari Tasarım Dokümantasyonu

**Proje:** SmartScheduler — AI Destekli Akıllı Ders Programı Oluşturucu
**Ekip:** DevArchitechs
**Versiyon:** 1.0
**Tarih:** Mart 2026

---

## 1. Genel Bakış

SmartScheduler, üniversite ders programlarını **genetik algoritma** kullanarak otomatik oluşturan bir web uygulamasıdır. Sistem, **çok katmanlı (N-Tier) mimari** prensibiyle tasarlanmıştır. Her katman, kendisinden bir alttaki katmanla iletişim kurar ve sorumluluklar net şekilde ayrılmıştır.

## 2. Mimari Prensipler

- **Separation of Concerns (SoC):** Her katman tek bir sorumluluğa sahiptir.
- **Dependency Inversion:** Üst katmanlar alt katmanların somut implementasyonlarına değil, soyutlamalarına bağlıdır.
- **DRY (Don't Repeat Yourself):** Tekrar eden kod parçaları ortak servislere çıkarılır.
- **SOLID:** Tüm sınıflar SOLID prensiplerine uygun yazılır.
- **Clean Architecture:** Domain katmanı dış bağımlılıklardan izole tutulur.

## 3. Katman Detayları

### 3.1 Presentation Layer (Frontend)

**Teknoloji:** Next.js 14 (App Router) + TypeScript + Tailwind CSS

**Sorumluluklar:**
- Kullanıcı arayüzünün sunulması
- Form validasyonu (client-side)
- API ile HTTP/JSON üzerinden iletişim
- Authentication token yönetimi (HttpOnly cookie)
- Responsive tasarım (mobile-first)

**Önemli Bileşenler:**
- Dashboard (yönetici paneli)
- Calendar View (FullCalendar.js entegrasyonu)
- Course/Instructor/Classroom CRUD ekranları
- Schedule generation wizard
- PDF/Excel export

### 3.2 API Layer (Backend Web API)

**Teknoloji:** ASP.NET Core 8 Web API

**Sorumluluklar:**
- HTTP request/response yönetimi
- Routing ve endpoint tanımlama
- Request validasyonu (DTO + FluentValidation)
- Authentication & Authorization (JWT)
- Exception handling (global middleware)
- API versiyonlama
- Swagger/OpenAPI dokümantasyonu

**Ana Controller'lar:**
- `AuthController` — Login, register, token refresh
- `CoursesController` — Ders CRUD
- `InstructorsController` — Hoca CRUD ve müsaitlik
- `ClassroomsController` — Sınıf CRUD
- `ScheduleController` — Program oluşturma, görüntüleme, export

### 3.3 Business Logic Layer

**Teknoloji:** C# (Pure .NET, framework-bağımsız)

**Sorumluluklar:**
- İş kurallarının uygulanması
- Genetik algoritma motorunun çalıştırılması
- Constraint engine yönetimi
- Domain validation (örn. "bir ders maksimum 4 kez tekrarlanabilir")

**Önemli Servisler:**
- `IScheduleGeneratorService` — Program oluşturma orkestrasyonu
- `IGeneticAlgorithmEngine` — GA motor implementasyonu
- `IConstraintValidator` — Sert/yumuşak kısıt kontrolü
- `IFitnessFunctionService` — Çözüm kalitesi hesaplama

#### Genetik Algoritma Detayları

**Kromozom Yapısı:** Her gen bir `(Course, Classroom, TimeSlot)` üçlüsünü temsil eder.

**Sert Kısıtlar (kesinlikle ihlal edilemez):**
1. Aynı hoca aynı zaman diliminde iki derse atanamaz
2. Aynı sınıf aynı zaman diliminde iki derse verilemez
3. Aynı öğrenci grubu aynı zaman diliminde iki dersi alamaz
4. Sınıf kapasitesi öğrenci sayısından büyük olmalı
5. Lab gerektiren dersler lab donanımlı sınıflara atanmalı

**Yumuşak Kısıtlar (skor bazlı optimizasyon):**
1. Hoca tercih ettiği zaman dilimlerinde ders vermeli
2. Öğle arası boşluk korunmalı
3. Ardışık dersler farklı binalarda olmamalı
4. Hocanın günlük ders yükü dengeli olmalı

**Operatörler:**
- **Selection:** Tournament Selection (k=3)
- **Crossover:** Order Crossover (OX) — %85 olasılık
- **Mutation:** Swap Mutation — %5 olasılık
- **Elitism:** En iyi %10 doğrudan bir sonraki nesle geçer

**Sonlandırma Kriteri:** 1000 nesil **VEYA** son 100 nesilde fitness değeri değişmiyor.

### 3.4 Data Access Layer (DAL)

**Teknoloji:** Entity Framework Core 8 + Repository Pattern

**Sorumluluklar:**
- Veritabanı CRUD operasyonları
- LINQ sorguları
- Migration yönetimi
- Transaction yönetimi (Unit of Work pattern)

**Repository Yapısı:**
- `IRepository<T>` — Generic base interface
- `IUnitOfWork` — Transaction yönetimi
- Spesifik repository'ler: `ICourseRepository`, `IInstructorRepository`, vs.

### 3.5 Database Layer

**Teknoloji:** PostgreSQL 16

**Tablolar:** Bkz. [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)

**İndexleme Stratejisi:**
- Foreign key sütunlarına otomatik index
- `Courses(Code)` — UNIQUE
- `Users(Email)` — UNIQUE
- `Schedules(Semester, ClassroomId, TimeSlotId)` — composite

## 4. Cross-Cutting Concerns

### 4.1 Authentication & Authorization

- **Yöntem:** JWT Bearer Token
- **Token süresi:** 1 saat (access), 7 gün (refresh)
- **Roller:** Admin, DepartmentHead, Instructor, Viewer

### 4.2 Logging

- **Kütüphane:** Serilog
- **Hedefler:** Console (development), File + Seq (production)
- **Log Seviyeleri:** Information, Warning, Error, Fatal

### 4.3 Error Handling

- Global exception middleware ile tüm hatalar yakalanır
- Production'da generic error mesajları, development'ta detaylı stack trace

### 4.4 Validation

- **API Layer:** FluentValidation ile DTO doğrulama
- **Frontend:** Zod schema validation

### 4.5 Caching

- **Tool:** In-memory caching (IMemoryCache)
- **Hedef:** Frequently accessed data (sınıflar, hocalar)
- **Invalidation:** Write operasyonlarda manuel temizleme

## 5. Deployment Mimarisi

```
┌──────────────────┐     ┌──────────────────┐
│  Vercel (CDN)    │     │  Railway / Azure │
│  Next.js Frontend│────▶│  ASP.NET Core API│
└──────────────────┘     └────────┬─────────┘
                                  │
                         ┌────────▼─────────┐
                         │ PostgreSQL 16    │
                         │ (Railway/Supabase)│
                         └──────────────────┘
```

## 6. Geliştirme Süreci

- **Metodoloji:** Scrum (Agile)
- **Sprint:** 1 hafta
- **Toplam:** 8 sprint
- **Daily Standup:** 10:00 (Discord)
- **Sprint Review + Retro:** Cuma sonu
- **Görev Takibi:** Trello

## 7. Sürüm Yönetimi

- **Branching:** GitFlow
  - `main` — production
  - `develop` — geliştirme
  - `feature/*` — yeni özellikler
  - `hotfix/*` — acil düzeltmeler
- **Commit Convention:** Conventional Commits (`feat:`, `fix:`, `docs:`, vs.)
- **Code Review:** Her PR en az 1 onay gerektirir

## 8. Test Stratejisi

| Test Türü | Araç | Hedef Coverage |
|-----------|------|----------------|
| Unit Test | xUnit + Moq | %70+ |
| Integration Test | xUnit + WebApplicationFactory | Kritik akışlar |
| E2E Test | Playwright | Ana kullanıcı senaryoları |
| Frontend Unit | Jest + RTL | %60+ |

---

**Hazırlayan:** DevArchitechs
**Son Güncelleme:** Sprint 1 (Mart 2026)
