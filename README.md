
# Gemini Spark v2

**Gemini Spark v2** is a modern AI chat app powered by Google Gemini.  
It supports streamed AI responses, optional Google Search grounding, image input, and a “Think” mode for deeper reasoning.

Built with **React**, **TypeScript**, **Vite**, and the **Google GenAI SDK**.

---

## Features

- **Gemini-powered chat**
  - Sends messages to Gemini and streams responses back into the UI.

- **Image upload support**
  - Attach an image and ask Gemini to analyse or respond to it.

- **Search mode**
  - Optional Google Search grounding for more current, source-backed answers.

- **Thinking mode**
  - Optional reasoning mode using a thinking budget for deeper answers.

- **Markdown-style output**
  - Supports basic formatting such as bold text, inline code, lists, and code blocks.

- **Grounding sources**
  - Displays web sources when search grounding returns references.

- **Clean chat interface**
  - Modern dark UI, loading states, timestamps, image previews, and clear chat support.

---

## Tech Stack

- **React 19**
- **TypeScript**
- **Vite**
- **Google GenAI SDK**
- **Lucide React icons**

---

## Project Structure

```txt
gemminispark/
├── components/
│   ├── InputArea.tsx
│   └── MessageBubble.tsx
├── services/
│   └── geminiService.ts
├── App.tsx
├── index.html
├── index.tsx
├── metadata.json
├── package.json
├── tsconfig.json
├── types.ts
└── vite.config.ts
````

---

## Getting Started

### Prerequisites

You need:

* **Node.js**
* **npm**
* A **Gemini API key**

---

## Installation

Clone the repository:

```bash
git clone https://github.com/kai9987kai/gemminispark.git
cd gemminispark
```

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
.env.local
```

Add your Gemini API key:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

Run the development server:

```bash
npm run dev
```

The app should open locally using Vite.

---

## Available Scripts

```bash
npm run dev
```

Starts the development server.

```bash
npm run build
```

Builds the project for production.

```bash
npm run preview
```

Previews the production build locally.

---

## How It Works

Gemini Spark v2 keeps a local chat history in React state. When the user sends a message, the app:

1. Adds the user message to the chat.
2. Optionally converts an uploaded image into a Base64 generative part.
3. Sends the message history to Gemini.
4. Streams the model response back into the UI.
5. Displays grounding sources when Search mode is enabled.
6. Marks the response as complete when streaming finishes.

---

## Modes

### Fast Mode

Default mode for normal quick responses.

### Thinking Mode

Enables a reasoning-focused configuration for more thoughtful answers.

### Search Mode

Enables Google Search grounding so Gemini can use web-connected information and return sources.

---

## Environment Variables

| Variable         | Required | Description                                |
| ---------------- | -------: | ------------------------------------------ |
| `GEMINI_API_KEY` |      Yes | Your Google Gemini API key used by the app |

---

## Security Note

This project is useful as a local experiment or prototype.
For a public production deployment, avoid exposing API keys in frontend code. A safer setup is to send requests through a small backend API that keeps the Gemini key private.

---

## Possible Future Improvements

* Add conversation saving with local storage.
* Add model selector support.
* Add better markdown rendering with a full markdown parser.
* Add export chat as `.txt` or `.md`.
* Add voice input.
* Add drag-and-drop image upload.
* Add error messages for missing API keys.
* Add mobile layout improvements.
* Add light/dark theme toggle.
* Add backend proxy for production-safe API usage.

---

## Credits

Created by **Kai Piper**.

Powered by:

* Google Gemini
* React
* Vite
* TypeScript

---

## License

No license has been added yet.
Add a license file if you want others to know how they can use, modify, or share this project.

```
```

[1]: https://github.com/kai9987kai/gemminispark "GitHub - kai9987kai/gemminispark: ai · GitHub"
[2]: https://raw.githubusercontent.com/kai9987kai/gemminispark/main/package.json "raw.githubusercontent.com"
[3]: https://raw.githubusercontent.com/kai9987kai/gemminispark/main/vite.config.ts "raw.githubusercontent.com"
