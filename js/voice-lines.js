/* ============================================================
   VOICE LINES — मराठी बालमित्र
   Web Speech API (mr-IN) — No MP3 files needed
   All lines soft, slow, Class-4 friendly
   ============================================================ */

const VoiceSystem = (() => {

    /* ── Voice Line Library ─────────────────────────────── */
    const LINES = {
        greet: [
            'शुभ प्रभात! आज शिकायला तयार आहात का?',
            'नमस्कार मित्रा! चला, थोडं अभ्यास करूया!',
            'गुड मॉर्निंग! आजचा दिवस मस्त जाऊ दे!',
            'हॅलो! तुझी वाट पाहत होतो!',
        ],
        greet_day: [
            'नमस्कार! परत आलास हे खूप छान झालं!',
            'थोडं शिकूया? मी तयार आहे!',
            'चल, आज काहीतरी नवीन शिकूया!',
        ],
        greet_evening: [
            'संध्याकाळी पण अभ्यास! वा, शाब्बास!',
            'थकलेलास का? चल, थोड्या वेळ शिकूया!',
            'एक-दोन प्रश्न करूया, मग आराम!',
        ],
        timer_start: [
            'टाइमर सुरू झाला! लक्ष देऊन अभ्यास करूया!',
            'चल, आता शांतपणे अभ्यास करूया!',
            'फक्त काही मिनिटं — तू नक्की करू शकतोस!',
        ],
        timer_mid: [
            'छान चाललंय! असंच सुरू ठेव!',
            'वा! तू खूप लक्ष देतोयस!',
            'थोडा वेळ अजून — तू जवळ आलास!',
        ],
        timer_done: [
            'शाब्बास! टाइमर पूर्ण झाला!',
            'वा! तू आज भारी अभ्यास केलास!',
            'खूप छान! आता थोडी विश्रांती घे!',
        ],
        task_done: [
            'कमाल केलीस! काम पूर्ण झालं!',
            'तू खूप हुशार आहेस!',
            'एक स्टेप पुढे गेलास! शाब्बास!',
        ],
        quiz_start: [
            'चला, छोटा क्विझ खेळूया!',
            'डोकं लाव! प्रश्न सोपे आहेत!',
            'रेडी? चला सुरू करूया!',
        ],
        quiz_right: [
            'बरोबर! खूप छान!',
            'अगदी योग्य उत्तर! वा!',
            'वा! तू हे ओळखलंस! छान!',
        ],
        quiz_wrong: [
            'अरे! काही हरकत नाही!',
            'पुन्हा प्रयत्न करूया!',
            'चूक झाली, पण तू शिकतोयस!',
        ],
        ai_open: [
            'काय शंका आहे? मला सांग!',
            'मी मदतीसाठी इथेच आहे!',
            'चल, प्रश्न विचार — मी उत्तर देतो!',
        ],
        sticker: [
            'वा! तुला स्टिकर मिळालं!',
            'अभिनंदन! हे तुझं बक्षीस!',
            'खूप छान! अजून मिळवूया!',
        ],
        idle: [
            'चला मित्रा, थोडं अभ्यास करूया!',
            'मी इथेच आहे, तयार झालास का?',
            'थोडा वेळ शिकूया, मग खेळूया!',
        ],
        joke: [
            'हाहा! अभ्यास पण मजेत!',
            'मी हसतोय, तू पण हस!',
            'मजा आली ना? चला पुढे जाऊया!',
        ],
        goodnight: [
            'आज खूप छान केलंस!',
            'आता आराम कर, उद्या भेटू!',
            'शुभ रात्री! स्वप्नातही जिंक!',
        ],
        easter_egg: [
            'अरे वा! तू खूप हुशार आहेस! Easter Egg सापडला!',
            'कमाल! तीन वेळा टापलंस! शाब्बास!',
        ],
        encourage: [
            'तू नक्की करू शकतोस! चल!',
            'नवोदयचा रस्ता तुला नक्की मिळेल!',
            'हार मानू नकोस! छान प्रयत्न आहे!',
        ],
    };

    /* ── State ──────────────────────────────────────────── */
    let voiceOn = JSON.parse(localStorage.getItem('nav_voice') ?? 'true');
    let speaking = false;
    let _queue = [];
    let _voice = null;          // cached best voice

    /* ── Detect best Marathi / Hindi / fallback voice ───── */
    function pickVoice() {
        if (_voice) return _voice;
        const voices = speechSynthesis.getVoices();
        // Priority: mr-IN → hi-IN → any Indian English → default female
        _voice =
            voices.find(v => v.lang === 'mr-IN') ||
            voices.find(v => v.lang === 'hi-IN') ||
            voices.find(v => v.lang.startsWith('hi')) ||
            voices.find(v => v.lang === 'en-IN') ||
            voices.find(v => /female|woman|girl/i.test(v.name)) ||
            voices[0] || null;
        return _voice;
    }

    /* ── Core speak function ────────────────────────────── */
    function speak(text, opts = {}) {
        if (!voiceOn || !text) return;
        if (!('speechSynthesis' in window)) return;

        // Show in speech bubble if mascot is present
        _showBubble(text);

        // Queue if already speaking
        if (speaking) { _queue.push({ text, opts }); return; }
        speaking = true;

        const utt = new SpeechSynthesisUtterance(text);
        utt.lang = 'mr-IN';
        utt.rate = opts.rate ?? 0.82;   // slow & clear
        utt.pitch = opts.pitch ?? 1.1;    // slightly higher = friendlier
        utt.volume = opts.volume ?? 0.9;

        // Try to assign a good voice (voices load async)
        const v = pickVoice();
        if (v) utt.voice = v;

        utt.onend = () => {
            speaking = false;
            if (_queue.length) {
                const next = _queue.shift();
                speak(next.text, next.opts);
            }
        };
        utt.onerror = () => { speaking = false; };

        try { speechSynthesis.speak(utt); }
        catch (_) { speaking = false; }
    }

    /* ── Show text in mascot speech bubble ──────────────── */
    function _showBubble(text) {
        const el = document.getElementById('quote-bubble');
        if (!el) return;
        el.classList.add('show');
        const qt = el.querySelector('.quote-text');
        if (qt) {
            qt.textContent = '';
            let i = 0;
            const iv = setInterval(() => {
                if (i < text.length) { qt.textContent += text[i++]; }
                else { clearInterval(iv); }
            }, 45);
        }
        setTimeout(() => el.classList.remove('show'), Math.max(3000, text.length * 60));
    }

    /* ── Pick a random line from category ───────────────── */
    function pick(category) {
        const pool = LINES[category];
        if (!pool || !pool.length) return '';
        return pool[Math.floor(Math.random() * pool.length)];
    }

    /* ── Public event helpers ────────────────────────────── */
    function sayGreet() {
        const h = new Date().getHours();
        const cat = h < 12 ? 'greet' : h < 17 ? 'greet_day' : 'greet_evening';
        speak(pick(cat));
    }
    function sayTimerStart() { speak(pick('timer_start')); }
    function sayTimerMid() { speak(pick('timer_mid')); }
    function sayTimerDone() { speak(pick('timer_done')); }
    function sayTaskDone() { speak(pick('task_done')); }
    function sayQuizStart() { speak(pick('quiz_start')); }
    function sayQuizRight() { speak(pick('quiz_right')); }
    function sayQuizWrong() { speak(pick('quiz_wrong')); }
    function sayAIOpen() { speak(pick('ai_open')); }
    function saySticker() { speak(pick('sticker')); }
    function sayIdle() { speak(pick('idle')); }
    function sayJoke() { speak(pick('joke')); }
    function sayGoodnight() { speak(pick('goodnight')); }
    function sayEasterEgg() { speak(pick('easter_egg')); }
    function sayEncourage() { speak(pick('encourage')); }
    function sayCustom(text) { speak(text); }

    /* ── Toggle ──────────────────────────────────────────── */
    function toggle() {
        voiceOn = !voiceOn;
        localStorage.setItem('nav_voice', JSON.stringify(voiceOn));
        _updateBtn();
        if (voiceOn) speak('आवाज चालू झाला!');
        else speechSynthesis.cancel();
        return voiceOn;
    }
    function isOn() { return voiceOn; }

    function _updateBtn() {
        const btn = document.getElementById('voice-toggle-btn');
        if (btn) btn.innerHTML = voiceOn
            ? '<span class="vtog-dot vtog-on"></span>🎙️ आवाज: चालू'
            : '<span class="vtog-dot vtog-off"></span>🔇 आवाज: बंद';
    }

    /* ── Render Voice Toggle Button ─────────────────────── */
    function renderToggle(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;
        const btn = document.createElement('button');
        btn.id = 'voice-toggle-btn';
        btn.className = 'btn btn-outline voice-toggle-btn';
        btn.onclick = () => toggle();
        el.appendChild(btn);
        _updateBtn();
    }

    /* ── Auto detect voices load ─────────────────────────── */
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = pickVoice;
    }

    /* ── Public API ──────────────────────────────────────── */
    return {
        speak, pick, isOn, toggle, renderToggle,
        sayGreet, sayTimerStart, sayTimerMid, sayTimerDone,
        sayTaskDone, sayQuizStart, sayQuizRight, sayQuizWrong,
        sayAIOpen, saySticker, sayIdle, sayJoke,
        sayGoodnight, sayEasterEgg, sayEncourage, sayCustom,
        LINES,
    };
})();
