const express = require('express');
const path = require('path');
require('dotenv').config();
const Groq = require('groq-sdk');
const { marked } = require('marked');

const app = express();
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

app.use(express.static('public'));
app.use(express.json());

const conversationHistory = [];

const fs = require('fs');

app.get('/', (req, res) => {
  let html = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf8');
  html = html.replace('</body>', '<script src="features.js"></script></body>');
  res.send(html);
});

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  conversationHistory.push({
    role: 'user',
    content: message,
  });

  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: conversationHistory,
      temperature: 0.7,
      max_tokens: 1024,
    });

    const assistantMessage = response.choices[0].message.content;
    conversationHistory.push({
      role: 'assistant',
      content: assistantMessage,
    });
    
    // Convert markdown to HTML before sending to frontend
    const htmlReply = marked.parse(assistantMessage, { breaks: true });

    res.json({ reply: htmlReply, rawReply: assistantMessage });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'An error occurred while processing your request' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🤖 Chatbot server running at http://localhost:${PORT}`);
});
