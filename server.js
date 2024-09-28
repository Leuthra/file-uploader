const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const mime = require("mime-types");
const admin = require("firebase-admin");
const serviceAccount = require("./firebaseServiceAccountKey.json");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

const bucket = admin.storage().bucket();

const uploadDir = path.join(__dirname, "public", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = generateRandomString() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({ storage: multer.memoryStorage() });

app.use(express.static("public"));

function checkFileSize(req, res, next) {
  if (req.file && req.file.size > 50 * 1024 * 1024) {
    res.setHeader("Content-Type", "application/json");
    return res
      .status(400)
      .send(JSON.stringify({ error: "Error: File max upload 50MB" }, null, 2));
  }
  next();
}

app.post("/upload", upload.single("fileInput"), checkFileSize, (req, res) => {
  if (!req.file) {
    res.setHeader("Content-Type", "application/json");
    return res
      .status(400)
      .send(JSON.stringify({ error: "No file uploaded." }, null, 2));
  }

  const blob = bucket.file(req.file.originalname);
  const blobStream = blob.createWriteStream({
    metadata: {
      contentType: req.file.mimetype,
    },
  });

  blobStream.on("error", (err) => {
    console.error("Error uploading to Firebase:", err);
    res.status(500).send({ error: "Error uploading file" });
  });

  blobStream.on("finish", () => {
    const publicUrl = process.env.PUBLIC_URL + `/${blob.name}`;
    console.log("File uploaded to Firebase:", publicUrl);

    const jsonResponse = {
      Developer: "Romi Muharom",
      status: "success",
      file_size: (req.file.size / 1024).toFixed(2) + " KB",
      url_response: publicUrl,
    };

    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify(jsonResponse, null, 2));
  });

  blobStream.end(req.file.buffer);
});

async function fetchFirebaseFiles() {
  try {
    const [files] = await bucket.getFiles();
    let allFiles = [];
    files.forEach((file) => {
      allFiles.push({
        fileName: file.name,
        size: file.metadata.size ? parseInt(file.metadata.size, 10) : 0,
      });
    });

    return allFiles;
  } catch (err) {
    console.error("Error fetching files from Firebase:", err);
    throw err;
  }
}

app.get("/files", async (req, res) => {
  try {
    const allFiles = await fetchFirebaseFiles();

    const totalSize = allFiles.reduce((acc, file) => acc + file.size, 0);
    const jsonResponse = {
      totalFiles: allFiles.length,
      totalSize: (totalSize / (1024 * 1024)).toFixed(2) + " MB",
    };

    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify(jsonResponse, null, 2));
  } catch (err) {
    console.error("Error in /files endpoint:", err);
    res.setHeader("Content-Type", "application/json");
    res
      .status(500)
      .send(JSON.stringify({ error: "Oops something went wrong" }, null, 2));
  }
});

app.get("/uploads/:filename", async (req, res) => {
  const filename = req.params.filename;

  try {
    const file = bucket.file(filename);
    const [metadata] = await file.getMetadata();
    const readStream = file.createReadStream();

    res.setHeader("Content-Type", metadata.contentType);
    readStream.pipe(res);
    readStream.on("error", (err) => {
      console.error("Error fetching file from Firebase:", err);
      res
        .status(404)
        .sendFile(path.join(__dirname, "public", "file-notfound.html"));
    });
  } catch (err) {
    console.error("Error in /uploads endpoint:", err);
    res.status(500).send("Error fetching file from Firebase");
  }
});

app.get("/history", async (req, res) => {
  try {
    const [files] = await bucket.getFiles();

    if (files.length === 0) {
      return res.status(200).json({ message: "No files available" });
    }

    const sortedFiles = files.sort((a, b) => {
      return (
        new Date(b.metadata.timeCreated) - new Date(a.metadata.timeCreated)
      );
    });

    const latestFile = sortedFiles[0];
    const urls = process.env.PUBLIC_URL;
    const publicUrl = `${urls}/${encodeURIComponent(latestFile.name)}`;

    const jsonResponse = {
      fileName: latestFile.name,
      url: publicUrl,
      size: (latestFile.metadata.size / (1024 * 1024)).toFixed(2) + " MB",
    };

    res.setHeader("Content-Type", "application/json");
    res.status(200).send(JSON.stringify(jsonResponse, null, 2));
  } catch (err) {
    console.error("Error fetching files from Firebase:", err);
    res.status(500).send({ error: "Failed to fetch file history" });
  }
});

app.use(express.static("public"));

app.use((req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, "public", "404.html"));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
