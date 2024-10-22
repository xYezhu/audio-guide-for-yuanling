// playFiles1.js

document.addEventListener('DOMContentLoaded', function () {
    let playButton = document.getElementById('playButton');
    if (playButton) {
        playButton.addEventListener('click', togglePlayback);
    } 
});

window.audioContextStarted = window.audioContextStarted || false;
let currentTrack = null;
// You can adjust fadeInDuration and fadeOutDuration as needed
let fadeInDuration = 2000; // Fade-in time in milliseconds
let fadeOutDuration = 2000; // Fade-out time in milliseconds
let isPlaying = false;

async function userInteracted() {
    if (!window.audioContextStarted) {
        try {
            await Tone.start();
            window.audioContextStarted = true;
            console.log('Audio context started.');
        } catch (error) {
            console.error('Failed to start audio context:', error);
        }
    } else {
        console.log('Audio context already started.');
    }
}

async function togglePlayback() {
    let playButton = document.getElementById('playButton');

    if (isPlaying) {
        // Stop all playback
        if (currentTrack) {
            currentTrack.stop();
            currentTrack = null;
        }
        playButton.src = 'static/images/playButton.png';
        isPlaying = false;
        console.log('Playback stopped.');
    } else {
        // Ensure the Tone.js audio context is started
        await userInteracted();

        // Start playing track1.mp3
        startNewTrack('static/audio/track1.mp3', true);

        playButton.src = 'static/images/pauseButton.png';
        isPlaying = true;
        console.log('Playback started.');
    }
}

// Function to start a new track with optional fade-in
function startNewTrack(trackFile, fadeIn = false) {
    console.log(`Attempting to start new track: ${trackFile}`);

    // Create a new Tone.Player
    currentTrack = new Tone.Player({
        url: trackFile,
        autostart: false,
        loop: false,
        onload: () => {
            // Ensure the track is connected to the audio destination
            currentTrack.toDestination();

            // Set the fadeIn property
            currentTrack.fadeIn = fadeIn ? fadeInDuration / 1000 : 0;

            // Start playback
            currentTrack.start();
            console.log('New track started with fade-in.');
        },
        onerror: (error) => {
            console.error(`Error loading track ${trackFile}:`, error);
        }
    });
}

// Removed GPS-related functions and variables for testing
