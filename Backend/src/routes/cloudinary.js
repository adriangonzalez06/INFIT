const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// Ruta para obtener la firma de Cloudinary
router.post('/signature', (req, res) => {
    try {
        const timestamp = Math.round(new Date().getTime() / 1000);
        const folder = process.env.CLOUDINARY_FOLDER || 'infittest';
        const apiKey = process.env.CLOUDINARY_API_KEY || 'fake_api_key';
        const apiSecret = process.env.CLOUDINARY_API_SECRET || 'fake_api_secret';
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'fake_cloud_name';

        // La firma se genera a partir de timestamp y folder (y cualquier otro parámetro que envíes)
        const signature = crypto
            .createHash('sha1')
            .update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`)
            .digest('hex');

        res.json({
            signature,
            timestamp,
            apiKey,
            cloudName,
            folder
        });
    } catch (e) {
        console.error('Error generando firma Cloudinary:', e);
        res.status(500).json({ error: 'Fallo al generar la firma' });
    }
});

module.exports = router;
