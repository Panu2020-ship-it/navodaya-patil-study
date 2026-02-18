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

    start(options) {
        this.currentQuiz = options.questions;
        this.currentIndex = 0;
        this.answers = new Array(options.questions.length).fill(null);
        this.container = document.getElementById(options.containerId);
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
    },

    startTimer() {
        if (this.timer) clearInterval(this.timer);
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();
            if (this.timeLeft <= 0) {
                clearInterval(this.timer);
                this.finish();
            }
        }, 1000);
    },

    updateTimerDisplay() {
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
        if (!this.container || !this.isActive) return;
        const q = this.currentQuiz[this.currentIndex];
        const total = this.currentQuiz.length;
        const answered = this.answers.filter(a => a !== null).length;
        const progress = ((this.currentIndex + 1) / total) * 100;

        let html = `
      <div class="quiz-container">
        <div class="quiz-header">
          <span class="quiz-progress-text">प्रश्न ${this.currentIndex + 1} / ${total}</span>
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
          <div class="question-number">प्रश्न ${this.currentIndex + 1}</div>
          <div class="question-text">${q.q}</div>
          <div class="options-list">`;

        const letters = ['अ', 'ब', 'क', 'ड'];
        q.options.forEach((opt, i) => {
            const selected = this.answers[this.currentIndex] === i;
            let cls = selected ? 'selected' : '';
            // In quiz mode, show feedback immediately
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

        // Feedback in quiz mode
        if (this.mode === 'quiz' && this.answers[this.currentIndex] !== null) {
            const isCorrect = this.answers[this.currentIndex] === q.correct;
            html += `<div class="feedback-box ${isCorrect ? 'feedback-correct' : 'feedback-wrong'}">
        ${isCorrect ? '✅ बरोबर!' : '❌ चुकीचे!'} ${q.explanation}
      </div>`;
        }

        html += '</div>';

        // Navigation buttons
        html += '<div style="display:flex;gap:0.5rem;justify-content:space-between;margin-top:1rem;">';
        if (this.currentIndex > 0) {
            html += `<button class="btn btn-outline" onclick="QuizEngine.prev()">⬅️ मागील</button>`;
        } else {
            html += '<div></div>';
        }
        if (this.mode === 'quiz' && this.answers[this.currentIndex] !== null) {
            if (this.currentIndex < total - 1) {
                html += `<button class="btn btn-primary" onclick="QuizEngine.next()">पुढील ➡️</button>`;
            } else {
                html += `<button class="btn btn-success btn-lg" onclick="QuizEngine.finish()">✅ पूर्ण करा</button>`;
            }
        } else if (this.mode === 'mock') {
            if (this.currentIndex < total - 1) {
                html += `<button class="btn btn-primary" onclick="QuizEngine.next()">पुढील ➡️</button>`;
            } else {
                html += `<button class="btn btn-success btn-lg" onclick="QuizEngine.finish()">📋 Submit करा</button>`;
            }
        }
        html += '</div></div>';

        this.container.innerHTML = html;
    },

    selectAnswer(index) {
        if (this.mode === 'quiz' && this.answers[this.currentIndex] !== null) return;
        this.answers[this.currentIndex] = index;
        this.render();
        if (this.mode === 'quiz') {
            // Auto-advance after 1.5s in quiz mode
            // (user can also click next)
        }
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
        this.currentIndex = index;
        this.render();
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
        const total = questions.length;
        const stars = ProgressTracker.saveResult(
            this.mode, this.quizId, correct, total, this.topicId
        );
        this.showResults(correct, wrong, skipped, total, stars, questions);
    },

    showResults(correct, wrong, skipped, total, stars, questions) {
        const pct = Math.round((correct / total) * 100);
        let starsHtml = '';
        for (let i = 0; i < stars; i++) starsHtml += '<span class="star-earned">⭐</span>';
        if (stars === 0) starsHtml = '<span style="color:var(--fg-muted)">पुढच्या वेळी चांगले करा!</span>';

        let emoji = '😊';
        if (pct >= 90) emoji = '🏆';
        else if (pct >= 70) emoji = '🌟';
        else if (pct >= 50) emoji = '👍';
        else if (pct < 30) emoji = '💪';

        let html = `
      <div class="results-container">
        <div style="font-size:3rem;margin-bottom:0.5rem">${emoji}</div>
        <div class="results-score">${pct}%</div>
        <div class="results-total">${correct} / ${total} बरोबर</div>
        <div class="results-stars">${starsHtml}</div>
        <div class="results-stats">
          <div class="stat-item stat-correct"><div class="stat-value">${correct}</div><div class="stat-label">बरोबर ✅</div></div>
          <div class="stat-item stat-wrong"><div class="stat-value">${wrong}</div><div class="stat-label">चुकीचे ❌</div></div>
          <div class="stat-item stat-skipped"><div class="stat-value">${skipped}</div><div class="stat-label">सोडलेले ⏭️</div></div>
        </div>
        <div style="display:flex;gap:0.5rem;justify-content:center;flex-wrap:wrap;">
          <button class="btn btn-primary" onclick="QuizEngine.showAnswerKey(${JSON.stringify(questions).replace(/"/g, '&quot;')})">📋 उत्तरपत्रिका पहा</button>
          <button class="btn btn-outline" onclick="location.hash='#quizzes'">🔄 पुन्हा सराव करा</button>
          <button class="btn btn-outline" onclick="location.hash='#home'">🏠 मुख्यपृष्ठ</button>
        </div>
      </div>`;
        this.container.innerHTML = html;
    },

    showAnswerKey(questions) {
        // Simplified from the JSON passed
        if (typeof questions === 'string') {
            try { questions = JSON.parse(questions); } catch { return; }
        }
        const letters = ['अ', 'ब', 'क', 'ड'];
        let html = `<div class="quiz-container">
      <button class="back-btn" onclick="location.hash='#quizzes'">⬅️ मागे</button>
      <h2>📋 उत्तरपत्रिका</h2>`;

        questions.forEach((q, i) => {
            const userAns = this.answers[i];
            const isCorrect = userAns === q.correct;
            html += `
        <div class="question-card" style="border-left:4px solid ${isCorrect ? 'var(--success)' : userAns === null ? 'var(--fg-muted)' : 'var(--danger)'}">
          <div class="question-number">प्रश्न ${i + 1}</div>
          <div class="question-text">${q.q}</div>
          <p style="margin:0.3rem 0"><strong>बरोबर उत्तर:</strong> ${letters[q.correct]}) ${q.options[q.correct]}</p>
          ${userAns !== null && userAns !== q.correct ? `<p style="color:var(--danger);margin:0">तुमचे उत्तर: ${letters[userAns]}) ${q.options[userAns]}</p>` : ''}
          <p style="font-size:0.85rem;color:var(--fg-muted)">${q.explanation}</p>
        </div>`;
        });

        html += '</div>';
        this.container.innerHTML = html;
    }
};
