# Database Migration - User Drawings

## Nasıl Çalıştırılır?

PostgreSQL veritabanınıza bağlanarak aşağıdaki komutu çalıştırın:

```bash
psql -U postgres -d chatin -f update_user_drawings.sql
```

**VEYA** pgAdmin üzerinden:
1. pgAdmin'i açın
2. `chatin` veritabanına sağ tıklayın
3. "Query Tool" seçin
4. `update_user_drawings.sql` dosyasının içeriğini kopyalayıp yapıştırın
5. Execute (F5) tuşuna basın

## Bu Migration Ne Yapar?

1. `user_drawings` tablosu yoksa oluşturur
2. Varsa eksik kolonları ekler:
   - `title` (VARCHAR 255) - Çizim başlığı
   - `labels` (TEXT) - Etiketler
   - `description` (TEXT) - Açıklama
   - `created_at` (TIMESTAMP) - Oluşturulma tarihi

3. Performans için index'ler ekler:
   - `user_id` üzerine
   - `created_at` üzerine (DESC)

## Tablo Yapısı

```sql
CREATE TABLE user_drawings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    labels TEXT,
    description TEXT,
    url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

