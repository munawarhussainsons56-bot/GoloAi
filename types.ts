export type Role = "user" | "model";

export type Message = {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
};

export type Conversation = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
};

export type VoiceState =
  | "idle"
  | "listening"
  | "thinking"
  | "speaking"
  | "error";
