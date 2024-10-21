function checkFileSize(req, res, next) {
    if (req.file && req.file.size > 50 * 1024 * 1024) {
      res.setHeader("Content-Type", "application/json");
      return res
        .status(400)
        .send(JSON.stringify({ error: "Error: File max upload 50MB" }, null, 2));
    }
    next();
  }
  
  module.exports = checkFileSize;
  