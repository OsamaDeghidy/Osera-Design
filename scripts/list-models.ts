import axios from "axios";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

async function listModels() {
    try {
        console.log("Fetching models with key:", API_KEY?.slice(0, 10) + "...");
        const response = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);

        console.log("\n--- Available Models ---");
        response.data.models.forEach((model: any) => {
            console.log(`${model.name} - ${model.supportedGenerationMethods.join(", ")}`);
        });
    } catch (error: any) {
        console.error("Error listing models:", error.response?.data || error.message);
    }
}

listModels();
