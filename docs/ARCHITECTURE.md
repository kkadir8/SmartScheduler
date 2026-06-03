# SmartScheduler — Mimari Tasarım Dokümantasyonu

**Proje:** AI Destekli Akıllı Ders Programı Oluşturucu
**Ekip:** DevArchitechs
**Ders:** Yazılım Projesi Geliştirme — 3. Sınıf Yazılım Mühendisliği
**Dönem:** 2025-2026 Bahar
**Tarih:** Haziran 2026

---

## 1. Proje Özeti

SmartScheduler, üniversite bölümlerinin ders programı oluşturma sürecini otomatikleştiren bir web uygulamasıdır. Sistem; hoca müsaitlikleri, sınıf kapasiteleri, ders kısıtları, kayıtlı programlar ve what-if senaryolarını dikkate alarak **genetik algoritma** tabanlı optimizasyon ile en uygun haftalık ders programını üretir, kaydeder ve dışa aktarır.

Sprint 4'te eklenen **bölüm bazlı program oluşturma** özelliği ile her bölüm kendi ders programını bağımsız olarak üretebilmektedir.

### Hedef Kullanıcı
- Üniversite bölüm sekreterleri
- Bölüm yöneticileri ve akademik koordinatörler

---

## 2. Sistem Mimarisi

```
┌─────────────────────────────────────────────────────────────┐
│                        KULLANICI                            │
│                    (Web Tarayıcı)                           │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/HTTPS
┌──────────────────────▼──────────────────────────────────────┐
│                   FRONTEND KATMANI                          │
│   Next.js 14 App Router                                     │
│   Route groups: (auth) / (main)                             │
│   Components: Sidebar, Topbar, Modals, CalendarView         │
│   Custom SelectMenu, CourseDetailModal, InstructorCoursesModal│
└──────────────────────┬──────────────────────────────────────┘
                       │ REST API (JSON)
                       │ http://localhost:5000/api/*
┌──────────────────────▼──────────────────────────────────────┐
│                   BACKEND KATMANI                           │
│   ASP.NET Core 9 Web API                                    │
│   Controllers + DTOs + Service Interfaces                   │
│   Auth, CRUD, Schedule (bölüm bazlı), What-if, Export       │
└──────────┬──────────────────────┬───────────────────────────┘
           │                      │
┌──────────▼──────────┐  ┌────────▼────────────────────────────┐
│  VERİTABANI KATMANI │  │      ALGORİTMA MOTORU               │
│  PostgreSQL 16      │  │  Genetik Algoritma (C#)             │
│  EF Core Code-First  │  │  - Bölüm filtreli kurs yükleme     │
│  Users, Schedules   │  │  - Fitness & conflict scoring       │
│  + Department sütunu│  │  - Crossover + Mutasyon + Select   │
└─────────────────────┘  └─────────────────────────────────────┘
```

---

## 3. Katman Mimarisi (Layered Architecture)

```
SmartScheduler.API/
├── Controllers/          → Auth, CRUD, Schedule, Export, Health
├── DTOs/                 → Login/Register, Save/Update payload'ları
├── Models/               → Entity ve algoritma modelleri
├── Services/             → Auth, Export, Genetic Algorithm
├── Services/Interfaces/  → Servis sözleşmeleri
├── Data/                 → AppDbContext
└── Migrations/           → EF Core migration'ları (8 adet)

SmartScheduler.Tests/
├── Infrastructure/       → TestWebApplicationFactory, TestDataSeeder
├── Unit/                 → Çakışma tespiti, GA servis testleri
├── Integration/          → API endpoint'leri (WebApplicationFactory + InMemory DB)
└── Security/             → JWT, auth, SQL injection, XSS testleri

smartscheduler-frontend/
├── app/
│   ├── (auth)/           → login, register
│   ├── (main)/           → dashboard, courses, instructors, classrooms
│   │                       schedule (bölüm seçimi), saved, whatif, constraints
│   ├── layout.tsx        → Root layout (AuthProvider)
│   └── page.tsx          → Redirect / landing
├── components/           → Sidebar, Topbar, CalendarView, modals, SelectMenu
├── context/              → AuthContext (JWT)
├── hooks/                → useCourses, useInstructors, useClassrooms
├── lib/                  → api.ts, constants.ts
├── types/                → Ortak TypeScript tipleri
└── middleware.ts         → route guard
```

---

## 4. Teknoloji Stack

### Frontend
| Teknoloji | Versiyon | Kullanım Amacı |
|-----------|----------|----------------|
| Next.js | 14.x | React framework, App Router, route groups |
| TypeScript | 5.x | Tip güvenliği |
| Tailwind CSS | 3.4 | Utility-first CSS |
| Lucide React | latest | İkon kütüphanesi |
| Inter | Google Fonts | Arayüz yazı tipi |

### Backend
| Teknoloji | Versiyon | Kullanım Amacı |
|-----------|----------|----------------|
| ASP.NET Core | 9.0 | Web API framework |
| C# | 13 | Backend dili |
| Entity Framework Core | 9.x | ORM, Code-First migrations |
| Swagger / OpenAPI | 3.0 | API dokümantasyonu |

### Test
| Teknoloji | Versiyon | Kullanım Amacı |
|-----------|----------|----------------|
| xUnit | 2.9 | Test framework |
| Microsoft.AspNetCore.Mvc.Testing | 9.0.4 | WebApplicationFactory |
| EF Core InMemory | 9.0.4 | Test veritabanı (PostgreSQL yerine) |
| FluentAssertions | 6.12 | Okunabilir assertion'lar |

### Veritabanı & Altyapı
| Teknoloji | Versiyon | Kullanım Amacı |
|-----------|----------|----------------|
| PostgreSQL | 16 | Ana veritabanı |
| Docker | latest | Konteynerizasyon |
| GitHub Actions | - | CI/CD pipeline |

---

## 5. Veritabanı Şeması

```
┌──────────────┐     ┌─────────────────┐     ┌──────────────┐
│  Instructor  │     │     Course      │     │  Classroom   │
├──────────────┤     ├─────────────────┤     ├──────────────┤
│ Id (PK)      │◄────│ Id (PK)         │     │ Id (PK)      │
│ Name         │     │ Code (UNIQUE)   │     │ Name         │
│ Title        │     │ Name            │     │ Building     │
│ Department   │     │ Credit          │     │ Capacity     │
│ Email        │     │ DurationHours   │     │ HasLab       │
│ CreatedAt    │     │ StudentCount    │     │ HasProjector │
└──────────────┘     │ InstructorId(FK)│     │ CreatedAt    │
                     │ CreatedAt       │     └──────┬───────┘
                     └────────┬────────┘            │
                              │                     │
                     ┌────────▼─────────────────────▼───────┐
                     │          ScheduleEntry               │
                     ├──────────────────────────────────────┤
                     │ Id (PK)                              │
                     │ CourseId (FK)                        │
                     │ ClassroomId (FK)                     │
                     │ DayOfWeek  (0=Pzt … 4=Cum)          │
                     │ StartHour  (8 … 18)                  │
                     │ DurationHours                        │
                     │ ScheduleId (FK)                      │
                     └──────────────┬───────────────────────┘
                                    │
                     ┌──────────────▼───────────────────────┐
                     │             Schedule                  │
                     ├──────────────────────────────────────┤
                     │ Id (PK)                              │
                     │ Name                                 │
                     │ Semester   (ör. "2025-2026 Bahar")   │
                     │ Department ← Sprint 4 eklendi        │
                     │ IsActive                             │
                     │ GeneratedAt                          │
                     │ FitnessScore                         │
                     └──────────────────────────────────────┘
```

---

## 6. API Endpoint'leri

### Auth
| Method | Endpoint | Auth | Açıklama |
|--------|----------|------|----------|
| POST | `/api/auth/register` | — | Kullanıcı kaydı |
| POST | `/api/auth/login` | — | JWT ile giriş |

### Courses
| Method | Endpoint | Auth | Açıklama |
|--------|----------|------|----------|
| GET | `/api/courses` | — | Tüm dersleri listele |
| GET | `/api/courses/{id}` | — | Ders detayı |
| POST | `/api/courses` | JWT | Yeni ders ekle |
| PUT | `/api/courses/{id}` | JWT | Ders güncelle |
| DELETE | `/api/courses/{id}` | JWT | Ders sil |

### Instructors
| Method | Endpoint | Auth | Açıklama |
|--------|----------|------|----------|
| GET | `/api/instructors` | — | Tüm hocaları listele |
| GET | `/api/instructors/{id}` | — | Hoca detayı |
| POST | `/api/instructors` | JWT | Yeni hoca ekle |
| PUT | `/api/instructors/{id}` | JWT | Hoca güncelle |
| DELETE | `/api/instructors/{id}` | JWT | Hoca sil |
| GET | `/api/instructors/{id}/availability` | — | Müsaitlik getir |
| PUT | `/api/instructors/{id}/availability` | JWT | Müsaitlik güncelle |
| PUT | `/api/instructors/{id}/courses` | JWT | Ders ataması |

### Classrooms
| Method | Endpoint | Auth | Açıklama |
|--------|----------|------|----------|
| GET | `/api/classrooms` | — | Tüm derslikleri listele |
| GET | `/api/classrooms/{id}` | — | Derslik detayı |
| POST | `/api/classrooms` | JWT | Yeni derslik ekle |
| PUT | `/api/classrooms/{id}` | JWT | Derslik güncelle |
| DELETE | `/api/classrooms/{id}` | JWT | Derslik sil |

### Constraints
| Method | Endpoint | Auth | Açıklama |
|--------|----------|------|----------|
| GET | `/api/constraints` | — | Tüm kısıtları listele |
| GET | `/api/constraints/course/{id}` | — | Kursa ait kısıtlar |
| POST | `/api/constraints` | JWT | Yeni kısıt ekle (409 mükerrer) |
| DELETE | `/api/constraints/{id}` | JWT | Kısıt sil |

### Schedule
| Method | Endpoint | Auth | Açıklama |
|--------|----------|------|----------|
| POST | `/api/schedule/generate` | — | Genetik algoritma (opsiyonel `department` filtresi) |
| POST | `/api/schedule/whatif` | — | What-if analizi |
| POST | `/api/schedule/save` | JWT | Programı kaydet (`department` dahil) |
| GET | `/api/schedule/list` | — | Kayıtlı programlar |
| GET | `/api/schedule/{id}` | — | Program detayı |
| PUT | `/api/schedule/{id}/activate` | JWT | Programı aktifleştir |
| DELETE | `/api/schedule/{id}` | JWT | Program sil |
| PATCH | `/api/schedule/{scheduleId}/entries/{entryId}` | JWT | Entry güncelle |

### Export
| Method | Endpoint | Auth | Açıklama |
|--------|----------|------|----------|
| GET | `/api/export/schedules/{id}/excel` | — | Program Excel |
| GET | `/api/export/schedules/{id}/pdf` | — | Program PDF |
| GET | `/api/export/courses/excel` | — | Tüm dersler Excel |
| GET | `/api/export/instructors/excel` | — | Tüm hocalar Excel |
| GET | `/api/export/classrooms/excel` | — | Tüm derslikler Excel |

### System
| Method | Endpoint | Auth | Açıklama |
|--------|----------|------|----------|
| GET | `/api/health` | — | Sistem sağlık kontrolü |

---

## 7. Genetik Algoritma Tasarımı

### Kromozom Temsili
```
Kromozom = [ Gene(Ders₁, Derslik₁, Gün₁, Saat₁, Süre₁), ... ]
```

### Fitness Fonksiyonu
```
Fitness = 1 / (1 + Σ(ihlal × ağırlık))
```

**Hard Constraints (ağırlık yüksek):**
- Aynı hoca aynı anda iki ders veremez
- Aynı derslikte aynı anda iki ders olamaz
- Sınıf kapasitesi öğrenci sayısından küçük olamaz

**Soft Constraints (ağırlık düşük):**
- Hoca müsaitlik tercihleri

### Bölüm Filtresi (Sprint 4)
```csharp
GenerateScheduleAsync(string? department = null, WhatIfOptions? options = null)
// department null → tüm dersler; "BM" → sadece BM hocalarının dersleri
```

### Algoritma Parametreleri
| Parametre | Değer |
|-----------|-------|
| Popülasyon | 50 |
| Maks. nesil | 200 |
| Çaprazlama oranı | 0.80 |
| Başlangıç mutasyon | 0.02 |
| Maks. mutasyon | 0.20 |
| Seçim yöntemi | Tournament Selection |
| Stagnasyon limiti | max(40, dersCount × 3) |

---

## 8. Güvenlik

- **Authentication:** JWT Bearer Token (BCrypt password hash)
- **Authorization:** Role-based (`[Authorize]` decorator)
- **CORS:** AllowAll (geliştirme); production'da whitelist önerilir
- **HTTPS:** Production'da zorunlu
- **ORM Koruması:** EF Core parametreli sorgular → SQL injection önlenir
- **XSS:** Frontend sorumluluğu (JSON API raw veri depolar, HTML encode eden client)

---

## 9. Test Mimarisi

```
┌────────────────────────────────────────────┐
│  SmartScheduler.Tests                       │
│  64 test · 100% pass rate                   │
├────────────────────────────────────────────┤
│  Unit (15 test)                             │
│  └─ Gene/Chromosome conflict detection      │
│  └─ GeneticAlgorithmService (isolate DB)    │
├────────────────────────────────────────────┤
│  Integration (39 test)                      │
│  └─ WebApplicationFactory<Program>         │
│  └─ EF Core InMemory (test DB)             │
│  └─ HasData seed: 20 ders · 15 sınıf       │
│  └─ Custom seed: admin user + test schedule │
├────────────────────────────────────────────┤
│  Security (10 test)                         │
│  └─ JWT expiry/malform · auth boundaries   │
│  └─ SQL injection · XSS server stability   │
└────────────────────────────────────────────┘
```

---

## 10. Sprint Planı

| Sprint | Hedef | Durum |
|--------|-------|-------|
| Sunum 1 | Planlama & Scrum geçişi | ✅ Tamamlandı |
| Sprint 1 | Kurulum & API temelleri & PostgreSQL | ✅ Tamamlandı |
| Sprint 2 | JWT Auth · CRUD · Genetik Algoritma | ✅ Tamamlandı |
| Sprint 3 | Kısıtlar · Müsaitlik · API Hata Yönetimi | ✅ Tamamlandı |
| Sprint 4 | What-if · Kayıtlı Programlar · Export · Bölüm Filtresi · Test Suite | ✅ Tamamlandı |

---

## 11. Geliştirme Ortamı Kurulumu

### Gereksinimler
- Node.js 18+
- .NET 9 SDK
- PostgreSQL 16

### Frontend
```bash
cd smartscheduler-frontend
npm install
npm run dev        # localhost:3000
```

### Backend
```bash
cd SmartScheduler.API
dotnet run         # localhost:5000 (Swagger UI)
```

### Veritabanı
```bash
cd SmartScheduler.API
dotnet ef database update
```

### Test
```bash
cd SmartScheduler.Tests
dotnet test        # 64 test, ~2s
```

---

## 12. Takım & Sorumluluklar

| Kişi | Scrum Rolü | Teknik Sorumluluk |
|------|-----------|-------------------|
| Abdulkadir Gedik | Product Owner | Genetik algoritma, what-if ve koordinasyon |
| Yunus Emre Edizer | Scrum Master | Backend Lead (.NET API, Auth, Export) |
| Emin Akif Erzurumlu | Developer | Frontend Lead (Next.js, UI/UX, Modals) |
| Hamza Hakverir | Developer | Veritabanı, DAL ve EF Core |
| Burak Kürkçü | Developer | DevOps, CI/CD ve test |

---

*DevArchitechs · SmartScheduler · Yazılım Projesi Geliştirme 2025-2026*
