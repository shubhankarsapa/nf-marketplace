require("dotenv").config();
const express = require("express");
const multer = require("multer");
const { Storage } = require("@google-cloud/storage");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Initialize Google Cloud Storage
const storage = new Storage({ keyFilename: process.env.GCS_KEYFILE_PATH });
const bucket = storage.bucket(process.env.GCS_BUCKET);

app.use(cors());
app.use(express.json());

app.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    console.log("No file uploaded.");
    return res.status(400).send("No file uploaded.");
  }

  const blob = bucket.file(`images/${req.file.originalname}`);
  const blobStream = blob.createWriteStream({
    metadata: { contentType: req.file.mimetype },
  });

  blobStream.on("error", (err) => {
    console.error("Blob stream error:", err);
    return res.status(500).send(err.message);
  });

  blobStream.on("finish", () => {
    const publicUrl = `https://storage.googleapis.com/${
      bucket.name
    }/${encodeURIComponent(blob.name)}`;
    return res.status(200).send({ url: publicUrl });
  });

  blobStream.end(req.file.buffer);
});

app.post("/upload-metadata", async (req, res) => {
  const metadataObject = req.body;
  const metadataJson = JSON.stringify(metadataObject);
  const filename = `metadata-${uuidv4()}.json`;
  const file = bucket.file(filename);

  await file.save(
    metadataJson,
    {
      metadata: { contentType: "application/json" },
    },
    (err) => {
      if (err) {
        console.error("Failed to upload metadata:", err);
        return res.status(500).send(err.message);
      }

      const publicUrl = `https://storage.googleapis.com/${
        bucket.name
      }/${encodeURIComponent(filename)}`;
      return res.status(200).send({ url: publicUrl });
    }
  );
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server started on port ${port}`));
