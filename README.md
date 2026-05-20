# SmartScheduler

> AI Destekli Akıllı Ders Programı Oluşturucu

[![.NET](https://img.shields.io/badge/.NET-9.0-512BD4)](https://dotnet.microsoft.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14-000000)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Status](https://img.shields.io/badge/status-Sprint%203%20✓-green)]()
[![CI](https://github.com/kkadir8/SmartScheduler/actions/workflows/ci.yml/badge.svg)](https://github.com/kkadir8/SmartScheduler/actions/workflows/ci.yml)

**Ekip:** DevArchitechs | **Ders:** Yazılım Projesi Geliştirme 2025-2026 Bahar | **Metodoloji:** Scrum (4 Sprint)  
**Görev Takibi:** [Trello Board](https://trello.com/b/Ephz3yhd/smartscheduler-devarchitechs)

---

## Proje Hakkında

SmartScheduler, üniversitelerde ders programı oluşturma sürecini otomatikleştiren **genetik algoritma tabanlı** bir optimizasyon platformudur. Hoca müsaitlikleri, sınıf kapasiteleri ve ders çakışmaları gibi kısıtları göz önünde bulundurarak en uygun haftalık ders programını üretir.

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

# Instructor Availability
GET    /api/instructors/{id}/availability       → Müsaitlik takvimi
PUT    /api/instructors/{id}/availability       [Authorize]

# Schedule
POST   /api/schedule/generate                   [Authorize]
→ Genetik algoritma ile program üretir

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
│   │   └── ScheduleController.cs
│   ├── Models/
│   │   ├── Algorithm/        # Gene, Chromosome
│   │   └── Auth/             # LoginRequest, RegisterRequest, AuthResponse
│   ├── Services/
│   │   ├── AuthService.cs
│   │   └── GeneticAlgorithmService.cs
│   ├── Data/                 # AppDbContext
│   ├── Migrations/
│   └── Program.cs
├── smartscheduler-frontend/
│   └── app/
│       ├── login/
│       ├── register/
│       ├── context/          # AuthContext (JWT)
│       ├── components/
│       │   └── modals/       # CourseModal, InstructorModal, ClassroomModal, AvailabilityModal
│       ├── dashboard/
│       ├── courses/
│       ├── instructors/
│       ├── classrooms/
│       ├── constraints/
│       └── schedule/
│   └── lib/
│       └── api.ts            # Merkezi API istemcisi (apiFetch)
├── docs/
│   ├── ARCHITECTURE.md
│   └── DATABASE_SCHEMA.md
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
| Sprint 4 | Deploy · Final Demo | 🔄 Devam Ediyor |

### Sprint 3 Tamamlanan Özellikler
- ✅ Kısıt sayfası — ders–derslik eşleştirme UI
- ✅ Kısıt API endpoint'leri (GET / POST / DELETE)
- ✅ Hoca müsaitlik takvimi (AvailabilityModal — haftalık grid)
- ✅ Haftalık program takvim görünümü
- ✅ Merkezi API istemcisi (`lib/api.ts` — apiFetch + 401 yönetimi)
- ✅ Modal satır içi hata bildirimleri
- ✅ Genetik algoritma fitness score & nesil sayısı görselleştirme
- ✅ Test senaryoları yazımı (TS-01..TS-15)

---

## Ekip — DevArchitechs

| İsim | Rol | Sorumluluk |
|------|-----|------------|
| Abdulkadir Gedik | Product Owner | Genetik algoritma & koordinasyon |
| Yunus Emre Edizer | Scrum Master | Backend Lead — JWT, CRUD API |
| Emin Akif Erzurumlu | Developer | Frontend Lead — UI, Auth, Modals |
| Hamza Hakverir | Developer | Veritabanı & Repository Pattern |
| Burak Kürkçü | Developer | DevOps & Test — CI/CD |

---

## Dokümantasyon

- [Mimari Tasarım](docs/ARCHITECTURE.md)
- [Veritabanı Şeması](docs/DATABASE_SCHEMA.md)
- [Test Senaryoları](docs/TEST_SCENARIOS.md)
- [API Dokümantasyonu](http://localhost:5001/swagger) (Docker ile çalışırken)

---

**SmartScheduler** by **DevArchitechs** • Yazılım Projesi Geliştirme • 2025-2026 Bahar
