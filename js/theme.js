export function initThemeToggle() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (!themeToggleBtn) return;

    // Set initial ARIA state
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    themeToggleBtn.setAttribute('aria-checked', currentTheme === 'dark' ? 'true' : 'false');

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('portfolio-theme', newTheme);
        themeToggleBtn.setAttribute('aria-checked', newTheme === 'dark' ? 'true' : 'false');
    });
}
