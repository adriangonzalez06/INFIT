require('dotenv').config();
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
    console.error('No credentials found');
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
        console.log(`Total exercises found: ${snapshot.size}`);

        const exercises = [];
        snapshot.forEach(doc => {
            exercises.push(doc.data().name);
        });
        console.log('Exercise names:', exercises);
    } catch (error) {
        console.error('Error:', error);
    }
})();
