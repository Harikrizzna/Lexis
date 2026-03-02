require('dotenv').config();
const Groq = require('groq-sdk');
const readline = require('readline');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const conversationHistory = [];

async function chat(userMessage) {
  conversationHistory.push({
    role: 'user',
    content: userMessage,
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

    return assistantMessage;
  } catch (error) {
    console.error('Error:', error.message);
    return 'Sorry, an error occurred. Please try again.';
  }
}

function startChat() {
  console.log('🤖 AI Chatbot started! Type "exit" to quit.\n');

  const askQuestion = () => {
    rl.question('You: ', async (input) => {
      if (input.toLowerCase() === 'exit') {
        console.log('\nGoodbye! 👋');
        rl.close();
        return;
      }

      if (input.trim()) {
        console.log('\nBot: Thinking...');
        const response = await chat(input);
        console.log(`Bot: ${response}\n`);
      }

      askQuestion();
    });
  };

  askQuestion();
}

startChat();
