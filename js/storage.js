const Storage = {
  _prefix: 'bolbaat_',

  get(key, fallback = null) {
    try {
      const val = localStorage.getItem(this._prefix + key);
      return val ? JSON.parse(val) : fallback;
    } catch {
      return fallback;
    }
  },

  set(key, value) {
    localStorage.setItem(this._prefix + key, JSON.stringify(value));
  },

  remove(key) {
    localStorage.removeItem(this._prefix + key);
  },

  getSettings() {
    return this.get('settings', {
      provider: 'gemini',
      apiKey: '',
      model: '',
      theme: 'dark',
      defaultLang: 'hindi'
    });
  },

  saveSettings(settings) {
    this.set('settings', settings);
  },

  getWordBank() {
    return this.get('wordbank', []);
  },

  saveWordBank(words) {
    this.set('wordbank', words);
  },

  getChatHistory(scenarioId) {
    return this.get('chat_' + scenarioId, []);
  },

  saveChatHistory(scenarioId, messages) {
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

  saveProgress(progress) {
    this.set('progress', progress);
  },

  clearAll() {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(this._prefix)) keys.push(key);
    }
    keys.forEach((k) => localStorage.removeItem(k));
  }
};
