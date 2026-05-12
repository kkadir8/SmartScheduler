# SmartScheduler Frontend

> AI Destekli Akıllı Ders Programı Oluşturucu — Frontend (Next.js 14)

[![Next.js](https://img.shields.io/badge/Next.js-14-000000)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6)](https://www.typescriptlang.org/)
[![Tailwind](https://img.shields.io/badge/Tailwind-3-06B6D4)](https://tailwindcss.com/)
[![Status](https://img.shields.io/badge/status-Sprint%201-orange)]()

## 📋 Proje Hakkında

SmartScheduler frontend'i, modern ve responsive bir kullanıcı arayüzü sağlar. Üniversite yöneticileri ve hocalar bu arayüz üzerinden ders, hoca ve sınıf bilgilerini girer; oluşturulan ders programını görüntüler ve dışa aktarır.

## 🛠️ Teknoloji Stack

| Katman | Teknoloji |
|--------|-----------|
| Framework | Next.js 14 (App Router) |
| Dil | TypeScript 5 |
| Stil | Tailwind CSS 3 |
| Takvim | FullCalendar.js |
| Form | React Hook Form + Zod |
| State | Zustand |
| HTTP Client | Axios + React Query |
| Test | Jest + React Testing Library |

## 📂 Klasör Yapısı

```
smartscheduler-frontend/
├── app/
│   ├── (auth)/                   # Login, register
│   ├── (dashboard)/              # Korumalı sayfalar
│   │   ├── courses/
│   │   ├── instructors/
│   │   ├── classrooms/
│   │   └── schedule/             # Takvim görünümü
│   ├── layout.tsx
│   └── page.tsx                  # Ana sayfa
├── components/
│   ├── ui/                       # Yeniden kullanılabilir UI
│   ├── calendar/                 # FullCalendar wrapper
│   └── forms/
├── lib/
│   ├── api.ts                    # API client
│   └── utils.ts
├── hooks/
├── types/
├── public/
└── README.md
```

## 🚀 Kurulum

```bash
# Repo'yu klonla
git clone https://github.com/DevArchitechs/smartscheduler-frontend.git
cd smartscheduler-frontend

# Bağımlılıkları kur
npm install

# Geliştirme sunucusunu başlat
npm run dev

# http://localhost:3000
```

## 📊 Proje Durumu

**Şu anki Sprint:** Sprint 1 — Kurulum & Mimari (Hafta 1/8)

### Sprint 1 Hedefleri
- [x] UI/UX wireframe'leri
- [ ] Next.js 14 proje kurulumu
- [ ] Klasör yapısı ve routing
- [ ] Tailwind tema konfigürasyonu
- [ ] API client setup
- [ ] İlk landing page

## 👥 Ekip — DevArchitechs

| İsim | Rol |
|------|-----|
| Abdulkadir Gedik | Product Owner & Algorithm Lead |
| Yunus Emre Edizer | Scrum Master & Backend Lead |
| Emin Akif Erzurumlu | Frontend Developer (Lead) |
| Hamza Hakverir | Database & DAL Developer |
| Burak Kürkçü | DevOps & QA Engineer |

## 📅 Geliştirme Süreci

- **Metodoloji:** Scrum (Agile)
- **Sprint Süresi:** 1 hafta
- **Görev Takibi:** [Trello Board](https://trello.com/b/Ephz3yhd/smartscheduler-devarchitechs)

## 📝 Lisans

MIT License — Eğitim amaçlı geliştirilmiştir.

---

**SmartScheduler** by **DevArchitechs** • Yazılım Projesi Geliştirme • 2025-2026 Bahar
