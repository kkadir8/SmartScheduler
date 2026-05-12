# SmartScheduler — Mimari Tasarım Dokümantasyonu

**Proje:** AI Destekli Akıllı Ders Programı Oluşturucu  
**Ekip:** DevArchitechs  
**Ders:** Yazılım Projesi Geliştirme — 3. Sınıf Yazılım Mühendisliği  
**Dönem:** 2025-2026 Bahar  
**Tarih:** Mayıs 2026

---

## 1. Proje Özeti

SmartScheduler, üniversite bölümlerinin ders programı oluşturma sürecini otomatikleştiren bir web uygulamasıdır. Sistem; hoca müsaitlikleri, sınıf kapasiteleri ve ders çakışmaları gibi kısıtları göz önünde bulundurarak **genetik algoritma** tabanlı optimizasyon ile en uygun haftalık ders programını üretir.

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
│              Next.js 14 (App Router)                        │
│         TypeScript + Tailwind CSS                           │
│    localhost:3000  │  Vercel (prod deploy - Sprint 4)        │
└──────────────────────┬──────────────────────────────────────┘
                       │ REST API (JSON)
                       │ http://localhost:5000/api/*
┌──────────────────────▼──────────────────────────────────────┐
│                   BACKEND KATMANI                           │
│              ASP.NET Core 9 Web API                         │
│          Controllers + Service Layer                        │
│    localhost:5000  │  Railway (prod deploy - Sprint 4)       │
└──────────┬──────────────────────┬───────────────────────────┘
           │                      │
┌──────────▼──────────┐  ┌────────▼────────────────────────────┐
│  VERİTABANI KATMANI │  │      ALGORİTMA MOTORU               │
│  PostgreSQL 16      │  │  Genetik Algoritma (C#)             │
│  Entity Framework   │  │  - Kromozom temsili                 │
│  Core (Code-First)  │  │  - Fitness fonksiyonu               │
│  Railway (prod)     │  │  - Crossover + Mutasyon             │
└─────────────────────┘  └─────────────────────────────────────┘
```

---

## 3. Katman Mimarisi (Layered Architecture)

```
SmartScheduler.API/
├── Controllers/          → HTTP endpoint'leri, request/response
├── Services/             → İş mantığı, algoritma servisleri  
├── Models/               → Domain entity'leri
├── DTOs/                 → Data Transfer Objects
├── Data/                 → DbContext, repository'ler
└── Migrations/           → EF Core migration'ları

smartscheduler-frontend/
├── app/
│   ├── layout.tsx        → Root layout (Sidebar + Topbar)
│   ├── dashboard/        → Genel bakış + metrikler
│   ├── courses/          → Ders yönetimi
│   ├── instructors/      → Hoca yönetimi
│   ├── classrooms/       → Sınıf yönetimi
│   └── schedule/         → Program oluşturucu (Sprint 3)
└── components/           → Yeniden kullanılabilir UI bileşenleri
```

---

## 4. Teknoloji Stack

### Frontend
| Teknoloji | Versiyon | Kullanım Amacı |
|-----------|----------|----------------|
| Next.js | 14.2.3 | React framework, App Router, SSR/SSG |
| TypeScript | 5.x | Tip güvenliği |
| Tailwind CSS | 3.4 | Utility-first CSS |
| Lucide React | latest | İkon kütüphanesi |

### Backend
| Teknoloji | Versiyon | Kullanım Amacı |
|-----------|----------|----------------|
| ASP.NET Core | 9.0 | Web API framework |
| C# | 13 | Backend dili |
| Entity Framework Core | 9.x | ORM, Code-First migrations |
| Swagger / OpenAPI | 3.0 | API dokümantasyonu |

### Veritabanı & Altyapı
| Teknoloji | Versiyon | Kullanım Amacı |
|-----------|----------|----------------|
| PostgreSQL | 16 | Ana veritabanı |
| Docker | latest | Konteynerizasyon |
| GitHub Actions | - | CI/CD pipeline |
| Vercel | - | Frontend deploy (Sprint 4) |
| Railway | - | Backend + DB deploy (Sprint 4) |

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
│ Email        │     │ StudentCount    │     │ HasLab       │
│ CreatedAt    │     │ InstructorId(FK)│     │ HasProjector │
└──────────────┘     │ CreatedAt       │     │ CreatedAt    │
                     └────────┬────────┘     └──────┬───────┘
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
                     │ CreatedAt                            │
                     └──────────────┬───────────────────────┘
                                    │
                     ┌──────────────▼───────────────────────┐
                     │             Schedule                  │
                     ├──────────────────────────────────────┤
                     │ Id (PK)                              │
                     │ Name                                 │
                     │ Semester   (ör. "2025-2026 Bahar")   │
                     │ IsActive                             │
                     │ GeneratedAt                          │
                     │ FitnessScore                         │
                     └──────────────────────────────────────┘
```

---

## 6. API Endpoint'leri

### Sprint 1 (Mevcut — In-Memory)
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/health` | Sistem sağlık kontrolü |
| GET | `/api/courses` | Tüm dersleri listele |
| GET | `/api/courses/{id}` | Ders detayı |
| GET | `/api/instructors` | Tüm hocaları listele |
| GET | `/api/instructors/{id}` | Hoca detayı |
| GET | `/api/classrooms` | Tüm sınıfları listele |
| GET | `/api/classrooms/{id}` | Sınıf detayı |

### Sprint 2 (Planlanıyor — PostgreSQL)
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/api/courses` | Yeni ders ekle |
| PUT | `/api/courses/{id}` | Ders güncelle |
| DELETE | `/api/courses/{id}` | Ders sil |
| POST | `/api/instructors` | Yeni hoca ekle |
| POST | `/api/classrooms` | Yeni sınıf ekle |
| POST | `/api/auth/login` | JWT ile giriş |
| POST | `/api/auth/register` | Kullanıcı kaydı |

### Sprint 3 (Planlanıyor — Algoritma)
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/api/schedule/generate` | Program oluştur (algoritma tetikle) |
| GET | `/api/schedule` | Tüm programları listele |
| GET | `/api/schedule/{id}` | Program detayı |
| GET | `/api/schedule/{id}/export/pdf` | PDF export |
| GET | `/api/schedule/{id}/export/excel` | Excel export |

---

## 7. Genetik Algoritma Tasarımı

### Kromozom Temsili
Her birey (kromozom) bir haftalık ders programını temsil eder:

```
Kromozom = [ (Ders₁, Sınıf₁, Gün₁, Saat₁), (Ders₂, Sınıf₂, Gün₂, Saat₂), ... ]
```

### Fitness Fonksiyonu
Amaç: Kısıt ihlallerini minimize et.

```
Fitness = 1 / (1 + ihlal_sayısı × ağırlık)
```

**Hard Constraints (ihlal edilemez):**
- Aynı hoca aynı anda iki ders veremez
- Aynı sınıfta aynı anda iki ders olamaz
- Sınıf kapasitesi öğrenci sayısından küçük olamaz

**Soft Constraints (optimize edilir):**
- Hoca tercih edilen saatler
- Öğrenciler için ardışık ders yükü dengeleme
- Sabah/öğleden sonra dengesi

### Algoritma Parametreleri
| Parametre | Değer |
|-----------|-------|
| Popülasyon büyüklüğü | 50 |
| Maksimum nesil sayısı | 200 |
| Çaprazlama oranı | 0.8 |
| Mutasyon oranı | 0.1 |
| Seçim yöntemi | Tournament Selection |

---

## 8. Güvenlik (Sprint 2'de Uygulanacak)

- **Authentication:** JWT Bearer Token
- **Authorization:** Role-based (Admin, User)
- **CORS:** Whitelist tabanlı origin kontrolü
- **HTTPS:** Production'da zorunlu
- **Input Validation:** FluentValidation ile

---

## 9. Sprint Planı

| Sprint | Hedef | Durum |
|--------|-------|-------|
| Sunum 1 | Planlama & Scrum geçişi | ✅ Bitti |
| Sprint 1 | Kurulum & API temelleri | 🔄 Devam ediyor |
| Sprint 2 | Algoritma + CRUD + Auth | ⏳ Yaklaşan |
| Sprint 3 | Dashboard & Takvim & Entegrasyon | ⏳ Yaklaşan |
| Sprint 4 | Test & Deploy & Final Demo | ⏳ Yaklaşan |

---

## 10. Geliştirme Ortamı Kurulumu

### Gereksinimler
- Node.js 24+
- .NET 9 SDK
- PostgreSQL 16
- Docker (opsiyonel)

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

### Veritabanı (Sprint 2'den itibaren)
```bash
# PostgreSQL başlat
brew services start postgresql@16

# Migration uygula
cd SmartScheduler.API
dotnet ef database update
```

---

## 11. Takım & Sorumluluklar

| Kişi | Scrum Rolü | Teknik Sorumluluk |
|------|-----------|-------------------|
| Abdulkadir Gedik | Product Owner | Genetik algoritma tasarımı & koordinasyon |
| Yunus Emre Edizer | Scrum Master | Backend Lead (.NET API, Auth) |
| Emin Akif Erzurumlu | Developer | Frontend Lead (Next.js, UI/UX) |
| Hamza Hakverir | Developer | Veritabanı & DAL (EF Core, PostgreSQL) |
| Burak Kürkçü | Developer | DevOps & Test (Docker, CI/CD, testing) |

---

*DevArchitechs · SmartScheduler · Yazılım Projesi Geliştirme 2025-2026*
