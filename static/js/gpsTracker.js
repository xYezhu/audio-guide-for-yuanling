let audioContextStarted = false; // flag to check if audio context is started
let latitude, longitude; // define globally for use across functions
let futuraFont; // load the font

function preload() {
    futuraFont = loadFont('../fonts/FuturaPTMedium.otf');
}

function setup() {
    // create the canvas for displaying GPS data
    const canvas = createCanvas(windowWidth * 0.8, windowHeight * 0.2);
    canvas.parent('canvasContainer');
    textFont(futuraFont);
    textSize(48);
    textStyle(BOLD);
    fill('#34495e');

    // check if geolocation is available in the browser
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(updatePosition, showError);
    } else {
        text('geolocation is not supported by your browser.', 10, 20);
    }
}

function windowResized() {
    resizeCanvas(windowWidth * 0.8, windowHeight * 0.2);
}

function draw() {
    textStyle(BOLD);
    textAlign(LEFT, CENTER);

    // display the current GPS coordinates
    if (latitude !== undefined && longitude !== undefined) {
        textSize(45);
        textFont(futuraFont);
        fill('#34495e');
        text(`latitude: ${latitude.toFixed(4)}`, 10, height * 0.1);
        text(`longitude: ${longitude.toFixed(4)}`, 10, height * 0.25);
    } else {
        text('waiting for GPS data...', 10, height * 0.1);
    }
}

// callback function to update the position variables
function updatePosition(position) {
    latitude = position.coords.latitude;
    longitude = position.coords.longitude;

    // call the handleLocationChange function to play the corresponding track
    if (typeof handleLocationChange === 'function') {
        handleLocationChange(latitude, longitude);
    } else {
        console.error("handleLocationChange function is not defined.");
    }
}

// error handling function
function showError(error) {
    let errorMessage;
    switch (error.code) {
        case error.PERMISSION_DENIED:
            errorMessage = 'user denied the request for geolocation.';
            break;
        case error.POSITION_UNAVAILABLE:
            errorMessage = 'location information is unavailable.';
            break;
        case error.TIMEOUT:
            errorMessage = 'the request to get user location timed out.';
            break;
        case error.UNKNOWN_ERROR:
            errorMessage = 'an unknown error occurred.';
            break;
    }
    console.log(errorMessage);
    text(errorMessage, 10, height / 2);
}

// start the audio context on the first user interaction
async function userInteracted() {
    if (!audioContextStarted) {
        await Tone.start();
        audioContextStarted = true;
        console.log('audio context started');
    }
}
