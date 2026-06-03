# SmartScheduler API — Test Senaryoları

**Sprint:** 4 (Final)
**Sorumlu:** Burak Kürkçü
**Tarih:** 03.06.2026
**Durum:** ✅ Tüm testler geçiyor — 64/64
**Kapsam:** Birim, entegrasyon ve güvenlik testleri (xUnit + WebApplicationFactory + in-memory DB)

---

## Test Altyapısı

```
SmartScheduler.Tests/
├── Infrastructure/
│   ├── TestWebApplicationFactory.cs   — WebApplicationFactory, in-memory DB override
│   └── TestDataSeeder.cs              — Admin kullanıcısı ve test programı seed
├── Unit/
│   ├── ConflictDetectionTests.cs      — UT-01..UT-10: Gene/Chromosome çakışma mantığı
│   └── GeneticAlgorithmServiceTests.cs — UT-11..UT-15: GA servis davranışları
├── Integration/
│   ├── AuthTests.cs                   — TS-01..TS-05
│   ├── CoursesAndClassroomsTests.cs   — TS-06..TS-10
│   ├── ConstraintsTests.cs            — TS-11..TS-14
│   ├── ScheduleTests.cs               — TS-15..TS-22
│   └── ExportTests.cs                 — TS-20 + PDF/Instructor
└── Security/
    └── SecurityTests.cs               — SEC-01..SEC-10
```

---

## 1. BİRİM TESTLERİ (Unit Tests)

### UT-01 — Aynı Derslik Aynı Saatte Çakışır
- Aynı derslik, aynı gün, aynı saat → `Overlaps() = true` ve `classroomId` eşit.

### UT-02 — Farklı Günde Çakışma Yok
- Aynı derslik, farklı gün → `Overlaps() = false`.

### UT-03 — Aynı Hoca Örtüşen Saatler
- Aynı hoca, aynı gün, örtüşen zaman dilimleri → `Overlaps() = true`.

### UT-04 — Aynı Hoca Art Arda Saatler (Çakışmasız)
- 10:00–12:00 ve 12:00–14:00 → `Overlaps() = false`.

### UT-05 — Farklı Hoca, Aynı Derslik Aynı Saat
- Sadece salon çakışması; hoca çakışması yok.

### UT-06 — Kısmen Örtüşen Süreli Ders
- 08:00–12:00 ile 11:00–13:00 → `Overlaps() = true`.

### UT-07 — Tamamen İç İçe Saatler
- 08:00–14:00 içinde 10:00–12:00 → çakışır.

### UT-08 — Farklı Derslik+Hoca Aynı Saat → Çakışma Yok
- Hiçbir ortak kaynak yok.

### UT-09 — Gene Clone Bağımsız Kopya Üretir
- Clone değiştirilince orijinal etkilenmez.

### UT-10 — Chromosome Clone Derin Kopya
- Tüm genler bağımsız kopyalanır, fitness taşınır.

### UT-11 — Boş DB'de Boş Sonuç
- Ders/derslik yokken → genes listesi boş.

### UT-12 — Bölüm Filtresi Sadece O Bölümü Dahil Eder
- "BM" filtresiyle YM dersleri dışlanır.

### UT-13 — null Bölüm Tüm Dersleri Dahil Eder
- 3 ders seedlenmiş → 3 gene döner.

### UT-14 — WhatIf ExcludedDays Uygulanır
- 4 gün kapalı → tüm genler Cuma'ya atanır.

### UT-15 — Fitness Skoru 0–1 Aralığında
- Geçerli veriyle üretilen program → fitness ∈ [0.0, 1.0].

---

## 2. AUTH — Kullanıcı Girişi (POST /api/auth/login)

### TS-01 — Başarılı Giriş
- **Girdi:** `{ "email": "admin@smartscheduler.com", "password": "Admin123!" }`
- **Beklenen:** `200 OK` — `token` alanı dolu.

### TS-02 — Hatalı Şifre
- **Girdi:** `{ "email": "admin@...", "password": "YanlisŞifre" }`
- **Beklenen:** `401 Unauthorized`

### TS-03 — Bilinmeyen E-posta
- **Beklenen:** `401 Unauthorized` — güvenlik: "bulunamadı" mesajı verilmez.

---

## 3. AUTH — Kullanıcı Kaydı (POST /api/auth/register)

### TS-04 — Başarılı Kayıt
- **Beklenen:** `200 OK` — `token` alanı dolu.

### TS-05 — Mevcut E-posta
- **Beklenen:** `400 Bad Request`

---

## 4. COURSES (GET/POST/PUT/DELETE /api/courses)

### TS-06 — Tüm Dersleri Listeleme
- **Beklenen:** `200 OK` — `code`, `name` alanları mevcut.

### TS-07 — Var Olmayan Ders ID
- **Endpoint:** `GET /api/courses/99999`
- **Beklenen:** `404 Not Found`

### TS-08 — Token Olmadan Ders Ekleme
- **Beklenen:** `401 Unauthorized`

---

## 5. CLASSROOMS (GET/POST/PUT/DELETE /api/classrooms)

### TS-09 — Tüm Derslikleri Listeleme
- **Beklenen:** `200 OK` — `capacity`, `name` alanları mevcut.

### TS-10 — Var Olmayan Derslik Güncelleme
- **Endpoint:** `PUT /api/classrooms/99999`
- **Beklenen:** `404 Not Found`

---

## 6. CONSTRAINTS (GET/POST/DELETE /api/constraints)

### TS-11 — Yeni Kısıt Oluşturma
- **Girdi:** `{ "courseId": 1, "classroomId": 1, "notes": "..." }`
- **Beklenen:** `201 Created` — `id` alanı atanmış.

### TS-12 — Mükerrer Kısıt
- **Beklenen:** `409 Conflict`

### TS-13 — Geçersiz CourseId
- **Girdi:** `{ "courseId": 99999, "classroomId": 1 }`
- **Beklenen:** `400 Bad Request`

### TS-14 — Kursa Ait Kısıtları Listeleme
- **Endpoint:** `GET /api/constraints/course/1`
- **Beklenen:** `200 OK`

---

## 7. SCHEDULE — Algoritma (POST /api/schedule/generate)

### TS-15 — Program Üretme (Tüm Bölümler)
- **Girdi:** `{ "department": null }`
- **Beklenen:** `200 OK` — `fitness`, `entries` alanları mevcut.

### TS-16 — What-if Gün Kısıtı
- **Girdi:** `{ "excludedDays": [0, 1], "lockedAssignments": [] }`
- **Beklenen:** `200 OK`

### TS-16b — Tüm Günler Kapalı
- **Girdi:** `{ "excludedDays": [0,1,2,3,4] }`
- **Beklenen:** `400 Bad Request`

### TS-17 — Program Kaydetme
- **Girdi:** `{ "name": "...", "term": "...", "department": "BM", "entries": [...] }`
- **Beklenen:** `201 Created` — `department` alanı response'da mevcut.

### TS-17b — Token Olmadan Kayıt
- **Beklenen:** `401 Unauthorized`

### TS-18 — Kayıtlı Programları Listeleme
- **Beklenen:** `200 OK` — `department`, `fitnessPercent` alanları mevcut.

### TS-19 — Program Aktivasyonu
- **Beklenen:** `204 No Content`

### TS-21 — Bölüm Filtreli Program Üretme *(Sprint 4 yeni özellik)*
- **Girdi:** `{ "department": "Bilgisayar Mühendisliği" }`
- **Beklenen:** `200 OK` — `fitnessPercent` alanı mevcut.

### TS-22 — Var Olmayan Program Getirme
- **Endpoint:** `GET /api/schedule/99999`
- **Beklenen:** `404 Not Found`

---

## 8. EXPORT (GET /api/export)

### TS-20 — Programı Excel Olarak İndirme
- **Beklenen:** `200 OK` — Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

### TS-20b — Var Olmayan Program Excel
- **Beklenen:** `404 Not Found`

---

## 9. GÜVENLİK TESTLERİ (Security Tests)

### SEC-01 — Korumalı Endpoint'ler Token Olmadan 401
- `POST /api/courses`, `POST /api/classrooms`, `POST /api/constraints`, `POST /api/schedule/save`, `PUT /api/schedule/{id}/activate`, `DELETE /api/schedule/{id}` → `401`

### SEC-02 — Süresi Dolmuş Token
- Geçersiz imzalı süresi dolmuş JWT → `401`

### SEC-03 — Bozuk Token
- Rastgele string Bearer token → `401`

### SEC-04 — Hatalı Şifre Kullanıcı Varlığını Sızdırmaz
- Bilinen ve bilinmeyen e-postalar aynı hata mesajını döner.

### SEC-05 — SQL Injection Girişimi
- Query param'da `' OR 1=1--` → 500 dönmez (ORM parametreli sorgu kullanıyor).

### SEC-06 — XSS Payload Sunucuyu Çöktürmez
- Script tag içeren ders adı → 500 değil, 201 veya 400 döner.

### SEC-07 — Şifre Hash'lenerek Saklanır
- Kayıt sonrası doğru şifre giriş yapar, yanlış şifre reddedilir.

### SEC-08 — Health Endpoint Herkese Açık
- `GET /api/health` → `200 OK` (token gerektirmez).

### SEC-09 — Read-Only Endpoint'ler Token Gerektirmez
- `GET /api/courses`, `/api/classrooms`, `/api/instructors`, `/api/schedule/list` → `200 OK`

### SEC-10 — Var Olmayan Kayıt Silme 404
- `DELETE /api/schedule/9999999` → `404 Not Found` (500 değil)

---

## Test Özeti

| ID | Test Türü | Endpoint / Konu | Durum |
|----|-----------|-----------------|-------|
| UT-01..10 | Birim | Çakışma tespiti, Gene/Chromosome | ✅ |
| UT-11..15 | Birim | GeneticAlgorithmService | ✅ |
| TS-01 | Entegrasyon | POST /api/auth/login — Başarılı | ✅ |
| TS-02 | Entegrasyon | POST /api/auth/login — Hatalı şifre | ✅ |
| TS-03 | Entegrasyon | POST /api/auth/login — Bilinmeyen e-posta | ✅ |
| TS-04 | Entegrasyon | POST /api/auth/register — Başarılı | ✅ |
| TS-05 | Entegrasyon | POST /api/auth/register — Mevcut e-posta | ✅ |
| TS-06 | Entegrasyon | GET /api/courses — Listeleme | ✅ |
| TS-07 | Entegrasyon | GET /api/courses/{id} — 404 | ✅ |
| TS-08 | Entegrasyon | POST /api/courses — Token yok | ✅ |
| TS-09 | Entegrasyon | GET /api/classrooms — Listeleme | ✅ |
| TS-10 | Entegrasyon | PUT /api/classrooms/{id} — 404 | ✅ |
| TS-11 | Entegrasyon | POST /api/constraints — Başarılı | ✅ |
| TS-12 | Entegrasyon | POST /api/constraints — 409 Mükerrer | ✅ |
| TS-13 | Entegrasyon | POST /api/constraints — Geçersiz CourseId | ✅ |
| TS-14 | Entegrasyon | GET /api/constraints/course/{id} | ✅ |
| TS-15 | Entegrasyon | POST /api/schedule/generate — Tüm bölümler | ✅ |
| TS-16 | Entegrasyon | POST /api/schedule/whatif — Gün kısıtı | ✅ |
| TS-16b | Entegrasyon | POST /api/schedule/whatif — Tüm günler kapalı | ✅ |
| TS-17 | Entegrasyon | POST /api/schedule/save — Başarılı | ✅ |
| TS-17b | Entegrasyon | POST /api/schedule/save — Token yok | ✅ |
| TS-18 | Entegrasyon | GET /api/schedule/list — Department alanı | ✅ |
| TS-19 | Entegrasyon | PUT /api/schedule/{id}/activate | ✅ |
| TS-20 | Entegrasyon | GET /api/export/schedules/{id}/excel | ✅ |
| TS-20b | Entegrasyon | GET /api/export/schedules/99999/excel — 404 | ✅ |
| TS-21 | Entegrasyon | POST /api/schedule/generate — Bölüm filtresi | ✅ |
| TS-22 | Entegrasyon | GET /api/schedule/99999 — 404 | ✅ |
| SEC-01 | Güvenlik | Korumalı endpoint'ler 401 döner | ✅ |
| SEC-02 | Güvenlik | Süresi dolmuş token 401 | ✅ |
| SEC-03 | Güvenlik | Bozuk token 401 | ✅ |
| SEC-04 | Güvenlik | Kullanıcı varlığı sızmaması | ✅ |
| SEC-05 | Güvenlik | SQL injection ORM ile engellendi | ✅ |
| SEC-06 | Güvenlik | XSS payload sunucu çökmez | ✅ |
| SEC-07 | Güvenlik | BCrypt şifre hash doğrulaması | ✅ |
| SEC-08 | Güvenlik | Health endpoint herkese açık | ✅ |
| SEC-09 | Güvenlik | Read-only endpoint'ler public | ✅ |
| SEC-10 | Güvenlik | Var olmayan kayıt silme 404 | ✅ |

**Toplam: 64 test — 64 geçiyor (100%)**

Sprint 4 itibarıyla eklenen yeni testler: TS-16b, TS-17b, TS-21, TS-22, tüm SEC-* ve UT-* senaryoları.
