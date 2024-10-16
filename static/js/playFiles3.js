document.addEventListener('DOMContentLoaded', function () {
    let playButton = document.getElementById('playButton');
    if (playButton) {
        playButton.addEventListener('click', togglePlayback);
    } 
});

let currentTrack = null;
let fadeInDuration = 2000; // set fade-in time to 2000 ms (2 seconds), or any value you prefer
let fadeOutDuration = 2000; // set fade-out time to 2000 ms (2 seconds),  or any value you prefer
let currentlyPlayingLocation = null; // track which location's track is currently playing
let tracks = {
    "location1": "/audio/track1.mp3", // example location coordinates for track 1
    "location2": "/audio/track2.mp3", // example location coordinates for track 2
    "location3": "/audio/track3.mp3",  // example location coordinates for track 3
    "location4": "/audio/track4.mp3",  // example location coordinates for track 4
    "location5": "/audio/track5.mp3",  // example location coordinates for track 5
    "location6": "/audio/track6.mp3",  // example location coordinates for track 
    // add more below...
};

let userInitiatedPlayback = false; // flag to determine if playback has been started by user
let isPlaying = false; // only declare once to avoid conflicts
let backgroundTrack = null;

function startBackgroundTrack() {
    if (!backgroundTrack) {
        backgroundTrack = new Tone.Player({
            url: "..static/audio/background3.mp3", // background track for group 1
            autostart: false,
            loop: true,
            onload: () => {
                console.log("background track 3 loaded successfully.");
                backgroundTrack.start();
                console.log("background track 3 started playing.");
            },
            onerror: (error) => {
                console.error("error loading background track 3:", error);
            }
        }).toDestination();
    } else {
        backgroundTrack.start();
    }
}

// function to start/stop playback via button click
async function togglePlayback() {
    let playButton = document.getElementById('playButton');

    if (isPlaying) {
        // If currently playing, stop all tracks including the background track
        stopAllPlayback();
        playButton.textContent = "play";
        isPlaying = false;
    } else {
        // Start playback
        userInitiatedPlayback = true;
        isPlaying = true;
        playButton.textContent = "stop";
        console.log("user initiated playback. GPS-based playback now enabled.");

        // ensure the Tone.js audio context is started
        await userInteracted();

        // start the background track
        startBackgroundTrack();

        // start the track corresponding to the current location if available
        if (latitude !== undefined && longitude !== undefined) {
            window.handleLocationChange(latitude, longitude);
        }
    }
}

// function to stop all playback including background
function stopAllPlayback() {
    // stop location-specific track
    if (currentTrack) {
        console.log("Stopping current track...");
        currentTrack.volume.rampTo(-Infinity, fadeOutDuration / 1000); // Fade out using fadeOutDuration
        setTimeout(() => {
            currentTrack.stop();
            console.log("Current track stopped.");
            currentlyPlayingLocation = null;
            currentTrack = null;
        }, fadeOutDuration);
    }

    // stop background track if it exists
    if (backgroundTrack) {
        console.log("stopping background track...");
        backgroundTrack.stop(); // stop the background track without any fade
        console.log("background track stopped.");
    }

    userInitiatedPlayback = false;
}

// function to play a track with fade-in and fade-out
async function playTrack(trackFile, locationKey) {
    await userInteracted(); // ensure Tone.js audio context is started

    if (currentTrack && currentlyPlayingLocation === locationKey) {
        // if we are already playing the requested track, do nothing
        console.log(`track for ${locationKey} is already playing.`);
        return;
    }

    if (currentTrack && currentlyPlayingLocation !== locationKey) {
        // crossfade: fade out current track and start the new one
        console.log('crossfading to new track...');
        currentTrack.volume.rampTo(-Infinity, fadeOutDuration / 1000); // fade out using fadeOutDuration
        setTimeout(() => {
            currentTrack.stop();
            console.log('previous track stopped.');
            currentTrack = null; // clear the current track
            startNewTrack(trackFile, locationKey); // start the new track after fading out the previous one
        }, fadeOutDuration);
    } else if (!currentTrack) {
        // if no track is playing, directly start the new track
        startNewTrack(trackFile, locationKey);
    }
}

// helper function to start a new track
function startNewTrack(trackFile, locationKey) {
    currentTrack = new Tone.Player({
        url: trackFile,
        autostart: false,
        onload: () => {
            console.log(`track ${trackFile} loaded successfully.`);

            try {
                if (currentTrack.buffer && currentTrack.buffer.loaded) {
                    currentTrack.volume.value = -Infinity; // start from silence for fade-in
                    currentTrack.start();
                    currentTrack.volume.rampTo(0, fadeInDuration / 1000); // fade-in to 0 dB using fadeInDuration
                    console.log('playback started with fade-in.');
                    currentlyPlayingLocation = locationKey; // update the currently playing location
                } else {
                    console.error('buffer not loaded correctly, unable to start playback.');
                }
            } catch (err) {
                console.error('error during playback initiation:', err);
            }
        },
        onerror: (error) => {
            console.error("error loading track:", error);
        }
    }).toDestination();
}

// function to determine which track to play based on GPS coordinates
function handleLocationChange(latitude, longitude) {
    if (!userInitiatedPlayback) {
        // if playback has not been initiated by user, do nothing
        console.log("playback not initiated by user. ignoring GPS location change.");
        return;
    }

    // define your location ranges and match with tracks here
    // explanation: &&: true if and only if all the operands are true
    // resources: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_AND
    if (latitude > 22 && latitude < 23 && longitude > 113 && longitude < 114) {
        playTrack(tracks["location1"], "location1");
    } else if (latitude > 23 && latitude < 24 && longitude > 114 && longitude < 115) {
        playTrack(tracks["location2"], "location2");
    } else if (latitude > 24 && latitude < 25 && longitude > 115 && longitude < 116) {
        playTrack(tracks["location3"], "location3");
    } else {
        console.log("no track assigned for this location.");
        // stop playback when leaving all defined zones
        if (currentlyPlayingLocation) {
            stopAllPlayback();
        }
    }
}

// attach handleLocationChange to the window object so it can be accessed globally
window.handleLocationChange = handleLocationChange;
