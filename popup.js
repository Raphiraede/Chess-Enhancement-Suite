
//This message request is handled by eventHandler.js, which then requests it from contentScript
function requestAnalysisForINPROGRESSGame(){
	const messengerObject = {
		message: "INPROGRESSANALYSISREQUEST"
	}
	chrome.runtime.sendMessage(messengerObject);
};

function constructGameList(allGamesData){
	let gameList = document.createElement("ul");
	for (let i = allGamesData.length-1; i >= 0; i--){
		let listElementTextContent = constructListElementTextContent(allGamesData[i]);
		let gameListItem = document.createElement("li");
		gameListItem.textContent = listElementTextContent;
		gameList.appendChild(gameListItem);
	}
	return gameList;
}

function constructListElementTextContent(gameData) {
	console.log(gameData.date);
	const date = new Date(gameData.date);
	const listElementTextContent = `${gameData.whiteUser} vs. ${gameData.blackUser}, ${date}`
	return listElementTextContent;
}

let INPROGRESSAnalysisRequest = document.querySelector("#INPROGRESSAnalysis");
INPROGRESSAnalysisRequest.addEventListener("click", requestAnalysisForINPROGRESSGame);

//Turns out popup.js isn't accessible if the popup isn't open
//Therefore the best way to handle data is to simply ask for it whenever the popup opens
chrome.runtime.sendMessage(undefined, {message: "HYDRATEPOPUP"})

chrome.runtime.onMessage.addListener(messengerObject => {
	if(messengerObject.message === "CONSTRUCTGAMELIST"){
		const allGamesData = messengerObject.data
		let gameListContainer = document.querySelector("#listOfGamesContainer");
		let gameList = constructGameList(allGamesData);
		gameListContainer.appendChild(gameList);
	}
});