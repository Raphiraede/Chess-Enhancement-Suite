	/*This file handles the install and handles messages. Uses functions from seperate background script files.*/

/*
 *The only message NOT handled in this file is the PGN request from the programatically injected lichessScript.js.
 *That PGN request is handled by lichessOpener.js
 */


	/*On Install, create array which will store gameData for every game*/
chrome.runtime.onInstalled.addListener(function({OnInstalledReason = 'install'}){
	let allGamesData = [];
	chrome.storage.local.set({allGamesData:allGamesData});
});


	/*Records the data object sent from the content script after a game has ended*/
/*variable names are hard*/
/*
 *freshGameData is the new game data sent from the content script, destined to be stored.
 *allGamesData is the array of game data objects stored in storage.local.
 *returnData is the object returned from storage.local.get. This is an object which contains allGamesData.
 *updatedAllGamesData is the returnData after freshGameData has been added. This is used to update allGamesData.
 */
chrome.runtime.onMessage.addListener(function(messengerObject) {
	const message = messengerObject.message;
	const data = messengerObject.data;
	if(message === "STORENEWGAMEDATA"){
		chrome.storage.local.get('allGamesData', function(storageObject){//chrome.storage.local.get doesn't provide allGamesData, it provides an object containing allGamesData
			let allGamesData = storageObject.allGamesData;
			allGamesData.push(data);
			chrome.storage.local.set({allGamesData:allGamesData});
		});
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
	const message = messengerObject.message;
	if(message === "INPROGRESSAnalysisRequest"){

		const queryInfo = {url: "*://www.chess.com/live*"}
		chrome.tabs.query(queryInfo, function(tabs){

			const tabId = tabs[0].id;
			const messengerObject = {
				message: "INPROGRESSDataRequest"
			}

			chrome.tabs.sendMessage(tabId, messengerObject, function(inProgressGameData){
				if (inProgressGameData){

					const PGN = convertToPGN(inProgressGameData);//Perhaps message handler shouldn't handle PGN conversion?
					openLichessAndPastePGN(PGN);
				}
			});
		});
	}
});