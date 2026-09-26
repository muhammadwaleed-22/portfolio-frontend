// frontend/js/contact.js
export function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const nameInput = document.getElementById('contact-name');
    const emailInput = document.getElementById('contact-email');
    const subjectInput = document.getElementById('contact-subject');
    const messageInput = document.getElementById('contact-message');
    const websiteInput = document.getElementById('contact-website'); // honeypot
    
    const submitBtn = document.getElementById('contact-submit');
    const statusDiv = document.getElementById('contact-status');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Reset state
        clearErrors();
        statusDiv.className = 'form-status';
        statusDiv.textContent = '';
        
        // Frontend Validation
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const subject = subjectInput.value.trim();
        const message = messageInput.value.trim();
        const website = websiteInput.value.trim();

        let isValid = true;

        if (name.length < 2 || name.length > 100) {
            showError('contact-name', 'Name must be between 2 and 100 characters.');
            isValid = false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email) || email.length > 254) {
            showError('contact-email', 'Please enter a valid email address.');
            isValid = false;
        }

        if (subject.length < 3 || subject.length > 150) {
            showError('contact-subject', 'Subject must be between 3 and 150 characters.');
            isValid = false;
        }

        if (message.length < 10 || message.length > 3000) {
            showError('contact-message', 'Message must be between 10 and 3000 characters.');
            isValid = false;
        }

        if (!isValid) return;

        // Honeypot check
        if (website !== '') {
            // Silently act like it succeeded to fool bots
            showSuccess('Message sent successfully.');
            return;
        }

        // Prepare request
        setLoading(true);

        const payload = {
            name,
            email,
            subject,
            message
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

        const API_BASE = 'https://portfolio-backend-sigma-blush.vercel.app/api';

        try {
            const response = await fetch(`${API_BASE}/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            const result = await response.json();

            if (response.ok && result.success) {
                showSuccess('Message sent successfully.');
            } else if (response.status === 429) {
                showErrorGeneral('You are sending messages too quickly. Please try again later.');
            } else {
                const errorMsg = result.error?.message || 'Unable to send your message right now. Please try again.';
                showErrorGeneral(errorMsg);
            }
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                showErrorGeneral('Request timed out. Please try again.');
            } else {
                showErrorGeneral('Unable to connect to the server. Please try again later.');
            }
        } finally {
            setLoading(false);
        }
    });

    function showError(inputId, message) {
        const input = document.getElementById(inputId);
        const errorSpan = document.getElementById(inputId.replace('contact-', 'error-'));
        
        input.setAttribute('aria-invalid', 'true');
        errorSpan.textContent = message;
    }

    function clearErrors() {
        const inputs = form.querySelectorAll('input, textarea');
        const errors = form.querySelectorAll('.form-error');
        
        inputs.forEach(input => input.removeAttribute('aria-invalid'));
        errors.forEach(error => error.textContent = '');
    }

    function showErrorGeneral(message) {
        statusDiv.className = 'form-status error';
        statusDiv.textContent = message;
    }

    function showSuccess(message) {
        // Accessibility hidden message
        statusDiv.textContent = message;
        
        // Trigger paper plane animation
        form.classList.add('sending-success');
        
        setTimeout(() => {
            form.reset();
            form.classList.remove('sending-success');
            // We do NOT clear statusDiv.textContent immediately to ensure screen readers read it
            setTimeout(() => {
                statusDiv.textContent = '';
            }, 3000);
        }, 2500); // Reset after 2.5s (allows animation to finish)
    }

    function setLoading(isLoading) {
        const btnText = submitBtn.querySelector('.btn-text');
        if (isLoading) {
            submitBtn.disabled = true;
            btnText.textContent = 'Sending...';
        } else {
            submitBtn.disabled = false;
            btnText.textContent = 'Send Message';
        }
    }
}

// Initialization now handled centrally by main.js
