// Function to insert icons into elements with data-icon attribute
export function insertIcons() {
    const iconElements = document.querySelectorAll('[data-icon]');
    iconElements.forEach(element => {
        const iconName = element.getAttribute('data-icon');
        if (icons && icons[iconName]) {
            element.innerHTML = icons[iconName];
        }
    });
}

// Function to handle theme switching
export function initializeTheme() {
    // Get saved theme from localStorage or default to 'light'
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Add click handlers to theme buttons
    const themeButtons = document.querySelectorAll('[data-theme]');
    themeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const theme = button.getAttribute('data-theme');
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
        });
    });
}

// Function to handle drawer content visibility
export function initializeDrawer() {
    const drawerButtons = document.querySelectorAll('[data-drawer]');
    const drawerContents = {
        favorites: document.getElementById('favorites-content-wrapper'),
        themes: document.getElementById('themes-content-wrapper')
    };
    const drawerToggle = document.getElementById('drawer-toggle');

    // Hide all drawer contents initially
    Object.values(drawerContents).forEach(content => {
        if (content) content.style.display = 'none';
    });

    // Handle drawer button clicks
    drawerButtons.forEach(button => {
        button.addEventListener('click', () => {
            const drawerType = button.getAttribute('data-drawer');

            // Hide all drawer contents first
            Object.values(drawerContents).forEach(content => {
                if (content) content.style.display = 'none';
            });

            // Show the selected drawer content
            const selectedContent = drawerContents[drawerType];
            if (selectedContent) {
                selectedContent.style.display = 'block';
            }
        });
    });

    // Hide drawer contents when drawer is closed
    drawerToggle.addEventListener('change', () => {
        if (!drawerToggle.checked) {
            Object.values(drawerContents).forEach(content => {
                if (content) content.style.display = 'none';
            });
        }
    });
}

// Run when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    insertIcons();
    initializeDrawer();
    initializeTheme();
});