import { icons } from '../assets/icons.js';
import { dictionaryService } from './dictionary.js';

// Drawer and Theme Management Module
document.addEventListener('DOMContentLoaded', () => {
    // Icon insertion
    const insertIcons = () => {
        const iconElements = document.querySelectorAll('[data-icon]');
        iconElements.forEach(element => {
            const iconName = element.getAttribute('data-icon');
            if (icons[iconName]) {
                element.innerHTML = icons[iconName];
            }
        });
    };
    insertIcons();

    // Drawer functionality
    const drawerToggle = document.getElementById('drawer-toggle');
    const drawerButtons = document.querySelectorAll('[data-drawer]');
    const favoritesContent = document.getElementById('favorites-content-wrapper');
    const themesContent = document.getElementById('themes-content-wrapper');

    // Ensure initial state
    if (favoritesContent) favoritesContent.style.display = 'none';
    if (themesContent) themesContent.style.display = 'none';

    // Function to open specific drawer
    const openDrawer = (drawerName) => {
        // Hide all drawer contents first
        if (favoritesContent) favoritesContent.style.display = 'none';
        if (themesContent) themesContent.style.display = 'none';

        // Show specific drawer content
        let drawerContent;
        switch(drawerName) {
            case 'favorites':
                drawerContent = favoritesContent;
                break;
            case 'themes':
                drawerContent = themesContent;
                break;
            default:
                console.error('Unknown drawer:', drawerName);
                return;
        }

        if (drawerContent) {
            drawerContent.style.display = 'block';
            
            // Ensure drawer is checked/opened
            if (drawerToggle) {
                drawerToggle.checked = true;
            }
        }
    };

    // Add click event to drawer buttons
    drawerButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const drawerName = button.getAttribute('data-drawer');
            openDrawer(drawerName);
        });
    });

    // Handle drawer toggle change
    if (drawerToggle) {
        drawerToggle.addEventListener('change', (event) => {
            if (!event.target.checked) {
                // When drawer is closed, hide all contents
                if (favoritesContent) favoritesContent.style.display = 'none';
                if (themesContent) themesContent.style.display = 'none';
            }
        });
    }

    // Theme functionality
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    const themeButtons = document.querySelectorAll('[data-theme]');
    themeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const theme = button.getAttribute('data-theme');
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
        });
    });

    // Search functionality
    const searchInput = document.querySelector('.search-input');
    const removeIcon = document.querySelector('[data-icon="remove"]');

    if (searchInput && removeIcon) {
        // Make searchWord available globally for synonym clicks
        window.searchWord = async (word) => {
            if (!word) return;
            searchInput.value = word;
            const results = await dictionaryService.searchWord(word);
            dictionaryService.processResults(word, results);
        };

        // Handle search input
        searchInput.addEventListener('keyup', async (e) => {
            const word = e.target.value.trim();
            removeIcon.style.display = word.length ? 'block' : 'none';

            if (e.key === 'Enter' && word) {
                const searchSection = document.querySelector('#search-section');
                if (searchSection) {
                    searchSection.classList.remove('active');
                }
                await window.searchWord(word);
            }
        });

        // Handle remove icon click
        removeIcon.addEventListener('click', () => {
            dictionaryService.clearSearch();
            removeIcon.style.display = 'none';
        });
    }
});