import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { ProgressiveStoryStep } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// A 512x512 white JPEG to use as the starting canvas.
const BLANK_CANVAS_BASE64 = "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/2wBDAQMDAwQDBAgEBAgQCwkLEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBD/wAARCAIAAgADAREAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AKpgA//Z";

const storyPlanSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      textToSpeak: {
        type: Type.STRING,
        description: 'A single, short sentence of the story to be read aloud.',
      },
      imageEditPrompt: {
        type: Type.STRING,
        description: 'A concise instruction for an image editing AI to add or modify one element in the current scene. e.g., "Add a small, fluffy rabbit in the center." or "Make the sun brighter."',
      },
      animation: {
        type: Type.OBJECT,
        description: 'Instructions for animating the transition to this step to create a cinematic feel.',
        properties: {
          zoom: {
            type: Type.NUMBER,
            description: 'Zoom level for this frame. 1.0 is no zoom, 1.2 is 20% zoom in. Typically between 1.0 and 1.5.'
          },
          pan: {
            type: Type.ARRAY,
            description: "Pan direction as [x, y] CSS transform-origin percentages. e.g., ['50%', '50%'] for center, ['100%', '100%'] for bottom-right.",
            items: { type: Type.STRING }
          }
        },
        required: ['zoom', 'pan']
      }
    },
    required: ['textToSpeak', 'imageEditPrompt', 'animation'],
  },
};

export const generateStoryPlan = async (prompt: string): Promise<ProgressiveStoryStep[]> => {
  try {
    const storyPrompt = `You are a cinematic storyteller and illustrator for children. Based on the user's idea, create a simple, charming story. Break the story down into a sequence of 8 short, speakable sentences.
The visual style should be a simple, colorful children's book illustration on a canvas.

For each sentence, provide:
1.  A specific, incremental instruction for an image editing AI. The first instruction must create the background scene. Subsequent instructions must add or modify elements on the existing image.
    - CRITICAL: To make the change obvious, the new element must be drawn in a **contrasting or complementary color** to its surroundings.
    - CRITICAL: Also, use an **"annotation pen"** to highlight the change, for example: "add a happy sun in the top right corner, circled with a glowing yellow arrow".
2.  Animation instructions ('zoom' and 'pan') to create a dynamic "Ken Burns" camera effect. Use these to guide the viewer's focus. Make the camera movements feel deliberate and cinematic. For example, zoom in on a new character, or pan across the scene. The pan values are CSS transform-origin percentages.

User idea: "${prompt}"`;
    
    const storyResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: storyPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: storyPlanSchema,
      },
    });

    const storyPlan: ProgressiveStoryStep[] = JSON.parse(storyResponse.text);

    if (!Array.isArray(storyPlan) || storyPlan.length === 0) {
      throw new Error("Failed to generate a valid story plan.");
    }
    
    return storyPlan;

  } catch (error) {
    console.error("Error in Gemini service (generateStoryPlan):", error);
    if (error instanceof Error && error.message.includes('429')) {
        throw new Error("The service is busy. Please try again in a moment.");
    }
    throw new Error("Failed to create the story plan. Please try again.");
  }
};


export const editImage = async (base64ImageData: string, prompt: string): Promise<string> => {
    const imagePart = {
        inlineData: {
            data: base64ImageData,
            mimeType: 'image/jpeg',
        },
    };
    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts: [imagePart, textPart] },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            return part.inlineData.data;
        }
    }
    throw new Error("Image editing failed to return an image.");
};

export const getBlankCanvas = (): string => BLANK_CANVAS_BASE64;