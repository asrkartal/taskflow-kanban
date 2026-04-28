# 🚀 TaskFlow Kanban

**Live Demo:** [https://taskflow-kanban-red.vercel.app/](https://taskflow-kanban-red.vercel.app/)

TaskFlow Kanban, modern iş akışlarını yönetmek için tasarlanmış, Trello esintili, şık ve son derece hızlı bir proje yönetim aracıdır. En güncel web teknolojileri ile inşa edilen bu platform, ekiplerin ve bireylerin görevlerini görsel bir hiyerarşide organize etmelerini sağlar.

---

## ✨ Öne Çıkan Özellikler

### 📋 Board, Liste ve Kart Hiyerarşisi
*   **Dinamik Boardlar:** İstediğiniz kadar proje (board) oluşturun ve aralarında anında geçiş yapın.
*   **Sınırsız Sütun:** "Yapılacaklar", "Devam Edenler", "Bitenler" gibi sütunları saniyeler içinde ekleyin.
*   **Gelişmiş Kartlar:** Her görev sadece bir başlık değildir; zengin meta verilerle donatılmıştır.

### 🖱️ Kusursuz Drag & Drop (Sürükle-Bırak)
*   **Görev Kaydırma:** Kartları sütunlar arasında veya aynı sütun içinde serbestçe hareket ettirin.
*   **Sütun Sıralama:** Sadece kartları değil, tüm sütunları (listeleri) sürükleyerek pano düzeninizi değiştirin.
*   *Gücünü `@dnd-kit` kütüphanesinden alır, akıcı ve doğal hissettirir.*

### 🛠️ Detaylı Görev Yönetimi
*   **Checklist (Alt Görevler):** Büyük görevleri parçalara bölün ve ilerleme çubuğuyla takip edin.
*   **Bitiş Tarihi (Due Date):** Teslim tarihlerini belirleyin. Süresi yaklaşan veya geçen görevler için görsel uyarılar alın.
*   **Etiketler (Labels):** Renkli etiketlerle görevleri kategorize edin (Bug, Feature, Acil vb.).
*   **Üye Atama (Assignees):** Görevleri ekip üyelerine atayın ve kart üzerinde avatarlarını görün.
*   **Yorumlar:** Görev bazlı yorumlar yaparak ekip içi iletişimi güçlü tutun.

### 🔒 Güvenlik ve Paylaşım (Gelişmiş Yetkilendirme)
*   **Public/Private Board:** Panonuzu gizli tutun veya tek bir tıkla tüm dünyaya "Salt Okunur" (Read-Only) olarak açın.
*   **Read-Only Modu:** Paylaştığınız linke sahip olan misafirler, kartları ve detayları görebilir ancak hiçbir değişiklik yapamazlar.
*   **OTP Doğrulaması:** 6 haneli e-posta doğrulama kodu sayesinde, kayıt işlemini her cihazdan (PC/Telefon) güvenle tamamlayın.

### 🎨 Modern UI/UX Tasarımı
*   **Premium Estetik:** Glassmorphism efektleri, modern tipografi ve uyumlu renk paleti.
*   **Karanlık Mod (Dark Mode):** Göz yormayan, profesyonel karanlık tema.
*   **Responsive:** Hem masaüstü hem de mobil cihazlarda kusursuz deneyim.

---

## 🛠️ Teknoloji Yığını

*   **Frontend:** [Next.js 14 (App Router)](https://nextjs.org/) & [React](https://reactjs.org/)
*   **Backend & DB:** [Supabase](https://supabase.com/) (PostgreSQL & Realtime)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Bileşen Kütüphanesi:** [Shadcn/UI](https://ui.shadcn.com/)
*   **Drag & Drop:** [@dnd-kit](https://dnd-kit.com/)
*   **State Management:** React Hooks (useState, useMemo, useCallback)
*   **İkonlar:** [Lucide React](https://lucide.dev/)

---

## 🚀 Kurulum ve Başlatma

### 1. Depoyu Klonlayın
```bash
git clone https://github.com/asrkartal/taskflow-kanban.git
cd taskflow-kanban
```

### 2. Bağımlılıkları Yükleyin
```bash
npm install
```

### 3. Çevresel Değişkenler (.env)
`.env.local` dosyasını oluşturun:
```env
NEXT_PUBLIC_SUPABASE_URL=projenizin_url_adresi
NEXT_PUBLIC_SUPABASE_ANON_KEY=projenizin_anon_key_değeri
```

### 4. Veritabanı Şeması
Supabase SQL Editor'da sırasıyla şu dosyaları çalıştırın:
1. `supabase/schema.sql` (Temal tablolar)
2. `supabase/migration_v2.sql` (Checklist, Yorumlar, Tarih güncellemeleri)
3. `supabase/migration_v3.sql` (Public Board paylaşım yetkileri)

### 5. Çalıştırın
```bash
npm run dev
```
Uygulama `http://localhost:3000` adresinde hazır!

---

## 📦 Deployment
Bu proje **Vercel** üzerinde optimize edilmiştir. GitHub deponuzu bağlayarak anında canlıya alabilirsiniz.

---

**Geliştiren:** [asrkartal](https://github.com/asrkartal)
