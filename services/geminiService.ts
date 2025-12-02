import { GoogleGenAI, GenerateContentResponse, Tool } from "@google/genai";
import { ChatMessage, Role, ModelConfig, GroundingSource } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-2.5-flash';

/**
 * Converts a File object to a Base64 string.
 */
export const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const extractBase64Data = (dataUrl: string): string => {
  return dataUrl.split(',')[1];
};

const extractMimeType = (dataUrl: string): string => {
  return dataUrl.substring(dataUrl.indexOf(':') + 1, dataUrl.indexOf(';'));
};

/**
 * Parses grounding chunks from the response candidates to find URLs and Titles.
 */
const extractGroundingSources = (response: GenerateContentResponse): GroundingSource[] => {
  const sources: GroundingSource[] = [];
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  
  if (groundingChunks) {
    groundingChunks.forEach(chunk => {
      if (chunk.web) {
        sources.push({
          title: chunk.web.title || 'Web Source',
          uri: chunk.web.uri
        });
      }
    });
  }
  return sources;
};

export const streamGeminiResponse = async (
  history: ChatMessage[],
  newMessage: string,
  imageContext: string | undefined,
  config: ModelConfig,
  onChunk: (text: string) => void,
  onMetadata: (sources: GroundingSource[]) => void
): Promise<string> => {
  
  try {
    let finalResponseText = '';

    // Prepare history
    const chatHistory = history
      .filter(msg => !msg.isStreaming)
      .map(msg => ({
        role: msg.role === Role.USER ? 'user' : 'model',
        parts: msg.image 
          ? [
              { text: msg.text }, 
              { inlineData: { mimeType: extractMimeType(msg.image), data: extractBase64Data(msg.image) } } 
            ]
          : [{ text: msg.text }]
      }));

    // Configure Tools and Thinking
    const tools: Tool[] = [];
    if (config.useSearch) {
      tools.push({ googleSearch: {} });
    }

    const thinkingConfig = config.useThinking 
      ? { thinkingBudget: 1024 } // Enable thinking with a moderate budget
      : { thinkingBudget: 0 };   // Disable thinking

    // Initialize Chat
    const chat = ai.chats.create({
      model: MODEL_NAME,
      history: chatHistory,
      config: {
        systemInstruction: "You are Gemini Spark v2. You are helpful, accurate, and concise. Use Markdown to format your answers (bold, code blocks, lists).",
        tools: tools,
        thinkingConfig: thinkingConfig,
      }
    });

    // Construct Message parts
    const parts: any[] = [{ text: newMessage }];
    if (imageContext) {
      parts.push({
        inlineData: {
          mimeType: extractMimeType(imageContext),
          data: extractBase64Data(imageContext)
        }
      });
    }

    // Send Stream
    const result = await chat.sendMessageStream({ 
        message: parts.length === 1 ? parts[0].text : parts 
    });

    for await (const chunk of result) {
      const c = chunk as GenerateContentResponse;
      
      // Check for text content
      const text = c.text; 
      if (text) {
        finalResponseText += text;
        onChunk(text);
      }

      // Check for Grounding Metadata (Search Results)
      // This usually arrives in one of the final chunks
      const sources = extractGroundingSources(c);
      if (sources.length > 0) {
        onMetadata(sources);
      }
    }

    return finalResponseText;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};