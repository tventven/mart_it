const express = require("express");
const body_parser = require("body-parser");
const koneksi = require("./koneksi");
const app = express();

app.use(express.urlencoded({ extended: true }));
