/* ============================================
   NAVODAYA LEARNING PLATFORM — Main Logic
   Smart Hub, Class 4, Timer, & Music
   ============================================ */

const App = {
  // Application State
  state: {
    theme: localStorage.getItem('nav_theme') || 'light',
    fontSize: localStorage.getItem('nav_font_size') || 'medium',
    musicPlaying: false,
    audioElement: null
  },

  init() {
    this.applyTheme();
    this.applyFontSize();
    this.setupNavigation();
    this.setupThemeToggle();
    this.setupMusic();
    this.handleRoute();

    // Listen for hash changes
    window.addEventListener('hashchange', () => this.handleRoute());

    // Listen to timer ticks
    window.addEventListener('timer-tick', (e) => this.updateTimerDisplay(e.detail.subject));

    // Initialize daily reset check
    ProgressTracker.checkDailyReset();

    // Setup Header Buttons
    this.setupHeaderButtons();
  },

  setupHeaderButtons() {
    // Fullscreen
    const fsBtn = document.getElementById('fullscreen-btn');
    if (fsBtn) {
      fsBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(err => {
            alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
          });
        } else {
          document.exitFullscreen();
        }
      });
    }

    // Language (Mock Toggle)
    const langBtn = document.getElementById('lang-btn');
    if (langBtn) {
      langBtn.addEventListener('click', () => {
        const current = langBtn.innerText.trim();
        langBtn.querySelector('.icon-btn-text').innerText = current === 'मराठी' ? 'English' : 'मराठी';
        // Ideally re-render content here if we had full translation
        alert('Language preference saved! (Content will update effectively in full version)');
      });
    }

    // Font Size from Settings moved to Header logic for reused button if any
    const settingsFontBtn = document.getElementById('font-btn');
    if (settingsFontBtn) {
      settingsFontBtn.addEventListener('click', () => this.cycleFontSize());
    }
  },

  // --- Routing & Navigation ---
  setupNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        // Handle external links or special actions
        if (item.getAttribute('href') && item.getAttribute('href').startsWith('http')) return;
        if (item.dataset.action === 'more') {
          e.preventDefault();
          this.toggleMoreMenu();
          return;
        }
        // Standard navigation handled by anchor hash
      });
    });

    // Close more menu on click outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.more-menu') && !e.target.closest('[data-action="more"]')) {
        const menu = document.getElementById('more-menu');
        if (menu) menu.classList.remove('show');
      }
    });
  },

  toggleMoreMenu() {
    document.getElementById('more-menu').classList.toggle('show');
  },

  handleRoute() {
    const hash = window.location.hash || '#smart-hub';

    // Hide all sections
    document.querySelectorAll('.page-section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));

    // Show active section
    let activeSection = document.querySelector(hash);
    if (!activeSection) {
      activeSection = document.querySelector('#smart-hub');
    }
    activeSection.classList.add('active');

    // Highlight nav item
    const navItem = document.querySelector(`.nav-item[href="${hash}"]`);
    if (navItem) navItem.classList.add('active');

    // Page-specific initialization
    if (hash === '#smart-hub') this.renderSmartHub();
    else if (hash === '#class4') this.renderClass4();
    else if (hash === '#daily-plan') this.renderDailyPlan();
    else if (hash === '#topics') this.renderTopics();
    else if (hash === '#teacher-papers') this.renderTeacherPapers();
    else if (hash === '#progress') this.renderProgress();
    else if (hash === '#quizzes') this.renderQuizzes();
    else if (hash === '#mock-tests') this.renderMockTests();
    else if (hash === '#pyq') this.renderPYQ();
    else if (hash === '#news') this.renderNews();

    // Scroll to top
    window.scrollTo(0, 0);
  },

  // --- Smart Daily Hub (Redesigned) ---
  renderSmartHub() {
    const hub = document.getElementById('smart-hub');
    const hour = new Date().getHours();
    let greeting = 'शुभ प्रभात (Good Morning)';
    if (hour >= 12 && hour < 17) greeting = 'शुभ दुपार (Good Afternoon)';
    else if (hour >= 17) greeting = 'शुभ संध्या (Good Evening)';

    hub.innerHTML = `
      <div class="hub-greeting">${greeting} 👋</div>
      
      <!-- Prominent Timer -->
      <div class="hub-card timer-widget mb-4">
          <h3>⏱️ Study Timer</h3>
          <div class="timer-display" id="hub-timer">00:00</div>
          <select id="timer-subject" class="timer-subject-select">
            <option value="math">गणित (Navodaya Math)</option>
            <option value="evs">पर्यावरण (Navodaya EVS)</option>
            <option value="language">भाषा (Language)</option>
            <option value="mental">मानसिक क्षमता (Mental Ability)</option>
            <option value="class4">Class 4 Study</option>
          </select>
          <button class="btn btn-primary btn-lg btn-block" id="timer-toggle-btn">
            ${ProgressTracker.isTimerActive() ? 'Pause Timer' : 'Start Timer'}
          </button>
      </div>

      <!-- Big Feature Cards -->
      <div class="big-card-grid">
          <div class="big-card card-navodaya" onclick="location.hash='#topics'">
              <div class="big-card-bg" style="background-image: url('https://img.freepik.com/free-vector/rocket-launch-concept-illustration_114360-1579.jpg')"></div>
              <div class="big-card-icon">🚀</div>
              <h2>Navodaya Prep</h2>
              <p>Exam 2026 Strategy</p>
          </div>
          
          <div class="big-card card-class4" onclick="location.hash='#class4'">
              <div class="big-card-bg" style="background-image: url('https://img.freepik.com/free-vector/kids-studying-from-home_23-2148509724.jpg')"></div>
              <div class="big-card-icon">📚</div>
              <h2>Class 4</h2>
              <p>Maharashtra Board</p>
          </div>
      </div>

      <!-- AI & Teacher Papers -->
      <div class="hub-grid">
         <!-- Teacher Papers Widget -->
         <div class="hub-card teacher-papers-widget" onclick="location.hash='#teacher-papers'" style="cursor:pointer">
            <h3 style="color:#b45309">📄 Teacher's Papers</h3>
            <p>New WhatsApp uploads available!</p>
            <div style="font-size:2rem; text-align:center; margin-top:0.5rem">📲</div>
            <button class="btn btn-sm btn-secondary mt-2 w-full">View Papers</button>
         </div>

         <!-- AI Section -->
         <div class="hub-card card-ai" style="color:white" onclick="window.open('https://yupp.ai/', '_blank')">
            <h3>🤖 AI Smart Study</h3>
            <p>Ask doubts to AI Assistant</p>
             <div style="font-size:2rem; text-align:center; margin-top:0.5rem">🤖</div>
             <button class="btn btn-sm btn-outline mt-2 w-full" style="color:white; border-color:white">Open AI</button>
         </div>
         
         <!-- Today Checklist -->
         <div class="hub-card checklist">
          <h3>📝 Today's Tasks</h3>
          <div id="smart-tasks-list">
            ${this.getSmartTasksHTML()}
          </div>
        </div>
      </div>

      <!-- News Widget -->
      <div id="news-home-widget"></div>
    `;

    // Bind Timer Events
    document.getElementById('timer-toggle-btn').addEventListener('click', () => this.toggleTimer());
    this.updateTimerDisplay();

    // Render news widget below tasks
    NewsModule.renderHomeWidget();
  },

  getSmartTasksHTML() {
    const tasks = APP_DATA.getSmartTasks();
    return tasks.map(task => {
      const isDone = ProgressTracker.isSmartTaskDone(task.id);
      return `
        <div class="task-item ${isDone ? 'done' : ''}" onclick="App.toggleSmartTask('${task.id}')">
          <div style="flex:1">
            <div style="font-weight:600">${task.title}</div>
            <div style="font-size:0.85rem; color:var(--fg-muted)">${task.desc}</div>
          </div>
          <div>${isDone ? '✅' : '⬜'}</div>
        </div>
      `;
    }).join('');
  },

  toggleSmartTask(taskId) {
    ProgressTracker.toggleSmartTask(taskId);
    this.renderSmartHub();
  },

  // --- Timer Logic ---
  toggleTimer() {
    const btn = document.getElementById('timer-toggle-btn');
    const subject = document.getElementById('timer-subject').value;

    if (ProgressTracker.isTimerActive()) {
      ProgressTracker.stopTimer();
      btn.innerText = 'Start Timer';
      btn.classList.remove('btn-danger');
      btn.classList.add('btn-primary');
    } else {
      ProgressTracker.startTimer(subject);
      btn.innerText = 'Pause Timer';
      btn.classList.remove('btn-primary');
      btn.classList.add('btn-danger');
    }
  },

  updateTimerDisplay(activeSubject) {
    const display = document.getElementById('hub-timer');
    if (display) {
      if (ProgressTracker.isTimerActive()) {
        const time = ProgressTracker.getStudyTime(ProgressTracker.getActiveSubject());
        display.innerText = this.formatTime(time);
        const select = document.getElementById('timer-subject');
        if (select) select.value = ProgressTracker.getActiveSubject();
      } else {
        const subject = document.getElementById('timer-subject') ? document.getElementById('timer-subject').value : 'math';
        const time = ProgressTracker.getStudyTime(subject);
        display.innerText = this.formatTime(time);
      }
    }
  },

  formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    const mStr = m < 10 ? `0${m}` : m;
    const sStr = s < 10 ? `0${s}` : s;

    if (h > 0) return `${h}:${mStr}:${sStr}`;
    return `${mStr}:${sStr}`;
  },

  // ── CLASS 4 SUBJECTS CONFIG ──────────────────────────────────────────
  class4Subjects: [
    {
      id: 'c4_mar',
      name: 'मराठी (Marathi)',
      nameShort: 'Marathi',
      icon: '📘',
      color: '#ec4899',
      gradient: 'linear-gradient(135deg,#ec4899 0%,#f472b6 100%)',
      desc: 'बालभारती — इयत्ता ४ थी',
      pdfs: [
        {
          label: '📄 Marathi Textbook PDF',
          labelMr: 'मराठी पाठ्यपुस्तक',
          file: '4th std Marathi Textbook Pdf.pdf'
        }
      ],
      notes: [
        { title: '📝 नाम व सर्वनाम (Nouns & Pronouns)', content: 'नाम म्हणजे व्यक्ती, वस्तू किंवा ठिकाणाचे नाव. उदा: राम, नागपूर, पुस्तक. सर्वनाम म्हणजे नामाऐवजी वापरले जाणारे शब्द. उदा: तो, ती, ते, आम्ही.' },
        { title: '📝 क्रियापद (Verbs)', content: 'क्रियापद म्हणजे कृती दर्शवणारे शब्द. उदा: धावणे, खाणे, लिहिणे, वाचणे. वाक्यात क्रियापद अत्यंत महत्त्वाचे असते.' },
        { title: '📝 विशेषण (Adjectives)', content: 'विशेषण म्हणजे नामाचे गुणधर्म सांगणारे शब्द. उदा: सुंदर फूल, उंच झाड, गोड आंबा. प्रकार: गुणविशेषण, संख्याविशेषण, परिमाणविशेषण.' },
        { title: '📝 उतारा वाचन (Reading Comprehension)', content: 'उतारा वाचताना: प्रथम दोनदा वाचा, मुख्य विचार समजून घ्या, त्यानंतर प्रश्नांची उत्तरे लिहा. उत्तर उताऱ्यातूनच शोधा.' }
      ],
      questions: {
        mcq: [
          { q: '"मोठा" चा विरुद्ध शब्द कोणता?', opts: ['लहान', 'उंच', 'जाड', 'सुंदर'], ans: 0 },
          { q: 'नामाचे किती प्रकार असतात?', opts: ['दोन', 'तीन', 'चार', 'पाच'], ans: 1 },
          { q: 'खालीलपैकी क्रियापद कोणते?', opts: ['फूल', 'घर', 'धावणे', 'पुस्तक'], ans: 2 },
          { q: '"आनंद" चा समानार्थी शब्द:', opts: ['दुःख', 'मोद', 'राग', 'भीती'], ans: 1 },
          { q: '"ती" हे कोणते सर्वनाम?', opts: ['मी', 'ती', 'आम्ही', 'ते'], ans: 1 }
        ],
        short: [
          '"मैत्री" या पाठाचा थोडक्यात सारांश लिहा.',
          '"झाड" या कवितेत कोणता संदेश आहे?',
          'तुमच्या परिसरातील एखाद्या प्राण्याबद्दल ४ ओळी लिहा.',
          'क्रियापद म्हणजे काय? उदाहरणासह स्पष्ट करा.'
        ]
      }
    },
    {
      id: 'c4_maths',
      name: 'गणित (Mathematics)',
      nameShort: 'Maths',
      icon: '📗',
      color: '#3b82f6',
      gradient: 'linear-gradient(135deg,#3b82f6 0%,#60a5fa 100%)',
      desc: 'Maharashtra Board — Class 4 Maths',
      pdfs: [
        {
          label: '📄 Mathematics Textbook PDF',
          labelMr: 'गणित पाठ्यपुस्तक',
          file: '4th std Maths textbook pdf.pdf'
        }
      ],
      notes: [
        { title: '📝 संख्या ज्ञान (Number System)', content: '४-अंकी संख्या ओळखणे, स्थानिक किंमत (Ones, Tens, Hundreds, Thousands), विस्तारित रूप. उदा: ३४५६ = ३000 + ४00 + ५0 + ६' },
        { title: '📝 बेरीज व वजाबाकी (Addition & Subtraction)', content: 'हाताळणी करून बेरीज व वजाबाकी करताना उचलण्याचे व उसने घेण्याचे नियम लक्षात ठेवा. सरावासाठी रोज ५ प्रश्न सोडवा.' },
        { title: '📝 गुणाकार (Multiplication)', content: 'गुणाकाराची पद्धत: Lattice Method वापरा. गुणाकाराचे गुणधर्म: a×b = b×a (क्रमविनिमय). पाढे मुखोद्गत करा (2 ते 12).' },
        { title: '📝 भूमिती (Geometry)', content: 'आकार: त्रिकोण (3 बाजू), चौकोन (4 बाजू), पंचकोन (5 बाजू). परिमिती = सर्व बाजूंची बेरीज. क्षेत्रफळ = लांबी × रुंदी (आयत).' }
      ],
      questions: {
        mcq: [
          { q: '४ × ८ = ?', opts: ['28', '32', '36', '40'], ans: 1 },
          { q: '३४५ + २५५ = ?', opts: ['500', '590', '600', '610'], ans: 2 },
          { q: 'चौकोनाला किती बाजू असतात?', opts: ['३', '४', '५', '६'], ans: 1 },
          { q: '१ किलो = ? ग्रॅम', opts: ['100', '500', '1000', '10000'], ans: 2 },
          { q: '२, ४, ६, ८, ? — पुढील संख्या:', opts: ['9', '10', '12', '11'], ans: 1 }
        ],
        short: [
          'आयताची परिमिती कशी काढतात? उदाहरण द्या (लांबी=8, रुंदी=5).',
          '३२५ × ४ = ? हिशोब दाखवा.',
          'सम आणि विषम संख्या म्हणजे काय? प्रत्येकी ३ उदाहरणे लिहा.',
          'तुमच्या वर्गखोलीची लांबी ८ मीटर आणि रुंदी ६ मीटर असेल तर क्षेत्रफळ किती?'
        ]
      }
    },
    {
      id: 'c4_evs',
      name: '🌱 EVS — पर्यावरण अभ्यास',
      nameShort: 'EVS',
      icon: '🌱',
      color: '#10b981',
      gradient: 'linear-gradient(135deg,#059669 0%,#34d399 100%)',
      desc: 'पर्यावरण (Parisar Abhyas) — Part 1 & 2',
      pdfs: [
        {
          label: '📄 Parisar Abhyas Part 1 PDF',
          labelMr: 'परिसर अभ्यास भाग १',
          file: '4th std Parisar Abhyas 1 textbook pdf.pdf'
        },
        {
          label: '📄 Parisar Abhyas Part 2 PDF',
          labelMr: 'परिसर अभ्यास भाग २',
          file: '4th std Parisar Abhyas 2 textbook pdf.pdf'
        }
      ],
      notes: [
        { title: '📝 वनस्पती व प्राणी (Plants & Animals)', content: 'वनस्पती: मुळे, खोड, पाने, फुले, फळे. प्रकाशसंश्लेषण — सूर्यप्रकाश + पाणी + CO₂ → अन्न + O₂. प्राण्यांचे वर्गीकरण: सस्तन, पक्षी, सरपटणारे, मासे, कीटक.' },
        { title: '📝 पाणी व हवा (Water & Air)', content: 'जलचक्र: बाष्पीभवन → संघनन → पाऊस. पिण्याचे पाणी शुद्ध करणे: उकळणे, गाळणे, क्लोरीन. हवेतील घटक: N₂ (78%), O₂ (21%), इतर (1%).' },
        { title: '📝 आपला परिसर (Our Surroundings)', content: 'दिशा: उत्तर, दक्षिण, पूर्व, पश्चिम. कंपास वापर. नकाशा वाचन: दंतकथा, रंगसंकेत. महाराष्ट्रातील प्रमुख नद्या: गोदावरी, कृष्णा, तापी.' },
        { title: '📝 अन्न व पोषण (Food & Nutrition)', content: 'पोषक घटक: प्रथिने (शरीरवाढ), कर्बोदके (ऊर्जा), स्निग्ध पदार्थ (उष्णता), जीवनसत्त्वे (रोगप्रतिकार), खनिजे (हाडे). संतुलित आहार घ्या.' }
      ],
      questions: {
        mcq: [
          { q: 'वनस्पती अन्न कोणत्या प्रक्रियेने तयार करतात?', opts: ['श्वसन', 'प्रकाशसंश्लेषण', 'पाणी शोषण', 'बाष्पीभवन'], ans: 1 },
          { q: 'हवेत सर्वाधिक प्रमाणात कोणता वायू आहे?', opts: ['ऑक्सिजन', 'कार्बन डायऑक्साईड', 'नायट्रोजन', 'हायड्रोजन'], ans: 2 },
          { q: 'कोणता जीवनसत्त्व सूर्यप्रकाशामुळे मिळतो?', opts: ['A', 'B', 'C', 'D'], ans: 3 },
          { q: 'सूर्य कोणत्या दिशेला उगवतो?', opts: ['पश्चिम', 'उत्तर', 'दक्षिण', 'पूर्व'], ans: 3 },
          { q: 'महाराष्ट्रातील सर्वात मोठी नदी कोणती?', opts: ['कृष्णा', 'गोदावरी', 'तापी', 'उल्हास'], ans: 1 }
        ],
        short: [
          'जलचक्र म्हणजे काय? आकृतीसह स्पष्ट करा.',
          'संतुलित आहाराचे महत्त्व ३-४ वाक्यांत लिहा.',
          'प्रकाशसंश्लेषणाची प्रक्रिया थोडक्यात सांगा.',
          'तुमच्या परिसरातील पाण्याचे स्रोत कोणते? नावे लिहा.'
        ]
      }
    },
    {
      id: 'c4_eng',
      name: 'English (इंग्रजी)',
      nameShort: 'English',
      icon: '📕',
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg,#f59e0b 0%,#fbbf24 100%)',
      desc: 'My English Book — Class 4',
      pdfs: [
        {
          label: '📄 English Textbook PDF',
          labelMr: 'इंग्रजी पाठ्यपुस्तक',
          file: 'My English Book class 4 textbook pdf.pdf'
        }
      ],
      notes: [
        { title: '📝 Nouns & Pronouns', content: 'Noun: name of a person, place or thing. E.g. Ram, Mumbai, book. Pronoun: replaces a noun. E.g. he, she, it, they, we. Common noun, Proper noun, Collective noun.' },
        { title: '📝 Verbs & Tenses', content: 'Verb: action word. E.g. run, eat, write. Tenses: Present (I eat), Past (I ate), Future (I will eat). Practice: "He _____ (go) to school every day." → goes.' },
        { title: '📝 Vocabulary & Spelling', content: 'Key words from textbook: beautiful, wonderful, environment, friendship, journey, happiness. Antonyms: big↔small, hot↔cold. Synonyms: happy=glad, sad=unhappy.' },
        { title: '📝 Reading Comprehension Tips', content: '1. Read the passage twice. 2. Underline key words. 3. Answer in complete sentences. 4. Use words from the passage. 5. Check spelling and grammar.' }
      ],
      questions: {
        mcq: [
          { q: 'Plural of "Box" is:', opts: ['Boxs', 'Boxes', 'Boxies', 'Boxen'], ans: 1 },
          { q: 'Which is a Proper Noun?', opts: ['city', 'book', 'Mumbai', 'dog'], ans: 2 },
          { q: 'Opposite of "happy" is:', opts: ['glad', 'sad', 'angry', 'tired'], ans: 1 },
          { q: 'Fill in: "She ___ to school." (go)', opts: ['go', 'goes', 'went', 'going'], ans: 1 },
          { q: 'Which is a verb?', opts: ['beautiful', 'school', 'run', 'flower'], ans: 2 }
        ],
        short: [
          'Write 5 sentences about your best friend using adjectives.',
          'Write the plural of: child, leaf, mouse, tooth, woman.',
          'Make sentences using: beautiful, quickly, everyone, because.',
          'Read any paragraph from your textbook and write its main idea in 2 sentences.'
        ]
      }
    }
  ],

  // --- Class 4 Page (Main) ---
  renderClass4() {
    const container = document.getElementById('class4');
    container.innerHTML = `
      <div class="c4-hero">
        <div class="c4-hero-icon">📚</div>
        <div>
          <h1 class="c4-hero-title">इयत्ता ४ थी अभ्यास</h1>
          <p class="c4-hero-sub">Maharashtra Board · Semi-English · Class 4</p>
        </div>
      </div>

      <!-- Breadcrumb -->
      <div class="c4-breadcrumb">
        <span class="bc-home">🏠 Home</span>
        <span class="bc-sep">›</span>
        <span class="bc-active">Class 4</span>
      </div>

      <h3 class="c4-section-label">📌 विषय निवडा (Choose Subject)</h3>
      <div class="c4-subject-grid">
        ${this.class4Subjects.map(sub => `
          <div class="c4-subject-card" style="--sub-color:${sub.color};" onclick="App.renderClass4Subject('${sub.id}')">
            <div class="c4-sub-icon" style="background:${sub.gradient}">${sub.icon}</div>
            <div class="c4-sub-body">
              <div class="c4-sub-name">${sub.name}</div>
              <div class="c4-sub-desc">${sub.desc}</div>
              <div class="c4-sub-pills">
                <span class="c4-pill">📄 ${sub.pdfs.length} PDF</span>
                <span class="c4-pill">📝 ${sub.notes.length} Notes</span>
                <span class="c4-pill">❓ ${sub.questions.mcq.length + sub.questions.short.length} Q</span>
              </div>
            </div>
            <div class="c4-sub-arrow">›</div>
          </div>
        `).join('')}
      </div>
    `;
  },

  // --- Class 4 Subject Detail ---
  renderClass4Subject(subjectId) {
    const sub = this.class4Subjects.find(s => s.id === subjectId);
    const container = document.getElementById('class4');
    if (!sub) return;

    container.innerHTML = `
      <!-- Hero -->
      <div class="c4-hero" style="background:${sub.gradient}">
        <div class="c4-hero-icon">${sub.icon}</div>
        <div>
          <h1 class="c4-hero-title">${sub.name}</h1>
          <p class="c4-hero-sub">${sub.desc}</p>
        </div>
      </div>

      <!-- Breadcrumb -->
      <div class="c4-breadcrumb">
        <span class="bc-link" onclick="App.renderClass4()">🏠 Home</span>
        <span class="bc-sep">›</span>
        <span class="bc-link" onclick="App.renderClass4()">Class 4</span>
        <span class="bc-sep">›</span>
        <span class="bc-active">${sub.nameShort}</span>
      </div>

      <!-- ① TEXTBOOK PDFs -->
      <div class="c4-content-block">
        <div class="c4-block-header">
          <span class="c4-block-icon" style="background:${sub.gradient}">📄</span>
          <div>
            <div class="c4-block-title">पाठ्यपुस्तक (Textbook PDF)</div>
            <div class="c4-block-sub">Tap View to read · Download to save</div>
          </div>
        </div>
        <div class="c4-pdf-list">
          ${sub.pdfs.map(pdf => `
            <div class="c4-pdf-card">
              <div class="c4-pdf-info">
                <div class="c4-pdf-icon">📑</div>
                <div>
                  <div class="c4-pdf-name">${pdf.label}</div>
                  <div class="c4-pdf-nameMr">${pdf.labelMr}</div>
                </div>
              </div>
              <div class="c4-pdf-btns">
                <a href="${encodeURIComponent(pdf.file)}" target="_blank" class="btn btn-primary c4-pdf-btn" title="View PDF">
                  👁️ View
                </a>
                <a href="${encodeURIComponent(pdf.file)}" download="${pdf.file}" class="btn btn-outline c4-pdf-btn" title="Download PDF">
                  ⬇️ Download
                </a>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- ② NOTES -->
      <div class="c4-content-block">
        <div class="c4-block-header">
          <span class="c4-block-icon" style="background:linear-gradient(135deg,#7c3aed,#a78bfa)">📝</span>
          <div>
            <div class="c4-block-title">Notes (टिपणे)</div>
            <div class="c4-block-sub">Chapter-wise quick notes for revision</div>
          </div>
        </div>
        <div class="c4-notes-accordion">
          ${sub.notes.map((note, i) => `
            <div class="c4-note-item" id="note-${subjectId}-${i}">
              <button class="c4-note-toggle" onclick="App.toggleNote('note-${subjectId}-${i}')">
                <span>${note.title}</span>
                <span class="c4-note-chevron">▾</span>
              </button>
              <div class="c4-note-body">${note.content}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- ③ PRACTICE QUESTIONS -->
      <div class="c4-content-block">
        <div class="c4-block-header">
          <span class="c4-block-icon" style="background:linear-gradient(135deg,#f59e0b,#fbbf24)">❓</span>
          <div>
            <div class="c4-block-title">Practice Questions (सराव प्रश्न)</div>
            <div class="c4-block-sub">MCQs + Short Answer Questions</div>
          </div>
        </div>

        <!-- MCQs -->
        <div class="c4-q-section">
          <div class="c4-q-header">🔘 MCQ — बहुपर्यायी प्रश्न</div>
          <div class="c4-mcq-list" id="mcq-${subjectId}">
            ${sub.questions.mcq.map((q, qi) => `
              <div class="c4-mcq-card">
                <div class="c4-mcq-qtext"><strong>Q${qi + 1}.</strong> ${q.q}</div>
                <div class="c4-opts-grid">
                  ${q.opts.map((opt, oi) => `
                    <button class="c4-opt-btn" id="opt-${subjectId}-${qi}-${oi}"
                      onclick="App.checkMCQ('${subjectId}',${qi},${oi},${q.ans})">
                      <span class="c4-opt-letter">${String.fromCharCode(65 + oi)}</span>
                      ${opt}
                    </button>
                  `).join('')}
                </div>
                <div class="c4-mcq-result" id="result-${subjectId}-${qi}" style="display:none"></div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Short Answer -->
        <div class="c4-q-section">
          <div class="c4-q-header">✍️ Short Answer Questions (लघु उत्तरे)</div>
          <div class="c4-short-list">
            ${sub.questions.short.map((q, qi) => `
              <div class="c4-short-card">
                <div class="c4-short-qnum">Q${qi + 1}</div>
                <div class="c4-short-qtext">${q}</div>
                <textarea class="c4-short-textarea" placeholder="येथे उत्तर लिहा... (Write your answer here)"></textarea>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Back Button -->
      <button class="btn btn-outline c4-back-btn" onclick="App.renderClass4()">
        ← विषय यादी (Back to Subjects)
      </button>
    `;
    window.scrollTo(0, 0);
  },

  // Toggle accordion note
  toggleNote(itemId) {
    const item = document.getElementById(itemId);
    if (!item) return;
    item.classList.toggle('open');
  },

  // MCQ Checker
  checkMCQ(subjectId, qi, selectedOi, correctOi) {
    const resultEl = document.getElementById(`result-${subjectId}-${qi}`);
    // Disable all options for this question
    const sub = this.class4Subjects.find(s => s.id === subjectId);
    if (!sub) return;
    const q = sub.questions.mcq[qi];
    q.opts.forEach((_, oi) => {
      const btn = document.getElementById(`opt-${subjectId}-${qi}-${oi}`);
      if (!btn) return;
      btn.disabled = true;
      if (oi === correctOi) btn.classList.add('c4-opt-correct');
      else if (oi === selectedOi) btn.classList.add('c4-opt-wrong');
    });
    if (resultEl) {
      resultEl.style.display = 'block';
      resultEl.className = `c4-mcq-result ${selectedOi === correctOi ? 'c4-result-correct' : 'c4-result-wrong'}`;
      resultEl.innerHTML = selectedOi === correctOi
        ? '✅ बरोबर! (Correct!)'
        : `❌ चुकीचे. बरोबर उत्तर: <strong>${String.fromCharCode(65 + correctOi)}. ${q.opts[correctOi]}</strong>`;
    }
  },

  // --- Teacher's Papers ---
  renderTeacherPapers() {
    const container = document.getElementById('teacher-papers');
    const papers = APP_DATA.teacherPapers.sort((a, b) => new Date(b.date) - new Date(a.date));

    container.innerHTML = `
      <h2 class="mb-2">Teacher's Question Papers 📄</h2>
      <p class="mb-4">From WhatsApp Group</p>
      
      <div class="paper-gallery">
        ${papers.map(p => `
          <div class="paper-item" onclick="window.open('${p.url}', '_blank')">
            <div class="paper-thumb">
              ${p.type === 'pdf' ? '📑' : '📷'}
            </div>
            <div class="paper-info">
              <span class="paper-date">${p.date}</span>
              <div class="paper-title">${p.title}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  // --- PYQ Page ---
  renderPYQ() {
    const years = APP_DATA.pyqYears;
    const tabs = document.getElementById('pyq-years');
    const content = document.getElementById('pyq-content');

    if (!tabs || !content) return;

    tabs.innerHTML = years.map((y, idx) => `
        <div class="day-tab ${idx === 0 ? 'active' : ''}" onclick="App.loadPYQ(${y}, this)">${y}</div>
      `).join('');

    this.loadPYQ(years[0]);
  },

  loadPYQ(year, tabEl) {
    if (tabEl) {
      document.querySelectorAll('#pyq-years .day-tab').forEach(t => t.classList.remove('active'));
      tabEl.classList.add('active');
    }

    const questions = APP_DATA.pyqQuestions[year];
    const container = document.getElementById('pyq-content');

    if (!questions) {
      container.innerHTML = `<div class="card"><p>Question paper for ${year} is not available online yet.</p></div>`;
      return;
    }

    // We will render a 'Start Test' card, and below it the list of questions (read-only mode)
    // OR better: Just show the Start Card, and let QuizEngine take over container when clicked.

    container.innerHTML = `
        <div class="card mb-2" style="text-align:center; padding:2rem;">
            <h3>JNVST ${year} Question Paper</h3>
            <p class="mb-2">${questions.length} Questions • Mental Ability, Math, Language</p>
            <button class="btn btn-primary btn-lg" id="start-pyq-btn">Start Online Test 📝</button>
        </div>
        
        <!-- Preview of first few questions or just placeholder -->
        <h4 class="mb-2">Paper Preview:</h4>
        <div class="chapter-list">
             ${questions.slice(0, 3).map((q, i) => `
                <div class="question-card" style="opacity:0.8">
                    <div class="question-number">Q${i + 1}</div>
                    <div class="question-text">${q.q}</div>
                    <div class="options-list">
                        ${q.options.map((opt, oi) => `
                            <div class="option-btn disabled">
                                <span class="option-letter">${String.fromCharCode(65 + oi)}</span>
                                ${opt}
                            </div>
                        `).join('')}
                    </div>
                </div>
             `).join('')}
             <div style="text-align:center; padding:1rem; color:var(--fg-muted)">... and ${questions.length - 3} more questions.</div>
        </div>
      `;

    // Attach event listener safely
    document.getElementById('start-pyq-btn').addEventListener('click', () => {
      QuizEngine.start({
        questions: questions,
        containerId: 'pyq-content',
        totalTime: questions.length * 60, // 1 min per question
        mode: 'quiz', // or 'mock' if we want navigation grid
        quizId: `pyq_${year}`,
        topicId: 'pyq'
      });
    });
  },

  // --- Music & Night Mode ---
  setupMusic() {
    const audio = new Audio('https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112521.mp3');
    audio.loop = true;
    this.state.audioElement = audio;

    const control = document.createElement('div');
    control.className = 'music-control';
    control.id = 'music-control';
    control.innerHTML = `
      <div class="music-icon">🎵</div>
      <span id="music-label" style="font-weight:600; font-size:0.9rem; display:none">Focus Music On</span>
      <button class="music-toggle-btn" id="music-toggle">▶</button>
    `;
    document.body.appendChild(control);

    document.getElementById('music-toggle').addEventListener('click', () => this.toggleMusic());
  },

  toggleMusic() {
    const audio = this.state.audioElement;
    const btn = document.getElementById('music-toggle');
    const wrapper = document.getElementById('music-control');
    const label = document.getElementById('music-label');

    if (this.state.musicPlaying) {
      audio.pause();
      this.state.musicPlaying = false;
      btn.innerText = '▶';
      wrapper.classList.remove('playing');
      label.style.display = 'none';
    } else {
      audio.play().catch(e => alert("Please interact with the document first to play audio."));
      this.state.musicPlaying = true;
      btn.innerText = '⏸';
      wrapper.classList.add('playing');
      label.style.display = 'block';
    }
  },

  toggleNightMode() {
    this.state.theme = this.state.theme === 'dark' ? 'light' : 'dark';
    this.applyTheme();
    localStorage.setItem('nav_theme', this.state.theme);
  },

  // --- Existing Functionality ---

  renderProgress() {
    const p = document.getElementById('progress');
    const stats = ProgressTracker.getTopicStats();
    const streak = ProgressTracker.getStreak();
    const stars = ProgressTracker.getStars();
    const totalTime = ProgressTracker.getTotalStudyTime();

    p.innerHTML = `
      <div class="card" style="text-align:center; background:linear-gradient(135deg, var(--primary), #7c3aed); color:#fff;">
        <h2>Total Stars ⭐</h2>
        <div style="font-size:3.5rem; font-weight:800; margin:0.5rem 0;">${stars}</div>
        <div>Current Streak: 🔥 ${streak} days</div>
      </div>

      <div class="card">
        <h3>📊 Study Time</h3>
        <div style="font-size:2rem; font-weight:700; color:var(--primary); text-align:center">
          ${this.formatTime(totalTime)}
        </div>
        <p class="text-center">Total time spent studying</p>
      </div>

      <div class="card">
        <h3>🏆 Subject Performance</h3>
        ${Object.keys(stats).length === 0 ? '<p>No quizzes taken yet.</p>' : ''}
        ${Object.keys(stats).map(topicId => {
      const s = stats[topicId];
      const avg = Math.round(s.score / s.total * 100);
      const topicName = APP_DATA.topics.find(t => t.id === topicId)?.name || topicId;
      return `
             <div class="mb-2">
               <div style="display:flex; justify-content:space-between; margin-bottom:0.2rem;">
                 <strong>${topicName}</strong>
                 <span>${avg}%</span>
               </div>
               <div class="quiz-progress-bar" style="height:8px; margin-bottom:0.5rem">
                 <div class="quiz-progress-fill" style="width:${avg}%; background:${this.getColorForScore(avg)}"></div>
               </div>
             </div>
           `;
    }).join('')}
      </div>
    `;
  },

  getColorForScore(pct) {
    if (pct >= 80) return 'var(--success)';
    if (pct >= 50) return 'var(--secondary)';
    return 'var(--danger)';
  },

  renderDailyPlan() {
    const container = document.getElementById('daily-plan');
    container.innerHTML = `<h2>📅 7-Day Study Plan</h2><div id="plan-tabs" class="day-tabs"></div><div id="plan-tasks"></div>`;
    const tabsContainer = document.getElementById('plan-tabs');
    APP_DATA.dailyPlan.forEach((day, idx) => {
      tabsContainer.innerHTML += `<div class="day-tab ${idx === 0 ? 'active' : ''}" onclick="App.switchDay(${idx})">${day.label}</div>`;
    });
    this.switchDay(0);
  },

  switchDay(dayIndex) {
    document.querySelectorAll('#plan-tabs .day-tab').forEach((t, i) => t.classList.toggle('active', i === dayIndex));
    const tasks = APP_DATA.dailyPlan[dayIndex].tasks;
    const list = document.getElementById('plan-tasks');
    list.innerHTML = tasks.map((t, i) => `
      <div class="task-item">
        <div class="task-checkbox ${ProgressTracker.isDailyTaskDone(dayIndex + 1, i) ? 'checked' : ''}" 
             onclick="App.toggleDailyTask(${dayIndex + 1}, ${i}, this)">✓</div>
        <div class="task-info">
          <div class="task-title">${t.title}</div>
          <div class="task-desc">${t.desc}</div>
          <span class="task-badge badge-${t.type}">${t.type.toUpperCase()}</span>
        </div>
      </div>
    `).join('');
  },

  toggleDailyTask(day, idx, el) {
    const done = ProgressTracker.toggleDailyTask(day, idx);
    el.classList.toggle('checked', done);
  },

  renderTopics() {
    const c = document.getElementById('topics');
    c.innerHTML = `
      <div class="card-grid">
        ${APP_DATA.topics.map(t => `
          <div class="subject-card" data-subject="${t.id}" onclick="App.renderLessons('${t.id}')">
            <span class="subject-icon">${t.icon}</span>
            <div class="subject-name">${t.name}</div>
            <div class="subject-count">${t.lessonCount} Lessons</div>
          </div>
        `).join('')}
      </div>
      <div id="lessons-container"></div>
    `;
  },

  renderLessons(topicId) {
    const list = document.getElementById('lessons-container');
    const lessons = APP_DATA.lessons[topicId];
    list.innerHTML = `<h3 class="mt-4 mb-2">Lessons</h3>` + lessons.map(l => `
      <div class="card">
        <h4>${l.title}</h4>
        <p>${l.content}</p>
        <button class="btn btn-primary btn-sm" onclick="App.playVideo('${l.url}', '${l.title}')">Watch Video</button>
      </div>
    `).join('');
    list.scrollIntoView({ behavior: 'smooth' });
  },

  playVideo(url, title) {
    location.hash = '#youtube';
    const frame = document.getElementById('video-frame');
    const label = document.getElementById('video-title');
    if (frame) frame.src = url;
    if (label) label.innerText = title;
  },

  renderQuizzes() { QuizEngine.renderQuizzesPage(); },
  renderMockTests() { QuizEngine.renderMockTestsPage(); },
  renderNews() { NewsModule.renderNewsPage(); },

  setupThemeToggle() {
    document.querySelector('.theme-toggle').addEventListener('click', () => this.toggleNightMode());
  },
  applyTheme() { document.documentElement.setAttribute('data-theme', this.state.theme); },

  cycleFontSize() {
    const sizes = ['small', 'medium', 'large'];
    let idx = sizes.indexOf(this.state.fontSize);
    this.state.fontSize = sizes[(idx + 1) % sizes.length];
    this.applyFontSize();
    localStorage.setItem('nav_font_size', this.state.fontSize);
  },
  applyFontSize() { document.documentElement.setAttribute('data-font-size', this.state.fontSize); }
};

document.addEventListener('DOMContentLoaded', () => App.init());
