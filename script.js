$(function (){
    const canvas = $("#canvas");
    const context = canvas[0].getContext("2d");
    const width = canvas.width()
    const height = canvas.height()
    const cellWidth = 12;

    const stageColor = "#ffffff", stageStrokeColor = "#000000";
    const snakeHeadColor = "#0000ff", snakeHeadStrokeColor = "#000000"
    const snakeBodyColor = "#0080ff", snakeBodyStrokeColor = "#000000";
    const foodColor = "#ff0000", foodStrokeColor =  "#000000";
    const loseDarkStageColor = "rgba(0,0,0,0.1)",
        loseSnakeHeadCircleColor = "rgba(255,0,0,0.35)",
        loseTextColor = "#000000";
    const scoreTextColor = "#000000";

    let slowRepetition = 90;
    let normalRepetition = 65;
    let fastRepetition = 45;
    //  default speed
    let currenSpeed = "normal";
    let gameRepetition = normalRepetition;

    let snake, food;
    const snakeInitialSize = 3;
    //  initial score
    let score = 0;
    let currentDirection, newDirection;
    let gameLoopInterval, timeoutToStart;

    let started = false, lost = false, paused = false, autoStart = false;

    const startButton = $("#start");
    const pauseButton = $("#pause");
    const resumeButton = $("#resume");
    const restartButton = $("#restart");
    const checkbox = $(".checkbox");
    const checkboxInput = $("input[type=checkbox]");
    const radioButton = $(".radio-button");
    const radioInputs = $("input[type=radio]");

    paintStage();

    function start(){
        if (autoStart && lost)
            clearTimeout(timeoutToStart);

        //  default direction
        newDirection = currentDirection = "right";
        score = 0;
        lost = false;

        createSnake();
        createFood();
        
        if (gameLoopInterval !== "undefined")
            clearInterval(gameLoopInterval);
        gameLoopInterval = setInterval(gameLoop, gameRepetition);
    }

    function gameLoop(){
        let x_snakeHeadPosition = snake[0].x;
        let y_snakeHeadPosition = snake[0].y;

        switch (newDirection) {
            case "right":
                x_snakeHeadPosition++;
                break;
            case "left":
                x_snakeHeadPosition--;
                break;
            case "up":
                y_snakeHeadPosition--;
                break;
            case "down":
                y_snakeHeadPosition++;
                break;
            default:
                break;
        }
        currentDirection = newDirection;

        if (checkLose(x_snakeHeadPosition, y_snakeHeadPosition)){
            clearInterval(gameLoopInterval);
            lost = true;
            lose();
            return;
        }

        //  put the new head for the snake
        snake.unshift({x: x_snakeHeadPosition, y: y_snakeHeadPosition});

        //  if the snake eats food, its tail will not be cut off
        if (x_snakeHeadPosition === food.x && y_snakeHeadPosition === food.y){
            score++;
            createFood();
        }
        else
            snake.pop();

        //  to erase the snake trail in every move we need to paint the background on every interval
        paintStage();
        paintFood();
        paintSnake();
        writeScore();
    }

    function checkLose(x, y){
        //  check collision with the wall
        if (x === -1 || x === width / cellWidth || y === -1 || y === height / cellWidth)
            return true;
        //  check collision with itself
        for (let i = snake.length - 1; i > 2; i--)
            if (x === snake[i].x && y === snake[i].y)
                return true;
        return false;
    }

    function lose(){

        //  darken the stage
        context.fillStyle = loseDarkStageColor;
        context.fillRect(0, 0, width, height);
        //  paint snake head circle
        context.beginPath();
        context.arc(snake[0].x * cellWidth + cellWidth / 2, snake[0].y * cellWidth + cellWidth / 2
            , 20, 0, 2 * Math.PI);
        context.fillStyle = loseSnakeHeadCircleColor;
        context.fill();
        //  write "You Lost!"
        context.font = "bold 40px monospace";
        context.fillStyle = loseTextColor;
        context.textAlign = "center";
        context.fillText("You Lost!", width / 2, height / 2);

        startButton.css("display", "unset");
        pauseButton.css("display", "none");
        resumeButton.css("display", "none");
        restartButton.css("display", "none");

        if (autoStart)
            timeoutToStart = setTimeout(function (){
                startButton.click();
            }, 1000);
    }

    function createSnake(){
        snake = [];
        //  position of snake's head is on first element of array
        for (let i = snakeInitialSize; i > 0; i--)
            snake.push({x: i, y: 1});
    }

    function createFood(){
        food = {
            //  generate random number between 0 and (width/cellWidth)
            x: Math.floor(Math.random() * width / cellWidth),
            //  generate random number between 0 and (height/cellWidth)
            y: Math.floor(Math.random() * height / cellWidth),
        }
        //  if the food is on snake, call itself again
        for (const cell of snake)
            if (food.x === cell.x && food.y === cell.y){
                createFood()
                break;
            }
    }

    function paintStage(){
        context.fillStyle = stageColor;
        context.fillRect(0, 0, width, height);
        context.strokeStyle = stageStrokeColor;
        context.strokeRect(0, 0, width, height);
    }

    function writeScore(){
        context.font = "15px monospace";
        context.fillStyle = scoreTextColor;
        context.textAlign = "left";
        context.fillText("Score: " + String(score), 10, height - 10);
    }

    function paintSnake(){
        //  paint body of snake
        for (let i = snake.length - 1; i > 0; i--){
            context.fillStyle = snakeBodyColor;
            context.fillRect(snake[i].x * cellWidth, snake[i].y * cellWidth, cellWidth, cellWidth);
            context.strokeStyle = snakeBodyStrokeColor;
            context.strokeRect(snake[i].x * cellWidth, snake[i].y * cellWidth, cellWidth, cellWidth);
        }
        //  paint head of snake
        context.fillStyle = snakeHeadColor;
        context.fillRect(snake[0].x * cellWidth, snake[0].y * cellWidth, cellWidth, cellWidth);
        context.strokeStyle = snakeHeadStrokeColor;
        context.strokeRect(snake[0].x * cellWidth, snake[0].y * cellWidth, cellWidth, cellWidth);
    }

    function paintFood(){
        context.fillStyle = foodColor;
        context.fillRect(food.x * cellWidth, food.y * cellWidth, cellWidth, cellWidth);
        context.strokeStyle = foodStrokeColor;
        context.strokeRect(food.x * cellWidth, food.y * cellWidth, cellWidth, cellWidth);
    }

    $(document).keydown(function (event){
        switch (event.key) {
            case "ArrowRight":
                if (currentDirection !== "left")
                    newDirection = "right";
                break;
            case "ArrowLeft":
                if (currentDirection !== "right")
                    newDirection = "left";
                break;
            case "ArrowUp":
                if (currentDirection !== "down")
                    newDirection = "up";
                break;
            case "ArrowDown":
                if (currentDirection !== "up")
                    newDirection = "down";
                break;
            default:
                break;
        }
    });

    startButton.click(function (){
        startButton.css("display", "none");
        pauseButton.css("display", "unset");
        resumeButton.css("display", "none");
        restartButton.css("display", "none");

        started = true;
        paused = false;

        start();
    });

    pauseButton.click(function (){
        startButton.css("display", "none");
        pauseButton.css("display", "none");
        resumeButton.css("display", "unset");
        restartButton.css("display", "unset");

        paused = true;

        clearInterval(gameLoopInterval);
    });

    resumeButton.click(function (){
        startButton.css("display", "none");
        pauseButton.css("display", "unset");
        resumeButton.css("display", "none");
        restartButton.css("display", "none");

        paused = false;

        if (gameLoopInterval !== "undefined")
            clearInterval(gameLoopInterval);
        gameLoopInterval = setInterval(gameLoop, gameRepetition);
    });

    restartButton.click(function (){
        startButton.click();
    });

    checkbox.click(function (event){
        event.preventDefault();
        checkboxInput[0].checked = !checkboxInput[0].checked;

        autoStart = checkboxInput[0].checked;

        if (!autoStart)
            clearTimeout(timeoutToStart);
    });

    radioButton.click(function (){
        let speedChanged = false;

        if (radioInputs[0].checked && currenSpeed !== "slow"){
            currenSpeed = "slow";
            gameRepetition = slowRepetition;
            speedChanged = true;
        }
        if (radioInputs[1].checked && currenSpeed !== "normal"){
            currenSpeed = "normal";
            gameRepetition = normalRepetition;
            speedChanged = true;
        }
        if (radioInputs[2].checked && currenSpeed !== "fast"){
            currenSpeed = "fast";
            gameRepetition = fastRepetition;
            speedChanged = true;
        }

        if (speedChanged && started && !lost && !paused){
            clearInterval(gameLoopInterval)
            gameLoopInterval = setInterval(gameLoop, gameRepetition);
        }
    });
});
