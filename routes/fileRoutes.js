const express = require("express");
const router = express.Router();
const { uploadFile, getAllFiles, getFileHistory, getFileByProxy, getAllFilesWithTotalSize } = require("../controllers/fileController.js");
const upload = require("../middlewares/fileUpload.js");
const checkFileSize = require("../middlewares/checkFileSize.js");

router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});
router.post("/upload", upload.single("fileInput"), checkFileSize, uploadFile);
router.get("/all", getAllFiles);
router.get("/history", getFileHistory);
router.get("/file/:filename", getFileByProxy);
router.get("/files", getAllFilesWithTotalSize);

module.exports = router;
