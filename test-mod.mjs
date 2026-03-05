import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import * as dotenv from "dotenv";

dotenv.config();

const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

async function testModel(modelName) {
    console.log(`\nTesting model: ${modelName}`);
    try {
        const { text } = await generateText({
            model: google(modelName),
            prompt: "Say 'Hello World' if you can hear me.",
        });
        console.log(`✅ Success! Response: ${text}`);
        return true;
    } catch (error) {
        console.error(`❌ Failed: ${error.message}`);
        return false;
    }
}

async function main() {
    await testModel("gemini-3.1-flash-lite");
    await testModel("Gemini 3.1 Flash Lite");
    await testModel("gemini-3.1-flash");
}

main();
