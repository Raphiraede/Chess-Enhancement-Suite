	/*This file handles the install and handles messages. Uses functions from seperate background script files.*/

/*
 *The only message NOT handled in this file is the PGN request from the programatically injected lichessScript.js.
 *That PGN request is handled by lichessOpener.js
 */
const ALL_GAMES_DATA_KEY = "allGamesData"

function storeNewGameData(newGameData) {
	chrome.storage.local.get(ALL_GAMES_DATA_KEY, (allGamesDataWrapper) => {
		let allGamesData = allGamesDataWrapper.allGamesData;
		allGamesData.push(newGameData);
		chrome.storage.local.set({ALL_GAMES_DATA_KEY: allGamesData})
	});
}

function analyseInProgressGame(messengerObject){
	const queryInfo = {url: "*://www.chess.com/live*"}
	chrome.tabs.query(queryInfo, function(tabs){

		const tabId = tabs[0].id;
		const messengerObject = {
			message: "INPROGRESSANALYSISREQUEST"
		}

		chrome.tabs.sendMessage(tabId, messengerObject, function(inProgressGameData){
			if (inProgressGameData){

				const PGN = convertToPGN(inProgressGameData);//Perhaps message handler shouldn't handle PGN conversion?
				openLichessAndPastePGN(PGN);
			}
		});
	});
}

//On Install, create array which will store gameData for every game
chrome.runtime.onInstalled.addListener(function({OnInstalledReason = 'install'}){
	let allGamesData = [];
	chrome.storage.local.set({ALL_GAMES_DATA_KEY:allGamesData});
});

//Records the data object sent from the content script after a game has ended
chrome.runtime.onMessage.addListener((messengerObject) => {
	if(messengerObject.message === "STORENEWGAMEDATA"){
		storeNewGameData(messengerObject.data)
	}
});

	/*Handles message sent from popup.js requesting a lichess analysis of an INPROGRESS game*/
/*
 *First, query the tab running contentScript.js using URL.
 *sends request to content script for INPROGRESS game data.
 *Checks if data is good. If not, it is because game is not INPROGRESS.
 *If data is good, call openLichessAndPastePGN, found in lichessOpener.js
 *Currently this may not work if more than one chess.com/live tab is open.
 */

chrome.runtime.onMessage.addListener(function(messengerObject, sender, sendResponse){
	if(messengerObject.message === "INPROGRESSANALYSISREQUEST"){
		analyseInProgressGame();
	}
});