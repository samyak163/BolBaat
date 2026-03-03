const WordBank = {
  filter: '',
  reviewWords: [],
  reviewIndex: 0,

  render() {
    const container = document.getElementById('screen-wordbank');
    const words = Storage.getWordBank();

    if (words.length === 0) {
      container.innerHTML =
        '<div class="empty-state">' +
        '  <div class="empty-icon">📖</div>' +
        '  <h2>No words saved yet</h2>' +
        '  <p>Tap any word in a chat reply to look it up, then save it here.</p>' +
        '</div>';
      return;
    }

    const filtered = this.filter
      ? words.filter(
          (w) =>
            w.word.toLowerCase().includes(this.filter.toLowerCase()) ||
            (w.meaning_english && w.meaning_english.toLowerCase().includes(this.filter.toLowerCase())) ||
            (w.meaning_hindi && w.meaning_hindi.toLowerCase().includes(this.filter.toLowerCase()))
        )
      : words;

    // Words due for review
    const now = Date.now();
    const reviewDue = words.filter((w) => (w.nextReview || 0) <= now);

    container.innerHTML =
      '<div class="wordbank-container">' +
      '  <div class="wordbank-header">' +
      '    <input type="text" class="search-input" placeholder="Search words..."' +
      '      value="' + this._escapeAttr(this.filter) + '" oninput="WordBank.filter=this.value; WordBank.render()">' +
      (reviewDue.length > 0
        ? '    <button class="review-btn" onclick="WordBank.startReview()">Review (' + reviewDue.length + ')</button>'
        : '') +
      '  </div>' +
      '  <div class="word-count">' + words.length + ' words saved</div>' +
      '  <div class="wordbank-list">' +
      filtered
        .sort((a, b) => b.savedAt - a.savedAt)
        .map(
          (w, i) =>
            '<div class="word-card">' +
            '  <div class="word-card-header">' +
            '    <span class="word-term">' + this._escapeHtml(w.word) + '</span>' +
            '    <span class="badge badge-' + (w.formality || 'neutral') + '">' + (w.formality || 'neutral') + '</span>' +
            '  </div>' +
            '  <p class="word-meaning">' + this._escapeHtml(w.meaning_english || '') + '</p>' +
            (w.meaning_hindi ? '  <p class="word-meaning-hi">' + this._escapeHtml(w.meaning_hindi) + '</p>' : '') +
            '  <div class="word-card-footer">' +
            '    <span class="word-scenario">' + this._escapeHtml(w.scenario || '') + '</span>' +
            '    <button class="delete-word-btn" onclick="WordBank.deleteWord(' + i + ')">Remove</button>' +
            '  </div>' +
            '</div>'
        )
        .join('') +
      '  </div>' +
      '</div>';
  },

  deleteWord(index) {
    const words = Storage.getWordBank();
    const filtered = this.filter
      ? words.filter(
          (w) =>
            w.word.toLowerCase().includes(this.filter.toLowerCase()) ||
            (w.meaning_english && w.meaning_english.toLowerCase().includes(this.filter.toLowerCase()))
        )
      : words;
    const sorted = filtered.sort((a, b) => b.savedAt - a.savedAt);
    const wordToDelete = sorted[index];
    if (!wordToDelete) return;

    const realIndex = words.findIndex((w) => w.word === wordToDelete.word && w.savedAt === wordToDelete.savedAt);
    if (realIndex !== -1) {
      words.splice(realIndex, 1);
      Storage.saveWordBank(words);
    }
    this.render();
  },

  startReview() {
    const now = Date.now();
    this.reviewWords = Storage.getWordBank().filter((w) => (w.nextReview || 0) <= now);
    if (this.reviewWords.length === 0) return;
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

    container.innerHTML =
      '<div class="flashcard-container">' +
      '  <div class="flashcard-progress">' + (this.reviewIndex + 1) + ' / ' + this.reviewWords.length + '</div>' +
      '  <div class="flashcard" id="flashcard" onclick="WordBank.flipCard()">' +
      '    <div class="flashcard-front">' +
      '      <h2>' + this._escapeHtml(w.word) + '</h2>' +
      '      <p class="flashcard-hint">Tap to reveal meaning</p>' +
      '    </div>' +
      '    <div class="flashcard-back hidden">' +
      '      <h3>' + this._escapeHtml(w.meaning_english || '') + '</h3>' +
      (w.meaning_hindi ? '      <p class="fc-hindi">' + this._escapeHtml(w.meaning_hindi) + '</p>' : '') +
      (w.examples && w.examples[0] ? '      <p class="example-text">"' + this._escapeHtml(w.examples[0]) + '"</p>' : '') +
      '    </div>' +
      '  </div>' +
      '  <div class="flashcard-actions">' +
      '    <button class="fc-btn fc-hard" onclick="WordBank.reviewAnswer(\'hard\')">Hard</button>' +
      '    <button class="fc-btn fc-ok" onclick="WordBank.reviewAnswer(\'ok\')">OK</button>' +
      '    <button class="fc-btn fc-easy" onclick="WordBank.reviewAnswer(\'easy\')">Easy</button>' +
      '  </div>' +
      '  <button class="fc-exit" onclick="WordBank.render()">Exit Review</button>' +
      '</div>';
  },

  flipCard() {
    const card = document.getElementById('flashcard');
    if (!card) return;
    card.querySelector('.flashcard-front').classList.toggle('hidden');
    card.querySelector('.flashcard-back').classList.toggle('hidden');
    card.classList.toggle('flipped');
  },

  reviewAnswer(difficulty) {
    const w = this.reviewWords[this.reviewIndex];
    const allWords = Storage.getWordBank();
    const wordInBank = allWords.find((bw) => bw.word === w.word && bw.savedAt === w.savedAt);

    if (wordInBank) {
      wordInBank.reviewCount = (wordInBank.reviewCount || 0) + 1;
      // Spaced repetition: intervals grow with each review
      const intervals = { hard: 1, ok: 3, easy: 7 };
      const multiplier = Math.pow(1.5, wordInBank.reviewCount - 1);
      const days = intervals[difficulty] * multiplier;
      wordInBank.nextReview = Date.now() + days * 86400000;
      Storage.saveWordBank(allWords);
    }

    this.reviewIndex++;
    this.showFlashcard();
  },

  endReview() {
    const container = document.getElementById('screen-wordbank');
    container.innerHTML =
      '<div class="review-complete">' +
      '  <div class="complete-icon">🎉</div>' +
      '  <h2>Review Complete!</h2>' +
      '  <p>You reviewed ' + this.reviewWords.length + ' words.</p>' +
      '  <button class="primary-btn" onclick="WordBank.render()">Back to Word Bank</button>' +
      '</div>';
  },

  _escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  _escapeAttr(text) {
    return text.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
};
