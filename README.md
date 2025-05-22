# OpenAI Chat Service & MODO Project

This repository contains two projects:
1. A simple Node.js service that communicates with OpenAI's chat endpoint
2. MODO - A hackathon project for assessment generation

## MODO Project (Hackathon Demo)

The MODO project is located in the `project` directory and consists of a React-based frontend and an Express-based backend.

### Running MODO Backend

1. Navigate to the server directory:
```bash
cd project/server
```

2. Install dependencies:
```bash
yarn install
```

3. Create a `.env` file with your OpenAI API key:
```
OPENAI_API_KEY=your_api_key_here
```

4. Start the development server:
```bash
yarn dev
```

The backend will be available at `http://localhost:3000`

### Running MODO Frontend

1. Navigate to the project directory:
```bash
cd project
```

2. Install dependencies:
```bash
yarn install
```

3. Start the development server:
```bash
yarn dev
```

The frontend will be available at `http://localhost:5173`

Note: Both the frontend and backend need to be running simultaneously for the full application to work.

## Original OpenAI Chat Service

A simple Node.js service that communicates with OpenAI's chat endpoint using Koa and node-fetch.

A very basic chat UI was added as an easy way to add prompts and see how OpenAI reacts.
System prompts can be added to the messages array in public/app.js.
The conversation is stored in memory, so refreshing the page restarts the conversation but the system prompts will always be there.

## Setup

1. Install dependencies:
```bash
yarn install
```

2. Create a `.env` file in the root directory with your OpenAI API key:
```
OPENAI_API_KEY=your_api_key_here
PORT=3000
```

3. Start the server:
```bash
node src/server.js
```

## UI Usage
Use a web browser and navigate to localhost:3000 and chat away

## API Usage

### Chat Endpoint

**POST** `/chat`

Request body:
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Hello, how are you?"
    }
  ],
  "stream": false  // Optional, defaults to false
}
```

The `messages` array should follow OpenAI's chat format with `role` and `content` for each message.

If `stream` is set to `true`, the response will be streamed as Server-Sent Events (SSE).

### Example Usage

```javascript
// Non-streaming request
const response = await fetch('http://localhost:3000/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    messages: [
      {
        role: 'user',
        content: 'Hello, how are you?'
      }
    ]
  })
});

// Streaming request
const response = await fetch('http://localhost:3000/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    messages: [
      {
        role: 'user',
        content: 'Hello, how are you?'
      }
    ],
    stream: true
  })
});
``` 
