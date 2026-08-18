import "dotenv/config";
import express from "express";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";

const app = express();
const port = Number(process.env.PORT || 8787);
const apiKey = process.env.GEMINI_API_KEY;
const model = process.env.GEMINI_MODEL || "gemini-3.6-flash";

if (!apiKey) {
  console.warn("GEMINI_API_KEY is not set. Chat requests will fail until it is configured.");
}

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "golo-ai", model });
});

type ChatMessage = {
  role: "user" | "model";
  content: string;
};

function sanitizeHistory(value: unknown): ChatMessage[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter(
      (item): item is { role: "user" | "model"; content: string } =>
        !!item &&
        typeof item === "object" &&
        "role" in item &&
        "content" in item &&
        (item.role === "user" || item.role === "model") &&
        typeof item.content === "string"
    )
    .slice(-30)
    .map((item) => ({
      role: item.role,
      content: item.content.slice(0, 12000)
    }));
}

app.post("/api/chat", async (req, res) => {
  try {
    if (!ai) {
      return res.status(500).json({ error: "Gemini API key is not configured." });
    }

    const message =
      typeof req.body?.message === "string" ? req.body.message.trim() : "";

    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    if (message.length > 20000) {
      return res.status(400).json({ error: "Message is too long." });
    }

    const history = sanitizeHistory(req.body?.history);

    const contents = [
      ...history.map((item) => ({
        role: item.role,
        parts: [{ text: item.content }]
      })),
      {
        role: "user" as const,
        parts: [{ text: message }]
      }
    ];

    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();

    const stream = await ai.models.generateContentStream({
      model,
      contents
    });

    for await (const chunk of stream) {
      const text = chunk.text || "";
      if (!text) continue;

      res.write(`data: ${JSON.stringify({ text })}\n\n`);
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error) {
    console.error(error);

    if (!res.headersSent) {
      return res.status(500).json({ error: "Failed to contact Gemini." });
    }

    res.write(
      `data: ${JSON.stringify({
        error: "The AI request failed. Please try again."
      })}\n\n`
    );
    res.end();
  }
});

app.listen(port, () => {
  console.log(`Golo AI server running on http://localhost:${port}`);
});
