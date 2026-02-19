// ============================================
// NAVODAYA LEARNING PLATFORM — Progress Tracker
// localStorage-based scoring, streaks, stars, TIMER
// ============================================

const ProgressTracker = {
    KEYS: {
        results: 'nav_results',
        stars: 'nav_stars',
        streak: 'nav_streak',
        lastDate: 'nav_last_date',
        dailyPlan: 'nav_daily_plan',
        totalQuizzes: 'nav_total_quizzes',
        studyTime: 'nav_study_time' // New: Track study time
    },

    // --- Study Timer Logic ---
    timerInterval: null,
    activeSubject: null,
    sessionStartTime: null,

    startTimer(subjectId) {
        if (this.timerInterval) this.stopTimer();
        this.activeSubject = subjectId;
        this.sessionStartTime = Date.now();

        // Save state every second for UI, but only persist meaningful data periodically
        this.timerInterval = setInterval(() => {
            // We'll track seconds now for responsiveness
            const elapsed = Math.floor((Date.now() - this.sessionStartTime) / 1000);

            // Dispatch event for UI update (send elapsed seconds for this session + total historical seconds)
            // But to avoid complex history merging every second, let's just trigger UI to read getStudyTime

            // Actually, we need to increment the storage to show progress.
            // Let's increment by 1 second.
            this.addStudyTime(this.activeSubject, 1); // width changed to add seconds

            window.dispatchEvent(new CustomEvent('timer-tick', { detail: { subject: this.activeSubject } }));
        }, 1000); // 1 second
    },

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        this.activeSubject = null;
        this.sessionStartTime = null;
    },

    isTimerActive() {
        return !!this.timerInterval;
    },

    getActiveSubject() {
        return this.activeSubject;
    },

    // Get total study time for a subject (in minutes)
    getStudyTime(subjectId) {
        const times = this.getAllStudyTimes();
        // Reset if it's a new day (optional, but requested "Today's Study Time")
        // For simplicity, let's keep it daily based on lastDate check in initialization
        return times[subjectId] || 0;
    },

    getTotalStudyTime() {
        const times = this.getAllStudyTimes();
        return Object.values(times).reduce((a, b) => a + b, 0);
    },

    addStudyTime(subjectId, seconds) {
        const times = this.getAllStudyTimes();
        if (!times[subjectId]) times[subjectId] = 0;
        times[subjectId] += seconds;

        // Also update "Today's" total if we want to track day specifically
        // effectively resetting at midnight handled by checkDailyReset()

        localStorage.setItem(this.KEYS.studyTime, JSON.stringify(times));
    },

    getAllStudyTimes() {
        try { return JSON.parse(localStorage.getItem(this.KEYS.studyTime)) || {}; }
        catch { return {}; }
    },

    checkDailyReset() {
        const today = new Date().toISOString().split('T')[0];
        const lastDate = localStorage.getItem(this.KEYS.lastDate);

        if (lastDate !== today) {
            // It's a new day!
            // Should we reset study timer? The user wants "Today's Study Time"
            // Yes, reset study time for the new day
            // But maybe we want to keep history? For now, simple daily reset.
            // A better approach: Store history { date: { math: 10, evs: 20 } }
            // But adhering to "simple" requirement:

            // Archive yesterday's data if needed (not implemented for simplicity)
            localStorage.setItem(this.KEYS.studyTime, JSON.stringify({})); // Reset timer

            // Reset daily plan
            localStorage.setItem(this.KEYS.dailyPlan, JSON.stringify({}));

            // Update streak logic (handled in updateStreak)
        }
        this.updateStreak(); // This sets lastDate to today
    },

    // --- Existing Logic ---

    saveResult(type, id, score, total, topicId) {
        this.checkDailyReset(); // Ensure day is correct
        const results = this.getResults();
        results.push({
            type, id, score, total, topicId,
            percentage: Math.round((score / total) * 100),
            timestamp: Date.now(),
            date: new Date().toISOString().split('T')[0]
        });
        localStorage.setItem(this.KEYS.results, JSON.stringify(results));

        const pct = Math.round((score / total) * 100);
        let starsEarned = 0;
        if (pct === 100) starsEarned = 3;
        else if (pct >= 70) starsEarned = 2;
        else if (pct >= 40) starsEarned = 1;

        this.addStars(starsEarned);
        this.incrementQuizCount();
        return starsEarned;
    },

    getResults() {
        try { return JSON.parse(localStorage.getItem(this.KEYS.results)) || []; }
        catch { return []; }
    },

    getStars() {
        return parseInt(localStorage.getItem(this.KEYS.stars)) || 0;
    },

    addStars(n) {
        const current = this.getStars();
        localStorage.setItem(this.KEYS.stars, current + n);
    },

    getStreak() {
        return parseInt(localStorage.getItem(this.KEYS.streak)) || 0;
    },

    updateStreak() {
        const today = new Date().toISOString().split('T')[0];
        const lastDate = localStorage.getItem(this.KEYS.lastDate);

        if (lastDate === today) return; // Already updated today

        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        let streak = this.getStreak();

        if (lastDate === yesterday) {
            streak++;
        } else {
            streak = 1; // Reset if missed a day (or first day)
        }

        localStorage.setItem(this.KEYS.streak, streak);
        localStorage.setItem(this.KEYS.lastDate, today);
    },

    getQuizCount() {
        return parseInt(localStorage.getItem(this.KEYS.totalQuizzes)) || 0;
    },

    incrementQuizCount() {
        localStorage.setItem(this.KEYS.totalQuizzes, this.getQuizCount() + 1);
    },

    getAverageScore() {
        const results = this.getResults();
        if (results.length === 0) return 0;
        const sum = results.reduce((a, r) => a + r.percentage, 0);
        return Math.round(sum / results.length);
    },

    getTopicStats() {
        const results = this.getResults();
        const stats = {};
        results.forEach(r => {
            if (!r.topicId) return;
            if (!stats[r.topicId]) stats[r.topicId] = { total: 0, score: 0, count: 0 };
            stats[r.topicId].total += r.total;
            stats[r.topicId].score += r.score;
            stats[r.topicId].count++;
        });
        return stats;
    },

    // Daily plan task completion
    getDailyPlan() {
        try { return JSON.parse(localStorage.getItem(this.KEYS.dailyPlan)) || {}; }
        catch { return {}; }
    },

    toggleDailyTask(day, taskIndex) { // For old daily plan
        const plan = this.getDailyPlan();
        const key = `d${day}_t${taskIndex}`;
        plan[key] = !plan[key];
        localStorage.setItem(this.KEYS.dailyPlan, JSON.stringify(plan));
        return plan[key];
    },

    toggleSmartTask(taskId) { // For new smart hub
        const plan = this.getDailyPlan();
        plan[taskId] = !plan[taskId];
        localStorage.setItem(this.KEYS.dailyPlan, JSON.stringify(plan));
        return plan[taskId];
    },

    isDailyTaskDone(day, taskIndex) {
        const plan = this.getDailyPlan();
        return !!plan[`d${day}_t${taskIndex}`];
    },

    isSmartTaskDone(taskId) {
        const plan = this.getDailyPlan();
        return !!plan[taskId];
    },

    clearAll() {
        Object.values(this.KEYS).forEach(k => localStorage.removeItem(k));
    }
};
