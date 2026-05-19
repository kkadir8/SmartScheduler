# SmartScheduler API — Test Senaryoları

**Sprint:** 3  
**Sorumlu:** Burak Kürkçü  
**Tarih:** 19.05.2026  
**Kapsam:** Auth, CRUD ve Algoritma endpoint'leri için başarılı ve hatalı durum test senaryoları

---

## 1. AUTH — Kullanıcı Girişi (POST /api/auth/login)

### TS-01 — Başarılı Giriş
- **Açıklama:** Kayıtlı bir kullanıcı doğru e-posta ve şifre ile giriş yapar.
- **Girdi:**
  ```json
  { "email": "admin@smartscheduler.com", "password": "Admin123!" }
  ```
- **Beklenen Sonuç:** `200 OK` — JWT token, kullanıcı adı, e-posta ve rol bilgisi döner.
- **Başarı Kriteri:** Response body'de `token` alanı boş değil ve `role` değeri mevcut.

---

### TS-02 — Hatalı Şifre ile Giriş
- **Açıklama:** Kayıtlı kullanıcı yanlış şifre girer.
- **Girdi:**
  ```json
  { "email": "admin@smartscheduler.com", "password": "YanlisŞifre" }
  ```
- **Beklenen Sonuç:** `401 Unauthorized` — `{ "message": "E-posta veya şifre hatalı." }`
- **Başarı Kriteri:** Token dönmemeli, HTTP kodu 401 olmalı.

---

### TS-03 — Sistemde Olmayan E-posta ile Giriş
- **Açıklama:** Kayıtlı olmayan bir e-posta ile giriş denenir.
- **Girdi:**
  ```json
  { "email": "yok@example.com", "password": "herhangi123" }
  ```
- **Beklenen Sonuç:** `401 Unauthorized` — `{ "message": "E-posta veya şifre hatalı." }`
- **Başarı Kriteri:** Güvenlik gereği kullanıcı bulunamadı mesajı verilmemeli.

---

## 2. AUTH — Kullanıcı Kaydı (POST /api/auth/register)

### TS-04 — Başarılı Kayıt
- **Açıklama:** Sistemde olmayan yeni bir e-posta ile kayıt yapılır.
- **Girdi:**
  ```json
  { "username": "testUser", "email": "yeni@test.com", "password": "Test1234!" }
  ```
- **Beklenen Sonuç:** `200 OK` — JWT token ve kullanıcı bilgileri döner.
- **Başarı Kriteri:** Response'da `token` mevcut, kullanıcı DB'ye kaydedildi.

---

### TS-05 — Zaten Kayıtlı E-posta ile Kayıt
- **Açıklama:** Sistemde mevcut bir e-posta ile tekrar kayıt denenir.
- **Girdi:**
  ```json
  { "username": "testUser2", "email": "admin@smartscheduler.com", "password": "Test1234!" }
  ```
- **Beklenen Sonuç:** `400 Bad Request` — `{ "message": "Bu e-posta adresi zaten kullanımda." }`
- **Başarı Kriteri:** HTTP kodu 400, yeni kullanıcı oluşturulmamalı.

---

## 3. COURSES — Ders CRUD (GET/POST/PUT/DELETE /api/courses)

### TS-06 — Tüm Dersleri Listeleme
- **Açıklama:** Sistemdeki tüm dersler öğretmen bilgisiyle listelenir.
- **Endpoint:** `GET /api/courses`
- **Auth:** Gerekmiyor
- **Beklenen Sonuç:** `200 OK` — Her kayıtta `id`, `code`, `name`, `credit`, `studentCount`, `instructorName` alanları mevcut.
- **Başarı Kriteri:** En az 1 ders döner, `instructorName` null veya dolu olabilir.

---

### TS-07 — Var Olmayan Ders ID ile Getirme
- **Açıklama:** Sistemde olmayan bir ID ile tek ders sorgulanır.
- **Endpoint:** `GET /api/courses/99999`
- **Auth:** Gerekmiyor
- **Beklenen Sonuç:** `404 Not Found`
- **Başarı Kriteri:** HTTP kodu 404, response body boş veya hata mesajı içerir.

---

### TS-08 — JWT Token Olmadan Ders Ekleme
- **Açıklama:** Authorization header'ı eksik şekilde yeni ders ekleme denenir.
- **Endpoint:** `POST /api/courses`
- **Auth:** Yok (kasıtlı)
- **Girdi:**
  ```json
  { "code": "TEST101", "name": "Test Dersi", "credit": 3, "studentCount": 30, "instructorId": 1 }
  ```
- **Beklenen Sonuç:** `401 Unauthorized`
- **Başarı Kriteri:** Ders DB'ye eklenmemeli.

---

## 4. CLASSROOMS — Derslik CRUD (GET/POST/PUT/DELETE /api/classrooms)

### TS-09 — Tüm Derslikleri Listeleme
- **Açıklama:** Sistemdeki tüm derslikler listelenir.
- **Endpoint:** `GET /api/classrooms`
- **Auth:** Gerekmiyor
- **Beklenen Sonuç:** `200 OK` — Her kayıtta `id`, `name`, `building`, `capacity`, `hasLab`, `hasProjector` alanları mevcut.
- **Başarı Kriteri:** En az 1 derslik döner.

---

### TS-10 — Var Olmayan Derslik ID ile Güncelleme
- **Açıklama:** Sistemde olmayan bir ID'li dersliği güncelleme denenir.
- **Endpoint:** `PUT /api/classrooms/99999`
- **Auth:** Geçerli JWT Token
- **Girdi:**
  ```json
  { "name": "A-301", "building": "A Blok", "capacity": 50, "hasLab": false, "hasProjector": true }
  ```
- **Beklenen Sonuç:** `404 Not Found`
- **Başarı Kriteri:** Hiçbir kayıt değiştirilmemeli.

---

## 5. CONSTRAINTS — Kısıt Yönetimi (GET/POST/DELETE /api/constraints)

### TS-11 — Yeni Kısıt Oluşturma
- **Açıklama:** Geçerli bir ders ve derslik çifti için yeni kısıt eklenir.
- **Endpoint:** `POST /api/constraints`
- **Auth:** Geçerli JWT Token
- **Girdi:**
  ```json
  { "courseId": 1, "classroomId": 1, "notes": "Sadece bu sınıfta yapılabilir" }
  ```
- **Beklenen Sonuç:** `201 Created` — Oluşturulan kısıt bilgileri döner.
- **Başarı Kriteri:** `id` alanı atamalı, `createdAt` otomatik set edilmeli.

---

### TS-12 — Aynı Ders-Derslik Çifti için Tekrar Kısıt Ekleme
- **Açıklama:** Zaten mevcut olan ders-derslik çifti tekrar eklenmek istenir.
- **Endpoint:** `POST /api/constraints`
- **Auth:** Geçerli JWT Token
- **Girdi:**
  ```json
  { "courseId": 1, "classroomId": 1, "notes": "Tekrar ekleme denemesi" }
  ```
- **Beklenen Sonuç:** `409 Conflict` — `{ "message": "Bu ders-derslik kısıtı zaten mevcut." }`
- **Başarı Kriteri:** DB'ye mükerrer kayıt eklenmemeli.

---

### TS-13 — Var Olmayan Ders ID ile Kısıt Ekleme
- **Açıklama:** Sistemde bulunmayan bir CourseId ile kısıt oluşturulmak istenir.
- **Endpoint:** `POST /api/constraints`
- **Auth:** Geçerli JWT Token
- **Girdi:**
  ```json
  { "courseId": 99999, "classroomId": 1, "notes": "Geçersiz ders" }
  ```
- **Beklenen Sonuç:** `400 Bad Request` — `{ "message": "CourseId=99999 bulunamadı." }`
- **Başarı Kriteri:** Referans bütünlüğü korunmalı.

---

### TS-14 — Belirli Bir Derse Ait Kısıtları Listeleme
- **Açıklama:** Var olan bir derse atanmış tüm kısıtlar (izin verilen derslikler) getirilir.
- **Endpoint:** `GET /api/constraints/course/1`
- **Auth:** Gerekmiyor
- **Beklenen Sonuç:** `200 OK` — Her kayıtta `classroomId`, `classroomName`, `classroomCapacity`, `classroomHasLab` alanları mevcut.
- **Başarı Kriteri:** Liste boş veya dolu olabilir, HTTP kodu 200 olmalı.

---

## 6. SCHEDULE — Algoritma (POST /api/schedule/generate)

### TS-15 — Genetik Algoritma ile Program Üretme
- **Açıklama:** Sistem, mevcut dersler ve derslikler üzerinden otomatik ders programı üretir.
- **Endpoint:** `POST /api/schedule/generate`
- **Auth:** Gerekmiyor
- **Girdi:** Body yok
- **Beklenen Sonuç:** `200 OK` — `fitness`, `fitnessPercent`, `conflictCount`, `bestGeneration`, `totalGenerations`, `entries` alanları döner.
- **Başarı Kriteri:** `fitness` değeri 0'dan büyük, `entries` listesi en az 1 kayıt içermeli.

---

## Test Özeti

| ID | Endpoint | Durum Türü | Beklenen HTTP |
|----|----------|------------|---------------|
| TS-01 | POST /api/auth/login | ✅ Başarılı | 200 |
| TS-02 | POST /api/auth/login | ❌ Hatalı şifre | 401 |
| TS-03 | POST /api/auth/login | ❌ Bilinmeyen e-posta | 401 |
| TS-04 | POST /api/auth/register | ✅ Başarılı | 200 |
| TS-05 | POST /api/auth/register | ❌ E-posta mevcut | 400 |
| TS-06 | GET /api/courses | ✅ Listeleme | 200 |
| TS-07 | GET /api/courses/{id} | ❌ Bulunamadı | 404 |
| TS-08 | POST /api/courses | ❌ Token yok | 401 |
| TS-09 | GET /api/classrooms | ✅ Listeleme | 200 |
| TS-10 | PUT /api/classrooms/{id} | ❌ Bulunamadı | 404 |
| TS-11 | POST /api/constraints | ✅ Başarılı | 201 |
| TS-12 | POST /api/constraints | ❌ Mükerrer kayıt | 409 |
| TS-13 | POST /api/constraints | ❌ Geçersiz CourseId | 400 |
| TS-14 | GET /api/constraints/course/{id} | ✅ Listeleme | 200 |
| TS-15 | POST /api/schedule/generate | ✅ Algoritma çalışıyor | 200 |

**Toplam: 15 test senaryosu** (Auth: 5 · CRUD: 7 · Algoritma: 1 · Kısıt: 2)
