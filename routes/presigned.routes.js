import { Router } from "express";
import client from "../oci.client.js";
import { getNamespace } from "../oci.namespace.js";

const router = Router();

// Upload Pre-Signed URL
router.post("/upload/:bucketName", async (req, res) => {
    try {
        const namespaceName = await getNamespace();

        const { bucketName } = req.params;
        const { objectName } = req.body;

        if (!objectName) {
            return res.status(400).json({ error: "objectName required" });
        }

        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        const response = await client.createPreauthenticatedRequest({
            namespaceName,
            bucketName,
            createPreauthenticatedRequestDetails: {
                name: `upload-${objectName}-${Date.now()}`,
                accessType: "ObjectWrite",
                objectName,
                timeExpires: expiresAt
            }
        });

        const region = process.env.REGION;

        const uploadUrl = `https://objectstorage.${region}.oraclecloud.com${response.preauthenticatedRequest.accessUri}`;
        console.log(`uploadUrl: ${uploadUrl}`);
        res.json({ uploadUrl });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to generate upload URL" });
    }
});

// Download Pre-Signed URL
router.get("/download/:bucketName/:objectName", async (req, res) => {
    try {
        const namespaceName = await getNamespace();

        const { bucketName, objectName } = req.params;

        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        const response = await client.createPreauthenticatedRequest({
            namespaceName,
            bucketName,
            createPreauthenticatedRequestDetails: {
                name: `download-${objectName}-${Date.now()}`,
                accessType: "ObjectRead",
                objectName,
                timeExpires: expiresAt
            }
        });

        const region = client.regionId;

        const downloadUrl = `https://objectstorage.${region}.oraclecloud.com${response.preauthenticatedRequest.accessUri}`;

        res.json({ downloadUrl });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to generate download URL" });
    }
});

export default router;