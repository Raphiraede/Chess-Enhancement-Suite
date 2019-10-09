	/*This Content Script is injected declaratively into Chess.com/live  */
/*
 *Scrapes Data into ChessGame object
 *Uses Finite State Machine to track game state
 *At the conclusion of a chess game,sends data to messageHandler.js, where the data is recorded.
 *Can send back an incomplete this.data object, which will include enough data to create a PGN, allowing the user to analyze a current board state mid-game
 */

 //Possible game states for ChessGame
const ChessGameState = Object.freeze({
	NOTSTARTED: "NOTSTARTED",
	INPROGRESS: "INPROGRESS",
	ENDED: "ENDED"
});

function ChessGame(){

	//this.data contains only the variables which will be recorded at the end of a game using prototype.sendDataToController.
	this.data = {
		primaryUsername: undefined,
		opponentUsername: undefined,
		whiteUser: undefined,
		blackUser: undefined,
		opening: undefined,
		moves: [],
		winner: undefined,
		loser: undefined,
		result: undefined, // 1-0 is a win for white, 0-1 is a win for black, 1/2-1/2 is a draw, and * means game is ongoing
		date: undefined,
	}

	//These variable help in tracking the game state
	this.userTimer = undefined;
	this.opponentTimer = undefined; //not yet implemented, just tracking userTimer will do for now
	this.state = ChessGameState.NOTSTARTED;
}


//Finite State Machine (cool name eh?)
//This is basically the backbone of the code, keeping track of game state and recording data along the way
//At the conclusion of a game, sends ChessGame.data to eventHandler.js
ChessGame.prototype.checkGameState = function(){
	switch(this.state){

		//Checks if timer has ticked to determine game start. usernames, colors, and date recorded here
		case ChessGameState.NOTSTARTED:
			if(this.timerHasTicked()){
				//these are boolean values, they do NOT contain the updated usernames or colors.
				const usernamesHaveUpdated = this.updateUsernames();
				const colorsHaveUpdated = this.updateColors();

				if (usernamesHaveUpdated && colorsHaveUpdated){
					this.data.date = new Date();
					this.data.result = "*"; //In PGN format, * means the game is ongoing.
					this.state = ChessGameState.INPROGRESS;
				}
			}
		break;

		//checks for endscreen to determine game end. moves and opening recorded here.
		case ChessGameState.INPROGRESS:
			this.updateMoves();
			if(this.gameHasEnded()){
				const gameWasNotAborted = this.updateGameOutcome();
				if(gameWasNotAborted){
					this.updateMoves();
					this.updateOpening();
					this.state = ChessGameState.ENDED;
				}
				else{
					this.resetChessGameData();
					this.updateUserTimer();
					this.state = ChessGameState.NOTSTARTED;
				}
			}
		break;

		//Records ChessGame.data and immediately changes state to NOTSTARTED
		case ChessGameState.ENDED:
			this.sendDataToController();
			this.resetChessGameData();
			//this.updateUserTimer is called again to prevent this.timerHasTicked from returning true again after the game has ended,
			//which would cause the same game to be recorded twice.
			this.updateUserTimer();
			this.state = ChessGameState.NOTSTARTED;
		break;
	}

	//checkGameState called recursively 5 times per second
	setTimeout(() => {
		this.checkGameState();
	}, 200);
}


ChessGame.prototype.timerHasTicked = function(){
	const currentTime = document.querySelector("#main-clock-bottom");
	if (currentTime){
		if(this.userTimer){
			if(this.userTimer > currentTime.innerHTML){
				this.updateUserTimer();
				return true;
			}
		}
		this.updateUserTimer();
	}
	return false;
}

ChessGame.prototype.updateUserTimer = function(){
	const currentTime = document.querySelector("#main-clock-bottom");
	this.userTimer = currentTime.innerHTML;
}

ChessGame.prototype.updateUsernames = function(){
	const usernames = document.querySelectorAll(".user-tagline-username");
	if (usernames.length === 2){
		this.data.opponentUsername = usernames[0].innerHTML;
		this.data.primaryUsername = usernames[1].innerHTML;
		return true;
	}
	else{
		return false;
	}
}


/*chess.com puts both usernames into the chat at beginning of each game.*/
/*The order of the usernames changes depending on color. This is what is used to determine color.*/
/*remember, updateColor pulls usernames from different place than updateUsernames.*/
ChessGame.prototype.updateColors = function(){
	const lastNewGameChat = this.getLastNewGameChatComponent();
	const usernamesInColorOrder = lastNewGameChat.querySelectorAll(".username");
	if (usernamesInColorOrder.length === 2){
		this.data.whiteUser = usernamesInColorOrder[0].innerHTML;
		this.data.blackUser = usernamesInColorOrder[1].innerHTML;
		return true;
	}
	else{
		return false;
	}
}

//only used in in updateColors so far.
ChessGame.prototype.getLastNewGameChatComponent = function(){
	const newGameChatComponents = document.querySelectorAll(".chat-message-component[data-notification = 'gameNewGamePlaying']");
	return newGameChatComponents[newGameChatComponents.length - 1];
}

ChessGame.prototype.updateOpening = function(){
	const openingName = document.querySelector(".board-opening-name");
	if(openingName){
		this.data.opening = openingName.innerHTML;
		return true;
	}
	else{
		return false;
	}
}

ChessGame.prototype.gameHasEnded = function(){
	const endscreen = document.querySelector(".game-over-dialog-content");
	if(endscreen){
		return true;
	}
	else{
		return false;
	}
}

ChessGame.prototype.updateMoves = function(){
	const parsedMoves = this.parseChessMoves();
	this.data.moves = parsedMoves;
}

/*The chess move elements textContents from the webpage have this pattern: "↵↵  d4↵↵   "" or "↵↵  Qxb7#↵↵   "*/
/*The ↵ symbol represents a new line*/
/*The amount of spaces and ↵ symbols is the same for every chess move element*/
/*Using the above examples, this function simplifies the move elements to this: "d4" or "Qxb7#".*/
ChessGame.prototype.parseChessMoves = function(){
	const moveEls = document.querySelectorAll(".vertical-move-list-clickable");
	let parsedMoves = [];
	for (let i = 0; i < moveEls.length; i++){
		const move = moveEls[i].textContent.substring(4, moveEls[i].textContent.length - 5);
		parsedMoves.push(move);
	}
	return parsedMoves;
}

//Always return true so long as game has finished with a winner. If game was aborted, return false.
//Remember, if you win, then the endscreen title says "You Won!". If you lose, it simply says "White Won" or "Black Won".
ChessGame.prototype.updateGameOutcome = function(){
 	const endscreenTitle = document.querySelector(".header-title-component").textContent;
 		if(endscreenTitle === "You Won!"){
 			this.data.winner = this.data.primaryUsername;
 			this.data.loser = this.data.opponentUsername;
 			this.data.result = (this.data.primaryUsername === this.data.whiteUser)? "1-0" : "0-1";
 			return true;
 		}
 		else if (endscreenTitle === "White Won" || endscreenTitle === "Black Won"){
 			this.data.winner = this.data.opponentUsername;
 			this.data.loser = this.data.primaryUsername;
 			this.data.result = (this.data.primaryUsername === this.data.whiteUser)? "0-1" : "1-0";
 			return true;
 		}
 		else if(endscreenTitle === "Draw"){
 			this.data.winner = "draw";
 			this.data.loser = "draw";
 			this.data.result = "1/2-1/2";
 		}
 		else if (endscreenTitle === "Game Aborted"){
 			return false;
 		}
}

ChessGame.prototype.resetChessGameData = function(){
	this.data.userTimer = undefined;
	this.data.primaryUsername = undefined;
	this.data.opponentUsername = undefined;
	this.data.whiteUser = undefined;
	this.data.blackUser = undefined;
	this.data.opening = undefined;
	this.data.moves = [];
	this.data.date = undefined;
	this.data.winner = undefined;
	this.data.loser = undefined;
	this.data.result = undefined;
}

ChessGame.prototype.sendDataToController = function(){
	const data = this.data;
	const messengerObject = {
		message: "STORENEWGAMEDATA",
		data: data
	}
	chrome.runtime.sendMessage(undefined, messengerObject);
}

ChessGame.prototype.startRecording = function(){
	this.checkGameState();
}


//@TODO Add a wait for page loaded
let chessGame = new ChessGame();

//This message handler handles request for incomplete dataset of an INPROGRESS game
chrome.runtime.onMessage.addListener(function (messengerObject, sender, sendResponse) {
	const message = messengerObject.message;
	if(message === "INPROGRESSANALYSISREQUEST"){
		const data = chessGame.data
		let inProgressGameData = (chessGame.state === ChessGameState.INPROGRESS) ? data : undefined; //Response will be set to undefined if game is not in progress
		sendResponse({inProgressGameData})
	}
	
});
chessGame.startRecording();