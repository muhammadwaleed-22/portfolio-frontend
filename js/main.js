// main.js - Application entry point
import { initNavigation } from './navigation.js';
import { initAnimations } from './animations.js';
import { initThemeToggle } from './theme.js';
import { initProjects } from './projects.js';
import { initChatbot } from './chatbot.js';
import { initContactForm } from './contact.js';

document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initNavigation();
    initAnimations();
    initProjects();
    initChatbot();
    initContactForm();
    
    // Set current year in footer
    const yearEl = document.getElementById('current-year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }
});
