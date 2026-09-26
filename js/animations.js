let activeTimeouts = [];
let activeIntervals = [];

function clearAllAnimations() {
    activeTimeouts.forEach(clearTimeout);
    activeIntervals.forEach(clearInterval);
    activeTimeouts = [];
    activeIntervals = [];
}

function safeSetTimeout(cb, delay) {
    const id = setTimeout(() => {
        activeTimeouts = activeTimeouts.filter(t => t !== id);
        cb();
    }, delay);
    activeTimeouts.push(id);
    return id;
}

function safeSetInterval(cb, delay) {
    const id = setInterval(cb, delay);
    activeIntervals.push(id);
    return id;
}

const originalCodeHTML = `<pre><code><span class="keyword">const</span> <span class="variable">developer</span> <span class="operator">=</span> {
  <span class="property">name</span>: <span class="string">"Muhammad Waleed"</span>,
  <span class="property">role</span>: <span class="string">"Full Stack Engineer"</span>,
  <span class="property">focus</span>: [
    <span class="string">"Frontend"</span>,
    <span class="string">"Backend"</span>,
    <span class="string">"Mobile"</span>
  ],
  <span class="property">mindset</span>: <span class="string">"Build. Learn. Improve."</span>
};</code></pre>`;

function triggerTerminalAnimation(container) {
    if (isProfileAnimationRunning) return;
    
    safeSetTimeout(() => {
        if (isProfileAnimationRunning) return;
        const cursor = document.getElementById('virtual-cursor');
        const runBtn = document.getElementById('run-code-btn');
        const editorBody = document.getElementById('code-editor-body');
        if(!cursor || !runBtn || !editorBody) return;

        const btnRect = runBtn.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        cursor.style.opacity = '1';
        
        const targetTop = btnRect.top - containerRect.top + (btnRect.height / 2);
        const targetLeft = btnRect.left - containerRect.left + (btnRect.width / 2);
        
        cursor.style.top = targetTop + 'px';
        cursor.style.left = targetLeft + 'px';

        safeSetTimeout(() => {
            if (isProfileAnimationRunning) return;
            runBtn.classList.add('active');
            
            safeSetTimeout(() => {
                runBtn.classList.remove('active');
                cursor.style.opacity = '0';
                
                if (isProfileAnimationRunning) return;
                // Start the terminal output animation
                runProfileAnimation();
            }, 200);
        }, 1500);
    }, 500);
}

async function autoTypeAndRunCode(container) {
    const editorBody = document.getElementById('code-editor-body');
    if (!editorBody) return;
    
    const preCode = document.createElement('pre');
    const codeEl = document.createElement('code');
    preCode.appendChild(codeEl);
    editorBody.innerHTML = '';
    editorBody.appendChild(preCode);
    
    const cursorEl = document.createElement('span');
    cursorEl.className = 'cursor';
    cursorEl.style.animation = 'blink-cursor 1s step-end infinite';
    cursorEl.innerText = '_';
    codeEl.appendChild(cursorEl);

    const segments = [
        { text: "const ", class: "keyword" },
        { text: "developer ", class: "variable" },
        { text: "= {\n", class: "operator" },
        { text: "  name: ", class: "property" },
        { text: '"Muhammad Waleed",\n', class: "string" },
        { text: "  role: ", class: "property" },
        { text: '"Full Stack Engineer",\n', class: "string" },
        { text: "  focus: [\n", class: "property" },
        { text: '    "Frontend",\n', class: "string" },
        { text: '    "Backend",\n', class: "string" },
        { text: '    "Mobile",\n', class: "string" },
        { text: '    "DevOps"\n', class: "string" },
        { text: "  ],\n", class: "property" },
        { text: "  mindset: ", class: "property" },
        { text: '"Build. Learn. Improve."\n', class: "string" },
        { text: "};", class: "operator" }
    ];

    for (const segment of segments) {
        // If user manually clicked the button, stop the auto-typing
        if (isProfileAnimationRunning) return;
        
        const span = document.createElement('span');
        span.className = segment.class;
        codeEl.insertBefore(span, cursorEl);
        
        for (let i = 0; i < segment.text.length; i++) {
            if (isProfileAnimationRunning) return;
            span.innerHTML += segment.text[i];
            await new Promise(r => setTimeout(r, 10 + Math.random() * 20));
        }
    }
    
    await new Promise(r => setTimeout(r, 500));
    if (isProfileAnimationRunning) return;
    cursorEl.remove();

    triggerTerminalAnimation(container);
}

let isProfileAnimationRunning = false;

async function typeText(element, text, speed = 40) {
    return new Promise(resolve => {
        let i = 0;
        element.innerHTML = '';
        function type() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                setTimeout(type, speed + (Math.random() * 20 - 10));
            } else {
                resolve();
            }
        }
        type();
    });
}

async function runProfileAnimation() {
    if (isProfileAnimationRunning) return;
    isProfileAnimationRunning = true;
    
    const runBtn = document.getElementById('run-code-btn');
    const editorBody = document.getElementById('code-editor-body');
    const fileName = document.querySelector('.hero-visual .file-name');
    const virtualCursor = document.getElementById('virtual-cursor');
    
    if(!runBtn || !editorBody) return;
    
    if(virtualCursor) virtualCursor.style.display = 'none';

    try {
        runBtn.disabled = true;
        runBtn.style.opacity = '0.5';
        runBtn.style.cursor = 'not-allowed';
        
        if (fileName) fileName.innerText = 'terminal.sh';
        
        editorBody.innerHTML = '<div id="terminal-content" style="font-family: var(--font-code); color: var(--success); font-size: 0.9rem; line-height: 1.7; text-align: left; white-space: pre-wrap; word-break: break-word;"></div>';
        const terminalContent = document.getElementById('terminal-content');
        
        const sequence = [
            "> initializing profile...",
            "> reading developer.config",
            "> loading technologies...",
            "> loading experience...",
            "> connecting projects...",
            "> compiling portfolio...",
            "> build successful ✓"
        ];
        
        for (const line of sequence) {
            const lineDiv = document.createElement('div');
            lineDiv.innerHTML = `<span class="line-text"></span><span class="cursor" style="animation: blink-cursor 1s step-end infinite;">_</span>`;
            terminalContent.appendChild(lineDiv);
            
            const textSpan = lineDiv.querySelector('.line-text');
            await typeText(textSpan, line);
            
            const cursor = lineDiv.querySelector('.cursor');
            if(cursor) cursor.remove();
            
            await new Promise(r => setTimeout(r, 350));
        }
        
        // Loader
        editorBody.innerHTML = `
            <div class="modern-loader-container" style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; color:var(--text-secondary); font-family:var(--font-code); font-size:0.9rem;">
                <div class="modern-spinner" style="margin-bottom: 16px;"></div>
                <div>Rendering profile...</div>
            </div>
        `;
        
        await new Promise(r => setTimeout(r, 1200));
        
        // Image Reveal
        if(fileName) fileName.innerText = 'Profile Loaded';
        editorBody.innerHTML = `
            <div class="profile-image-wrapper" style="opacity: 0; transform: translateY(15px) scale(0.96); transition: opacity 800ms cubic-bezier(0.25, 1, 0.5, 1), transform 800ms cubic-bezier(0.25, 1, 0.5, 1); width: 100%; box-sizing: border-box; max-width: 380px; margin: 0 auto;">
                <img src="assets/images/profile-light.jpg" alt="Profile Output Light" class="profile-output-image profile-img-light" onerror="this.src='https://via.placeholder.com/150';"/>
                <img src="assets/images/profile-dark.jpg" alt="Profile Output Dark" class="profile-output-image profile-img-dark" onerror="this.src='https://via.placeholder.com/150';"/>
            </div>
        `;
        
        // Trigger reflow
        editorBody.offsetHeight;
        
        const wrapper = editorBody.querySelector('.profile-image-wrapper');
        if (wrapper) {
            wrapper.style.opacity = '1';
            wrapper.style.transform = 'translateY(0) scale(1)';
        }
        
    } finally {
        isProfileAnimationRunning = false;
        runBtn.disabled = false;
        runBtn.style.opacity = '1';
        runBtn.style.cursor = 'pointer';
        runBtn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="23 4 23 10 17 10"></polyline>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
            </svg>
        `;
        runBtn.setAttribute('aria-label', 'Replay animation');
    }
}

export function initAnimations() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
                
                if (entry.target.classList.contains('hero-visual')) {
                    // Delay slightly to let the reveal animation finish
                    setTimeout(() => {
                        autoTypeAndRunCode(entry.target);
                    }, 800);
                }
            }
        });
    }, observerOptions);

    const elements = document.querySelectorAll('.fade-up, .reveal-up, .reveal-left, .reveal-right, .reveal-scale');
    elements.forEach(el => {
        observer.observe(el);
    });

    // Reset button functionality
    const runBtn = document.getElementById('run-code-btn');
    if(runBtn) {
        runBtn.addEventListener('click', () => {
            runProfileAnimation();
        });
    }
    
    // Auto-run once if desired? The user requested to only run on Play.
    // So we don't automatically call runProfileAnimation().
}
