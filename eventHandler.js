	/*This file handles the install and handles messages. Uses functions from seperate background script files.*/

/*
 *The only message NOT handled in this file is the PGN request from the programatically injected lichessScript.js.
 *That PGN request is handled by lichessOpener.js
 */
function storeNewGameData(newGameData) {
	chrome.storage.local.get("allGamesData", (allGamesDataWrapper) => {
		let allGamesData = allGamesDataWrapper.allGamesData;
		allGamesData.push(newGameData);
		chrome.storage.local.set({allGamesData: allGamesData})
	});
}

function analyseInProgressGame(messengerObject){
	const queryInfo = {url: "*://www.chess.com/live*"}
	chrome.tabs.query(queryInfo, (tabs) => {

		const tabId = tabs[0].id;
		const messengerObject = {
			message: "INPROGRESSANALYSISREQUEST"
		}

		chrome.tabs.sendMessage(tabId, messengerObject, (inProgressGameData) => {
			if (inProgressGameData){

				const PGN = convertToPGN(inProgressGameData);//Perhaps message handler shouldn't handle PGN conversion?
				openLichessAndPastePGN(PGN);
			}
		});
	});
}

function constructGameList(){
	chrome.storage.local.get("allGamesData", (allGamesDataWrapper) => {
		const allGamesData = allGamesDataWrapper.allGamesData;
		let requestedData
		if(allGamesData.length >= 10){
			requestedData = allGamesData.slice(allGamesData.length - 10, allGamesData.length);
		}
		else{
			requestedData = allGamesData.slice(0, allGamesData.length);
		}
		const messengerObject = {
			message: "CONSTRUCTGAMELIST",
			data: requestedData
		}
		chrome.runtime.sendMessage(undefined, messengerObject);
	})
}

//On Install, create array which will store gameData for every game
chrome.runtime.onInstalled.addListener(function({OnInstalledReason = 'install'}){
	let allGamesData = [];
	let testAllGamesData = [{
		primaryUsername: "testUsername1",
		opponentUsername: "testOpponent1",
		whiteUser: "testWhite",
		blackUser: "testBlack",
		opening: "testOpening",
		moves: ["d4", "Nf6", "1-0"],
		winner: "testWinner",
		loser: "testUser",
		result: "1-0", // 1-0 is a win for white, 0-1 is a win for black, 1/2-1/2 is a draw, and * means game is ongoing
		date: new Date()
	},
	{
		primaryUsername: "testUsername1",
		opponentUsername: "testOpponent1",
		whiteUser: "testWhite",
		blackUser: "testBlack",
		opening: "testOpening",
		moves: ["d4", "Nf6", "1-0"],
		winner: "testWinner",
		loser: "testUser",
		result: "1-0", // 1-0 is a win for white, 0-1 is a win for black, 1/2-1/2 is a draw, and * means game is ongoing
		date: new Date()
	},
	{
		primaryUsername: "testUsername3",
		opponentUsername: "testOpponent3",
		whiteUser: "testWhite",
		blackUser: "testBlack",
		opening: "testOpening",
		moves: ["d4", "Nf6", "1-0"],
		winner: "testWinner",
		loser: "testUser",
		result: "1-0", // 1-0 is a win for white, 0-1 is a win for black, 1/2-1/2 is a draw, and * means game is ongoing
		date: new Date()
	}]
	chrome.storage.local.set({allGamesData:testAllGamesData});
});

chrome.runtime.onMessage.addListener((messengerObject, sender, sendResponse) => {
	switch (messengerObject.message){

		case "HYDRATEPOPUP":
			console.log("hydrate popup");
			constructGameList();
		break;

		case "STORENEWGAMEDATA":
			storeNewGameData(messengerObject.data)
		break;

		case "INPROGRESSANALYSISREQUEST":
			analyseInProgressGame();
		break;
	}
})