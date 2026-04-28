'use server';

// ==========================================
// AI Server Actions
// ==========================================
// Mock AI function for generating task descriptions.
// Ready for OpenAI/Groq integration.

/**
 * Generate an AI-powered task description based on the task title.
 * 
 * INTEGRATION GUIDE:
 * ==================
 * To integrate with OpenAI:
 * 
 * 1. Install: npm install openai
 * 2. Add to .env.local: OPENAI_API_KEY=sk-...
 * 3. Replace the mock logic below:
 * 
 * ```typescript
 * import OpenAI from 'openai';
 * 
 * const openai = new OpenAI({
 *   apiKey: process.env.OPENAI_API_KEY,
 * });
 * 
 * const response = await openai.chat.completions.create({
 *   model: 'gpt-4o-mini',
 *   messages: [
 *     {
 *       role: 'system',
 *       content: 'You are a project management assistant. Generate a clear, actionable task description based on the given task title. Keep it concise (2-3 sentences). Include acceptance criteria if relevant.',
 *     },
 *     {
 *       role: 'user',
 *       content: `Generate a task description for: "${title}"`,
 *     },
 *   ],
 *   max_tokens: 200,
 * });
 * 
 * return response.choices[0].message.content || '';
 * ```
 * 
 * To integrate with Groq:
 * 
 * 1. Install: npm install groq-sdk
 * 2. Add to .env.local: GROQ_API_KEY=gsk_...
 * 3. Replace the mock logic below:
 * 
 * ```typescript
 * import Groq from 'groq-sdk';
 * 
 * const groq = new Groq({
 *   apiKey: process.env.GROQ_API_KEY,
 * });
 * 
 * const response = await groq.chat.completions.create({
 *   model: 'llama-3.1-70b-versatile',
 *   messages: [
 *     {
 *       role: 'system',
 *       content: 'You are a project management assistant. Generate a clear, actionable task description.',
 *     },
 *     {
 *       role: 'user',
 *       content: `Generate a task description for: "${title}"`,
 *     },
 *   ],
 * });
 * 
 * return response.choices[0].message.content || '';
 * ```
 */
export async function generateTaskDescription(title: string): Promise<string> {
  // Simulate API latency
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const lowerTitle = title.toLowerCase();

  // Smart mock descriptions based on keywords
  if (lowerTitle.includes('design') || lowerTitle.includes('ui') || lowerTitle.includes('tasarım')) {
    return `Design and create high-fidelity mockups for "${title}". Include responsive layouts for mobile and desktop. Ensure consistency with the existing design system and brand guidelines. Deliver as Figma/sketch files with interactive prototypes. Acceptance criteria: Design reviewed and approved by stakeholders.`;
  }

  if (lowerTitle.includes('api') || lowerTitle.includes('endpoint') || lowerTitle.includes('backend')) {
    return `Implement the backend logic for "${title}". Define RESTful endpoints with proper error handling, input validation, and authentication checks. Write unit tests with >80% coverage. Document the API using OpenAPI/Swagger. Acceptance criteria: All tests pass, API documentation is complete.`;
  }

  if (lowerTitle.includes('test') || lowerTitle.includes('qa') || lowerTitle.includes('bug')) {
    return `Investigate and resolve "${title}". Reproduce the issue in the development environment, identify root cause, implement the fix, and add regression tests. Acceptance criteria: Issue is resolved, no new regressions introduced, tests pass.`;
  }

  if (lowerTitle.includes('database') || lowerTitle.includes('migration') || lowerTitle.includes('schema')) {
    return `Plan and execute the database changes for "${title}". Create migration scripts, ensure backward compatibility, and test with production-like data volumes. Include rollback strategy. Acceptance criteria: Migration runs successfully, no data loss, rollback tested.`;
  }

  if (lowerTitle.includes('auth') || lowerTitle.includes('login') || lowerTitle.includes('security')) {
    return `Implement security measures for "${title}". Follow OWASP best practices, implement proper authentication/authorization flows, and add security headers. Conduct a security review. Acceptance criteria: Security audit passed, no critical vulnerabilities.`;
  }

  if (lowerTitle.includes('deploy') || lowerTitle.includes('ci') || lowerTitle.includes('devops')) {
    return `Set up deployment pipeline for "${title}". Configure CI/CD workflow, environment variables, monitoring, and alerting. Include staging and production environments. Acceptance criteria: Automated deployment works end-to-end, monitoring is active.`;
  }

  if (lowerTitle.includes('document') || lowerTitle.includes('readme') || lowerTitle.includes('docs')) {
    return `Create comprehensive documentation for "${title}". Include setup instructions, architecture overview, API reference, and troubleshooting guide. Keep docs in sync with code changes. Acceptance criteria: Documentation is complete, reviewed, and accessible.`;
  }

  // Default generic description
  return `Complete the task: "${title}". Break this down into subtasks if needed. Define clear acceptance criteria and estimated time. Ensure proper testing and code review before marking as done. Coordinate with team members for any dependencies. Acceptance criteria: Task requirements met, code reviewed, tests passing.`;
}
