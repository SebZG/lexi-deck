class DictionaryService {
    constructor() {
        // Search elements
        this.searchWrapper = document.querySelector('.search-wrapper');
        this.searchInput = document.querySelector('.search-input');
        this.infoText = document.querySelector('.info-text');
        this.removeIcon = document.querySelector('[data-icon="remove"]');

        // Word display elements
        this.wordDisplay = document.querySelector('.word .details p');
        this.phoneticDisplay = document.querySelector('.word .details span');
        this.meaningDisplay = document.querySelector('.meaning .details span');
        this.exampleDisplay = document.querySelector('.example .details span');
        this.synonymsList = document.querySelector('.synonyms .list');
        this.volumeIcon = document.querySelector('[data-icon="volume-low"]');
        this.favoriteIcon = document.querySelector('[data-icon="heart"]');

        // Audio
        this.audio = null;

        // Setup volume icon click handler if it exists
        if (this.volumeIcon) {
            this.volumeIcon.addEventListener('click', () => this.playAudio());
        }
    }

    async searchWord(word) {
        try {
            const [dictionary, thesaurus] = await Promise.all([
                this.fetchDictionary(word),
                this.fetchThesaurus(word)
            ]);

            return { dictionary, thesaurus };
        } catch (error) {
            this.handleError(error);
            return { dictionary: null, thesaurus: null };
        }
    }

    async fetchDictionary(word) {
        const response = await fetch(`https://www.dictionaryapi.com/api/v3/references/collegiate/json/${word}?key=7231d9e2-9d1b-42d1-beac-3804de70ea2e`);
        return response.json();
    }

    async fetchThesaurus(word) {
        const response = await fetch(`https://www.dictionaryapi.com/api/v3/references/thesaurus/json/${word}?key=0fb8d643-545e-48b1-b02f-f3f17791173d`);
        return response.json();
    }

    processResults(word, { dictionary, thesaurus }) {
        // Reset UI state
        const searchSection = document.querySelector('#search-section');
        if (searchSection) {
            searchSection.classList.remove('active');
        }

        if (!Array.isArray(dictionary) || dictionary.length === 0) {
            // Ensure info text is visible when no results
            if (this.infoText) {
                this.infoText.style.display = 'block';
            }
            this.handleNoResults(dictionary, word);
            return;
        }

        const dictResult = dictionary[0];

        if (typeof dictResult === 'string') {
            // Ensure info text is visible when no results
            if (this.infoText) {
                this.infoText.style.display = 'block';
            }
            this.handleNoResults(dictionary, word);
            return;
        }

        // Update UI state
        if (searchSection) {
            searchSection.classList.add('active');
        }

        if (this.infoText) {
            this.infoText.style.display = 'none';
        }

        // Update word display
        this.updateWordDisplay(word, dictResult);

        // Setup audio
        this.setupAudio(dictResult);

        // Get and display meaning
        const meaning = dictResult.shortdef?.[0] || this.extractMeaningFromDef(dictResult);
        if (this.meaningDisplay) {
            this.meaningDisplay.innerText = meaning || "No definition available";
        }

        // Get and display example
        const example = this.extractExample(dictResult);
        if (this.exampleDisplay) {
            this.exampleDisplay.innerText = example || "No example available";
        }

        // Process synonyms
        if (Array.isArray(thesaurus) && thesaurus.length > 0) {
            this.processSynonyms(thesaurus[0]);
        } else {
            if (this.synonymsList) {
                this.synonymsList.innerHTML = 'No synonyms available';
            }
        }
    }

    updateWordDisplay(word, dictResult) {
        if (this.wordDisplay) {
            this.wordDisplay.innerText = word;
        }

        if (this.phoneticDisplay) {
            const phonetic = this.extractPhonetic(dictResult);
            this.phoneticDisplay.innerText = phonetic || '';
        }
    }

    extractPhonetic(dictResult) {
        if (!dictResult?.hwi?.prs?.[0]) return null;
        const { fl, hwi: { prs } } = dictResult;
        return `${fl || ''} /${prs[0].mw}/`;
    }

    extractMeaningFromDef(dictResult) {
        if (!dictResult?.def?.[0]?.sseq?.[0]?.[0]?.[1]) return null;

        // Extract text and remove markup tags
        let meaning = dictResult.def[0].sseq[0][0][1].dt[0][1];
        return this.cleanText(meaning);
    }

    extractExample(dictResult) {
        if (!dictResult?.def?.[0]?.sseq?.[0]?.[0]?.[1]?.dt) return null;

        const dt = dictResult.def[0].sseq[0][0][1].dt;
        const exampleEntry = dt.find(d => d[0] === 'vis');

        if (exampleEntry) {
            let example = exampleEntry[1][0].t;
            return this.cleanText(example);
        }

        return null;
    }

    setupAudio(dictResult) {
        // Reset previous audio
        this.audio = null;

        // Hide volume icon by default
        if (this.volumeIcon) {
            this.volumeIcon.style.display = 'none';
        }

        // Check for audio availability
        if (!dictResult?.hwi?.prs?.[0]?.sound?.audio) return;

        const soundName = dictResult.hwi.prs[0].sound.audio;
        const subdirectory = this.getSubdirectory(soundName);
        const audioUrl = `https://media.merriam-webster.com/audio/prons/en/us/mp3/${subdirectory}/${soundName}.mp3`;

        // Create new audio object
        this.audio = new Audio(audioUrl);

        // Show volume icon if audio is available
        if (this.volumeIcon) {
            this.volumeIcon.style.display = 'block';
        }
    }

    playAudio() {
        if (this.audio) {
            try {
                this.audio.play();

                // Visual feedback for audio play
                if (this.volumeIcon) {
                    const volumeContainer = this.volumeIcon.closest('.volume-container');
                    if (volumeContainer) {
                        const volumeLowIcon = volumeContainer.querySelector('[data-icon="volume-low"]');
                        const volumeHighIcon = volumeContainer.querySelector('[data-icon="volume-high"]');

                        if (volumeLowIcon && volumeHighIcon) {
                            volumeLowIcon.style.display = 'none';
                            volumeHighIcon.style.display = 'block';
                            volumeHighIcon.classList.add('transform', 'scale-125', 'text-info');
                        }

                        // Reset after audio finishes
                        this.audio.onended = () => {
                            if (volumeLowIcon && volumeHighIcon) {
                                volumeHighIcon.style.display = 'none';
                                volumeHighIcon.classList.remove('transform', 'scale-125', 'text-info');
                                volumeLowIcon.style.display = 'block';
                            }
                        };
                    }
                }
            } catch (error) {
                console.error('Error playing audio:', error);
            }
        }
    }

    getSubdirectory(soundName) {
        if (soundName.startsWith('bix')) return 'bix';
        if (soundName.startsWith('gg')) return 'gg';
        if (/^\d/.test(soundName)) return 'number';
        return soundName[0];
    }

    toggleFavorite() {
        if (this.favoriteIcon) {
            this.favoriteIcon.classList.toggle('active');
        }
    }

    processSynonyms(thesaurusResult) {
        if (!this.synonymsList) return;

        // Get the parent section to hide/show
        const synonymSection = this.synonymsList.closest('.synonyms');

        // Hide synonyms section by default
        if (synonymSection) {
            synonymSection.style.display = 'none';
        }

        let allSynonyms = new Set();

        // Get synonyms from thesaurus
        if (thesaurusResult) {
            // Get synonyms from meta.syns
            if (thesaurusResult.meta?.syns) {
                thesaurusResult.meta.syns.forEach(synArray => {
                    synArray.forEach(syn => {
                        if (syn && syn.trim()) {
                            allSynonyms.add(syn);
                        }
                    });
                });
            }

            // Get synonyms from def[].sseq[].sense.syns
            if (thesaurusResult.def) {
                thesaurusResult.def.forEach(def => {
                    if (def.sseq) {
                        def.sseq.forEach(sseq => {
                            sseq.forEach(sense => {
                                if (sense[1]?.syns) {
                                    sense[1].syns.forEach(synArray => {
                                        synArray.forEach(syn => {
                                            if (syn && syn.trim()) {
                                                allSynonyms.add(syn);
                                            }
                                        });
                                    });
                                }
                            });
                        });
                    }
                });
            }
        }

        // Convert to array and limit to 5 synonyms
        const synonymArray = Array.from(allSynonyms).slice(0, 5);

        // Clear existing content
        this.synonymsList.innerHTML = '';

        if (synonymArray.length === 0) {
            // No synonyms found
            this.synonymsList.innerHTML = 'No synonyms available';
        } else {
            // Show synonyms section
            if (synonymSection) {
                synonymSection.style.display = 'block';
            }

            // Create clickable spans for each synonym
            synonymArray.forEach((synonym, index) => {
                // Add comma for all but the last synonym
                const synonymSpan = document.createElement('span');
                synonymSpan.textContent = synonym + (index < synonymArray.length - 1 ? ', ' : '');
                synonymSpan.onclick = () => window.searchWord(synonym);

                this.synonymsList.appendChild(synonymSpan);
            });
        }
    }

    handleNoResults(dictionary, word) {
        // Clear previous content
        this.infoText.innerHTML = '';

        // Check if dictionary contains suggestions
        if (dictionary && dictionary.length > 0) {
            const suggestionText = document.createElement('p');
            suggestionText.innerHTML = `No results for "<strong>${word}</strong>". Did you mean: `;

            dictionary.slice(0, 5).forEach((suggestion, index) => {
                // Add comma for all but the last suggestion
                const suggestionSpan = document.createElement('span');
                suggestionSpan.textContent = suggestion + (index < dictionary.slice(0, 5).length - 1 ? ', ' : '');
                suggestionSpan.classList.add('suggestion-word');
                suggestionSpan.onclick = () => window.searchWord(suggestion);

                suggestionText.appendChild(suggestionSpan);
            });

            this.infoText.appendChild(suggestionText);
        } else {
            // No suggestions available
            this.infoText.innerHTML = `No results found for "<strong>${word}</strong>"`;
        }
    }

    handleError() {
        this.infoText.innerHTML = "An error occurred while fetching the data. Please try again.";
    }

    clearSearch() {
        // Clear input and reset focus
        this.searchInput.value = "";
        this.searchInput.focus();

        // Reset search section state
        const searchSection = document.querySelector('#search-section');
        if (searchSection) {
            searchSection.classList.remove('active');
        }

        // Reset info text
        if (this.infoText) {
            this.infoText.style.display = 'block';
            this.infoText.innerHTML = "Search for any existing English word and get its meaning, synonyms, and pronunciation.";
        }
    }

    cleanText(text) {
        // Remove markup tags like {wi}, {/wi}, {it}, {/it}, etc.
        return text.replace(/\{[^}]+\}/g, '').trim();
    }
}

export { DictionaryService };
export const dictionaryService = new DictionaryService();