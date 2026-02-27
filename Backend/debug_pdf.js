const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

// Directory for the test
const pdfDir = path.join(__dirname, 'IA', 'IA pdfs');
const testFile = 'ejercicios/Enciclopedia de ejercicios de musculacion.pdf';
const fullPath = path.join(pdfDir, testFile);

async function testPdf() {
    console.log("--- DEBUG PDF PARSE v2 ---");
    console.log("Full path:", fullPath);

    if (!fs.existsSync(fullPath)) {
        console.error("ERROR: File does not exist at:", fullPath);
        // List directory to see what's there
        const dir = path.dirname(fullPath);
        if (fs.existsSync(dir)) {
            console.log("Contents of", dir, ":", fs.readdirSync(dir));
        } else {
            console.log(dir, "does not exist either.");
        }
        return;
    }

    try {
        console.log("Reading file...");
        const dataBuffer = fs.readFileSync(fullPath);
        console.log("Read successful. Size:", (dataBuffer.length / 1024 / 1024).toFixed(2), "MB");

        console.log("Attempting pdf-parse...");
        // Use a timeout or handle the promise
        const data = await pdf(dataBuffer);

        console.log("SUCCESS!");
        console.log("Pages:", data.numpages);
        console.log("Text snippet:", data.text.substring(0, 200).replace(/\n/g, ' '));

    } catch (error) {
        console.error("CATCHED ERROR:");
        console.error(error);
        if (error.stack) console.error(error.stack);
    }
}

testPdf();
