# BolBaat Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a PWA language learning app for Hindi and English with AI-powered chat-based scenarios, inline corrections, word bank, and grammar lessons.

**Architecture:** Single-page vanilla PWA. All screens rendered in one `index.html` with JS-based routing (hash router). AI calls go directly to provider APIs (Gemini/OpenAI/Claude) via a unified adapter. All data persisted in localStorage.

**Tech Stack:** Vanilla HTML, CSS, JavaScript. Service Worker for PWA caching. Fetch API for AI provider calls.

---

### Task 1: Project Scaffold — HTML Shell + CSS Foundation + App Router

**Files:**
- Create: `index.html`
- Create: `css/styles.css`
- Create: `js/app.js`
- Create: `js/storage.js`
- Create: `manifest.json`
- Create: `sw.js`
- Create: `assets/icons/` (directory)

**Step 1: Create `index.html`**

Single HTML file with all screen containers. Bottom nav bar with 4 tabs. Meta tags for PWA. Links to CSS and all JS modules.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <meta name="theme-color" content="#0f0f1a">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <link rel="manifest" href="manifest.json">
  <title>BolBaat</title>
  <link rel="stylesheet" href="css/styles.css">
</head>
<body>
  <div id="app">
    <!-- Header -->
    <header id="app-header">
      <h1 id="header-title">BolBaat</h1>
      <div id="header-actions"></div>
    </header>

    <!-- Screen containers -->
    <main id="screens">
      <section id="screen-home" class="screen active"></section>
      <section id="screen-chat" class="screen"></section>
      <section id="screen-wordbank" class="screen"></section>
      <section id="screen-grammar" class="screen"></section>
      <section id="screen-settings" class="screen"></section>
    </main>

    <!-- Bottom Navigation -->
    <nav id="bottom-nav">
      <button class="nav-btn active" data-screen="home">
        <span class="nav-icon">💬</span>
        <span class="nav-label">Chat</span>
      </button>
      <button class="nav-btn" data-screen="wordbank">
        <span class="nav-icon">📖</span>
        <span class="nav-label">Words</span>
      </button>
      <button class="nav-btn" data-screen="grammar">
        <span class="nav-icon">✏️</span>
        <span class="nav-label">Grammar</span>
      </button>
      <button class="nav-btn" data-screen="settings">
        <span class="nav-icon">⚙️</span>
        <span class="nav-label">Settings</span>
      </button>
    </nav>

    <!-- Word Detail Popup (overlay) -->
    <div id="word-popup" class="popup hidden"></div>
  </div>

  <script src="js/storage.js"></script>
  <script src="js/scenarios.js"></script>
  <script src="js/ai.js"></script>
  <script src="js/chat.js"></script>
  <script src="js/wordbank.js"></script>
  <script src="js/grammar.js"></script>
  <script src="js/app.js"></script>
</body>
</html>
```

**Step 2: Create `css/styles.css`**

Complete mobile-first dark theme stylesheet. Includes:
- CSS variables for theming (dark default, light override via `.light-theme` class)
- Base reset and typography
- Header styles
- Bottom nav bar (fixed, 56px height)
- Screen container styles (transitions between screens)
- Scenario card grid (home screen)
- Chat interface styles (WhatsApp-like bubbles, input bar)
- Word bank list styles
- Grammar lesson styles
- Settings form styles
- Word popup overlay styles
- Utility classes (hidden, loading spinner)

Key design tokens:
```css
:root {
  --bg-primary: #0f0f1a;
  --bg-secondary: #1a1a2e;
  --bg-card: #232342;
  --text-primary: #e8e8f0;
  --text-secondary: #a0a0b8;
  --accent: #6c63ff;
  --accent-light: #8b83ff;
  --success: #4caf50;
  --warning: #ff9800;
  --error: #f44336;
  --correction-grammar: #ff6b6b;
  --correction-word: #ffd93d;
  --correction-style: #6bcb77;
  --nav-height: 56px;
  --header-height: 52px;
  --radius: 12px;
  --radius-sm: 8px;
}
```

Mobile-first layout: screens fill viewport between header and nav bar. Smooth CSS transitions for screen switching.

**Step 3: Create `js/storage.js`**

localStorage wrapper with namespaced keys.

```javascript
const Storage = {
  _prefix: 'bolbaat_',

  get(key, fallback = null) {
    try {
      const val = localStorage.getItem(this._prefix + key);
      return val ? JSON.parse(val) : fallback;
    } catch { return fallback; }
  },

  set(key, value) {
    localStorage.setItem(this._prefix + key, JSON.stringify(value));
  },

  remove(key) {
    localStorage.removeItem(this._prefix + key);
  },

  // Specific getters
  getSettings() {
    return this.get('settings', {
      provider: 'gemini',
      apiKey: '',
      model: '',
      theme: 'dark',
      defaultLang: 'hindi'
    });
  },

  saveSettings(settings) { this.set('settings', settings); },

  getWordBank() { return this.get('wordbank', []); },
  saveWordBank(words) { this.set('wordbank', words); },

  getChatHistory(scenarioId) { return this.get('chat_' + scenarioId, []); },
  saveChatHistory(scenarioId, messages) {
    // Keep last 50 messages per scenario
    const trimmed = messages.slice(-50);
    this.set('chat_' + scenarioId, trimmed);
  },

  getProgress() {
    return this.get('progress', {
      lessonsCompleted: [],
      wordsLearned: 0,
      streak: 0,
      lastActiveDate: null
    });
  },
  saveProgress(progress) { this.set('progress', progress); },

  clearAll() {
    Object.keys(localStorage)
      .filter(k => k.startsWith(this._prefix))
      .forEach(k => localStorage.removeItem(k));
  }
};
```

**Step 4: Create `js/app.js`**

App initialization, screen routing, nav bar handling, theme application.

```javascript
const App = {
  currentScreen: 'home',

  init() {
    this.applyTheme();
    this.setupNav();
    this.navigate('home');
    this.registerSW();
  },

  applyTheme() {
    const settings = Storage.getSettings();
    document.body.classList.toggle('light-theme', settings.theme === 'light');
  },

  setupNav() {
    document.getElementById('bottom-nav').addEventListener('click', (e) => {
      const btn = e.target.closest('.nav-btn');
      if (!btn) return;
      this.navigate(btn.dataset.screen);
    });
  },

  navigate(screen) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

    // Show target screen
    const el = document.getElementById('screen-' + screen);
    if (el) {
      el.classList.add('active');
      this.currentScreen = screen;
    }

    // Highlight nav button
    const btn = document.querySelector(`.nav-btn[data-screen="${screen}"]`);
    if (btn) btn.classList.add('active');

    // Update header
    const titles = { home: 'BolBaat', wordbank: 'Word Bank', grammar: 'Grammar Zone', settings: 'Settings', chat: 'Chat' };
    document.getElementById('header-title').textContent = titles[screen] || 'BolBaat';

    // Show/hide bottom nav (hide during chat)
    document.getElementById('bottom-nav').classList.toggle('hidden', screen === 'chat');

    // Render screen content
    this.renderScreen(screen);
  },

  renderScreen(screen) {
    switch(screen) {
      case 'home': HomeScreen.render(); break;
      case 'wordbank': WordBank.render(); break;
      case 'grammar': GrammarZone.render(); break;
      case 'settings': SettingsScreen.render(); break;
    }
  },

  async registerSW() {
    if ('serviceWorker' in navigator) {
      try { await navigator.serviceWorker.register('sw.js'); }
      catch(e) { console.log('SW registration failed:', e); }
    }
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
```

**Step 5: Create `manifest.json`**

```json
{
  "name": "BolBaat - Learn Hindi & English",
  "short_name": "BolBaat",
  "description": "AI-powered language learning through real conversations",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0f0f1a",
  "theme_color": "#0f0f1a",
  "orientation": "portrait",
  "icons": [
    { "src": "assets/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "assets/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

**Step 6: Create `sw.js`**

Basic service worker that caches the app shell.

```javascript
const CACHE_NAME = 'bolbaat-v1';
const ASSETS = [
  '/', '/index.html', '/css/styles.css',
  '/js/app.js', '/js/storage.js', '/js/scenarios.js',
  '/js/ai.js', '/js/chat.js', '/js/wordbank.js', '/js/grammar.js',
  '/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
});

self.addEventListener('fetch', e => {
  // Don't cache API calls
  if (e.request.url.includes('googleapis.com') ||
      e.request.url.includes('openai.com') ||
      e.request.url.includes('anthropic.com')) return;

  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
```

**Step 7: Create placeholder icon**

Generate a simple SVG icon for the PWA manifest (can be replaced later with a proper icon).

**Step 8: Verify**

Open `index.html` in a browser. Should see dark themed page with header "BolBaat", empty content area, and 4-tab bottom nav bar. Clicking tabs should switch screens (empty for now). No errors in console.

**Step 9: Commit**

```bash
git add -A && git commit -m "feat: scaffold BolBaat PWA with HTML shell, CSS foundation, router, and storage"
```

---

### Task 2: Scenario Definitions + Home Screen

**Files:**
- Create: `js/scenarios.js`
- Modify: `js/app.js` (add HomeScreen object)

**Step 1: Create `js/scenarios.js`**

Define all scenario categories and individual scenarios. Each scenario has: id, title, description, category, emoji, language modes, and a system prompt template for the AI.

```javascript
const SCENARIOS = {
  categories: [
    { id: 'friends', name: 'Friends & Fun', emoji: '🤣' },
    { id: 'dating', name: 'Dating & Social', emoji: '💬' },
    { id: 'university', name: 'University', emoji: '🎓' },
    { id: 'workplace', name: 'Workplace', emoji: '💼' },
    { id: 'formal', name: 'Formal & Speech', emoji: '🎤' },
    { id: 'daily', name: 'Daily Life', emoji: '🏠' }
  ],

  items: [
    // Friends & Fun
    { id: 'roasting', title: 'Roasting Friends', desc: 'Savage comebacks and friendly burns', category: 'friends', emoji: '🔥' },
    { id: 'genz-humor', title: 'GenZ Humor', desc: 'Memes, slang, internet jokes', category: 'friends', emoji: '💀' },
    { id: 'party-talk', title: 'Party & Hangout', desc: 'Plans, hype, group chat energy', category: 'friends', emoji: '🎉' },
    { id: 'gaming-talk', title: 'Gaming Banter', desc: 'Trash talk, team comms, reactions', category: 'friends', emoji: '🎮' },

    // Dating & Social
    { id: 'flirting', title: 'Smooth Talking', desc: 'Flirting, rizz, charming lines', category: 'dating', emoji: '😏' },
    { id: 'texting-crush', title: 'Texting a Crush', desc: 'DMs, replies, keeping convos alive', category: 'dating', emoji: '📱' },
    { id: 'first-impression', title: 'First Impressions', desc: 'Meeting someone new, ice breakers', category: 'dating', emoji: '👋' },
    { id: 'small-talk', title: 'Small Talk', desc: 'Casual chit-chat with anyone', category: 'dating', emoji: '☕' },

    // University
    { id: 'classroom', title: 'Classroom Talk', desc: 'Asking doubts, answering questions', category: 'university', emoji: '📚' },
    { id: 'viva', title: 'Viva & Presentations', desc: 'Confident academic speaking', category: 'university', emoji: '🎯' },
    { id: 'group-project', title: 'Group Projects', desc: 'Coordinating, discussing ideas', category: 'university', emoji: '👥' },
    { id: 'canteen', title: 'Canteen & Campus', desc: 'Casual campus conversations', category: 'university', emoji: '🍕' },

    // Workplace
    { id: 'meeting', title: 'Office Meetings', desc: 'Professional discussions, updates', category: 'workplace', emoji: '📊' },
    { id: 'email-writing', title: 'Email Writing', desc: 'Professional emails and messages', category: 'workplace', emoji: '📧' },
    { id: 'boss-talk', title: 'Talking to Boss', desc: 'Formal conversations with seniors', category: 'workplace', emoji: '🤝' },
    { id: 'work-humor', title: 'Workplace Humor', desc: 'Office jokes, water cooler talk', category: 'workplace', emoji: '😄' },

    // Formal & Speech
    { id: 'public-speaking', title: 'Public Speaking', desc: 'Speeches, anchoring events', category: 'formal', emoji: '🎙️' },
    { id: 'debate', title: 'Debate & Arguments', desc: 'Making convincing points', category: 'formal', emoji: '⚔️' },
    { id: 'interview', title: 'Job Interviews', desc: 'Answering questions confidently', category: 'formal', emoji: '💼' },

    // Daily Life
    { id: 'shopping', title: 'Shopping & Bargaining', desc: 'Markets, stores, negotiating', category: 'daily', emoji: '🛒' },
    { id: 'phone-calls', title: 'Phone Calls', desc: 'Calling customer care, booking', category: 'daily', emoji: '📞' },
    { id: 'family', title: 'Family Conversations', desc: 'Talking to elders, relatives', category: 'daily', emoji: '👨‍👩‍👧' },
    { id: 'auto-rickshaw', title: 'Auto/Cab Rides', desc: 'Directions, fare, small talk', category: 'daily', emoji: '🛺' }
  ],

  getByCategory(catId) {
    return this.items.filter(s => s.category === catId);
  },

  getById(id) {
    return this.items.find(s => s.id === id);
  },

  getSystemPrompt(scenarioId, language) {
    const scenario = this.getById(scenarioId);
    if (!scenario) return '';

    const langInstructions = language === 'hindi'
      ? `Respond in Romanized Hindi (Hindi written in English letters like "Bhai kya scene hai").
         Do NOT use Devanagari script. User is a Marathi speaker learning Hindi.`
      : `Respond in English. User is an Indian student learning to speak natural English.
         Adapt vocabulary to Indian English context where appropriate.`;

    const toneMap = {
      friends: 'casual, funny, use GenZ slang, be like a best friend',
      dating: 'charming, witty, natural, not creepy or cringey',
      university: 'mix of casual and semi-formal, student-like',
      workplace: 'professional but approachable, office-appropriate',
      formal: 'articulate, confident, well-structured speech',
      daily: 'natural everyday conversation, practical'
    };

    return `You are a language practice partner for BolBaat, a language learning app.

SCENARIO: ${scenario.title} - ${scenario.desc}
TONE: ${toneMap[scenario.category]}
${langInstructions}

RULES:
1. Stay in character for this scenario. Act as the other person in the conversation.
2. After your natural reply, check the user's message for errors and provide corrections in this format:
   - If grammar error found: Start correction block with "---" then "🔧 GRAMMAR: [wrong] → [right] ([brief explanation])"
   - If a better word exists: "💡 BETTER WORD: [basic word] → [better word] ([why it's better])"
   - If a style improvement exists: "✨ STYLE: [their version] → [native version] ([explanation])"
   - If no errors: Don't add any correction block.
3. Keep responses conversational and concise (2-4 sentences for the reply part).
4. Use vocabulary and expressions that are natural for this scenario.
5. The user is a Marathi speaker, so watch for common Marathi-influenced mistakes:
   - Wrong gender usage in Hindi (Marathi has different gender rules)
   - Direct Marathi-to-Hindi word translations that don't work
   - English sentence structures influenced by Marathi/Hindi
6. Be encouraging but honest about mistakes.
7. IMPORTANT: Your corrections must be genuinely helpful. Don't correct things that are actually fine.`;
  }
};
```

**Step 2: Add HomeScreen to `app.js`**

The home screen renders scenario categories as collapsible sections with card grids.

```javascript
const HomeScreen = {
  render() {
    const container = document.getElementById('screen-home');
    const settings = Storage.getSettings();
    const lang = settings.defaultLang || 'hindi';

    let html = `<div class="home-container">`;
    html += `<div class="lang-toggle">
      <button class="${lang === 'hindi' ? 'active' : ''}" onclick="HomeScreen.setLang('hindi')">Hindi</button>
      <button class="${lang === 'english' ? 'active' : ''}" onclick="HomeScreen.setLang('english')">English</button>
    </div>`;

    for (const cat of SCENARIOS.categories) {
      const scenarios = SCENARIOS.getByCategory(cat.id);
      html += `<div class="category-section">
        <h2 class="category-title">${cat.emoji} ${cat.name}</h2>
        <div class="scenario-grid">`;

      for (const s of scenarios) {
        html += `<div class="scenario-card" onclick="Chat.open('${s.id}', '${lang}')">
          <span class="scenario-emoji">${s.emoji}</span>
          <span class="scenario-title">${s.title}</span>
          <span class="scenario-desc">${s.desc}</span>
        </div>`;
      }

      html += `</div></div>`;
    }

    html += `</div>`;
    container.innerHTML = html;
  },

  setLang(lang) {
    const settings = Storage.getSettings();
    settings.defaultLang = lang;
    Storage.saveSettings(settings);
    this.render();
  }
};
```

**Step 3: Verify**

Open app. Home screen should show all 6 categories with scenario cards. Language toggle switches between Hindi/English. Cards should be tappable (will wire up chat next).

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add scenario definitions and home screen with category grid"
```

---

### Task 3: AI Provider Adapter

**Files:**
- Create: `js/ai.js`

**Step 1: Create `js/ai.js`**

Unified adapter that sends messages to Gemini, OpenAI, or Claude APIs based on user settings.

```javascript
const AI = {
  async sendMessage(systemPrompt, messages) {
    const settings = Storage.getSettings();
    if (!settings.apiKey) {
      return { error: 'No API key configured. Go to Settings to add one.' };
    }

    try {
      switch (settings.provider) {
        case 'gemini': return await this._gemini(systemPrompt, messages, settings);
        case 'openai': return await this._openai(systemPrompt, messages, settings);
        case 'claude': return await this._claude(systemPrompt, messages, settings);
        default: return { error: 'Unknown provider: ' + settings.provider };
      }
    } catch (e) {
      return { error: 'API call failed: ' + e.message };
    }
  },

  async _gemini(systemPrompt, messages, settings) {
    const model = settings.model || 'gemini-2.0-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${settings.apiKey}`;

    const contents = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: { temperature: 0.8, maxOutputTokens: 1024 }
      })
    });

    const data = await res.json();
    if (data.error) return { error: data.error.message };
    return { text: data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response' };
  },

  async _openai(systemPrompt, messages, settings) {
    const model = settings.model || 'gpt-4o-mini';
    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({ role: m.role, content: m.content }))
    ];

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + settings.apiKey
      },
      body: JSON.stringify({ model, messages: apiMessages, temperature: 0.8, max_tokens: 1024 })
    });

    const data = await res.json();
    if (data.error) return { error: data.error.message };
    return { text: data.choices?.[0]?.message?.content || 'No response' };
  },

  async _claude(systemPrompt, messages, settings) {
    const model = settings.model || 'claude-sonnet-4-6';
    const apiMessages = messages.map(m => ({ role: m.role, content: m.content }));

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': settings.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({ model, system: systemPrompt, messages: apiMessages, max_tokens: 1024 })
    });

    const data = await res.json();
    if (data.error) return { error: data.error.message };
    return { text: data.content?.[0]?.text || 'No response' };
  },

  // For word lookup — shorter, focused prompt
  async lookupWord(word, language, context) {
    const systemPrompt = `You are a language dictionary. User tapped on the word "${word}" in a ${language} conversation.
Context sentence: "${context}"

Respond in this exact JSON format (no markdown, no code fences):
{
  "word": "${word}",
  "meaning_hindi": "meaning in Romanized Hindi",
  "meaning_english": "meaning in English",
  "examples": ["example sentence 1", "example sentence 2"],
  "related": ["related word 1", "related word 2", "related word 3"],
  "formality": "slang|casual|neutral|formal",
  "tip": "one practical usage tip"
}`;

    const result = await this.sendMessage(systemPrompt, [{ role: 'user', content: `Define: ${word}` }]);
    if (result.error) return result;

    try {
      return { data: JSON.parse(result.text) };
    } catch {
      return { data: { word, meaning_english: result.text, meaning_hindi: '', examples: [], related: [], formality: 'neutral', tip: '' } };
    }
  }
};
```

**Step 2: Verify**

No direct verification yet (needs API key). Code should load without errors in console.

**Step 3: Commit**

```bash
git add js/ai.js && git commit -m "feat: add multi-provider AI adapter (Gemini, OpenAI, Claude)"
```

---

### Task 4: Chat Interface

**Files:**
- Create: `js/chat.js`
- Modify: `css/styles.css` (add chat-specific styles)

**Step 1: Create `js/chat.js`**

Full chat interface: message rendering, input handling, word tapping, corrections parsing, saving words.

```javascript
const Chat = {
  currentScenario: null,
  currentLang: 'hindi',
  messages: [],

  open(scenarioId, language) {
    this.currentScenario = SCENARIOS.getById(scenarioId);
    this.currentLang = language;
    this.messages = Storage.getChatHistory(scenarioId);

    // Update header
    document.getElementById('header-title').textContent = this.currentScenario.title;
    document.getElementById('header-actions').innerHTML =
      `<button class="header-btn" onclick="Chat.toggleLang()">${language === 'hindi' ? 'HI' : 'EN'}</button>
       <button class="header-btn" onclick="Chat.close()">✕</button>`;

    App.navigate('chat');
    this.renderChat();
  },

  close() {
    document.getElementById('header-actions').innerHTML = '';
    App.navigate('home');
  },

  toggleLang() {
    this.currentLang = this.currentLang === 'hindi' ? 'english' : 'hindi';
    document.querySelector('#header-actions .header-btn').textContent =
      this.currentLang === 'hindi' ? 'HI' : 'EN';
  },

  renderChat() {
    const container = document.getElementById('screen-chat');

    container.innerHTML = `
      <div class="chat-messages" id="chat-messages"></div>
      <div class="chat-input-bar">
        <input type="text" id="chat-input" placeholder="Type your message..." autocomplete="off">
        <button id="chat-send" onclick="Chat.send()">➤</button>
      </div>`;

    // Render existing messages
    this.messages.forEach(m => this._appendMessage(m));
    this._scrollToBottom();

    // Enter key sends
    document.getElementById('chat-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.send();
    });

    // If no messages, show a starter prompt
    if (this.messages.length === 0) {
      this._appendSystemMessage(`Start chatting in ${this.currentLang === 'hindi' ? 'Hindi (Roman script)' : 'English'}. Tap any word in replies to learn it!`);
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
    const apiMessages = this.messages.map(m => ({ role: m.role, content: m.content }));

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

  _appendMessage(msg) {
    const messagesEl = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.className = `chat-bubble ${msg.role}`;

    if (msg.role === 'assistant') {
      // Parse corrections from the message
      const { reply, corrections } = this._parseCorrections(msg.content);

      // Make words tappable
      div.innerHTML = `<div class="bubble-text">${this._makeWordsTappable(reply)}</div>`;

      if (corrections.length > 0) {
        const corrDiv = document.createElement('div');
        corrDiv.className = 'corrections';
        corrDiv.innerHTML = corrections.map(c => `<div class="correction ${c.type}">${c.text}</div>`).join('');
        div.appendChild(corrDiv);
      }
    } else {
      div.innerHTML = `<div class="bubble-text">${this._escapeHtml(msg.content)}</div>`;
    }

    messagesEl.appendChild(div);
  },

  _appendSystemMessage(text) {
    const messagesEl = document.getElementById('chat-messages');
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
      if (trimmed === '---') { inCorrections = true; continue; }

      if (inCorrections || trimmed.startsWith('🔧') || trimmed.startsWith('💡') || trimmed.startsWith('✨')) {
        inCorrections = true;
        let type = 'grammar';
        if (trimmed.startsWith('💡')) type = 'word';
        if (trimmed.startsWith('✨')) type = 'style';
        if (trimmed.length > 0) corrections.push({ type, text: trimmed });
      } else {
        replyLines.push(line);
      }
    }

    return { reply: replyLines.join('\n').trim(), corrections };
  },

  _makeWordsTappable(text) {
    // Escape HTML first, then wrap each word in a span
    const escaped = this._escapeHtml(text);
    return escaped.replace(/(\S+)/g, '<span class="tappable-word" onclick="Chat.tapWord(this)">$1</span>');
  },

  async tapWord(el) {
    const word = el.textContent.replace(/[.,!?;:'"()]/g, '').trim();
    if (!word) return;

    // Get the sentence context
    const bubbleText = el.closest('.bubble-text').textContent;

    // Show popup with loading
    const popup = document.getElementById('word-popup');
    popup.classList.remove('hidden');
    popup.innerHTML = `<div class="popup-content">
      <div class="popup-header">
        <h3>${word}</h3>
        <button class="popup-close" onclick="Chat.closePopup()">✕</button>
      </div>
      <div class="popup-body"><div class="loading">Looking up...</div></div>
    </div>`;

    const result = await AI.lookupWord(word, this.currentLang, bubbleText);

    if (result.error) {
      popup.querySelector('.popup-body').innerHTML = `<p class="error">${result.error}</p>`;
      return;
    }

    const d = result.data;
    popup.querySelector('.popup-body').innerHTML = `
      <div class="word-meanings">
        <p><strong>Hindi:</strong> ${d.meaning_hindi || '-'}</p>
        <p><strong>English:</strong> ${d.meaning_english || '-'}</p>
      </div>
      <div class="word-formality"><span class="badge ${d.formality}">${d.formality}</span></div>
      ${d.examples?.length ? `<div class="word-examples"><h4>Examples</h4>${d.examples.map(e => `<p class="example">"${e}"</p>`).join('')}</div>` : ''}
      ${d.related?.length ? `<div class="word-related"><h4>Related</h4><div class="related-tags">${d.related.map(r => `<span class="tag">${r}</span>`).join('')}</div></div>` : ''}
      ${d.tip ? `<div class="word-tip"><h4>Tip</h4><p>${d.tip}</p></div>` : ''}
      <button class="save-word-btn" onclick="Chat.saveWord(${JSON.stringify(d).replace(/"/g, '&quot;')})">Save to Word Bank</button>
    `;
  },

  saveWord(data) {
    const words = Storage.getWordBank();
    // Avoid duplicates
    if (!words.find(w => w.word === data.word)) {
      words.push({
        ...data,
        savedAt: Date.now(),
        scenario: this.currentScenario?.title || '',
        reviewCount: 0,
        nextReview: Date.now() + 86400000 // 1 day
      });
      Storage.saveWordBank(words);
    }
    this.closePopup();
    this._showToast('Saved to Word Bank!');
  },

  closePopup() {
    document.getElementById('word-popup').classList.add('hidden');
  },

  _showTyping() {
    const messagesEl = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.className = 'chat-bubble assistant typing-indicator';
    div.id = 'typing-indicator';
    div.innerHTML = '<span></span><span></span><span></span>';
    messagesEl.appendChild(div);
    this._scrollToBottom();
  },

  _hideTyping() {
    document.getElementById('typing-indicator')?.remove();
  },

  _scrollToBottom() {
    const el = document.getElementById('chat-messages');
    if (el) el.scrollTop = el.scrollHeight;
  },

  _escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  _showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 2000);
  }
};
```

**Step 2: Add chat CSS styles to `css/styles.css`**

Chat bubble styles (user right-aligned in accent color, assistant left-aligned in secondary color), input bar fixed at bottom, typing indicator dots animation, correction blocks with colored left borders, tappable words with subtle underline on hover, popup overlay styles, toast notification.

**Step 3: Verify**

Click any scenario card on home screen. Should navigate to chat interface with header showing scenario title, language toggle, and close button. Type a message and send — if API key is configured, should get AI response with corrections. Tap words in AI reply to see popup. Bottom nav should be hidden during chat.

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add chat interface with corrections, word lookup, and save-to-wordbank"
```

---

### Task 5: Word Bank Screen

**Files:**
- Create: `js/wordbank.js`

**Step 1: Create `js/wordbank.js`**

Word bank with search, filter by category/formality, flashcard review mode, and delete capability.

```javascript
const WordBank = {
  filter: '',
  mode: 'list', // 'list' or 'review'

  render() {
    const container = document.getElementById('screen-wordbank');
    const words = Storage.getWordBank();

    if (words.length === 0) {
      container.innerHTML = `<div class="empty-state">
        <p class="empty-icon">📖</p>
        <p>No words saved yet!</p>
        <p class="empty-hint">Tap any word in a chat to save it here.</p>
      </div>`;
      return;
    }

    const filtered = this.filter
      ? words.filter(w => w.word.toLowerCase().includes(this.filter.toLowerCase()) ||
          w.meaning_english.toLowerCase().includes(this.filter.toLowerCase()))
      : words;

    // Words due for review
    const reviewDue = words.filter(w => w.nextReview <= Date.now());

    container.innerHTML = `
      <div class="wordbank-container">
        <div class="wordbank-header">
          <input type="text" class="search-input" placeholder="Search words..."
            value="${this.filter}" oninput="WordBank.filter=this.value; WordBank.render()">
          ${reviewDue.length > 0 ? `<button class="review-btn" onclick="WordBank.startReview()">Review (${reviewDue.length})</button>` : ''}
        </div>
        <div class="word-count">${words.length} words saved</div>
        <div class="wordbank-list">
          ${filtered.sort((a,b) => b.savedAt - a.savedAt).map((w, i) => `
            <div class="word-card">
              <div class="word-card-header">
                <span class="word-term">${w.word}</span>
                <span class="badge ${w.formality}">${w.formality}</span>
              </div>
              <p class="word-meaning">${w.meaning_english}</p>
              ${w.meaning_hindi ? `<p class="word-meaning-hi">${w.meaning_hindi}</p>` : ''}
              <div class="word-card-footer">
                <span class="word-scenario">${w.scenario}</span>
                <button class="delete-word" onclick="WordBank.deleteWord(${i})">Remove</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>`;
  },

  deleteWord(index) {
    const words = Storage.getWordBank();
    words.splice(index, 1);
    Storage.saveWordBank(words);
    this.render();
  },

  startReview() {
    const words = Storage.getWordBank().filter(w => w.nextReview <= Date.now());
    if (words.length === 0) return;

    this.reviewWords = [...words];
    this.reviewIndex = 0;
    this.showFlashcard();
  },

  showFlashcard() {
    if (this.reviewIndex >= this.reviewWords.length) {
      this.endReview();
      return;
    }

    const w = this.reviewWords[this.reviewIndex];
    const container = document.getElementById('screen-wordbank');

    container.innerHTML = `
      <div class="flashcard-container">
        <div class="flashcard-progress">${this.reviewIndex + 1} / ${this.reviewWords.length}</div>
        <div class="flashcard" id="flashcard" onclick="WordBank.flipCard()">
          <div class="flashcard-front">
            <h2>${w.word}</h2>
            <p class="flashcard-hint">Tap to see meaning</p>
          </div>
          <div class="flashcard-back hidden">
            <h3>${w.meaning_english}</h3>
            ${w.meaning_hindi ? `<p>${w.meaning_hindi}</p>` : ''}
            ${w.examples?.[0] ? `<p class="example">"${w.examples[0]}"</p>` : ''}
          </div>
        </div>
        <div class="flashcard-actions">
          <button class="fc-btn hard" onclick="WordBank.reviewAnswer('hard')">Hard</button>
          <button class="fc-btn ok" onclick="WordBank.reviewAnswer('ok')">OK</button>
          <button class="fc-btn easy" onclick="WordBank.reviewAnswer('easy')">Easy</button>
        </div>
        <button class="fc-exit" onclick="WordBank.render()">Exit Review</button>
      </div>`;
  },

  flipCard() {
    const card = document.getElementById('flashcard');
    card.querySelector('.flashcard-front').classList.toggle('hidden');
    card.querySelector('.flashcard-back').classList.toggle('hidden');
  },

  reviewAnswer(difficulty) {
    const w = this.reviewWords[this.reviewIndex];
    const allWords = Storage.getWordBank();
    const wordInBank = allWords.find(bw => bw.word === w.word);

    if (wordInBank) {
      wordInBank.reviewCount = (wordInBank.reviewCount || 0) + 1;
      // Spaced repetition intervals
      const intervals = { hard: 1, ok: 3, easy: 7 };
      const days = intervals[difficulty] * Math.pow(1.5, wordInBank.reviewCount - 1);
      wordInBank.nextReview = Date.now() + (days * 86400000);
      Storage.saveWordBank(allWords);
    }

    this.reviewIndex++;
    this.showFlashcard();
  },

  endReview() {
    const container = document.getElementById('screen-wordbank');
    container.innerHTML = `<div class="review-complete">
      <p class="complete-icon">🎉</p>
      <h2>Review Complete!</h2>
      <p>You reviewed ${this.reviewWords.length} words.</p>
      <button class="primary-btn" onclick="WordBank.render()">Back to Word Bank</button>
    </div>`;
  }
};
```

**Step 2: Verify**

Navigate to Word Bank tab. Should show empty state if no words saved. Save a word from chat, then check Word Bank — should appear. Review button shows when words are due.

**Step 3: Commit**

```bash
git add js/wordbank.js && git commit -m "feat: add word bank with search, flashcard review, and spaced repetition"
```

---

### Task 6: Grammar Zone

**Files:**
- Create: `js/grammar.js`

**Step 1: Create `js/grammar.js`**

Structured grammar lessons for both Hindi and English, with common Marathi speaker mistakes, examples from real scenarios, and AI-powered explanation.

```javascript
const GrammarZone = {
  currentLesson: null,

  lessons: [
    // Hindi Grammar
    { id: 'hi-gender', lang: 'hindi', title: 'Gender in Hindi', desc: 'Masculine vs Feminine — where Marathi speakers mess up', content: `
      <h3>Hindi Gender Rules (for Marathi speakers)</h3>
      <p>Marathi and Hindi have DIFFERENT genders for many words. This is the #1 mistake.</p>
      <div class="grammar-example">
        <p class="wrong">❌ "Mera kitaab" (Marathi influence — kitaab is feminine in Hindi)</p>
        <p class="right">✅ "Meri kitaab"</p>
      </div>
      <div class="grammar-example">
        <p class="wrong">❌ "Woh acha ladki hai"</p>
        <p class="right">✅ "Woh achi ladki hai"</p>
      </div>
      <h4>Common Words with Different Gender</h4>
      <table class="grammar-table">
        <tr><th>Word</th><th>Hindi Gender</th><th>Marathi Gender</th></tr>
        <tr><td>Kitaab (book)</td><td>Feminine</td><td>Neutral</td></tr>
        <tr><td>Dukaan (shop)</td><td>Feminine</td><td>Neutral</td></tr>
        <tr><td>Hawa (wind)</td><td>Feminine</td><td>Feminine</td></tr>
      </table>
      <h4>Quick Rule</h4>
      <p>Most Hindi words ending in <strong>-aa</strong> are masculine. Most ending in <strong>-ee</strong> are feminine. But there are exceptions!</p>
    ` },
    { id: 'hi-tenses', lang: 'hindi', title: 'Hindi Tenses Made Simple', desc: 'Past, present, future — with real examples', content: `
      <h3>Tenses in Romanized Hindi</h3>
      <h4>Present (Haal)</h4>
      <p>"Main karta/karti hoon" — I do</p>
      <p>"Tu karta/karti hai" — You do</p>
      <p>"Woh karta/karti hai" — He/She does</p>
      <h4>Past (Bhoot)</h4>
      <p>"Maine kiya" — I did</p>
      <p>"Tune kiya" — You did</p>
      <p>"Usne kiya" — He/She did</p>
      <h4>Future (Bhavishya)</h4>
      <p>"Main karunga/karungi" — I will do</p>
      <p>"Tu karega/karegi" — You will do</p>
      <div class="grammar-example">
        <p><strong>Real scenario:</strong></p>
        <p>"Kal main college nahi <strong>gaya</strong> tha" — I didn't go to college yesterday</p>
        <p>"Aaj main class <strong>jaaunga</strong>" — Today I will go to class</p>
      </div>
    ` },
    { id: 'hi-postpositions', lang: 'hindi', title: 'Hindi Postpositions', desc: 'Me, par, ko, se, ka — when to use which', content: `
      <h3>Postpositions (Hindi ke "prepositions")</h3>
      <p>Hindi uses postpositions (come AFTER the noun, not before).</p>
      <div class="grammar-example">
        <p><strong>Me</strong> (in): "Ghar <strong>me</strong>" — In the house</p>
        <p><strong>Par</strong> (on): "Table <strong>par</strong>" — On the table</p>
        <p><strong>Ko</strong> (to): "Usko <strong>bolo</strong>" — Tell him</p>
        <p><strong>Se</strong> (from/with): "Usse <strong>baat kar</strong>" — Talk with him</p>
        <p><strong>Ka/Ki/Ke</strong> (of/'s): "Raam <strong>ka</strong> ghar" — Ram's house</p>
      </div>
      <h4>Marathi Speaker Mistake</h4>
      <div class="grammar-example">
        <p class="wrong">❌ "Main school ko jaa raha hoon" (Marathi: "la jaato" influence)</p>
        <p class="right">✅ "Main school jaa raha hoon" (no "ko" needed here)</p>
      </div>
    ` },
    { id: 'hi-casual', lang: 'hindi', title: 'Casual Hindi Slang', desc: 'Bhai, yaar, scene — how friends actually talk', content: `
      <h3>How Friends Actually Talk in Hindi</h3>
      <h4>Common Filler Words</h4>
      <p><strong>Yaar</strong> — Dude/bro (universal, any sentence)</p>
      <p><strong>Bhai</strong> — Bro (more masc, very common)</p>
      <p><strong>Arre</strong> — Hey/oh come on (surprise/frustration)</p>
      <p><strong>Matlab</strong> — Like/I mean (filler)</p>
      <p><strong>Scene</strong> — Situation ("Kya scene hai?" = "What's up?")</p>
      <h4>GenZ Hindi Slang</h4>
      <p><strong>Sahi me?</strong> — Really?/For real?</p>
      <p><strong>Mast</strong> — Cool/great</p>
      <p><strong>Bakchodi</strong> — Nonsense/messing around</p>
      <p><strong>Chill maar</strong> — Relax</p>
      <p><strong>Jugaad</strong> — Hack/workaround</p>
      <div class="grammar-example">
        <p><strong>Real example:</strong></p>
        <p>"Arre yaar, kal ka plan kya hai? Kuch scene hai kya?"</p>
        <p>= "Hey dude, what's the plan for tomorrow? Anything going on?"</p>
      </div>
    ` },

    // English Grammar
    { id: 'en-tenses', lang: 'english', title: 'English Tenses Simplified', desc: '12 tenses you actually need to know', content: `
      <h3>English Tenses That Actually Matter</h3>
      <h4>Simple Present</h4>
      <p>"I <strong>go</strong> to college every day."</p>
      <p>Use: habits, facts, routines</p>
      <h4>Present Continuous</h4>
      <p>"I <strong>am going</strong> to college right now."</p>
      <p>Use: happening right now</p>
      <h4>Simple Past</h4>
      <p>"I <strong>went</strong> to college yesterday."</p>
      <div class="grammar-example">
        <p class="wrong">❌ "I goed to college" (common mistake — go is irregular)</p>
        <p class="right">✅ "I went to college"</p>
      </div>
      <h4>Present Perfect</h4>
      <p>"I <strong>have been</strong> to that college." (experience)</p>
      <p>"I <strong>have finished</strong> the assignment." (just completed)</p>
      <div class="grammar-example">
        <p class="wrong">❌ "I have went there" (Indian English mistake)</p>
        <p class="right">✅ "I have gone/been there"</p>
      </div>
    ` },
    { id: 'en-articles', lang: 'english', title: 'A, An, The — Articles', desc: 'The #1 mistake Indian speakers make in English', content: `
      <h3>Articles: The Biggest Indian English Problem</h3>
      <p>Hindi and Marathi don't have articles, so we often skip them or use wrong ones.</p>
      <h4>Rules</h4>
      <p><strong>A/An</strong> = one of many (non-specific)</p>
      <p><strong>The</strong> = this specific one</p>
      <p><strong>Nothing</strong> = general/plural/uncountable</p>
      <div class="grammar-example">
        <p class="wrong">❌ "I am going to college" (which college? yours — needs "the" or drop it for habitual)</p>
        <p class="right">✅ "I am going to the college" (specific) or "I go to college" (habitual)</p>
        <p class="wrong">❌ "Give me water" (sounds commanding)</p>
        <p class="right">✅ "Can I get some water?" (natural)</p>
      </div>
    ` },
    { id: 'en-prepositions', lang: 'english', title: 'Prepositions', desc: 'In, on, at, to, for — stop guessing', content: `
      <h3>Prepositions Indians Get Wrong</h3>
      <div class="grammar-example">
        <p class="wrong">❌ "I am sitting on the bus" (you're on the roof?)</p>
        <p class="right">✅ "I am sitting in the bus" (inside)</p>
      </div>
      <div class="grammar-example">
        <p class="wrong">❌ "He discussed about the topic"</p>
        <p class="right">✅ "He discussed the topic" (discuss doesn't need "about")</p>
      </div>
      <div class="grammar-example">
        <p class="wrong">❌ "I will come on Monday morning"</p>
        <p class="right">✅ "I will come on Monday" OR "I will come in the morning"</p>
      </div>
    ` },
    { id: 'en-formal-informal', lang: 'english', title: 'Formal vs Casual English', desc: 'When to sound professional vs chill', content: `
      <h3>Same Meaning, Different Vibes</h3>
      <table class="grammar-table">
        <tr><th>Casual</th><th>Formal</th></tr>
        <tr><td>What's up?</td><td>How are you doing?</td></tr>
        <tr><td>Gonna</td><td>Going to</td></tr>
        <tr><td>Wanna</td><td>Would like to</td></tr>
        <tr><td>Cool</td><td>That sounds good</td></tr>
        <tr><td>My bad</td><td>I apologize for the mistake</td></tr>
        <tr><td>No worries</td><td>Not a problem at all</td></tr>
        <tr><td>Lemme know</td><td>Please let me know</td></tr>
        <tr><td>That's fire</td><td>That's excellent</td></tr>
      </table>
      <div class="grammar-example">
        <p><strong>Texting a friend:</strong> "Yo, gonna be late, my bad"</p>
        <p><strong>Email to professor:</strong> "I apologize, I will be arriving a few minutes late."</p>
      </div>
    ` },
    { id: 'en-genz', lang: 'english', title: 'GenZ English Slang', desc: 'No cap, bussin, slay — what they mean', content: `
      <h3>GenZ English You Need to Know</h3>
      <p><strong>No cap</strong> — Not lying / for real</p>
      <p><strong>Bussin</strong> — Really good (usually food)</p>
      <p><strong>Slay</strong> — Killed it / did amazing</p>
      <p><strong>Lowkey</strong> — Secretly / kind of</p>
      <p><strong>Highkey</strong> — Obviously / very much</p>
      <p><strong>Bruh</strong> — Bro (reaction of disbelief)</p>
      <p><strong>Vibe check</strong> — Checking the mood/energy</p>
      <p><strong>Bet</strong> — OK / sure / deal</p>
      <p><strong>W / L</strong> — Win / Loss</p>
      <p><strong>It's giving...</strong> — It looks like / it has the energy of</p>
      <div class="grammar-example">
        <p><strong>In context:</strong></p>
        <p>"That presentation was a W, no cap. You lowkey slayed it."</p>
        <p>= "That presentation was great, seriously. You secretly did amazing."</p>
      </div>
    ` }
  ],

  render() {
    const container = document.getElementById('screen-grammar');

    if (this.currentLesson) {
      this.renderLesson();
      return;
    }

    const hindiLessons = this.lessons.filter(l => l.lang === 'hindi');
    const englishLessons = this.lessons.filter(l => l.lang === 'english');
    const progress = Storage.getProgress();

    container.innerHTML = `
      <div class="grammar-container">
        <h2 class="section-title">Hindi Grammar</h2>
        <div class="lesson-list">
          ${hindiLessons.map(l => `
            <div class="lesson-card ${progress.lessonsCompleted.includes(l.id) ? 'completed' : ''}"
              onclick="GrammarZone.openLesson('${l.id}')">
              <span class="lesson-check">${progress.lessonsCompleted.includes(l.id) ? '✅' : '📝'}</span>
              <div>
                <h3>${l.title}</h3>
                <p>${l.desc}</p>
              </div>
            </div>
          `).join('')}
        </div>

        <h2 class="section-title">English Grammar</h2>
        <div class="lesson-list">
          ${englishLessons.map(l => `
            <div class="lesson-card ${progress.lessonsCompleted.includes(l.id) ? 'completed' : ''}"
              onclick="GrammarZone.openLesson('${l.id}')">
              <span class="lesson-check">${progress.lessonsCompleted.includes(l.id) ? '✅' : '📝'}</span>
              <div>
                <h3>${l.title}</h3>
                <p>${l.desc}</p>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="ai-grammar-section">
          <h2 class="section-title">Ask AI About Grammar</h2>
          <div class="ai-grammar-input">
            <input type="text" id="grammar-question" placeholder="Ask any grammar question...">
            <button onclick="GrammarZone.askAI()">Ask</button>
          </div>
          <div id="grammar-ai-answer"></div>
        </div>
      </div>`;
  },

  openLesson(id) {
    this.currentLesson = this.lessons.find(l => l.id === id);
    this.renderLesson();
  },

  renderLesson() {
    const l = this.currentLesson;
    const container = document.getElementById('screen-grammar');
    const progress = Storage.getProgress();
    const isCompleted = progress.lessonsCompleted.includes(l.id);

    container.innerHTML = `
      <div class="lesson-container">
        <button class="back-btn" onclick="GrammarZone.currentLesson=null; GrammarZone.render()">← Back</button>
        <div class="lesson-content">${l.content}</div>
        <button class="primary-btn ${isCompleted ? 'completed' : ''}"
          onclick="GrammarZone.markComplete('${l.id}')">
          ${isCompleted ? '✅ Completed' : 'Mark as Completed'}
        </button>
      </div>`;
  },

  markComplete(id) {
    const progress = Storage.getProgress();
    if (!progress.lessonsCompleted.includes(id)) {
      progress.lessonsCompleted.push(id);
      Storage.saveProgress(progress);
    }
    this.renderLesson();
  },

  async askAI() {
    const input = document.getElementById('grammar-question');
    const question = input.value.trim();
    if (!question) return;

    const answerEl = document.getElementById('grammar-ai-answer');
    answerEl.innerHTML = '<div class="loading">Thinking...</div>';

    const systemPrompt = `You are a grammar expert helping a Marathi speaker improve their Hindi (Romanized) and English.
Give clear, concise explanations with examples. Use Romanized Hindi (English letters, NOT Devanagari).
Focus on practical, real-world usage. Mention common mistakes Marathi speakers make when relevant.`;

    const result = await AI.sendMessage(systemPrompt, [{ role: 'user', content: question }]);

    if (result.error) {
      answerEl.innerHTML = `<p class="error">${result.error}</p>`;
    } else {
      answerEl.innerHTML = `<div class="ai-answer">${result.text.replace(/\n/g, '<br>')}</div>`;
    }
  }
};
```

**Step 2: Verify**

Navigate to Grammar tab. Should see Hindi and English lesson lists. Click a lesson — should show content with back button. "Ask AI" section should accept questions.

**Step 3: Commit**

```bash
git add js/grammar.js && git commit -m "feat: add grammar zone with Hindi/English lessons and AI Q&A"
```

---

### Task 7: Settings Screen

**Files:**
- Modify: `js/app.js` (add SettingsScreen object)

**Step 1: Add SettingsScreen to `app.js`**

```javascript
const SettingsScreen = {
  render() {
    const container = document.getElementById('screen-settings');
    const settings = Storage.getSettings();
    const progress = Storage.getProgress();
    const wordCount = Storage.getWordBank().length;

    container.innerHTML = `
      <div class="settings-container">
        <div class="settings-section">
          <h3>AI Provider</h3>
          <select id="setting-provider" onchange="SettingsScreen.save()">
            <option value="gemini" ${settings.provider === 'gemini' ? 'selected' : ''}>Google Gemini</option>
            <option value="openai" ${settings.provider === 'openai' ? 'selected' : ''}>OpenAI</option>
            <option value="claude" ${settings.provider === 'claude' ? 'selected' : ''}>Claude (Anthropic)</option>
          </select>

          <label>API Key</label>
          <input type="password" id="setting-apikey" value="${settings.apiKey}"
            placeholder="Enter your API key" onchange="SettingsScreen.save()">

          <label>Model (optional)</label>
          <input type="text" id="setting-model" value="${settings.model || ''}"
            placeholder="Leave empty for default" onchange="SettingsScreen.save()">
          <p class="setting-hint">Default: gemini-2.0-flash / gpt-4o-mini / claude-sonnet-4-6</p>
        </div>

        <div class="settings-section">
          <h3>Preferences</h3>
          <label>Default Language</label>
          <select id="setting-lang" onchange="SettingsScreen.save()">
            <option value="hindi" ${settings.defaultLang === 'hindi' ? 'selected' : ''}>Hindi</option>
            <option value="english" ${settings.defaultLang === 'english' ? 'selected' : ''}>English</option>
          </select>

          <label>Theme</label>
          <select id="setting-theme" onchange="SettingsScreen.save()">
            <option value="dark" ${settings.theme === 'dark' ? 'selected' : ''}>Dark</option>
            <option value="light" ${settings.theme === 'light' ? 'selected' : ''}>Light</option>
          </select>
        </div>

        <div class="settings-section">
          <h3>Your Progress</h3>
          <div class="stats-grid">
            <div class="stat-card">
              <span class="stat-number">${wordCount}</span>
              <span class="stat-label">Words Saved</span>
            </div>
            <div class="stat-card">
              <span class="stat-number">${progress.lessonsCompleted.length}</span>
              <span class="stat-label">Lessons Done</span>
            </div>
          </div>
        </div>

        <div class="settings-section">
          <button class="danger-btn" onclick="SettingsScreen.resetAll()">Reset All Data</button>
        </div>
      </div>`;
  },

  save() {
    const settings = {
      provider: document.getElementById('setting-provider').value,
      apiKey: document.getElementById('setting-apikey').value,
      model: document.getElementById('setting-model').value,
      defaultLang: document.getElementById('setting-lang').value,
      theme: document.getElementById('setting-theme').value
    };
    Storage.saveSettings(settings);
    App.applyTheme();
  },

  resetAll() {
    if (confirm('This will delete all your saved words, chat history, and progress. Are you sure?')) {
      Storage.clearAll();
      this.render();
    }
  }
};
```

**Step 2: Verify**

Navigate to Settings. Configure API provider and key. Change theme — should toggle dark/light. Stats should reflect real data.

**Step 3: Commit**

```bash
git add js/app.js && git commit -m "feat: add settings screen with API config, theme, and stats"
```

---

### Task 8: Complete CSS Stylesheet

**Files:**
- Modify: `css/styles.css`

**Step 1: Write complete CSS**

This is the largest single file. Must include all styles for every component:
- CSS reset and variables (dark/light theme)
- Typography and base styles
- Header and bottom nav
- Home screen: language toggle, category sections, scenario card grid
- Chat: messages area, bubbles (user/assistant), input bar, typing indicator, corrections
- Word popup overlay
- Word bank: search, word cards, flashcard review
- Grammar: lesson list, lesson content, grammar examples, tables
- Settings: form elements, stats grid
- Utility: hidden, loading spinner, toast, empty state, badges
- Animations: screen transitions, chat bubble entrance, flashcard flip, toast slide

**Key mobile considerations:**
- Touch targets minimum 44px
- Safe area padding for notch phones
- Prevent zoom on double-tap (handled by viewport meta)
- Scrollable content areas with momentum scrolling
- Input bar stays above keyboard (use `position: fixed` or `sticky`)

**Step 2: Verify**

Full visual test on all screens. Check dark theme, light theme. Check on mobile viewport (Chrome DevTools 360x800).

**Step 3: Commit**

```bash
git add css/styles.css && git commit -m "feat: add complete mobile-first dark/light theme stylesheet"
```

---

### Task 9: PWA Icons + Final Polish

**Files:**
- Create: `assets/icons/icon-192.png`
- Create: `assets/icons/icon-512.png`

**Step 1: Generate PWA icons**

Create simple SVG-based icons (a speech bubble with "BB" text). Convert to PNG at 192x192 and 512x512 sizes. Can use inline SVG or canvas in a helper script.

**Step 2: Final integration test**

- Open in Chrome on phone
- Add to home screen
- Test all flows:
  - Home → pick scenario → chat → get AI response → tap word → save → check Word Bank
  - Grammar lessons → read → mark complete
  - Settings → add API key → change theme
  - Word Bank → review flashcards
- Check offline: app shell loads, shows "need internet for AI" gracefully

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: add PWA icons and final polish"
```

---

## Summary

| Task | Description | Key Files |
|------|-------------|-----------|
| 1 | Project scaffold (HTML, CSS foundation, router, storage, SW) | index.html, css/styles.css, js/app.js, js/storage.js, sw.js, manifest.json |
| 2 | Scenarios + Home screen | js/scenarios.js, js/app.js |
| 3 | AI provider adapter | js/ai.js |
| 4 | Chat interface | js/chat.js, css/styles.css |
| 5 | Word Bank | js/wordbank.js |
| 6 | Grammar Zone | js/grammar.js |
| 7 | Settings screen | js/app.js |
| 8 | Complete CSS | css/styles.css |
| 9 | PWA icons + polish | assets/icons/ |
