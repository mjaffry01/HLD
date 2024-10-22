<script>
        const readBtn = document.getElementById('readBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const stopBtn = document.getElementById('stopBtn');

        // Initialize Speech Synthesis
        const synth = window.speechSynthesis;
        let voices = [];
        let utterances = [];
        let currentUtteranceIndex = 0;
        let isPaused = false;

        // Function to load voices
        function loadVoices() {
            voices = synth.getVoices();
            if (voices.length !== 0) {
                initializeUtterances();
            } else {
                // Retry after a short delay if voices are not loaded yet
                setTimeout(loadVoices, 100);
            }
        }

        loadVoices();

        // Function to initialize utterances
        function initializeUtterances() {
            const sections = Array.from(document.querySelectorAll('.lecture-notes div[id^="question"]'));
            utterances = sections.map((section, index) => {
                const utterance = new SpeechSynthesisUtterance(section.innerText);
                // Set speech parameters
                utterance.rate = 1.2;    // Adjust as needed
                utterance.pitch = 1.0;   // Adjust as needed

                // Select a desired voice
                const desiredVoiceName = 'Google US English'; // Change as needed
                const desiredVoice = voices.find(voice => voice.name === desiredVoiceName);
                utterance.voice = desiredVoice || voices[0]; // Fallback to first available voice

                // Event listener for when the utterance starts
                utterance.onstart = () => {
                    highlightSection(section);
                };

                // Event listener for when the utterance ends
                utterance.onend = () => {
                    removeHighlight(section);
                    currentUtteranceIndex++;
                    // Automatically speak the next utterance
                    if (currentUtteranceIndex < utterances.length) {
                        synth.speak(utterances[currentUtteranceIndex]);
                    }
                };

                return utterance;
            });
        }

        // Function to highlight a section
        function highlightSection(section) {
            // Remove existing highlights
            document.querySelectorAll('.lecture-notes div[id^="question"]').forEach(sec => {
                sec.classList.remove('highlight');
            });
            // Add highlight to the current section
            if (section) {
                section.classList.add('highlight');
                // Scroll the section into view smoothly
                section.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }

        // Function to remove highlight from a section
        function removeHighlight(section) {
            if (section) {
                section.classList.remove('highlight');
            }
        }

        // Read Button Event Listener
        readBtn.addEventListener('click', () => {
            if (synth.speaking && !isPaused) {
                console.error('speechSynthesis.speaking');
                return;
            }

            if (isPaused) {
                synth.resume();
                isPaused = false;
                return;
            }

            if (utterances.length === 0) {
                initializeUtterances();
            }

            if (currentUtteranceIndex < utterances.length) {
                synth.speak(utterances[currentUtteranceIndex]);
            }
        });

        // Pause Button Event Listener
        pauseBtn.addEventListener('click', () => {
            if (synth.speaking && !synth.paused) {
                synth.pause();
                isPaused = true;
            }
        });

        // Stop Button Event Listener
        stopBtn.addEventListener('click', () => {
            if (synth.speaking) {
                synth.cancel();
                removeHighlight(document.querySelectorAll('.lecture-notes div[id^="question"]')[currentUtteranceIndex]);
                currentUtteranceIndex = 0;
                isPaused = false;
            }
        });

        // Reload utterances when voices change (for some browsers)
        window.speechSynthesis.onvoiceschanged = () => {
            voices = synth.getVoices();
            initializeUtterances();
        };
    </script>