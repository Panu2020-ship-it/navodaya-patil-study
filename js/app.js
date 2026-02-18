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
    },

    // --- Routing & Navigation ---
    setupNavigation() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                // Handle external links or special actions
                if (item.getAttribute('href').startsWith('http')) return;
                if (item.dataset.action === 'more') {
                    e.preventDefault();
                    this.toggleMoreMenu();
                    return;
                }
                // Standard navigation
                // Let the anchor tag handle hash change
            });
        });

        // Close more menu on click outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.more-menu') && !e.target.closest('[data-action="more"]')) {
                document.getElementById('more-menu').classList.remove('show');
            }
        });

        // Add font size handler
        document.getElementById('font-btn').addEventListener('click', () => this.cycleFontSize());
    },

    toggleMoreMenu() {
        document.getElementById('more-menu').classList.toggle('show');
    },

    handleRoute() {
        const hash = window.location.hash || '#smart-hub'; // Default to Smart Hub now

        // Hide all sections
        document.querySelectorAll('.page-section').forEach(sec => sec.classList.remove('active'));
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));

        // Show active section
        const activeSection = document.querySelector(hash);
        if (activeSection) {
            activeSection.classList.add('active');
        } else {
            // Fallback
            document.querySelector('#smart-hub').classList.add('active');
        }

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
        // other pages like #pyq, #youtube, #settings are static or simple
    },

    // --- Smart Daily Hub ---
    renderSmartHub() {
        const hub = document.getElementById('smart-hub');
        const hour = new Date().getHours();
        let greeting = 'शुभ प्रभात (Good Morning)';
        if (hour >= 12 && hour < 17) greeting = 'शुभ दुपार (Good Afternoon)';
        else if (hour >= 17) greeting = 'शुभ संध्या (Good Evening)';

        hub.innerHTML = `
      <div class="hub-greeting">${greeting} 👋</div>
      
      <div class="hub-grid">
        <!-- Timer Widget -->
        <div class="hub-card timer-widget">
          <h3>⏱️ Study Timer</h3>
          <div class="timer-display" id="hub-timer">00:00</div>
          <select id="timer-subject" class="timer-subject-select">
            <option value="math">गणित (Math)</option>
            <option value="evs">पर्यावरण (EVS)</option>
            <option value="language">भाषा (Language)</option>
            <option value="mental">मानसिक क्षमता</option>
            <option value="class4">Class 4 Study</option>
          </select>
          <button class="btn btn-primary btn-lg" id="timer-toggle-btn">
            ${ProgressTracker.isTimerActive() ? 'Pause Timer' : 'Start Timer'}
          </button>
          <p class="mt-2" style="font-size: 0.9rem; margin-top: 1rem;">
            Today's Total: <span id="today-total-time">${this.formatTime(ProgressTracker.getTotalStudyTime())}</span>
          </p>
        </div>

        <!-- Today's Tasks -->
        <div class="hub-card checklist">
          <h3>📝 Today's Smart Tasks</h3>
          <div id="smart-tasks-list">
            ${this.getSmartTasksHTML()}
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-links-grid">
        <div class="quick-card" onclick="location.hash='#teacher-papers'">
          <span class="qc-icon">📄</span>
          <span class="qc-label">Teacher's Papers</span>
        </div>
        <div class="quick-card" onclick="window.open('https://yupp.ai/', '_blank')">
          <span class="qc-icon">🤖</span>
          <span class="qc-label">AI Study Help</span>
        </div>
        <div class="quick-card" onclick="location.hash='#class4'">
          <span class="qc-icon">📚</span>
          <span class="qc-label">Class 4</span>
        </div>
        <div class="quick-card" onclick="App.toggleNightMode()">
          <span class="qc-icon">🌙</span>
          <span class="qc-label">Night Mode</span>
        </div>
      </div>
    `;

        // Bind Timer Events
        document.getElementById('timer-toggle-btn').addEventListener('click', () => this.toggleTimer());
        this.updateTimerDisplay(); // Initial display update
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
        this.renderSmartHub(); // Re-render to show update
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
        // Only update if on Smart Hub
        const display = document.getElementById('hub-timer');
        const totalDisplay = document.getElementById('today-total-time');

        if (display) {
            if (ProgressTracker.isTimerActive()) {
                // Show session time (simulated for UI responsiveness)
                // In real app, we'd diff timestamps. Here we just show total accumulated relative to session start?
                // Let's just show total time for the active subject to keep it simple and consistent with `progress.js`
                const time = ProgressTracker.getStudyTime(ProgressTracker.getActiveSubject());
                display.innerText = this.formatTime(time);

                // Ensure dropdown matches active subject
                const select = document.getElementById('timer-subject');
                if (select) select.value = ProgressTracker.getActiveSubject();
            } else {
                // If stopped, show time for selected subject in dropdown?
                // Or 00:00. Let's show selected subject's time.
                const subject = document.getElementById('timer-subject') ? document.getElementById('timer-subject').value : 'math';
                const time = ProgressTracker.getStudyTime(subject);
                display.innerText = this.formatTime(time);
            }
        }

        if (totalDisplay) {
            totalDisplay.innerText = this.formatTime(ProgressTracker.getTotalStudyTime());
        }
    },

    formatTime(minutes) {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        if (h > 0) return `${h}h ${m}m`;
        return `${m}m`;
    },

    // --- Class 4 Page ---
    renderClass4() {
        const container = document.getElementById('class4');
        container.innerHTML = `
      <div class="hero" style="padding:1.5rem; margin-bottom:1rem;">
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
              <button class="btn btn-outline" onclick="alert('Opening PDF: ${ch.pdf}')">📝 Notes</button>
              <button class="btn btn-primary" onclick="alert('Starting Quiz for ${ch.title}')">🧠 Quiz</button>
            </div>
          </div>
        `).join('')}
      </div>
      <button class="btn btn-secondary mt-2" onclick="location.hash='#class4'; App.renderClass4()">Back to Subjects</button>
    `;
        // Scroll to content
        area.scrollIntoView({ behavior: 'smooth' });
    },

    // --- Teacher's Papers ---
    renderTeacherPapers() {
        const container = document.getElementById('teacher-papers');
        const papers = APP_DATA.teacherPapers.sort((a, b) => new Date(b.date) - new Date(a.date));

        container.innerHTML = `
      <h2 class="mb-2">Teacher's Question Papers 📄</h2>
      <p class="mb-4">Assignments sent via WhatsApp</p>
      
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

    // --- Music & Night Mode ---
    setupMusic() {
        // Create audio element
        const audio = new Audio('https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112521.mp3');
        // Using a reliable royalty-free placeholder (Pixabay Lofi)
        // Note: In production, host this file locally.
        audio.loop = true;
        this.state.audioElement = audio;

        // Create floating control
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
            // If night mode isn't forced by user, maybe auto-disable? User preference keeps them separate.
        } else {
            audio.play().catch(e => alert("Please interact with the document first (click anywhere) to play audio."));
            this.state.musicPlaying = true;
            btn.innerText = '⏸';
            wrapper.classList.add('playing');
            label.style.display = 'block';
        }
    },

    toggleNightMode() {
        const newTheme = this.state.theme === 'dark' ? 'light' : 'dark';
        this.state.theme = newTheme;
        localStorage.setItem('nav_theme', newTheme);
        this.applyTheme();

        // Auto-play music if switching TO night mode (optional, "Night Mode" feature)
        if (newTheme === 'dark' && !this.state.musicPlaying) {
            // Suggest music? Or just auto-play? UX rule: Don't auto-play audio without consent usually.
            // But user requested "Night Study Mode = Dark Theme ON + Soft Music".
            this.toggleMusic();
        }
    },

    // --- Existing Functionality (Progress, Daily Plan, etc.) ---

    // Progress Page Updated
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

    // --- Standard Renderers (Daily Plan, Topics, Quizzes - Simplified for Length) ---
    renderDailyPlan() {
        // Standard rendering of tabs and tasks from APP_DATA.dailyPlan
        // Using existing data.js structure implementation (not re-writing full logic for brevity unless needed)
        // Re-implementing basic view:
        const container = document.getElementById('daily-plan');
        container.innerHTML = `<h2>📅 7-Day Study Plan</h2><div id="plan-tabs" class="day-tabs"></div><div id="plan-tasks"></div>`;

        // Render Tabs
        const tabsContainer = document.getElementById('plan-tabs');
        APP_DATA.dailyPlan.forEach((day, idx) => {
            tabsContainer.innerHTML += `<div class="day-tab ${idx === 0 ? 'active' : ''}" onclick="App.switchDay(${idx})">${day.label}</div>`;
        });
        this.switchDay(0);
    },

    switchDay(dayIndex) {
        document.querySelectorAll('.day-tab').forEach((t, i) => t.classList.toggle('active', i === dayIndex));
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
        <button class="btn btn-primary btn-sm" onclick="location.hash='#youtube'">Watch Video</button>
      </div>
    `).join('');
        list.scrollIntoView({ behavior: 'smooth' });
    },

    // --- Quizzes, Mock Tests (Skeleton for routing) ---
    renderQuizzes() { QuizEngine.renderQuizzesPage(); },
    renderMockTests() { QuizEngine.renderMockTestsPage(); },

    // --- Theme & Font ---
    setupThemeToggle() {
        document.querySelector('.theme-toggle').addEventListener('click', () => {
            this.state.theme = this.state.theme === 'light' ? 'dark' : 'light';
            this.applyTheme();
            localStorage.setItem('nav_theme', this.state.theme);
        });
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

// Initialize on Load
document.addEventListener('DOMContentLoaded', () => App.init());
