# 🚀 TaskFlow Kanban

TaskFlow Kanban, modern web teknolojileri ile geliştirilmiş, şık, hızlı ve kullanıcı dostu bir proje yönetim uygulamasıdır. Trello ve Jira gibi profesyonel araçların sadeliğini ve hızını hedefleyerek inşa edilmiştir.

## ✨ Özellikler

- **Full Drag & Drop Deneyimi:** Görevleri ve sütunları özgürce sürükleyip bırakın (Powered by `@dnd-kit`).
- **Gelişmiş Görev Yönetimi:** Görev oluştururken öncelik (Priority) belirleme ve etiket (Label) ekleme.
- **Gerçek Zamanlı Veritabanı:** Tüm değişiklikler anında Supabase veritabanına kaydedilir ve sayfayı yenilediğinizde konumlar korunur.
- **Modern Tasarım (UI/UX):** 
  - Glassmorphism efektleri ve derinlik algısı.
  - Karanlık mod (Dark Mode) uyumlu premium renk paleti.
  - Akıcı mikro-animasyonlar.
- **Güvenli Kimlik Doğrulama:** Supabase Auth ile kullanıcı kaydı ve güvenli giriş sistemi.
- **Dinamik Board Yönetimi:** Sidebar üzerinden board oluşturma, isimlendirme ve anlık geçişler.

## 🛠️ Teknoloji Yığını

- **Framework:** [Next.js 14 (App Router)](https://nextjs.org/)
- **Veritabanı & Auth:** [Supabase](https://supabase.com/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Bileşenleri:** [Shadcn/UI](https://ui.shadcn.com/)
- **Drag & Drop:** [@dnd-kit](https://dnd-kit.com/)
- **İkonlar:** [Lucide React](https://lucide.dev/)

## 🚀 Hızlı Başlangıç

### 1. Depoyu Klonlayın
```bash
git clone https://github.com/asrkartal/taskflow-kanban.git
cd taskflow-kanban
```

### 2. Bağımlılıkları Kurun
```bash
npm install
```

### 3. Çevresel Değişkenleri Ayarlayın
`.env.local` dosyası oluşturun ve Supabase bilgilerinizi ekleyin:
```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 4. Geliştirme Sunucusunu Başlatın
```bash
npm run dev
```
Uygulama artık `http://localhost:3000` adresinde çalışıyor!

## 📦 Deployment

Bu proje **Vercel** ile tam uyumludur. GitHub deponuzu bağlayarak saniyeler içinde yayına alabilirsiniz.

---

Geliştiren: [asrkartal](https://github.com/asrkartal)
