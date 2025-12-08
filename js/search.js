// Simple client-side search functionality
let searchIndex = [];

// Initialize search
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');

    if (!searchInput) return;

    // Build search index from the page
    buildSearchIndex();

    // Handle search input
    searchInput.addEventListener('input', function(e) {
        const query = e.target.value.trim().toLowerCase();

        if (query.length < 2) {
            searchResults.classList.remove('active');
            searchResults.innerHTML = '';
            return;
        }

        const results = searchPosts(query);
        displayResults(results);
    });

    // Close search results when clicking outside
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.classList.remove('active');
        }
    });
});

function buildSearchIndex() {
    // This is a simplified version. In production, you'd use Hugo's
    // JSON output to build a proper search index
    const posts = document.querySelectorAll('.post-card, .post-item');

    posts.forEach(post => {
        const link = post.querySelector('h2 a, h3 a');
        const summary = post.querySelector('.post-summary');
        const tags = Array.from(post.querySelectorAll('.tag')).map(tag => tag.textContent);

        if (link) {
            searchIndex.push({
                title: link.textContent,
                url: link.href,
                summary: summary ? summary.textContent : '',
                tags: tags
            });
        }
    });
}

function searchPosts(query) {
    return searchIndex.filter(post => {
        return post.title.toLowerCase().includes(query) ||
               post.summary.toLowerCase().includes(query) ||
               post.tags.some(tag => tag.toLowerCase().includes(query));
    }).slice(0, 5); // Limit to 5 results
}

function displayResults(results) {
    const searchResults = document.getElementById('search-results');

    if (results.length === 0) {
        searchResults.innerHTML = '<div style="padding: 1rem; color: var(--text-secondary);">No results found</div>';
        searchResults.classList.add('active');
        return;
    }

    const html = results.map(result => `
        <a href="${result.url}" style="display: block; padding: 1rem; border-bottom: 1px solid var(--border-color); text-decoration: none; color: var(--text-primary); transition: background 0.3s;">
            <div style="font-weight: 600; margin-bottom: 0.25rem; color: var(--accent-cyan);">${result.title}</div>
            <div style="font-size: 0.875rem; color: var(--text-secondary);">${result.summary.substring(0, 100)}...</div>
        </a>
    `).join('');

    searchResults.innerHTML = html;
    searchResults.classList.add('active');

    // Add hover effects
    const links = searchResults.querySelectorAll('a');
    links.forEach(link => {
        link.addEventListener('mouseenter', function() {
            this.style.background = 'var(--bg-tertiary)';
        });
        link.addEventListener('mouseleave', function() {
            this.style.background = 'transparent';
        });
    });
}
