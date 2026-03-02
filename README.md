# Lexis — AI Chatbot

An elegant, modern AI chatbot application powered by Groq's LLaMA 3.3 model. Features a sophisticated web interface with interactive animations, particle background effects, and a conversational AI chat experience.

## 🎨 Features

- **Modern Web Interface** - Sleek, responsive design with a dark theme and gold accents
- **Three.js Particle Background** - Dynamic particle system with connecting lines and mouse parallax effects
- **Interactive Book Animation** - Animated 3D book element in the sidebar that opens on hover
- **Real-time Chat** - Conversation with AI powered by Groq's LLaMA 3.3 model
- **Conversation History** - Maintains context across multiple messages for coherent responses
- **Markdown Support** - AI responses can include formatted text, code blocks, and more
- **Typing Indicators** - Visual feedback while the AI is generating responses
- **Responsive Design** - Works on various screen sizes
- **Dual Interfaces** - Both web interface and CLI chatbot support

## 🛠 Tech Stack

**Frontend:**
- HTML5
- CSS3 (with custom CSS variables and animations)
- Vanilla JavaScript
- Three.js (for particle effects and 3D graphics)

**Backend:**
- Node.js
- Express.js (web framework)
- Groq SDK (AI API)
- Marked (Markdown parser)
- dotenv (environment management)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- npm (comes with Node.js)
- A Groq API key (get one at [console.groq.com](https://console.groq.com))

## 🚀 Installation

1. **Clone or download the project**
   ```bash
   cd "AI ChatBot"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create a `.env` file** in the root directory
   ```bash
   echo GROQ_API_KEY=your_api_key_here > .env
   ```
   Replace `your_api_key_here` with your actual Groq API key.

4. **Verify the `.env` file contains your API key**
   ```
   GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxx
   ```

## 🎯 Usage

### Web Interface (Recommended)

Start the web server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

**Features:**
- Type your message in the input field
- Press `Enter` to send (or `Shift+Enter` for a new line)
- Use starter prompts for quick questions
- Click the book icon to start a new chat
- Browse conversation history in the sidebar

### CLI Interface

For a command-line chatbot experience:
```bash
npm run cli
```

**Usage:**
- Type your message and press `Enter`
- Type `exit` to quit
- Conversation history is maintained within the session

## 📁 Project Structure

```
AI ChatBot/
├── index.js              # CLI chatbot entry point
├── server.js             # Express web server
├── package.json          # Project dependencies
├── .env                  # Environment variables (create this)
├── README.md             # This file
└── public/               # Frontend assets
    ├── index.html        # Main HTML file
    ├── script.js         # Chat logic and interactions
    ├── features.js       # Additional features
    ├── style.css         # Styling (embedded in HTML)
    ├── three.min.js      # Three.js library
    └── sounds/           # Audio assets folder
```

## 🔧 Configuration

### API Model
The chatbot uses **llama-3.3-70b-versatile** by default. To change the model, edit `server.js` or `index.js`:

```javascript
model: 'llama-3.3-70b-versatile'
```

### Temperature & Max Tokens
- **Temperature**: Currently set to `0.7` (controls response creativity)
- **Max Tokens**: Set to `1024` (controls response length)

Adjust these values in `server.js` in the `/api/chat` endpoint or in `index.js` in the `chat()` function.

### Port
Default port is `3000`. To use a different port, set the `PORT` environment variable:
```bash
set PORT=5000
npm start
```

## 🎨 UI Components

### Sidebar
- **Logo**: "Lexis" branding
- **Interactive Book**: Hover to see 3D book animation, click to start new chat
- **Navigation Menu**: Browse chat history and settings
- **Status Indicator**: Shows when the AI is online

### Main Chat Area
- **Top Bar**: Current conversation title and action buttons
- **Messages Area**: Displays conversation with user and bot messages
- **Welcome State**: Greeting and starter prompt suggestions
- **Input Area**: Text input with send button

### Visual Effects
- **Particle Background**: Three.js powered animated particle field
- **Hover Effects**: Gold accent highlights on interactive elements
- **Message Animations**: Fade-in effects for new messages
- **Typing Indicators**: Animated dots showing AI is responding

## 💬 API Endpoints

### POST `/api/chat`
Send a message to the AI chatbot.

**Request:**
```json
{
  "message": "Your message here"
}
```

**Response:**
```json
{
  "reply": "<p>HTML formatted response</p>",
  "rawReply": "Raw text response"
}
```

### GET `/`
Serves the main chatbot interface.

## 🔒 Security Notes

- Keep your `.env` file private and never commit it to version control
- Store your Groq API key securely
- Consider adding rate limiting for production deployments
- Add authentication if deploying publicly

## 📝 Conversation Context

Both interfaces maintain conversation history to provide context-aware responses. This means:
- The AI remembers previous messages in the same chat session
- Responses are more coherent and relevant
- Each new chat (web) or session (CLI) starts fresh

## 🐛 Troubleshooting

**Issue: "Cannot find module 'groq-sdk'"**
- Solution: Run `npm install` to install dependencies

**Issue: "API key error" or "Unauthorized"**
- Solution: Check that your `.env` file contains a valid Groq API key

**Issue: "Port already in use"**
- Solution: Change the port with `set PORT=5000` then run `npm start`

**Issue: No response from the chatbot**
- Solution: Check your internet connection and Groq API status
- Verify your API key has available credits

## 🚀 Future Enhancements

Potential features to add:
- User authentication and persistent chat history
- Multiple AI models to choose from
- Chat export functionality
- Voice input/output
- Custom system prompts
- Theme customization
- Real-time collaboration

## 📄 License

ISC License

## 🤝 Contributing

Feel free to fork, improve, and submit pull requests!

## 🆘 Support

For issues with:
- **Groq API**: Visit [Groq Console](https://console.groq.com)
- **Three.js**: Check [Three.js Documentation](https://threejs.org/docs)
- **Express.js**: See [Express Docs](https://expressjs.com)

---

**Made with ✨ using Groq AI**
