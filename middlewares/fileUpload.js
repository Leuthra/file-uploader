const multer = require("multer");
const path = require("path");
const { generateRandomString, checkFileType } = require("../utils/helpers.js");

const uploadDirectory = path.join(__dirname, "..", "uploads");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDirectory);
  },
  filename: function (req, file, cb) {
    const uniqueName = generateRandomString() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage:
    process.env.STORAGE === "firebase" ? multer.memoryStorage() : storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

module.exports = upload;
