// ============================================
// NAVODAYA LEARNING PLATFORM — GPT Module
// Simulated AI responses + prompt engineering
// ============================================

const GptModule = {
    init() {
        this.container = document.getElementById('chat-container');
        this.input = document.getElementById('chat-input');
        this.sendBtn = document.getElementById('chat-send-btn');
        this.messagesArea = document.getElementById('chat-messages');

        if (!this.container) return;

        // Event listeners
        this.sendBtn.addEventListener('click', () => this.handleUserMessage());
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleUserMessage();
        });

        // Render prompt buttons
        this.renderPromptButtons();

        // Welcome message
        if (this.messagesArea.children.length === 0) {
            this.addMessage('ai', APP_DATA.gptResponses.default);
        }
    },

    renderPromptButtons() {
        const btnContainer = document.getElementById('prompt-buttons');
        if (!btnContainer) return;

        btnContainer.innerHTML = APP_DATA.gptPrompts.map((p, index) =>
            `<button class="prompt-btn" onclick="GptModule.usePrompt(${index})">${p.label}</button>`
        ).join('');
    },

    usePrompt(index) {
        const prompt = APP_DATA.gptPrompts[index];
        if (prompt.needsInput) {
            this.input.value = prompt.prompt;
            this.input.focus();
        } else {
            this.addMessage('user', prompt.label);
            this.simulateResponse(prompt.label);
        }
    },

    handleUserMessage() {
        const text = this.input.value.trim();
        if (!text) return;

        this.addMessage('user', text);
        this.input.value = '';
        this.simulateResponse(text);
    },

    addMessage(role, text) {
        const div = document.createElement('div');
        div.className = `chat-bubble ${role}`;

        // Parse formatting (bold, newlines)
        const formatted = text
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        div.innerHTML = formatted;
        this.messagesArea.appendChild(div);
        this.scrollToBottom();
    },

    scrollToBottom() {
        this.messagesArea.scrollTop = this.messagesArea.scrollHeight;
    },

    simulateResponse(userText) {
        // Show typing indicator
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chat-bubble ai typing';
        typingDiv.innerHTML = '<div class="typing-dots"><span>.</span><span>.</span><span>.</span></div>';
        this.messagesArea.appendChild(typingDiv);
        this.scrollToBottom();

        // Determine response
        let responseText = APP_DATA.gptResponses.default;

        // Simple improved keyword matching
        const lower = userText.toLowerCase();

        if (lower.includes('test') || lower.includes('चाचणी') || lower.includes('quiz')) {
            responseText = APP_DATA.gptResponses.test;
        } else if (lower.includes('plan') || lower.includes('योजना') || lower.includes('schedule')) {
            responseText = APP_DATA.gptResponses.plan;
        } else if (lower.includes('mock') || lower.includes('paper')) {
            responseText = APP_DATA.gptResponses.mock;
        }

        // Delay to simulate thinking
        setTimeout(() => {
            this.messagesArea.removeChild(typingDiv);
            this.addMessage('ai', responseText);
        }, 1500);
    }
};
