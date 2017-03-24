// Grab canvas element and establish context
var canvas = document.getElementById('gameCanvas');
var ctx = canvas.getContext('2d');

// Keypress and gamestate variables
var keypressed = false;
var gameOver = false;

// I found a way to optimize the canvas animation performance by pre-rending the frame 
// onto an existing blank canvas, and then drawing the image of the pre-rendered canvas onto 
// the main game canvas. I learned about this from here : 
// https://www.html5rocks.com/en/tutorials/canvas/performance/
var pre_canvas = document.createElement('canvas');
pre_canvas.width = 900;
pre_canvas.height = 400;
var pre_context = pre_canvas.getContext('2d');

// Computes the destination for the left bumper to travel to
leftBumperWidth = function() {
    return (Math.floor(Math.random() * 300));
};
// Computes the destination for the right bumper to travel to
rightBumperWidth = function() {
    return (Math.floor(Math.random() * 300));
};
// Assigns a new left bumper destination value every 1 second
setInterval(function() {
    leftBumper.xDest = leftBumperWidth();
}, 750);
// Assigns a new right bummper destination value every 1 second
setInterval(function() {
    rightBumper.xDest = canvas.width - rightBumperWidth();
}, 750);

// Constructor function for the avatar sprite
// Learned about drawing sprites on canvas from https://www.youtube.com/watch?v=I3Ik81Ku3lA
var Sprite = function(filename, xCoord, yCoord) {
    this.image = new Image();
    this.image.src = filename;
    this.xCoord = xCoord;
    this.yCoord = yCoord;
    this.yVel = 0;
    this.gravity = 0.25;
    // Checks if the avatar is past or under the "ground"
    // If the avatar is past, it sets the yCoord to ground level, and sets yVel to 0
    // If the avatar is above ground (mid jump), it adds the velocity and gravity variables...
    // ...this is to recreate a "gravity" effect, where we increase the yCoord at a decreasing rate.
    // Next it adds the yCoord and yVel variables, in order to create a jump effect.
    this.update = function() {
        if (this.yCoord + this.yVel + 15 > canvas.height / 2) {
            this.yVel = 0;
            this.yCoord = canvas.height / 2 - 15;

        } else {
            this.yVel += this.gravity;
            this.yCoord += this.yVel;
        }
    };
    // Function to draw the sprite
    this.draw = function(w, h) {
        ctx.drawImage(this.image, this.xCoord, this.yCoord, this.image.width, this.image.height);
    };

};

// Object for the ground
var ground = {
    xCoord: 0,
    yCoord: canvas.height / 2,
    width: canvas.width,
    height: canvas.height / 2,
    color: "black",
};

// Object for left bumper
var leftBumper = {
    xCoord: 0,
    yCoord: 0,
    width: 50,
    height: canvas.width / 2,
    color: 'black',
    xVel: 3,
    xDest: 50,
    // The AI for the left bumper
    // Checks where the xDest is, and depending on if the bumper is too thin or too...
    // ...thick, it sets the xVel to 3 and adds that to the width, creating a growing and...
    // ...shrinking effect
    // Lastly it checks if the width is within 3 units of the xDest, the reason that it is...
    // set to 3 and not the exact value, is because I use a xVel of 3, and in some cases it would...
    // be impossible to get the width to the exact value, cause a rpid stuttering effect on screen.
    // By assigning the acceptable value to an attainable range we negate this effect.
    update: function() {
        if (leftBumper.xDest > leftBumper.width) {
            leftBumper.xVel = 3;
            leftBumper.width += leftBumper.xVel;
        } else if (leftBumper.width < leftBumper.xDest + 3 && leftBumper.width > leftBumper.xDest - 3) {
            leftBumper.xVel = 0;
        } else {
            leftBumper.xVel = 3;
            leftBumper.width -= leftBumper.xVel;
        }

    },

};

// Object for right bumper
var rightBumper = {
    xCoord: canvas.width - 25,
    yCoord: 0,
    width: 50,
    height: canvas.height / 2,
    color: 'black',
    xVel: 3,
    xDest: canvas.width - 50,
    // The AI for the right bumper
    // Checks where the xDest is, and depending on if the bumper is too thin or too...
    // ...thick, it sets the xVel to 3 and adds that to the width and subtracts it from the xCoord
    // ...thus,  creating a growing and shrinking effect.
    // Lastly it checks if the width is within 3 units of the xDest, the reason that it is...
    // set to 3 and not the exact value, is because I use a xVel of 3, and in some cases it would...
    // be impossible to get the width to the exact value, cause a rpid stuttering effect on screen.
    // By assigning the acceptable value to an attainable range we negate this effect.
    update: function() {
        if (rightBumper.xCoord > canvas.width) {
            rightBumper.xCoord = canvas.width - 10;
        }

        if (canvas.width - rightBumper.xDest > rightBumper.width) {
            rightBumper.xVel = 3;
            rightBumper.xCoord -= rightBumper.xVel;
            rightBumper.width += rightBumper.xVel;
        } else if (rightBumper.width < canvas.width - rightBumper.xDest + 3 && rightBumper.width > canvas.width - rightBumper.xDest - 3) {
            rightBumper.xVel = 0;
        } else {
            rightBumper.xVel = 3;
            rightBumper.xCoord += rightBumper.xVel;
            rightBumper.width -= rightBumper.xVel;
        }
    },
};

// Object for the ball projectile
var ball = {
    xCoord: 60,
    yCoord: canvas.height / 2 - 10,
    radius: 5,
    color: 'black',
    xVel: 3,
    // Function to compute the animation for the ball
    // Computes the directional changes based on which side the projectile...
    // ...bounces off at. Also sets a max value for the xVel of 12.
    update: function() {
        ball.xCoord += ball.xVel;
        if (ball.xCoord > rightBumper.xCoord || ball.xCoord === rightBumper.xCoord) {
            ball.xCoord = rightBumper.xCoord;
            ball.xVel = Math.floor(ball.xVel * -1);
            if (Math.abs(ball.xVel) > 25) {
                ball.xVel = -25;
            }

        } else if (ball.xCoord < leftBumper.width || ball.xCoord === leftBumper.width) {
            ball.xCoord = leftBumper.width;
            ball.xVel = Math.floor(ball.xVel * -1);
            if (Math.abs(ball.xVel) > 25) {
                ball.xVel = 25;
            }
        }


    },
};

// Object for the score
var score = {
    count: 0,
    font: "30px Veranda",
    color: "white",
    xCoord: canvas.width / 2,
    yCoord: canvas.height / 2 + 100,
    highScore: 0,
    getHighScore: false,
    // Function to compute the score, and incriment the xVel 
    // Increases the score by 1 each time the projectile is dodged
    // Increases the xVel by 5% each time the projectile is dodged
    update: function() {
        if (ball.xCoord > image.xCoord && ball.xCoord < image.xCoord + Math.abs(ball.xVel) + 1 && image.yCoord < canvas.height / 2 - 15) {
            score.count++;
            ball.xVel *= 1.05;
        } else if (ball.xCoord + ball.radius > image.xCoord && ball.xCoord + ball.radius < image.xCoord + image.image.width + ball.radius && image.yCoord > canvas.height / 2 - 30) {
            ball.xCoord = 60;
            if (score.count > score.highScore) {
                score.highScore = score.count;
                score.getHighScore = true;
            }
            leftBumper.width = 50;
            rightBumper.width = 50;
            rightBumper.xCoord = canvas.width - 25;
            ball.xVel = 3;
            gameOver = true;

        }

    },
};

//  Creates the canvas shapes / sprites
function createObj(obj, isCircle, isText) {
    if (isCircle) {
        pre_context.fillStyle = obj.color;
        pre_context.beginPath();
        pre_context.arc(obj.xCoord, obj.yCoord, obj.radius, 0, 2 * Math.PI);
        pre_context.fill();
    } else if (isText) {
        pre_context.fillStyle = obj.color;
        pre_context.font = "30px Verdana";
        pre_context.fillText(obj.count, obj.xCoord, obj.yCoord);
        pre_context.font = "15px Verdana";
        pre_context.fillText("HS: " + obj.highScore, obj.xCoord - 15, obj.yCoord + 25);
    } else {
        pre_context.fillStyle = obj.color;
        pre_context.fillRect(obj.xCoord, obj.yCoord, obj.width, obj.height);
    }
}

// Calls createObj to create canvas objects
drawAll = function() {
    image.draw(15, 15);
    createObj(ground, false, false, false);
    createObj(rightBumper, false, false, false);
    createObj(leftBumper, false, false, false);
    createObj(ball, true, false, false);
    createObj(score, false, true, false);
};

// Function to update the positions of all the objects drawn on the pre-rendered canvas
updateAll = function() {
    // Calls the function to compute jump
    image.update();
    // Calls the functions for the wall AI
    // Updating the xCoord and width of the left and right bumper objects
    leftBumper.update();
    rightBumper.update();
    // Calls the function for the ball animation
    ball.update();
    // Calls the function for the players score
    score.update();
}

// sets RequestAnimationFrame for each browser to a variable
// uses setInterval as a backup
// For those unfamiliar https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
// Helps with optimization and smoother animations
var requestAnimation = window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    setInterval;

// Loading in the image
var AVATAR = "avatar.png";
var image = new Sprite(AVATAR,canvas.width / 2, canvas.height / 2 - 15);


// Animates the movement on the canvas
setInterval(animate =  function() {
    // Clears the canvas each frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (gameOver) {
        ctx.font = "20px Verdana";
        ctx.fillStyle = "black";
        if (score.getHighScore) {
            ctx.fillText("You set a new highscore with a score of " + score.count, canvas.width / 2 - 200, canvas.height / 4);
        } else {
            ctx.fillText("Your score was " + score.count, canvas.width / 2 - 60, canvas.height / 4);
        }
        ctx.fillText("Press spacebar to play again", canvas.width / 2 - 125, canvas.height / 4 + 50);

    } else {
        // Draws everything each frame
        drawAll();
        ctx.drawImage(pre_canvas, 0, 0);
        pre_context.clearRect(0, 0, pre_canvas.width, pre_canvas.height);
        // Checks if the avatar is mid jump ,Checks if the jump key was pressed
        // If true, increases the yVel of the avatar effectively jumping
        // Sets yVel to -8 to initiate the jump
        // Sets keypressed to false because we only want to jump once
        if (keypressed && image.yCoord === canvas.height / 2 - 15) {
            image.yVel = -8;
            keypressed = false;
        }
        // Calls function to update all positions for movements
        updateAll();
    }


    //requestAnimation(animate);
}, 10)
animate();

// Event listener to call when spacebar or up-arrow keys are pressed
document.addEventListener("keydown", function(e) {
    if (e.keyCode === 32 || e.keyCode === 38) {
        // Checks the height to avoid jump firing while mid jump
        if (image.yCoord > canvas.height / 2 - 50) {
            keypressed = true;
            if (gameOver) {
                gameOver = false;
                score.count = 0;
                score.getHighScore = false;
            }
        }
    }
});