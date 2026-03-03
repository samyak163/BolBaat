const Voice = {
  isListening: false,
  isSpeaking: false,
  recognition: null,
  scenarioId: null,
  language: 'hindi',
  messages: [],
  transcript: '',

  // Check browser support
  isSupported() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition) && !!window.speechSynthesis;
  },

  open(scenarioId, language) {
    if (!this.isSupported()) {
      Chat._showToast('Voice not supported in this browser. Use Chrome.');
      return;
    }

    this.scenarioId = scenarioId;
    this.language = language;
    this.messages = Storage.getChatHistory(scenarioId);
    this.transcript = '';

    const scenario = SCENARIOS.getById(scenarioId);

    // Update header
    document.getElementById('header-title').textContent = scenario.title;
    document.getElementById('header-actions').innerHTML =
      '<button class="header-btn close-btn" onclick="Voice.close()">✕</button>';

    App.navigate('voice');
    this.renderVoiceScreen(scenario);
    this._initRecognition();
  },

  close() {
    this.stopListening();
    this.stopSpeaking();
    document.getElementById('header-actions').innerHTML = '';

    // Go back to chat if we have messages, otherwise home
    if (this.scenarioId && this.messages.length > 0) {
      Chat.open(this.scenarioId, this.language);
    } else {
      App.navigate('home');
    }
  },

  renderVoiceScreen(scenario) {
    const container = document.getElementById('screen-voice');

    container.innerHTML =
      '<div class="voice-container">' +
      '  <div class="voice-scenario">' +
      '    <span class="voice-scenario-emoji">' + scenario.emoji + '</span>' +
      '    <span class="voice-scenario-name">' + scenario.title + '</span>' +
      '    <span class="voice-lang-badge">' + (this.language === 'hindi' ? 'Hindi' : 'English') + '</span>' +
      '  </div>' +

      '  <div class="voice-display" id="voice-display">' +
      '    <div class="voice-status" id="voice-status">Tap the mic to start speaking</div>' +
      '    <div class="voice-transcript" id="voice-transcript"></div>' +
      '  </div>' +

      '  <div class="voice-corrections" id="voice-corrections"></div>' +

      '  <div class="voice-controls">' +
      '    <button class="voice-mic-btn" id="voice-mic-btn" onclick="Voice.toggleListening()">' +
      '      <div class="mic-icon" id="mic-icon">' +
      '        <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">' +
      '          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5z"/>' +
      '          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>' +
      '        </svg>' +
      '      </div>' +
      '      <div class="mic-ripple" id="mic-ripple"></div>' +
      '    </button>' +
      '    <button class="voice-stop-btn" id="voice-stop-speak" onclick="Voice.stopSpeaking()" style="display:none">' +
      '      Stop Speaking' +
      '    </button>' +
      '  </div>' +

      '  <div class="voice-hint" id="voice-hint">Tap mic and speak in ' +
      (this.language === 'hindi' ? 'Hindi' : 'English') + '</div>' +
      '</div>';
  },

  _initRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();

    // Set language
    if (this.language === 'hindi') {
      this.recognition.lang = 'hi-IN';
    } else {
      this.recognition.lang = 'en-IN'; // Indian English accent support
    }

    this.recognition.continuous = false;
    this.recognition.interimResults = true;

    this.recognition.onstart = () => {
      this.isListening = true;
      this._updateMicUI(true);
      this._setStatus('Listening...');
    };

    this.recognition.onresult = (event) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += t;
        } else {
          interim += t;
        }
      }

      // Show real-time transcript
      const transcriptEl = document.getElementById('voice-transcript');
      if (transcriptEl) {
        if (final) {
          this.transcript = final;
          transcriptEl.innerHTML =
            '<div class="transcript-final">' + this._escapeHtml(final) + '</div>';
        } else if (interim) {
          transcriptEl.innerHTML =
            '<div class="transcript-interim">' + this._escapeHtml(interim) + '</div>';
        }
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this._updateMicUI(false);

      // If we got a final transcript, send it
      if (this.transcript.trim()) {
        this._sendVoiceMessage(this.transcript.trim());
        this.transcript = '';
      } else {
        this._setStatus('Didn\'t catch that. Tap mic to try again.');
      }
    };

    this.recognition.onerror = (event) => {
      this.isListening = false;
      this._updateMicUI(false);

      if (event.error === 'no-speech') {
        this._setStatus('No speech detected. Tap mic to try again.');
      } else if (event.error === 'not-allowed') {
        this._setStatus('Microphone access denied. Allow it in browser settings.');
      } else {
        this._setStatus('Error: ' + event.error + '. Tap mic to retry.');
      }
    };
  },

  toggleListening() {
    if (this.isSpeaking) {
      this.stopSpeaking();
      return;
    }

    if (this.isListening) {
      this.stopListening();
    } else {
      this.startListening();
    }
  },

  startListening() {
    if (this.isListening || !this.recognition) return;
    this.transcript = '';

    // Re-init recognition (Chrome requires this for consecutive uses)
    this._initRecognition();

    try {
      this.recognition.start();
    } catch (e) {
      console.error('Speech recognition start error:', e);
      this._setStatus('Could not start mic. Try again.');
    }
  },

  stopListening() {
    if (!this.isListening || !this.recognition) return;
    try {
      this.recognition.stop();
    } catch (e) {
      // Already stopped
    }
  },

  async _sendVoiceMessage(text) {
    this._setStatus('Thinking...');
    this._setCorrections('');

    // Show what the user said
    const transcriptEl = document.getElementById('voice-transcript');
    if (transcriptEl) {
      transcriptEl.innerHTML =
        '<div class="transcript-you"><span class="transcript-label">You:</span> ' +
        this._escapeHtml(text) + '</div>';
    }

    // Add to messages
    const userMsg = { role: 'user', content: text, timestamp: Date.now() };
    this.messages.push(userMsg);

    // Send to AI
    const systemPrompt = SCENARIOS.getSystemPrompt(this.scenarioId, this.language);
    const apiMessages = this.messages.map((m) => ({ role: m.role, content: m.content }));
    const result = await AI.sendMessage(systemPrompt, apiMessages);

    if (result.error) {
      this._setStatus('Error: ' + result.error);
      return;
    }

    // Parse corrections
    const { reply, corrections } = Chat._parseCorrections(result.text);

    // Add AI message
    const aiMsg = { role: 'assistant', content: result.text, timestamp: Date.now() };
    this.messages.push(aiMsg);
    Storage.saveChatHistory(this.scenarioId, this.messages);

    // Show AI response as subtitle
    if (transcriptEl) {
      transcriptEl.innerHTML =
        '<div class="transcript-you"><span class="transcript-label">You:</span> ' +
        this._escapeHtml(text) + '</div>' +
        '<div class="transcript-ai"><span class="transcript-label">AI:</span> ' +
        this._escapeHtml(reply) + '</div>';
    }

    // Show corrections
    if (corrections.length > 0) {
      this._setCorrections(
        corrections
          .map((c) => '<div class="correction ' + c.type + '">' + c.text + '</div>')
          .join('')
      );
    }

    // Speak the reply
    this._setStatus('Speaking...');
    await this._speak(reply);
    this._setStatus('Tap mic to continue the conversation');
  },

  _speak(text) {
    return new Promise((resolve) => {
      if (!window.speechSynthesis) {
        resolve();
        return;
      }

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      // Set voice language
      if (this.language === 'hindi') {
        utterance.lang = 'hi-IN';
      } else {
        utterance.lang = 'en-IN';
      }

      // Try to find a good voice
      const voices = window.speechSynthesis.getVoices();
      const langCode = this.language === 'hindi' ? 'hi' : 'en';
      const matchingVoice = voices.find((v) => v.lang.startsWith(langCode));
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }

      utterance.rate = 0.9; // Slightly slower for learning
      utterance.pitch = 1;

      this.isSpeaking = true;
      const stopBtn = document.getElementById('voice-stop-speak');
      if (stopBtn) stopBtn.style.display = 'block';

      utterance.onend = () => {
        this.isSpeaking = false;
        if (stopBtn) stopBtn.style.display = 'none';
        resolve();
      };

      utterance.onerror = () => {
        this.isSpeaking = false;
        if (stopBtn) stopBtn.style.display = 'none';
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  },

  stopSpeaking() {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    this.isSpeaking = false;
    const stopBtn = document.getElementById('voice-stop-speak');
    if (stopBtn) stopBtn.style.display = 'none';
    this._setStatus('Tap mic to continue');
  },

  _updateMicUI(listening) {
    const btn = document.getElementById('voice-mic-btn');
    const ripple = document.getElementById('mic-ripple');
    if (btn) btn.classList.toggle('listening', listening);
    if (ripple) ripple.classList.toggle('active', listening);
  },

  _setStatus(text) {
    const el = document.getElementById('voice-status');
    if (el) el.textContent = text;
  },

  _setCorrections(html) {
    const el = document.getElementById('voice-corrections');
    if (el) el.innerHTML = html;
  },

  _escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};

// Load voices (Chrome loads them async)
if (window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
}
