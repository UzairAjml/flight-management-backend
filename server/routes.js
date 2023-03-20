const express = require("express");
const router = express.Router();

router.get("/search", async (req, res) => {
  res.status(200).send("Hello");
});

module.exports = router;
