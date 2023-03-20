const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.get("/search", async (req, res) => {
  res.status(200).send("Hello");
});
