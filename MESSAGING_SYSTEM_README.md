# 💬 Mesajlaşma Sistemi Dokümantasyonu

## 📚 Genel Bakış

Bu sistem, hem **grup sohbetleri** hem de **birebir mesajlaşma** için kalıcı mesaj desteği sağlar.

### 🎯 Özellikler

- ✅ Gerçek zamanlı mesajlaşma (Socket.IO)
- ✅ Veritabanına kalıcı kayıt
- ✅ Grup sohbetleri
- ✅ Birebir (DM) sohbetler
- ✅ Mesaj geçmişi
- ✅ Okundu bilgisi
- ✅ Otomatik scroll

---

## 🏗️ Veritabanı Yapısı

### Messages Tablosu

```sql
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  sender_id INTEGER NOT NULL,
  receiver_id INTEGER NULL,        -- Birebir mesaj ise dolu
  chat_group_id INTEGER NULL,      -- Grup mesajı ise dolu
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_read BOOLEAN DEFAULT false
);
```

### Tablo Oluşturma

```bash
# PostgreSQL'e bağlan
psql -U postgres -d your_database

# SQL dosyasını çalıştır
\i server/create_messages_table.sql
```

---

## 🔑 RoomID Sistemi

### Grup Sohbetleri
```typescript
// Grup ID: 123
roomId = "group_123"
```

### Birebir Mesajlaşma
```typescript
// Kullanıcı 1 ve Kullanıcı 5 arasında
// Küçük ID önce gelir
roomId = "dm_1_5"
```

### Helper Fonksiyonlar

```typescript
import { createDMRoomId, createGroupRoomId } from '@/lib/roomUtils';

// Birebir sohbet oluştur
const roomId = createDMRoomId(userId1, userId2);
// Sonuç: "dm_1_5"

// Grup sohbeti oluştur
const groupRoom = createGroupRoomId(groupId);
// Sonuç: "group_123"
```

---

## 🚀 Backend API

### 1. Mesaj Gönder
```http
POST http://localhost:3001/api/messages
Content-Type: application/json

{
  "roomId": "dm_1_5",
  "senderId": 1,
  "message": "Merhaba!"
}
```

### 2. Mesajları Getir
```http
GET http://localhost:3001/api/messages/dm_1_5?limit=50&offset=0
```

**Response:**
```json
{
  "success": true,
  "messages": [
    {
      "id": 1,
      "sender_id": 1,
      "receiver_id": 5,
      "message": "Merhaba!",
      "created_at": "2025-11-02T10:30:00",
      "is_read": true,
      "sender_name": "Ahmet",
      "sender_picture": "/defaultpp.jpg"
    }
  ],
  "count": 1
}
```

### 3. Kullanıcının Tüm Sohbetlerini Getir
```http
GET http://localhost:3001/api/messages/user/1/conversations
```

**Response:**
```json
{
  "success": true,
  "conversations": {
    "groups": [
      {
        "room_id": "group_1",
        "type": "group",
        "chat_id": 1,
        "chat_name": "İş Grubu",
        "last_message": "Toplantı yarın saat 10'da",
        "last_message_time": "2025-11-02T15:30:00"
      }
    ],
    "directMessages": [
      {
        "room_id": "dm_1_5",
        "type": "dm",
        "other_user_id": 5,
        "chat_name": "Ayşe Demir",
        "chat_picture": "/defaultpp.jpg",
        "last_message": "Görüşürüz",
        "last_message_time": "2025-11-02T14:20:00"
      }
    ]
  }
}
```

### 4. Mesajları Okundu İşaretle
```http
PUT http://localhost:3001/api/messages/dm_1_5/read
Content-Type: application/json

{
  "userId": 5
}
```

---

## 💻 Frontend Kullanımı

### ChatWindow Component'inde Kullanım

```typescript
import { createDMRoomId } from '@/lib/roomUtils';

// Birebir sohbet için
const friendId = 5;
const currentUserId = 1;
const roomId = createDMRoomId(currentUserId, friendId);

// Grup sohbeti için
const groupId = 123;
const roomId = `group_${groupId}`;

// Component'e geç
<ChatWindow chatId={roomId} />
```

### Mesaj Gönderme

```typescript
import { sendMessage } from '@/lib/socket';

sendMessage({
  roomId: "dm_1_5",
  message: "Merhaba!",
  senderId: 1,
  senderName: "Ahmet"
});
```

### Mesaj Dinleme

```typescript
import { onMessage } from '@/lib/socket';

onMessage((data) => {
  console.log('Yeni mesaj:', data);
  // Mesajı UI'a ekle
});
```

---

## 🔄 Socket.IO Event'leri

### Client → Server

| Event | Açıklama | Data |
|-------|----------|------|
| `join_room` | Odaya katıl | `roomId: string` |
| `send_message` | Mesaj gönder | `{ roomId, message, senderId, senderName }` |
| `typing` | Yazıyor bildirimi | `{ roomId, userName }` |

### Server → Client

| Event | Açıklama | Data |
|-------|----------|------|
| `receive_message` | Yeni mesaj alındı | `{ id, roomId, message, senderId, created_at }` |
| `user_typing` | Kullanıcı yazıyor | `{ roomId, userName }` |

---

## 📝 Örnek Kullanım Senaryoları

### 1. Birebir Mesajlaşma

```typescript
// 1. RoomID oluştur
const roomId = createDMRoomId(1, 5); // "dm_1_5"

// 2. Odaya katıl
joinRoom(roomId);

// 3. Eski mesajları yükle
const response = await fetch(`http://localhost:3001/api/messages/${roomId}`);
const data = await response.json();

// 4. Mesaj gönder
sendMessage({
  roomId,
  message: "Merhaba!",
  senderId: 1,
  senderName: "Ahmet"
});
```

### 2. Grup Sohbeti

```typescript
// 1. RoomID oluştur
const roomId = createGroupRoomId(123); // "group_123"

// 2. Odaya katıl
joinRoom(roomId);

// 3. Eski mesajları yükle
const response = await fetch(`http://localhost:3001/api/messages/${roomId}`);
const data = await response.json();

// 4. Mesaj gönder
sendMessage({
  roomId,
  message: "Herkese merhaba!",
  senderId: 1,
  senderName: "Ahmet"
});
```

---

## 🎮 Çalıştırma

### Backend

```bash
cd server
node index.js
```

### Frontend

```bash
npm run dev
```

---

## 🐛 Sorun Giderme

### Mesajlar veritabanına kaydedilmiyor

1. `messages` tablosunun oluşturulduğundan emin olun
2. Server console'unda hata mesajlarını kontrol edin
3. Database bağlantı bilgilerini kontrol edin

### Socket bağlantısı kurulamıyor

1. Backend server'ın çalıştığından emin olun (port 3001)
2. CORS ayarlarını kontrol edin
3. Browser console'unda hata mesajlarını kontrol edin

### Mesajlar duplike oluyor

ChatWindow component'inde duplikasyon önleme kodu var:

```typescript
setMessages((prev) => {
  const exists = prev.some(msg => msg.id === data.id?.toString());
  if (exists) return prev;
  // ...
});
```

---

## 📊 Performans İpuçları

1. **Sayfalama**: Mesajları yüklerken `limit` ve `offset` kullanın
2. **İndeksler**: Veritabanında uygun indekslerin olduğundan emin olun
3. **Lazy Loading**: Scroll olduğunda eski mesajları yükleyin
4. **Cleanup**: Component unmount olduğunda socket listener'ları temizleyin

---

## 🔐 Güvenlik Notları

1. Kullanıcı authentication'ı ekleyin
2. Mesaj içeriklerini sanitize edin (XSS önleme)
3. Rate limiting uygulayın
4. Socket.IO authentication ekleyin
5. SQL injection'a karşı parametrize sorgular kullanın (✅ Zaten var)

---

## 🎯 Gelecek Geliştirmeler

- [ ] Mesaj düzenleme
- [ ] Mesaj silme
- [ ] Dosya gönderme
- [ ] Emoji reaksiyonları
- [ ] Mesaj arama
- [ ] Push notifications
- [ ] Ses/video görüşme

---

## 📞 Destek

Sorunlarınız için GitHub issues'ı kullanabilirsiniz.

