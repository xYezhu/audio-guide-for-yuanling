document.addEventListener('DOMContentLoaded', function () {
    let playButton = document.getElementById('playButton');
    if (playButton) {
        playButton.addEventListener('click', togglePlayback);
    } 
});

window.audioContextStarted = window.audioContextStarted || false;
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

async function userInteracted() {
    if (!window.audioContextStarted) {
        try {
            await Tone.start();
            window.audioContextStarted = true;
            console.log('Audio context started.');
        } catch (error) {
            console.error('Failed to start audio context:', error);
        }
    }
}

// background track
function startBackgroundTrack() {
    const backgroundFile = "static/audio/background1.mp3"; 
    if (window.preloadedAudio[backgroundFile]) {
        backgroundTrack = window.preloadedAudio[backgroundFile];
        if (backgroundTrack.state === 'stopped') {
            backgroundTrack.loop = true;
            backgroundTrack.start();
            console.log("background track started.");
        }
    } else {
        console.error("background track not preloaded correctly.");
    }
}

async function togglePlayback() {
    let playButton = document.getElementById('playButton');

    if (isPlaying) {
        stopAllPlayback(true);
        playButton.src = 'static/images/playButton.png';
        isPlaying = false;
    } else {
        // wait until preloading is complete before proceeding
        if (!window.preloadingComplete) {
            console.error("cannot start playback. Audio preloading not complete.");
            return;
        }

        userInitiatedPlayback = true;
        isPlaying = true;
        playButton.src = 'static/images/pauseButton.png';
        console.log("user initiated playback. GPS-based playback now enabled.");

        // ensure the Tone.js audio context is started
        await userInteracted();

        // start the background track
        startBackgroundTrack();

        // navigator.geolocation.watchPosition(
        //     (position) => {
        //         let latitude = position.coords.latitude;
        //         let longitude = position.coords.longitude;
        //         window.handleLocationChange(latitude, longitude);
        //     },
        //     (error) => {
        //         console.error('error getting GPS location:', error);
        //     },
        //     {
        //         enableHighAccuracy: true,
        //         maximumAge: 10000,
        //         timeout: 5000
        //     }
        // );
    }
}

// function to stop all playback including background
function stopAllPlayback(userStopped = false) {
    if (currentTrack) {
        currentTrack.volume.rampTo(-Infinity, fadeOutDuration / 1000);
        setTimeout(() => {
            currentTrack.stop();
            currentTrack = null;
            currentlyPlayingLocation = null;
        }, fadeOutDuration);
    }

    if (backgroundTrack) {
        backgroundTrack.stop(); 
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
async function playTrack(trackFile, locationKey) {
    if (currentTrack && currentlyPlayingLocation === locationKey) return;

    if (currentTrack && currentlyPlayingLocation !== locationKey) {
        console.log('crossfading to new track...');
        currentTrack.volume.rampTo(-Infinity, fadeOutDuration / 1000); 
        setTimeout(() => {
            currentTrack.stop();
            startNewTrack(trackFile, locationKey, true);
        }, fadeOutDuration);
    } else if (!currentTrack) {
        startNewTrack(trackFile, locationKey, true);
    }
}


// function to start a new track with optional fade-in
function startNewTrack(trackFile, locationKey, fadeIn = false) {
    if (window.preloadedAudio[trackFile]) {
        currentTrack = window.preloadedAudio[trackFile];
        currentTrack.loop = false;

        if (fadeIn) {
            currentTrack.volume.setValueAtTime(-Infinity, Tone.now());
            currentTrack.start();
            currentTrack.volume.rampTo(0, fadeInDuration / 1000); 
            console.log('New track started with fade-in.');
        } else {
            currentTrack.start(); 
        }

        currentlyPlayingLocation = locationKey;
        console.log(`Playing track: ${trackFile}`);
    } else {
        console.error(`Track ${trackFile} not preloaded correctly.`);
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
