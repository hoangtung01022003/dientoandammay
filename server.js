require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const app = express();

// Cấu hình EJS & Middleware
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Kết nối PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Cần thiết cho Render PostgreSQL
  }
});

// Trang chủ: Hiển thị danh sách sản phẩm
app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products ORDER BY id DESC");
    res.render("index", { products: result.rows });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách sản phẩm:", error);
    res.status(500).send("Lỗi khi tải sản phẩm.");
  }
});

// Thêm sản phẩm
app.post("/add-product", async (req, res) => {
  const { name, price, description } = req.body;
  try {
    if (!name || !price || !description) {
      return res.status(400).send("Vui lòng điền đầy đủ thông tin sản phẩm.");
    }
    await pool.query(
      "INSERT INTO products (name, price, description) VALUES ($1, $2, $3)",
      [name, price, description]
    );
    res.redirect("/");
  } catch (error) {
    console.error("Lỗi khi thêm sản phẩm:", error);
    res.status(500).send("Đã xảy ra lỗi khi thêm sản phẩm.");
  }
});

// Tìm kiếm sản phẩm
app.get("/search", async (req, res) => {
  const searchTerm = req.query.term;
  try {
    const result = await pool.query(
      "SELECT * FROM products WHERE name ILIKE $1",
      [`%${searchTerm}%`]
    );
    res.render("results", { products: result.rows });
  } catch (error) {
    console.error("Lỗi khi tìm kiếm sản phẩm:", error);
    res.status(500).send("Lỗi khi tìm kiếm.");
  }
});

// Hiển thị trang chỉnh sửa sản phẩm
app.get("/edit-product/:id", async (req, res) => {
  const productId = req.params.id;
  try {
    const result = await pool.query("SELECT * FROM products WHERE id = $1", [
      productId,
    ]);
    if (result.rows.length > 0) {
      res.render("edit-product", { product: result.rows[0] });
    } else {
      res.status(404).send("Không tìm thấy sản phẩm.");
    }
  } catch (error) {
    console.error("Lỗi khi lấy thông tin sản phẩm:", error);
    res.status(500).send("Lỗi khi tải trang chỉnh sửa.");
  }
});

// Cập nhật sản phẩm
app.post("/update-product/:id", async (req, res) => {
  const productId = req.params.id;
  const { name, price, description } = req.body;
  try {
    await pool.query(
      "UPDATE products SET name = $1, price = $2, description = $3 WHERE id = $4",
      [name, price, description, productId]
    );
    res.redirect("/");
  } catch (error) {
    console.error("Lỗi khi cập nhật sản phẩm:", error);
    res.status(500).send("Lỗi khi cập nhật sản phẩm.");
  }
});

// Xóa sản phẩm
app.post("/delete-product/:id", async (req, res) => {
  const productId = req.params.id;
  try {
    await pool.query("DELETE FROM products WHERE id = $1", [productId]);
    res.redirect("/");
  } catch (error) {
    console.error("Lỗi khi xóa sản phẩm:", error);
    res.status(500).send("Lỗi khi xóa sản phẩm.");
  }
});

// Khởi động server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server chạy trên port ${PORT}`);
});
