document.addEventListener('DOMContentLoaded', function () {
    let container = document.getElementById('canvasContainer');
    container.style.position = 'relative';

    let sketch = function (p) {
        let dotX, dotY;
        let canvasSize = 800;
        let dotSize = 30;
        let moveW = false, moveA = false, moveS = false, moveD = false;
        let overlayImage;
        let blueSquares = [];
        let draggingSquareIndex = -1;

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
                blueSquares = savedSquares.map(sq => new DraggableSquare(sq.x, sq.y, sq.w, sq.h, p.color(255, 0, 0, 100)));
            } else {
                blueSquares.push(new DraggableSquare(150, 150, 80, 80, p.color(255, 0, 0, 100)));
            }

            // create + button
            let addButton = p.createButton('+');
            addButton.position(p.width * 0.9, p.height * 0.25);
            addButton.style('background-color', '#92b7c1');
            addButton.style('color', 'white');
            addButton.style('font-size', '40px');
            addButton.style('padding', '10px 20px');
            addButton.style('border', '#92b7c1');
            addButton.style('border-radius', '5px');
            addButton.mousePressed(addSquare);
        };

        p.draw = function () {
            p.clear();
            p.image(overlayImage, 0, 0, canvasSize, canvasSize);

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
            });

            p.fill('#cb3431');
            p.noStroke();
            p.ellipse(dotX, dotY, dotSize, dotSize);

            blueSquares.forEach(square => {
                if (square.contains(dotX, dotY)) {
                    console.log('entered');
                }
            });
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
            blueSquares.push(new DraggableSquare(150, 150, 80, 80, p.color(255, 0, 0, 100)));
            saveBlueSquares(); // save squares after adding
        }

        function saveBlueSquares() {
            let squaresData = blueSquares.map(square => ({
                x: square.x,
                y: square.y,
                w: square.w,
                h: square.h
            }));
            localStorage.setItem('blueSquares', JSON.stringify(squaresData));
        }

        class DraggableSquare {
            constructor(x, y, w, h, col) {
                this.x = x;
                this.y = y;
                this.w = w;
                this.h = h;
                this.col = col;
                this.dragging = false;
            }

            show() {
                p.fill(this.col);
                p.noStroke();
                p.rect(this.x, this.y, this.w, this.h);
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
