(function() {
  // 1. State
  let chatHistory = [];
  let currentFontSize = 16;
  let currentFontFamily = "'Cormorant Garamond', Georgia, serif";

  function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

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
      console.warn('Audio failed', e);
    }
  }

  // 2. Intercept appendMessage to record history and apply animation/styles
  const originalAppendMessage = window.appendMessage;
  window.appendMessage = function(role, text) {
    chatHistory.push({ role, text, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) });
    const bubble = originalAppendMessage.apply(this, arguments);
    
    if (role === 'bot') {
      bubble.style.whiteSpace = 'normal';
      bubble.innerHTML = ''; // Clear for typing effect
      
      const tempDiv = document.createElement('div');
      // If it contains tags (like from `marked`), use it as HTML, otherwise just text
      if (text && text.includes('<')) {
        tempDiv.innerHTML = text;
      } else {
        tempDiv.textContent = text;
      }

      // Calculate speed based on content length
      const totalWords = tempDiv.textContent.split(/\s+/).length;
      // Normal delay is ~60ms. For longer text, make it much faster (down to 10ms)
      const baseDelay = Math.max(10, 60 - Math.floor(totalWords / 10));

      const messagesEl = document.getElementById('messages');

      async function animateNode(node, container) {
        if (node.nodeType === Node.TEXT_NODE) {
          if (!node.textContent.trim()) return;
          
          // Add words one by one for an inline, smooth typing experience inside markdown
          const words = node.textContent.split(/(\s+)/);
          for (const word of words) {
            if (!word) continue;
            const span = document.createElement('span');
            span.style.opacity = '0';
            span.style.transition = 'opacity 150ms ease';
            span.textContent = word;
            container.appendChild(span);
            
            // Trigger reflow to start transition
            void span.offsetWidth;
            span.style.opacity = '1';
            
            await sleep(baseDelay + Math.random() * 20); 
            if (messagesEl) {
              messagesEl.scrollTop = messagesEl.scrollHeight;
            }
          }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const clone = node.cloneNode(false);
          container.appendChild(clone);
          
          if (['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'UL', 'OL', 'PRE', 'BLOCKQUOTE'].includes(node.tagName)) {
            await sleep(baseDelay * 2); 
          }

          for (const child of node.childNodes) {
            await animateNode(child, clone);
          }
        }
      }

      // Start animation
      (async () => {
        await animateNode(tempDiv, bubble);
        playDing(); // Play ding when fully loaded
      })();
    }

    return bubble;
  };

  // Add some basic styling for markdown content inside msg-bubble
  const markdownStyles = document.createElement('style');
  markdownStyles.textContent = `
    .msg-bubble p { margin: 0 0 10px 0; }
    .msg-bubble p:last-child { margin: 0; }
    .msg-bubble strong { font-weight: 600; color: var(--gold, #d4af64); }
    .msg-bubble em { font-style: italic; }
    .msg-bubble del { text-decoration: line-through; opacity: 0.7; }
    .msg-bubble blockquote { 
      border-left: 3px solid var(--gold, #d4af64); 
      padding-left: 10px; 
      margin: 10px 0; 
      color: rgba(255,255,255,0.7);
    }
    .msg-bubble code { 
      font-family: 'DM Mono', monospace; 
      background: rgba(0,0,0,0.2); 
      padding: 2px 4px; 
      border-radius: 4px; 
      font-size: 0.9em;
    }
    .msg-bubble pre { 
      background: rgba(0,0,0,0.3); 
      padding: 12px; 
      border-radius: 8px; 
      overflow-x: auto;
      margin: 10px 0;
    }
    .msg-bubble pre code { 
      background: transparent; 
      padding: 0; 
      color: #e2e8f0;
    }
    .msg-bubble ul, .msg-bubble ol { margin: 10px 0 10px 20px; padding: 0; }
    .msg-bubble li { margin-bottom: 5px; }
  `;
  document.head.appendChild(markdownStyles);

  // 3. Setup Views Container
  const mainEl = document.querySelector('.main');
  const topbar = document.querySelector('.topbar');
  const messagesArea = document.getElementById('messages');
  const inputArea = document.querySelector('.input-area');

  const viewsContainer = document.createElement('div');
  viewsContainer.style.flex = '1';
  viewsContainer.style.display = 'none';
  viewsContainer.style.flexDirection = 'column';
  viewsContainer.style.padding = '32px';
  viewsContainer.style.overflowY = 'auto';
  viewsContainer.style.zIndex = '2';
  viewsContainer.style.position = 'relative';
  viewsContainer.style.color = 'var(--text)';
  
  // Insert before input area so it takes the middle space
  mainEl.insertBefore(viewsContainer, inputArea);

  function showView(viewName) {
    if (viewName === 'New Chat') {
      topbar.style.display = 'flex';
      messagesArea.style.display = 'flex';
      inputArea.style.display = 'block';
      viewsContainer.style.display = 'none';
      return;
    }

    // Hide chat
    topbar.style.display = 'none';
    messagesArea.style.display = 'none';
    inputArea.style.display = 'none';
    
    // Show views container
    viewsContainer.style.display = 'flex';
    viewsContainer.innerHTML = ''; // Clear previous

    // Render specific view
    const title = document.createElement('h2');
    title.style.fontSize = '28px';
    title.style.fontWeight = '300';
    title.style.fontStyle = 'italic';
    title.style.marginBottom = '24px';
    title.style.color = 'var(--gold)';
    title.textContent = viewName;
    viewsContainer.appendChild(title);

    const content = document.createElement('div');
    content.style.display = 'flex';
    content.style.flexDirection = 'column';
    content.style.gap = '16px';

    if (viewName === 'History') {
      if (chatHistory.length === 0) {
        content.innerHTML = '<p style="color: var(--text-faint); font-family: \'DM Mono\', monospace;">No history yet. Start a conversation!</p>';
      } else {
        chatHistory.forEach(msg => {
          const item = document.createElement('div');
          item.style.padding = '16px';
          item.style.background = 'var(--card)';
          item.style.border = '1px solid var(--border)';
          item.style.borderRadius = '8px';
          
          const header = document.createElement('div');
          header.style.display = 'flex';
          header.style.justifyContent = 'space-between';
          header.style.marginBottom = '8px';
          header.style.fontSize = '11px';
          header.style.fontFamily = "'DM Mono', monospace";
          header.style.color = 'var(--text-faint)';
          header.innerHTML = `<span>${msg.role === 'bot' ? 'Lexis' : 'You'}</span><span>${msg.time}</span>`;
          
          const text = document.createElement('div');
          text.style.fontSize = '15px';
          text.style.lineHeight = '1.5';
          if (msg.role === 'bot' && msg.text && msg.text.includes('<')) {
            text.innerHTML = msg.text;
            text.style.whiteSpace = 'normal';
            text.classList.add('msg-bubble');
            text.style.background = 'transparent';
            text.style.border = 'none';
            text.style.padding = '0';
          } else {
            text.style.whiteSpace = 'pre-wrap';
            text.textContent = msg.text;
          }
          
          item.appendChild(header);
          item.appendChild(text);
          content.appendChild(item);
        });
      }
    } else if (viewName === 'Search') {
      const searchInput = document.createElement('input');
      searchInput.type = 'text';
      searchInput.placeholder = 'Search messages...';
      searchInput.style.width = '100%';
      searchInput.style.padding = '12px 16px';
      searchInput.style.background = 'rgba(9,9,15,0.5)';
      searchInput.style.border = '1px solid var(--border)';
      searchInput.style.borderRadius = '8px';
      searchInput.style.color = 'var(--text)';
      searchInput.style.fontFamily = "'Cormorant Garamond', Georgia, serif";
      searchInput.style.fontSize = '18px';
      searchInput.style.marginBottom = '20px';
      searchInput.style.outline = 'none';
      
      const resultsDiv = document.createElement('div');
      resultsDiv.style.display = 'flex';
      resultsDiv.style.flexDirection = 'column';
      resultsDiv.style.gap = '12px';
      
      searchInput.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase();
        resultsDiv.innerHTML = '';
        if (!q) return;
        
        const matches = chatHistory.filter(m => m.text.toLowerCase().includes(q));
        if (matches.length === 0) {
          resultsDiv.innerHTML = '<p style="color: var(--text-faint);">No results found.</p>';
        } else {
          matches.forEach(msg => {
            const item = document.createElement('div');
            item.style.padding = '12px';
            item.style.background = 'rgba(212, 175, 100, 0.05)';
            item.style.borderLeft = '2px solid var(--gold)';
            item.style.borderRadius = '0 8px 8px 0';
            item.innerHTML = `<div style="font-size: 10px; color: var(--gold-dim); margin-bottom: 4px; font-family: 'DM Mono', monospace;">${msg.role === 'bot' ? 'Lexis' : 'You'}</div><div style="white-space: pre-wrap;">${msg.text}</div>`;
            resultsDiv.appendChild(item);
          });
        }
      });
      
      content.appendChild(searchInput);
      content.appendChild(resultsDiv);
      
    } else if (viewName === 'Settings') {
      // Text Size
      const sizeLabel = document.createElement('div');
      sizeLabel.textContent = 'Text Size';
      sizeLabel.style.fontFamily = "'DM Mono', monospace";
      sizeLabel.style.fontSize = '12px';
      sizeLabel.style.color = 'var(--gold)';
      sizeLabel.style.marginBottom = '8px';
      
      const sizeControls = document.createElement('div');
      sizeControls.style.display = 'flex';
      sizeControls.style.gap = '12px';
      sizeControls.style.marginBottom = '24px';
      
      ['Small', 'Medium', 'Large'].forEach((size, i) => {
        const btn = document.createElement('button');
        btn.textContent = size;
        btn.style.padding = '8px 16px';
        btn.style.background = 'transparent';
        btn.style.border = '1px solid var(--border)';
        btn.style.color = 'var(--text)';
        btn.style.borderRadius = '6px';
        btn.style.cursor = 'pointer';
        btn.onmouseover = () => btn.style.borderColor = 'var(--gold-dim)';
        btn.onmouseout = () => btn.style.borderColor = 'var(--border)';
        btn.onclick = () => {
          currentFontSize = i === 0 ? 14 : i === 1 ? 16 : 20;
          applySettings();
        };
        sizeControls.appendChild(btn);
      });
      
      // Font Family
      const fontLabel = document.createElement('div');
      fontLabel.textContent = 'Font Style';
      fontLabel.style.fontFamily = "'DM Mono', monospace";
      fontLabel.style.fontSize = '12px';
      fontLabel.style.color = 'var(--gold)';
      fontLabel.style.marginBottom = '8px';
      
      const fontControls = document.createElement('div');
      fontControls.style.display = 'flex';
      fontControls.style.gap = '12px';
      
      const fonts = [
        { name: 'Serif (Default)', val: "'Cormorant Garamond', Georgia, serif" },
        { name: 'Sans-Serif', val: "system-ui, -apple-system, sans-serif" },
        { name: 'Monospace', val: "'DM Mono', monospace" }
      ];
      
      fonts.forEach(f => {
        const btn = document.createElement('button');
        btn.textContent = f.name;
        btn.style.padding = '8px 16px';
        btn.style.background = 'transparent';
        btn.style.border = '1px solid var(--border)';
        btn.style.color = 'var(--text)';
        btn.style.borderRadius = '6px';
        btn.style.cursor = 'pointer';
        btn.onmouseover = () => btn.style.borderColor = 'var(--gold-dim)';
        btn.onmouseout = () => btn.style.borderColor = 'var(--border)';
        btn.onclick = () => {
          currentFontFamily = f.val;
          applySettings();
        };
        fontControls.appendChild(btn);
      });
      
      content.appendChild(sizeLabel);
      content.appendChild(sizeControls);
      content.appendChild(fontLabel);
      content.appendChild(fontControls);
      
    } else {
      // Documents, Saved, Profile (Dummy views)
      content.innerHTML = `
        <div style="padding: 40px; text-align: center; border: 1px dashed var(--border); border-radius: 12px; background: rgba(9,9,15,0.3);">
          <svg viewBox="0 0 24 24" style="width: 32px; height: 32px; stroke: var(--gold-dim); fill: none; margin-bottom: 16px; display: inline-block;">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <div style="font-size: 18px; margin-bottom: 8px;">${viewName} is empty</div>
          <div style="font-size: 13px; color: var(--text-faint); font-family: 'DM Mono', monospace;">This feature is currently a placeholder.</div>
        </div>
      `;
    }

    viewsContainer.appendChild(content);
  }

  function applySettings() {
    // Apply to messages
    const bubbles = document.querySelectorAll('.msg-bubble');
    bubbles.forEach(b => {
      b.style.fontSize = currentFontSize + 'px';
      b.style.fontFamily = currentFontFamily;
    });
    
    // Apply to input
    const input = document.getElementById('chat-input');
    if (input) {
      input.style.fontSize = currentFontSize + 'px';
      input.style.fontFamily = currentFontFamily;
    }
  }

  // 4. Hook into Navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      // The text content contains the name, e.g., "New Chat", "History"
      const text = item.textContent.replace('Active', '').trim();
      showView(text);
    });
  });

  // 5. Hook into clearChat to also clear history
  const originalClearChat = window.clearChat;
  window.clearChat = function() {
    chatHistory = [];
    if (originalClearChat) originalClearChat();
  };

  // 6. Observe new messages to apply settings
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      if (mutation.addedNodes.length) {
        applySettings();
      }
    });
  });
  observer.observe(messagesArea, { childList: true, subtree: true });

})();
