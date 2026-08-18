# Golo AI

Golo AI is a React + TypeScript AI assistant with a clean ChatGPT-inspired UX, Gemini-powered chat, browser speech-to-text, browser text-to-speech, responsive voice mode, conversation history, and a fluid voice visualizer.

## Stack

- React + TypeScript
- Vite
- Express
- Google GenAI SDK
- Gemini API
- React Markdown
- Lucide React

## Setup

1. Install Node.js 20+.
2. Run:

```bash
npm install
```

3. Copy `.env.example` to `.env`.
4. Put your Google AI Studio API key in `GEMINI_API_KEY`.
5. Run:

```bash
npm run dev
```

Open `http://localhost:5173`.

## Security

The Gemini key is read by the Express server only. It is not exposed as a Vite client environment variable.

For GitHub Actions, store the key as an Actions secret named `GEMINI_API_KEY`. Actions secrets are available to workflows, not directly to browser JavaScript.

## Voice

The microphone button in the composer uses the browser Speech Recognition API when available.

Voice Mode uses:
- Speech Recognition for input
- Gemini for the AI response
- Browser Speech Synthesis for spoken output
- Web Audio API microphone analysis for the animated visualizer

Browser support for Speech Recognition and Speech Synthesis varies by browser/device.
