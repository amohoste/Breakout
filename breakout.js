/**
 * Created by amoryhoste on 16/05/17.
 */

function breakout(args) {

    /**
     * Object dat alle mogelijke kleuren bevat en dat een random kleur kan teruggeven
     */
    Colors = {};

    // Stel mogelijke kleuren in op meegegeven kleuren
    Colors.names = args.colors;

    // Genereert een random nieuwe kleur die verschilt van de meegegeven kleur
    Colors.random = function(color) {
        let keys = Object.keys(this.names);
        let result;

        // Als er meer dan een kleur is
        if (keys.length > 1) {
            result = this.names[keys[keys.length * Math.random() << 0]];

            // Zorgt ervoor dat de vorige kleur niet opnieuw wordt gegenereerd
            while (result === color) {
                result = this.names[keys[keys.length * Math.random() << 0]];
            }
        } else {
            result = this.names[keys[keys.length * Math.random() << 0]];
        }
        return result;
    };


    /*
     * Klassen
     */

    /**
     * Stelt een balletje voor
     */
    class Ball {

        constructor(x, y, dx, dy, speed, radius) {
            // Beginpositie
            this.x = x;
            this.y = y;

            // Verplaatsing
            this.dx = dx;
            this.dy = dy;
            this.speed = speed;

            // Straal
            this.radius = radius;
        }

        // Tekent het balletje
        draw() {
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            ctx.fillStyle = Colors.names.default;
            ctx.fill();
            ctx.closePath();
        }

        // Verandert de x en y coordinaat
        move() {
            this.x += this.speed * this.dx;
            this.y += this.speed * this.dy;
        }

        // Verhoogt de snelheid
        upSpeed() {
            this.speed = Math.min(this.speed + 0.2, 5);
        }

        // Kijkt of het balletje met een blokje botst
        checkBricks() {
            for (let i = 0; i < columnCount; i++) {
                for (let j = 0; j < rowCount; j++) {
                    let b = bricks[i][j];

                    // Zorgt ervoor dat zoeken stopt bij botsing
                    if (b.checkCollidesWith(this)) {
                        return true;
                    }
                }
            }
            return false;
        }

        // Kijkt of balletje tegen een muur botst
        checkWalls() {
            if (this.x + this.dx > canvas.width - this.radius || this.x + this.dx < this.radius) {
                this.dx = -this.dx;
            }
            if (this.y + this.dy < this.radius) {
                this.dy = -this.dy;
            }

            if (this.y + this.dy > canvas.height + this.radius) {
                this.handleMiss();
            }
        }

        // Opgeroepen wanneer wanneer het balletje tegen de onderkant botst
        handleMiss() {
            lives -= 1;
            if (!lives) {
                alert("GAME OVER");
                document.location.reload();
            } else {
                this.x = (paddle.x + paddle.width / 2);
                this.y = paddle.y - ball.radius;
                this.dx = 1;
                this.dy = -1;
                this.speed = 2;
            }
        }

        // Kijkt of het balletje botst
        checkCollision() {
            // Zorgt ervoor dat er geen onnodig werk gedaan wordt (wanneer het balletje bv.
            // tegen de paddle botst kan deze niet tegen een blokje botsen)
            if (!paddle.checkCollidesWith(this)) {
                if (!this.checkBricks()) {
                    this.checkWalls();
                }
            }
        }
    }

    /**
     * Stelt een blokje voor
     */
    class Brick {

        constructor(height, width, x, y, status, color) {
            this.height = height;
            this.width = width;

            // Positie
            this.x = x;
            this.y = y;

            // Blokje zichtbaar of niet
            this.status = status;
            this.color = color;
        }

        // Tekent het blokje
        draw() {
            if (this.status === 1) {
                ctx.beginPath();
                ctx.rect(this.x, this.y, this.width, this.height);
                ctx.fillStyle = this.color;
                ctx.fill();
                ctx.closePath();
            }
        }

        // Kijkt of het blokje in aanraking komt met het meegegeven balletje
        checkCollidesWith(ball) {

            if (this.status === 1) {

                // Bovenkant
                if(ball.y - ball.radius > this.y && ball.y - ball.radius < this.y + this.height  &&
                    ball.x >= this.x && ball.x <= this.x + this.width && ball.dy < 0) {
                    this.hit(ball, "v");
                    return true;
                }

                // Onderkant
                else if(ball.y + ball.radius > this.y && ball.y + ball.radius < this.y + this.height  &&
                            ball.x >= this.x && ball.x <= this.x + this.width && ball.dy > 0) {
                    this.hit(ball, "v");
                    return true;
                }

                // Links
                else if (this.y <= ball.y && ball.y <= this.y + this.height && ball.x + ball.radius > this.x &&
                            ball.x - ball.radius < this.x + this.width ) {
                    this.hit(ball, "h");
                    return true;
                }

                // Rechts
                else if (this.y <= ball.y && ball.y <= this.y + this.height && ball.x - ball.radius < this.x &&
                            ball.x + ball.radius > this.x + this.width ) {
                    this.hit(ball, "h");
                    return true;
                }

            }

            // Niets geraakt
            return false;

        }

        // Opgeroepen wanneer het blokje geraakt wordt
        hit(ball, richting) {
            if (richting === "h") {
                ball.dx = -ball.dx;
            } else {
                ball.dy = -ball.dy;
            }

            this.status = 0;
            score += 1;
            changeBrickColors(Colors.random());
            if (score === rowCount * columnCount) {
                alert("YOU WIN, CONGRATULATIONS!");
                document.location.reload();
            }
        }
    }

    /**
     * Stelt een schuifbalk voor
     */
    class Paddle extends Brick {

        constructor(height, width, x) {
            super(height, width, x, canvas.height - height, 1, Colors.names.default);

            // Gebruik om richting te detecteren zodat we de hoek van de bal kunnen aanpassen
            this.movingLeft = false;
            this.movingRight = false;

            // Gebruikt om de balk te kunnen bewegen met de pijltjes
            this.moveLeft = false;
            this.moveRight = false;
        }

        // Tekent de schuifbalk
        draw() {
            super.draw()
        }

        // Beweegt de schuifbalk
        move() {
            if(this.moveRight && this.x < canvas.width - this.width) {
                this.x += 7;
            } else if(this.moveLeft && this.x > 0) {
                this.x -= 7;
            }
        }

        // Kijkt of de schuifbalk botst met het meegegeven balletje
        checkCollidesWith(ball) {
            return super.checkCollidesWith(ball);
        }

        // Wanneer de padle geraakt wordt
        hit(ball, richting) {
            if (richting === "h") {
                ball.dx = -ball.dx;
            } else {
                ball.dy = -ball.dy;
            }

            ball.upSpeed();

            // Zorgt ervoor dat balletje afbuigt wanneer paddle in beweging is
            if (this.movingLeft) {
                if (ball.dx > 0) {
                    ball.dx -= 0.35;
                } else {
                    ball.dx = Math.max(ball.dx -= 0.35, -1.75);
                }
            } else if (this.movingRight) {
                if (ball.dx > 0) {
                    ball.dx = Math.min(ball.dx += 0.35, 1.75);
                } else {
                    ball.dx += 0.35;
                }
            }
        }
    }

    /*
     * Spel
     */

    // Referentie naar canvas en 2dcontext (tekenen)
    let canvas = document.getElementById(args.canvas);
    let ctx = canvas.getContext("2d");

    // Algemene info spelbord
    let rowCount = args.rows,
        columnCount = args.columns,
        padding = args.padding,
        offsetTop = 30,
        offsetLeft = args.sidemargin,
        width = Math.round((480 - 2 * offsetLeft - (columnCount - 1) * padding) / columnCount),
        height = Math.round((80 -  (rowCount - 1) * padding) / rowCount);

    // Balletje, schuiver en blokjes
    let ball = new Ball(canvas.width / 2, canvas.height - 30, 1, -1, 2, 10);
    let paddle = new Paddle(10, 75, (canvas.width - 75)/2);
    let bricks = makeBricks();

    // Spelgegevens
    let score = 0;
    let lives = 3;

    // Maakt blokjes aan (2-dimensionale array)
    function makeBricks() {
        let bricks = [];
        for (let i = 0; i < columnCount; i++) {
            bricks[i] = [];
            for (let j = 0; j < rowCount; j++) {
                let brickX = (i * (width + padding)) + offsetLeft;
                let brickY = (j * (height + padding)) + offsetTop;
                bricks[i][j] = new Brick(height, width, brickX, brickY, 1, Colors.names.default);
            }
        }
        return bricks;
    }

    // Verandert de kleur van de blokjes
    function changeBrickColors(color) {
        for (let i = 0; i < columnCount; i++) {
            for (let j = 0; j < rowCount; j++) {
                bricks[i][j].color = color;
            }
        }
    }

    // Functie om het spel te starten
    function start() {
        // luisteraars voor de knoppen
        document.addEventListener("keydown", keyDownHandler, false);
        document.addEventListener("keyup", keyUpHandler, false);
        document.addEventListener("mousemove", mouseMoveHandler, false);

        draw();
    }

    function keyDownHandler(e) {
        if(e.keyCode == 39) {
            paddle.movingRight = true;
            paddle.moveRight = true;
        }
        else if(e.keyCode == 37) {
            paddle.movingLeft = true;
            paddle.moveLeft = true;
        }
    }

    function keyUpHandler(e) {
        if(e.keyCode == 39) {
            paddle.movingRight = false;
            paddle.moveRight = false;
        }
        else if(e.keyCode == 37) {
            paddle.movingLeft = false;
            paddle.moveLeft = false;
        }
    }

    // Gebruikt om te kijken in welke richting te muis verandert is
    let oldx = 0;

    // Gebruikt om te kijken of de muis stilstaat
    let timeout;

    function mouseMoveHandler(e) {
        // Stelt positie van de schuifbalk in aan de hand van de positie van de muis
        let relativeX = e.clientX - canvas.offsetLeft;
        if(relativeX - (paddle.width / 2)  > 0 && relativeX + (paddle.width / 2) < canvas.width) {
            paddle.x = relativeX - paddle.width/2;
        } else if (relativeX - (paddle.width / 2)  < 0) {
            // Zorgt ervoor dat als je de muis heel snel naar buiten beweegt
            // deze tegen de zijkant staat (ander staat het balkje er niet volledig tegen)
            paddle.x = 0;
        } else {
            paddle.x = canvas.width - paddle.width;
        }

        // Zorgt ervoor dat de schuifbalk weet naar welke kant hij beweegt zodat hij ervoor
        // kan zorgen dat als hij  beeegt de hoek van de bal aangepast wordt
        clearTimeout(timeout);
        if (e.clientX < oldx && paddle.x !== 0 && paddle.x !== canvas.width - paddle.width) {
            // Muis beweegt naar links
            paddle.movingLeft = true;
            paddle.movingRight = false;
        } else if (e.clientX > oldx && paddle.x !== 0 && paddle.x !== canvas.width - paddle.width) {
            // Muis beweegt naar rechts
            paddle.movingLeft = false;
            paddle.movingRight = true;
        }

        // Wanneerde muis 100ms niet beweegt wordt movingricht en left op false gezet
        timeout = setTimeout(function(){
            paddle.movingLeft = false;
            paddle.movingRight = false;
        }, 100);

        oldx = e.pageX;
    }


    // (Her)tekent alle blokjes met status 1 (zichtbaar)
    function drawBricks() {
        for (let i = 0; i < columnCount; i++) {
            for (let j = 0; j < rowCount; j++) {
                bricks[i][j].draw();
            }
        }
    }

    // Geef de score weer
    function drawScore() {
        ctx.font = "16px Arial";
        ctx.fillStyle = Colors.names.default;
        ctx.fillText("Score: " + score, offsetLeft, 20);

    }

    // Geef levens weer
    function drawLives() {
        let txt = "Lives: " + lives;
        ctx.font = "16px Arial";
        ctx.fillStyle = Colors.names.default;
        ctx.fillText(txt, canvas.width - ctx.measureText(txt).width - offsetLeft, 20);
    }

    function draw() {
        // Verwijdert alles op het canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Alles hertekenen
        drawBricks();
        ball.draw();
        paddle.draw();
        drawScore();
        drawLives();

        // Kijk of balletje botst
        ball.checkCollision();

        // Beweeg het balletje en de schuifbalk
        paddle.move();
        ball.move();

        // Zorgt ervoor dat draw door de browser telkens wordt opgeroepen
        requestAnimationFrame(draw);
    }

    // Geeft een referentie terug naar draw zodat een nieuw spel kan worden gestart
    return {
        start: start
    };

}