require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const app = express();

// Cấu hình EJS
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Kết nối PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Bắt buộc khi kết nối đến Render PostgreSQL
  }
});

// Route chính
app.get("/", (req, res) => {
  res.render("index");
});

// Thêm sản phẩm
app.post("/add-product", async (req, res) => {
  const { name, price, description } = req.body;

  try {
    // Kiểm tra dữ liệu đầu vào
    if (!name || !price || !description) {
      return res.status(400).send("Vui lòng điền đầy đủ thông tin sản phẩm.");
    }

    // Thêm sản phẩm vào database
    await pool.query(
      "INSERT INTO products (name, price, description) VALUES ($1, $2, $3)",
      [name, price, description]
    );

    // Chuyển hướng về trang chủ sau khi thêm thành công
    res.redirect("/");
  } catch (error) {
    console.error("Lỗi khi thêm sản phẩm:", error);
    res.status(500).send("Đã xảy ra lỗi khi thêm sản phẩm.");
  }
});
// Tìm kiếm sản phẩm
app.get("/search", async (req, res) => {
  const searchTerm = req.query.term;
  const result = await pool.query(
    "SELECT * FROM products WHERE name ILIKE $1",
    [`%${searchTerm}%`]
  );
  res.render("results", { products: result.rows });
});

// Khởi động server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server chạy trên port ${PORT}`);
});
