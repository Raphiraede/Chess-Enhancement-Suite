
	
	/*This file handles the install and handles messages. Uses functions from seperate background script files.*/
function storeNewGameData(newGameData) {
	chrome.storage.local.get("allGamesData", (allGamesDataWrapper) => {
		let allGamesData = allGamesDataWrapper.allGamesData;

		//The ID should max the index within the array to allow for quick lookup
		newGameData.id = allGamesData.length;
		allGamesData.push(newGameData);
		chrome.storage.local.set({allGamesData: allGamesData})
	});
}

function analyseStoredGame(gameID) {
	chrome.storage.local.get("allGamesData", (allGamesDataWrapper) => {
		let gameData = allGamesDataWrapper.allGamesData[gameID];
		const PGN = convertToPGN(gameData);
		openLichessAndPastePGN(PGN);
	})
}

function analyseInProgressGame(messengerObject){
	const queryInfo = {url: "*://www.chess.com/live*"}
	chrome.tabs.query(queryInfo, (tabs) => {

		//This if statement checks to make sure a chess.com tab is actually open.
		//@TODO investigate the consequences of having multiple chess.com tabs open.
		if(tabs[0]){ //This checks to make sure a chess.com tab is actually open
			const tabId = tabs[0].id;
			const messengerObject = {
				message: "INPROGRESSANALYSISREQUEST"
			}

			chrome.tabs.sendMessage(tabId, messengerObject, (inProgressGameDataWrapper) => {
				if (inProgressGameDataWrapper.inProgressGameData){ //if inProgressGameData is undefined, that indicates that the game is not INPROGRESS
					const inProgressGameData = inProgressGameDataWrapper.inProgressGameData
					const PGN = convertToPGN(inProgressGameData);
					openLichessAndPastePGN(PGN);
				}
			});
		}
	});
}

function hydratePopup(){
	chrome.storage.local.get("allGamesData", (allGamesDataWrapper) => {
		allGamesData = allGamesDataWrapper.allGamesData;
		const messengerObject = {
			message: "CONSTRUCTGAMELIST",
			data: allGamesData,
		}
		chrome.runtime.sendMessage(undefined, messengerObject);
	});
}

//On Install, create array which will store gameData for every game
chrome.runtime.onInstalled.addListener(function({OnInstalledReason = 'install'}){
	let allGamesData = [];
	chrome.storage.local.set({allGamesData:allGamesData});
});

//This is the master that almost all message requests
chrome.runtime.onMessage.addListener((messengerObject, sender, sendResponse) => {
	switch (messengerObject.message){
		case "HYDRATEPOPUP":
			hydratePopup();

		break;

		case "STORENEWGAMEDATA":
			storeNewGameData(messengerObject.data);
		break;

		case "ANALYSESTOREDGAME":
			analyseStoredGame(messengerObject.data);
		break;

		case "INPROGRESSANALYSISREQUEST":
			analyseInProgressGame();
		break;
	}
})