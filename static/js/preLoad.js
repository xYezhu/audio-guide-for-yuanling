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
            // Preload using Tone.Player
            const player = new Tone.Player({
                url: file,
                autostart: false,
                loop: file.includes('background'),
                onload: () => {
                    loadedCount++;
                    if (loadedCount === audioFiles.length) {
                        window.preloadingComplete = true; // Mark as complete
                        console.log("All files preloaded.");
                    }
                },
                onerror: (error) => {
                    console.error(`Error loading ${file}:`, error);
                }
            }).toDestination();

            window.preloadedAudio[file] = player;
        }
    });
}
