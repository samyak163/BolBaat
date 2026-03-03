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
    return this.items.filter((s) => s.category === catId);
  },

  getById(id) {
    return this.items.find((s) => s.id === id);
  },

  getSystemPrompt(scenarioId, language) {
    const scenario = this.getById(scenarioId);
    if (!scenario) return '';

    const langInstructions =
      language === 'hindi'
        ? `Respond in Romanized Hindi (Hindi written in English letters like "Bhai kya scene hai").
Do NOT use Devanagari script ever. User is a Marathi speaker learning Hindi.
When correcting, show the correct Romanized Hindi form.`
        : `Respond in English. User is an Indian student learning to speak natural English.
Adapt vocabulary to Indian English context where appropriate.
Help them sound natural and confident, not textbook-like.`;

    const toneMap = {
      friends: 'casual, funny, use GenZ slang, be like a best friend who roasts but loves',
      dating: 'charming, witty, natural, confident but not creepy or cringey',
      university: 'mix of casual and semi-formal, student-like, relatable',
      workplace: 'professional but approachable, office-appropriate humor when fitting',
      formal: 'articulate, confident, well-structured, impressive vocabulary',
      daily: 'natural everyday conversation, practical, street-smart'
    };

    return `You are a language practice partner for BolBaat, a language learning app.

SCENARIO: ${scenario.title} - ${scenario.desc}
TONE: ${toneMap[scenario.category]}
${langInstructions}

RULES:
1. Stay in character for this scenario. Act as the other person in the conversation (a friend, colleague, stranger, etc. depending on the scenario).
2. After your natural reply, check the user's message for errors. If found, add corrections AFTER a "---" separator line:
   - Grammar error: "🔧 GRAMMAR: [wrong] → [right] ([brief explanation])"
   - Better word exists: "💡 BETTER WORD: [basic word] → [better word] ([why it's better in this context])"
   - Style improvement: "✨ STYLE: [their version] → [native version] ([why it sounds more natural])"
   - If NO errors found: Don't add the separator or any corrections. Just reply naturally.
3. Keep your in-character reply conversational and concise (2-4 sentences).
4. Use vocabulary and expressions that are natural for this specific scenario.
5. The user is a Marathi speaker, so watch for common Marathi-influenced mistakes:
   - Wrong gender usage in Hindi (Marathi has different gender rules for many words)
   - Direct Marathi-to-Hindi word translations that don't work
   - English sentence structures influenced by Marathi/Hindi patterns
   - Missing articles (a, an, the) in English
   - Wrong prepositions in English
6. Be encouraging but honest about mistakes. Don't over-correct — only flag things that actually matter.
7. IMPORTANT: Your corrections must be genuinely helpful. Don't nitpick things that are actually fine or are just stylistic preferences.`;
  }
};
