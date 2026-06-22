# SmartScheduler

> AI Destekli Akıllı Ders Programı Oluşturucu

[![.NET](https://img.shields.io/badge/.NET-9.0-512BD4)](https://dotnet.microsoft.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14-000000)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791)](https://www.postgresql.org/)
[![Tests](https://img.shields.io/badge/tests-64%2F64%20passing-brightgreen)]()
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Status](https://img.shields.io/badge/status-Sprint%204%20Final%20✅-brightgreen)]()
[![CI](https://github.com/kkadir8/SmartScheduler/actions/workflows/ci.yml/badge.svg)](https://github.com/kkadir8/SmartScheduler/actions/workflows/ci.yml)

**Ekip:** DevArchitechs | **Ders:** Yazılım Projesi Geliştirme 2025-2026 Bahar | **Metodoloji:** Scrum (4 Sprint)  
**Görev Takibi:** [Trello Board](https://trello.com/b/Ephz3yhd/smartscheduler-devarchitechs)

---

## Proje Hakkında

SmartScheduler, üniversitelerde ders programı oluşturma sürecini otomatikleştiren **genetik algoritma tabanlı** bir optimizasyon platformudur. Hoca müsaitlikleri, sınıf kapasiteleri, ders kısıtları ve program çakışmaları dikkate alınarak en uygun haftalık ders programı üretilir, kaydedilir ve dışa aktarılır.

Sprint 4 itibarıyla **bölüm bazlı program oluşturma**, **what-if analizi**, **kayıtlı programlar** ve **PDF/Excel dışa aktarma** özellikleri tamamlanmıştır.

---

## Hızlı Başlangıç

### Docker ile (Önerilen)
```bash
docker compose up --build
# Frontend → http://localhost:3000
# API      → http://localhost:5001/swagger
```

### Manuel

**Backend (ASP.NET Core 9)**
```bash
cd SmartScheduler.API
dotnet run
# → http://localhost:5000  (Swagger UI)
```

**Frontend (Next.js 14)**
```bash
cd smartscheduler-frontend
npm install
npm run dev
# → http://localhost:3000
```

**Veritabanı Kurulumu**
```bash
cd SmartScheduler.API
dotnet ef database update
# Seed verisi otomatik yüklenir: 15 hoca, 20 ders, 15 derslik, 21 kısıt
```

**Testler**
```bash
cd SmartScheduler.Tests
dotnet test
# 64/64 test geçiyor (~2 saniye)
```

---

## Mimari

```
┌──────────────────────────────────────────────────────┐
│              KULLANICI (Web Tarayıcı)                │
└───────────────────────┬──────────────────────────────┘
                        │ HTTP/HTTPS
┌───────────────────────▼──────────────────────────────┐
│          FRONTEND KATMANI (Next.js 14)               │
│  App Router · AuthContext · CRUD Modals · CalendarView│
└───────────────────────┬──────────────────────────────┘
                        │ REST API + JWT Bearer
┌───────────────────────▼──────────────────────────────┐
│          API KATMANI (ASP.NET Core 9)                │
│  Controllers · AuthService · JWT · Export            │
└──────────────┬────────────────────┬──────────────────┘
               │                    │
┌──────────────▼──────────┐  ┌──────▼────────────────────┐
│   VERİTABANI KATMANI   │  │     ALGORİTMA MOTORU      │
│   EF Core 9 + Postgres  │  │  Genetik Algoritma (C#)   │
│   8 migration           │  │  Fitness · Selection ·    │
│   Seed: 15 hoca / 20 d. │  │  Crossover · Mutation     │
└─────────────────────────┘  └───────────────────────────┘
```

---

## Sayfalar

| Route | Açıklama |
|-------|----------|
| `/login` | JWT ile giriş |
| `/register` | Kullanıcı kaydı |
| `/dashboard` | Genel bakış — metrikler, sprint durumu, ekip |
| `/courses` | Ders kataloğu — CRUD (giriş gerekli) |
| `/instructors` | Öğretim görevlileri — CRUD + müsaitlik takvimi (giriş gerekli) |
| `/classrooms` | Derslikler — CRUD (giriş gerekli) |
| `/constraints` | Ders–derslik kısıt tanımları |
| `/schedule` | Program oluşturucu — bölüm seçimi + genetik algoritma |
| `/whatif` | What-if analizi — gün kapatma ve senaryo karşılaştırma |
| `/saved` | Kayıtlı programlar — listele, aktif et, sil |

---

## API Endpoint'leri

### Auth
| Metod | Endpoint | Auth | Açıklama |
|-------|----------|------|----------|
| POST | `/api/auth/register` | — | Kullanıcı kaydı |
| POST | `/api/auth/login` | — | Giriş (JWT döner) |

### Courses
| Metod | Endpoint | Auth | Açıklama |
|-------|----------|------|----------|
| GET | `/api/courses` | — | Ders listesi |
| GET | `/api/courses/{id}` | — | Ders detayı |
| POST | `/api/courses` | JWT | Ders ekle |
| PUT | `/api/courses/{id}` | JWT | Ders güncelle |
| DELETE | `/api/courses/{id}` | JWT | Ders sil |

### Instructors
| Metod | Endpoint | Auth | Açıklama |
|-------|----------|------|----------|
| GET | `/api/instructors` | — | Hoca listesi |
| GET | `/api/instructors/{id}` | — | Hoca detayı |
| POST | `/api/instructors` | JWT | Hoca ekle |
| PUT | `/api/instructors/{id}` | JWT | Hoca güncelle |
| DELETE | `/api/instructors/{id}` | JWT | Hoca sil |
| GET | `/api/instructors/{id}/availability` | — | Müsaitlik takvimi |
| PUT | `/api/instructors/{id}/availability` | JWT | Müsaitlik güncelle |
| PUT | `/api/instructors/{id}/courses` | JWT | Ders ataması |

### Classrooms
| Metod | Endpoint | Auth | Açıklama |
|-------|----------|------|----------|
| GET | `/api/classrooms` | — | Derslik listesi |
| GET | `/api/classrooms/{id}` | — | Derslik detayı |
| POST | `/api/classrooms` | JWT | Derslik ekle |
| PUT | `/api/classrooms/{id}` | JWT | Derslik güncelle |
| DELETE | `/api/classrooms/{id}` | JWT | Derslik sil |

### Constraints
| Metod | Endpoint | Auth | Açıklama |
|-------|----------|------|----------|
| GET | `/api/constraints` | — | Kısıt listesi |
| GET | `/api/constraints/course/{id}` | — | Kursa ait kısıtlar |
| POST | `/api/constraints` | JWT | Kısıt ekle (409 mükerrer) |
| DELETE | `/api/constraints/{id}` | JWT | Kısıt sil |

### Schedule
| Metod | Endpoint | Auth | Açıklama |
|-------|----------|------|----------|
| POST | `/api/schedule/generate` | JWT | Program üret (opsiyonel `department` filtresi) |
| POST | `/api/schedule/whatif` | JWT | What-if analizi |
| POST | `/api/schedule/save` | JWT | Programı kaydet |
| GET | `/api/schedule/list` | — | Kayıtlı programlar |
| GET | `/api/schedule/{id}` | — | Program detayı |
| PUT | `/api/schedule/{id}/activate` | JWT | Programı aktifleştir |
| PATCH | `/api/schedule/{scheduleId}/entries/{entryId}` | JWT | Entry güncelle |
| DELETE | `/api/schedule/{id}` | JWT | Program sil |

### Export
| Metod | Endpoint | Auth | Açıklama |
|-------|----------|------|----------|
| GET | `/api/export/schedules/{id}/pdf` | — | Program PDF |
| GET | `/api/export/schedules/{id}/excel` | — | Program Excel |
| GET | `/api/export/courses/excel` | — | Dersler Excel |
| GET | `/api/export/instructors/excel` | — | Hocalar Excel |
| GET | `/api/export/classrooms/excel` | — | Derslikler Excel |

### System
| Metod | Endpoint | Auth | Açıklama |
|-------|----------|------|----------|
| GET | `/api/health` | — | Sistem sağlık kontrolü |

---

## Genetik Algoritma

### Kromozom Temsili
```
Kromozom = [ Gene(Ders, Derslik, Gün, Saat, Süre), ... ]
```
Her gen bir dersin haftalık oturum yerleşimini temsil eder. `DurationHours` alanı Sprint 4'te eklendi (1–6 saat arası değişken süre).

### Fitness Fonksiyonu
```
Fitness = 1 / (1 + Σ(ihlal × ağırlık))
```

| Kısıt Türü | Örnek | Ağırlık |
|------------|-------|---------|
| Hard | Hoca aynı anda iki ders | Yüksek |
| Hard | Derslik kapasitesi yetersiz | Yüksek |
| Hard | Derslik aynı anda iki ders | Yüksek |
| Soft | Hoca müsaitlik tercihi | Düşük |

### Algoritma Parametreleri

| Parametre | Değer |
|-----------|-------|
| Popülasyon büyüklüğü | 50 |
| Maksimum nesil | 200 |
| Çaprazlama oranı | 0.80 |
| Başlangıç mutasyon oranı | 0.02 |
| Maksimum mutasyon oranı | 0.20 |
| Seçim yöntemi | Tournament Selection |
| Stagnasyon limiti | max(40, dersCount × 3) |

### Bölüm Filtresi (Sprint 4)
```csharp
GenerateScheduleAsync(string? department = null, WhatIfOptions? options = null)
// department = null  → tüm bölümlerin dersleri
// department = "BM"  → sadece BM hocalarına atanmış dersler
```

---

## Teknoloji Stack

| Katman | Teknoloji | Versiyon |
|--------|-----------|----------|
| Frontend | Next.js, TypeScript, Tailwind CSS, Lucide React | 14 / 5 / 3.4 |
| Backend | ASP.NET Core, C# | 9.0 / 13 |
| Authentication | JWT Bearer Token, BCrypt | — |
| ORM | Entity Framework Core | 9.x |
| Veritabanı | PostgreSQL | 16 |
| Test | xUnit, WebApplicationFactory, EF Core InMemory, FluentAssertions | 2.9 |
| API Docs | Swagger / OpenAPI | 3.0 |
| Container | Docker + Docker Compose | — |
| CI/CD | GitHub Actions | — |

---

## Veritabanı Şeması

**Migration Geçmişi (8 migration)**

| Migration | İçerik |
|-----------|--------|
| `20260506_InitialCreate` | Temel şema |
| `20260512_Sprint2_Auth_CRUD` | Kullanıcı + auth |
| `20260517_Sprint3_Constraints_SeedData` | Kısıtlar + seed |
| `20260520_Sprint3_InstructorAvailability` | Müsaitlik tablosu |
| `20260603_Sprint4_DataFix_CapacityAndAvailability` | Kapasite/müsaitlik veri düzeltmesi |
| `20260603_Sprint4_VariableCourseDuration` | `DurationHours` alanı |
| `20260603_Sprint4_RebalanceInstructorAssignments` | Hoca-ders yeniden dengeleme |
| `20260603_Sprint4_AddDepartmentToSchedule` | `Schedule.Department` alanı |

**Seed Verisi**

| Tablo | Kayıt Sayısı | Not |
|-------|-------------|-----|
| Instructors | 15 | 5 bölüm: BM, EEM, Matematik, YM, Endüstri |
| Courses | 20 | CS301–CS320, 1–4 saatlik dersler |
| Classrooms | 15 | D-101, LAB-1..4, AMFİ-1..2 vb. |
| Constraints | 21 | Lab/kapasite kısıtları |
| InstructorAvailabilities | 60 | Hoca 1 ve 3 için tam hafta |
| Users | 0 | API ile oluşturulur |
| Schedules | 0 | API ile oluşturulur |

---

## Test Mimarisi

**64/64 test geçiyor — %100 başarı**

```
SmartScheduler.Tests/
├── Infrastructure/
│   ├── TestWebApplicationFactory.cs   — WebApplicationFactory, in-memory DB override
│   └── TestDataSeeder.cs              — Admin kullanıcısı ve test programı seed
├── Unit/                              — 15 test
│   ├── ConflictDetectionTests.cs      — Gene/Chromosome çakışma mantığı (UT-01..10)
│   └── GeneticAlgorithmServiceTests.cs — GA servis davranışları (UT-11..15)
├── Integration/                       — 39 test
│   ├── AuthTests.cs                   — TS-01..05
│   ├── CoursesAndClassroomsTests.cs   — TS-06..10
│   ├── ConstraintsTests.cs            — TS-11..14
│   ├── ScheduleTests.cs               — TS-15..22
│   └── ExportTests.cs                 — PDF/Excel export
└── Security/                          — 10 test
    └── SecurityTests.cs               — JWT, SQL injection, XSS (SEC-01..10)
```

| Kategori | Test Sayısı | Kapsam |
|----------|------------|--------|
| Birim | 15 | Çakışma tespiti, GA servis davranışları |
| Entegrasyon | 39 | Tüm API endpoint'leri, uçtan uca HTTP akışı |
| Güvenlik | 10 | JWT süresi, SQL injection, XSS, BCrypt |
| **Toplam** | **64** | **%100 geçiyor** |

---

## Klasör Yapısı

```
SmartScheduler/
├── SmartScheduler.API/
│   ├── Controllers/
│   │   ├── AuthController.cs
│   │   ├── CoursesController.cs
│   │   ├── InstructorsController.cs
│   │   ├── ClassroomsController.cs
│   │   ├── ConstraintsController.cs
│   │   ├── ExportController.cs
│   │   └── ScheduleController.cs
│   ├── DTOs/
│   │   ├── AuthResponse.cs
│   │   ├── LoginRequest.cs
│   │   ├── RegisterRequest.cs
│   │   ├── SaveScheduleRequest.cs
│   │   └── UpdateEntryRequest.cs
│   ├── Models/
│   │   ├── Algorithm/            # Gene, Chromosome, ScheduleResult
│   │   ├── AppUser.cs
│   │   ├── Classroom.cs
│   │   ├── Constraint.cs
│   │   ├── Course.cs
│   │   ├── Instructor.cs
│   │   ├── InstructorAvailability.cs
│   │   ├── Schedule.cs
│   │   └── ScheduleEntry.cs
│   ├── Services/
│   │   ├── AuthService.cs
│   │   ├── ExportService.cs
│   │   └── GeneticAlgorithmService.cs
│   ├── Services/Interfaces/
│   │   ├── IAuthService.cs
│   │   ├── IExportService.cs
│   │   └── IGeneticAlgorithmService.cs
│   ├── Data/                     # AppDbContext
│   ├── Migrations/               # 8 migration
│   └── Program.cs
├── smartscheduler-frontend/
│   ├── app/
│   │   ├── (auth)/               # login, register
│   │   ├── (main)/               # dashboard, courses, instructors, classrooms,
│   │   │                         # schedule, whatif, saved, constraints
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── modals/               # CourseModal, InstructorModal, ClassroomModal,
│   │   │                         # AvailabilityModal, CourseDetailModal,
│   │   │                         # InstructorCoursesModal
│   │   ├── CalendarView.tsx
│   │   ├── ApiError.tsx
│   │   ├── MetricCard.tsx
│   │   ├── SelectMenu.tsx
│   │   ├── Sidebar.tsx
│   │   ├── StatusBadge.tsx
│   │   └── Topbar.tsx
│   ├── context/                  # AuthContext (JWT)
│   ├── hooks/                    # useCourses, useInstructors, useClassrooms
│   ├── lib/
│   │   ├── api.ts                # Merkezi API istemcisi (apiFetch + 401 yönetimi)
│   │   └── constants.ts
│   ├── types/                    # Ortak TypeScript tipleri
│   └── middleware.ts             # Route guard
├── SmartScheduler.Tests/
├── docs/
│   ├── ARCHITECTURE.md
│   ├── DATABASE_SCHEMA.md
│   └── TEST_SCENARIOS.md
└── docker-compose.yml
```

---

## Sprint Durumu

| Sprint | Hedef | Durum |
|--------|-------|-------|
| Sunum 1 | Planlama & Scrum | ✅ Tamamlandı |
| Sprint 1 | Kurulum · PostgreSQL · API temelleri · Frontend iskeleti | ✅ Tamamlandı |
| Sprint 2 | JWT Auth · CRUD · Repository · Genetik Algoritma v1 | ✅ Tamamlandı |
| Sprint 3 | Kısıtlar · Müsaitlik · Takvim görünümü · API hata yönetimi · Test | ✅ Tamamlandı |
| Sprint 4 | What-if · Kayıtlı programlar · Export · Bölüm filtresi · Test suite | ✅ Tamamlandı |

### Sprint 4 Tamamlanan Özellikler
- Bölüm bazlı program oluşturma (department filtresi)
- What-if analizi — gün kapatma ve kilitli atama senaryoları
- Kayıtlı programlar — listeleme, aktifleştirme, silme
- PDF ve Excel dışa aktarma (EPPlus / iTextSharp)
- Değişken ders süresi (1–6 saat, `DurationHours`)
- Hoca-ders yeniden dengeleme (Sprint 4 seed düzeltmesi)
- Tam test suite: 64/64 test (Birim + Entegrasyon + Güvenlik)
- `fitnessPercent` ve `department` alanları API yanıtlarına eklendi

### Sprint 3 Tamamlanan Özellikler
- Kısıt sayfası — ders–derslik eşleştirme UI
- Kısıt API endpoint'leri (GET / POST / DELETE)
- Hoca müsaitlik takvimi (AvailabilityModal — haftalık grid)
- Haftalık program takvim görünümü (CalendarView)
- Merkezi API istemcisi (`lib/api.ts` — apiFetch + 401 yönetimi)
- Modal satır içi hata bildirimleri
- Genetik algoritma fitness score & nesil sayısı görselleştirme
- Test senaryoları yazımı (TS-01..TS-15)

---

## Güvenlik

| Alan | Uygulama |
|------|----------|
| Kimlik Doğrulama | JWT Bearer Token |
| Parola Saklama | BCrypt hash |
| Yetkilendirme | `[Authorize]` decorator (role-based) |
| SQL Injection | EF Core parametreli sorgular |
| XSS | JSON API — ham veri; encode sorumluluğu client'ta |
| CORS | Geliştirmede AllowAll; production'da whitelist önerilir |

---

## Ekip — DevArchitechs

| İsim | Rol | Sorumluluk |
|------|-----|------------|
| Abdulkadir Gedik | Product Owner | Genetik algoritma, what-if analizi ve koordinasyon |
| Yunus Emre Edizer | Scrum Master | Backend Lead — Auth, CRUD, Export API |
| Emin Akif Erzurumlu | Developer | Frontend Lead — UI, Auth Context, Modals, Saved/What-if |
| Hamza Hakverir | Developer | Veritabanı şema tasarımı, EF Core migrations, seed data |
| Burak Kürkçü | Developer | DevOps (Docker/CI), test altyapısı ve 64 test senaryosu |

---

## Dokümantasyon

- [Mimari Tasarım](docs/ARCHITECTURE.md)
- [Veritabanı Şeması](docs/DATABASE_SCHEMA.md)
- [Test Senaryoları](docs/TEST_SCENARIOS.md)
- [API Dokümantasyonu](http://localhost:5001/swagger) *(Docker ile çalışırken)*

---

**SmartScheduler** by **DevArchitechs** · Yazılım Projesi Geliştirme · 2025-2026 Bahar · İstanbul Topkapı Üniversitesi
