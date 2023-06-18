let endGame = false; // flag to check if the game is over
let eventsListenerForInput = true;
let wordSize = 0; // font size of the word in the grid

// message to display the current player's turn and the winner or tie
let message = document.querySelector("#action-message");

const playerXBanner = document.querySelector("#playerX");
const playerOBanner = document.querySelector("#playerO");

const input = document.querySelector("#input");
const submit = document.querySelector("#go");
const gridToPrint = document.querySelector("#grid-message");
const scoreBoard = document.querySelector(".score-board");
const actionMessage = document.querySelector("#action-message");

// First player is X
playerXBanner.style.backgroundColor = "#0983d5";

const winningCombos ={
    horizontal:[],
    vertical:[],
    diagonal:[[], []],
}

const deriveWinningCombos = (gridSize) => {
    for (let i=0; i<gridSize; i++){
        winningCombos.horizontal.push([]); // row
        winningCombos.vertical.push([]); // column
        for (let j=0; j<gridSize; j++){
            // increment of 1 pattern for horizontal pattern, eg 0,1,2
            winningCombos.horizontal[i].push(i*gridSize+j);
            // increment of gridSize for vertical pattern. eg 0,3,6
            winningCombos.vertical[i].push(j*gridSize+i); 
        }
        // in every board, there are only 2 diagonal winning combinations
        winningCombos.diagonal[0].push(i*gridSize+i); // eg 0,4,8
        winningCombos.diagonal[1].push((gridSize-1)*(i+1)); // eg 2,4,6
    }
    console.log(winningCombos);
}

// set up the game board
const createGrid = (index) => {
    const squareDiv = document.createElement("div");
    squareDiv.classList.add("square-grid");
    squareDiv.setAttribute("id", `${index}`);
    document.querySelector(".board").appendChild(squareDiv);
}

const hideButtons = () => {
    resetBtn.style.display = "none";
    changeSizeBtn.style.display = "none";
};

const showButtons = () => {
    resetBtn.style.display = "inline-block";
    changeSizeBtn.style.display = "inline-block";
};

const hideInputField = () => {
    input.style.display = "none";
    submit.style.display = "none";
};

const showInputField = () => {
    input.style.display = "block";
    submit.style.display = "flex";
};

// styling and creating game board base on user input
const styleAndCreateBoard = (gridSize) => {
    // set up grid style in js for customisability
    gameBoard.style.display = "grid";
    gameBoard.style.gridTemplateColumns = `repeat(${gridSize.toString()}, 1fr)`;
    gameBoard.style.gridTemplateRows = `repeat(${gridSize.toString()}, 1fr)`;
    gameBoard.style.width = "600px";
    gameBoard.style.height = "600px";
    gameBoard.style.gap = "3px";

    for (let i=0; i<gridSize*gridSize; i++){
        createGrid(i);
    }
    // hide the input and submit button
    hideInputField();

    // display the grid size and score board and action message
    gridToPrint.style.display = "block";
    scoreBoard.style.display = "flex";
    actionMessage.style.display = "block";

    // display the grid size
    gridToPrint.innerText = `Grid size: ${gridSize} x ${gridSize}`;

    // stop listening to enter key and submit button
    eventsListenerForInput = false;
    
    deriveWinningCombos(gridSize);

    // initialize the game
    const cells = document.querySelectorAll(".square-grid");

    // make font size according to the grid size
    const cellWidth = window.getComputedStyle(cells[0]).getPropertyValue("width");
    wordSize = parseInt(cellWidth) * 0.5;

    cells.forEach(cell => {
        // console.log("testtest");
        cell.style.fontSize = `${wordSize}px`;
        cell.addEventListener("click", handleClick);
    });
    resetBtn.addEventListener("click", ()=>{
        clearBoard();
    });
    // mediaQuery.addEventListener("change", mediaQueryHandler);
}

let gridSize=0;
const gameBoard = document.querySelector(".board");

// event handler for enter key press 
const enterKeyPressHandler = (event) => {
    if (event.key === "Enter" && eventsListenerForInput && input.value !== "" && parseInt(input.value) > 2){
        gridSize = input.value;
        styleAndCreateBoard(gridSize);
    }
}

// event handler for go button click
const goButtonClickHandler = () => {
    if (eventsListenerForInput && input.value !== "" && parseInt(input.value) > 2){
        gridSize = input.value;
        styleAndCreateBoard(gridSize);
    }
}

// Add event listeners
input.addEventListener("keypress", enterKeyPressHandler);
submit.addEventListener("click", goButtonClickHandler);

// set up the player configuration to keep track of the player's moves, turn and current score
const playerConfig={
    playerX: {
        move: "X",
        score: 0,
        turn: true,
        playerBox: [],
    },
    playerO: {
        move: "O",
        score: 0,   
        turn: false,
        playerBox: [],
    },
}    

const tie = () => {
    setTimeout(()=>{alert("It's a draw!")}, 100);
    endGame = true;
    showButtons();
    message.innerText = "It's a draw!";
};

let winCells = []; // array to store the winning cells

// check combinations to see if there is a winner
const checkWinner = (currentPlayer) =>{
    const cells = document.querySelectorAll(".square-grid");
    // get the winning combinations
    let horizontal = winningCombos.horizontal;
    let vertical = winningCombos.vertical;
    let diagonal = winningCombos.diagonal;

    let winner = "";
    // sort the 'playerBox' array to make it easier to compare with the winning combinations
    const playerMoves = playerConfig[currentPlayer].playerBox.sort((a,b)=>a-b);

    // combine all the winning combinations
    let winCombos = [...horizontal, ...vertical, ...diagonal];
    console.log(winCombos);
    // check if the player's moves match any of the winning combinations
    for (let i=0; i<winCombos.length; i++){
        // if player's moves matches win combo, the current player won
        if (winCombos[i].every(item => playerMoves.includes(item))){
            winner = currentPlayer;
            // update score board
            playerConfig[currentPlayer].score += 1;
            endGame = true; // set the flag to true
            // make winning cells flash
            winCells = winCombos[i];
            winCells.forEach(winningCell => {
                // document.getElementById(winningCell.toString()).style.backgroundColor = "#9bd778";
                document.getElementById(winningCell.toString()).classList.add('glow');
            });
            break;
        }
    }
    let updateScore = document.querySelector(`#${currentPlayer}-score`);
    
    let maxNumMoves = 0;
    let playerList = Object.keys(playerConfig);
    let nextPlayer = "";

    if (currentPlayer === playerList[0]){
        nextPlayer = playerList[1];
    }
    else{
        nextPlayer = playerList[0];
    }

    if (winner === ""){
        // if no winner and the grid size is even, check if the number of moves is equal to half of the grid size for the next player
        if (gridSize%2 === 0){
            maxNumMoves = gridSize*gridSize/2;
            if (playerConfig[nextPlayer].playerBox.length === maxNumMoves){
                tie();
            }
        }
        // if no winner and the grid size is odd, check if the number of moves is equal to half of the grid size for the current player
        else{
            maxNumMoves = Math.ceil(gridSize*gridSize/2);
            if (playerMoves.length === maxNumMoves){
                tie();
            }
        }
    }
    else{
        // update the score board and display the winner
        updateScore.innerText = (playerConfig[currentPlayer].score).toString();
        updateScore.classList.add('glow');
        showButtons();
        // change badge colour to green
        document.querySelector(`#${currentPlayer}`).style.backgroundColor = "#9bd778";
        // make the string to print player look nicer
        let playerToPrint = currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1, currentPlayer.length-1) + " " + currentPlayer.charAt(currentPlayer.length-1);
        // display the winner
        message.innerText = `${playerToPrint} won! Losing player starts next turn.`; 
        // to delay the alert message so that the cells and message can be updated first
        setTimeout(() => { alert( ` ${currentPlayer} wins! ` ); }, 100);

        // remove the click event listener from the cells
        cells.forEach(cell => {
            cell.removeEventListener("click", handleClick);
        });
    }
}

const resetBtn = document.querySelector("#reset");
const changeSizeBtn = document.querySelector("#change");

// reset after the game is over
const clearBoard =()=>{
    const cells = document.querySelectorAll(".square-grid");
    cells.forEach(cell=>cell.innerText=""); // clear the board
    playerConfig.playerX.playerBox = [];
    playerConfig.playerO.playerBox = [];
    // winCells = [];
    winCells.forEach(winningCell => {
        // document.getElementById(winningCell.toString()).style.backgroundColor = "#4d5361";
        document.getElementById(winningCell.toString()).classList.remove('glow');
    });
    // reset the colour of the banner and remove the glow effect
    if (playerConfig.playerX.turn){
        playerOBanner.style.backgroundColor = "#E2584D";
        document.querySelector("#playerO-score").classList.remove('glow');
    }
    else{
        playerXBanner.style.backgroundColor = "#E2584D";
        document.querySelector("#playerX-score").classList.remove('glow');
    }
    hideButtons();

    // Restart the game recursively
    cells.forEach(cell => {
        cell.addEventListener("click", handleClick);
    });
    endGame = false;
}

const changeSize = () => {
    const cells = document.querySelectorAll(".square-grid");
    showInputField();
    hideButtons();
    actionMessage.style.display = "none";

    // reset the current grid winning combinations
    winningCombos.horizontal = [];
    winningCombos.vertical = [];
    winningCombos.diagonal = [[], []];
    
    eventsListenerForInput=true;
    clearBoard();

    // delete the current board
    for (let i=0; i<gridSize*gridSize; i++){
        document.getElementById(i.toString()).remove();
    }
    // stop listening to the click event on the cells
    cells.forEach(cell => {
        cell.removeEventListener("click", handleClick);
    });

    input.addEventListener("keypress", enterKeyPressHandler);
    submit.addEventListener("click", goButtonClickHandler);
    changeSizeBtn.removeEventListener("click", changeSize);
    endGame = false;

}

// const cells = document.querySelectorAll(".square-grid");

const playerMove = (currentPlayer, nextPlayer, event) => {
    // update the cell with the current player's move
    event.target.innerText = playerConfig[currentPlayer].move; 
    // playerConfig[currentPlayer].turn = false;
    playerConfig[nextPlayer].turn = true; // switch to next player's turn
    playerConfig[currentPlayer].turn = !playerConfig[nextPlayer].turn;
    // store the cell which current player clicked
    playerConfig[currentPlayer].playerBox.push(parseInt(event.target.id));
    // change the banner color to indicate the current player's turn, blue indicates next player's turn
    document.querySelector(`#${nextPlayer}`).style.backgroundColor = "#0983d5";
    document.querySelector(`#${currentPlayer}`).style.backgroundColor = "#E2584D";
    // check if there is a winner
    if (checkWinner(currentPlayer) || endGame){
        return;
    }
    else{
        message.innerText = `Player ${playerConfig[nextPlayer].move}'s turn`;
    }
}

// handle the click events
const handleClick = (event) =>{
    // round is over, prevent further clicks by returning 
    if (endGame){
        return;
    }
    actionMessage.style.display = "block";
    // if x turn and the cell is empty, place x in the cell
    if (playerConfig.playerX.turn && event.target.innerText === ""){
        playerMove("playerX", "playerO", event);
    }
    // if o turn and the cell is empty, place o in the cell
    else if (playerConfig.playerO.turn && event.target.innerText === ""){
        playerMove("playerO", "playerX", event);
    }
    else{
        //if the user clicks on an occupied cell, alert the user
        alert("This cell is occupied, please choose another one!")
    }
    console.log(playerConfig);
}

// change the size of the grid
changeSizeBtn.addEventListener("click", ()=>{
    changeSize();
});


// // js overwrites the css media query, so we need to use js to detect the screen size
const mediaQuery = window.matchMedia('(max-width: 768px)');
const mediaQueryHandler = (event) => {
    const board = document.querySelector(".board");
    const cells = document.querySelectorAll(".square-grid");
    // if the screen size is less than 768px, change the board size and font size
    if (event.matches){
        board.style.width = "300px";
        board.style.height = "300px";
        cells.forEach(cell => {
            cell.style.fontSize = `${wordSize/2}px`;
        });
    }
    // if the screen size is more than 768px, change it back
    else{
        board.style.width = "600px";
        board.style.height = "600px";
        cells.forEach(cell => {
            cell.style.fontSize = `${wordSize}px`;
        });
    }
}

// mediaQueryHandler(mediaQuery);
mediaQuery.addEventListener("change", ()=>{
    mediaQueryHandler(mediaQuery);
})  // Attach listener function on state changes