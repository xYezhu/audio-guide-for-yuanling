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
    "location1": "static/audio/track1.mp3",
    "location2": "static/audio/track2.mp3",
    "location3": "static/audio/track3.mp3",
    "location4": "static/audio/track4.mp3",
    "location5": "static/audio/track5.mp3",
    "location6": "static/audio/track6.mp3"
    // add more below...
};

let userInitiatedPlayback = false; // flag to determine if playback has been started by user
let isPlaying = false; // only declare once to avoid conflicts
let backgroundTrack = null;

function startBackgroundTrack() {
    const backgroundFile = "static/audio/background1.mp3"; // background track

    if (!preloadingComplete) {
        console.error("Audio preloading not complete. Background track cannot be started.");
        return;
    }

    if (window.preloadedAudio[backgroundFile] && window.preloadedAudio[backgroundFile].buffer && window.preloadedAudio[backgroundFile].buffer.loaded) {
        backgroundTrack = window.preloadedAudio[backgroundFile];
        backgroundTrack.loop = true;
        backgroundTrack.start();
        console.log("Background track started from preloaded buffer.");
    } else {
        console.error("Background track not preloaded correctly.");
    }
}

function startNewTrack(trackFile, locationKey, fadeIn = false) {
    if (!preloadingComplete) {
        console.error("Audio preloading not complete. Cannot start new track.");
        return;
    }

    if (window.preloadedAudio[trackFile] && window.preloadedAudio[trackFile].buffer && window.preloadedAudio[trackFile].buffer.loaded) {
        currentTrack = window.preloadedAudio[trackFile];
        currentTrack.loop = false; // ensure it doesn't loop

        if (fadeIn) {
            currentTrack.volume.value = -Infinity; // start from silence for fade-in
            currentTrack.start();
            currentTrack.volume.rampTo(0, fadeInDuration / 1000); // fade-in to 0 dB using fadeInDuration
            console.log('Playback started with fade-in.');
        } else {
            currentTrack.start(); // start normally without fade-in
        }

        currentlyPlayingLocation = locationKey; // update the currently playing location
        console.log(`Track ${trackFile} playing.`);
    } else {
        console.error(`Track ${trackFile} not preloaded correctly.`);
    }
}


async function togglePlayback() {
    let playButton = document.getElementById('playButton');

    if (isPlaying) {
        stopAllPlayback();
        playButton.textContent = "play";
        isPlaying = false;
    } else {
        // wait until preloading is complete before proceeding
        if (!preloadingComplete) {
            console.error("Cannot start playback. Audio preloading not complete.");
            return;
        }

        userInitiatedPlayback = true;
        isPlaying = true;
        playButton.textContent = "stop";
        console.log("user initiated playback. GPS-based playback now enabled.");

        // ensure the Tone.js audio context is started
        await userInteracted();

        // start the background track
        startBackgroundTrack();

        navigator.geolocation.watchPosition(
            (position) => {
                let latitude = position.coords.latitude;
                let longitude = position.coords.longitude;
                window.handleLocationChange(latitude, longitude);
            },
            (error) => {
                console.error('error getting GPS location:', error);
            },
            {
                enableHighAccuracy: true,
                maximumAge: 10000,
                timeout: 5000
            }
        );
    }
}


// function to stop all playback including background
function stopAllPlayback() {
    // stop location-specific track
    if (currentTrack) {
        console.log("stopping current track...");
        currentTrack.volume.rampTo(-Infinity, fadeOutDuration / 1000); // fade out using fadeOutDuration
        setTimeout(() => {
            currentTrack.stop();
            console.log("current track stopped.");
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
        // crossfade: fade out the current track and start the new one
        console.log('crossfading to new track...');
        currentTrack.volume.rampTo(-Infinity, fadeOutDuration / 1000); // fade out using fadeOutDuration
        setTimeout(() => {
            currentTrack.stop();
            console.log('previous track stopped.');
            currentTrack = null; // clear the current track
            startNewTrack(trackFile, locationKey, true); // start the new track with fade-in
        }, fadeOutDuration);
    } else if (!currentTrack) {
        // if no track is playing, start the new track with fade-in
        console.log('starting new track with fade-in...');
        startNewTrack(trackFile, locationKey, true); // add a fade-in flag for initial play
    }
}


// function to determine which track to play based on GPS coordinates
function handleLocationChange(latitude, longitude) {
    if (!userInitiatedPlayback) {
        // if playback has not been initiated by user, do nothing
        console.log("playback not initiated by user. Ignoring GPS location change.");
        return;
    }

    // define your location ranges and match with tracks here
    // explanation: &&: true if and only if all the operands are true
    // resources: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_AND
    if (latitude > 22.5960 && latitude < 23 && longitude > 113.9980 && longitude < 114) {
        playTrack(tracks["location1"], "location1"); // in building, 3rd floor
    } else if (latitude > 22.5955 && latitude < 22.5960 && longitude > 113.9980 && longitude < 113.9990) {
        playTrack(tracks["location2"], "location2"); // outside the building, near the bin
    } else if (latitude > 22.5930 && latitude < 22.5950 && longitude > 113.9970 && longitude < 113.9980) {
        playTrack(tracks["location3"], "location3"); // towards baoneng shopping mall
    } else if (latitude > 22.5920 && latitude < 22.5930 && longitude > 113.9935 && longitude < 113.9950) {
        playTrack(tracks["location4"], "location4"); // saizeriya in baoneng shopping mall
    } else if (latitude > 22.5920 && latitude < 22.5940 && longitude > 113.9930 && longitude < 113.9960) {
        playTrack(tracks["location5"], "location5"); // mcdonald's in baoneng shopping mall
    } else if (latitude > 22.5920 && latitude < 22.5930 && longitude > 113.9920 && longitude < 113.9940) {
        playTrack(tracks["location6"], "location6"); // 711 outside baoneng shopping mall
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
