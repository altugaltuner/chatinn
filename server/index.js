const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { Server } = require('socket.io');

// .env dosyasını server klasöründen yükle
require("dotenv").config({ path: path.join(__dirname, ".env") });

// Test: .env değerleri yüklendi mi?
console.log("=== Environment Variables Test ===");
console.log("PG_HOST:", process.env.PG_HOST);
console.log("PG_PASSWORD:", process.env.PG_PASSWORD);
console.log("==================================");

// Bunların hepsi middleware'lerdir.
const app = express(); // express app oluştur
app.use(cors()); // cors policy'yi ayarla, 
// Bu demek: "Tüm origin'lerden gelen isteklere izin ver!"
// Yani frontend'den backend'e istek atabilirsin
app.use(express.json()); // express app'a json verileri alabilmek için
// end line of middlewares

// HTTP server oluştur (Express ile)
const server = http.createServer(app);

// Socket.IO'yu HTTP server'a bağla
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Next.js frontend URL'i
    methods: ["GET", "POST"]
  }
});

// Socket.IO bağlantı yönetimi
io.on('connection', (socket) => {
  console.log('✅ Yeni kullanıcı bağlandı:', socket.id);

  // Kullanıcı bir odaya katılırken
  socket.on('join_room', (roomId) => { // Server'a join_room eventi geldiğinde
    socket.join(roomId); // Kullanıcıyı "roomId" ile belirtilen odaya join et (socket.io'da join kullanılır)
    console.log(`👤 ${socket.id} kullanıcısı ${roomId} odasına katıldı`);
  });

  // Mesaj gönderildiğinde
  socket.on('send_message', async (data) => {
    console.log('📩 Mesaj alındı:', data);

    try {
      // Mesajı veritabanına kaydet
      const { roomId, message, senderId } = data;

      if (!roomId.startsWith('dm_')) {
        console.error('❌ Geçersiz roomId formatı:', roomId);
        return;
      }

      // Birebir mesaj
      const parts = roomId.replace('dm_', '').split('_');
      const userId1 = parseInt(parts[0]);
      const userId2 = parseInt(parts[1]);
      const receiverId = userId1 === senderId ? userId2 : userId1;

      const query = 'INSERT INTO messages (sender_id, receiver_id, message, created_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP) RETURNING *';
      const values = [senderId, receiverId, message];

      const result = await db.query(query, values);
      console.log('💾 Mesaj veritabanına kaydedildi:', result.rows[0].id);

      // Kaydedilen mesajı da gönder (id ile birlikte)
      const savedMessage = {
        ...data,
        id: result.rows[0].id,
        created_at: result.rows[0].created_at
      };

      // Mesajı ilgili odaya gönder
      // Backend: Sadece o odaya mesaj gönder
      // io.to('dm_2_5').emit('receive_message', data);
      // Sadece 'dm_2_5' odasındakiler bu mesajı alır!
      io.to(roomId).emit('receive_message', savedMessage); // receive_message eventi gönderiliyor. Bu sayede chatwindowdaki callback çalıştırılacak. 
      // savedMessage data'sı gönderiliyor, chatwindowdaki data = savedMessage olacak.
    } catch (err) {
      console.error('❌ Mesaj kaydetme hatası:', err);
      // Hata olsa bile mesajı socket üzerinden gönder
      io.to(data.roomId).emit('receive_message', data);
    }
  });

  // Kullanıcı yazıyor bildirimi
  socket.on('typing', (data) => {
    socket.to(data.roomId).emit('user_typing', data);
  });

  // Kullanıcı bağlantıyı kestiğinde
  socket.on('disconnect', () => {
    console.log('❌ Kullanıcı ayrıldı:', socket.id);
  });
});

// Server'ı başlat (app.listen değil, server.listen!)
server.listen(3001, () => {
  console.log("🚀 Server running on http://localhost:3001");
  console.log("🔌 Socket.IO is ready");
});

app.get("/api/hello", (req, res) => {
  // res.send("Hello World");
  res.json({ message: "Hello from backend!" });
});

//IMPORTS
const usersRouter = require("./routes/users.js"); // burada users.js dosyasını import ediyoruz ve usersRoutera atıyoruz.
const userRouter = require("./routes/user.js"); // Tek kullanıcı için route
const publicGroupsRouter = require("./routes/public-groups.js");
const privateGroupsRouter = require("./routes/private-groups.js");
const groupsRouter = require("./routes/groups.js");
const authRouter = require("./routes/auth.js"); // Authentication route
const friendshipsRouter = require("./routes/friendships.js"); // Friendships route
const messagesRouter = require("./routes/messages.js"); // Messages route
const db = require("./db"); // Database connection

app.use("/api/auth", authRouter); // Authentication: http://localhost:3001/api/auth/signin, /signup
app.use("/api/messages", messagesRouter); // Messages: http://localhost:3001/api/messages
app.use("/api/private-groups", privateGroupsRouter);
app.use("/api/users", usersRouter); // usersRouter'ı /api/users yoluna ekliyoruz sunucuda. http://localhost:3001/api/users buraya gidince gelebilsin diye.
app.use("/api/user", userRouter); // Tek kullanıcı için: http://localhost:3001/api/user/1
app.use("/api/public-groups", publicGroupsRouter);
app.use("/api/groups", groupsRouter);
app.use("/api/friendships", friendshipsRouter); // Friendships: http://localhost:3001/api/friendships
app.use("/api/myfriends", friendshipsRouter);
