# Sprint 1 Planning — Toplantı Notları

**Tarih:** [27/04/2026]
**Süre:** 1 saat
**Katılımcılar:** Tüm DevArchitechs ekibi
**Toplantı Yöneticisi:** Yunus Emre Edizer (Scrum Master)
**Format:** Online (Google Meets)

---

## 🎯 Sprint Hedefi

> **Sprint 1 sonunda, geliştirme ortamı kurulmuş, mimari netleşmiş ve uçtan uca "Hello World" demo çalışıyor olmalı.**

## 📋 Sprint Backlog (Trello'ya Yansıtıldı)

| # | Görev | Atanan | Tahmini Efor |
|---|-------|--------|---------------|
| 1 | Sprint 1 Planning toplantısı | Yunus Emre | 1 saat |
| 2 | GitHub repository kurulumu | Burak Kürkçü | 2 saat |
| 3 | Veritabanı şema tasarımı (PostgreSQL) | Hamza Hakverir | 4 saat |
| 4 | ASP.NET Core 8 API iskelet kurulumu | Yunus Emre Edizer | 4 saat |
| 5 | Next.js 14 proje kurulumu | Emin Akif Erzurumlu | 3 saat |
| 6 | Docker ve GitHub Actions setup | Burak Kürkçü | 4 saat |

## ✅ Definition of Done (Tanımlandı)

Bir görev "Done" sayılması için:

- [ ] Kod GitHub'da `develop` branch'ine merge edilmiş olmalı
- [ ] PR en az 1 ekip üyesi tarafından review edilmeli
- [ ] CI pipeline yeşil olmalı (tüm testler geçmeli)
- [ ] Eğer yeni endpoint/component eklendiyse Swagger/Storybook'ta görünür olmalı
- [ ] README veya ilgili docs güncellenmiş olmalı

## 💬 Toplantı Tartışmaları

### Kararlar

1. **Branching stratejisi:** GitFlow kullanılacak (`main`, `develop`, `feature/*`)
2. **Commit convention:** Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`)
3. **Daily standup saati:** Her gün 10:00, Discord'da, max 15 dakika
4. **Code review:** Her PR en az 1 onay almadan merge edilmeyecek
5. **Sprint review zamanı:** Cuma 18:00 — herkes kendi yaptığını ekran paylaşımıyla gösterecek
6. **Retrospective:** Cumartesi 20:00 — neyi iyi yaptık, neyi iyileştirebiliriz

### Riskler ve Önlemler

| Risk | Önlem |
|------|-------|
| .NET versiyon uyumsuzluğu (Mac/Win) | Docker üzerinden çalıştırılacak |
| PostgreSQL kurulum karmaşıklığı | Docker Compose ile tek komutta ayağa kalkacak |
| Frontend-Backend port çakışması | Frontend: 3000, Backend: 5000 standartı |
| İlk hafta yeni teknolojiler öğrenme süresi | Pair programming ile bilgi paylaşımı |

### Sorular ve Cevaplar

**S:** Genetik algoritma için hangi kütüphane kullanılacak?
**C:** Sprint 2'de değerlendirilecek. Adaylar: GeneticSharp (C# native), ya da custom implementasyon. Abdulkadir bu hafta araştırma yapıyor.

**S:** Hangi mac/windows uyumsuzluk durumlarını yaşayabiliriz?
**C:** Path separator (`/` vs `\`), line endings (LF vs CRLF). `.gitattributes` dosyası ile çözülecek.

**S:** Veri seed'i nasıl yapılacak?
**C:** Hamza, EF Core'un `HasData()` metoduyla initial seed hazırlayacak (3 hoca, 5 ders, 4 sınıf).

## 📅 Bir Sonraki Toplantı

- **Sprint 1 Review:** Cuma 18:00
- **Sprint 1 Retrospective:** Cumartesi 20:00
- **Sprint 2 Planning:** Pazar 18:00

---

**Notları Tutan:** Yunus Emre Edizer (Scrum Master)
**Onaylayan:** Abdulkadir Gedik (Product Owner)
