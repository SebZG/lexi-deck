/** @jest-environment jsdom */
import { describe, beforeEach, afterEach, expect, test } from '@jest/globals';
import { initializeTheme, initializeDrawer, insertIcons } from './script.js';

describe("Theme Management", () => {
    beforeEach(() => {
        // Setup DOM elements
        document.body.innerHTML = `
            <button data-theme="light">Light</button>
            <button data-theme="dark">Dark</button>
        `;
        // Clear localStorage before each test
        localStorage.clear();
    });

    afterEach(() => {
        // Clean up
        localStorage.clear();
        document.body.innerHTML = '';
    });

    test("Should initialize with light theme when no theme is saved", () => {
        initializeTheme();
        expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    });

    test("Should load saved theme from localStorage", () => {
        localStorage.setItem("theme", "dark");
        initializeTheme();
        expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    });

    test('should change theme when theme button is clicked', () => {
        initializeTheme();
        const darkButton = document.querySelector('[data-theme="dark"]');
        darkButton.click();
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
        expect(localStorage.getItem('theme')).toBe('dark');
    });
});

describe("Drawer Functionality", () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <button data-drawer="favorites">Favorites</button>
            <button data-drawer="themes">Themes</button>
            <button data-drawer="nonexistent">Missing</button>
            <input type="checkbox" id="drawer-toggle" />
            <div id="favorites-content-wrapper"></div>
            <div id="themes-content-wrapper"></div>
        `;
    });


    afterEach(() => {
        document.body.innerHTML = '';
    });

    test('should hide drawer contents when drawer toggle is unchecked', () => {
        initializeDrawer();
        const drawerToggle = document.getElementById('drawer-toggle');
        const favoritesContent = document.getElementById('favorites-content-wrapper');
        const themesContent = document.getElementById('themes-content-wrapper');

        // First show some content
        const favoritesButton = document.querySelector('[data-drawer="favorites"]');
        favoritesButton.click();
        expect(favoritesContent.style.display).not.toBe('none');

        // Simulate unchecking the drawer toggle
        drawerToggle.checked = false;
        drawerToggle.dispatchEvent(new Event('change'));

        // Verify contents are hidden
        expect(favoritesContent.style.display).toBe('none');
        expect(themesContent.style.display).toBe('none');
    });

    test('should handle null drawer content elements', () => {
        // Remove content elements from DOM
        const favoritesContent = document.getElementById('favorites-content-wrapper');
        const themesContent = document.getElementById('themes-content-wrapper');
        favoritesContent.remove();
        themesContent.remove();

        // Initialize drawer with missing content elements
        initializeDrawer();
        const drawerToggle = document.getElementById('drawer-toggle');
        const favoritesButton = document.querySelector('[data-drawer="favorites"]');

        // Test clicking button with null content
        favoritesButton.click();

        // Test toggle with null content
        drawerToggle.checked = false;
        drawerToggle.dispatchEvent(new Event('change'));

        // If we got here without errors, the test passes
        expect(true).toBe(true);
    });

    test('should not hide contents when drawer toggle is checked', () => {
        initializeDrawer();
        const drawerToggle = document.getElementById('drawer-toggle');
        const favoritesContent = document.getElementById('favorites-content-wrapper');
        const favoritesButton = document.querySelector('[data-drawer="favorites"]');

        // Show content first
        favoritesButton.click();
        expect(favoritesContent.style.display).toBe('block');

        // Test toggle when checked (should not hide content)
        drawerToggle.checked = true;
        drawerToggle.dispatchEvent(new Event('change'));
        expect(favoritesContent.style.display).toBe('block');
    });
});

describe("Icon Insertion", () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div data-icon="search"></div>
            <div data-icon="theme"></div>
            <div data-icon="nonexistent"></div>
        `;
        global.icons = {
            search: '<svg>search-icon</svg>',
            theme: '<svg>theme-icon</svg>'
        };
    });

    afterEach(() => {
        document.body.innerHTML = '';
        delete global.icons;
    });

    test('should insert icons into elements with data-icon attribute', () => {
        insertIcons();
        const searchIcon = document.querySelector('[data-icon="search"]');
        const themeIcon = document.querySelector('[data-icon="theme"]');
        const nonexistentIcon = document.querySelector('[data-icon="nonexistent"]');

        expect(searchIcon.innerHTML).toBe('<svg>search-icon</svg>');
        expect(themeIcon.innerHTML).toBe('<svg>theme-icon</svg>');
        expect(nonexistentIcon.innerHTML).toBe('');
    });
});


describe("DOM Content Loaded", () => {
    beforeEach(() => {
        // Clear localStorage
        localStorage.clear();

        document.body.innerHTML = `
            <div data-icon="search"></div>
            <button data-theme="light">Light</button>
            <button data-drawer="favorites">Favorites</button>
            <input type="checkbox" id="drawer-toggle" />
            <div id="favorites-content-wrapper"></div>
        `;
        global.icons = {
            search: '<svg>search-icon</svg>'
        };
    });

    afterEach(() => {
        document.body.innerHTML = '';
        localStorage.clear();
        delete global.icons;
    });

    test('should initialize all functionality when DOM is loaded', () => {
        // Simulate DOMContentLoaded
        document.dispatchEvent(new Event('DOMContentLoaded'));

        // Check if icons were inserted
        const searchIcon = document.querySelector('[data-icon="search"]');
        expect(searchIcon.innerHTML).toBe('<svg>search-icon</svg>');

        // Check if theme was initialized (should be light by default)
        expect(document.documentElement.getAttribute('data-theme')).toBe('light');

        // Check if drawer was initialized
        const favoritesContent = document.getElementById('favorites-content-wrapper');
        expect(favoritesContent.style.display).toBe('none');
    });
});