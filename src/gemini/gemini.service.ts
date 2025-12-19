import { GoogleGenAI } from '@google/genai';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExtractedTask, TaskArraySchema } from './types';
import z from 'zod';

interface ImageAnalysisResult {
  tasks: ExtractedTask[];
  rawResponse: string;
}

@Injectable()
export class GeminiService {
  private genAI: GoogleGenAI;
  private model: string;

  // Initialize the Gemini service with the API key and model
  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) throw new Error('GEMINI_API_KEY is not set');

    this.genAI = new GoogleGenAI({
      apiKey,
    });
    const currentModel = this.configService.get<string>('GEMINI_MODEL');
    if (!currentModel) throw new Error('GEMINI_MODEL is not set');
    this.model = currentModel;
  }

  /* 
   *  This function analyzes an image for tasks. It uses the Gemini API to analyze the image and extract the tasks.
      @param imageBuffer - the image is saved inside buffer to quickly handling the image data
      @param mimeType - the mime type of the image - like a tag to identify the image type
      @param additionalContext - additional context to add to the prompt
      @returns the tasks extracted from the image
  */
  async analyzeImageForTasks(
    imageBuffer: Buffer,
    mimeType: string,
    additionalContext?: string,
  ) {
    // Convert the image buffer to a base64 string, this is the format that the Gemini API expects for image data, base64 is an encoded string of the image data
    const base64Image = imageBuffer.toString('base64');
    const imageData = {
      mimeType,
      data: base64Image,
    };

    const prompt = this.buildPrompt(additionalContext);

    // Make the API call to Gemini
    const responseFromModel = await this.genAI.models.generateContent({
      model: this.model,
      contents: [
        {
          parts: [{ text: prompt }, { inlineData: imageData }],
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseJsonSchema: z.toJSONSchema(TaskArraySchema),
      },
    });

    if (!responseFromModel.text) throw new Error('No response from Gemini');

    const structuredResponse = TaskArraySchema.parse(
      JSON.parse(responseFromModel.text),
    );

    return {
      tasks: structuredResponse.tasks,
      rawResponse: responseFromModel.text,
    };
  }

  private buildPrompt(additionalContext?: string): string {
    const today = new Date().toISOString().split('T')[0];

    const prompt = `
        You are an intelligent task extraction assistant. Analyze the provided image and extract all tasks, assignments, or to-do items visible in it.

        The image might contain:
        - Screenshots of task lists or project management tools
        - Handwritten notes or todo lists
        - Whiteboard photos with tasks
        - Email screenshots with assignments
        - Calendar screenshots with deadlines
        - Photos of textbooks or assignment sheets

        For each task you identify, extract:
        1. **title** (required): The task name or summary clearly
        2. **description** (optional): Any additional details visible
        3. **priority** (optional): Based on urgency indicators:
        - "high" if marked urgent, ASAP, important, or has imminent deadline
        - "medium" for normal tasks
        - "low" for optional or distant tasks
        4. **dueDate** (optional): Extract deadlines in YYYY-MM-DD format
        - Convert relative dates (e.g., "tomorrow", "Friday") to actual dates
        - Today is ${today}
        5. **estimateMinutes** (optional): Estimate time needed in minutes
        - If mentioned explicitly (e.g., "2 hours" → 120)
        - Otherwise estimate: quick tasks (15-30), regular (60-120), major (180+)
        6. **type** (optional): Classify as reading/coding/writing/pset/other
        7. **courseCode** (optional): Extract course code if visible (e.g., CS101, MATH201)

        Important Guidelines:
        - Extract only clearly visible and identifiable tasks
        - Make educated guesses for missing fields based on context
        - If unclear or no tasks visible, return empty tasks array

        ${additionalContext ? `\nAdditional Context: ${additionalContext}` : ''}
`.trim();

    return prompt;
  }
}
