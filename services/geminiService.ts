

import { GoogleGenAI } from "@google/genai";
import { RaceMode, RaceTheme } from "../types";

const API_KEY = process.env.API_KEY;

// Gracefully handle missing API key to prevent app crash on startup.
// The Gemini client will only be initialized if the key is present.
let ai: GoogleGenAI | null = null;
if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
  console.error("API_KEY environment variable not set. Features requiring the Gemini API will be disabled.");
}

const getPromptForThemeAndMode = (theme: RaceTheme, mode: RaceMode): string => {
  let topic = "one of the Harry Potter books";
  let lengthConstraints = "between 40 and 70 words long";
  let complexity = "standard punctuation like commas and periods, but please avoid quotation marks or other complex characters.";

  switch (mode) {
    case RaceMode.SOLO_EASY:
      lengthConstraints = "between 30 and 50 words long";
      complexity = "simple vocabulary. It should contain standard punctuation like commas and periods, but please avoid quotation marks or other complex characters.";
      break;
    case RaceMode.SOLO_MEDIUM:
    case RaceMode.PUBLIC: // Public races use medium difficulty text
      lengthConstraints = "between 40 and 70 words long";
      break;
    case RaceMode.SOLO_HARD:
      lengthConstraints = "between 60 and 90 words long";
      complexity = "more complex sentences. It may contain punctuation like semicolons, but please avoid quotation marks.";
      break;
  }
  
  switch (theme) {
    case RaceTheme.HARRY_POTTER:
      topic = "one of the Harry Potter books";
      break;
    case RaceTheme.MOVIE_QUOTES:
      topic = "a famous movie";
      break;
    case RaceTheme.SONG_LYRICS:
      topic = "a popular song";
      break;
    case RaceTheme.CODE_SNIPPETS:
      return `Generate a short snippet of JavaScript code for a typing test. The snippet should be ${lengthConstraints} and be a single line of valid, simple code. For example, a function definition or a variable declaration. Do not include comments or line breaks.`;
  }

  return `Generate a single, iconic paragraph from ${topic} for a typing test. The paragraph should be ${lengthConstraints} and feature ${complexity} Ensure it is a single block of text with no line breaks.`;
}

const fallbackText = "Mr. and Mrs. Dursley, of number four, Privet Drive, were proud to say that they were perfectly normal, thank you very much.";

export const getTypingParagraph = async (theme: RaceTheme, mode: RaceMode): Promise<string> => {
  // Check if the AI client was initialized. If not, return an error message.
  if (!ai) {
    return "Gemini API key not configured. Please set the API_KEY environment variable. Using fallback text.";
  }
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: getPromptForThemeAndMode(theme, mode),
    });
    const text = response.text; // Use the text getter
    // Defensively check if the result is a non-empty string.
    if (typeof text === 'string' && text.trim()) {
      return text.trim().replace(/\n/g, ' ');
    }
    // If we get an empty string or non-string response, use fallback.
    console.warn("Received empty or invalid response from Gemini, using fallback text.");
    return fallbackText;
  } catch (error) {
    console.error("Error fetching paragraph from Gemini:", error);
    return fallbackText;
  }
};