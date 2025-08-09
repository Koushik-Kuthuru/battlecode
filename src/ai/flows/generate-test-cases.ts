'use server';

/**
 * @fileOverview Test case generation AI agent.
 *
 * - generateTestCases - A function that generates test cases for a given code submission.
 * - GenerateTestCasesInput - The input type for the generateTestCases function.
 * - GenerateTestCasesOutput - The return type for the generateTestCases function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTestCasesInputSchema = z.object({
  code: z.string().describe('The code submission to generate test cases for.'),
  programmingLanguage: z
    .string()
    .describe('The programming language of the code submission.'),
  problemDescription: z.string().describe('The description of the coding problem.'),
});
export type GenerateTestCasesInput = z.infer<typeof GenerateTestCasesInputSchema>;

const GenerateTestCasesOutputSchema = z.object({
  testCases: z.array(z.string()).describe('The generated test cases.'),
});
export type GenerateTestCasesOutput = z.infer<typeof GenerateTestCasesOutputSchema>;

export async function generateTestCases(input: GenerateTestCasesInput): Promise<GenerateTestCasesOutput> {
  return generateTestCasesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTestCasesPrompt',
  input: {schema: GenerateTestCasesInputSchema},
  output: {schema: GenerateTestCasesOutputSchema},
  prompt: `You are a test case generator for coding problems.

  Given a code submission, programming language, and problem description, generate a set of test cases to assess the correctness of the code.

  Problem Description: {{{problemDescription}}}
  Programming Language: {{{programmingLanguage}}}
  Code Submission: {{{code}}}

  Generate a diverse set of test cases that cover various scenarios, including edge cases and boundary conditions.  Return an array of strings. Each string should be a valid test case for the specified programming language.
  `,
});

const generateTestCasesFlow = ai.defineFlow(
  {
    name: 'generateTestCasesFlow',
    inputSchema: GenerateTestCasesInputSchema,
    outputSchema: GenerateTestCasesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
