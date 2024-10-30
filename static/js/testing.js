document.addEventListener('DOMContentLoaded', function () {
    // get the container element
    let container = document.getElementById('canvasContainer');
    container.style.position = 'relative';

    // create the display element
    let latLonDisplay = document.createElement('div');
    latLonDisplay.id = 'latLonDisplay';
    latLonDisplay.style.fontSize = '36px';
    latLonDisplay.style.fontFamily = 'Arial';
    latLonDisplay.style.marginBottom = '0px';
    latLonDisplay.style.color = '#596a7b';
    latLonDisplay.style.textAlign = 'center'; 
    latLonDisplay.style.display = 'block';
    latLonDisplay.style.margin = '20% auto 0 auto';

    // insert it before the canvasContainer
    container.parentNode.insertBefore(latLonDisplay, container.nextSibling);

    let sketch = function (p) {
        // let displayCoord = false;
        // let coordDisplayTime = 0;
        // let coordX = 0;
        // let coordY = 0;
        // let draggingSquareIndex = -1;
        let dotX, dotY;
        let canvasSize = 800;
        let dotSize = 30;
        let moveW = false, moveA = false, moveS = false, moveD = false;
        let overlayImage;
        let blueSquares = [];
        let currentSquareNumber = null;
        let controlPoints = [
            { imageX: 40, imageY: 39.61, latitude: 22.5560, longitude: 114.0918 },  // point 1
            { imageX: 50, imageY: 320.61, latitude: 22.5542, longitude: 114.0918 }, // point 2
            { imageX: 59, imageY: 696.61, latitude: 22.5520, longitude: 114.0918 }, // point 3
            { imageX: 370, imageY: 88.61, latitude: 22.5557, longitude: 114.0939 }, // point 4
            { imageX: 176, imageY: 167.61, latitude: 22.5551, longitude: 114.0927 }, // point 5
            { imageX: 245, imageY: 387.61, latitude: 22.5557, longitude: 114.0939 }, // point 6
            { imageX: 255, imageY: 675.61, latitude: 22.5519, longitude: 114.0933 }, // point 7
            { imageX: 678, imageY: 322.61, latitude: 22.5530, longitude: 114.0961 }, // point 8
        ];
        let { paramsLat, paramsLon } = computeBilinearParameters(controlPoints);

        p.preload = function () {
            overlayImage = p.loadImage('static/images/map.png');
        };

        p.setup = function () {
            let canvas = p.createCanvas(canvasSize, canvasSize);
            canvas.parent('canvasContainer');
            canvas.style.position = 'absolute';
            canvas.style.top = '0';
            canvas.style.left = '0';
            canvas.style.zIndex = '2';

            dotX = p.width / 2;
            dotY = p.height / 2;

            // load saved blue squares from localStorage if available
            let savedSquares = JSON.parse(localStorage.getItem('blueSquares'));
            if (savedSquares) {
                blueSquares = savedSquares.map(sq => new DraggableSquare(sq.x, sq.y, sq.w, sq.h, p.color(255, 0, 0, 100), sq.number));
            } else {
                blueSquares.push(new DraggableSquare(150, 150, 80, 80, p.color(255, 0, 0, 100), 1));
            }

            // create + button
            let addButton = p.createButton('+');
            addButton.position(p.width * 0.9, p.height * 0.25);
            addButton.style('background-color', '#92b7c1');
            addButton.style('color', 'white');
            addButton.style('font-size', '40px');
            addButton.style('padding', '10px 20px');
            addButton.style('outline', 'none');
            addButton.style('border', '#92b7c1');
            addButton.style('border-radius', '5px');
            addButton.mousePressed(addSquare);
        };

        p.draw = function () {
            p.clear();
            p.image(overlayImage, 0, 0, canvasSize, canvasSize);

            // // display the image coordinates when 'c' is pressed
            // if (displayCoord) {
            //     p.fill(0);
            //     p.noStroke();
            //     p.textSize(16);
            //     p.text(`X: ${coordX.toFixed(2)}, Y: ${coordY.toFixed(2)}`, coordX + 15, coordY - 10);

            //     // stop displaying after 3 seconds
            //     if (p.millis() - coordDisplayTime > 3000) {
            //         displayCoord = false;
            //     }
            // }

            // compute the red dot's geographic coordinates
            let geoCoords = imageToGeo(dotX, dotY);

            // display the coordinates
            latLonDisplay.innerHTML = `Latitude: ${geoCoords.latitude.toFixed(4)}<br>Longitude: ${geoCoords.longitude.toFixed(4)}`;

            const step = 1;
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

            // draw squares in the correct order to maintain layering
            blueSquares.forEach(square => {
                square.update(p.mouseX, p.mouseY);
                square.show();
                square.showNumber();
            });

            p.fill('#cb3431');
            p.noStroke();
            p.ellipse(dotX, dotY, dotSize, dotSize);

            let squareFound = false;
            blueSquares.forEach(square => {
                if (square.contains(dotX, dotY)) {
                    if (currentSquareNumber !== square.number) {
                        console.log(square.number);
                        currentSquareNumber = square.number;
                    }
                    squareFound = true;
                }
            });
            if (!squareFound && currentSquareNumber !== null) {
                console.log(currentSquareNumber);
                currentSquareNumber = null;
            }
            
        };

        p.mousePressed = function () {
            // loop through squares in reverse order to select the topmost one
            for (let i = blueSquares.length - 1; i >= 0; i--) {
                let square = blueSquares[i];
                square.pressed(p.mouseX, p.mouseY);
                if (square.dragging) {
                    draggingSquareIndex = i;
                    // bring the selected square to the front
                    blueSquares.push(blueSquares.splice(i, 1)[0]);
                    break;
                }
            }
        };

        p.mouseReleased = function () {
            blueSquares.forEach(square => square.released());
            draggingSquareIndex = -1;
            saveBlueSquares(); // save squares when released
        };

        p.keyPressed = function () {

            // // check if 'c' or 'C' is pressed
            // if (p.key === 'c' || p.key === 'C') {
            //     // store the mouse's image coordinates
            //     coordX = p.mouseX;
            //     coordY = p.mouseY;
            //     displayCoord = true;
            //     coordDisplayTime = p.millis(); // record the current time
            // }

            if (p.key === 'w' || p.key === 'W') {
                moveW = true;
            } else if (p.key === 's' || p.key === 'S') {
                moveS = true;
            } else if (p.key === 'a' || p.key === 'A') {
                moveA = true;
            } else if (p.key === 'd' || p.key === 'D') {
                moveD = true;
            } else if (draggingSquareIndex !== -1 && (p.keyCode === p.DELETE || p.keyCode === p.BACKSPACE)) {
                blueSquares.splice(draggingSquareIndex, 1);
                draggingSquareIndex = -1;

                // reassign numbers to maintain sequential order
                blueSquares.forEach((square, index) => {
                    square.number = index + 1;
                });

                saveBlueSquares(); // save squares after removing
            } else if (draggingSquareIndex !== -1 && p.keyCode === p.UP_ARROW) {
                blueSquares[blueSquares.length - 1].w = p.min(blueSquares[blueSquares.length - 1].w + 5, canvasSize);
                blueSquares[blueSquares.length - 1].h = p.min(blueSquares[blueSquares.length - 1].h + 5, canvasSize);
                saveBlueSquares(); // save changes after resizing
            } else if (draggingSquareIndex !== -1 && p.keyCode === p.DOWN_ARROW) {
                blueSquares[blueSquares.length - 1].w = p.max(blueSquares[blueSquares.length - 1].w - 5, 10);
                blueSquares[blueSquares.length - 1].h = p.max(blueSquares[blueSquares.length - 1].h - 5, 10);
                saveBlueSquares(); // save changes after resizing
            }
        };

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

        function addSquare() {
            // assign a new number based on the highest existing number
            let maxNumber = blueSquares.reduce((max, square) => Math.max(max, square.number), 0);
            let newNumber = maxNumber + 1;
            blueSquares.push(new DraggableSquare(150, 150, 80, 80, p.color(255, 0, 0, 100), newNumber));
            saveBlueSquares(); // save squares after adding
        }

        function saveBlueSquares() {
            let squaresData = blueSquares.map(square => ({
                x: square.x,
                y: square.y,
                w: square.w,
                h: square.h,
                number: square.number // include number in saved data
            }));
            localStorage.setItem('blueSquares', JSON.stringify(squaresData));
        }

        function computeBilinearParameters(points) {
            let N = points.length;
            if (N < 4) {
                alert('At least four control points are required for bilinear interpolation.');
                return null;
            }
        
            let A = [];
            let B_lat = [];
            let B_lon = [];
        
            for (let i = 0; i < N; i++) {
                let x = points[i].imageX;
                let y = points[i].imageY;
                let lat = points[i].latitude;
                let lon = points[i].longitude;
        
                // equation for latitude and longitude
                A.push([1, x, y, x * y]);
                B_lat.push(lat);
                B_lon.push(lon);
            }
        
            // convert arrays to math.js matrices
            let A_mat = math.matrix(A);
            let B_lat_mat = math.matrix(B_lat);
            let B_lon_mat = math.matrix(B_lon);
        
            // compute the pseudo-inverse of A
            let A_pinv = math.pinv(A_mat);
        
            // solve for parameters: params = A_pinv * B
            let paramsLat = math.multiply(A_pinv, B_lat_mat);
            let paramsLon = math.multiply(A_pinv, B_lon_mat);
        
            // convert solutions to arrays
            paramsLat = paramsLat.valueOf().flat();
            paramsLon = paramsLon.valueOf().flat();
        
            return { paramsLat, paramsLon };
        }
        
        
        function imageToGeo(x, y) {
            let a0 = paramsLat[0], a1 = paramsLat[1], a2 = paramsLat[2], a3 = paramsLat[3];
            let b0 = paramsLon[0], b1 = paramsLon[1], b2 = paramsLon[2], b3 = paramsLon[3];
        
            let lat = a0 + a1 * x + a2 * y + a3 * x * y;
            let lon = b0 + b1 * x + b2 * y + b3 * x * y;
        
            return { latitude: lat, longitude: lon };
        }

        class DraggableSquare {
            constructor(x, y, w, h, col, number) {
                this.x = x;
                this.y = y;
                this.w = w;
                this.h = h;
                this.col = col;
                this.number = number;
                this.dragging = false;
            }

            show() {
                p.fill(this.col);
                p.noStroke();
                p.rect(this.x, this.y, this.w, this.h);
            }

            showNumber() {
                p.fill(255, 255, 255);
                p.textSize(this.w * 0.8);
                p.textAlign(p.CENTER, p.CENTER);
                p.textFont('Arial');
                p.text(this.number, this.x + this.w / 2, this.y + this.h / 2);
            }

            update(mx, my) {
                if (this.dragging) {
                    this.x = mx - this.w / 2;
                    this.y = my - this.h / 2;
                }
            }

            pressed(mx, my) {
                if (mx > this.x && mx < this.x + this.w && my > this.y && my < this.y + this.h) {
                    this.dragging = true;
                }
            }

            released() {
                this.dragging = false;
            }

            contains(px, py) {
                return px > this.x && px < this.x + this.w && py > this.y && py < this.y + this.h;
            }
        }
    };

    new p5(sketch);
});
