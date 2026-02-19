require('dotenv').config();
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
const https = require('https');

// --- 1. CONFIGURATION & SETUP ---

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
        console.log(`📄 Using credentials: ${path.basename(filePath)}`);
        break;
    }
}

if (!credentialPath) {
    console.error('❌ ERROR: No Firebase credentials found.');
    process.exit(1);
}

try {
    const serviceAccount = require(credentialPath);
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    }
} catch (error) {
    console.error('❌ Error initializing Firebase:', error.message);
    process.exit(1);
}

const db = admin.firestore();

// --- 2. HELPER FUNCTIONS ---

const fetchJson = (url) => new Promise((resolve, reject) => {
    https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            try {
                resolve(JSON.parse(data));
            } catch (e) {
                reject(e);
            }
        });
        res.on('error', reject);
    }).on('error', reject);
});

// --- 3. MAIN LOGIC ---

(async () => {
    try {
        console.log('⬇️  Downloading real exercises from free-exercise-db...');
        const remoteExercises = await fetchJson('https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json');
        console.log(`✅ Downloaded ${remoteExercises.length} reference exercises.`);

        console.log('🔍 Fetching current exercises from Firestore...');
        const snapshot = await db.collection('exercises').get();
        if (snapshot.empty) {
            console.log('⚠️  No exercises found in Firestore to update.');
            process.exit(0);
        }
        console.log(`✅ Found ${snapshot.size} exercises in Firestore.`);

        console.log('⚙️  Matching and preparing updates...');
        const batchHandler = db.batch();
        let updateCount = 0;
        let matchCount = 0;

        // Create a map for faster lookup: Name (lowercase) -> Exercise Object
        const remoteMap = new Map();
        remoteExercises.forEach(ex => {
            if (ex.name) remoteMap.set(ex.name.toLowerCase().trim(), ex);
        });

        snapshot.docs.forEach(doc => {
            const data = doc.data();
            const currentName = (data.name || '').toLowerCase().trim();

            if (remoteMap.has(currentName)) {
                const match = remoteMap.get(currentName);
                matchCount++;

                // Check if image needs update (e.g. if it's currently a dummy one or empty)
                // We will update it regardless to ensure it's valid, unless users ask otherwise.
                // User said: "update all url by images of each exercise"

                if (match.images && match.images.length > 0) {
                    const validUrl = `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${match.images[0]}`;

                    // Queue update
                    const docRef = db.collection('exercises').doc(doc.id);
                    batchHandler.update(docRef, { image: validUrl });
                    updateCount++;
                }
            }
        });

        console.log(`📊 Analysis complete:`);
        console.log(`   - Matched: ${matchCount}`);
        console.log(`   - Updates queued: ${updateCount}`);

        if (updateCount > 0) {
            // Note: Firestore batch limit is 500. If updateCount > 500 we need multiple batches.
            // For simplicity, if > 500, we should chunk.

            if (updateCount <= 500) {
                console.log('💾 Committing batch...');
                await batchHandler.commit();
            } else {
                console.log('⚠️  More than 500 updates. Chunking is required but not implemented in this simple script for brevity. (Assuming < 500 matches for this specific user case based on debug info).');
                // If we really expect > 500, we'd loop. But user DB seems small (from debug logs).
                // Let's implement chunking just to be safe.

                // Re-looping for chunked updates (inefficient but safe)
                let chunkBatch = db.batch();
                let operationCounter = 0;
                let totalCommitted = 0;

                for (const doc of snapshot.docs) {
                    const data = doc.data();
                    const currentName = (data.name || '').toLowerCase().trim();

                    if (remoteMap.has(currentName)) {
                        const match = remoteMap.get(currentName);
                        if (match.images && match.images.length > 0) {
                            const validUrl = `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${match.images[0]}`;
                            chunkBatch.update(doc.ref, { image: validUrl });
                            operationCounter++;

                            if (operationCounter >= 450) {
                                await chunkBatch.commit();
                                totalCommitted += operationCounter;
                                operationCounter = 0;
                                chunkBatch = db.batch();
                                console.log(`   - Committed chunk...`);
                            }
                        }
                    }
                }
                if (operationCounter > 0) {
                    await chunkBatch.commit();
                    totalCommitted += operationCounter;
                }
                console.log(`✅ Total committed: ${totalCommitted}`);
                process.exit(0);
            }

            console.log('✅ Update successful!');
        } else {
            console.log('⚠️  No updates were necessary (no matches found or no images available).');
        }

        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
})();
