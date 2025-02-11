require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const app = express();

// Cấu hình EJS
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Kết nối PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});

// Route chính
app.get('/', (req, res) => {
  res.render('index');
});

// Thêm sản phẩm
app.post('/add-product', async (req, res) => {
  const { name, price, description } = req.body;
  await pool.query(
    'INSERT INTO products (name, price, description) VALUES ($1, $2, $3)',
    [name, price, description]
  );
  res.redirect('/');
});

// Tìm kiếm sản phẩm
app.get('/search', async (req, res) => {
  const searchTerm = req.query.term;
  const result = await pool.query(
    "SELECT * FROM products WHERE name ILIKE $1",
    [`%${searchTerm}%`]
  );
  res.render('results', { products: result.rows });
});

// Khởi động server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server chạy trên port ${PORT}`);
});