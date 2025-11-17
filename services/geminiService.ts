import { GoogleGenAI } from "@google/genai";
import { ProjectSnapshot, AnalysisResult } from '../types';
import { SYSTEM_PROMPT, RECURSIVE_REASONING_PROCEDURE, USER_PROMPT_TEMPLATE } from '../constants';

/**
 * Analyzes a project snapshot using the Gemini API.
 * @param snapshot The project data snapshot to analyze.
 * @returns A promise that resolves to the analysis result.
 */
// FIX: Per Gemini API guidelines, the API key is sourced from environment variables, not passed as a parameter.
export const getProjectAnalysis = async (snapshot: ProjectSnapshot): Promise<AnalysisResult> => {
    // FIX: Per Gemini API guidelines, the API key must be sourced from process.env.API_KEY.
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
             throw new Error("Your Gemini API key is not valid. Please check the key and try again.");
        }
        throw new Error("Failed to get analysis from Gemini API. Check console for details.");
    }
};