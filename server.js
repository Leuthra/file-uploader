const express = require("express");
require("dotenv").config();
const fileRoutes = require("./routes/fileRoutes.js");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/", fileRoutes);

// Error handling routes
app.use((req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, "public", "404.html"));
});

app.use((err, req, res, next) => {
  res.status(500).sendFile(path.join(__dirname, "public", "500.html"));
});

// security
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'none'; object-src 'none';"
  );
  next();
});

app.listen(port, () => {
  console.log(`Server running at ${process.env.PUBLIC_URL}`);
});
