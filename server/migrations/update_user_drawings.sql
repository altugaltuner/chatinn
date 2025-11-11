-- user_drawings tablosuna gerekli kolonları ekle
-- Eğer tablo yoksa önce oluştur
CREATE TABLE IF NOT EXISTS user_drawings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    labels TEXT,
    description TEXT,
    url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Eğer tablo varsa ve kolonlar yoksa ekle
DO $$ 
BEGIN
    -- title kolonu yoksa ekle
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='user_drawings' AND column_name='title') THEN
        ALTER TABLE user_drawings ADD COLUMN title VARCHAR(255);
    END IF;

    -- labels kolonu yoksa ekle
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='user_drawings' AND column_name='labels') THEN
        ALTER TABLE user_drawings ADD COLUMN labels TEXT;
    END IF;

    -- description kolonu yoksa ekle
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='user_drawings' AND column_name='description') THEN
        ALTER TABLE user_drawings ADD COLUMN description TEXT;
    END IF;

    -- created_at kolonu yoksa ekle
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='user_drawings' AND column_name='created_at') THEN
        ALTER TABLE user_drawings ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- Index'ler ekle (performans için)
CREATE INDEX IF NOT EXISTS idx_user_drawings_user_id ON user_drawings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_drawings_created_at ON user_drawings(created_at DESC);

