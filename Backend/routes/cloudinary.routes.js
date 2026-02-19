const express = require("express");
const crypto = require("crypto");

const router = express.Router();

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

router.post("/signature", (req, res) => {
    try {
        const timestamp = Math.floor(Date.now() / 1000);
        const folder = "profile-pictures";

        const signature = crypto
            .createHash("sha1")
            .update(`folder=${folder}&timestamp=${timestamp}${API_SECRET}`)
            .digest("hex");

        res.json({
            timestamp,
            signature,
            apiKey: API_KEY,
            cloudName: CLOUD_NAME,
            folder,
        });
    } catch (err) {
        res.status(500).json({ error: "Error generating signature" });
    }
});

module.exports = router;