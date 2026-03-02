const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const messagesDiv = document.getElementById('messages');
const loading = document.getElementById('loading');

sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});

// ---------- Background canvas animation (Three.js 3D Particles) ----------
const bgCanvas = document.getElementById('bgCanvas');
let scene, camera, renderer, particles;

function initThreeJS() {
  // Wait for THREE to be loaded
  if (!window.THREE) {
    setTimeout(initThreeJS, 50);
    return;
  }
  
  scene = new window.THREE.Scene();
  camera = new window.THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 50;

  renderer = new window.THREE.WebGLRenderer({ canvas: bgCanvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  const geometry = new window.THREE.BufferGeometry();
  const count = 1500;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  const color = new window.THREE.Color();

  for (let i = 0; i < count * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 200;
    positions[i + 1] = (Math.random() - 0.5) * 200;
    positions[i + 2] = (Math.random() - 0.5) * 200;

    color.setHSL(0.6 + Math.random() * 0.2, 0.8, 0.6);
    colors[i] = color.r;
    colors[i + 1] = color.g;
    colors[i + 2] = color.b;
  }

  geometry.setAttribute('position', new window.THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new window.THREE.BufferAttribute(colors, 3));

  const material = new window.THREE.PointsMaterial({
    size: 1.5,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true
  });

  particles = new window.THREE.Points(geometry, material);
  scene.add(particles);

  window.addEventListener('resize', onWindowResize);
  animateThreeJS();
}

function onWindowResize() {
  if (!camera || !renderer) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animateThreeJS() {
  requestAnimationFrame(animateThreeJS);
  
  if (particles) {
    particles.rotation.x += 0.0005;
    particles.rotation.y += 0.001;
  }
  
  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  }
}

initThreeJS();

// ---------- Simple ding sound using WebAudio ----------
let audioCtx;
function playDing() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = 'sine';
    o.frequency.value = 880; // A5 ding
    g.gain.value = 0;
    o.connect(g);
    g.connect(audioCtx.destination);
    const now = audioCtx.currentTime;
    g.gain.cancelScheduledValues(now);
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.12, now + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    o.start(now);
    o.stop(now + 0.5);
  } catch (e) {
    // silently fail if audio not available
    console.warn('Audio failed', e);
  }
}

// ---------- Typing / fade-in line-by-line for bot messages ----------
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function addBotMessageTyping(contentHTML) {
  const messageEl = document.createElement('div');
  messageEl.className = 'message bot-message';

  const contentEl = document.createElement('div');
  contentEl.className = 'message-content';

  // Create a temporary container to parse the HTML and extract text nodes/elements
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = contentHTML;
  
  // Custom logic to animate HTML content recursively
  async function animateNode(node, container) {
    if (node.nodeType === Node.TEXT_NODE) {
      if (!node.textContent.trim()) return;
      
      const words = node.textContent.split(/(\s+)/);
      for (const word of words) {
        if (!word) continue;
        const span = document.createElement('span');
        span.className = 'line'; // We reuse the line class for animation styling
        span.textContent = word;
        container.appendChild(span);
        
        await sleep(Math.max(10, 80 - (word.length * 2))); // Faster for longer content
        span.classList.add('show');
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      // Clone the element but empty it
      const clone = node.cloneNode(false);
      container.appendChild(clone);
      
      // If it's a block level element, add some spacing
      if (['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'UL', 'OL', 'PRE', 'BLOCKQUOTE'].includes(node.tagName)) {
        await sleep(50); 
      }

      // Process children
      for (const child of node.childNodes) {
        await animateNode(child, clone);
      }
    }
  }

  messageEl.appendChild(contentEl);
  messagesDiv.appendChild(messageEl);
  
  // Make sure markdown styles apply to bot messages (bold, italic, code, etc)
  contentEl.style.whiteSpace = 'normal'; // Allow markdown blocks to handle their own whitespace
  
  // Start the animation
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
  await animateNode(tempDiv, contentEl);

  // play a ding when finished
  playDing();
}

function addMessage(content, className, isRaw = false) {
  if (className && className.includes('bot-message') && !isRaw) {
    return addBotMessageTyping(content);
  }

  const messageEl = document.createElement('div');
  messageEl.className = `message ${className}`;

  const contentEl = document.createElement('div');
  contentEl.className = 'message-content';
  
  if (className.includes('bot-message') || className.includes('markdown-content')) {
    contentEl.innerHTML = content;
  } else {
    contentEl.textContent = content; // User text is safe
  }

  messageEl.appendChild(contentEl);
  messagesDiv.appendChild(messageEl);

  // Scroll to bottom
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  // Add user message to chat
  addMessage(message, 'user-message');
  userInput.value = '';

  // Show loading indicator
  loading.classList.add('show');
  sendBtn.disabled = true;

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Failed to get response');
    }

    const data = await response.json();
    await addMessage(data.reply, 'bot-message');
  } catch (error) {
    console.error('Error:', error);
    await addMessage('Sorry, an error occurred. Please try again.', 'bot-message');
  } finally {
    loading.classList.remove('show');
    sendBtn.disabled = false;
    userInput.focus();
  }
}
