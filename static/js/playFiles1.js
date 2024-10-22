document.addEventListener('DOMContentLoaded', function () {
    let playButton = document.getElementById('playButton');
    if (playButton) {
        playButton.addEventListener('click', togglePlayback);
    }
});

window.audioContextStarted = window.audioContextStarted || false;
let currentTrack = null;
let fadeInDuration = 2000; // Adjust as needed
let fadeOutDuration = 2000; // Adjust as needed
let currentlyPlayingLocation = null; // Track which location's track is currently playing
let tracks = {
    "location1": "static/audio/track1.mp3",
    "location2": "static/audio/track2.mp3",
    "location3": "static/audio/track3.mp3",
    "location4": "static/audio/track4.mp3",
    "location5": "static/audio/track5.mp3",
    "location6": "static/audio/track6.mp3"
    // Add more tracks as needed...
};

let userInitiatedPlayback = false; // Flag to determine if playback has been started by user
let isPlaying = false;
let backgroundTrack = null;

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

// Background track
function startBackgroundTrack() {
    const backgroundFile = "static/audio/background1.mp3";
    if (window.preloadedAudio && window.preloadedAudio[backgroundFile]) {
        backgroundTrack = window.preloadedAudio[backgroundFile];
        backgroundTrack.loop = true;
        backgroundTrack.fadeIn = fadeInDuration / 1000; // Convert milliseconds to seconds
        backgroundTrack.toDestination();
        backgroundTrack.start();
        console.log("Background track started.");
    } else {
        console.error("Background track not preloaded correctly.");
    }
}

async function togglePlayback() {
    let playButton = document.getElementById('playButton');

    if (isPlaying) {
        stopAllPlayback(true);
        playButton.src = 'static/images/playButton.png';
        isPlaying = false;
    } else {
        // Ensure preloading is complete before proceeding
        if (!window.preloadingComplete) {
            console.error("Cannot start playback. Audio preloading not complete.");
            return;
        }

        userInitiatedPlayback = true;
        isPlaying = true;
        playButton.src = 'static/images/pauseButton.png';
        console.log("User initiated playback. GPS-based playback now enabled.");

        // Ensure the Tone.js audio context is started
        await userInteracted();

        // Start the background track
        startBackgroundTrack();

        // If current location is available, call handleLocationChange()
        if (typeof window.latitude !== 'undefined' && typeof window.longitude !== 'undefined') {
            handleLocationChange(window.latitude, window.longitude);
        } else {
            console.log("Current location not available.");
        }
    }
}

// Function to stop all playback including background
function stopAllPlayback(userStopped = false) {
    if (currentTrack) {
        // Set fadeOut duration
        currentTrack.fadeOut = fadeOutDuration / 1000; // in seconds
        // Stop playback with fade out
        currentTrack.stop("+0"); // Stops immediately with fade out applied
        currentTrack = null;
        currentlyPlayingLocation = null;
    }

    if (backgroundTrack) {
        backgroundTrack.fadeOut = fadeOutDuration / 1000; // in seconds
        backgroundTrack.stop("+0");
        backgroundTrack = null;
        console.log("Background track stopped.");
    }

    if (userStopped) {
        userInitiatedPlayback = false;
        isPlaying = false;
        console.log("User stopped playback.");
    } else {
        console.log("Playback stopped due to location change.");
    }
}

// Function to play a track with fade-in and fade-out
function playTrack(trackFile, locationKey) {
    if (currentTrack && currentlyPlayingLocation === locationKey) return;

    if (currentTrack && currentlyPlayingLocation !== locationKey) {
        console.log('Crossfading to new track...');

        let oldTrack = currentTrack;

        // Start the new track
        startNewTrack(trackFile, locationKey, true);

        // Fade out the old track
        oldTrack.fadeOut = fadeOutDuration / 1000; // in seconds
        oldTrack.stop("+0"); // Stops with fade out applied
    } else if (!currentTrack) {
        startNewTrack(trackFile, locationKey, true);
    }
}

// Function to start a new track with optional fade-in
function startNewTrack(trackFile, locationKey, fadeIn = false) {
    console.log(`Attempting to start new track: ${trackFile}`);

    if (window.preloadedAudio && window.preloadedAudio[trackFile]) {
        currentTrack = window.preloadedAudio[trackFile];
        currentTrack.loop = false;

        // Ensure the track is connected to the audio destination
        currentTrack.toDestination();

        // Set the fadeIn property
        currentTrack.fadeIn = fadeIn ? fadeInDuration / 1000 : 0;

        // Start playback
        currentTrack.start();
        console.log('New track started with fade-in.');

        currentlyPlayingLocation = locationKey;
        console.log(`Playing track: ${trackFile}`);
    } else {
        console.error(`Track ${trackFile} not preloaded correctly.`);
    }
}

// Function to determine which track to play based on GPS coordinates
function handleLocationChange(latitude, longitude) {
    console.log(`handleLocationChange called with latitude: ${latitude}, longitude: ${longitude}`);

    if (!userInitiatedPlayback) {
        // If playback has not been initiated by user, do nothing
        console.log("Playback not initiated by user. Ignoring GPS location check.");
        return;
    }

    if (!window.preloadingComplete) {
        console.error("Cannot begin playback, audio preloading not complete.");
        return;
    }

    // Adjust the following conditions for actual location-based playback
    if (latitude > 1.20 && latitude < 1.40 && longitude > 103.8100 && longitude < 103.8220) {
        playTrack(tracks["location1"], "location1");
    } else if (latitude > 22.5955 && latitude < 22.5960 && longitude > 113.9980 && longitude < 113.9990) {
        playTrack(tracks["location2"], "location2");
    } else if (latitude > 22.5930 && latitude < 22.5950 && longitude > 113.9970 && longitude < 113.9980) {
        playTrack(tracks["location3"], "location3");
    } else if (latitude > 22.5920 && latitude < 22.5930 && longitude > 113.9935 && longitude < 113.9950) {
        playTrack(tracks["location4"], "location4");
    } else if (latitude > 22.5920 && latitude < 22.5940 && longitude > 113.9930 && longitude < 113.9960) {
        playTrack(tracks["location5"], "location5");
    } else if (latitude > 22.5920 && latitude < 22.5930 && longitude > 113.9920 && longitude < 113.9940) {
        playTrack(tracks["location6"], "location6");
    } else {
        console.log("No track assigned for this location.");
        // Optionally, you can stop the current track if the user is not in any zone
        // If you want the track to continue playing even if the user leaves the zone, comment out the following lines
        if (currentTrack) {
            currentTrack.fadeOut = fadeOutDuration / 1000; // in seconds
            currentTrack.stop("+0"); // Stops with fade out applied
            currentTrack = null;
            currentlyPlayingLocation = null;
        }
    }
}

// Attach handleLocationChange to the window object so it can be accessed globally
window.handleLocationChange = handleLocationChange;
