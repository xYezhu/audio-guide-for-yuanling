let latitude, longitude; // define globally for use across functions
let prevLatitude, prevLongitude;
let changeThreshold = 0.0001; // minimum change to trigger playback adjustment

function setup() {
    // create the canvas for displaying GPS data
    const canvas = createCanvas(windowWidth * 0.8, windowHeight * 0.2);
    canvas.parent('canvasContainer');
    textSize(48);
    textStyle(BOLD);
    fill('#34495e');

    // check if geolocation is available in the browser
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
            updatePosition,
            showError,
            { enableHighAccuracy: true } // enable high accuracy for gps location
        );
    } else {
        text('geolocation is not supported by your browser.', 10, 20);
    }
}

function windowResized() {
    resizeCanvas(windowWidth * 0.8, windowHeight * 0.2);
}

function draw() {
    background('#cbdce1'); 
    textStyle(BOLD);
    textAlign(LEFT, CENTER);

    // display the current GPS coordinates
    if (latitude !== undefined && longitude !== undefined) {
        textSize(45);
        fill('#34495e');
        text(`latitude: ${latitude.toFixed(4)}`, 10, height * 0.25);
        text(`longitude: ${longitude.toFixed(4)}`, 10, height * 0.4);
    } else {
        text('waiting for GPS data...', 10, height * 0.1);
    }
}

// callback function to update the position variables
function updatePosition(position) {
    latitude = position.coords.latitude;
    longitude = position.coords.longitude;

    // trigger handleLocationChange only if significant location change
    if (typeof prevLatitude === 'undefined' || typeof prevLongitude === 'undefined' ||
        Math.abs(latitude - prevLatitude) > changeThreshold || 
        Math.abs(longitude - prevLongitude) > changeThreshold) {
            
        // Use window.handleLocationChange
        if (typeof window.handleLocationChange === 'function') {
            window.handleLocationChange(latitude, longitude);
        } else {
            console.error('handleLocationChange is not defined.');
        }

        prevLatitude = latitude;
        prevLongitude = longitude;
    }
}

// error handling function
function showError(error) {
    let errorMessage;
    switch (error.code) {
        case error.PERMISSION_DENIED:
            errorMessage = 'Geolocation permission denied. Enable it in settings.';
            break;
        case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable.';
            break;
        case error.TIMEOUT:
            errorMessage = 'Request to get location timed out.';
            break;
        default:
            errorMessage = 'An unknown error occurred.';
    }

    console.error(errorMessage);
    const canvasContainer = document.getElementById('canvasContainer');
    if (canvasContainer) {
        canvasContainer.textContent = errorMessage; // Display error on the page
    }
}

// start the audio context on the first user interaction
// async function userInteracted() {
//     if (!audioContextStarted) {
//         try {
//             await Tone.start();
//             audioContextStarted = true;
//             console.log('Audio context started.');
//         } catch (error) {
//             console.error('Failed to start audio context:', error);
//         }
//     }
// }
