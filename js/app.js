// ───── Home Screen ─────
const HomeScreen = {
  render() {
    const container = document.getElementById('screen-home');
    const settings = Storage.getSettings();
    const lang = settings.defaultLang || 'hindi';

    let html = '<div class="home-container">';

    // Language toggle
    html +=
      '<div class="lang-toggle">' +
      '  <button class="' + (lang === 'hindi' ? 'active' : '') + '" onclick="HomeScreen.setLang(\'hindi\')">Hindi</button>' +
      '  <button class="' + (lang === 'english' ? 'active' : '') + '" onclick="HomeScreen.setLang(\'english\')">English</button>' +
      '</div>';

    // Scenario categories
    for (const cat of SCENARIOS.categories) {
      const scenarios = SCENARIOS.getByCategory(cat.id);
      html +=
        '<div class="category-section">' +
        '  <h2 class="category-title">' + cat.emoji + ' ' + cat.name + '</h2>' +
        '  <div class="scenario-grid">';

      for (const s of scenarios) {
        html +=
          '<div class="scenario-card">' +
          '  <div class="scenario-card-main" onclick="Chat.open(\'' + s.id + '\', \'' + lang + '\')">' +
          '    <span class="scenario-emoji">' + s.emoji + '</span>' +
          '    <span class="scenario-title">' + s.title + '</span>' +
          '    <span class="scenario-desc">' + s.desc + '</span>' +
          '  </div>' +
          '  <button class="scenario-voice-btn" onclick="event.stopPropagation(); Voice.open(\'' + s.id + '\', \'' + lang + '\')" title="Voice Mode">🎙️</button>' +
          '</div>';
      }

      html += '  </div></div>';
    }

    html += '</div>';
    container.innerHTML = html;
  },

  setLang(lang) {
    const settings = Storage.getSettings();
    settings.defaultLang = lang;
    Storage.saveSettings(settings);
    this.render();
  }
};

// ───── Settings Screen ─────
const SettingsScreen = {
  render() {
    const container = document.getElementById('screen-settings');
    const settings = Storage.getSettings();
    const progress = Storage.getProgress();
    const wordCount = Storage.getWordBank().length;

    container.innerHTML =
      '<div class="settings-container">' +
      '  <div class="settings-section">' +
      '    <h3>AI Provider</h3>' +
      '    <label>Provider</label>' +
      '    <select id="setting-provider" onchange="SettingsScreen.save()">' +
      '      <option value="gemini"' + (settings.provider === 'gemini' ? ' selected' : '') + '>Google Gemini (Free tier available)</option>' +
      '      <option value="openai"' + (settings.provider === 'openai' ? ' selected' : '') + '>OpenAI (GPT)</option>' +
      '      <option value="claude"' + (settings.provider === 'claude' ? ' selected' : '') + '>Claude (Anthropic)</option>' +
      '    </select>' +
      '    <label>API Key</label>' +
      '    <div class="api-key-field">' +
      '      <input type="password" id="setting-apikey" value="' + (settings.apiKey || '') + '"' +
      '        placeholder="Enter your API key" onchange="SettingsScreen.save()">' +
      '      <button class="toggle-key-btn" onclick="SettingsScreen.toggleKeyVisibility()">Show</button>' +
      '    </div>' +
      '    <label>Model <span class="optional">(optional)</span></label>' +
      '    <input type="text" id="setting-model" value="' + (settings.model || '') + '"' +
      '      placeholder="Leave empty for default" onchange="SettingsScreen.save()">' +
      '    <p class="setting-hint">Defaults: gemini-2.0-flash / gpt-4o-mini / claude-sonnet-4-6</p>' +
      '  </div>' +
      '  <div class="settings-section">' +
      '    <h3>Preferences</h3>' +
      '    <label>Default Chat Language</label>' +
      '    <select id="setting-lang" onchange="SettingsScreen.save()">' +
      '      <option value="hindi"' + (settings.defaultLang === 'hindi' ? ' selected' : '') + '>Hindi (Romanized)</option>' +
      '      <option value="english"' + (settings.defaultLang === 'english' ? ' selected' : '') + '>English</option>' +
      '    </select>' +
      '    <label>Theme</label>' +
      '    <select id="setting-theme" onchange="SettingsScreen.save()">' +
      '      <option value="dark"' + (settings.theme === 'dark' ? ' selected' : '') + '>Dark</option>' +
      '      <option value="light"' + (settings.theme === 'light' ? ' selected' : '') + '>Light</option>' +
      '    </select>' +
      '  </div>' +
      '  <div class="settings-section">' +
      '    <h3>Your Progress</h3>' +
      '    <div class="stats-grid">' +
      '      <div class="stat-card">' +
      '        <span class="stat-number">' + wordCount + '</span>' +
      '        <span class="stat-label">Words Saved</span>' +
      '      </div>' +
      '      <div class="stat-card">' +
      '        <span class="stat-number">' + progress.lessonsCompleted.length + '</span>' +
      '        <span class="stat-label">Lessons Done</span>' +
      '      </div>' +
      '    </div>' +
      '  </div>' +
      '  <div class="settings-section">' +
      '    <h3>Data</h3>' +
      '    <button class="danger-btn" onclick="SettingsScreen.resetAll()">Reset All Data</button>' +
      '    <p class="setting-hint">Deletes all saved words, chat history, and progress.</p>' +
      '  </div>' +
      '</div>';
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

  toggleKeyVisibility() {
    const input = document.getElementById('setting-apikey');
    const btn = input.nextElementSibling;
    if (input.type === 'password') {
      input.type = 'text';
      btn.textContent = 'Hide';
    } else {
      input.type = 'password';
      btn.textContent = 'Show';
    }
  },

  resetAll() {
    if (confirm('This will delete ALL your saved words, chat history, and progress. This cannot be undone. Are you sure?')) {
      Storage.clearAll();
      this.render();
    }
  }
};

// ───── Main App ─────
const App = {
  currentScreen: 'home',

  init() {
    this.applyTheme();
    this.setupNav();
    this.navigate('home');
    this.registerSW();
    this.updateStreak();
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
    document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach((b) => b.classList.remove('active'));

    // Show target
    const el = document.getElementById('screen-' + screen);
    if (el) {
      el.classList.add('active');
      this.currentScreen = screen;
    }

    // Highlight nav
    const btn = document.querySelector('.nav-btn[data-screen="' + screen + '"]');
    if (btn) btn.classList.add('active');

    // Update header
    const titles = {
      home: 'BolBaat',
      wordbank: 'Word Bank',
      grammar: 'Grammar Zone',
      settings: 'Settings',
      chat: 'Chat',
      voice: 'Voice Mode'
    };
    document.getElementById('header-title').textContent = titles[screen] || 'BolBaat';

    // Show/hide bottom nav during chat and voice
    document.getElementById('bottom-nav').classList.toggle('hidden', screen === 'chat' || screen === 'voice');

    // Render screen
    this.renderScreen(screen);
  },

  renderScreen(screen) {
    switch (screen) {
      case 'home':
        HomeScreen.render();
        break;
      case 'wordbank':
        WordBank.render();
        break;
      case 'grammar':
        GrammarZone.render();
        break;
      case 'settings':
        SettingsScreen.render();
        break;
    }
  },

  updateStreak() {
    const progress = Storage.getProgress();
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (progress.lastActiveDate === today) return;

    if (progress.lastActiveDate === yesterday) {
      progress.streak = (progress.streak || 0) + 1;
    } else if (progress.lastActiveDate !== today) {
      progress.streak = 1;
    }

    progress.lastActiveDate = today;
    Storage.saveProgress(progress);
  },

  async registerSW() {
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('sw.js');
      } catch (e) {
        console.log('Service Worker registration failed:', e);
      }
    }
  }
};

// Start the app
document.addEventListener('DOMContentLoaded', () => App.init());
