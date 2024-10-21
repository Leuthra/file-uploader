const { Readable } = require("stream");
const { format } = require("date-fns");
const path = require("path");

function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
}

function bufferToStream(buffer) {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return format(date, "hh:mm aa, dd MMMM yyyy");
}

function checkFileType(file, cb) {
  const filetypes =
    /jpeg|jpg|png|gif|pdf|doc|docx|mp4|avi|mov|mkv|ppt|pptx|xls|xlsx/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "video/mp4",
    "video/x-msvideo",
    "video/quicktime",
    "video/x-matroska",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];

  const mimetype = mimetypes.includes(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(
      "Error: Only images, videos, gifs, docs, PDFs, presentations, and spreadsheets are allowed!"
    );
  }
}

module.exports = {
  generateRandomString,
  bufferToStream,
  formatDate,
  checkFileType,
};
