document.addEventListener('DOMContentLoaded', function() {
    // p5.js instance mode
    let s = function(p) {
        let latitude, longitude; // define globally for use across functions
        let prevLatitude, prevLongitude;
        let changeThreshold = 0.0001; // minimum change to trigger playback adjustment

        p.setup = function() {
            // create the canvas for displaying GPS data
            const canvas = p.createCanvas(p.windowWidth * 0.8, p.windowHeight * 0.2);
            canvas.parent('canvasContainer');
            p.textSize(48);
            p.textStyle(p.BOLD);
            p.fill('#34495e');

            // check if geolocation is available in the browser
            if (navigator.geolocation) {
                navigator.geolocation.watchPosition(
                    updatePosition,
                    showError,
                    { enableHighAccuracy: true } // enable high accuracy for gps location
                );
            } else {
                p.text('geolocation is not supported by your browser.', 10, 20);
            }
        };

        p.windowResized = function() {
            p.resizeCanvas(p.windowWidth * 0.8, p.windowHeight * 0.2);
        };

        p.draw = function() {
            p.background('#cbdce1'); 
            p.textStyle(p.BOLD);
            p.textAlign(p.LEFT, p.CENTER);

            // display the current GPS coordinates
            if (latitude !== undefined && longitude !== undefined) {
                p.textSize(45);
                p.fill('#34495e');
                p.text(`latitude: ${latitude.toFixed(4)}`, 10, p.height * 0.25);
                p.text(`longitude: ${longitude.toFixed(4)}`, 10, p.height * 0.4);
            } else {
                p.text('waiting for GPS data...', 10, p.height * 0.1);
            }
        };

        // callback function to update the position variables
        function updatePosition(position) {
            latitude = position.coords.latitude;
            longitude = position.coords.longitude;

            // trigger handleLocationChange only if significant location change
            if (typeof prevLatitude === 'undefined' || typeof prevLongitude === 'undefined' ||
                Math.abs(latitude - prevLatitude) > changeThreshold || 
                Math.abs(longitude - prevLongitude) > changeThreshold) {

                // directly call handleLocationChange after ensuring it is defined
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
                canvasContainer.textContent = errorMessage; // display error on the page
            }
        }
    };

    // create a new p5 instance, which will call the setup and draw functions
    new p5(s);
});
