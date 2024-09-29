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

if (process.env.STORAGE === 'firebase') {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

const bucket = process.env.STORAGE === 'firebase' ? admin.storage().bucket() : null;

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
  }
});

const upload = multer({
  storage: process.env.STORAGE === 'firebase' ? multer.memoryStorage() : storage,
});

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

  if (process.env.STORAGE === 'firebase') {
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
        file_name: req.file.originalname,
        file_size: (req.file.size / 1024).toFixed(2) + " KB",
        url_response: publicUrl,
      };

      res.setHeader("Content-Type", "application/json");
      res.send(JSON.stringify(jsonResponse, null, 2));
    });

    blobStream.end(req.file.buffer);
  } else {
    const filePath = path.join(uploadDir, req.file.filename);
    const fileSize = (req.file.size / 1024).toFixed(2) + ' KB'; 
    const fileUrl = `http://${req.get('host')}/uploads/${req.file.filename}`; 

    const jsonResponse = {
      Developer: "Romi Muharom",
      file_name: req.file.filename,
      status: "success",
      file_size: fileSize,
      url_response: fileUrl
    };

    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify(jsonResponse, null, 2));
  }
});

app.get("/uploads/:filename", async (req, res) => {
  const filename = req.params.filename;

  try {
    if (process.env.STORAGE === 'firebase') {
      const file = bucket.file(filename);
      const [exists] = await file.exists();
      if (!exists) {
        return res.status(404).send("File not found");
      }
      const [metadata] = await file.getMetadata();
      const contentType = metadata.contentType || 'application/octet-stream';
      res.setHeader("Content-Type", contentType);
      const readStream = file.createReadStream();
      readStream.pipe(res);
      
      readStream.on("error", (err) => {
        console.error("Error fetching file from Firebase:", err);
        res.status(500).send("Error fetching file from Firebase");
      });
    } else {
      const filePath = path.join(uploadDir, filename);
      if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
      } else {
        res.status(404).send("File not found");
      }
    }
  } catch (err) {
    console.error("Error fetching file:", err);
    res.status(500).send("Error fetching file from Firebase");
  }
});

app.get("/files", async (req, res) => {
  try {
    let allFiles = [];

    if (process.env.STORAGE === 'firebase') {
      const [files] = await bucket.getFiles();
      files.forEach((file) => {
        allFiles.push({
          fileName: file.name,
          size: file.metadata.size ? parseInt(file.metadata.size, 10) : 0,
        });
      });
    } else {
      const files = fs.readdirSync(uploadDir);
      files.forEach((file) => {
        const filePath = path.join(uploadDir, file);
        const stats = fs.statSync(filePath);
        allFiles.push({
          fileName: file,
          size: stats.size,
        });
      });
    }

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
    res.status(500).send(JSON.stringify({ error: "Oops something went wrong" }, null, 2));
  }
});

app.get("/history", async (req, res) => {
  try {
    let latestFile;
    let fileSize = 0;

    if (process.env.STORAGE === 'firebase') {
      const [files] = await bucket.getFiles();
      if (files.length === 0) {
        return res.status(200).json({ message: "No files available" });
      }
      const sortedFiles = files.sort((a, b) => {
        return new Date(b.metadata.timeCreated) - new Date(a.metadata.timeCreated);
      });

      latestFile = sortedFiles[0];
      fileSize = latestFile.metadata.size ? (latestFile.metadata.size / (1024 * 1024)).toFixed(2) + " MB" : "Unknown size";
      const urls = process.env.PUBLIC_URL;
      const publicUrl = `${urls}/${encodeURIComponent(latestFile.name)}`;

      const jsonResponse = {
        fileName: latestFile.name,
        url: publicUrl,
        size: fileSize,
      };
      res.setHeader("Content-Type", "application/json");
      res.send(JSON.stringify(jsonResponse, null, 2));

    } else {
      const files = fs.readdirSync(uploadDir);

      if (files.length === 0) {
        return res.status(200).json({ message: "No files available" });
      }
      const sortedFiles = files.sort((a, b) => {
        const aTime = fs.statSync(path.join(uploadDir, a)).mtime;
        const bTime = fs.statSync(path.join(uploadDir, b)).mtime;
        return bTime - aTime;
      });

      latestFile = sortedFiles[0];
      const filePath = path.join(uploadDir, latestFile);
      const stats = fs.statSync(filePath);
      fileSize = (stats.size / (1024 * 1024)).toFixed(2) + " MB";
      const publicUrl = `${process.env.PUBLIC_URL}/${encodeURIComponent(latestFile)}`;

      const jsonResponse = {
        fileName: latestFile,
        url: publicUrl,
        size: fileSize,
      };
      res.setHeader("Content-Type", "application/json");
      res.send(JSON.stringify(jsonResponse, null, 2));
    }
  } catch (err) {
    console.error("Error fetching files:", err);
    res.status(500).json({ error: "Failed to fetch file history" });
  }
});
app.use(express.static("public"));

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
