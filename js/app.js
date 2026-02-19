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
         
         <!-- Checklist -->
         <div class="hub-card checklist">
          <h3>📝 Today's Tasks</h3>
          <div id="smart-tasks-list">
            ${this.getSmartTasksHTML()}
          </div>
        </div>
      </div>
    `;

        // Bind Timer Events
        document.getElementById('timer-toggle-btn').addEventListener('click', () => this.toggleTimer());
        this.updateTimerDisplay();
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

    // --- Class 4 Page ---
    renderClass4() {
        const container = document.getElementById('class4');
        container.innerHTML = `
      <div class="hero" style="padding:1.5rem; margin-bottom:1rem; background:linear-gradient(135deg, #059669 0%, #34d399 100%)">
        <h1>Class 4 Study 📚</h1>
        <p>Maharashtra Board (Semi-English)</p>
      </div>
      
      <h3>Subjects</h3>
      <div class="card-grid mb-4">
        ${APP_DATA.class4.subjects.map(sub => `
          <div class="subject-card" style="border-left-color:${sub.color}" onclick="App.renderClass4Chapters('${sub.id}')">
            <span class="subject-icon">${sub.icon}</span>
            <div class="subject-name">${sub.name}</div>
            <div class="subject-count">${sub.desc}</div>
          </div>
        `).join('')}
      </div>
      
      <div id="class4-content-area"></div>
    `;
    },

    renderClass4Chapters(subjectId) {
        const area = document.getElementById('class4-content-area');
        const chapters = APP_DATA.class4.chapters[subjectId];
        const subject = APP_DATA.class4.subjects.find(s => s.id === subjectId);

        area.innerHTML = `
      <h3 class="mb-2">${subject.name} - Chapters</h3>
      <div class="chapter-list">
        ${chapters.map((ch, idx) => `
          <div class="chapter-card">
            <div>
              <div style="font-weight:700">Ch ${idx + 1}: ${ch.title}</div>
              <div style="font-size:0.9rem; color:var(--fg-muted)">${ch.desc}</div>
            </div>
            <div class="chapter-actions">
              <button class="btn btn-outline btn-sm" onclick="alert('Opening Notes PDF...')">📝</button>
              <button class="btn btn-primary btn-sm" onclick="alert('Starting Quiz...')">🧠</button>
            </div>
          </div>
        `).join('')}
      </div>
      <button class="btn btn-secondary mt-2" onclick="location.hash='#class4'; App.renderClass4()">Back to Subjects</button>
    `;
        area.scrollIntoView({ behavior: 'smooth' });
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
