// Initialize global variables
window.preloadedAudio = window.preloadedAudio || {};
window.preloadingComplete = window.preloadingComplete || false;

if (!window.preloadingComplete) {
    const audioFiles = [
        "static/audio/track1.mp3",
        "static/audio/track2.mp3",
        "static/audio/track3.mp3",
        "static/audio/track4.mp3",
        "static/audio/track5.mp3",
        "static/audio/track6.mp3",
        "static/audio/background1.mp3"
    ];

    let loadedCount = 0;

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
                    // Mark the file as failed to load
                    window.preloadedAudio[file] = null;
                    checkIfAllFilesLoaded();
                }
            }).toDestination();
        } else {
            // If already preloaded, increment loadedCount
            loadedCount++;
            checkIfAllFilesLoaded();
        }
    });

    function checkIfAllFilesLoaded() {
        if (loadedCount === audioFiles.length) {
            window.preloadingComplete = true; // mark as complete
            console.log("all files have been attempted to preload.");
        }
    }
}
