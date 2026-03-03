const Chat = {
  currentScenario: null,
  currentLang: 'hindi',
  messages: [],

  open(scenarioId, language) {
    this.currentScenario = SCENARIOS.getById(scenarioId);
    this.currentLang = language;
    this.messages = Storage.getChatHistory(scenarioId);

    document.getElementById('header-title').textContent = this.currentScenario.title;
    document.getElementById('header-actions').innerHTML =
      `<button class="header-btn lang-toggle-btn" onclick="Chat.toggleLang()">${language === 'hindi' ? 'HI' : 'EN'}</button>` +
      `<button class="header-btn close-btn" onclick="Chat.close()">✕</button>`;

    App.navigate('chat');
    this.renderChat();
  },

  close() {
    document.getElementById('header-actions').innerHTML = '';
    App.navigate('home');
  },

  toggleLang() {
    this.currentLang = this.currentLang === 'hindi' ? 'english' : 'hindi';
    const btn = document.querySelector('#header-actions .lang-toggle-btn');
    if (btn) btn.textContent = this.currentLang === 'hindi' ? 'HI' : 'EN';
  },

  renderChat() {
    const container = document.getElementById('screen-chat');

    container.innerHTML =
      '<div class="chat-messages" id="chat-messages"></div>' +
      '<div class="chat-input-bar">' +
      '  <input type="text" id="chat-input" placeholder="Type your message..." autocomplete="off">' +
      '  <button id="chat-send" onclick="Chat.send()">&#10148;</button>' +
      '</div>';

    // Render existing messages
    this.messages.forEach((m) => this._appendMessage(m));
    this._scrollToBottom();

    // Enter key sends
    document.getElementById('chat-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.send();
      }
    });

    // Show starter hint if no messages
    if (this.messages.length === 0) {
      const langLabel = this.currentLang === 'hindi' ? 'Hindi (Roman script)' : 'English';
      this._appendSystemMessage(
        `Start chatting in ${langLabel}. Tap any word in replies to learn it!`
      );
    }
  },

  async send() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    input.disabled = true;
    document.getElementById('chat-send').disabled = true;

    // Add user message
    const userMsg = { role: 'user', content: text, timestamp: Date.now() };
    this.messages.push(userMsg);
    this._appendMessage(userMsg);
    this._scrollToBottom();

    // Show typing indicator
    this._showTyping();

    // Send to AI
    const systemPrompt = SCENARIOS.getSystemPrompt(this.currentScenario.id, this.currentLang);
    const apiMessages = this.messages.map((m) => ({ role: m.role, content: m.content }));
    const result = await AI.sendMessage(systemPrompt, apiMessages);

    this._hideTyping();

    if (result.error) {
      this._appendSystemMessage('Error: ' + result.error);
    } else {
      const aiMsg = { role: 'assistant', content: result.text, timestamp: Date.now() };
      this.messages.push(aiMsg);
      this._appendMessage(aiMsg);
    }

    // Save history
    Storage.saveChatHistory(this.currentScenario.id, this.messages);

    input.disabled = false;
    document.getElementById('chat-send').disabled = false;
    input.focus();
    this._scrollToBottom();
  },

  clearChat() {
    if (!this.currentScenario) return;
    this.messages = [];
    Storage.saveChatHistory(this.currentScenario.id, []);
    this.renderChat();
  },

  _appendMessage(msg) {
    const messagesEl = document.getElementById('chat-messages');
    if (!messagesEl) return;

    const div = document.createElement('div');
    div.className = 'chat-bubble ' + msg.role;

    if (msg.role === 'assistant') {
      const { reply, corrections } = this._parseCorrections(msg.content);

      // Make words tappable in AI messages
      const bubbleText = document.createElement('div');
      bubbleText.className = 'bubble-text';
      bubbleText.innerHTML = this._makeWordsTappable(reply);
      div.appendChild(bubbleText);

      if (corrections.length > 0) {
        const corrDiv = document.createElement('div');
        corrDiv.className = 'corrections';
        corrDiv.innerHTML = corrections
          .map((c) => '<div class="correction ' + c.type + '">' + c.text + '</div>')
          .join('');
        div.appendChild(corrDiv);
      }
    } else {
      const bubbleText = document.createElement('div');
      bubbleText.className = 'bubble-text';
      bubbleText.textContent = msg.content;
      div.appendChild(bubbleText);
    }

    messagesEl.appendChild(div);
  },

  _appendSystemMessage(text) {
    const messagesEl = document.getElementById('chat-messages');
    if (!messagesEl) return;
    const div = document.createElement('div');
    div.className = 'chat-system';
    div.textContent = text;
    messagesEl.appendChild(div);
  },

  _parseCorrections(text) {
    const lines = text.split('\n');
    const replyLines = [];
    const corrections = [];
    let inCorrections = false;

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed === '---') {
        inCorrections = true;
        continue;
      }

      if (inCorrections || trimmed.startsWith('🔧') || trimmed.startsWith('💡') || trimmed.startsWith('✨')) {
        inCorrections = true;
        if (trimmed.length === 0) continue;

        let type = 'grammar';
        if (trimmed.startsWith('💡')) type = 'word';
        if (trimmed.startsWith('✨')) type = 'style';
        corrections.push({ type, text: trimmed });
      } else {
        replyLines.push(line);
      }
    }

    return { reply: replyLines.join('\n').trim(), corrections };
  },

  _makeWordsTappable(text) {
    const escaped = this._escapeHtml(text);
    // Replace newlines with <br>, then wrap words in tappable spans
    return escaped
      .replace(/\n/g, '<br>')
      .replace(/(\S+)/g, '<span class="tappable-word" onclick="Chat.tapWord(this)">$1</span>');
  },

  async tapWord(el) {
    const rawWord = el.textContent.replace(/[.,!?;:'"()\[\]{}<>]/g, '').trim();
    if (!rawWord || rawWord.length < 2) return;

    // Get sentence context
    const bubble = el.closest('.bubble-text');
    const context = bubble ? bubble.textContent : '';

    // Show popup with loading
    const popup = document.getElementById('word-popup');
    popup.classList.remove('hidden');
    popup.innerHTML =
      '<div class="popup-content">' +
      '  <div class="popup-header">' +
      '    <h3>' + this._escapeHtml(rawWord) + '</h3>' +
      '    <button class="popup-close" onclick="Chat.closePopup()">✕</button>' +
      '  </div>' +
      '  <div class="popup-body"><div class="loading-dots"><span></span><span></span><span></span></div></div>' +
      '</div>';

    const result = await AI.lookupWord(rawWord, this.currentLang, context);
    const body = popup.querySelector('.popup-body');
    if (!body) return;

    if (result.error) {
      body.innerHTML = '<p class="error-text">' + this._escapeHtml(result.error) + '</p>';
      return;
    }

    const d = result.data;
    const escapedData = JSON.stringify(d).replace(/'/g, "\\'").replace(/"/g, '&quot;');

    body.innerHTML =
      '<div class="word-meanings">' +
      (d.meaning_hindi ? '<p><strong>Hindi:</strong> ' + this._escapeHtml(d.meaning_hindi) + '</p>' : '') +
      '<p><strong>English:</strong> ' + this._escapeHtml(d.meaning_english) + '</p>' +
      '</div>' +
      '<div class="word-formality"><span class="badge badge-' + d.formality + '">' + d.formality + '</span></div>' +
      (d.examples && d.examples.length
        ? '<div class="word-examples"><h4>Examples</h4>' +
          d.examples.map((ex) => '<p class="example-text">"' + this._escapeHtml(ex) + '"</p>').join('') +
          '</div>'
        : '') +
      (d.related && d.related.length
        ? '<div class="word-related"><h4>Related Words</h4><div class="related-tags">' +
          d.related.map((r) => '<span class="tag">' + this._escapeHtml(r) + '</span>').join('') +
          '</div></div>'
        : '') +
      (d.tip ? '<div class="word-tip"><h4>Tip</h4><p>' + this._escapeHtml(d.tip) + '</p></div>' : '') +
      '<button class="save-word-btn" onclick="Chat.saveWord(\'' + escapedData + '\')">Save to Word Bank</button>';
  },

  saveWord(dataStr) {
    try {
      const data = JSON.parse(dataStr.replace(/&quot;/g, '"'));
      const words = Storage.getWordBank();
      // Avoid duplicates
      if (!words.find((w) => w.word.toLowerCase() === data.word.toLowerCase())) {
        words.push({
          ...data,
          savedAt: Date.now(),
          scenario: this.currentScenario ? this.currentScenario.title : '',
          reviewCount: 0,
          nextReview: Date.now() + 86400000 // 1 day from now
        });
        Storage.saveWordBank(words);
        this._showToast('Saved to Word Bank!');
      } else {
        this._showToast('Already in Word Bank');
      }
    } catch (e) {
      console.error('Save word error:', e);
    }
    this.closePopup();
  },

  closePopup() {
    document.getElementById('word-popup').classList.add('hidden');
  },

  _showTyping() {
    const messagesEl = document.getElementById('chat-messages');
    if (!messagesEl) return;
    const div = document.createElement('div');
    div.className = 'chat-bubble assistant typing-indicator';
    div.id = 'typing-indicator';
    div.innerHTML = '<span></span><span></span><span></span>';
    messagesEl.appendChild(div);
    this._scrollToBottom();
  },

  _hideTyping() {
    const el = document.getElementById('typing-indicator');
    if (el) el.remove();
  },

  _scrollToBottom() {
    const el = document.getElementById('chat-messages');
    if (el) {
      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight;
      });
    }
  },

  _escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  _showToast(msg) {
    const container = document.getElementById('toast-container') || document.body;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }
};
