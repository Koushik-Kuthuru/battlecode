'use server';

/**
 * @fileOverview A code evaluation AI agent.
 *
 * - evaluateCode - A function that evaluates a code submission against test cases.
 * - EvaluateCodeInput - The input type for the evaluateCode function.
 * - EvaluateCodeOutput - The return type for the evaluateCode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TestCaseResultSchema = z.object({
  testCaseInput: z.string().describe("The input for the test case."),
  expectedOutput: z.string().describe("The expected output for the test case."),
  actualOutput: z.string().describe("The actual output from the user's code."),
  passed: z.boolean().describe("Whether the user's code passed the test case."),
});

const EvaluateCodeInputSchema = z.object({
  code: z.string().describe('The code submission to evaluate.'),
  programmingLanguage: z
    .string()
    .describe('The programming language of the code submission.'),
  problemDescription: z.string().describe('The description of the coding problem.'),
  testCases: z.array(z.object({
    input: z.string(),
    output: z.string(),
  })).describe('The test cases to evaluate against.'),
});
export type EvaluateCodeInput = z.infer<typeof EvaluateCodeInputSchema>;

const EvaluateCodeOutputSchema = z.object({
  results: z.array(TestCaseResultSchema).describe('The results for each test case.'),
  allPassed: z.boolean().describe('Whether all test cases passed.'),
  feedback: z.string().describe('Overall feedback on the submission.'),
});
export type EvaluateCodeOutput = z.infer<typeof EvaluateCodeOutputSchema>;

export async function evaluateCode(input: EvaluateCodeInput): Promise<EvaluateCodeOutput> {
  return evaluateCodeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'evaluateCodePrompt',
  input: {schema: EvaluateCodeInputSchema},
  output: {schema: EvaluateCodeOutputSchema},
  prompt: `You are a highly advanced code evaluation engine for a competitive programming platform. Your task is to analyze a user's code submission against a series of test cases and determine its correctness.

  **Problem Description:**
  {{{problemDescription}}}

  **Programming Language:**
  {{{programmingLanguage}}}

  **User's Code Submission:**
  \`\`\`{{{programmingLanguage}}}
  {{{code}}}
  \`\`\`

  **Test Cases:**
  {{#each testCases}}
  - Input: \`{{this.input}}\`
  - Expected Output: \`{{this.output}}\`
  {{/each}}

  **Instructions:**
  1.  Mentally execute the user's code for each provided test case.
  2.  For each test case, determine the \`actualOutput\` produced by the code.
  3.  Compare the \`actualOutput\` with the \`expectedOutput\`.
  4.  Set the \`passed\` flag to \`true\` if the outputs match exactly, and \`false\` otherwise. Pay close attention to data types, formatting, and whitespace.
  5.  After evaluating all test cases, determine if all of them passed and set the \`allPassed\` flag accordingly.
  6.  Provide brief, constructive, overall \`feedback\` on the submission. If there are errors, hint at the possible cause without giving away the solution. For example: "Your code seems to work for simple cases, but consider edge cases with larger inputs." or "Looks like there might be an issue with how you handle array boundaries." If the code is correct, provide positive feedback like "Great job! Your solution is correct and efficient."

  Return a JSON object matching the specified output schema.
  `,
});

const evaluateCodeFlow = ai.defineFlow(
  {
    name: 'evaluateCodeFlow',
    inputSchema: EvaluateCodeInputSchema,
    outputSchema: EvaluateCodeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
