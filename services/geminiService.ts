
import { GoogleGenAI } from "@google/genai";
import { ProjectSnapshot, AnalysisResult } from '../types';
import { SYSTEM_PROMPT, RECURSIVE_REASONING_PROCEDURE, USER_PROMPT_TEMPLATE } from '../constants';

if (!process.env.API_KEY) {
    // This is a placeholder check. The build environment must have the API_KEY.
    // In a real scenario, you'd want to handle this more gracefully.
    console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const getProjectAnalysis = async (snapshot: ProjectSnapshot): Promise<AnalysisResult> => {
    const userPrompt = USER_PROMPT_TEMPLATE.replace('<<PROJECT_DATA_JSON>>', JSON.stringify(snapshot, null, 2));

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: `
              INTERNAL PROCEDURE TO FOLLOW:
              ---
              ${RECURSIVE_REASONING_PROCEDURE}
              ---
              USER REQUEST:
              ---
              ${userPrompt}
            `,
            config: {
                systemInstruction: SYSTEM_PROMPT,
                responseMimeType: "application/json",
            },
        });
        
        const text = response.text.trim();
        // The API might return the JSON wrapped in markdown backticks, so we strip them.
        const cleanedText = text.replace(/^```json\n?/, '').replace(/```$/, '');

        const result = JSON.parse(cleanedText);
        return result as AnalysisResult;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof Error && error.message.includes('API key not valid')) {
             throw new Error("Invalid Gemini API key. Please check your configuration.");
        }
        throw new Error("Failed to get analysis from Gemini API.");
    }
};
