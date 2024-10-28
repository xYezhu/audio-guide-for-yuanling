document.addEventListener('DOMContentLoaded', function () {
    // set the position of canvasContainer to relative
    let container = document.getElementById('canvasContainer');
    container.style.position = 'relative'; // Add this line

    // create a new p5.js instance
    let sketch = function (p) {
        let dotX, dotY;
        let canvasSize = 800;
        let dotSize = 30;
        let moveW = false, moveA = false, moveS = false, moveD = false;

        let overlayImage;

        p.preload = function () {
            overlayImage = p.loadImage('static/images/map.png'); // preload image to avoid asynchronous issues
        };
        
        p.setup = function () {
            // create a square canvas
            let canvas = p.createCanvas(canvasSize, canvasSize);
            canvas.parent('canvasContainer');
            canvas.style.position = 'absolute';
            canvas.style.top = '0';
            canvas.style.left = '0';
            canvas.style.zIndex = '2'; // ensure canvas is above the image
            
            // initialize dot at the center of the canvas
            dotX = p.width / 2;
            dotY = p.height / 2;

            // add mousePressed event to set the dot position
            canvas.mousePressed(function () {
                dotX = p.mouseX;
                dotY = p.mouseY;
            });
        };
        
        p.draw = function () {
            // set background color to transparent to see the underlying image
            p.clear();

            // draw the image first
            p.image(overlayImage, 0, 0, canvasSize, canvasSize);

            // move the dot if keys are pressed
            const step = 1; // movement step size
            if (moveW) {
                dotY = p.max(dotY - step, dotSize / 2);
            }
            if (moveS) {
                dotY = p.min(dotY + step, p.height - dotSize / 2);
            }
            if (moveA) {
                dotX = p.max(dotX - step, dotSize / 2);
            }
            if (moveD) {
                dotX = p.min(dotX + step, p.width - dotSize / 2);
            }

            // draw the dot after the background image
            p.fill('#cb3431');
            p.noStroke();
            p.ellipse(dotX, dotY, dotSize, dotSize);
        };

        // handle key pressed events
        p.keyPressed = function () {
            if (p.key === 'w' || p.key === 'W') {
                moveW = true;
            } else if (p.key === 's' || p.key === 'S') {
                moveS = true;
            } else if (p.key === 'a' || p.key === 'A') {
                moveA = true;
            } else if (p.key === 'd' || p.key === 'D') {
                moveD = true;
            }
        };

        // handle key released events
        p.keyReleased = function () {
            if (p.key === 'w' || p.key === 'W') {
                moveW = false;
            } else if (p.key === 's' || p.key === 'S') {
                moveS = false;
            } else if (p.key === 'a' || p.key === 'A') {
                moveA = false;
            } else if (p.key === 'd' || p.key === 'D') {
                moveD = false;
            }
        };
    };

    // instantiate the p5 sketch
    new p5(sketch);
});
