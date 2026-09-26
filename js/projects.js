// frontend/js/projects.js
export function initProjects() {
    const projectsGrid = document.querySelector('.projects-grid');
    if (!projectsGrid) return;

    const API_BASE = 'https://portfolio-backend-sigma-blush.vercel.app/api';

    async function fetchProjects() {
        try {
            const response = await fetch(`${API_BASE}/projects`);
            if (!response.ok) throw new Error('Failed to fetch projects');
            
            const result = await response.json();
            if (result.success && result.projects && result.projects.length > 0) {
                renderProjects(result.projects);
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    }

    function renderProjects(projects) {
        // Find if there is a "Other Notable Projects" section, we will append these dynamically
        // Or we can just append them to the main projects-grid
        
        projects.forEach((project, index) => {
            const delay = (index % 5) * 100 + 100; // staggered animation delay
            
            // Format stacks
            const stacksHtml = project.stacks 
                ? project.stacks.split(',').map(s => `<li>${s.trim()}</li>`).join('') 
                : '';
                
            const article = document.createElement('article');
            // Adding 'is-visible' directly since these are loaded asynchronously 
            // after the initial IntersectionObserver has run
            article.className = `project-card card card-hover reveal-up is-visible delay-${delay}`;
            
            const imageLinkStart = project.link ? `<a href="${project.link}" target="_blank" rel="noopener noreferrer">` : '';
            const imageLinkEnd = project.link ? `</a>` : '';
            
            article.innerHTML = `
                <div class="project-media">
                    ${imageLinkStart}
                    <img src="${project.picture || 'assets/images/placeholder.webp'}" alt="${project.name}" class="project-img" loading="lazy" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMzMzMiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZmlsbD0iIzk5OSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTZweCIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+'">
                    ${imageLinkEnd}
                </div>
                <div class="project-content">
                    <span class="project-type">Dynamic Project</span>
                    <h3 class="project-title">
                        ${project.link ? `<a href="${project.link}" target="_blank" rel="noopener noreferrer" style="color:inherit;text-decoration:none;">${project.name}</a>` : project.name}
                    </h3>
                    <p class="project-description body-text">${project.description}</p>
                    <ul class="project-tech">
                        ${stacksHtml}
                    </ul>
                    ${project.link ? `
                    <div class="project-links" style="margin-top: 15px;">
                        <a href="${project.link}" target="_blank" rel="noopener noreferrer" class="btn btn-sm" style="color: var(--accent); font-weight: 500; font-size: 0.9rem;">
                            View Project <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-bottom: 2px;"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                        </a>
                    </div>
                    ` : ''}
                </div>
            `;
            
            projectsGrid.appendChild(article);
        });
    }

    fetchProjects();
}

// Initialization now handled centrally by main.js
