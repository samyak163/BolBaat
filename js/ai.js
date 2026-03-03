const AI = {
  async sendMessage(systemPrompt, messages) {
    const settings = Storage.getSettings();
    if (!settings.apiKey) {
      return { error: 'No API key set. Go to Settings (⚙️) to add your API key.' };
    }

    try {
      switch (settings.provider) {
        case 'gemini':
          return await this._gemini(systemPrompt, messages, settings);
        case 'openai':
          return await this._openai(systemPrompt, messages, settings);
        case 'claude':
          return await this._claude(systemPrompt, messages, settings);
        default:
          return { error: 'Unknown provider: ' + settings.provider };
      }
    } catch (e) {
      console.error('AI API error:', e);
      return { error: 'API call failed: ' + e.message };
    }
  },

  async _gemini(systemPrompt, messages, settings) {
    const model = settings.model || 'gemini-2.0-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${settings.apiKey}`;

    const contents = messages.map((m) => ({
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
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return { error: 'Empty response from Gemini' };
    return { text };
  },

  async _openai(systemPrompt, messages, settings) {
    const model = settings.model || 'gpt-4o-mini';
    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m) => ({ role: m.role, content: m.content }))
    ];

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + settings.apiKey
      },
      body: JSON.stringify({
        model,
        messages: apiMessages,
        temperature: 0.8,
        max_tokens: 1024
      })
    });

    const data = await res.json();
    if (data.error) return { error: data.error.message };
    const text = data.choices?.[0]?.message?.content;
    if (!text) return { error: 'Empty response from OpenAI' };
    return { text };
  },

  async _claude(systemPrompt, messages, settings) {
    const model = settings.model || 'claude-sonnet-4-6';
    const apiMessages = messages.map((m) => ({
      role: m.role,
      content: m.content
    }));

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': settings.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model,
        system: systemPrompt,
        messages: apiMessages,
        max_tokens: 1024
      })
    });

    const data = await res.json();
    if (data.error) return { error: data.error.message };
    const text = data.content?.[0]?.text;
    if (!text) return { error: 'Empty response from Claude' };
    return { text };
  },

  async lookupWord(word, language, context) {
    const systemPrompt = `You are a language dictionary for a Marathi speaker learning ${language}.
The user tapped on the word "${word}" in a conversation.
Context sentence: "${context}"

Respond ONLY with valid JSON (no markdown fences, no extra text). Use this exact format:
{
  "word": "${word}",
  "meaning_hindi": "meaning in Romanized Hindi (not Devanagari)",
  "meaning_english": "meaning in English",
  "examples": ["example sentence 1 using this word", "example sentence 2"],
  "related": ["synonym or related word 1", "related word 2", "related word 3"],
  "formality": "slang or casual or neutral or formal",
  "tip": "one practical tip about when/how to use this word"
}`;

    const result = await this.sendMessage(systemPrompt, [
      { role: 'user', content: `Define: ${word}` }
    ]);
    if (result.error) return result;

    try {
      // Try to extract JSON from the response (in case AI wraps it in markdown)
      let jsonStr = result.text.trim();
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) jsonStr = jsonMatch[0];
      return { data: JSON.parse(jsonStr) };
    } catch {
      // Fallback: return raw text as meaning
      return {
        data: {
          word,
          meaning_english: result.text,
          meaning_hindi: '',
          examples: [],
          related: [],
          formality: 'neutral',
          tip: ''
        }
      };
    }
  }
};
