const { Pool } = require('pg');

// .env zaten index.js'de yüklendi, burada tekrar yüklemeye gerek yok

const pool = new Pool({
  host: process.env.PG_HOST,
  port: parseInt(process.env.PG_PORT),
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
});

module.exports = pool;

// const db = require('./db'); // db.js dosyasını import ederek kullanabiliriz