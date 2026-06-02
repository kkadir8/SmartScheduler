# SmartScheduler

> AI Destekli Akıllı Ders Programı Oluşturucu

[![.NET](https://img.shields.io/badge/.NET-9.0-512BD4)](https://dotnet.microsoft.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14-000000)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Status](https://img.shields.io/badge/status-Sprint%204%20↗-green)]()
[![CI](https://github.com/kkadir8/SmartScheduler/actions/workflows/ci.yml/badge.svg)](https://github.com/kkadir8/SmartScheduler/actions/workflows/ci.yml)

**Ekip:** DevArchitechs | **Ders:** Yazılım Projesi Geliştirme 2025-2026 Bahar | **Metodoloji:** Scrum (4 Sprint)  
**Görev Takibi:** [Trello Board](https://trello.com/b/Ephz3yhd/smartscheduler-devarchitechs)

---

## Proje Hakkında

SmartScheduler, üniversitelerde ders programı oluşturma sürecini otomatikleştiren **genetik algoritma tabanlı** bir optimizasyon platformudur. Hoca müsaitlikleri, sınıf kapasiteleri, ders kısıtları ve program çakışmaları dikkate alınarak en uygun haftalık ders programı üretilir, kaydedilir ve dışa aktarılır.

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

---

## Mimari

```
┌─────────────────────────────────────────┐
│   Presentation Layer (Next.js 14)       │
│   Auth Context · CRUD Modals · Pages    │
└─────────────────┬───────────────────────┘
                  │ REST API + JWT Bearer
┌─────────────────▼───────────────────────┐
│   API Layer (ASP.NET Core 9)            │
│   Controllers · AuthService · JWT       │
└─────────────────┬───────────────────────┘
┌─────────────────▼───────────────────────┐
│   Algorithm Engine (C#)                 │
│   Genetic Algorithm — crossover,        │
│   mutation, fitness, tournament select  │
└─────────────────┬───────────────────────┘
┌─────────────────▼───────────────────────┐
│   Data Access Layer                     │
│   Entity Framework Core 9              │
└─────────────────┬───────────────────────┘
┌─────────────────▼───────────────────────┐
│   PostgreSQL 16                         │
└─────────────────────────────────────────┘
```

---

## Sayfalar

| Route | Açıklama |
|-------|----------|
| `/login` | JWT ile giriş |
| `/register` | Kullanıcı kaydı |
| `/dashboard` | Genel bakış — metrikler, sprint durumu, ekip |
| `/courses` | Ders kataloğu — CRUD (giriş gerekli) |
| `/instructors` | Öğretim görevlileri — CRUD (giriş gerekli) |
| `/classrooms` | Derslikler — CRUD (giriş gerekli) |
| `/schedule` | Program oluşturucu — genetik algoritma |
| `/whatif` | What-if analizi — gün kapatma ve senaryo karşılaştırma |
| `/saved` | Kayıtlı programlar — listele, aktif et, sil |
| `/constraints` | Ders–derslik kısıt tanımları |

---

## API Endpoint'leri

```
# Auth
POST /api/auth/register     → Kayıt
POST /api/auth/login        → Giriş (JWT döner)

# Courses
GET    /api/courses         → Ders listesi
POST   /api/courses         → Ders ekle        [Authorize]
PUT    /api/courses/{id}    → Ders güncelle     [Authorize]
DELETE /api/courses/{id}    → Ders sil          [Authorize]

# Instructors
GET    /api/instructors
POST   /api/instructors                         [Authorize]
PUT    /api/instructors/{id}                    [Authorize]
DELETE /api/instructors/{id}                    [Authorize]

# Classrooms
GET    /api/classrooms
POST   /api/classrooms                          [Authorize]
PUT    /api/classrooms/{id}                     [Authorize]
DELETE /api/classrooms/{id}                     [Authorize]

# Constraints
GET    /api/constraints                         → Kısıt listesi
POST   /api/constraints                         [Authorize]
DELETE /api/constraints/{id}                    [Authorize]

# Saved Schedules
GET    /api/schedule/list                       → Kayıtlı programlar
GET    /api/schedule/{id}                       → Program detayı
POST   /api/schedule/save                       [Authorize]
PUT    /api/schedule/{id}/activate              [Authorize]
PATCH  /api/schedule/{scheduleId}/entries/{entryId} [Authorize]
DELETE /api/schedule/{id}                       [Authorize]

# Instructor Availability
GET    /api/instructors/{id}/availability       → Müsaitlik takvimi
PUT    /api/instructors/{id}/availability       [Authorize]

# Schedule
POST   /api/schedule/generate                   [Authorize]
POST   /api/schedule/whatif                     [Authorize]
→ Genetik algoritma ile program üretir

# Export
GET    /api/export/courses/excel                → Dersler Excel
GET    /api/export/instructors/excel            → Hocalar Excel
GET    /api/export/classrooms/excel             → Derslikler Excel
GET    /api/export/schedules/{id}/pdf            → Program PDF
GET    /api/export/schedules/{id}/excel          → Program Excel

# System
GET    /api/health          → Sistem durumu
```

---

## Teknoloji Stack

| Katman | Teknoloji |
|--------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | ASP.NET Core 9, C# |
| Authentication | JWT Bearer Token, BCrypt |
| ORM | Entity Framework Core 9 |
| Algoritma | Genetik Algoritma (crossover, mutation, fitness) |
| Veritabanı | PostgreSQL 16 |
| API Dokümantasyon | Swagger / OpenAPI |
| Container | Docker + Docker Compose |
| CI/CD | GitHub Actions |

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
│   │   ├── Algorithm/        # Gene, Chromosome, ScheduleResult
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
│   ├── Data/                 # AppDbContext
│   ├── Migrations/
│   └── Program.cs
├── smartscheduler-frontend/
│   ├── app/
│   │   ├── (auth)/           # login, register
│   │   ├── (main)/           # dashboard, courses, instructors, classrooms, schedule, whatif, saved, constraints
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── modals/           # CourseModal, InstructorModal, ClassroomModal, AvailabilityModal
│   │   ├── CalendarView.tsx
│   │   ├── ApiError.tsx
│   │   ├── MetricCard.tsx
│   │   ├── Sidebar.tsx
│   │   ├── StatusBadge.tsx
│   │   └── Topbar.tsx
│   ├── context/              # AuthContext (JWT)
│   ├── hooks/                # useCourses, useInstructors, useClassrooms
│   ├── lib/
│   │   ├── api.ts            # Merkezi API istemcisi (apiFetch)
│   │   └── constants.ts
│   ├── types/                # Ortak TypeScript tipleri
│   └── middleware.ts
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
| Sprint 1 | Kurulum · PostgreSQL · API · Frontend | ✅ Tamamlandı |
| Sprint 2 | JWT Auth · CRUD · Repository · Genetik Algoritma | ✅ Tamamlandı |
| Sprint 3 | Kısıtlar · Müsaitlik · Takvim · API Hata Yönetimi · Test | ✅ Tamamlandı |
| Sprint 4 | What-if · Kayıtlı Programlar · Export · Final Demo | 🔄 Devam Ediyor |

### Sprint 3 Tamamlanan Özellikler
- ✅ Kısıt sayfası — ders–derslik eşleştirme UI
- ✅ Kısıt API endpoint'leri (GET / POST / DELETE)
- ✅ Hoca müsaitlik takvimi (AvailabilityModal — haftalık grid)
- ✅ Haftalık program takvim görünümü
- ✅ What-if analizi — gün bazlı senaryo üretimi
- ✅ Kayıtlı programlar — listeleme, aktif etme, silme
- ✅ Program export — PDF ve Excel indirme
- ✅ Merkezi API istemcisi (`lib/api.ts` — apiFetch + 401 yönetimi)
- ✅ Modal satır içi hata bildirimleri
- ✅ Genetik algoritma fitness score & nesil sayısı görselleştirme
- ✅ Test senaryoları yazımı (TS-01..TS-15)

---

## Ekip — DevArchitechs

| İsim | Rol | Sorumluluk |
|------|-----|------------|
| Abdulkadir Gedik | Product Owner | Genetik algoritma, what-if ve koordinasyon |
| Yunus Emre Edizer | Scrum Master | Backend Lead — Auth, CRUD, Export API |
| Emin Akif Erzurumlu | Developer | Frontend Lead — UI, Auth, Modals, Saved/What-if |
| Hamza Hakverir | Developer | Veritabanı, repository ve şema |
| Burak Kürkçü | Developer | DevOps, test ve entegrasyon |

---

## Dokümantasyon

- [Mimari Tasarım](docs/ARCHITECTURE.md)
- [Veritabanı Şeması](docs/DATABASE_SCHEMA.md)
- [Test Senaryoları](docs/TEST_SCENARIOS.md)
- [API Dokümantasyonu](http://localhost:5001/swagger) (Docker ile çalışırken)

---

**SmartScheduler** by **DevArchitechs** • Yazılım Projesi Geliştirme • 2025-2026 Bahar
