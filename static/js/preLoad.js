window.preloadedAudio = {}; // make it globally accessible
window.preloadingComplete = false;  // flag for preloading status

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
];

// function to preload the audio files using Tone.js
function preloadAudio() {
    let loadedCount = 0;
    audioFiles.forEach(file => {
        const player = new Tone.Player({
            url: file,
            autostart: false,
            onload: () => {
                console.log(`${file} preloaded.`);
                loadedCount++;
                if (loadedCount === audioFiles.length) {
                    window.preloadingComplete = true; // set flag to true when all files are loaded
                    console.log("All audio files preloaded.");
                }
            },
            onerror: (error) => {
                console.error(`Error preloading ${file}:`, error);
            }
        }).toDestination();

        window.preloadedAudio[file] = player; // store in global object
    });
}

// call preloadAudio on page load
document.addEventListener('DOMContentLoaded', function () {
    preloadAudio();
});
