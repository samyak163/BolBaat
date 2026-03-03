# BolBaat - Language Learning PWA Design

## Problem
20-year-old Marathi speaker living in India, university environment. Weak vocabulary and grammar in both Hindi and English. Needs real-world conversational mastery across scenarios: friends, dating, office, speeches, GenZ humor, texting. Hindi displayed in Roman script (English letters).

## Solution
AI-powered Progressive Web App with chat-first learning. Practice real conversations in specific scenarios, get inline corrections, build vocabulary through context.

## Tech Stack
- Vanilla HTML/CSS/JavaScript (no framework)
- PWA (Service Worker + Manifest)
- Multi-provider AI API (Gemini, OpenAI, Claude — configurable)
- localStorage for all data persistence

## Screens

### 1. Scenario Chat (Home)
Grid of scenario cards by category:
- Friends & Fun: Roasting, memes, GenZ slang, party talk
- Dating & Social: Flirting, texting, first impressions, small talk
- University: Classroom, viva, group projects, canteen
- Workplace: Meetings, emails, presentations, talking to boss
- Formal/Speech: Public speaking, debate, interviews
- Daily Life: Shopping, bargaining, phone calls, family

Each scenario has Hindi and English modes.

### 2. Chat Interface
- WhatsApp-like UI
- Inline corrections (grammar fix, better word, style upgrade)
- Tap any word for meaning, examples, related words
- "How else can I say this?" button
- Save words/phrases to Word Bank
- Language toggle mid-conversation

### 3. Word Bank
- Saved words organized by category
- Meaning, example sentences, context
- Spaced repetition flashcard reviews
- Search and filter

### 4. Grammar Zone
- Structured lessons for Hindi and English
- Real scenario examples (not textbook)
- Common Marathi speaker mistakes
- Quick quizzes
- AI explanations on demand

### 5. Settings
- API provider selection + key + model
- Language preference
- Theme (dark/light)
- Reset progress

## AI System

### Tutor Personality
Acts as a friend, not a teacher. Matches scenario tone. Uses Romanized Hindi. Knows Marathi speaker patterns.

### Correction Levels
1. Grammar fix: Tense, agreement, structure
2. Better word: More natural/impressive alternatives
3. Style upgrade: Cooler/more native phrasing

### Scenario Context Engine
Each scenario has a system prompt defining setting, tone, vocabulary level, common phrases, correction priorities.

### Word Learning
Tap any word to get: meaning (Hindi + English), example sentences, related words, formality level.

### Multi-Provider API
Unified adapter for Gemini, OpenAI, Claude APIs. Key stored in localStorage.

## Data Storage (localStorage)
- Word Bank: saved words with metadata
- Chat History: last 10 conversations per scenario
- Progress: lessons completed, words learned, streak
- Settings: provider, key, model, theme

## UI Design
- Dark theme default
- Mobile-first for 6.5" screen
- Bottom nav: Chat, Word Bank, Grammar, Settings
- Smooth transitions and animations

## File Structure
```
/
├── index.html
├── css/styles.css
├── js/
│   ├── app.js
│   ├── chat.js
│   ├── ai.js
│   ├── scenarios.js
│   ├── wordbank.js
│   ├── grammar.js
│   └── storage.js
├── sw.js
├── manifest.json
└── assets/icons/
```
