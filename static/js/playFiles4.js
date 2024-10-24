document.addEventListener('DOMContentLoaded', function () {
    let playButton = document.getElementById('playButton');
    if (playButton) {
        playButton.addEventListener('click', togglePlayback);
    }
});

window.audioContextStarted = window.audioContextStarted || false;


let currentTrack = null;
let fadeInDuration = 2000; // adjust as needed
let fadeOutDuration = 2000; // adjust as needed
let currentlyPlayingLocation = null; // track which location's track is currently playing
let tracks = {
    "location1": "static/audio/track1.mp3",
    "location2": "static/audio/track2.mp3",
    "location3": "static/audio/track3.mp3",
    "location4": "static/audio/track4.mp3",
    "location5": "static/audio/track5.mp3",
    "location6": "static/audio/track6.mp3"
    // add more below...
};

let userInitiatedPlayback = false; // flag to determine if playback has been started by user
let isPlaying = false;
let backgroundTrack = null;

async function userInteracted() {
    if (!window.audioContextStarted) {
        try {
            await Tone.start();
            window.audioContextStarted = true;
            console.log('audio context started.');
        } catch (error) {
            console.error('failed to start audio context:', error);
        }
    } else {
        console.log('audio context already started.');
    }
}

// background track
function startBackgroundTrack() {
    const backgroundFile = "static/audio/background2.mp3";
    loadAndPlayAudio(backgroundFile, true, true, function(player) {
        backgroundTrack = player;
        console.log("background track started.");
    });
}

async function togglePlayback() {
    let playButton = document.getElementById('playButton');

    if (isPlaying) {
        stopAllPlayback(true);
        playButton.src = 'static/images/playButton.png';
        isPlaying = false;
    } else {
        userInitiatedPlayback = true;
        isPlaying = true;
        playButton.src = 'static/images/pauseButton.png';
        console.log("user initiated playback. GPS-based playback now enabled.");

        // ensure the Tone.js audio context is started
        await userInteracted();

        // start the background track
        startBackgroundTrack();

        // if current location is available, call handleLocationChange()
        if (typeof window.latitude !== 'undefined' && typeof window.longitude !== 'undefined') {
            handleLocationChange(window.latitude, window.longitude);
        } else {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    function(position) {
                        let latitude = position.coords.latitude;
                        let longitude = position.coords.longitude;

                        window.latitude = latitude;
                        window.longitude = longitude;

                        handleLocationChange(latitude, longitude);
                    },
                    function(error) {
                        console.error("error getting current position: ", error);
                    },
                    { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
                );
            } else {
                console.error('geolocation is not supported by your browser.');
            }
        }
    }
}


// function to stop all playback including background
function stopAllPlayback(userStopped = false) {
    if (currentTrack) {
        // set fadeOut duration
        currentTrack.fadeOut = fadeOutDuration / 1000; // in seconds
        // stop playback with fade out
        currentTrack.stop("+0"); // stops immediately with fade out applied
        currentTrack = null;
        currentlyPlayingLocation = null;
    }

    if (backgroundTrack) {
        backgroundTrack.fadeOut = fadeOutDuration / 1000; // in seconds
        backgroundTrack.stop("+0");
        backgroundTrack = null;
        console.log("background track stopped.");
    }

    if (userStopped) {
        userInitiatedPlayback = false;
        isPlaying = false;
        console.log("user stopped playback.");
    } else {
        console.log("playback stopped due to location change.");
    }
}

// function to play a track with fade-in and fade-out
function playTrack(trackFile, locationKey) {
    if (currentTrack && currentlyPlayingLocation === locationKey) return;

    if (currentTrack && currentlyPlayingLocation !== locationKey) {
        console.log('crossfading to new track...');

        let oldTrack = currentTrack;

        // start the new track
        startNewTrack(trackFile, locationKey, true);

        // fade out the old track
        oldTrack.fadeOut = fadeOutDuration / 1000; // in seconds
        oldTrack.stop("+0"); // stops with fade out applied
    } else if (!currentTrack) {
        startNewTrack(trackFile, locationKey, true);
    }
}

// function to start a new track with optional fade-in
function startNewTrack(trackFile, locationKey, fadeIn = false) {
    console.log(`attempting to start new track: ${trackFile}`);

    loadAndPlayAudio(trackFile, false, fadeIn, function(player) {
        currentTrack = player;
        currentlyPlayingLocation = locationKey;
        console.log(`playing track: ${trackFile}`);
    });
}

// function to load and play audio files
function loadAndPlayAudio(file, loop = false, fadeIn = false, callback) {
    const player = new Tone.Player({
        url: file,
        autostart: false,
        loop: loop,
        onload: () => {
            player.toDestination();
            player.fadeIn = fadeIn ? fadeInDuration / 1000 : 0;
            player.start();
            if (callback) callback(player);
        },
        onerror: (error) => {
            console.error(`error loading ${file}:`, error);
        }
    });
}

// function to determine which track to play based on GPS coordinates
async function handleLocationChange(latitude, longitude) {
    console.log(`handleLocationChange called with latitude: ${latitude}, longitude: ${longitude}`);

    if (!window.audioContextStarted) {
        await userInteracted();
    }
    
    // adjust the following conditions for actual location-based playback
    if (latitude > 1.3520 && latitude < 1.3525 && longitude > 103.8195 && longitude < 103.8200) {
        playTrack(tracks["location1"], "location1");
    } else if (latitude > 1.3525 && latitude < 1.3530 && longitude > 103.8190 && longitude < 103.8200) {
        playTrack(tracks["location2"], "location2");
    } else if (latitude > 1.3530 && latitude < 1.3545 && longitude > 103.8190 && longitude < 103.8200) {
        playTrack(tracks["location3"], "location3");
    } else if (latitude > 22.5530 && latitude < 22.5540 && longitude > 114.0940 && longitude < 114.9950) {
        playTrack(tracks["location4"], "location4");
    } else if (latitude > 22.5540 && latitude < 22.5545 && longitude > 114.0930 && longitude < 114.0940) {
        playTrack(tracks["location5"], "location5");
    } else if (latitude > 22.5530 && latitude < 22.5540 && longitude > 114.0930 && longitude < 114.0940) {
        playTrack(tracks["location6"], "location6");
    } else {
        console.log("no track assigned for this location.");
        // optionally, stop the current track if not in any location
        if (currentTrack) {
            currentTrack.fadeOut = fadeOutDuration / 1000; // in seconds
            currentTrack.stop("+0"); // stops with fade out applied
            currentTrack = null;
            currentlyPlayingLocation = null;
        }
    }
}

// attach handleLocationChange to the window object so it can be accessed globally
window.handleLocationChange = handleLocationChange;
