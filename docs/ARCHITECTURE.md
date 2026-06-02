# SmartScheduler — Mimari Tasarım Dokümantasyonu

**Proje:** AI Destekli Akıllı Ders Programı Oluşturucu  
**Ekip:** DevArchitechs  
**Ders:** Yazılım Projesi Geliştirme — 3. Sınıf Yazılım Mühendisliği  
**Dönem:** 2025-2026 Bahar  
**Tarih:** Haziran 2026

---

## 1. Proje Özeti

SmartScheduler, üniversite bölümlerinin ders programı oluşturma sürecini otomatikleştiren bir web uygulamasıdır. Sistem; hoca müsaitlikleri, sınıf kapasiteleri, ders kısıtları, kayıtlı programlar ve what-if senaryolarını dikkate alarak **genetik algoritma** tabanlı optimizasyon ile en uygun haftalık ders programını üretir, kaydeder ve dışa aktarır.

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
└──────────────────────┬──────────────────────────────────────┘
                       │ REST API (JSON)
                       │ http://localhost:5000/api/*
┌──────────────────────▼──────────────────────────────────────┐
│                   BACKEND KATMANI                           │
│   ASP.NET Core 9 Web API                                    │
│   Controllers + DTOs + Service Interfaces                   │
│   Auth, CRUD, Schedule, What-if, Export                    │
└──────────┬──────────────────────┬───────────────────────────┘
           │                      │
┌──────────▼──────────┐  ┌────────▼────────────────────────────┐
│  VERİTABANI KATMANI │  │      ALGORİTMA MOTORU               │
│  PostgreSQL 16      │  │  Genetik Algoritma (C#)             │
│  EF Core Code-First  │  │  - Kromozom temsili                │
│  Users, Schedules   │  │  - Fitness & conflict scoring       │
│  Availability vb.   │  │  - Crossover + Mutasyon + Select   │
└─────────────────────┘  └─────────────────────────────────────┘
```

---

## 3. Katman Mimarisi (Layered Architecture)

```
SmartScheduler.API/
├── Controllers/          → Auth, CRUD, Schedule, Export, Health
├── DTOs/                 → Login/Register, save payload'ları
├── Models/               → Entity ve algoritma modelleri
├── Services/             → Auth, Export, Genetic Algorithm
├── Services/Interfaces/  → Servis sözleşmeleri
├── Data/                 → AppDbContext
└── Migrations/           → EF Core migration'ları

smartscheduler-frontend/
├── app/
│   ├── (auth)/           → login, register
│   ├── (main)/           → dashboard, courses, instructors, classrooms
│   │                       schedule, saved, whatif, constraints
│   ├── layout.tsx        → Root layout (AuthProvider)
│   └── page.tsx          → Redirect / landing
├── components/           → Sidebar, Topbar, CalendarView, modals
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

### Classrooms
| Method | Endpoint | Auth | Açıklama |
|--------|----------|------|----------|
| GET | `/api/classrooms` | — | Tüm derslikleri listele |
| GET | `/api/classrooms/{id}` | — | Derslik detayı |
| POST | `/api/classrooms` | JWT | Yeni derslik ekle |
| PUT | `/api/classrooms/{id}` | JWT | Derslik güncelle |
| DELETE | `/api/classrooms/{id}` | JWT | Derslik sil |

### Constraints (Sprint 3)
| Method | Endpoint | Auth | Açıklama |
|--------|----------|------|----------|
| GET | `/api/constraints` | — | Tüm kısıtları listele |
| POST | `/api/constraints` | JWT | Yeni kısıt ekle (409 mükerrer) |
| DELETE | `/api/constraints/{id}` | JWT | Kısıt sil |

### Schedule
| Method | Endpoint | Auth | Açıklama |
|--------|----------|------|----------|
| POST | `/api/schedule/generate` | — | Genetik algoritma ile program üret |

### System
| Method | Endpoint | Auth | Açıklama |
|--------|----------|------|----------|
| GET | `/api/health` | — | Sistem sağlık kontrolü |

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

## 8. Güvenlik

- **Authentication:** JWT Bearer Token (Sprint 2'de uygulandı)
- **Authorization:** Role-based (Admin, User)
- **CORS:** Whitelist tabanlı origin kontrolü
- **HTTPS:** Production'da zorunlu
- **Password Hashing:** BCrypt

---

## 9. Sprint Planı

| Sprint | Hedef | Durum |
|--------|-------|-------|
| Sunum 1 | Planlama & Scrum geçişi | ✅ Tamamlandı |
| Sprint 1 | Kurulum & API temelleri & PostgreSQL | ✅ Tamamlandı |
| Sprint 2 | JWT Auth · CRUD · Genetik Algoritma | ✅ Tamamlandı |
| Sprint 3 | Kısıtlar · Müsaitlik · API Hata Yönetimi · Test | ✅ Tamamlandı |
| Sprint 4 | What-if · Kayıtlı Programlar · Export · Final Demo | 🔄 Devam Ediyor |

---

## 10. Geliştirme Ortamı Kurulumu

### Gereksinimler
- Node.js 18+
- .NET 9 SDK
- PostgreSQL 16
- Docker / Docker Compose (opsiyonel)

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
# Migration uygula
cd SmartScheduler.API
dotnet ef database update
```

---

## 11. Takım & Sorumluluklar

| Kişi | Scrum Rolü | Teknik Sorumluluk |
|------|-----------|-------------------|
| Abdulkadir Gedik | Product Owner | Genetik algoritma, what-if ve koordinasyon |
| Yunus Emre Edizer | Scrum Master | Backend Lead (.NET API, Auth, Export) |
| Emin Akif Erzurumlu | Developer | Frontend Lead (Next.js, UI/UX, Modals) |
| Hamza Hakverir | Developer | Veritabanı, DAL ve EF Core |
| Burak Kürkçü | Developer | DevOps, CI/CD ve test |

---

*DevArchitechs · SmartScheduler · Yazılım Projesi Geliştirme 2025-2026*
