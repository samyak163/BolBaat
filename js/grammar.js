const GrammarZone = {
  currentLesson: null,

  lessons: [
    // ───── Hindi Grammar ─────
    {
      id: 'hi-gender',
      lang: 'hindi',
      title: 'Gender in Hindi',
      desc: 'Masculine vs Feminine — where Marathi speakers mess up',
      content:
        '<h3>Hindi Gender Rules (for Marathi speakers)</h3>' +
        '<p>Marathi and Hindi have DIFFERENT genders for many words. This is the #1 mistake Marathi speakers make in Hindi.</p>' +
        '<div class="grammar-example">' +
        '  <p class="wrong">&#10060; "Mera kitaab" (Marathi influence — kitaab is feminine in Hindi)</p>' +
        '  <p class="right">&#9989; "Meri kitaab"</p>' +
        '</div>' +
        '<div class="grammar-example">' +
        '  <p class="wrong">&#10060; "Woh acha ladki hai"</p>' +
        '  <p class="right">&#9989; "Woh achi ladki hai"</p>' +
        '</div>' +
        '<h4>Common Words with Different Gender</h4>' +
        '<table class="grammar-table">' +
        '  <tr><th>Word</th><th>Hindi</th><th>Marathi</th></tr>' +
        '  <tr><td>Kitaab (book)</td><td>Feminine</td><td>Neutral</td></tr>' +
        '  <tr><td>Dukaan (shop)</td><td>Feminine</td><td>Neutral</td></tr>' +
        '  <tr><td>Pani (water)</td><td>Masculine</td><td>Neutral</td></tr>' +
        '  <tr><td>Bus</td><td>Feminine</td><td>Feminine</td></tr>' +
        '</table>' +
        '<h4>Quick Rule</h4>' +
        '<p>Most Hindi words ending in <strong>-aa</strong> sound are masculine (ladka, kamra, paisa). Most ending in <strong>-ee</strong> sound are feminine (ladki, roti, nadee). But learn exceptions as you go!</p>'
    },
    {
      id: 'hi-tenses',
      lang: 'hindi',
      title: 'Hindi Tenses Made Simple',
      desc: 'Past, present, future — with real examples',
      content:
        '<h3>Tenses in Romanized Hindi</h3>' +
        '<h4>Present (Haal)</h4>' +
        '<p><strong>Main karta/karti hoon</strong> — I do</p>' +
        '<p><strong>Tu karta/karti hai</strong> — You do (informal)</p>' +
        '<p><strong>Woh karta/karti hai</strong> — He/She does</p>' +
        '<p><em>Note: karta = male speaker, karti = female speaker</em></p>' +
        '<h4>Past (Bhoot kaal)</h4>' +
        '<p><strong>Maine kiya</strong> — I did</p>' +
        '<p><strong>Tune kiya</strong> — You did</p>' +
        '<p><strong>Usne kiya</strong> — He/She did</p>' +
        '<h4>Future (Bhavishya kaal)</h4>' +
        '<p><strong>Main karunga/karungi</strong> — I will do</p>' +
        '<p><strong>Tu karega/karegi</strong> — You will do</p>' +
        '<div class="grammar-example">' +
        '  <p><strong>Real scenario:</strong></p>' +
        '  <p>"Kal main college nahi <strong>gaya</strong> tha" — I didn\'t go to college yesterday</p>' +
        '  <p>"Aaj main class <strong>jaaunga</strong>" — Today I will go to class</p>' +
        '  <p>"Abhi main kha <strong>raha hoon</strong>" — I am eating right now</p>' +
        '</div>' +
        '<h4>Marathi Speaker Trap</h4>' +
        '<div class="grammar-example">' +
        '  <p class="wrong">&#10060; "Main jaato hoon" (Marathi: "mi jaato")</p>' +
        '  <p class="right">&#9989; "Main jaata hoon" (Hindi uses -ta not -to)</p>' +
        '</div>'
    },
    {
      id: 'hi-postpositions',
      lang: 'hindi',
      title: 'Hindi Postpositions',
      desc: 'Me, par, ko, se, ka — when to use which',
      content:
        '<h3>Postpositions (Hindi ke "prepositions")</h3>' +
        '<p>Unlike English (prepositions come BEFORE), Hindi postpositions come AFTER the noun.</p>' +
        '<div class="grammar-example">' +
        '  <p><strong>Me / Mein</strong> (in): "Ghar <strong>mein</strong>" — In the house</p>' +
        '  <p><strong>Par</strong> (on): "Table <strong>par</strong>" — On the table</p>' +
        '  <p><strong>Ko</strong> (to): "Usko <strong>bolo</strong>" — Tell him/her</p>' +
        '  <p><strong>Se</strong> (from/with/by): "Usse <strong>baat kar</strong>" — Talk with him</p>' +
        '  <p><strong>Ka/Ki/Ke</strong> (of/\'s): "Ram <strong>ka</strong> ghar" — Ram\'s house</p>' +
        '</div>' +
        '<h4>Ka/Ki/Ke depends on what follows:</h4>' +
        '<p><strong>Ka</strong> — masculine singular (Ram ka ghar)</p>' +
        '<p><strong>Ki</strong> — feminine (Ram ki kitaab)</p>' +
        '<p><strong>Ke</strong> — masculine plural or with postposition (Ram ke dost, Ram ke liye)</p>' +
        '<h4>Marathi Speaker Mistake</h4>' +
        '<div class="grammar-example">' +
        '  <p class="wrong">&#10060; "Main school ko jaa raha hoon" (Marathi: "la" influence)</p>' +
        '  <p class="right">&#9989; "Main school jaa raha hoon" (no postposition needed)</p>' +
        '</div>'
    },
    {
      id: 'hi-casual',
      lang: 'hindi',
      title: 'Casual Hindi & Slang',
      desc: 'Bhai, yaar, scene — how friends actually talk',
      content:
        '<h3>How Friends Actually Talk in Hindi</h3>' +
        '<h4>Filler Words (use these to sound natural)</h4>' +
        '<p><strong>Yaar</strong> — Dude/bro (universal, any gender)</p>' +
        '<p><strong>Bhai</strong> — Bro (more masculine energy)</p>' +
        '<p><strong>Arre</strong> — Hey/oh come on (surprise or frustration)</p>' +
        '<p><strong>Matlab</strong> — Like/I mean (filler, thinking out loud)</p>' +
        '<p><strong>Na</strong> — Right? (seeking agreement, tag question)</p>' +
        '<p><strong>Acha</strong> — OK/I see/oh really (acknowledgement)</p>' +
        '<h4>GenZ Hindi Slang (2024-2026)</h4>' +
        '<p><strong>Scene hai / Kya scene hai?</strong> — What\'s up? / What\'s happening?</p>' +
        '<p><strong>Sahi me?</strong> — Really? For real?</p>' +
        '<p><strong>Mast / Solid</strong> — Cool / great</p>' +
        '<p><strong>Chill maar</strong> — Relax, take it easy</p>' +
        '<p><strong>Jugaad</strong> — Hack / creative workaround</p>' +
        '<p><strong>Phat gayi</strong> — Got scared / panicked</p>' +
        '<p><strong>Vibe hai</strong> — Good vibes / it\'s a vibe</p>' +
        '<p><strong>Full form mein</strong> — Going all out</p>' +
        '<div class="grammar-example">' +
        '  <p><strong>Real conversation:</strong></p>' +
        '  <p>"Arre yaar, kal ka plan kya hai? Kuch scene hai kya?"</p>' +
        '  <p>= "Hey dude, what\'s the plan for tomorrow? Anything going on?"</p>' +
        '  <br>' +
        '  <p>"Chill maar bhai, sab ho jayega. Jugaad laga lenge."</p>' +
        '  <p>= "Relax bro, everything will work out. We\'ll figure something out."</p>' +
        '</div>'
    },
    {
      id: 'hi-formal',
      lang: 'hindi',
      title: 'Formal Hindi',
      desc: 'Aap vs Tum vs Tu — respect levels matter',
      content:
        '<h3>Respect Levels in Hindi (Critical!)</h3>' +
        '<p>Hindi has THREE levels of "you" — using the wrong one can be rude or awkward.</p>' +
        '<h4>Tu (very informal)</h4>' +
        '<p>Use with: Close friends, younger siblings, when being casual/rude</p>' +
        '<p>"<strong>Tu</strong> kya kar raha hai?" — What are you doing?</p>' +
        '<h4>Tum (informal but respectful)</h4>' +
        '<p>Use with: Friends, classmates, same-age people</p>' +
        '<p>"<strong>Tum</strong> kya kar rahe ho?" — What are you doing?</p>' +
        '<h4>Aap (formal/respectful)</h4>' +
        '<p>Use with: Elders, teachers, boss, strangers, parents</p>' +
        '<p>"<strong>Aap</strong> kya kar rahe hain?" — What are you doing?</p>' +
        '<div class="grammar-example">' +
        '  <p><strong>Big mistake to avoid:</strong></p>' +
        '  <p class="wrong">&#10060; Using "tu" with a professor or boss</p>' +
        '  <p class="wrong">&#10060; Using "aap" with close friends (sounds weird/distant)</p>' +
        '  <p class="right">&#9989; Match the respect level to the relationship</p>' +
        '</div>' +
        '<h4>Verb changes with respect level</h4>' +
        '<table class="grammar-table">' +
        '  <tr><th>Level</th><th>Example</th></tr>' +
        '  <tr><td>Tu</td><td>Tu <strong>ja</strong> (You go)</td></tr>' +
        '  <tr><td>Tum</td><td>Tum <strong>jao</strong> (You go)</td></tr>' +
        '  <tr><td>Aap</td><td>Aap <strong>jaiye</strong> (You go - respectful)</td></tr>' +
        '</table>'
    },

    // ───── English Grammar ─────
    {
      id: 'en-tenses',
      lang: 'english',
      title: 'English Tenses Simplified',
      desc: 'The tenses you actually use daily',
      content:
        '<h3>English Tenses That Actually Matter</h3>' +
        '<h4>Simple Present — habits, facts</h4>' +
        '<p>"I <strong>go</strong> to college every day."</p>' +
        '<p>"She <strong>likes</strong> coffee."</p>' +
        '<h4>Present Continuous — right now</h4>' +
        '<p>"I <strong>am going</strong> to college right now."</p>' +
        '<h4>Simple Past — completed actions</h4>' +
        '<p>"I <strong>went</strong> to college yesterday."</p>' +
        '<div class="grammar-example">' +
        '  <p class="wrong">&#10060; "I goed to college" (go is irregular!)</p>' +
        '  <p class="right">&#9989; "I went to college"</p>' +
        '</div>' +
        '<h4>Present Perfect — experience or just completed</h4>' +
        '<p>"I <strong>have finished</strong> the assignment." (just now)</p>' +
        '<p>"I <strong>have been</strong> to Goa." (life experience)</p>' +
        '<div class="grammar-example">' +
        '  <p class="wrong">&#10060; "I have went there" (common Indian English mistake)</p>' +
        '  <p class="right">&#9989; "I have been/gone there"</p>' +
        '</div>' +
        '<h4>Future — plans & predictions</h4>' +
        '<p>"I <strong>will go</strong> tomorrow." (decision/prediction)</p>' +
        '<p>"I <strong>am going</strong> tomorrow." (planned already)</p>' +
        '<div class="grammar-example">' +
        '  <p><strong>Common Indian English mistake:</strong></p>' +
        '  <p class="wrong">&#10060; "I will be going to go there"</p>' +
        '  <p class="right">&#9989; "I will go there" or "I am going there"</p>' +
        '</div>'
    },
    {
      id: 'en-articles',
      lang: 'english',
      title: 'A, An, The — Articles',
      desc: 'The #1 mistake Indian speakers make',
      content:
        '<h3>Articles: The Biggest Indian English Problem</h3>' +
        '<p>Hindi and Marathi don\'t have articles (a, an, the), so we either skip them or use wrong ones.</p>' +
        '<h4>The Rules</h4>' +
        '<p><strong>A / An</strong> = any one, not specific</p>' +
        '<p><strong>The</strong> = this specific one (both people know which one)</p>' +
        '<p><strong>No article</strong> = general concept, plural, uncountable</p>' +
        '<div class="grammar-example">' +
        '  <p>"Give me <strong>a</strong> pen" — any pen</p>' +
        '  <p>"Give me <strong>the</strong> pen" — that specific pen we both see</p>' +
        '  <p>"I like <strong>coffee</strong>" — coffee in general (no article)</p>' +
        '</div>' +
        '<h4>Common Indian Mistakes</h4>' +
        '<div class="grammar-example">' +
        '  <p class="wrong">&#10060; "I am going to <strong>the</strong> school" (habitual)</p>' +
        '  <p class="right">&#9989; "I go to school" (habitual, no article needed)</p>' +
        '  <br>' +
        '  <p class="wrong">&#10060; "He is <strong>the</strong> good person"</p>' +
        '  <p class="right">&#9989; "He is a good person"</p>' +
        '  <br>' +
        '  <p class="wrong">&#10060; "Give me <strong>water</strong>" (sounds commanding)</p>' +
        '  <p class="right">&#9989; "Can I get some water?" (natural)</p>' +
        '</div>' +
        '<h4>A vs An</h4>' +
        '<p>Use <strong>AN</strong> before vowel SOUNDS (not letters!):</p>' +
        '<p>"<strong>An</strong> apple" (a-sound) but "<strong>A</strong> university" (yu-sound)</p>' +
        '<p>"<strong>An</strong> hour" (silent h, starts with "ow" sound)</p>'
    },
    {
      id: 'en-prepositions',
      lang: 'english',
      title: 'Prepositions That Trip You Up',
      desc: 'In, on, at — stop guessing wrong',
      content:
        '<h3>Prepositions Indians Commonly Get Wrong</h3>' +
        '<div class="grammar-example">' +
        '  <p class="wrong">&#10060; "I am sitting <strong>on</strong> the bus" (you\'re on the roof?)</p>' +
        '  <p class="right">&#9989; "I am sitting <strong>in</strong> the bus"</p>' +
        '</div>' +
        '<div class="grammar-example">' +
        '  <p class="wrong">&#10060; "He discussed <strong>about</strong> the topic"</p>' +
        '  <p class="right">&#9989; "He discussed the topic" (discuss = already means "talk about")</p>' +
        '</div>' +
        '<div class="grammar-example">' +
        '  <p class="wrong">&#10060; "She told <strong>to</strong> me"</p>' +
        '  <p class="right">&#9989; "She told me" (told doesn\'t need "to")</p>' +
        '</div>' +
        '<div class="grammar-example">' +
        '  <p class="wrong">&#10060; "I am good <strong>in</strong> math"</p>' +
        '  <p class="right">&#9989; "I am good <strong>at</strong> math"</p>' +
        '</div>' +
        '<h4>Time Prepositions</h4>' +
        '<p><strong>At</strong> — specific time: "at 5 PM", "at night"</p>' +
        '<p><strong>On</strong> — days/dates: "on Monday", "on 15th March"</p>' +
        '<p><strong>In</strong> — months/years/periods: "in March", "in the morning"</p>'
    },
    {
      id: 'en-formal-informal',
      lang: 'english',
      title: 'Formal vs Casual English',
      desc: 'When to sound professional vs chill',
      content:
        '<h3>Same Meaning, Different Vibes</h3>' +
        '<table class="grammar-table">' +
        '  <tr><th>Casual (Friends)</th><th>Formal (Office/Email)</th></tr>' +
        '  <tr><td>What\'s up?</td><td>How are you doing?</td></tr>' +
        '  <tr><td>Gonna</td><td>Going to</td></tr>' +
        '  <tr><td>Wanna</td><td>Would like to</td></tr>' +
        '  <tr><td>Cool / Bet</td><td>That sounds good</td></tr>' +
        '  <tr><td>My bad</td><td>I apologize for the mistake</td></tr>' +
        '  <tr><td>No worries</td><td>Not a problem at all</td></tr>' +
        '  <tr><td>Lemme know</td><td>Please let me know</td></tr>' +
        '  <tr><td>Got it</td><td>Understood, thank you</td></tr>' +
        '  <tr><td>BTW</td><td>By the way / Additionally</td></tr>' +
        '</table>' +
        '<div class="grammar-example">' +
        '  <p><strong>Texting a friend:</strong></p>' +
        '  <p>"Yo, gonna be late, my bad bro"</p>' +
        '  <br>' +
        '  <p><strong>Email to professor:</strong></p>' +
        '  <p>"Dear Professor, I apologize but I will be arriving a few minutes late to today\'s session."</p>' +
        '  <br>' +
        '  <p><strong>Slack to colleague:</strong></p>' +
        '  <p>"Hey, running a bit late today. Will join in 5 mins. Sorry about that!"</p>' +
        '</div>'
    },
    {
      id: 'en-genz',
      lang: 'english',
      title: 'GenZ English Slang',
      desc: 'No cap, bussin, slay — decoded',
      content:
        '<h3>GenZ English You Need to Know (2024-2026)</h3>' +
        '<p><strong>No cap</strong> — Not lying / for real / seriously</p>' +
        '<p><strong>Cap</strong> — Lie / bs ("that\'s cap" = "that\'s a lie")</p>' +
        '<p><strong>Bussin</strong> — Really good (especially food)</p>' +
        '<p><strong>Slay</strong> — Killed it / did amazing / looks great</p>' +
        '<p><strong>Lowkey</strong> — Secretly / kind of / subtly</p>' +
        '<p><strong>Highkey</strong> — Obviously / very much / openly</p>' +
        '<p><strong>Bruh</strong> — Bro (reaction of disbelief or annoyance)</p>' +
        '<p><strong>Bet</strong> — OK / sure / deal / I agree</p>' +
        '<p><strong>W / L</strong> — Win / Loss</p>' +
        '<p><strong>Rizz</strong> — Charm / flirting skill</p>' +
        '<p><strong>It\'s giving...</strong> — It looks like / has the energy of</p>' +
        '<p><strong>Ate (and left no crumbs)</strong> — Did it perfectly</p>' +
        '<p><strong>Ick</strong> — Turnoff / something that grosses you out</p>' +
        '<p><strong>Delulu</strong> — Delusional (usually playfully)</p>' +
        '<p><strong>Era</strong> — Phase ("I\'m in my gym era")</p>' +
        '<div class="grammar-example">' +
        '  <p><strong>In context:</strong></p>' +
        '  <p>"That presentation was a W, no cap. You lowkey slayed it."</p>' +
        '  <p>= "That presentation was great, seriously. You quietly nailed it."</p>' +
        '  <br>' +
        '  <p>"Bro has so much rizz, it\'s giving main character energy."</p>' +
        '  <p>= "He\'s so charming, he looks like the protagonist of a movie."</p>' +
        '</div>'
    },
    {
      id: 'en-common-mistakes',
      lang: 'english',
      title: 'Indian English Mistakes',
      desc: 'Errors almost every Indian makes',
      content:
        '<h3>English Mistakes Indians Make (And How to Fix Them)</h3>' +
        '<div class="grammar-example">' +
        '  <h4>1. "Myself Rahul"</h4>' +
        '  <p class="wrong">&#10060; "Myself Rahul, I am from Pune"</p>' +
        '  <p class="right">&#9989; "I\'m Rahul, I\'m from Pune" or "My name is Rahul"</p>' +
        '</div>' +
        '<div class="grammar-example">' +
        '  <h4>2. "Revert back"</h4>' +
        '  <p class="wrong">&#10060; "Please revert back to me"</p>' +
        '  <p class="right">&#9989; "Please reply to me" or "Please get back to me"</p>' +
        '  <p><em>"Revert" means to go back to a previous state, not to reply.</em></p>' +
        '</div>' +
        '<div class="grammar-example">' +
        '  <h4>3. "Do one thing"</h4>' +
        '  <p class="wrong">&#10060; "Do one thing, send me the file"</p>' +
        '  <p class="right">&#9989; "Could you send me the file?"</p>' +
        '</div>' +
        '<div class="grammar-example">' +
        '  <h4>4. "Prepone"</h4>' +
        '  <p class="wrong">&#10060; "Can we prepone the meeting?"</p>' +
        '  <p class="right">&#9989; "Can we move the meeting earlier?" or "Can we reschedule it to an earlier time?"</p>' +
        '  <p><em>"Prepone" is only used in Indian English. Not recognized internationally.</em></p>' +
        '</div>' +
        '<div class="grammar-example">' +
        '  <h4>5. Double-is</h4>' +
        '  <p class="wrong">&#10060; "The thing is, is that..."</p>' +
        '  <p class="right">&#9989; "The thing is that..."</p>' +
        '</div>' +
        '<div class="grammar-example">' +
        '  <h4>6. "Passed out of college"</h4>' +
        '  <p class="wrong">&#10060; "I passed out of college in 2024"</p>' +
        '  <p class="right">&#9989; "I graduated from college in 2024"</p>' +
        '  <p><em>"Passed out" means fainted/lost consciousness!</em></p>' +
        '</div>'
    }
  ],

  render() {
    const container = document.getElementById('screen-grammar');

    if (this.currentLesson) {
      this.renderLesson();
      return;
    }

    const hindiLessons = this.lessons.filter((l) => l.lang === 'hindi');
    const englishLessons = this.lessons.filter((l) => l.lang === 'english');
    const progress = Storage.getProgress();

    container.innerHTML =
      '<div class="grammar-container">' +
      '  <h2 class="section-title">Hindi Grammar</h2>' +
      '  <div class="lesson-list">' +
      hindiLessons
        .map(
          (l) =>
            '<div class="lesson-card ' +
            (progress.lessonsCompleted.includes(l.id) ? 'completed' : '') +
            '" onclick="GrammarZone.openLesson(\'' + l.id + '\')">' +
            '  <span class="lesson-check">' +
            (progress.lessonsCompleted.includes(l.id) ? '&#9989;' : '&#128221;') +
            '</span>' +
            '  <div class="lesson-info">' +
            '    <h3>' + l.title + '</h3>' +
            '    <p>' + l.desc + '</p>' +
            '  </div>' +
            '</div>'
        )
        .join('') +
      '  </div>' +
      '  <h2 class="section-title">English Grammar</h2>' +
      '  <div class="lesson-list">' +
      englishLessons
        .map(
          (l) =>
            '<div class="lesson-card ' +
            (progress.lessonsCompleted.includes(l.id) ? 'completed' : '') +
            '" onclick="GrammarZone.openLesson(\'' + l.id + '\')">' +
            '  <span class="lesson-check">' +
            (progress.lessonsCompleted.includes(l.id) ? '&#9989;' : '&#128221;') +
            '</span>' +
            '  <div class="lesson-info">' +
            '    <h3>' + l.title + '</h3>' +
            '    <p>' + l.desc + '</p>' +
            '  </div>' +
            '</div>'
        )
        .join('') +
      '  </div>' +
      '  <div class="ai-grammar-section">' +
      '    <h2 class="section-title">Ask AI About Grammar</h2>' +
      '    <p class="section-desc">Type any grammar question and get an instant explanation.</p>' +
      '    <div class="ai-grammar-input">' +
      '      <input type="text" id="grammar-question" placeholder="e.g., When do I use has vs have?">' +
      '      <button onclick="GrammarZone.askAI()">Ask</button>' +
      '    </div>' +
      '    <div id="grammar-ai-answer"></div>' +
      '  </div>' +
      '</div>';
  },

  openLesson(id) {
    this.currentLesson = this.lessons.find((l) => l.id === id);
    if (this.currentLesson) this.renderLesson();
  },

  renderLesson() {
    const l = this.currentLesson;
    if (!l) return;

    const container = document.getElementById('screen-grammar');
    const progress = Storage.getProgress();
    const isCompleted = progress.lessonsCompleted.includes(l.id);

    container.innerHTML =
      '<div class="lesson-container">' +
      '  <button class="back-btn" onclick="GrammarZone.currentLesson=null; GrammarZone.render()">&#8592; Back</button>' +
      '  <div class="lesson-content">' + l.content + '</div>' +
      '  <button class="primary-btn mark-complete-btn ' + (isCompleted ? 'completed' : '') + '"' +
      '    onclick="GrammarZone.markComplete(\'' + l.id + '\')">' +
      (isCompleted ? '&#9989; Completed' : 'Mark as Completed') +
      '  </button>' +
      '</div>';
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
    if (!input) return;
    const question = input.value.trim();
    if (!question) return;

    const answerEl = document.getElementById('grammar-ai-answer');
    if (!answerEl) return;
    answerEl.innerHTML = '<div class="loading-dots"><span></span><span></span><span></span></div>';

    const systemPrompt =
      'You are a grammar expert helping a 20-year-old Marathi speaker improve their Hindi and English. ' +
      'Give clear, concise explanations with practical examples. ' +
      'Use Romanized Hindi (English letters, NOT Devanagari script). ' +
      'Focus on real-world usage, not textbook language. ' +
      'Mention common mistakes Marathi speakers make when relevant. ' +
      'Keep the tone friendly and relatable — like explaining to a friend.';

    const result = await AI.sendMessage(systemPrompt, [{ role: 'user', content: question }]);

    if (result.error) {
      answerEl.innerHTML = '<p class="error-text">' + result.error + '</p>';
    } else {
      answerEl.innerHTML = '<div class="ai-answer">' + result.text.replace(/\n/g, '<br>') + '</div>';
    }
  }
};
