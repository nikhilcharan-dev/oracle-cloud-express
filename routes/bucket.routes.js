import { Router } from "express";
import multer from "multer";
import fs from "fs";
import { Readable } from "stream";

import client from "../oci.client.js";
import { getNamespace } from "../oci.namespace.js";

const router = Router();
const upload = multer({ dest: "uploads/" });

const compartmentId = process.env.COMPARTMENT_ID;

// ============ LIST ALL BUCKETS ============
router.get("/buckets", async (req, res) => {
    try {
        const namespaceName = await getNamespace();

        const response = await client.listBuckets({
            namespaceName,
            compartmentId
        });

        res.json(response.items);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to list buckets" });
    }
});

// ============ LIST OBJECTS ============
router.get("/objects/:bucketName", async (req, res) => {
    try {
        const namespaceName = await getNamespace();
        const { bucketName } = req.params;

        const response = await client.listObjects({
            namespaceName,
            bucketName
        });

        res.json(response.listObjects.objects);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to list objects" });
    }
});

// ============ UPLOAD FILE ============
router.post("/upload/:bucketName", upload.single("file"), async (req, res) => {
    try {
        const namespaceName = await getNamespace();
        const { bucketName } = req.params;

        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const fileStream = fs.createReadStream(req.file.path);

        await client.putObject({
            namespaceName,
            bucketName,
            objectName: req.file.originalname,
            putObjectBody: fileStream
        });

        fs.unlinkSync(req.file.path);

        res.json({ message: "File uploaded successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Upload failed" });
    }
});

// ============ DOWNLOAD FILE ============
router.get("/download/:bucketName/:objectName", async (req, res) => {
    try {
        const namespaceName = await getNamespace();
        const { bucketName, objectName } = req.params;

        const response = await client.getObject({
            namespaceName,
            bucketName,
            objectName
        });

        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${objectName}"`
        );

        res.setHeader(
            "Content-Type",
            response.contentType || "application/octet-stream"
        );

        const nodeStream = Readable.fromWeb(response.value);
        nodeStream.pipe(res);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Download failed" });
    }
});

// ============ DELETE OBJECT ============
router.delete("/object/:bucketName/:objectName", async (req, res) => {
    try {
        const namespaceName = await getNamespace();
        const { bucketName, objectName } = req.params;

        await client.deleteObject({
            namespaceName,
            bucketName,
            objectName
        });

        res.json({ message: "Object deleted successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Delete failed" });
    }
});

export default router;