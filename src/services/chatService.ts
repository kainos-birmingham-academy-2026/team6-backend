import { AzureOpenAI } from "openai";
import type { JobRolePageResponse } from "../models/JobRolePageResponse";
import { JobRoleService } from "./jobRoleService";

const MAX_ROLES_IN_CONTEXT = 100;

const SYSTEM_PROMPT = `You are the Kainos Careers job roles assistant.
Answer questions using ONLY the job role data provided below.
If the answer is not in that data, say you do not have that information and
suggest browsing the job roles page. Never invent roles, salaries or dates.
Keep answers under 120 words and use plain text, not markdown.`;

function buildContext(page: JobRolePageResponse): string {
  if (page.items.length === 0) {
    return "There are currently no job roles available.";
  }

  return page.items
    .map(
      (role) =>
        `- ${role.roleName} | Band: ${role.bandName} | Capability: ${role.capabilityName} | Location: ${role.location} | Status: ${role.statusName} | Closes: ${new Date(role.closingDate).toISOString().split("T")[0]}`,
    )
    .join("\n");
}

export class ChatService {
  private client: AzureOpenAI | null = null;

  constructor(
    private readonly jobRoleService: JobRoleService = new JobRoleService(),
  ) {}

  // Created lazily so the app still boots when Azure OpenAI is not configured.
  private getClient(): AzureOpenAI {
    if (!this.client) {
      this.client = new AzureOpenAI({
        endpoint: process.env.AZURE_OPENAI_ENDPOINT,
        apiKey: process.env.AZURE_OPENAI_API_KEY,
        apiVersion: process.env.AZURE_OPENAI_API_VERSION,
        deployment: process.env.AZURE_OPENAI_DEPLOYMENT,
      });
    }

    return this.client;
  }

  async askAboutJobRoles(question: string): Promise<string> {
    const page = await this.jobRoleService.findAllJobRoles(
      MAX_ROLES_IN_CONTEXT,
      0,
    );

    const completion = await this.getClient().chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT as string,
      max_tokens: 300,
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: `${SYSTEM_PROMPT}\n\nJOB ROLE DATA:\n${buildContext(page)}`,
        },
        { role: "user", content: question },
      ],
    });

    return (
      completion.choices[0]?.message?.content?.trim() ??
      "Sorry, I could not find an answer to that."
    );
  }
}
