require('dotenv').config();
const admin = require('firebase-admin');
const fs = require('fs');

// Load Firebase credentials
const possiblePaths = [
    './in-fit-945de-firebase-adminsdk-fbsvc-3f3ff1a1fc.json',
    process.env.FIREBASE_CREDENTIALS || './in-fit-945de-firebase-adminsdk-fbsvc-3f3ff1a1fc.json',
    './firebase-service-account.json'
];

let credentialPath = null;
for (const filePath of possiblePaths) {
    if (fs.existsSync(filePath)) {
        credentialPath = filePath;
        console.log(`📄 Using credentials: ${filePath}`);
        break;
    }
}

if (!credentialPath) {
    console.error('❌ ERROR: Firebase credentials not found');
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
    console.error('❌ Error loading Firebase credentials:', error.message);
    process.exit(1);
}

const db = admin.firestore();

(async () => {
    try {
        console.log('🔍 Exploring exercises database...\n');

        // Get all exercises
        const snapshot = await db.collection('exercises').get();
        console.log(`📊 Total exercises in database: ${snapshot.size}\n`);

        // Group by muscular_group
        const byMuscleGroup = {};
        snapshot.forEach(doc => {
            const data = doc.data();
            const group = data.muscular_group || 'Unknown';

            if (!byMuscleGroup[group]) {
                byMuscleGroup[group] = [];
            }

            byMuscleGroup[group].push({
                id: doc.id,
                name: data.name,
                difficulty: data.difficulty,
                image: data.image
            });
        });

        // Display exercises by muscle group
        const targetGroups = ['legs', 'back', 'chest', 'thighs', 'upper back', 'lower back', 'pectorals'];

        console.log('='.repeat(80));
        console.log('EXERCISES BY MUSCLE GROUP (Filtered for Legs, Back, Chest)');
        console.log('='.repeat(80));

        Object.keys(byMuscleGroup).sort().forEach(group => {
            const groupLower = group.toLowerCase();
            const isTarget = targetGroups.some(target => groupLower.includes(target));

            if (isTarget) {
                console.log(`\n🏋️  ${group.toUpperCase()} (${byMuscleGroup[group].length} exercises)`);
                console.log('-'.repeat(80));

                // Sort by difficulty and show first 10
                const exercises = byMuscleGroup[group]
                    .sort((a, b) => {
                        const diffOrder = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 };
                        return (diffOrder[a.difficulty?.toLowerCase()] || 2) - (diffOrder[b.difficulty?.toLowerCase()] || 2);
                    })
                    .slice(0, 15);

                exercises.forEach((ex, idx) => {
                    console.log(`${idx + 1}. ${ex.name}`);
                    console.log(`   Difficulty: ${ex.difficulty || 'N/A'}`);
                    console.log(`   ID: ${ex.id}`);
                    if (ex.image) console.log(`   Image: ${ex.image.substring(0, 60)}...`);
                    console.log('');
                });
            }
        });

        console.log('\n' + '='.repeat(80));
        console.log('SUMMARY OF ALL MUSCLE GROUPS');
        console.log('='.repeat(80));
        Object.keys(byMuscleGroup).sort().forEach(group => {
            console.log(`${group}: ${byMuscleGroup[group].length} exercises`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
})();
