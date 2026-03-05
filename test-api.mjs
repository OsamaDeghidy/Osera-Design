const apiKey = "AIzaSyCN38wsGsJ4L1RLDqdxrhpTxxjF-iPhqDM";
const baseUrl = "https://generativelanguage.googleapis.com/v1beta";

async function listModels() {
    console.log("🔍 Fetching available models for this API Key...");
    try {
        const response = await fetch(`${baseUrl}/models?key=${apiKey}`);
        const data = await response.json();

        if (data.error) {
            console.error("❌ API Error:", data.error.message);
            return [];
        }

        if (data.models) {
            console.log(`\n✅ Found ${data.models.length} accessible models.`);
            console.log("Here are the text/generation models currently active:\n");

            const textModels = data.models.filter(m =>
                m.supportedGenerationMethods.includes("generateContent")
            );

            textModels.forEach(m => {
                console.log(`- Model: \x1b[36m${m.name.replace('models/', '')}\x1b[0m`);
                console.log(`  DisplayName: ${m.displayName}`);
                console.log(`  Description: ${m.description.substring(0, 80)}...`);
                console.log("-".repeat(40));
            });

            return textModels.map(m => m.name.replace('models/', ''));
        }
    } catch (error) {
        console.error("❌ Request failed:", error);
        return [];
    }
}

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
    console.log("==========================================");
    console.log("🚀 Testing Gemini API Key...");
    console.log("==========================================\n");

    const availableModels = await listModels();

    console.log("\n==========================================");
    console.log("📡 Testing specific models to see the error:");
    console.log("==========================================");

    // Test the previously used model that caused the crash
    await testModel("gemini-2.0-flash");

    // Test common reliable fallbacks
    await testModel("gemini-1.5-flash");

    // If the key has access to newer models, let's test the first one from the list
    if (availableModels.length > 0) {
        const defaultLatest = availableModels.find(m => m.includes("gemini-1.5-pro")) || availableModels[0];
        // await testModel(defaultLatest);
    }
}

main();
