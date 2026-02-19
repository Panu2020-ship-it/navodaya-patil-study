// ============================================
// NAVODAYA LEARNING PLATFORM — Quiz Engine
// Timer, MCQ, feedback, scoring, mock test mode
// ============================================

const QuizEngine = {
    currentQuiz: null,
    currentIndex: 0,
    answers: [],
    timer: null,
    timeLeft: 0,
    isActive: false,
    onComplete: null,
    container: null,
    mode: 'quiz', // 'quiz' or 'mock'
    quizId: null,
    topicId: null,

    start(options) {
        if (!options.questions || options.questions.length === 0) {
            alert("No questions available for this quiz.");
            return;
        }
        this.currentQuiz = options.questions;
        this.currentIndex = 0;
        this.answers = new Array(options.questions.length).fill(null);
        this.container = document.getElementById(options.containerId);
        if (!this.container) {
            console.error("Quiz container not found:", options.containerId);
            return;
        }
        this.onComplete = options.onComplete || null;
        this.mode = options.mode || 'quiz';
        this.isActive = true;
        this.topicId = options.topicId || null;
        this.quizId = options.quizId || 'quiz_' + Date.now();

        if (options.totalTime) {
            this.timeLeft = options.totalTime;
            this.startTimer();
        } else {
            this.timeLeft = 0;
        }
        this.render();
        // Scroll to quiz area
        this.container.scrollIntoView({ behavior: 'smooth' });
    },

    startTimer() {
        if (this.timer) clearInterval(this.timer);
        this.timer = setInterval(() => {
            if (!this.isActive) {
                clearInterval(this.timer);
                return;
            }
            this.timeLeft--;
            this.updateTimerDisplay();
            if (this.timeLeft <= 0) {
                clearInterval(this.timer);
                this.isActive = false;
                alert("Time's up! Submitting quiz...");
                this.finish();
            }
        }, 1000);
    },

    updateTimerDisplay() {
        if (!this.container) return;
        const el = this.container.querySelector('.quiz-timer-value');
        if (!el) return;
        const min = Math.floor(this.timeLeft / 60);
        const sec = this.timeLeft % 60;
        el.textContent = `${min}:${sec.toString().padStart(2, '0')}`;
        const timerWrap = this.container.querySelector('.quiz-timer');
        if (timerWrap) {
            timerWrap.classList.toggle('warning', this.timeLeft <= 60);
        }
    },

    render() {
        if (!this.container || !this.currentQuiz) return;

        // Safety check
        if (this.currentIndex >= this.currentQuiz.length) {
            this.finish();
            return;
        }

        const q = this.currentQuiz[this.currentIndex];
        const total = this.currentQuiz.length;
        const progress = ((this.currentIndex + 1) / total) * 100;

        let html = `
      <div class="quiz-container">
        <div class="quiz-header">
          <span class="quiz-progress-text">Question ${this.currentIndex + 1} / ${total}</span>
          ${this.timeLeft > 0 ? `<div class="quiz-timer">⏱️ <span class="quiz-timer-value">${Math.floor(this.timeLeft / 60)}:${(this.timeLeft % 60).toString().padStart(2, '0')}</span></div>` : ''}
        </div>
        <div class="quiz-progress-bar"><div class="quiz-progress-fill" style="width:${progress}%"></div></div>`;

        // Mock test navigation grid
        if (this.mode === 'mock') {
            html += '<div class="quiz-nav-grid">';
            for (let i = 0; i < total; i++) {
                const cls = i === this.currentIndex ? 'current' : (this.answers[i] !== null ? 'answered' : '');
                html += `<button class="quiz-nav-btn ${cls}" onclick="QuizEngine.goTo(${i})">${i + 1}</button>`;
            }
            html += '</div>';
        }

        html += `
        <div class="question-card">
          <div class="question-number">Question ${this.currentIndex + 1}</div>
          <div class="question-text">${q.q}</div>
          <div class="options-list">`;

        const letters = ['A', 'B', 'C', 'D'];
        q.options.forEach((opt, i) => {
            const selected = this.answers[this.currentIndex] === i;
            let cls = '';
            if (selected) cls += ' selected';

            // In 'quiz' mode (practice), show right/wrong immediately if answered
            if (this.mode === 'quiz' && this.answers[this.currentIndex] !== null) {
                cls += ' disabled';
                if (i === q.correct) cls += ' correct';
                else if (selected && i !== q.correct) cls += ' wrong';
            }

            html += `<button class="option-btn ${cls}" onclick="QuizEngine.selectAnswer(${i})">
        <span class="option-letter">${letters[i]}</span>
        <span>${opt}</span>
      </button>`;
        });

        html += '</div>';

        // Feedback in practice quiz mode
        if (this.mode === 'quiz' && this.answers[this.currentIndex] !== null) {
            const isCorrect = this.answers[this.currentIndex] === q.correct;
            html += `<div class="feedback-box ${isCorrect ? 'feedback-correct' : 'feedback-wrong'}">
        ${isCorrect ? '✅ Correct!' : '❌ Incorrect!'} ${q.explanation || ''}
      </div>`;
        }

        html += '</div>'; // End question-card

        // Navigation buttons
        html += '<div style="display:flex;gap:0.5rem;justify-content:space-between;margin-top:1rem;">';

        // Prev button
        html += `<button class="btn btn-outline" ${this.currentIndex === 0 ? 'disabled style="opacity:0.5"' : `onclick="QuizEngine.prev()"`}>⬅️ Prev</button>`;

        // Next/Finish button
        if (this.currentIndex < total - 1) {
            html += `<button class="btn btn-primary" onclick="QuizEngine.next()">Next ➡️</button>`;
        } else {
            // Last question
            html += `<button class="btn btn-success" onclick="QuizEngine.finish()">✅ Submit</button>`;
        }

        html += '</div></div>'; // End container
        this.container.innerHTML = html;
    },

    selectAnswer(index) {
        if (!this.isActive) return;
        // In quiz mode, prevent changing answer once selected
        if (this.mode === 'quiz' && this.answers[this.currentIndex] !== null) return;

        this.answers[this.currentIndex] = index;
        this.render();
    },

    next() {
        if (this.currentIndex < this.currentQuiz.length - 1) {
            this.currentIndex++;
            this.render();
        }
    },

    prev() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.render();
        }
    },

    goTo(index) {
        if (index >= 0 && index < this.currentQuiz.length) {
            this.currentIndex = index;
            this.render();
        }
    },

    finish() {
        if (this.timer) clearInterval(this.timer);
        this.isActive = false;

        const questions = this.currentQuiz;
        let correct = 0, wrong = 0, skipped = 0;

        this.answers.forEach((a, i) => {
            if (a === null) skipped++;
            else if (a === questions[i].correct) correct++;
            else wrong++;
        });

        // Save result
        const total = questions.length;
        // Mock save if ProgressTracker available
        let stars = 0;
        if (typeof ProgressTracker !== 'undefined') {
            stars = ProgressTracker.saveResult(
                this.mode, this.quizId, correct, total, this.topicId
            );
        }

        this.showResults(correct, wrong, skipped, total, stars);
    },

    showResults(correct, wrong, skipped, total, stars) {
        const pct = Math.round((correct / total) * 100);
        let starsHtml = '';
        for (let i = 0; i < stars; i++) starsHtml += '<span style="font-size:1.5rem;color:gold">⭐</span>';
        if (stars === 0 && pct < 40) starsHtml = '<span style="color:var(--fg-muted)">Try again!</span>';

        let emoji = '😊';
        if (pct >= 90) emoji = '🏆';
        else if (pct >= 70) emoji = '🌟';
        else if (pct >= 50) emoji = '👍';
        else if (pct < 30) emoji = '💪';

        let html = `
      <div class="results-container">
        <div style="font-size:3rem;margin-bottom:0.5rem">${emoji}</div>
        <div class="results-score">${pct}%</div>
        <div class="results-total">${correct} / ${total} Correct</div>
        <div class="results-stars">${starsHtml}</div>
        
        <div style="display:flex;justify-content:center;gap:1.5rem;margin:1.5rem 0;">
          <div style="text-align:center"><div style="font-size:1.5rem;font-weight:700;color:var(--success)">${correct}</div><div style="font-size:0.8rem">Correct</div></div>
          <div style="text-align:center"><div style="font-size:1.5rem;font-weight:700;color:var(--danger)">${wrong}</div><div style="font-size:0.8rem">Wrong</div></div>
          <div style="text-align:center"><div style="font-size:1.5rem;font-weight:700;color:var(--fg-muted)">${skipped}</div><div style="font-size:0.8rem">Skipped</div></div>
        </div>

        <div style="display:flex;gap:0.5rem;justify-content:center;flex-wrap:wrap;">
          <button class="btn btn-primary" onclick="QuizEngine.showAnswerKey()">📋 View Solutions</button>
          <button class="btn btn-outline" onclick="location.reload()">🏠 Home</button>
        </div>
      </div>`;
        this.container.innerHTML = html;
        this.container.scrollIntoView({ behavior: 'smooth' });
    },

    showAnswerKey() {
        const questions = this.currentQuiz;
        const letters = ['A', 'B', 'C', 'D'];

        let html = `<div class="quiz-container">
      <button class="btn btn-outline mb-4" onclick="QuizEngine.showResultsFromKey()">⬅️ Back to Results</button>
      <h2>📋 Solutions</h2>`;

        questions.forEach((q, i) => {
            const userAns = this.answers[i];
            const isCorrect = userAns === q.correct;
            // Determine border color
            let borderColor = 'var(--fg-muted)';
            if (userAns !== null) {
                borderColor = isCorrect ? 'var(--success)' : 'var(--danger)';
            }

            html += `
        <div class="question-card" style="border-left:4px solid ${borderColor}">
          <div class="question-number">Question ${i + 1}</div>
          <div class="question-text">${q.q}</div>
          
          <div style="margin-top:0.8rem; padding:0.5rem; background:var(--bg); border-radius:8px;">
            <p style="margin:0; color:var(--success); font-weight:600">✔ Correct: ${q.options[q.correct]}</p>
            ${userAns !== null && !isCorrect ? `<p style="margin:0.2rem 0 0 0; color:var(--danger)">✘ Your Answer: ${q.options[userAns]}</p>` : ''}
          </div>
          
          <p style="font-size:0.9rem;color:var(--fg-muted);margin-top:0.5rem">
            <strong>Explanation:</strong> ${q.explanation || 'No explanation available.'}
          </p>
        </div>`;
        });

        html += `<button class="btn btn-outline mt-4" onclick="QuizEngine.showResultsFromKey()">⬅️ Back to Results</button></div>`;
        this.container.innerHTML = html;
        this.container.scrollIntoView({ behavior: 'smooth' });
    },

    showResultsFromKey() {
        // Re-calculate stats to show results screen again
        // Or just re-call finish() which handles everything safely
        const questions = this.currentQuiz;
        let correct = 0, wrong = 0, skipped = 0;
        this.answers.forEach((a, i) => {
            if (a === null) skipped++;
            else if (a === questions[i].correct) correct++;
            else wrong++;
        });
        // We don't want to save result again, just show UI.
        // Retrieve stars if possible or just calculate display
        const total = questions.length;
        const pct = Math.round((correct / total) * 100);
        let stars = 0;
        if (pct === 100) stars = 3;
        else if (pct >= 70) stars = 2;
        else if (pct >= 40) stars = 1;

        this.showResults(correct, wrong, skipped, total, stars);
    },

    // --- Page Renderers ---

    renderQuizzesPage() {
        const container = document.getElementById('quizzes');
        if (!container) return;

        const quizzes = APP_DATA.getPracticeQuizzes();

        container.innerHTML = `
      <h2>⚡ Quick Practice Quizzes</h2>
      <p class="mb-4">Short quizzes to test specific topics.</p>

      <div class="card-grid">
        ${quizzes.map(q => `
          <div class="subject-card" onclick="QuizEngine.startGeneratedQuiz('${q.id}', '${q.title}', '${q.topic}', ${q.count}, '${q.type}')">
            <span class="subject-icon">${q.type === 'navodaya' ? '🚀' : '📚'}</span>
            <div class="subject-name">${q.title}</div>
            <div class="subject-count">${q.count} Questions • ${q.topic}</div>
          </div>
        `).join('')}
      </div>
    `;
    },

    renderMockTestsPage() {
        const container = document.getElementById('mock-tests');
        if (!container) return;

        container.innerHTML = `
      <h2>📝 Full Mock Tests (सराव परीक्षा)</h2>
      <p class="mb-4">Complete exam papers with timer. (2018-2026 Compatible)</p>

      <h3 class="mb-2">🚀 Navodaya (JNVST) Mock Tests</h3>
      <div class="chapter-list mb-4">
        ${APP_DATA.getMockTests('navodaya').map(test => `
          <div class="chapter-card">
            <div>
              <div style="font-weight:700">${test.title}</div>
              <div style="font-size:0.9rem; color:var(--fg-muted)">${test.desc}</div>
            </div>
            <button class="btn btn-primary btn-sm" onclick="QuizEngine.startMockTest('${test.id}', 'navodaya')">Start Exam</button>
          </div>
        `).join('')}
      </div>

      <h3 class="mb-2">📚 Class 4 Mock Tests</h3>
      <div class="chapter-list">
        ${APP_DATA.getMockTests('class4').map(test => `
          <div class="chapter-card">
            <div>
              <div style="font-weight:700">${test.title}</div>
              <div style="font-size:0.9rem; color:var(--fg-muted)">${test.desc}</div>
            </div>
            <button class="btn btn-primary btn-sm" onclick="QuizEngine.startMockTest('${test.id}', 'class4')">Start Exam</button>
          </div>
        `).join('')}
      </div>
    `;
    },

    startGeneratedQuiz(id, title, topic, count, type) {
        // Generate random questions on fly for practice
        const pool = type === 'navodaya' ? APP_DATA.questionBank.navodaya : APP_DATA.questionBank.class4;
        const questions = [];
        for (let i = 0; i < count; i++) {
            const src = pool[i % pool.length];
            questions.push({
                q: src.q,
                options: src.options,
                correct: src.correct,
                explanation: src.explanation
            });
        }

        location.hash = '#quizzes'; // Ensure visible
        // We need to inject a container for the quiz if we are overwriting the page
        // Or better, clear the 'quizzes' div content and use it as container
        const container = document.getElementById('quizzes');

        this.start({
            questions: questions,
            containerId: 'quizzes',
            totalTime: count * 60,
            mode: 'quiz',
            quizId: id,
            topicId: topic
        });
    },

    startMockTest(testId, type) {
        // Get the full test data
        const tests = APP_DATA.getMockTests(type);
        const test = tests.find(t => t.id === testId);
        if (!test) return;

        location.hash = '#mock-tests';

        this.start({
            questions: test.questions,
            containerId: 'mock-tests',
            totalTime: test.time * 60, // minutes to seconds
            mode: 'mock',
            quizId: testId,
            topicId: type === 'navodaya' ? 'Navodaya Mock' : 'Class 4 Mock'
        });
    }
};
