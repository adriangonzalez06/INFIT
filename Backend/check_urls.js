const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Detect credentials
const possiblePaths = [
    './in-fit-945de-firebase-adminsdk-fbsvc-3f3ff1a1fc.json',
    process.env.FIREBASE_CREDENTIALS || './in-fit-945de-firebase-adminsdk-fbsvc-3f3ff1a1fc.json',
    './firebase-service-account.json'
];

let credentialPath = null;
for (const filePath of possiblePaths) {
    if (fs.existsSync(filePath)) {
        credentialPath = filePath;
        break;
    }
}

if (!credentialPath) {
    process.exit(1);
}

const serviceAccount = require(credentialPath);
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

(async () => {
    try {
        const snapshot = await db.collection('exercises').get();
        let malformedCount = 0;

        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.image && data.image.includes(' ')) {
                console.log(`[SPACE FOUND] ${data.name}: ${data.image}`);
                malformedCount++;
            }
        });

        if (malformedCount === 0) {
            console.log('No spaces found in URLs.');
        } else {
            console.log(`Found ${malformedCount} URLs with spaces.`);
        }
    } catch (error) {
        console.error('Error:', error);
    }
})();
