	/*This file handles the install and handles messages. Uses functions from seperate background script files.*/

/*
 *The only message NOT handled in this file is the PGN request from the programatically injected lichessScript.js.
 *That PGN request is handled by lichessOpener.js
 */


	/*On Install, create array which will store gameData for every game*/
chrome.runtime.onInstalled.addListener(function({OnInstalledReason = 'install'}){
	let allGamesData = [];
	chrome.storage.local.set({allGamesData:allGamesData});
	chrome.storage.local.get('allGamesData', function(allGamesData){
		console.log(allGamesData);
	});
});


	/*Records the data object sent from the content script after a game has ended*/
/*variable names are hard*/
/*
 *freshGameData is the new game data sent from the content script, destined to be stored.
 *allGamesData is the array of game data objects stored in storage.local.
 *returnData is the object returned from storage.local.get. This is an object which contains allGamesData.
 *updatedAllGamesData is the returnData after freshGameData has been added. This is used to update allGamesData.
 */
chrome.runtime.onMessage.addListener(function(data, sender) {
		if(sender.tab){
			const url = sender.tab.url;
			if(url.substring(0, 26) === "https://www.chess.com/live"){
				chrome.storage.local.get('allGamesData', function(allGamesData){
					console.log("allGamesData:" + allGamesData);
					let updatedData = allGamesData.push(data);
					console.log("updatedData:" + updatedData);
					chrome.storage.local.set({allGamesData:updatedData});
				});
			}
		}
});



	/*Handles message sent from popup.js requesting a lichess analysis of an INPROGRESS game*/
/*
 *First, query the tab running contentScript.js using URL.
 *sends request to content script for INPROGRESS game data.
 *Checks if data is good. If not, it is because game is not INPROGRESS.
 *If data is good
 *Currently this may not work if more than one chess.com/live tab is open.
 */
chrome.runtime.onMessage.addListener(function(INPROGRESSAnalysisRequest){
	if(INPROGRESSAnalysisRequest === "INPROGRESSAnalysisRequest"){

		const queryInfo = {url: "*://www.chess.com/live*"}
		chrome.tabs.query(queryInfo, function(tabs){
			const tabId = tabs[0].id;
			const request = "INPROGRESSDataRequest";
			chrome.tabs.sendMessage(tabId, request, function(currentGameData){
				if (currentGameData != "gameIsNotINPROGRESS"){
					const PGN = convertToPGN(currentGameData);
					openLichessAndPastePGN(PGN);
				}
			});
		});
	}
});