import * as dotenv from "dotenv";
dotenv.config();

const API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

async function listModels() {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

    try {
        console.log("=========================================");
        console.log("🔍 FETCHING ALL AVAILABLE MODELS...");
        console.log("=========================================\n");

        const res = await fetch(url);
        const data = await res.json();

        if (res.ok) {
            if (!data.models || data.models.length === 0) {
                console.log("✅ Request succeeded, but no models returned.");
                return;
            }

            console.log(`✅ SUCCESS! Found ${data.models.length} models valid for your API Key:\n`);

            // Let's filter to just show the essential information clearly
            data.models.forEach(model => {
                // Strip the 'models/' prefix to get the exact ID you can use in code
                const usableId = model.name.replace("models/", "");

                console.log(`🛠️ Display Name: ${model.displayName}`);
                console.log(`🔑 Exact ID to use in Code: "${usableId}"`);
                console.log(`⚙️ Supported Methods: ${model.supportedGenerationMethods.join(", ")}`);
                console.log(`-----------------------------------------`);
            });

        } else {
            console.log(`❌ ERROR fetching models: ${data.error?.message || res.statusText}`);
        }
    } catch (e) {
        console.log(`❌ FAILED TO FETCH: ${e.message}`);
    }
}

listModels();
