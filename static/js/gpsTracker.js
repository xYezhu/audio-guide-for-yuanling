document.addEventListener('DOMContentLoaded', function() {
    // Check if 'canvasContainer' element exists
    if (document.getElementById('canvasContainer')) {
        // p5.js instance mode
        let s = function(p) {
            let latitude, longitude; // Define globally for use across functions
            let prevLatitude, prevLongitude;
            let changeThreshold = 0.0001; // Minimum change to trigger playback adjustment

            p.setup = function() {
                // Create the canvas for displaying GPS data
                const canvas = p.createCanvas(p.windowWidth * 0.8, p.windowHeight * 0.2);
                canvas.parent('canvasContainer');
                p.textSize(48);
                p.textStyle(p.BOLD);
                p.fill('#34495e');

                // Check if geolocation is available in the browser
                if (navigator.geolocation) {
                    navigator.geolocation.watchPosition(
                        updatePosition,
                        showError,
                        { enableHighAccuracy: true } // Enable high accuracy for GPS location
                    );
                } else {
                    p.text('Geolocation is not supported by your browser.', 10, 20);
                }
            };

            p.windowResized = function() {
                p.resizeCanvas(p.windowWidth * 0.8, p.windowHeight * 0.2);
            };

            p.draw = function() {
                p.background('#cbdce1'); 
                p.textStyle(p.BOLD);
                p.textAlign(p.LEFT, p.CENTER);

                // Display the current GPS coordinates
                if (latitude !== undefined && longitude !== undefined) {
                    p.textSize(45);
                    p.fill('#34495e');
                    p.text(`latitude: ${latitude.toFixed(4)}`, 10, p.height * 0.25);
                    p.text(`longitude: ${longitude.toFixed(4)}`, 10, p.height * 0.4);
                } else {
                    p.text('Waiting for GPS data...', 10, p.height * 0.1);
                }
            };

            // Callback function to update the position variables
            function updatePosition(position) {
                latitude = position.coords.latitude;
                longitude = position.coords.longitude;

                console.log(`updatePosition called with latitude: ${latitude}, longitude: ${longitude}`);

                // Trigger handleLocationChange only if significant location change
                if (typeof prevLatitude === 'undefined' || typeof prevLongitude === 'undefined' ||
                    Math.abs(latitude - prevLatitude) > changeThreshold || 
                    Math.abs(longitude - prevLongitude) > changeThreshold) {

                    // Directly call handleLocationChange after ensuring it is defined
                    if (typeof window.handleLocationChange === 'function') {
                        window.handleLocationChange(latitude, longitude);
                    } else {
                        console.error('handleLocationChange is not defined.');
                    }

                    prevLatitude = latitude;
                    prevLongitude = longitude;
                }
            }

            // Error handling function
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
        };

        // Create a new p5 instance
        new p5(s);
    } else {
        // 'canvasContainer' does not exist; skip initializing p5.js
        console.warn("canvasContainer not found. Skipping p5.js initialization.");
    }
});
