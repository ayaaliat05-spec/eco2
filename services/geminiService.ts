import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Message, MessageRole, ChartConfig } from '../types';
import { ECO_SYSTEM_INSTRUCTION } from '../constants';

const apiKey = process.env.API_KEY || '';

// Initialize client securely. 
const ai = new GoogleGenAI({ apiKey });

export const sendMessageToGemini = async (
  history: Message[],
  newMessage: string,
  base64File?: string // Base64 Data URL
): Promise<{ text: string, chartConfig?: ChartConfig }> => {
  
  if (!apiKey) {
    return { text: "Error: API Key is missing. Please set process.env.API_KEY." };
  }

  try {
    // Using gemini-3-flash-preview as the robust, fast 2026-capable model equivalent
    const modelId = 'gemini-3-flash-preview';

    const parts: any[] = [];
    
    // Construct context
    let contextStr = "History of conversation:\n";
    history.forEach(h => {
      // Limit history to last 10 turns to save tokens if needed
      contextStr += `${h.role === MessageRole.User ? 'User' : 'Eco'}: ${h.text}\n`;
    });
    contextStr += `\nUser's new request: ${newMessage}`;

    parts.push({ text: contextStr });

    if (base64File) {
      // Extract base64 and mime type from Data URL: "data:image/png;base64,....."
      const [header, data] = base64File.split(',');
      const mimeType = header.split(':')[1].split(';')[0];

      parts.push({
        inlineData: {
          mimeType: mimeType,
          data: data
        }
      });
    }

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelId,
      contents: {
        role: 'user',
        parts: parts
      },
      config: {
        systemInstruction: ECO_SYSTEM_INSTRUCTION,
        temperature: 0.7,
      }
    });

    const rawText = response.text || "Analysis incomplete. Please refine parameters.";
    
    // Parse for JSON chart data
    let cleanText = rawText;
    let chartConfig: ChartConfig | undefined;

    const jsonMatch = rawText.match(/```json\s*(\{[\s\S]*?\})\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        if (parsed.chart) {
          chartConfig = parsed.chart;
          cleanText = rawText.replace(jsonMatch[0], '').trim();
        }
      } catch (e) {
        console.error("Failed to parse chart JSON", e);
      }
    }

    return {
      text: cleanText,
      chartConfig
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    return { text: "Critical system failure. Unable to access neural link for material analysis." };
  }
};