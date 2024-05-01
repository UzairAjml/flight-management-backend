var createError = require("http-errors");
var express = require("express");
var logger = require("morgan");
var indexRouter = require("./router/index");
const cors = require("cors");
const mongoose = require("mongoose");

var app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

mongoose
  .connect("mongodb+srv://sjmugha:Kitkat123@falcon-apparel.jcwsk9r.mongodb.net/", {})
  .then(() => {
    console.log("--------------------Connected to MongoDB--------------------");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

app.use(logger("dev"));
app.use(
  cors({
    origin: "*",
  })
);

app.use("/api", indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render("error");
});
app.listen(process.env.PORT || 5001);

module.exports = app;
