
'use server';
/**
 * @fileOverview An AI agent to verify user profile images.
 *
 * - verifyUserImage - A function that checks if an image contains a human face.
 * - VerifyUserImageInput - The input type for the verifyUserImage function.
 * - VerifyUserImageOutput - The return type for the verifyUserImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VerifyUserImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a person, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type VerifyUserImageInput = z.infer<typeof VerifyUserImageInputSchema>;

const VerifyUserImageOutputSchema = z.object({
  hasFace: z.boolean().describe('Whether or not the image contains a clear human face.'),
  reasoning: z.string().describe('A brief explanation for the decision.')
});
export type VerifyUserImageOutput = z.infer<typeof VerifyUserImageOutputSchema>;

export async function verifyUserImage(input: VerifyUserImageInput): Promise<VerifyUserImageOutput> {
  return verifyUserImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'verifyUserImagePrompt',
  input: {schema: VerifyUserImageInputSchema},
  output: {schema: VerifyUserImageOutputSchema},
  prompt: `You are an AI-powered image verification service for a student profile system. Your task is to determine if the provided image is a valid profile picture.

A valid profile picture MUST contain a single, clear, discernible human face. It should not be an avatar, cartoon, object, animal, or group photo. The face should be reasonably forward-facing.

Analyze the following image and determine if it meets the criteria.

Image: {{media url=photoDataUri}}

Set 'hasFace' to true if a single human face is clearly visible. Otherwise, set it to false. Provide a very brief, user-friendly reason for your decision, for example "No clear face was detected in the image." or "Group photos are not allowed, please upload a photo of just yourself."`,
});

const verifyUserImageFlow = ai.defineFlow(
  {
    name: 'verifyUserImageFlow',
    inputSchema: VerifyUserImageInputSchema,
    outputSchema: VerifyUserImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
