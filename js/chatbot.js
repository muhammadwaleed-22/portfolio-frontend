// frontend/js/chatbot.js

export function initChatbot() {
    const triggerBtn = document.getElementById('chatbot-trigger');
    const closeBtn = document.getElementById('chatbot-close');
    const chatPanel = document.getElementById('ai-chat-panel');
    const messagesContainer = document.getElementById('chat-messages');
    const suggestionsContainer = document.getElementById('chat-suggestions');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send');

    if (!triggerBtn || !chatPanel) return;

    let isOpen = false;
    let isProcessing = false;
    let hasStarted = false;

    // API config (reused or defined here)
    // We assume backend is hosted at the same origin or we provide absolute path if needed.
    // For local dev, we could use relative if hosted on same port, but typical Flask is 5000 and Live Server is 5500.
    // We'll use relative /api/chat if proxied, or an absolute one if defined.
    // Since this is a vanilla setup, assuming we run backend and frontend decoupled, let's use an environment approach or hardcode local for now.
    // We'll use a relative path assuming we either serve from flask or have a proxy. 
    // To be safe across ports (if opened via file:// or live server), we can detect host.
    const API_BASE = 'https://portfolio-backend-sigma-blush.vercel.app/api';
    
    // Manage history
    let conversationHistory = [];

    const starterPrompts = [
        "What are Waleed's strongest skills?",
        "Tell me about CS Companion.",
        "What mobile apps has Waleed built?",
        "What is his .NET experience?"
    ];

    // Create backdrop for mobile
    const backdrop = document.createElement('div');
    backdrop.className = 'chat-backdrop';
    document.body.appendChild(backdrop);
    backdrop.addEventListener('click', toggleChat);

    function toggleChat() {
        isOpen = !isOpen;
        chatPanel.setAttribute('aria-hidden', !isOpen);
        triggerBtn.setAttribute('aria-expanded', isOpen);

        if (isOpen) {
            chatPanel.classList.add('is-open');
            triggerBtn.classList.add('chat-open');
            backdrop.classList.add('is-open');
            
            if (window.innerWidth <= 768) {
                document.body.classList.add('nav-open'); // Reuse nav-open class for scroll lock
            }

            if (!hasStarted) {
                renderWelcome();
                renderSuggestions();
                hasStarted = true;
            }
            chatInput.focus();
        } else {
            chatPanel.classList.remove('is-open');
            triggerBtn.classList.remove('chat-open');
            backdrop.classList.remove('is-open');
            document.body.classList.remove('nav-open');
            triggerBtn.focus();
        }
    }

    triggerBtn.addEventListener('click', toggleChat);
    closeBtn.addEventListener('click', toggleChat);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isOpen) {
            toggleChat();
        }
    });

    function renderWelcome() {
        const welcomeText = "Hi! I'm Waleed's portfolio AI assistant.\n\nYou can ask me about skills, projects, experience, or technical background.";
        renderMessage(welcomeText, 'assistant');
    }

    function renderSuggestions() {
        suggestionsContainer.innerHTML = '';
        starterPrompts.forEach(prompt => {
            const btn = document.createElement('button');
            btn.className = 'suggestion-btn';
            btn.textContent = prompt;
            btn.addEventListener('click', () => {
                handleUserSubmit(prompt);
            });
            suggestionsContainer.appendChild(btn);
        });
    }

    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function parseMarkdown(text) {
        let html = escapeHTML(text);
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
        html = html.replace(/\n/g, '<br>');
        return html;
    }

    function renderMessage(text, role, isError = false) {
        const div = document.createElement('div');
        div.className = `chat-message chat-message--${role}`;
        if (isError) div.classList.add('chat-message--error');
        
        div.innerHTML = parseMarkdown(text);

        messagesContainer.appendChild(div);
        scrollToBottom();
    }

    function scrollToBottom() {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    async function handleUserSubmit(text) {
        if (!text.trim() || isProcessing) return;

        isProcessing = true;
        updateInputState();
        suggestionsContainer.style.display = 'none';

        const userText = text.trim();
        renderMessage(userText, 'user');
        chatInput.value = '';

        const typingIndicator = renderTypingIndicator();
        let fullAssistantResponse = "";

        try {
            const controller = new AbortController();
            let timeoutId = setTimeout(() => controller.abort(), 60000); // 60 seconds for streaming

            const response = await fetch(`${API_BASE}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: userText, history: conversationHistory }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                // If it's a JSON error
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error?.message || 'The AI assistant is temporarily unavailable. Please try again.');
            }

            // Do not remove typing indicator or append empty bubble yet.
            // We will do this when the first text chunk actually arrives.
            const div = document.createElement('div');
            div.className = 'chat-message chat-message--assistant';

            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            
            let pendingBuffer = '';
            const wordQueue = [];
            let renderedText = '';
            let isStreamComplete = false;
            let queueAborted = false;
            let hasStartedStreaming = false;
            
            // Process queue asynchronously to simulate typing
            const processQueue = async () => {
                const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                
                while (!queueAborted && (!isStreamComplete || wordQueue.length > 0)) {
                    if (wordQueue.length === 0) {
                        // Wait briefly for new words if stream isn't done
                        await new Promise(r => setTimeout(r, 20));
                        continue;
                    }

                    if (!hasStartedStreaming) {
                        hasStartedStreaming = true;
                        typingIndicator.remove();
                        messagesContainer.appendChild(div);
                    }
                    
                    if (isReducedMotion) {
                        // Flush queue instantly
                        while(wordQueue.length > 0) {
                            renderedText += wordQueue.shift();
                        }
                    } else {
                        const word = wordQueue.shift();
                        renderedText += word;
                        
                        let delay = 35;
                        if (wordQueue.length > 30) delay = 15;
                        else if (wordQueue.length > 10) delay = 25;
                        
                        if (word.includes('.') || word.includes('?') || word.includes('!')) delay += 80;
                        else if (word.includes(',') || word.includes(';')) delay += 40;
                        
                        await new Promise(r => setTimeout(r, delay));
                    }
                    
                    // Render safely with cursor
                    div.innerHTML = parseMarkdown(renderedText) + '<span class="streaming-cursor">▍</span>';
                    
                    // Auto-scroll
                    const isNearBottom = messagesContainer.scrollHeight - messagesContainer.scrollTop - messagesContainer.clientHeight < 120;
                    if (isNearBottom) {
                        scrollToBottom();
                    }
                }
            };
            
            const queuePromise = processQueue();

            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    isStreamComplete = true;
                    if (pendingBuffer) {
                        wordQueue.push(pendingBuffer);
                        pendingBuffer = '';
                    }
                    break;
                }

                const chunk = decoder.decode(value, { stream: true });
                
                // If it looks like a backend JSON error, intercept it immediately
                if (fullAssistantResponse === '' && chunk.trim().startsWith('{"success": false')) {
                    try {
                        const errorObj = JSON.parse(chunk.trim());
                        throw new Error(errorObj.error?.message || 'Network error communicating with AI.');
                    } catch (e) {
                        throw new Error(e.message || 'Network error communicating with AI.');
                    }
                }

                fullAssistantResponse += chunk;
                pendingBuffer += chunk;
                
                // Split by word boundaries (spaces, newlines), preserving delimiters
                const segments = pendingBuffer.split(/([ \n\t]+)/);
                
                if (segments.length > 1) {
                    // Last segment is potentially incomplete
                    pendingBuffer = segments.pop() || '';
                    for (const segment of segments) {
                        if (segment) wordQueue.push(segment);
                    }
                }
                
                // Reset timeout since we are actively receiving data
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => controller.abort(), 60000);
            }
            
            // Wait for visual typing to finish
            await queuePromise;

            if (!hasStartedStreaming) {
                typingIndicator.remove();
                messagesContainer.appendChild(div);
            }

            // Remove streaming cursor once done
            div.innerHTML = parseMarkdown(fullAssistantResponse);

            // Add to history
            conversationHistory.push({ role: 'user', parts: userText });
            conversationHistory.push({ role: 'assistant', parts: fullAssistantResponse });
            
            // Keep history limited to last 6 turns (12 messages) to save tokens
            if (conversationHistory.length > 12) {
                conversationHistory = conversationHistory.slice(conversationHistory.length - 12);
            }
            
            scrollToBottom();

        } catch (error) {
            // Signal the queue processor to stop immediately
            if (typeof queueAborted !== 'undefined') queueAborted = true;
            typingIndicator.remove();
            if (error.name === 'AbortError') {
                renderMessage('The AI assistant took too long to respond. Please try again.', 'error', true);
            } else if (fullAssistantResponse.length > 0) {
                // If stream was interrupted but we have some content
                const div = messagesContainer.lastElementChild;
                if (div && div.classList.contains('chat-message--assistant')) {
                    div.textContent = fullAssistantResponse;
                    const interrupted = document.createElement('em');
                    interrupted.textContent = '\n\n[Response interrupted. Please try again.]';
                    div.appendChild(interrupted);
                    scrollToBottom();
                } else {
                    renderMessage('Response interrupted. Please try again.', 'error', true);
                }
            } else {
                renderMessage(error.message || "I couldn't respond right now. Please try again.", 'error', true);
            }
        } finally {
            isProcessing = false;
            updateInputState();
            chatInput.focus();
        }
    }



    function renderTypingIndicator() {
        const div = document.createElement('div');
        div.className = 'chat-typing';
        div.innerHTML = '<span></span><span></span><span></span>';
        messagesContainer.appendChild(div);
        scrollToBottom();
        return div;
    }

    function updateInputState() {
        if (isProcessing) {
            chatInput.disabled = true;
            sendBtn.disabled = true;
        } else {
            chatInput.disabled = false;
            sendBtn.disabled = chatInput.value.trim().length === 0;
        }
    }

    chatInput.addEventListener('input', updateInputState);

    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleUserSubmit(chatInput.value);
        }
    });

    sendBtn.addEventListener('click', () => {
        handleUserSubmit(chatInput.value);
    });

    // Initial state
    updateInputState();
}

// Initialization now handled centrally by main.js
