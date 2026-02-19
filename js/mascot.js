/* ============================================================
   MASCOT MODULE v2 — Ollie the Owl 🦉
   All animations pure CSS + Web Audio API (zero external deps)
   ============================================================ */

const MascotModule = (() => {

    /* ── State ─────────────────────────────────────────────── */
    const S = {
        tapCount: 0, tapTimer: null,
        soundOn: JSON.parse(localStorage.getItem('nav_sound') ?? 'true'),
        stickers: JSON.parse(localStorage.getItem('nav_stickers') ?? '["","",""]'),
        lastSticker: localStorage.getItem('nav_last_sticker') ?? '',
        miniActive: false, miniTimer: null, miniScore: 0,
        idleTimer: null, lastActivity: Date.getTime ? Date.now() : 0,
        currentExpr: 'idle',
        studySeconds: 0,
        floatInterval: null,
        quoteIdx: 0,
    };

    /* ── Marathi Content ────────────────────────────────────── */
    const GREETINGS_MORNING = ['सुप्रभात! आज खूप मस्त शिकू 🌅', 'गुड मॉर्निंग! चल सुरुवात करूया 🚀', 'सकाळी लवकर उठलास — छान! ⭐'];
    const GREETINGS_DAY = ['अरे वा! तू परत आलास 😄', 'चल, थोडं गणित करूया 📗', 'आज तू सुपर-हीरोसारखा आहेस 🦸'];
    const GREETINGS_EVE = ['संध्याकाळी पण अभ्यास — वाह! 🌟', 'थोडा थकलेलास का? चल, खेळत शिकू 🎮', 'एक छोटा challenge करूया? 💪'];
    const MOOD_MSGS = ['थोडं मजा करूया? 😜', 'आज तू खूप हुशार दिसतोस 🧠', 'चॅम्पियन आला! 🏆', 'रेडी आहेस ना? 🎯'];
    const QUOTES = [
        'आज थोडं शिकूया, उद्या जिंकूया! 🚀',
        'तू हुशार आहेस, फक्त प्रयत्न कर! 💪',
        'एक-एक पाऊल, मोठी मजल! 🌟',
        'चुका होतात, शिकणे थांबत नाही! 📚',
        'नवोदयचा रस्ता — तू नक्की जाशील! 🎯',
    ];
    const IDLE_MSGS = ['चला, थोडं शिकूया 😊', 'Ollie वाट पाहतोय! 👀', 'एक छोटा quiz करूया? ⚡', 'अभ्यास = यश! चल सुरू कर 🚀'];
    const STICKER_LIST = ['⭐', '🏆', '🎖️', '🌟', '🦁', '🚀', '🎉', '🍭', '🦉', '💡'];
    const FLOAT_EMOJIS = ['📚', '🚀', '⭐', '✏️', '🧠', '💡', '📖', '🎯'];
    const JOKES = [
        { q: 'गणितज्ञ दुकानात गेला — "किती मूल्य?"', a: 'दुकानदार: "π रुपये!" 😂' },
        { q: '"1+1=10" — हे कधी बरोबर?', a: 'Binary मध्ये! 😄' },
        { q: 'झाडाला किती गणिते माहीत?', a: 'रूट (√) खूप! 🌳' },
    ];

    /* ── Web Audio (no files — synthesized) ─────────────────── */
    let _ctx = null;
    const ac = () => { if (!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)(); return _ctx; };

    function tone(freq, dur, type = 'sine', vol = 0.3, delay = 0) {
        if (!S.soundOn) return;
        try {
            const ctx = ac();
            const osc = ctx.createOscillator(), g = ctx.createGain();
            osc.connect(g); g.connect(ctx.destination);
            osc.type = type; osc.frequency.value = freq;
            const t = ctx.currentTime + delay;
            g.gain.setValueAtTime(vol, t);
            g.gain.exponentialRampToValueAtTime(0.001, t + dur);
            osc.start(t); osc.stop(t + dur);
        } catch (_) { }
    }

    // 🎵 Sound palette
    const SFX = {
        ting: () => tone(1047, 0.1, 'triangle', 0.3),
        click: () => tone(660, 0.07, 'square', 0.18),
        pop: () => tone(800, 0.08, 'square', 0.2),
        oops: () => { tone(300, 0.12, 'sawtooth', 0.2); tone(200, 0.12, 'sawtooth', 0.18, 0.1); },
        xylophone: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.18, 'triangle', 0.35, i * 0.12)),
        tada: () => [523, 659, 784, 1047, 1047, 1047, 880].forEach((f, i) => tone(f, 0.15, 'triangle', 0.3, i * 0.1)),
        easterEgg: () => [784, 880, 988, 1047, 988, 880, 784].forEach((f, i) => tone(f, 0.15, 'triangle', 0.3, i * 0.1)),
        levelUp: () => [440, 554, 659, 880].forEach((f, i) => tone(f, 0.2, 'sine', 0.35, i * 0.15)),
    };

    /* ── Confetti ────────────────────────────────────────────── */
    function confetti(count = 36) {
        const colors = ['#f59e0b', '#10b981', '#6366f1', '#ef4444', '#3b82f6', '#ec4899', '#fbbf24'];
        for (let i = 0; i < count; i++) {
            const p = document.createElement('div');
            p.className = 'confetti-piece';
            p.style.cssText = `left:${10 + Math.random() * 80}vw;background:${colors[i % colors.length]};width:${6 + Math.random() * 8}px;height:${6 + Math.random() * 8}px;border-radius:${Math.random() > .5 ? '50%' : '2px'};animation-delay:${Math.random() * .5}s;animation-duration:${1.2 + Math.random() * .8}s;`;
            document.body.appendChild(p);
            setTimeout(() => p.remove(), 2600);
        }
        SFX.xylophone();
    }

    /* ── Toast ───────────────────────────────────────────────── */
    function toast(msg, emoji = '🎉', ms = 2800) {
        const t = document.createElement('div');
        t.className = 'mascot-toast';
        t.innerHTML = `<span>${emoji}</span> ${msg}`;
        document.body.appendChild(t);
        requestAnimationFrame(() => { t.classList.add('show'); });
        setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, ms);
    }

    /* ── Mascot Expressions ──────────────────────────────────── */
    const EXPRS = {
        idle: { face: '🦉', anim: '', label: '' },
        blink: { face: '🦉', anim: 'mascot-blink', label: '' },
        wave: { face: '🦉', anim: 'mascot-wave', label: '👋' },
        happy: { face: '😄', anim: 'mascot-bounce', label: '😄' },
        jump: { face: '🥳', anim: 'mascot-jump', label: '🎉' },
        sleep: { face: '😴', anim: 'mascot-slow', label: '💤' },
        yawn: { face: '🥱', anim: 'mascot-slow', label: '😪' },
        think: { face: '🤔', anim: 'mascot-tilt', label: '💭' },
        serious: { face: '😤', anim: 'mascot-focused', label: '🎯' },
        cheer: { face: '🥳', anim: 'mascot-spin', label: '🏆' },
        wow: { face: '🤩', anim: 'mascot-bounce', label: '✨' },
        clap: { face: '👏', anim: 'mascot-jump', label: '👏' },
    };

    function setExpr(name, ms = 2200) {
        const e = EXPRS[name] || EXPRS.idle;
        S.currentExpr = name;
        const face = document.getElementById('mascot-face');
        const body = document.getElementById('mascot-body');
        const badge = document.getElementById('mascot-badge');
        if (face) face.textContent = e.face;
        if (body) { body.className = 'mascot-body'; if (e.anim) body.classList.add(e.anim); }
        if (badge) { badge.textContent = e.label; badge.style.opacity = e.label ? '1' : '0'; }
        if (ms > 0) setTimeout(() => setExpr('idle', 0), ms);
    }

    /* ── Typing Quote Bubble ─────────────────────────────────── */
    function showQuoteBubble() {
        const q = QUOTES[S.quoteIdx++ % QUOTES.length];
        const el = document.getElementById('quote-bubble');
        if (!el) return;
        el.classList.add('show');
        el.querySelector('.quote-text').textContent = '';
        let i = 0;
        const iv = setInterval(() => {
            const t = el.querySelector('.quote-text');
            if (t && i < q.length) { t.textContent += q[i++]; SFX.ting(); }
            else { clearInterval(iv); }
        }, 55);
        setTimeout(() => el.classList.remove('show'), 5000);
        setExpr('happy');
    }

    /* ── Floating Emojis (Background) ───────────────────────── */
    function spawnFloatEmoji() {
        const hub = document.getElementById('smart-hub');
        if (!hub || document.querySelectorAll('.float-emoji').length > 6) return;
        const em = document.createElement('span');
        em.className = 'float-emoji';
        em.textContent = FLOAT_EMOJIS[Math.floor(Math.random() * FLOAT_EMOJIS.length)];
        em.style.cssText = `left:${5 + Math.random() * 90}%;animation-duration:${6 + Math.random() * 6}s;font-size:${14 + Math.random() * 12}px;opacity:${0.2 + Math.random() * 0.25};`;
        hub.appendChild(em);
        em.addEventListener('click', () => { confetti(12); em.remove(); SFX.pop(); }, { once: true });
        setTimeout(() => em.remove(), 13000);
    }

    /* ── Idle Detection ──────────────────────────────────────── */
    function resetIdle() {
        S.lastActivity = Date.now();
        clearTimeout(S.idleTimer);
        if (S.currentExpr === 'sleep' || S.currentExpr === 'yawn') setExpr('wave', 1500);
        S.idleTimer = setTimeout(goIdle, 180000); // 3 min
    }
    function goIdle() {
        setExpr('yawn', 3000);
        setTimeout(() => setExpr('sleep', 0), 3200);
        const msg = IDLE_MSGS[Math.floor(Math.random() * IDLE_MSGS.length)];
        toast(msg, '🦉', 4000);
        if (typeof VoiceSystem !== 'undefined') VoiceSystem.sayIdle();
    }

    /* ── Timer Face Expressions ──────────────────────────────── */
    function updateTimerFace(sec) {
        S.studySeconds = sec;
        const f = document.getElementById('timer-face-emoji');
        const l = document.getElementById('timer-face-label');
        if (!f) return;
        const stages = [
            { s: 0, face: '😐', lbl: 'शिकायला सुरुवात करूया!', expr: 'idle' },
            { s: 300, face: '🙂', lbl: '5 मिनिटे — छान!', expr: 'happy' },
            { s: 600, face: '😄', lbl: '10 मिनिटे — मस्त चाललंय!', expr: 'wave' },
            { s: 1200, face: '😤', lbl: '20 मिनिटे — तू focused!', expr: 'serious' },
            { s: 1800, face: '💪', lbl: '30 मिनिटे — शाब्बास!', expr: 'cheer' },
            { s: 3600, face: '🏆', lbl: '1 तास — तू Champion!', expr: 'jump' },
        ];
        let stage = stages[0];
        stages.forEach(st => { if (sec >= st.s) stage = st; });
        f.textContent = stage.face;
        if (l) l.textContent = stage.lbl;
        // React mascot at milestones
        if (sec === 300) { setExpr('happy', 2000); }
        if (sec === 600) { setExpr('wave', 2000); if (typeof VoiceSystem !== 'undefined') VoiceSystem.sayTimerMid(); }
        if (sec === 1200) { setExpr('serious', 2000); if (typeof VoiceSystem !== 'undefined') VoiceSystem.sayTimerMid(); }
        if (sec === 1800) { confetti(20); SFX.tada(); setExpr('cheer', 3000); if (typeof VoiceSystem !== 'undefined') VoiceSystem.sayTimerMid(); }
        if (sec === 3600) { confetti(50); SFX.tada(); earnSticker(); setExpr('jump', 3000); if (typeof VoiceSystem !== 'undefined') VoiceSystem.sayTimerDone(); }
    }

    /* ── Sticker Logic ───────────────────────────────────────── */
    function earnSticker() {
        const today = new Date().toDateString();
        if (S.lastSticker === today) { toast('आज स्टिकर मिळालाय! उद्या परत या 📅', '📅'); return; }
        const slot = S.stickers.indexOf('');
        if (slot === -1) { toast('सर्व स्टिकर भरले! खूप मस्त! 🏆', '🏆'); return; }
        const stk = STICKER_LIST[Math.floor(Math.random() * STICKER_LIST.length)];
        S.stickers[slot] = stk;
        S.lastSticker = today;
        localStorage.setItem('nav_last_sticker', today);
        localStorage.setItem('nav_stickers', JSON.stringify(S.stickers));
        renderStickerBar(slot);
        confetti(28); toast(`स्टिकर मिळाला: ${stk} — शाब्बास! 🎊`, '🎁', 3200);
        setExpr('jump', 2500); SFX.levelUp();
        if (typeof VoiceSystem !== 'undefined') VoiceSystem.saySticker();
    }

    function renderStickerBar(newIdx = -1) {
        const bar = document.getElementById('sticker-bar');
        if (!bar) return;
        bar.innerHTML = S.stickers.map((s, i) => `
      <div class="sticker-slot ${s ? 'filled' : ''} ${i === newIdx ? 'sticker-new' : ''}"
           title="${s || 'स्टिकर मिळवा'}" onclick="MascotModule.onStickerClick(${i})">
        ${s ? `<span class="sticker-glyph">${s}</span>` : '<span class="sticker-empty">?</span>'}
      </div>`).join('');
    }

    /* ── Mini-Game ───────────────────────────────────────────── */
    const MINI_QS = [
        { q: '½ + ½ = ?', opts: ['1', '2', '½', '¼'], ans: 0 },
        { q: '¾ − ¼ = ?', opts: ['½', '1', '¼', '¾'], ans: 0 },
        { q: '⅓ + ⅓ = ?', opts: ['⅔', '1', '⅓', '½'], ans: 0 },
        { q: '1 − ½ = ?', opts: ['½', '1', '¼', '0'], ans: 0 },
        { q: '½ × 2 = ?', opts: ['1', '½', '2', '¼'], ans: 0 },
        { q: '¾ > ½ ?', opts: ['होय', 'नाही', 'सारखे', '?'], ans: 0 },
        { q: '⅔ + ⅓ = ?', opts: ['1', '⅔', '⅓', '½'], ans: 0 },
        { q: '½ of 8 = ?', opts: ['4', '2', '8', '6'], ans: 0 },
        { q: '¼ of 12 = ?', opts: ['3', '4', '6', '2'], ans: 0 },
        { q: '1 ÷ ½ = ?', opts: ['2', '½', '1', '4'], ans: 0 },
        { q: '2/4 = ?/2', opts: ['1', '2', '½', '4'], ans: 0 },
        { q: '¼ + ¼ = ?', opts: ['½', '¼', '1', '⅛'], ans: 0 },
    ];

    function startMiniGame() {
        if (S.miniActive) return;
        S.miniActive = true; S.miniScore = 0;
        const qs = [...MINI_QS].sort(() => Math.random() - .5).slice(0, 8);
        window._miniQsList = qs;
        const modal = document.getElementById('mini-modal');
        if (!modal) { S.miniActive = false; return; }
        modal.classList.add('open');
        SFX.ting(); setExpr('think', 0);
        let timeLeft = 60;
        const tickFn = () => {
            const el = document.getElementById('mini-time');
            if (el) el.textContent = timeLeft;
            if (timeLeft <= 10 && S.soundOn) tone(880, .06, 'square', .12);
            if (timeLeft <= 0) { endMiniGame(qs); return; }
            timeLeft--;
            S.miniTimer = setTimeout(tickFn, 1000);
        };
        window._miniRenderQ = (i) => {
            const q = qs[i], b = document.getElementById('mini-body');
            if (!b || !q) { endMiniGame(qs); return; }
            b.innerHTML = `<div class="mini-qnum">Q${i + 1}/${qs.length}</div>
        <div class="mini-q">${q.q}</div>
        <div class="mini-opts">${q.opts.map((o, oi) => `
          <button class="mini-opt" onclick="MascotModule._answerMini(${oi === q.ans ? 1 : 0},${i},${qs.length})">${o}</button>`).join('')}
        </div>`;
        };
        window._miniRenderQ(0); tickFn();
    }
    function _answerMini(correct, idx, total) {
        if (correct) {
            S.miniScore++; SFX.ting(); setExpr('happy', 800);
            if (typeof VoiceSystem !== 'undefined') VoiceSystem.sayQuizRight();
        } else {
            SFX.oops(); setExpr('think', 800);
            if (typeof VoiceSystem !== 'undefined') VoiceSystem.sayQuizWrong();
        }
        const next = idx + 1;
        if (next >= total) endMiniGame(window._miniQsList);
        else window._miniRenderQ(next);
    }
    function endMiniGame(qs) {
        clearTimeout(S.miniTimer); S.miniActive = false;
        const acc = Math.round(S.miniScore / qs.length * 100);
        const b = document.getElementById('mini-body');
        if (b) b.innerHTML = `<div class="mini-result">
      <div class="mini-result-emoji">${acc >= 80 ? '🏆' : acc >= 50 ? '⭐' : '💪'}</div>
      <div class="mini-result-score">${S.miniScore}/${qs.length}</div>
      <div class="mini-result-acc">अचूकता: ${acc}%</div>
      <div class="mini-result-msg">${acc >= 80 ? 'अफलातून! तू champion!' : acc >= 50 ? 'छान! आणखी सराव कर!' : 'हरकत नाही — पुन्हा प्रयत्न!'}</div>
      <button class="btn btn-primary" onclick="MascotModule.closeMiniGame()">बंद करा</button></div>`;
        if (acc >= 80) { confetti(45); earnSticker(); SFX.tada(); if (typeof VoiceSystem !== 'undefined') VoiceSystem.sayTaskDone(); }
        else { SFX.xylophone(); if (typeof VoiceSystem !== 'undefined') VoiceSystem.sayEncourage(); }
        setExpr(acc >= 80 ? 'cheer' : 'wave', 3000);
    }
    function closeMiniGame() {
        const m = document.getElementById('mini-modal');
        if (m) m.classList.remove('open');
    }

    /* ── Easter Egg (Tap × 3) ───────────────────────────────── */
    function onMascotTap() {
        resetIdle(); S.tapCount++;
        SFX.pop(); setExpr(S.tapCount >= 3 ? 'wow' : 'wave', S.tapCount >= 3 ? 3000 : 800);
        clearTimeout(S.tapTimer);
        if (S.tapCount >= 3) {
            S.tapCount = 0; SFX.easterEgg(); confetti(55); earnSticker();
            toast('Wow! तू खूप हुशार! 🌟 Easter Egg सापडला!', '🥚', 4000);
            if (typeof VoiceSystem !== 'undefined') VoiceSystem.sayEasterEgg();
        } else {
            S.tapTimer = setTimeout(() => { S.tapCount = 0; }, 2000);
        }
    }

    /* ── Helpers ─────────────────────────────────────────────── */
    function getGreeting() {
        const h = new Date().getHours();
        const p = h < 12 ? GREETINGS_MORNING : h < 17 ? GREETINGS_DAY : GREETINGS_EVE;
        return p[Math.floor(Math.random() * p.length)];
    }
    function toggleSound() {
        S.soundOn = !S.soundOn;
        localStorage.setItem('nav_sound', JSON.stringify(S.soundOn));
        const btn = document.getElementById('sound-toggle-btn');
        if (btn) btn.textContent = S.soundOn ? '🔊 आवाज: चालू' : '🔇 आवाज: बंद';
        if (S.soundOn) SFX.ting();
    }
    function onStickerClick(idx) {
        const s = S.stickers[idx];
        toast(s ? `हे ${s} स्टिकर तू मिळवलेस! 🎉` : 'हे स्टिकर अजून मिळवायचे आहे!', s || '📅');
        SFX.pop();
    }
    function revealJoke() {
        const a = document.getElementById('joke-answer');
        if (a) { a.style.display = 'block'; SFX.ting(); }
        if (typeof VoiceSystem !== 'undefined') VoiceSystem.sayJoke();
    }
    function celebrateTask(label) {
        confetti(35); toast(`शाब्बास! ${label} पूर्ण! 🎉`, '🎊', 3000);
        setExpr('clap', 2500); SFX.tada();
        if (typeof VoiceSystem !== 'undefined') VoiceSystem.sayTaskDone();
    }

    /* ── Render ──────────────────────────────────────────────── */
    function renderMascotBlock() {
        const el = document.getElementById('mascot-block');
        if (!el) return;
        const joke = JOKES[Math.floor(Math.random() * JOKES.length)];
        el.innerHTML = `
      <!-- Floating emojis will be injected into smart-hub by JS -->
      <!-- Mascot Row -->
      <div class="mascot-row" onclick="MascotModule.onMascotTap()">
        <div class="mascot-body" id="mascot-body">
          <div class="mascot-face" id="mascot-face">🦉</div>
          <div class="mascot-badge" id="mascot-badge"></div>
          <div class="mascot-label">Ollie</div>
        </div>
        <div class="mascot-msgs">
          <div class="mascot-greeting">${getGreeting()}</div>
          <div class="mascot-mood">${MOOD_MSGS[Math.floor(Math.random() * MOOD_MSGS.length)]}</div>
          <div class="mascot-hint">👆 3 वेळा टाप — सरप्राइज!</div>
        </div>
      </div>

      <!-- Typing Quote Bubble -->
      <div class="quote-bubble" id="quote-bubble">
        <span class="quote-text"></span>
        <div class="quote-tail"></div>
      </div>
      <button class="quote-trigger-btn btn btn-sm btn-outline" onclick="MascotModule.showQuoteBubble()">💬 Ollie काय म्हणतो?</button>

      <!-- Timer Face -->
      <div class="timer-face-row">
        <span id="timer-face-emoji" class="timer-face-emoji">😐</span>
        <span id="timer-face-label" class="timer-face-label">शिकायला सुरुवात करूया!</span>
      </div>

      <!-- Sticker Bar -->
      <div class="sticker-section">
        <div class="sticker-label">🏅 माझे स्टिकर्स</div>
        <div id="sticker-bar" class="sticker-bar"></div>
        <button class="btn btn-sm btn-outline sticker-earn-btn" onclick="MascotModule.earnSticker()">+ स्टिकर मिळवा</button>
      </div>

      <!-- Joke Bubble -->
      <div class="joke-bubble">
        <div class="joke-q">🤡 ${joke.q}</div>
        <div class="joke-a" id="joke-answer" style="display:none">${joke.a}</div>
        <button class="joke-reveal-btn" onclick="MascotModule.revealJoke()">उत्तर बघा 😄</button>
      </div>

      <!-- Action Buttons -->
      <div class="mascot-actions">
        <button class="btn btn-primary mascot-action-btn magic-btn" id="mini-launch-btn"
          onclick="MascotModule.startMiniGame(); if(typeof VoiceSystem!=='undefined')VoiceSystem.sayQuizStart(); this.classList.add('magic-click'); setTimeout(()=>this.classList.remove('magic-click'),600)">
          ⚡ 1-मिनिट Challenge
        </button>
        <button class="btn btn-outline mascot-action-btn" id="sound-toggle-btn" onclick="MascotModule.toggleSound()">
          ${S.soundOn ? '🔊 आवाज: चालू' : '🔇 आवाज: बंद'}
        </button>
        <button class="btn btn-outline mascot-action-btn voice-toggle-btn" id="voice-toggle-btn"
          onclick="if(typeof VoiceSystem!=='undefined'){const on=VoiceSystem.toggle();this.innerHTML=on?'⏹️ <span class=vtog-dot vtog-on></span>🎙️ बोली: चालू':'⏹️ <span class=vtog-dot vtog-off></span>🔇 बोली: बंद';}">
          <span class="vtog-dot ${(typeof VoiceSystem !== 'undefined' && VoiceSystem.isOn()) ? 'vtog-on' : 'vtog-off'}"></span>🎙️ बोली: चालू
        </button>
      </div>`;

        renderStickerBar();
        startIdleBlink();
        startFloatEmojis();
        resetIdle();
    }

    /* ── Idle Blink Loop ─────────────────────────────────────── */
    function startIdleBlink() {
        setInterval(() => {
            if (S.currentExpr === 'idle' || S.currentExpr === 'blink') {
                const face = document.getElementById('mascot-face');
                if (face) { face.style.opacity = '0'; setTimeout(() => { if (face) face.style.opacity = '1'; }, 120); }
            }
        }, 3500);
        // Auto quote every 2 min
        setInterval(showQuoteBubble, 120000);
        // Magic button idle pulse every 8s
        setInterval(() => {
            const b = document.getElementById('mini-launch-btn');
            if (b && !S.miniActive) { b.classList.add('magic-pulse'); setTimeout(() => b.classList.remove('magic-pulse'), 2000); }
        }, 8000);
    }

    /* ── Floating Emojis ─────────────────────────────────────── */
    function startFloatEmojis() {
        clearInterval(S.floatInterval);
        S.floatInterval = setInterval(spawnFloatEmoji, 3500);
    }
    function spawnFloatEmoji() {
        const hub = document.getElementById('smart-hub');
        if (!hub || document.querySelectorAll('.float-emoji').length > 6) return;
        const em = document.createElement('span');
        em.className = 'float-emoji';
        em.textContent = FLOAT_EMOJIS[Math.floor(Math.random() * FLOAT_EMOJIS.length)];
        em.style.cssText = `left:${5 + Math.random() * 88}%;animation-duration:${7 + Math.random() * 7}s;font-size:${13 + Math.random() * 13}px;`;
        hub.appendChild(em);
        em.addEventListener('click', () => { sparkle(em); confetti(10); SFX.pop(); em.remove(); }, { once: true });
        setTimeout(() => em.remove(), 16000);
    }
    function sparkle(el) {
        const r = el.getBoundingClientRect();
        for (let i = 0; i < 8; i++) {
            const s = document.createElement('div');
            s.className = 'sparkle-particle';
            s.style.cssText = `left:${r.left + r.width / 2}px;top:${r.top + r.height / 2}px;--dx:${(Math.random() - 0.5) * 80}px;--dy:${(Math.random() - 0.5) * 80}px;`;
            document.body.appendChild(s);
            setTimeout(() => s.remove(), 700);
        }
    }

    /* ── Mini-Game Modal Inject ──────────────────────────────── */
    function injectModal() {
        if (document.getElementById('mini-modal')) return;
        const m = document.createElement('div');
        m.id = 'mini-modal'; m.className = 'mini-modal-overlay';
        m.innerHTML = `<div class="mini-modal-box">
      <div class="mini-header">
        <span>⚡ 1-मिनिट अपूर्णांक Challenge</span>
        <span class="mini-timer-badge">⏱ <span id="mini-time">60</span>s</span>
      </div>
      <div id="mini-body"></div></div>`;
        document.body.appendChild(m);
    }

    /* ── Activity listener ───────────────────────────────────── */
    function bindActivity() {
        ['touchstart', 'click', 'keydown'].forEach(ev =>
            document.addEventListener(ev, resetIdle, { passive: true }));
    }

    /* ── Init ────────────────────────────────────────────────── */
    function init() {
        injectModal(); renderMascotBlock(); bindActivity();
        // Greet with voice after 1.2s (voices may not be loaded yet)
        setTimeout(() => { if (typeof VoiceSystem !== 'undefined') VoiceSystem.sayGreet(); }, 1200);
        window.addEventListener('timer-tick', e => {
            if (e.detail) updateTimerFace(e.detail.totalSeconds || e.detail || 0);

        });
        // Show quote after 4s
        setTimeout(showQuoteBubble, 4000);
    }

    /* ── Public ──────────────────────────────────────────────── */
    return {
        init, renderMascotBlock, onMascotTap,
        toggleSound, earnSticker, onStickerClick,
        startMiniGame, closeMiniGame, _answerMini,
        celebrateTask, revealJoke, showQuoteBubble,
        confetti, toast, setExpr,
    };
})();
