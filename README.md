# SmartScheduler

> AI Destekli Akıllı Ders Programı Oluşturucu

[![.NET](https://img.shields.io/badge/.NET-9.0-512BD4)](https://dotnet.microsoft.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14-000000)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Status](https://img.shields.io/badge/status-Sprint%201-orange)]()
[![CI](https://github.com/kkadir8/DevArchitechs/actions/workflows/ci.yml/badge.svg)](https://github.com/kkadir8/DevArchitechs/actions/workflows/ci.yml)

**Ekip:** DevArchitechs | **Ders:** Yazılım Projesi Geliştirme 2025-2026 Bahar | **Metodoloji:** Scrum (4 Sprint)  
**Görev Takibi:** [Trello Board](https://trello.com/b/Ephz3yhd/smartscheduler-devarchitechs)

---

## Proje Hakkında

SmartScheduler, üniversitelerde ders programı oluşturma sürecini otomatikleştiren **genetik algoritma tabanlı** bir optimizasyon platformudur. Hoca müsaitlikleri, sınıf kapasiteleri ve ders çakışmaları gibi kısıtları göz önünde bulundurarak en uygun haftalık ders programını üretir.

---

## Hızlı Başlangıç

### Backend (ASP.NET Core 9)
```bash
# PostgreSQL başlat
brew services start postgresql@16

cd SmartScheduler.API
dotnet run
# → http://localhost:5000  (Swagger UI)
```

### Frontend (Next.js 14)
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
└─────────────────┬───────────────────────┘
                  │ REST API (JSON)
┌─────────────────▼───────────────────────┐
│   API Layer (ASP.NET Core 9)            │
│   Controllers + Service Layer           │
└─────────────────┬───────────────────────┘
┌─────────────────▼───────────────────────┐
│   Algorithm Engine (C#)                 │
│   Genetic Algorithm — Sprint 3          │
└─────────────────┬───────────────────────┘
┌─────────────────▼───────────────────────┐
│   Data Access Layer (EF Core 9)         │
└─────────────────┬───────────────────────┘
┌─────────────────▼───────────────────────┐
│   PostgreSQL 16                         │
└─────────────────────────────────────────┘
```

---

## Sayfalar

| Route | Açıklama |
|-------|----------|
| `/dashboard` | Genel bakış — metrikler, sprint durumu, ekip |
| `/courses` | Ders kataloğu — arama, sıralama |
| `/instructors` | Öğretim görevlileri — kart görünümü |
| `/classrooms` | Derslikler — kapasite barları |
| `/schedule` | Program oluşturucu (Sprint 3) |

---

## API Endpoint'leri

```
GET  /api/health         → Sistem durumu
GET  /api/courses        → Ders listesi (PostgreSQL)
GET  /api/instructors    → Hoca listesi (PostgreSQL)
GET  /api/classrooms     → Sınıf listesi (PostgreSQL)
```

---

## Teknoloji Stack

| Katman | Teknoloji |
|--------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | ASP.NET Core 9, C# |
| ORM | Entity Framework Core 9 |
| Veritabanı | PostgreSQL 16 |
| Authentication | JWT Bearer Token (Sprint 2) |
| API Dokümantasyon | Swagger / OpenAPI |
| Container | Docker + Docker Compose |
| CI/CD | GitHub Actions |

---

## Klasör Yapısı

```
SmartScheduler/
├── SmartScheduler.API/          # Backend API
│   ├── Controllers/
│   ├── Models/
│   ├── Data/                    # AppDbContext
│   ├── Migrations/              # EF Core migrations
│   └── Program.cs
├── smartscheduler-frontend/     # Next.js frontend
│   └── app/
│       ├── dashboard/
│       ├── courses/
│       ├── instructors/
│       ├── classrooms/
│       ├── schedule/
│       └── components/
└── docs/
    ├── ARCHITECTURE.md
    └── DATABASE_SCHEMA.md
```

---

## Sprint Durumu

| Sprint | Hedef | Durum |
|--------|-------|-------|
| Sunum 1 | Planlama & Scrum | ✅ Bitti |
| Sprint 1 | Kurulum & API & Frontend | ✅ Bitti |
| Sprint 2 | Algoritma + CRUD + Auth | ⏳ Yaklaşan |
| Sprint 3 | Dashboard & Takvim & Entegrasyon | ⏳ Yaklaşan |
| Sprint 4 | Test & Deploy & Final Demo | ⏳ Yaklaşan |

---

## Ekip — DevArchitechs

| İsim | Rol | Alan |
|------|-----|------|
| Abdulkadir Gedik | Product Owner | Algoritma & koordinasyon |
| Yunus Emre Edizer | Scrum Master | Backend Lead (.NET) |
| Emin Akif Erzurumlu | Developer | Frontend Lead (Next.js) |
| Hamza Hakverir | Developer | Veritabanı & DAL |
| Burak Kürkçü | Developer | DevOps & Test |

---

## Dokümantasyon

- [Mimari Tasarım](docs/ARCHITECTURE.md)
- [Veritabanı Şeması](docs/DATABASE_SCHEMA.md)
- [API Dokümantasyonu](http://localhost:5000) (uygulama çalışırken)

---

**SmartScheduler** by **DevArchitechs** • Yazılım Projesi Geliştirme • 2025-2026 Bahar.
