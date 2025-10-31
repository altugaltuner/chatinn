const express = require("express");
const cors = require("cors");
const path = require("path");

// .env dosyasını server klasöründen yükle
require("dotenv").config({ path: path.join(__dirname, ".env") });

// Test: .env değerleri yüklendi mi?
console.log("=== Environment Variables Test ===");
console.log("PG_HOST:", process.env.PG_HOST);
console.log("PG_PASSWORD:", process.env.PG_PASSWORD);
console.log("==================================");

const app = express(); // express app oluştur
app.use(cors()); // cors policy'yi ayarla
app.use(express.json()); // express app'a json verileri alabilmek için

app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
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

app.use("/api/auth", authRouter); // Authentication: http://localhost:3001/api/auth/signin, /signup
app.use("/api/private-groups", privateGroupsRouter);
app.use("/api/users", usersRouter); // usersRouter'ı /api/users yoluna ekliyoruz sunucuda. http://localhost:3001/api/users buraya gidince gelebilsin diye.
app.use("/api/user", userRouter); // Tek kullanıcı için: http://localhost:3001/api/user/1
app.use("/api/public-groups", publicGroupsRouter);
app.use("/api/groups", groupsRouter);
app.use("/api/friendships", friendshipsRouter); // Friendships: http://localhost:3001/api/friendships
app.use("/api/myfriends", friendshipsRouter);
