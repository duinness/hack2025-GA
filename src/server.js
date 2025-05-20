require('dotenv').config();
const Koa = require('koa');
const Router = require('@koa/router');
const fetch = require('node-fetch');
const serve = require('koa-static');
const path = require('path');

const app = new Koa();
const router = new Router();

const model = 'gpt-4-0125-preview';

// Serve static files from the public directory
app.use(serve(path.join(__dirname, '../public')));

// Middleware to parse JSON bodies
app.use(async (ctx, next) => {
  if (ctx.request.method === 'POST') {
    try {
      const body = await new Promise((resolve, reject) => {
        let data = '';
        ctx.req.on('data', chunk => data += chunk);
        ctx.req.on('end', () => resolve(data));
        ctx.req.on('error', reject);
      });
      ctx.request.body = JSON.parse(body);
    } catch (err) {
      ctx.throw(400, 'Invalid JSON');
    }
  }
  await next();
});

// Chat endpoint
router.post('/chat', async (ctx) => {
  const { messages, stream = false } = ctx.request.body;
  
  if (!messages || !Array.isArray(messages)) {
    ctx.throw(400, 'Messages array is required');
  }

  try {
    console.log('Sending request to OpenAI:', {
      model,
      messages,
      stream
    });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model,
        messages,
        stream
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error(error.error?.message || 'OpenAI API request failed');
    }

    if (stream) {
      // Set headers for streaming response
      ctx.set({
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      });
      
      // Pipe the response directly to the client
      ctx.body = response.body;
    } else {
      const data = await response.json();
      console.log('OpenAI response:', data);
      
      // Extract the content from the response
      const content = data.choices?.[0]?.message?.content || 'No response content found';
      
      ctx.body = { content };
    }
  } catch (error) {
    console.error('Error:', error);
    ctx.throw(500, error.message);
  }
});

app.use(router.routes());
app.use(router.allowedMethods());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 