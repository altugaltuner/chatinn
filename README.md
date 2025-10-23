# ChatIn - Sohbet Uygulaması

Bu proje, Next.js (frontend) ve Express.js (backend) kullanılarak geliştirilmiş bir sohbet uygulamasıdır.

## 📋 Gereksinimler

Projeyi çalıştırmadan önce aşağıdaki yazılımların sisteminizde yüklü olması gerekir:

- **Node.js** (v18 veya üzeri) - [İndir](https://nodejs.org/)
- **PostgreSQL** (v14 veya üzeri) - [İndir](https://www.postgresql.org/download/)
- **Git** - [İndir](https://git-scm.com/)

## 🚀 Kurulum

### 1. Projeyi Klonlayın

```bash
git clone <repository-url>
cd chatin
```

### 2. PostgreSQL Veritabanını Kurun

#### PostgreSQL'i Açın
Windows'ta `psql` veya `pgAdmin` kullanarak PostgreSQL'e bağlanın.

#### Veritabanını Oluşturun
```sql
CREATE DATABASE chatDB;
```

#### Veritabanına Bağlanın
```sql
\c chatDB
```

#### Tabloları Oluşturun
```sql
-- Kullanıcılar tablosu
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Test verisi (opsiyonel)
INSERT INTO users (name, email, password) VALUES 
  ('Ahmet Yılmaz', 'ahmet@example.com', 'hashed_password_123'),
  ('Ayşe Demir', 'ayse@example.com', 'hashed_password_456');
```

### 3. Backend Kurulumu

#### Backend Klasörüne Gidin
```bash
cd server
```

#### Gerekli Paketleri Yükleyin
```bash
npm install
```

#### .env Dosyası Oluşturun
`server` klasörü içinde `.env` dosyası oluşturun ve aşağıdaki içeriği ekleyin:

```env
PG_HOST=localhost
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=your_postgres_password
PG_DATABASE=chatDB
```

> **Önemli:** `PG_PASSWORD` değerini PostgreSQL kurulumu sırasında belirlediğiniz şifre ile değiştirin.

#### Backend'i Başlatın
```bash
node index.js
```

Backend şu adreste çalışacak: `http://localhost:3001`

#### API'yi Test Edin
Tarayıcıdan veya Postman'den:
- `http://localhost:3001/api/hello` - Test endpoint
- `http://localhost:3001/api/users` - Kullanıcıları listele

### 4. Frontend Kurulumu

#### Ana Klasöre Dönün
```bash
cd ..
```

#### Gerekli Paketleri Yükleyin
```bash
npm install
```

#### Frontend'i Başlatın
```bash
npm run dev
```

Frontend şu adreste çalışacak: `http://localhost:3000`

## 📁 Proje Yapısı

```
chatin/
├── app/                    # Next.js sayfaları
│   ├── (auth)/            # Giriş/Kayıt sayfaları
│   ├── (main)/            # Ana uygulama sayfaları
│   └── api/               # Frontend API fonksiyonları
├── components/            # React bileşenleri
├── server/                # Backend (Express.js)
│   ├── routes/           # API route'ları
│   ├── db.js             # PostgreSQL bağlantısı
│   ├── index.js          # Express server
│   └── .env              # Backend ortam değişkenleri (manuel oluşturulmalı)
├── lib/                   # Yardımcı kütüphaneler
├── hooks/                 # Custom React hooks
├── store/                 # State management
└── types/                 # TypeScript tip tanımları
```

## 🔧 Geliştirme

### Backend (Express)
```bash
cd server
node index.js
```

Backend değişikliklerinden sonra server'ı yeniden başlatın (Ctrl+C, sonra tekrar `node index.js`).

### Frontend (Next.js)
```bash
npm run dev
```

Next.js hot-reload destekler, değişiklikler otomatik yansır.

## 🗄️ Veritabanı Şeması

### Users Tablosu
| Alan | Tip | Açıklama |
|------|-----|----------|
| id | SERIAL | Primary key |
| name | VARCHAR(100) | Kullanıcı adı |
| email | VARCHAR(100) | E-posta (unique) |
| password | VARCHAR(255) | Hash'lenmiş şifre |
| created_at | TIMESTAMP | Kayıt tarihi |

## 🌐 API Endpoints

### GET /api/hello
Test endpoint - Backend'in çalışıp çalışmadığını kontrol eder.

**Response:**
```json
{
  "message": "Hello from backend!"
}
```

### GET /api/users
Tüm kullanıcıları listeler.

**Response:**
```json
[
  {
    "id": 1,
    "name": "Ahmet Yılmaz",
    "email": "ahmet@example.com",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
]
```

## ❗ Yaygın Sorunlar

### Backend başlatılamıyor (PostgreSQL bağlantı hatası)
- PostgreSQL'in çalıştığından emin olun
- `.env` dosyasındaki şifre ve veritabanı adının doğru olduğunu kontrol edin
- `chatDB` veritabanının oluşturulduğunu doğrulayın

### "password authentication failed" hatası
PostgreSQL şifresini sıfırlayın:
```sql
ALTER USER postgres WITH PASSWORD 'yeni_sifre';
```
Sonra `.env` dosyasındaki `PG_PASSWORD` değerini güncelleyin.

### Port zaten kullanımda
- Frontend için port değiştirme: `package.json` içinde `"dev": "next dev -p 3001"`
- Backend için port değiştirme: `server/index.js` içinde `app.listen(3002, ...)`

## 📝 Notlar

- `.env` dosyası `.gitignore`'da yer alır, her geliştirici kendi `.env` dosyasını oluşturmalıdır
- Production ortamında environment variables hosting platformunda ayarlanmalıdır
- Şifreler mutlaka hash'lenerek saklanmalıdır (örn: bcrypt kullanarak)

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add some amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

