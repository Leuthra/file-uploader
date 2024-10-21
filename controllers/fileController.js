const fs = require("fs");
const path = require("path");
const bucket = require("../config/firebase.js");
const { formatDate } = require("../utils/helpers.js");
const PublicUrl = process.env.PUBLIC_URL || "http://localhost:3000";
const uploadDirectory = path.join(__dirname, "..", "uploads");
const author = "Romi Muharom";
const status = "success";

if (!bucket) {
  return res.status(500).send({ error: "Firebase storage not initialized" });
}

async function uploadFile(req, res) {
  if (!req.file) {
    return res.status(400).send({ error: "No file uploaded." });
  }

  if (process.env.STORAGE === "firebase") {
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
      const publicUrl = `${PublicUrl}/file/${blob.name}`;
      res.send({
        Developer: author,
        file_name: req.file.originalname,
        file_size: (req.file.size / 1024).toFixed(2) + " KB",
        url_response: publicUrl,
      });
    });

    blobStream.end(req.file.buffer);
  } else {
    const fileSize = (req.file.size / 1024).toFixed(2) + " KB";
    const fileUrl = `${PublicUrl}/file/${req.file.filename}`;

    res.send({
      Developer: author,
      file_name: req.file.filename,
      file_size: fileSize,
      url_response: fileUrl,
    });
  }
}

// Get all files handler
async function getAllFiles(req, res) {
  if (process.env.STORAGE === "local") {
    try {
      const files = fs.readdirSync(uploadDirectory).map((file) => {
        const filePath = path.join(uploadDirectory, file);
        const stats = fs.statSync(filePath);
        return {
          title: file,
          size: (stats.size / (1024 * 1024)).toFixed(2) + " MB",
          link: `${PublicUrl}/file/${file}`,
          createdTime: formatDate(stats.mtime),
        };
      });
      res.json({ author, status, files });
    } catch (error) {
      res
        .status(500)
        .send({ error: "Error fetching files from local storage" });
    }
  } else if (process.env.STORAGE === "firebase") {
    try {
      const [files] = await bucket.getFiles();
      if (!files.length) {
        return res.status(200).json({ files: [] });
      }

      const firebaseFiles = files.map((file) => ({
        title: file.name,
        size: file.metadata.size
          ? (file.metadata.size / (1024 * 1024)).toFixed(2) + " MB"
          : "Unknown size",
        link: `${PublicUrl}/file/${file.name}`,
        createdTime: formatDate(file.metadata.timeCreated),
      }));

      res.json({ author, status, files: firebaseFiles });
    } catch (error) {
      res.status(500).send({ error: "Error fetching files from Firebase" });
    }
  } else {
    res.status(400).send({ error: "Invalid storage option" });
  }
}

async function getFileHistory(req, res) {
  try {
    let latestFile;
    let fileSize = 0;
    let publicUrl;

    if (process.env.STORAGE === "firebase") {
      const [files] = await bucket.getFiles();
      if (files.length === 0) {
        return res.status(200).json({ message: "No files available" });
      }
      const sortedFiles = files.sort((a, b) => {
        return (
          new Date(b.metadata.timeCreated) - new Date(a.metadata.timeCreated)
        );
      });

      latestFile = sortedFiles[0];
      fileSize = latestFile.metadata.size
        ? (latestFile.metadata.size / (1024 * 1024)).toFixed(2) + " MB"
        : "Unknown size";

      publicUrl = `${PublicUrl}/file/${latestFile.name}`;
    } else if (process.env.STORAGE === "local") {
      const files = fs.readdirSync(uploadDirectory);
      if (files.length === 0) {
        return res.status(200).json({ message: "No files available" });
      }
      const sortedFiles = files.sort((a, b) => {
        const aTime = fs.statSync(path.join(uploadDirectory, a)).mtime;
        const bTime = fs.statSync(path.join(uploadDirectory, b)).mtime;
        return bTime - aTime;
      });

      latestFile = sortedFiles[0];
      const filePath = path.join(uploadDirectory, latestFile);
      const stats = fs.statSync(filePath);
      fileSize = (stats.size / (1024 * 1024)).toFixed(2) + " MB";

      publicUrl = `${PublicUrl}/file/${latestFile}`;
    }

    const jsonResponse = {
      author,
      status,
      fileName: latestFile.name || latestFile,
      url: publicUrl,
      size: fileSize,
    };

    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify(jsonResponse, null, 2));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch file history" });
  }
}

async function getFileByProxy(req, res) {
  const filename = req.params.filename;
  console.log("Requested file:", filename); 

  try {
    if (process.env.STORAGE === "firebase") {
      const file = bucket.file(filename);
      const [exists] = await file.exists();
      console.log("File exists in Firebase:", exists);

      if (!exists) {
        return res.status(404).send("File not found in Firebase");
      }

      const [metadata] = await file.getMetadata();
      const contentType = metadata.contentType || "application/octet-stream";
      res.setHeader("Content-Type", contentType);

      const readStream = file.createReadStream();
      readStream.pipe(res);

      readStream.on("error", (err) => {
        console.error("Error fetching file from Firebase:", err);
        res.status(500).send("Error fetching file from Firebase");
      });
    }

    else if (process.env.STORAGE === "local") {
      const filePath = path.join(uploadDirectory, filename);
      console.log("File path in local storage:", filePath);

      if (fs.existsSync(filePath)) {
        console.log("Serving file from local storage...");
        res.sendFile(filePath);
      } else {
        console.log("File not found in local storage");
        res.status(404).send("File not found in local storage");
      }
    } else {
      res.status(400).send({ error: "Invalid storage option" });
    }
  } catch (err) {
    console.error("Error fetching file:", err);
    res.status(500).send("Error fetching file from storage");
  }
}

async function getAllFilesWithTotalSize(req, res) {
  try {
    let allFiles = [];
    let totalSize = 0;

    if (process.env.STORAGE === "firebase") {
      const [files] = await bucket.getFiles();
      files.forEach((file) => {
        const fileSize = file.metadata.size
          ? parseInt(file.metadata.size, 10)
          : 0;
        allFiles.push({
          fileName: file.name,
          size: fileSize,
          link: `${PublicUrl}/file/${file.name}`,
        });
        totalSize += fileSize;
      });
    }
   
    else if (process.env.STORAGE === "local") {
      const files = fs.readdirSync(uploadDirectory);
      files.forEach((file) => {
        const filePath = path.join(uploadDirectory, file);
        const stats = fs.statSync(filePath);
        allFiles.push({
          fileName: file,
          size: stats.size,
          link: `${PublicUrl}/file/${file}`,
        });
        totalSize += stats.size;
      });
    } else {
      return res.status(400).send({ error: "Invalid storage option" });
    }

    const jsonResponse = {
      author,
      status,
      totalFiles: allFiles.length,
      totalSize: (totalSize / (1024 * 1024)).toFixed(2) + " MB",
      files: allFiles,
    };

    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify(jsonResponse, null, 2));
  } catch (err) {
    res.status(500).send({ error: "Error fetching files" });
  }
}

module.exports = { getAllFilesWithTotalSize, uploadFile, getAllFiles, getFileHistory, getFileByProxy };
