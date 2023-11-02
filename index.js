const mysql = require("mysql");
const express = require("express");
const app = express();
const path = require("path");
const multer = require("multer");
const bodyParser = require("body-parser");
const { error } = require("console");

app.set("view engine", "ejs");
app.set("views", "views");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// koneksi ke database
const koneksi = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "nodejs",
});
koneksi.connect((err) => {
  console.log("koneksi berhasil");
});

// halaman untuk login
app.get("/", (req, res) => {
  res.render("index");
});
// jika login berhasil
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const query = "SELECT * FROM tb_admin WHERE Username= ? AND Password= ?;";
  koneksi.query(query, [username, password], (error, result) => {
    if (error) {
      console.log(error);
    } else {
      if (result.length > 0) {
        res.render("home");
      } else {
        res.send("data tidak valid");
      }
    }
  });
});

// rute ke halaman home
app.get("/home", (req, res) => {
  res.render("home");
});

// rute ke halaman shop
app.get("/shop", (req, res) => {
  const query = "SELECT * FROM tb_barang;";
  koneksi.query(query, (error, result) => {
    if (error) {
      res.status(401).send(error);
    } else res.render("shop", { results: result });
  });
});

// nambah barang
app.get("/add", (req, res) => {
  res.render("addbarang");
});
// Konfigurasi penyimpanan gambar
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/img"); // Ganti dengan direktori penyimpanan gambar yang sesuai
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });
//tambah barang
app.post("/tambah", upload.single("foto_barang"), (req, res) => {
  const { nama_barang, stock_barang, harga_barang } = req.body;
  const foto_barang = req.file.filename; // Dapatkan nama file yang diunggah
  const query = 'INSERT INTO tb_barang(id_barang,nama_barang,stock_barang,harga_barang,foto_barang) VALUES ("",?,?,?,?);';
  koneksi.query(query, [nama_barang, stock_barang, harga_barang, foto_barang], (error, result) => {
    if (error) {
      res.send(error);
    } else {
      res.redirect("/shop");
    }
  });
});

//menghapus barang
app.get("/delete/:id", (req, res) => {
  const id_barang = req.params.id;
  const query = "DELETE FROM tb_barang WHERE id_barang = ?;";
  koneksi.query(query, [id_barang], (error, result) => {
    if (error) throw error;
    res.redirect("/shop");
  });
});

// update data barang
app.get("/update/:id", (req, res) => {
  const id_barang = req.params.id;
  const query = "SELECT * FROM tb_barang WHERE id_barang = ?;";
  koneksi.query(query, [id_barang], (error, result) => {
    if (error) throw error;
    res.render("update", { results: result });
  });
});
app.post("/update/:id", upload.single("foto_barang"), (req, res) => {
  const id_barang = req.params.id;
  const { nama_barang, stock_barang, harga_barang } = req.body;
  const foto_barang = req.file.filename;
  const query = "UPDATE tb_barang SET nama_barang = ?,stock_barang = ?, harga_barang = ? ,foto_barang =? WHERE id_barang=?;";
  koneksi.query(query, [nama_barang, stock_barang, harga_barang, foto_barang, id_barang], (error, result) => {
    if (error) throw error;
    res.redirect("/shop");
  });
});

// =======================CUSTOMER================================
app.get("/customer", (req, res) => {
  res.render("logCustomer");
});
//route login customer
app.post("/logCustomer", (req, res) => {
  const { email, password } = req.body;
  const query = "SELECT * FROM tb_customer WHERE email = ? AND password = ?;";
  koneksi.query(query, [email, password], (error, result) => {
    if (error) {
      res.status(404).send(error);
    } else {
      if (result.length > 0) {
        res.render("homecus", { results: result });
      } else {
        res.send("data tidak valid");
      }
    }
  });
});

//route home customer
app.get("/homecustomer/:id", (req, res) => {
  const id_customer = req.params.id;
  const sql = "SELECT * FROM tb_customer WHERE id_customer=?;";
  koneksi.query(sql, [id_customer], (error, result) => {
    if (error) throw error;
    res.render("homecus", { results: result });
  });
});

// route shop customer
app.get("/shopCustomer/:id", (req, res) => {
  const sql = "SELECT * FROM tb_barang;";
  const id_customer = req.params.id;
  koneksi.query(sql, (error, result) => {
    if (error) throw error;
    res.render("shopcus", { results: result, id: id_customer });
  });
});

// route cart shop
app.get("/cart/:id", (req, res) => {
  const id_barang = req.params.id;
  const sql = "SELECT * FROM tb_barang WHERE id_barang=?;";
  koneksi.query(sql, [id_barang], (error, result) => {
    if (error) throw error;
    res.render("cart", { results: result });
  });
});
// route pembelian
app.post("/history", (req, res) => {
  const { nama, harga, foto } = req.body;
  const query = "INSERT INTO tb_history(id_history,name,harga,foto) VALUES ('',?,?,?);";
  koneksi.query(query, [nama, harga, foto], (error, result) => {
    if (error) {
      res.send(error);
    } else {
      res.redirect("/customer");
    }
  });
});

// ==========history customer
app.get("/hiscus", (req, res) => {
  const query = "SELECT * FROM tb_history";
  koneksi.query(query, (error, result) => {
    res.render("history", { results: result });
  });
});
// port
app.listen(3000, () => {
  console.log("https://localhost:3000");
});
