import fetch from 'node-fetch'; // Polyfill if needed

const apiKey = "AIzaSyCN38wsGsJ4L1RLDqdxrhpTxxjF-iPhqDM";
const baseUrl = "https://generativelanguage.googleapis.com/v1beta";

async function testModel(modelName) {
    console.log(`\n🧪 Testing model: \x1b[33m${modelName}\x1b[0m ...`);
    try {
        const response = await fetch(`${baseUrl}/models/${modelName}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: 'Say "Hello, API works!"' }] }]
            })
        });
        const json = await response.json();

        if (json.error) {
            console.log(`❌ Error: \x1b[31m${json.error.message}\x1b[0m`);
        } else {
            const reply = json.candidates?.[0]?.content?.parts?.[0]?.text;
            console.log(`✅ Success! Reply: \x1b[32m${reply}\x1b[0m`);
        }
    } catch (e) {
        console.log(`❌ Request failed: ${e.message}`);
    }
}

async function main() {
    await testModel("gemini-2.5-flash-lite");
    await testModel("gemini-2.0-flash-lite");
    await testModel("gemini-1.5-flash");
}

main();
