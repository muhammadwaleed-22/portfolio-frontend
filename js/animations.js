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
    safeSetTimeout(() => {
        const cursor = document.getElementById('virtual-cursor');
        const runBtn = document.getElementById('run-code-btn');
        const editorBody = document.getElementById('code-editor-body');
        const fileName = container.querySelector('.file-name');
        if(!cursor || !runBtn || !editorBody) return;

        const btnRect = runBtn.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        cursor.style.opacity = '1';
        
        const targetTop = btnRect.top - containerRect.top + (btnRect.height / 2);
        const targetLeft = btnRect.left - containerRect.left + (btnRect.width / 2);
        
        cursor.style.top = targetTop + 'px';
        cursor.style.left = targetLeft + 'px';

        safeSetTimeout(() => {
            runBtn.classList.add('active');
            
            safeSetTimeout(() => {
                runBtn.classList.remove('active');
                cursor.style.opacity = '0';
                
                if(fileName) fileName.innerText = 'Initializing...';
                editorBody.innerHTML = `
                    <div class="modern-loader-container">
                        <div class="modern-spinner"></div>
                    </div>
                `;
                
                safeSetTimeout(() => {
                    if(fileName) fileName.innerText = 'Profile Loaded';
                    editorBody.innerHTML = `
                        <div class="profile-image-wrapper fade-in-scale">
                            <img src="assets/images/profile-light.jpg" alt="Profile Output Light" class="profile-output-image profile-img-light" onerror="this.src='https://via.placeholder.com/150';"/>
                            <img src="assets/images/profile-dark.jpg" alt="Profile Output Dark" class="profile-output-image profile-img-dark" onerror="this.src='https://via.placeholder.com/150';"/>
                        </div>
                    `;
                }, 2000);
            }, 200);
        }, 1500);
    }, 500);
}

let codeEditorTyped = false;
function initCodeEditorTyping(container) {
    if (codeEditorTyped) return;
    codeEditorTyped = true;

    const codeElement = container.querySelector('.code-editor-body code');
    if (!codeElement) return;

    const textNodes = [];
    const walk = document.createTreeWalker(codeElement, NodeFilter.SHOW_TEXT, null, false);
    let n;
    while(n = walk.nextNode()) {
        textNodes.push({
            node: n,
            text: n.nodeValue,
            currentLength: 0
        });
        n.nodeValue = ''; 
    }

    let currentNodeIndex = 0;
    codeElement.style.borderRight = '2px solid var(--accent-primary)';

    function typeNextChar() {
        if (currentNodeIndex >= textNodes.length) {
            codeElement.style.borderRight = 'transparent';
            triggerTerminalAnimation(container);
            return; 
        }

        const currentNodeData = textNodes[currentNodeIndex];
        
        if (currentNodeData.currentLength < currentNodeData.text.length) {
            currentNodeData.currentLength++;
            currentNodeData.node.nodeValue = currentNodeData.text.substring(0, currentNodeData.currentLength);
            
            let delay = 15 + Math.random() * 20; 
            const lastChar = currentNodeData.text[currentNodeData.currentLength - 1];
            if (lastChar === '\n') delay += 100;
            
            safeSetTimeout(typeNextChar, delay);
        } else {
            currentNodeIndex++;
            typeNextChar();
        }
    }

    safeSetTimeout(typeNextChar, 500);
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
                
                if (entry.target.classList.contains('hero-visual')) {
                    initCodeEditorTyping(entry.target);
                }
                
                // Stop observing after animation runs once
                observer.unobserve(entry.target);
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
            const container = document.querySelector('.hero-visual');
            const editorBody = document.getElementById('code-editor-body');
            const fileName = container.querySelector('.file-name');
            const cursor = document.getElementById('virtual-cursor');

            clearAllAnimations();
            codeEditorTyped = false;

            if(fileName) fileName.innerText = 'profile.js';
            if(editorBody) editorBody.innerHTML = originalCodeHTML;
            if(cursor) {
                cursor.style.transition = 'none'; // Prevent animation while resetting
                cursor.style.opacity = '0';
                cursor.style.top = '50%';
                cursor.style.left = '50%';
                // Restore transition after reset
                setTimeout(() => { cursor.style.transition = 'top 1.5s cubic-bezier(0.25, 1, 0.5, 1), left 1.5s cubic-bezier(0.25, 1, 0.5, 1)'; }, 50);
            }

            initCodeEditorTyping(container);
        });
    }
}
