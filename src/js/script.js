import { icons } from '../assets/icons.js';
import { dictionaryService } from './dictionary.js';

// Function to insert icons into elements with data-icon attribute
function insertIcons() {
    const iconElements = document.querySelectorAll('[data-icon]');
    iconElements.forEach(element => {
        const iconName = element.getAttribute('data-icon');
        if (icons[iconName]) {
            element.innerHTML = icons[iconName];
        }
    });
}

// Initialize search functionality
window.addEventListener('DOMContentLoaded', () => {
    // Insert icons first
    insertIcons();

    const searchInput = document.querySelector('.search-input');
    const removeIcon = document.querySelector('[data-icon="remove"]');

    if (!searchInput || !removeIcon) {
        console.error('Required elements not found');
        return;
    }

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
            // Reset search section only when performing a new search
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
});