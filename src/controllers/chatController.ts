import type { Request, Response } from "express";
import type { ChatService } from "../services/chatService";
import { chatRequestSchema } from "../validation/chatValidation";

export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  async askQuestion(req: Request, res: Response) {
    const parsed = chatRequestSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: parsed.error.issues[0]?.message ?? "Invalid question",
      });
    }

    try {
      const answer = await this.chatService.askAboutJobRoles(
        parsed.data.question,
      );
      return res.status(200).json({ answer });
    } catch (error) {
      // Logged server-side only: provider errors can expose endpoint and request details.
      console.error("Chat request failed", error);
      return res
        .status(503)
        .json({
          error: "The assistant is unavailable right now. Please try again.",
        });
    }
  }
}
