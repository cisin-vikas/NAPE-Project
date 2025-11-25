import { GoogleGenAI } from "@google/genai";
import { ProjectSnapshot, AnalysisResult } from '../types';
import { SYSTEM_PROMPT, RECURSIVE_REASONING_PROCEDURE, USER_PROMPT_TEMPLATE } from '../constants';

/**
 * Analyzes a project snapshot using the Gemini API.
 * The API key is sourced from the `process.env.API_KEY` environment variable.
 * @param snapshot The project data snapshot to analyze.
 * @returns A promise that resolves to the analysis result.
 */
export const getProjectAnalysis = async (snapshot: ProjectSnapshot): Promise<AnalysisResult> => {
    if (!process.env.API_KEY) {
        throw new Error("Gemini API key is not configured in the environment.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
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
        if (error instanceof Error && (error.message.includes('API key not valid') || error.message.includes('API_KEY_INVALID'))) {
             throw new Error("The configured Gemini API key is not valid. Please check the environment configuration.");
        }
        throw new Error("Failed to get analysis from Gemini API. Check console for details.");
    }
};