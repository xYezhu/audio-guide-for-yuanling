// initialize global variables
window.preloadedAudio = window.preloadedAudio || {};
window.preloadingComplete = window.preloadingComplete || false;

function startPreloading() {
    if (!window.preloadingComplete) {
        const audioFiles = [
            "static/audio/track1.mp3",
            "static/audio/track2.mp3",
            "static/audio/track3.mp3",
            "static/audio/track4.mp3",
            "static/audio/track5.mp3",
            "static/audio/track6.mp3",
            "static/audio/background1.mp3",
            "static/audio/background2.mp3",
            "static/audio/background3.mp3",
            "static/audio/background4.mp3"
            // add more below...

        ];

        let loadedCount = 0;
        let totalFiles = audioFiles.length;

        // change button text to indicate loading
        const preloadButton = document.getElementById('preloadIcon');
        if (preloadButton) {
            preloadButton.disabled = true; // disable the button to prevent multiple clicks
            preloadButton.innerText = 'preloading...';
        }

        audioFiles.forEach(file => {
            if (!window.preloadedAudio[file]) {
                // preload using Tone.Player
                const player = new Tone.Player({
                    url: file,
                    autostart: false,
                    loop: file.includes('background'),
                    onload: () => {
                        loadedCount++;
                        console.log(`Loaded ${file}`);
                        window.preloadedAudio[file] = player;
                        checkIfAllFilesLoaded();
                    },
                    onerror: (error) => {
                        loadedCount++;
                        console.error(`Error loading ${file}:`, error);
                        // mark the file as failed to load
                        window.preloadedAudio[file] = null;
                        checkIfAllFilesLoaded();
                    }
                }).toDestination();
            } else {
                // if already preloaded, increment loadedCount
                loadedCount++;
                checkIfAllFilesLoaded();
            }
        });

        function checkIfAllFilesLoaded() {
            // update user feedback with progress
            if (preloadButton) {
                preloadButton.innerText = `preloading... (${loadedCount}/${totalFiles})`;
            }

            if (loadedCount === totalFiles) {
                window.preloadingComplete = true; // mark as complete
                console.log("all files have been preloaded.");

                // update the button to indicate completion
                if (preloadButton) {
                    preloadButton.innerText = 'preloading complete';
                    preloadButton.disabled = true;
                }
            }
        }
    }
}

// attach event listener to preload button
document.addEventListener('DOMContentLoaded', function () {
    const preloadButton = document.getElementById('preloadIcon');
    if (preloadButton) {
        preloadButton.addEventListener('click', startPreloading);
    } else {
        console.error("preload button not found.");
    }
});
